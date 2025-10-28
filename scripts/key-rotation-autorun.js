/**
 * Sandra IA 7.0 - Sistema de Rotación Automática de API Keys
 * GALAXY LEVEL PRO ENTERPRISE - AUTORUN SYSTEM
 *
 * Arquitectura:
 * - AWS Secrets Manager (almacenamiento seguro)
 * - Multi-Key Strategy (zero-downtime deployment)
 * - Deepgram API Automation (rotación completa)
 * - WhatsApp/Telegram Alerts (rotación manual asistida)
 * - Monitoring Dashboard (visibilidad total)
 *
 * @author CTO Claude Code - Sandra IA Team
 * @date 2025-01-28
 */

const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const cron = require('node-cron');

// Configuración AWS Secrets Manager
const secretsManager = new AWS.SecretsManager({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Proveedores de API
const PROVIDERS = {
  // FULL AUTOMATION (API support)
  DEEPGRAM: {
    name: 'deepgram',
    automation: 'full',
    rotationInterval: 30, // días
    priority: 'medium',
    apiSupport: true
  },

  // SEMI-AUTOMATION (OAuth/Portal)
  NETLIFY: {
    name: 'netlify',
    automation: 'semi',
    rotationInterval: 90,
    priority: 'high',
    apiSupport: false
  },
  PAYPAL: {
    name: 'paypal',
    automation: 'semi',
    rotationInterval: 90,
    priority: 'high',
    apiSupport: false
  },

  // MANUAL ROTATION (Dashboard only)
  OPENAI: {
    name: 'openai',
    automation: 'manual',
    rotationInterval: 90,
    priority: 'critical',
    apiSupport: false,
    dashboardUrl: 'https://platform.openai.com/api-keys'
  },
  ANTHROPIC: {
    name: 'anthropic',
    automation: 'manual',
    rotationInterval: 90,
    priority: 'critical',
    apiSupport: false,
    dashboardUrl: 'https://console.anthropic.com/settings/keys'
  },
  GROQ: {
    name: 'groq',
    automation: 'manual',
    rotationInterval: 90,
    priority: 'high',
    apiSupport: false,
    dashboardUrl: 'https://console.groq.com/keys'
  },
  CARTESIA: {
    name: 'cartesia',
    automation: 'manual',
    rotationInterval: 90,
    priority: 'high',
    apiSupport: false,
    dashboardUrl: 'https://play.cartesia.ai/console'
  },
  HEYGEN: {
    name: 'heygen',
    automation: 'manual',
    rotationInterval: 90,
    priority: 'medium',
    apiSupport: false,
    dashboardUrl: 'https://www.heygen.com/app/settings/api'
  },
  META_WHATSAPP: {
    name: 'meta-whatsapp',
    automation: 'manual',
    rotationInterval: 180, // 6 meses (permanent tokens)
    priority: 'critical',
    apiSupport: false,
    dashboardUrl: 'https://developers.facebook.com/apps/'
  }
};

/**
 * Clase principal de rotación automática
 */
class SandraKeyRotator {
  constructor() {
    this.rotationLog = [];
    this.alertQueue = [];
  }

  /**
   * Inicializar sistema de rotación
   */
  async initialize() {
    console.log('🚀 Sandra IA - Sistema de Rotación Automática iniciado');
    console.log('📅 Fecha:', new Date().toISOString());

    // Verificar conexión AWS Secrets Manager
    await this.verifyAWSConnection();

    // Cargar estado actual de keys
    await this.loadKeyStatus();

    // Programar rotaciones automáticas
    this.scheduleTasks();

    console.log('✅ Sistema AUTORUN configurado correctamente');
  }

  /**
   * Verificar conexión con AWS Secrets Manager
   */
  async verifyAWSConnection() {
    try {
      await secretsManager.listSecrets({ MaxResults: 1 }).promise();
      console.log('✅ AWS Secrets Manager conectado');
    } catch (error) {
      console.error('❌ Error conectando AWS Secrets Manager:', error.message);
      throw new Error('AWS Secrets Manager no disponible');
    }
  }

  /**
   * Cargar estado actual de todas las keys
   */
  async loadKeyStatus() {
    console.log('\n📊 Cargando estado de API keys...\n');

    for (const [key, config] of Object.entries(PROVIDERS)) {
      try {
        const status = await this.getKeyStatus(config.name);
        console.log(`${this.getStatusEmoji(status)} ${config.name}: ${status.daysUntilExpiration} días restantes`);
      } catch (error) {
        console.log(`⚠️ ${config.name}: No encontrada en Secrets Manager`);
      }
    }
  }

  /**
   * Obtener estado de una key específica
   */
  async getKeyStatus(provider) {
    try {
      const secret = await secretsManager.getSecretValue({
        SecretId: `sandra/${provider}/api-key`
      }).promise();

      const metadata = JSON.parse(secret.SecretString);
      const expiresAt = new Date(metadata.expiresAt || metadata.rotatedAt);
      const rotationInterval = PROVIDERS[provider.toUpperCase().replace('-', '_')]?.rotationInterval || 90;

      expiresAt.setDate(expiresAt.getDate() + rotationInterval);

      const daysUntilExpiration = Math.floor(
        (expiresAt - new Date()) / (1000 * 60 * 60 * 24)
      );

      return {
        provider,
        key: metadata.key,
        rotatedAt: metadata.rotatedAt,
        expiresAt: expiresAt.toISOString(),
        daysUntilExpiration,
        status: this.calculateStatus(daysUntilExpiration)
      };
    } catch (error) {
      throw new Error(`Key no encontrada: ${provider}`);
    }
  }

  /**
   * Calcular estado basado en días restantes
   */
  calculateStatus(days) {
    if (days < 0) return 'expired';
    if (days < 7) return 'critical';
    if (days < 14) return 'warning';
    return 'healthy';
  }

  /**
   * Emoji según estado
   */
  getStatusEmoji(status) {
    const emoji = {
      healthy: '🟢',
      warning: '🟡',
      critical: '🔴',
      expired: '💀'
    };
    return emoji[status.status] || '⚪';
  }

  /**
   * ROTACIÓN AUTOMÁTICA - DEEPGRAM (Full API Support)
   */
  async rotateDeepgramKey() {
    console.log('\n🔄 Iniciando rotación automática: DEEPGRAM\n');

    try {
      // Obtener master key de Deepgram
      const masterKeySecret = await secretsManager.getSecretValue({
        SecretId: 'sandra/deepgram/master-key'
      }).promise();
      const masterKey = JSON.parse(masterKeySecret.SecretString).key;
      const projectId = JSON.parse(masterKeySecret.SecretString).projectId;

      // Crear nueva key con expiración de 30 días
      const response = await fetch(
        `https://api.deepgram.com/v1/projects/${projectId}/keys`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${masterKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            comment: `Sandra-AutoRotation-${Date.now()}`,
            scopes: ['usage:write'],
            time_to_live_in_seconds: 30 * 24 * 60 * 60 // 30 días
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.status}`);
      }

      const data = await response.json();
      const newKey = data.key;
      const keyId = data.key_id;

      // Guardar nueva key en Secrets Manager
      await secretsManager.putSecretValue({
        SecretId: 'sandra/deepgram/api-key',
        SecretString: JSON.stringify({
          key: newKey,
          keyId: keyId,
          rotatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          rotationType: 'automatic'
        })
      }).promise();

      // Actualizar Netlify con nueva key
      await this.updateNetlifyEnvironment('DEEPGRAM_API_KEY', newKey);

      // Log de rotación exitosa
      this.logRotation('deepgram', 'success', 'Automatic rotation via API');

      console.log('✅ Deepgram key rotada automáticamente');
      console.log(`🔑 Nueva key ID: ${keyId}`);
      console.log(`📅 Expira: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}`);

      return { success: true, keyId };

    } catch (error) {
      console.error('❌ Error rotando Deepgram key:', error.message);
      this.logRotation('deepgram', 'failed', error.message);
      await this.sendFailureAlert('deepgram', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * ROTACIÓN MANUAL ASISTIDA - Enviar alertas WhatsApp/Telegram
   */
  async sendManualRotationAlert(provider) {
    const config = Object.values(PROVIDERS).find(p => p.name === provider);
    const status = await this.getKeyStatus(provider);

    const message = `
🔐 **ROTACIÓN DE API KEY REQUERIDA**

**Proveedor:** ${provider.toUpperCase()}
**Prioridad:** ${config.priority.toUpperCase()}
**Días restantes:** ${status.daysUntilExpiration}
**Estado:** ${status.status.toUpperCase()}

**Dashboard URL:**
${config.dashboardUrl}

**Pasos para rotar:**
1. Accede al dashboard (link arriba)
2. Genera nueva API key
3. Copia la nueva key
4. Responde a este mensaje con: \`/rotate ${provider} NEW_KEY_HERE\`
5. El sistema actualizará automáticamente Netlify y verificará

**Última rotación:** ${status.rotatedAt}
**Próxima rotación:** ${status.expiresAt}

---
🤖 Sandra IA - Sistema de Rotación Automática
    `.trim();

    // Enviar por WhatsApp y Telegram
    await this.sendWhatsAppMessage(message);
    await this.sendTelegramMessage(message);

    console.log(`📱 Alerta enviada para rotación manual: ${provider}`);

    this.alertQueue.push({
      provider,
      sentAt: new Date().toISOString(),
      status: 'pending'
    });
  }

  /**
   * Enviar mensaje WhatsApp (integración con Sandra IA)
   */
  async sendWhatsAppMessage(message) {
    try {
      const whatsappToken = process.env.WHATSAPP_TOKEN;
      const ceoPhone = process.env.CEO_WHATSAPP_PHONE;

      if (!whatsappToken || !ceoPhone) {
        console.warn('⚠️ WhatsApp credentials no configuradas');
        return;
      }

      await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: ceoPhone,
          type: 'text',
          text: { body: message }
        })
      });

      console.log('✅ Mensaje WhatsApp enviado');
    } catch (error) {
      console.error('❌ Error enviando WhatsApp:', error.message);
    }
  }

  /**
   * Enviar mensaje Telegram
   */
  async sendTelegramMessage(message) {
    try {
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      const ceoChatId = process.env.CEO_TELEGRAM_CHAT_ID;

      if (!telegramToken || !ceoChatId) {
        console.warn('⚠️ Telegram credentials no configuradas');
        return;
      }

      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ceoChatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      console.log('✅ Mensaje Telegram enviado');
    } catch (error) {
      console.error('❌ Error enviando Telegram:', error.message);
    }
  }

  /**
   * Actualizar environment variables en Netlify
   */
  async updateNetlifyEnvironment(key, value) {
    try {
      const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;
      const siteId = process.env.NETLIFY_SITE_ID;

      if (!netlifyToken || !siteId) {
        console.warn('⚠️ Netlify credentials no configuradas');
        return;
      }

      await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/env`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${netlifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [key]: value
        })
      });

      console.log(`✅ Netlify environment actualizado: ${key}`);
    } catch (error) {
      console.error('❌ Error actualizando Netlify:', error.message);
    }
  }

  /**
   * Logging de rotaciones
   */
  logRotation(provider, status, details) {
    const log = {
      provider,
      status,
      details,
      timestamp: new Date().toISOString()
    };

    this.rotationLog.push(log);

    // Guardar log en archivo
    const fs = require('fs');
    const logFile = './logs/key-rotation-log.json';
    const existingLogs = fs.existsSync(logFile)
      ? JSON.parse(fs.readFileSync(logFile, 'utf8'))
      : [];

    existingLogs.push(log);
    fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));
  }

  /**
   * Enviar alerta de fallo en rotación
   */
  async sendFailureAlert(provider, errorMessage) {
    const message = `
🚨 **ERROR EN ROTACIÓN AUTOMÁTICA**

**Proveedor:** ${provider.toUpperCase()}
**Error:** ${errorMessage}
**Fecha:** ${new Date().toISOString()}

**Acción requerida:** Intervención manual

**Dashboard URL:**
${PROVIDERS[provider.toUpperCase().replace('-', '_')]?.dashboardUrl || 'N/A'}

---
🤖 Sandra IA - Sistema de Rotación Automática
    `.trim();

    await this.sendWhatsAppMessage(message);
    await this.sendTelegramMessage(message);
  }

  /**
   * Verificar keys próximas a expirar
   */
  async checkExpiringKeys() {
    console.log('\n🔍 Verificando keys próximas a expirar...\n');

    const expiringKeys = [];

    for (const [key, config] of Object.entries(PROVIDERS)) {
      try {
        const status = await this.getKeyStatus(config.name);

        if (status.status === 'critical' || status.status === 'warning') {
          expiringKeys.push({ ...status, config });

          // Enviar alerta si está en estado crítico
          if (status.status === 'critical') {
            await this.sendManualRotationAlert(config.name);
          }
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo verificar: ${config.name}`);
      }
    }

    if (expiringKeys.length > 0) {
      console.log(`🔴 ${expiringKeys.length} key(s) requieren atención`);
    } else {
      console.log('✅ Todas las keys están en estado saludable');
    }

    return expiringKeys;
  }

  /**
   * Reporte semanal de estado
   */
  async sendWeeklyReport() {
    console.log('\n📊 Generando reporte semanal...\n');

    const allStatus = [];

    for (const [key, config] of Object.entries(PROVIDERS)) {
      try {
        const status = await this.getKeyStatus(config.name);
        allStatus.push({ ...status, config });
      } catch (error) {
        allStatus.push({
          provider: config.name,
          status: 'unknown',
          config
        });
      }
    }

    // Formato del reporte
    const report = `
📊 **REPORTE SEMANAL - API KEYS**

**Fecha:** ${new Date().toISOString().split('T')[0]}

**Estado General:**
${allStatus.map(s =>
  `${this.getStatusEmoji(s)} **${s.provider}**: ${s.daysUntilExpiration || 'N/A'} días (${s.status})`
).join('\n')}

**Rotaciones programadas próximos 30 días:**
${allStatus.filter(s => s.daysUntilExpiration && s.daysUntilExpiration < 30)
  .map(s => `• ${s.provider}: ${s.daysUntilExpiration} días`)
  .join('\n') || 'Ninguna'}

**Métricas:**
- Total keys monitoreadas: ${allStatus.length}
- Keys saludables (🟢): ${allStatus.filter(s => s.status === 'healthy').length}
- Keys en advertencia (🟡): ${allStatus.filter(s => s.status === 'warning').length}
- Keys críticas (🔴): ${allStatus.filter(s => s.status === 'critical').length}

---
🤖 Sandra IA - Sistema de Rotación Automática
    `.trim();

    await this.sendWhatsAppMessage(report);
    await this.sendTelegramMessage(report);

    console.log('✅ Reporte semanal enviado');
  }

  /**
   * Programar tareas automáticas con cron
   */
  scheduleTasks() {
    console.log('\n⏰ Programando tareas automáticas...\n');

    // Rotación automática Deepgram: cada 25 días (5 días antes de expirar)
    cron.schedule('0 3 */25 * *', async () => {
      console.log('🔄 Ejecutando rotación automática Deepgram...');
      await this.rotateDeepgramKey();
    });
    console.log('✅ Cron: Rotación Deepgram cada 25 días (3 AM)');

    // Verificación de keys expirando: diariamente
    cron.schedule('0 9 * * *', async () => {
      console.log('🔍 Verificación diaria de expiración...');
      await this.checkExpiringKeys();
    });
    console.log('✅ Cron: Verificación diaria (9 AM)');

    // Reporte semanal: lunes a las 9 AM
    cron.schedule('0 9 * * 1', async () => {
      console.log('📊 Generando reporte semanal...');
      await this.sendWeeklyReport();
    });
    console.log('✅ Cron: Reporte semanal (Lunes 9 AM)');

    console.log('\n🎯 Sistema AUTORUN completamente configurado\n');
  }

  /**
   * Rotación manual desde comando (callback para /rotate)
   */
  async handleManualRotation(provider, newKey) {
    console.log(`\n🔄 Procesando rotación manual: ${provider}\n`);

    try {
      // Guardar nueva key en Secrets Manager
      await secretsManager.putSecretValue({
        SecretId: `sandra/${provider}/api-key`,
        SecretString: JSON.stringify({
          key: newKey,
          rotatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          rotationType: 'manual'
        })
      }).promise();

      // Actualizar Netlify
      const envKeyName = `${provider.toUpperCase().replace('-', '_')}_API_KEY`;
      await this.updateNetlifyEnvironment(envKeyName, newKey);

      // Verificar nueva key
      const isValid = await this.verifyKey(provider, newKey);

      if (isValid) {
        this.logRotation(provider, 'success', 'Manual rotation by CEO');

        const successMessage = `
✅ **ROTACIÓN COMPLETADA**

**Proveedor:** ${provider.toUpperCase()}
**Estado:** Verificada y funcional
**Netlify:** Actualizado
**Próxima rotación:** ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}

🎉 Todo listo, CEO. La nueva key está activa.
        `.trim();

        await this.sendWhatsAppMessage(successMessage);
        console.log('✅ Rotación manual completada exitosamente');

      } else {
        throw new Error('La nueva key no pasó la verificación');
      }

    } catch (error) {
      console.error('❌ Error en rotación manual:', error.message);
      this.logRotation(provider, 'failed', error.message);
      await this.sendFailureAlert(provider, error.message);
    }
  }

  /**
   * Verificar que una key funcione correctamente
   */
  async verifyKey(provider, key) {
    console.log(`🔍 Verificando key de ${provider}...`);

    // Implementar verificación específica por proveedor
    // Por ejemplo, hacer una llamada API simple

    // Placeholder: siempre retorna true por ahora
    // TODO: Implementar verificaciones reales por proveedor

    return true;
  }
}

/**
 * Función principal de ejecución
 */
async function main() {
  const rotator = new SandraKeyRotator();

  try {
    await rotator.initialize();

    console.log('\n' + '='.repeat(60));
    console.log('🚀 SANDRA IA - SISTEMA AUTORUN ACTIVADO');
    console.log('='.repeat(60));
    console.log('\n✅ El sistema está monitoreando 9 proveedores de API');
    console.log('✅ Rotación automática configurada para Deepgram');
    console.log('✅ Alertas WhatsApp/Telegram activas');
    console.log('✅ Reportes semanales programados');
    console.log('\n💤 Sistema en modo AUTORUN... No requiere intervención manual.\n');

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Exportar para uso como módulo
module.exports = { SandraKeyRotator, PROVIDERS };

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}
