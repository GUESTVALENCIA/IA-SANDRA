const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración de servicios a monitorear
const SERVICES = [
  {
    name: 'Sandra IA - UI',
    url: 'https://sandra-ia.com',
    method: 'GET',
    timeout: 5000,
    healthy: 200,
    recovery: 'npm start'
  },
  {
    name: 'Sandra IA - MCP',
    url: 'https://mcp.sandra-ia.com',
    method: 'GET',
    timeout: 5000,
    healthy: 200,
    recovery: 'npm run start:mcp'
  },
  {
    name: 'Sandra IA - API',
    url: 'https://api.sandra-ia.com/health',
    method: 'GET',
    timeout: 5000,
    healthy: 200,
    recovery: 'npm run deploy-mcp'
  }
];

// Log file
const LOG_DIR = 'C:\\Sandra_Restore_Points';
const LOG_FILE = path.join(LOG_DIR, 'monitor_unificado.log');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toLocaleString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function formatTime() {
  return new Date().toLocaleTimeString();
}

// Estado de servicios
const serviceStatus = {};
SERVICES.forEach(s => {
  serviceStatus[s.name] = {
    status: 'unknown',
    lastCheck: null,
    failureCount: 0,
    recoveryAttempts: 0
  };
});

// Verificar cada servicio
async function checkServices() {
  for (const service of SERVICES) {
    try {
      const response = await axios({
        method: service.method,
        url: service.url,
        timeout: service.timeout,
        validateStatus: () => true // No lanzar error en cualquier status
      });

      if (response.status === service.healthy) {
        const status = serviceStatus[service.name];
        
        if (status.status !== 'healthy') {
          log(`✅ ${service.name} RECUPERADO | ${formatTime()}`);
          status.failureCount = 0;
          status.recoveryAttempts = 0;
        }
        
        status.status = 'healthy';
        status.lastCheck = new Date();
        
      } else {
        throw new Error(`Status ${response.status}`);
      }
      
    } catch (error) {
      const status = serviceStatus[service.name];
      status.status = 'error';
      status.failureCount++;
      status.lastCheck = new Date();
      
      log(`❌ ${service.name} CAÍDO: ${error.message} | ${formatTime()}`);

      // Intentar recuperación automática
      if (status.failureCount >= 2 && status.recoveryAttempts < 3) {
        log(`🔄 Iniciando recuperación automática para ${service.name}...`);
        status.recoveryAttempts++;
        
        try {
          exec(service.recovery, (err, stdout, stderr) => {
            if (err) {
              log(`⚠️ Error en recuperación de ${service.name}: ${err.message}`);
            } else {
              log(`✓ Recuperación de ${service.name} iniciada exitosamente`);
            }
          });
        } catch (execError) {
          log(`⚠️ No se pudo ejecutar recuperación: ${execError.message}`);
        }
      }
    }
  }

  // Mostrar resumen
  console.log('\n' + '='.repeat(60));
  console.log(`ESTADO GENERAL | ${formatTime()}`);
  console.log('='.repeat(60));
  
  for (const service of SERVICES) {
    const status = serviceStatus[service.name];
    const statusIcon = status.status === 'healthy' ? '✅' : '❌';
    console.log(`${statusIcon} ${service.name.padEnd(25)} | ${status.status.toUpperCase()}`);
  }
  
  console.log('='.repeat(60) + '\n');
}

// Iniciar monitoreo
log('🚀 Sistema de Monitoreo Unificado Iniciado');
log(`Monitoreando ${SERVICES.length} servicios cada 30 segundos`);

// Verificación inicial
checkServices();

// Verificar cada 30 segundos
setInterval(checkServices, 30000);

// Mostrar estadísticas cada 5 minutos
setInterval(() => {
  log('📊 ESTADÍSTICAS DE MONITOREO:');
  for (const service of SERVICES) {
    const status = serviceStatus[service.name];
    log(`  - ${service.name}: ${status.failureCount} fallos, ${status.recoveryAttempts} intentos de recuperación`);
  }
}, 300000);

// Graceful shutdown
process.on('SIGINT', () => {
  log('⛔ Sistema de Monitoreo Detenido');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('⛔ Sistema de Monitoreo Detenido');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  log(`⚠️ ERROR NO CAPTURADO: ${error.message}`);
});

process.on('unhandledRejection', (reason) => {
  log(`⚠️ PROMESA RECHAZADA NO MANEJADA: ${reason}`);
});

