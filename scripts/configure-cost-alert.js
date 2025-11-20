/**
 * Script para configurar CostAlertAgent automáticamente
 * Añade las variables de entorno necesarias a .env.pro
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env.pro');

const COST_ALERT_CONFIG = `
# Cost Alert Configuration
SMTP_URL=smtp://postmaster:password@smtp.mailgun.org:587
ALERT_EMAIL_TO=contabilidad@guestsvalencia.es
COST_LIMIT=5
`;

function main() {
  console.log('💰 Configurando CostAlertAgent...\n');
  
  try {
    let envContent = '';
    
    // Leer .env.pro si existe
    if (fs.existsSync(ENV_FILE)) {
      envContent = fs.readFileSync(ENV_FILE, 'utf8');
      console.log('✅ .env.pro encontrado\n');
    } else {
      console.log('⚠️  .env.pro no existe, creando...\n');
    }
    
    // Verificar si ya tiene configuración de CostAlert
    if (envContent.includes('SMTP_URL') || envContent.includes('ALERT_EMAIL_TO')) {
      console.log('⚠️  CostAlert ya está configurado en .env.pro');
      console.log('💡 Verifica que los valores sean correctos:\n');
      
      const lines = envContent.split('\n');
      lines.forEach(line => {
        if (line.includes('SMTP_URL') || line.includes('ALERT_EMAIL_TO') || line.includes('COST_LIMIT')) {
          console.log(`   ${line.trim()}`);
        }
      });
      
      console.log('\n💡 Si necesitas actualizar, edita .env.pro manualmente\n');
      return;
    }
    
    // Añadir configuración
    console.log('📝 Añadiendo configuración de CostAlert...');
    envContent += COST_ALERT_CONFIG;
    
    fs.writeFileSync(ENV_FILE, envContent, 'utf8');
    
    console.log('✅ Configuración añadida a .env.pro\n');
    console.log('📋 Variables añadidas:');
    console.log('   SMTP_URL=smtp://postmaster:password@smtp.mailgun.org:587');
    console.log('   ALERT_EMAIL_TO=contabilidad@guestsvalencia.es');
    console.log('   COST_LIMIT=5\n');
    console.log('⚠️  IMPORTANTE: Actualiza SMTP_URL con tus credenciales reales\n');
    console.log('🚀 Para activar: npm run cost-alert\n');
    
  } catch (error) {
    console.error('❌ Error configurando CostAlert:');
    console.error(`   ${error.message}`);
  }
}

main();

