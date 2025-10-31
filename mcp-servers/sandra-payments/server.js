const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Intentar cargar .env desde varias ubicaciones posibles
const envPaths = [
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '.env'),
  path.join(process.resourcesPath || __dirname, '.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    envLoaded = true;
    break;
  }
}

// Si no se encuentra .env, usar variables de entorno del sistema
if (!envLoaded) {
  require('dotenv').config(); // Intenta cargar desde el directorio actual o variables de entorno
}

class SandraPayments {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.sandboxURL = 'https://api-m.sandbox.paypal.com';
    this.productionURL = 'https://api-m.paypal.com';
    this.baseURL = this.sandboxURL; // Usar sandbox para desarrollo
    this.accessToken = null;
    this.tokenExpiration = null;
  }

  async getAccessToken() {
    try {
      if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
        return this.accessToken;
      }

      const auth = Buffer.from(`${this.clientId}:${process.env.PAYPAL_CLIENT_SECRET || ''}`).toString('base64');

      const response = await axios.post(
        `${this.baseURL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiration = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minuto antes

      return this.accessToken;
    } catch (error) {
      console.error('PayPal Access Token Error:', error.message);
      throw error;
    }
  }

  async createPayment(amount, currency = 'USD', description = 'Sandra DevConsole Service') {
    try {
      const token = await this.getAccessToken();

      const payment = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        redirect_urls: {
          return_url: process.env.PAYMENT_RETURN_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/payment/success`,
          cancel_url: process.env.PAYMENT_CANCEL_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/payment/cancel`
        },
        transactions: [{
          amount: {
            total: amount.toString(),
            currency: currency
          },
          description: description,
          item_list: {
            items: [{
              name: 'Sandra DevConsole Premium',
              sku: 'SANDRA_PREMIUM',
              price: amount.toString(),
              currency: currency,
              quantity: 1
            }]
          }
        }]
      };

      const response = await axios.post(
        `${this.baseURL}/v1/payments/payment`,
        payment,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const approvalUrl = response.data.links.find(link => link.rel === 'approval_url')?.href;

      return {
        success: true,
        paymentId: response.data.id,
        approvalUrl: approvalUrl,
        status: response.data.state,
        amount: amount,
        currency: currency
      };
    } catch (error) {
      console.error('Create Payment Error:', error.message);
      return {
        success: false,
        error: error.message,
        fallbackMessage: "Sistema de pagos temporalmente no disponible. Contacte al soporte."
      };
    }
  }

  async executePayment(paymentId, payerId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseURL}/v1/payments/payment/${paymentId}/execute`,
        {
          payer_id: payerId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      return {
        success: true,
        paymentId: paymentId,
        status: response.data.state,
        transactionId: response.data.transactions[0].related_resources[0].sale.id,
        amount: response.data.transactions[0].amount.total,
        currency: response.data.transactions[0].amount.currency
      };
    } catch (error) {
      console.error('Execute Payment Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPaymentDetails(paymentId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/v1/payments/payment/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        }
      );

      return {
        success: true,
        payment: {
          id: response.data.id,
          status: response.data.state,
          amount: response.data.transactions[0].amount.total,
          currency: response.data.transactions[0].amount.currency,
          created: response.data.create_time,
          updated: response.data.update_time
        }
      };
    } catch (error) {
      console.error('Get Payment Details Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processSubscription(planId, subscriberInfo) {
    try {
      const token = await this.getAccessToken();

      const subscription = {
        plan_id: planId,
        start_time: new Date(Date.now() + 1000 * 60).toISOString(), // Start in 1 minute
        subscriber: {
          name: {
            given_name: subscriberInfo.firstName,
            surname: subscriberInfo.lastName
          },
          email_address: subscriberInfo.email
        },
        application_context: {
          brand_name: 'Sandra DevConsole',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          },
          return_url: process.env.SUBSCRIPTION_RETURN_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/subscription/success`,
          cancel_url: process.env.SUBSCRIPTION_CANCEL_URL || `${process.env.BASE_URL || 'http://localhost:3000'}/subscription/cancel`
        }
      };

      const response = await axios.post(
        `${this.baseURL}/v1/billing/subscriptions`,
        subscription,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const approvalUrl = response.data.links.find(link => link.rel === 'approve')?.href;

      return {
        success: true,
        subscriptionId: response.data.id,
        approvalUrl: approvalUrl,
        status: response.data.status
      };
    } catch (error) {
      console.error('Process Subscription Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async healthCheck() {
    try {
      const token = await this.getAccessToken();

      return {
        status: 'healthy',
        apiConnected: true,
        tokenValid: !!token,
        environment: 'sandbox'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        apiConnected: false,
        error: error.message
      };
    }
  }

  getCapabilities() {
    return {
      service: 'sandra-payments',
      capabilities: [
        'payment-processing',
        'subscription-management',
        'paypal-integration',
        'sandra-premium-billing',
        'transaction-tracking'
      ],
      provider: 'PayPal',
      environment: 'sandbox',
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      paymentMethods: ['paypal', 'credit_card'],
      subscriptionSupport: true
    };
  }

  // Métodos específicos para Sandra DevConsole
  async createSandraPremiumPayment(durationMonths = 1) {
    const prices = {
      1: 29.99,  // 1 mes
      3: 79.99,  // 3 meses (descuento)
      12: 299.99 // 1 año (gran descuento)
    };

    const amount = prices[durationMonths] || prices[1];
    const description = `Sandra DevConsole Premium - ${durationMonths} month(s)`;

    return await this.createPayment(amount, 'USD', description);
  }

  async validateSandraLicense(licenseKey) {
    // Simulación de validación de licencia
    const validLicenses = [
      'SANDRA-PREMIUM-2024',
      'SANDRA-DEV-ELITE',
      'SANDRA-ENTERPRISE'
    ];

    return {
      valid: validLicenses.includes(licenseKey),
      tier: licenseKey.includes('ENTERPRISE') ? 'enterprise' :
            licenseKey.includes('ELITE') ? 'elite' : 'premium',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    };
  }
}

module.exports = { SandraPayments };