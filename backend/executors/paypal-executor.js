/**
 * PAYPAL EXECUTOR - Procesamiento real de pagos
 * Permite a Sandra procesar pagos reales con PayPal API
 */

class PayPalExecutor {
    constructor(config) {
        this.clientId = config.clientId || process.env.PAYPAL_CLIENT_ID;
        this.clientSecret = config.clientSecret || process.env.PAYPAL_CLIENT_SECRET;
        this.mode = config.mode || process.env.PAYPAL_MODE || 'sandbox';
        this.baseUrl = this.mode === 'live' ?
            'https://api-m.paypal.com' :
            'https://api-m.sandbox.paypal.com';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // ============================================================================
    // AUTENTICACIÓN PAYPAL
    // ============================================================================
    async authenticate() {
        try {
            if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                return this.accessToken;
            }

            const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

            const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials'
            });

            if (!response.ok) {
                throw new Error(`PayPal auth error: ${response.status}`);
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer

            console.log('✅ Autenticado con PayPal');
            return this.accessToken;

        } catch (error) {
            console.error('❌ Error autenticando PayPal:', error);
            throw error;
        }
    }

    // ============================================================================
    // PROCESAR PAGO
    // ============================================================================
    async processPayment(params, context) {
        try {
            const {
                amount = 89.00,
                currency = 'EUR',
                description = 'Reserva GuestsValencia',
                guestEmail = 'guest@example.com',
                bookingId = null
            } = params;

            await this.authenticate();

            // Crear orden de pago
            const orderData = {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currency,
                        value: amount.toFixed(2)
                    },
                    description: description,
                    custom_id: bookingId || `booking_${Date.now()}`,
                    soft_descriptor: 'GUESTSVALENCIA'
                }],
                payment_source: {
                    paypal: {
                        experience_context: {
                            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                            user_action: 'PAY_NOW',
                            return_url: 'https://guestsvalencia.com/payment-success',
                            cancel_url: 'https://guestsvalencia.com/payment-cancel'
                        }
                    }
                }
            };

            const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                    'PayPal-Request-Id': `${Date.now()}-${Math.random()}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`PayPal API error: ${response.status} - ${errorData.message}`);
            }

            const order = await response.json();
            const approvalUrl = order.links.find(link => link.rel === 'approve')?.href;

            console.log('💳 Orden de pago creada:', order.id);

            return {
                success: true,
                message: 'Orden de pago creada exitosamente',
                data: {
                    paymentId: order.id,
                    status: order.status,
                    amount: amount,
                    currency: currency,
                    approvalUrl: approvalUrl,
                    mode: this.mode,
                    createdAt: order.create_time
                }
            };

        } catch (error) {
            console.error('❌ Error procesando pago:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // CAPTURAR PAGO (DESPUÉS DE APROBACIÓN)
    // ============================================================================
    async capturePayment(orderId) {
        try {
            await this.authenticate();

            const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`PayPal capture error: ${response.status}`);
            }

            const capture = await response.json();

            console.log('✅ Pago capturado:', capture.id);

            return {
                success: true,
                message: 'Pago capturado exitosamente',
                data: {
                    captureId: capture.id,
                    status: capture.status,
                    amount: capture.purchase_units[0]?.payments?.captures[0]?.amount,
                    transactionId: capture.purchase_units[0]?.payments?.captures[0]?.id
                }
            };

        } catch (error) {
            console.error('❌ Error capturando pago:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // REEMBOLSO
    // ============================================================================
    async refundPayment(captureId, amount = null, reason = 'Cancelación solicitada') {
        try {
            await this.authenticate();

            const refundData = {
                note_to_payer: reason
            };

            if (amount) {
                refundData.amount = {
                    value: amount.toFixed(2),
                    currency_code: 'EUR'
                };
            }

            const response = await fetch(`${this.baseUrl}/v2/payments/captures/${captureId}/refund`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(refundData)
            });

            if (!response.ok) {
                throw new Error(`PayPal refund error: ${response.status}`);
            }

            const refund = await response.json();

            console.log('💰 Reembolso procesado:', refund.id);

            return {
                success: true,
                message: 'Reembolso procesado exitosamente',
                data: {
                    refundId: refund.id,
                    status: refund.status,
                    amount: refund.amount,
                    reason: reason
                }
            };

        } catch (error) {
            console.error('❌ Error procesando reembolso:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // OBTENER DETALLES DE PAGO
    // ============================================================================
    async getPaymentDetails(orderId) {
        try {
            await this.authenticate();

            const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`PayPal API error: ${response.status}`);
            }

            const order = await response.json();

            return {
                success: true,
                data: {
                    orderId: order.id,
                    status: order.status,
                    amount: order.purchase_units[0]?.amount,
                    payer: order.payer,
                    createdAt: order.create_time,
                    updatedAt: order.update_time
                }
            };

        } catch (error) {
            console.error('❌ Error obteniendo detalles:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // GENERAR LINK DE PAGO DIRECTO
    // ============================================================================
    async generatePaymentLink(params) {
        try {
            const paymentResult = await this.processPayment(params);

            if (!paymentResult.success) {
                return paymentResult;
            }

            return {
                success: true,
                message: 'Link de pago generado',
                data: {
                    paymentId: paymentResult.data.paymentId,
                    paymentUrl: paymentResult.data.approvalUrl,
                    amount: paymentResult.data.amount,
                    currency: paymentResult.data.currency,
                    qrCode: this.generateQRCodeUrl(paymentResult.data.approvalUrl)
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // UTILIDADES
    // ============================================================================
    generateQRCodeUrl(paymentUrl) {
        // Generar URL para QR code usando un servicio gratuito
        const encodedUrl = encodeURIComponent(paymentUrl);
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
    }

    formatAmount(amount, currency = 'EUR') {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    validatePaymentParams(params) {
        const { amount, currency } = params;

        if (!amount || amount <= 0) {
            throw new Error('Monto inválido');
        }

        if (currency && !['EUR', 'USD', 'GBP'].includes(currency)) {
            throw new Error('Moneda no soportada');
        }

        return true;
    }

    // ============================================================================
    // VALIDACIONES
    // ============================================================================
    validateConfig() {
        if (!this.clientId) {
            throw new Error('PayPal Client ID no configurado');
        }

        if (!this.clientSecret) {
            throw new Error('PayPal Client Secret no configurado');
        }

        return true;
    }

    getStatus() {
        return {
            mode: this.mode,
            authenticated: !!this.accessToken,
            tokenExpiry: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null
        };
    }
}

module.exports = PayPalExecutor;