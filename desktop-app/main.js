const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno MANUALMENTE (dotenv a veces falla en Electron)
const envPath = path.join(__dirname, '..', '.env.pro');
console.log('📁 Cargando .env.pro desde:', envPath);

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    // Ignorar comentarios y líneas vacías
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  });
  
  console.log('✅ Variables de entorno cargadas manualmente');
} else {
  console.error('❌ .env.pro no encontrado en:', envPath);
}

// Verificar que las API keys críticas se cargaron
console.log('🔑 Verificando API keys:');
console.log('   GROQ_API_KEY:', process.env.GROQ_API_KEY ? `✅ Configurada (${process.env.GROQ_API_KEY.substring(0, 10)}...)` : '❌ NO CONFIGURADA');
console.log('   DEEPGRAM_API_KEY:', process.env.DEEPGRAM_API_KEY ? '✅ Configurada' : '⚠️  No configurada');
console.log('   HEYGEN_API_KEY:', process.env.HEYGEN_API_KEY ? '✅ Configurada' : '⚠️  No configurada');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '⚠️  No configurada');

// Importar gestores profesionales
const ConfigValidator = require('../core/config-validator');
const ServiceManager = require('../core/service-manager');

// Importar todos los servicios
const NeonDB = require('../neon-db-adapter/neon-db');
const AIOrchestrator = require('../llm-orchestrator/ai-orchestrator');
const BrightDataService = require('../services/bright-data-service');
const NegotiationService = require('../services/negotiation-service');
const PracticalExecutionFramework = require('../core/practical-execution-framework');
const SandraPromptOptimizer = require('../core/sandra-prompt-optimizer');
const DeepgramService = require('../services/deepgram-service');
const CartesiaService = require('../services/cartesia-service');
const HeyGenService = require('../services/heygen-service');
const MultimodalConversationService = require('../services/multimodal-conversation-service');
const LiveUpdater = require('../services/live-updater');
const MCPCore = require('../mcp-server/mcp-core');
const RolesSystem = require('../core/roles-system');

let mainWindow;
let serviceManager;
let configReport;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      webSecurity: true,
      // Deshabilitar Service Workers completamente
      partition: 'persist:sandra',
      session: undefined
    },
    icon: path.join(__dirname, 'assets', 'icon.ico')
  });

  // Limpiar Service Workers antes de cargar
  mainWindow.webContents.session.clearStorageData({
    storages: ['serviceworkers', 'cachestorage']
  }).then(() => {
    console.log('🧹 Service Workers y caché limpiados');
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Abrir DevTools solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Inicializar servicios
  initializeServices();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function initializeServices() {
  try {
    console.log('🚀 Sandra IA 8.0 Pro - Inicialización Profesional');
    console.log('═'.repeat(60));

    // FASE 1: Validar configuración (modo simplificado)
    console.log('\n📋 FASE 1: Validación rápida...');
    
    // Validación simple: solo verificar que GROQ_API_KEY existe
    if (!process.env.GROQ_API_KEY) {
      console.warn('⚠️  GROQ_API_KEY no configurada. Algunas funciones no estarán disponibles.');
    } else {
      console.log('✅ GROQ_API_KEY configurada');
    }
    
    configReport = {
      canStart: true,
      results: {
        critical: [{ service: 'Groq API', status: 'configured' }],
        optional: [],
        warnings: []
      }
    };

    // FASE 2: Registrar servicios
    console.log('\n📋 FASE 2: Registrando servicios...');
    serviceManager = new ServiceManager();

    // Servicios CRÍTICOS (deben iniciar)
    serviceManager.register('ai-orchestrator', AIOrchestrator, {
      critical: true,
      retries: 2
    });

    serviceManager.register('roles-system', RolesSystem, {
      critical: true,
      dependencies: ['ai-orchestrator'],
      constructorArgs: ['ai-orchestrator', null] // aiOrchestrator, mcpCore
    });

    // Servicios OPCIONALES (pueden fallar)
    serviceManager.register('neon-db', NeonDB, {
      critical: false
    });

    serviceManager.register('mcp-server', MCPCore, {
      critical: false,
      dependencies: ['ai-orchestrator']
    });

    serviceManager.register('deepgram', DeepgramService, {
      critical: false
    });

    serviceManager.register('cartesia', CartesiaService, {
      critical: false
    });

    serviceManager.register('heygen', HeyGenService, {
      critical: false
    });

    serviceManager.register('multimodal', MultimodalConversationService, {
      critical: false,
      dependencies: ['ai-orchestrator'],
      constructorArgs: ['ai-orchestrator', 'neon-db']
    });

    serviceManager.register('bright-data', BrightDataService, {
      critical: false
    });

    serviceManager.register('negotiation', NegotiationService, {
      critical: false,
      dependencies: ['ai-orchestrator'],
      constructorArgs: ['ai-orchestrator', 'neon-db']
    });

    serviceManager.register('pef', PracticalExecutionFramework, {
      critical: false,
      dependencies: ['ai-orchestrator'],
      constructorArgs: ['ai-orchestrator']
    });

    serviceManager.register('optimizer', SandraPromptOptimizer, {
      critical: false
    });

    serviceManager.register('live-updater', LiveUpdater, {
      critical: false
    });

    // FASE 3: Inicializar todos los servicios
    console.log('\n📋 FASE 3: Inicializando servicios...');
    const summary = await serviceManager.initializeAll({
      mainWindow,
      configReport
    });

    // FASE 4: Iniciar MCP Server si está listo
    const mcpServer = serviceManager.get('mcp-server');
    if (mcpServer && typeof mcpServer.start === 'function') {
      setTimeout(() => {
        try {
          mcpServer.start();
          console.log('✅ MCP Server escuchando en puerto 3001');
        } catch (e) {
          console.warn('⚠️  MCP Server no pudo iniciar:', e.message);
        }
      }, 1000);
    }

    // FASE 5: Notificar al renderer
    const rolesSystem = serviceManager.get('roles-system');
    const rolesCount = rolesSystem?.getAllRoles ? rolesSystem.getAllRoles().length : 19;

    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('services-ready', {
        status: 'ready',
        services: summary.services.filter(s => s.status === 'ready').map(s => s.name),
        rolesCount,
        mcpPort: 3001,
        configReport: {
          critical: configReport.results.critical.length,
          optional: configReport.results.optional.length,
          warnings: configReport.results.warnings.length
        }
      });
    }

    console.log('\n═'.repeat(60));
    console.log('🎉 Sandra IA 8.0 Pro lista para usar');
    console.log(`   📊 ${summary.ready}/${summary.total} servicios operativos`);
    console.log(`   🎯 ${rolesCount} roles especializados disponibles`);
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO EN INICIALIZACIÓN:');
    console.error('═'.repeat(60));
    console.error(error.message);
    console.error('Stack:', error.stack);
    console.error('═'.repeat(60) + '\n');

    // Intentar notificar al renderer
    if (mainWindow && mainWindow.webContents) {
      try {
        mainWindow.webContents.send('services-error', {
          error: error.message,
          stack: error.stack,
          configReport
        });
      } catch (e) {
        console.error('No se pudo notificar error al renderer:', e);
      }
    }

    throw error;
  }
}

// ==================== IPC HANDLERS - CHAT Y MENSAJES ====================

ipcMain.handle('send-message', async (event, { message, role, mode = 'text' }) => {
  try {
    const rolesSystem = serviceManager?.get('roles-system');
    const optimizer = serviceManager?.get('optimizer');
    const db = serviceManager?.get('neon-db');
    const aiOrchestrator = serviceManager?.get('ai-orchestrator');

    if (!rolesSystem) {
      return { success: false, error: 'Sistema de roles no disponible' };
    }

    const sessionId = `session_${Date.now()}`;
    
    // Optimizar prompt según el rol (si optimizer disponible)
    const optimizedPrompt = optimizer?.optimizePromptForRole 
      ? optimizer.optimizePromptForRole(message, role)
      : message;

    // Ejecutar con el rol específico y modo (text/voice/video) para tareas.
    // Se pasa también el mensaje original para que el sistema de roles pueda
    // detectar saludos y small-talk sin que el optimizer lo distorsione.
    const result = await rolesSystem.executeWithRole(role || 'general', optimizedPrompt, { 
      mode,
      rawMessage: message
    });
    
    // Guardar en base de datos (si disponible)
    if (db?.logMessage) {
      await db.logMessage(sessionId, message, 'user');
      await db.logMessage(sessionId, result.response, 'assistant');
    }
    
    return { 
      success: true, 
      response: result.response, 
      role: result.role,
      icon: result.icon
    };
  } catch (error) {
    console.error('Error en send-message:', error);
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - LLM PROVIDER ====================

ipcMain.handle('get-current-provider', async (event) => {
  try {
    const aiOrchestrator = serviceManager?.get('ai-orchestrator');
    if (!aiOrchestrator) {
      return { success: false, error: 'AI Orchestrator no disponible' };
    }
    const provider = aiOrchestrator.getCurrentProvider();
    return { success: true, provider };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-available-providers', async (event) => {
  try {
    const aiOrchestrator = serviceManager?.get('ai-orchestrator');
    if (!aiOrchestrator) {
      return { success: false, error: 'AI Orchestrator no disponible' };
    }
    const providers = aiOrchestrator.getAvailableProviders();
    return { success: true, providers };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-provider', async (event, { provider }) => {
  try {
    const aiOrchestrator = serviceManager?.get('ai-orchestrator');
    if (!aiOrchestrator) {
      return { success: false, error: 'AI Orchestrator no disponible' };
    }
    aiOrchestrator.setDefaultProvider(provider);
    return { success: true, provider };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - ROLES ====================

ipcMain.handle('get-all-roles', async (event) => {
  try {
    const rolesSystem = serviceManager?.get('roles-system');
    if (!rolesSystem) {
      return { success: false, error: 'Sistema de roles no disponible' };
    }
    const roles = rolesSystem.getAllRoles();
    return { success: true, roles };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('activate-role', async (event, { roleName }) => {
  try {
    const rolesSystem = serviceManager?.get('roles-system');
    if (!rolesSystem) {
      return { success: false, error: 'Sistema de roles no disponible' };
    }
    const agent = await rolesSystem.activateRole(roleName);
    return { success: true, agent };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('deactivate-role', async (event, { roleName }) => {
  try {
    const rolesSystem = serviceManager?.get('roles-system');
    if (!rolesSystem) {
      return { success: false, error: 'Sistema de roles no disponible' };
    }
    const result = rolesSystem.deactivateRole(roleName);
    return { success: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-active-roles', async (event) => {
  try {
    const rolesSystem = serviceManager?.get('roles-system');
    if (!rolesSystem) {
      return { success: false, error: 'Sistema de roles no disponible' };
    }
    const roles = rolesSystem.getActiveRoles();
    return { success: true, roles };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('execute-with-role', async (event, { roleName, task }) => {
  try {
    const rolesSystem = serviceManager?.get('roles-system');
    if (!rolesSystem) {
      return { success: false, error: 'Sistema de roles no disponible' };
    }
    const result = await rolesSystem.executeWithRole(roleName, task);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - MCP ====================

ipcMain.handle('mcp-deploy', async (event, { projectConfig }) => {
  try {
    const result = await mcpServer.deployProject(projectConfig);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('mcp-generate-code', async (event, { task, role, language }) => {
  try {
    const result = await mcpServer.generateCode(task, role, language);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('mcp-sync-github', async (event) => {
  try {
    const result = await mcpServer.syncWithGitHub();
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('mcp-execute-command', async (event, { command, cwd }) => {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    const { stdout, stderr } = await execAsync(command, { cwd });
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('mcp-spawn-agent', async (event, { role, config }) => {
  try {
    const agent = await aiOrchestrator.spawnSubagent(role, config);
    return { success: true, agent };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('mcp-get-agents', async (event) => {
  try {
    const agents = aiOrchestrator.getAllSubagents();
    return { success: true, agents };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - LIVE UPDATER ====================

ipcMain.handle('check-updates', async (event) => {
  try {
    const hasUpdate = await liveUpdater.checkForUpdates();
    return { success: true, hasUpdate };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('install-update', async (event) => {
  try {
    await liveUpdater.installUpdate();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - TAREAS ====================

ipcMain.handle('execute-task', async (event, { task, role }) => {
  try {
    const result = await pef.executeTask(task, role);
    return { success: true, result };
  } catch (error) {
    console.error('Error en execute-task:', error);
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - NEGOCIACIÓN ====================

ipcMain.handle('negotiate-accommodation', async (event, { accommodationData }) => {
  try {
    const result = await negotiation.initiateNegotiation(accommodationData);
    return { success: true, result };
  } catch (error) {
    console.error('Error en negotiate-accommodation:', error);
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - BÚSQUEDA ====================

ipcMain.handle('search-accommodations', async (event, { destination, checkIn, checkOut, guests }) => {
  try {
    const results = await brightData.extractAccommodationData(destination, checkIn, checkOut, guests);
    return { success: true, results };
  } catch (error) {
    console.error('Error en search-accommodations:', error);
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - VENTAS ====================

ipcMain.handle('process-sale', async (event, { saleData }) => {
  try {
    const result = await brightData.processSale(saleData);
    return { success: true, result };
  } catch (error) {
    console.error('Error en process-sale:', error);
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - LLAMADAS ====================

ipcMain.handle('make-phone-call', async (event, { phoneNumber, message }) => {
  try {
    const result = await negotiation.initiatePhoneCall(phoneNumber, message);
    return { success: true, result };
  } catch (error) {
    console.error('Error en make-phone-call:', error);
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - VALIDACIÓN ====================

ipcMain.handle('validate-role', async (event, { role, task }) => {
  try {
    const result = await pef.validateRoleExecution(role, task);
    return { success: true, result };
  } catch (error) {
    console.error('Error en validate-role:', error);
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - ESTADÍSTICAS ====================

ipcMain.handle('get-stats', async (event) => {
  try {
    const stats = await db.getStats();
    const activeRoles = rolesSystem.getActiveRoles();
    const activeAgents = aiOrchestrator.getAllSubagents();
    
    return { 
      success: true, 
      stats: {
        ...stats,
        activeRoles: activeRoles.length,
        activeAgents: activeAgents.length,
        totalRoles: 18
      }
    };
  } catch (error) {
    console.error('Error en get-stats:', error);
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - PROVEEDOR IA ====================

ipcMain.handle('switch-ai-provider', async (event, { provider }) => {
  try {
    aiOrchestrator.setDefaultProvider(provider);
    return { success: true, provider };
  } catch (error) {
    console.error('Error en switch-ai-provider:', error);
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS MULTIMODALES ====================

ipcMain.handle('transcribe-audio', async (event, { audioPath }) => {
  try {
    const result = await deepgram.transcribeFile(audioPath);
    return result;
  } catch (error) {
    console.error('Error en transcribe-audio:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('transcribe-buffer', async (event, { audioBuffer, mimeType }) => {
  try {
    const result = await deepgram.transcribeBuffer(audioBuffer, mimeType);
    return result;
  } catch (error) {
    console.error('Error en transcribe-buffer:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('generate-speech', async (event, { text, options }) => {
  try {
    const result = await cartesia.generateSpeech(text, options);
    return result;
  } catch (error) {
    console.error('Error en generate-speech:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('start-multimodal-conversation', async (event, { mode = 'text', continuous = false, userId = null } = {}) => {
  try {
    const multimodal = serviceManager?.get('multimodal');
    if (!multimodal) {
      return { success: false, error: 'Servicio multimodal no disponible' };
    }

    const result = await multimodal.startConversation({
      mode,
      continuous,
      userId,
      callbacks: {
        onTranscriptUpdate: (data) => {
          if (mainWindow?.webContents) {
            mainWindow.webContents.send('transcript-update', data);
          }
        },
        onResponseReady: (data) => {
          if (mainWindow?.webContents) {
            mainWindow.webContents.send('response-ready', data);
          }
        },
        onAvatarSpeaking: (data) => {
          if (mainWindow?.webContents) {
            mainWindow.webContents.send('avatar-speaking', data);
          }
        },
        onLipSyncFrame: (frame) => {
          if (mainWindow?.webContents) {
            mainWindow.webContents.send('lip-sync-frame', frame);
          }
        },
        onSessionState: (state) => {
          if (mainWindow?.webContents) {
            mainWindow.webContents.send('multimodal-session-state', state);
          }
        },
        onError: (error) => {
          if (mainWindow?.webContents) {
            mainWindow.webContents.send('multimodal-error', { error: error.message || error });
          }
        }
      }
    });
    return result;
  } catch (error) {
    console.error('Error en start-multimodal-conversation:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-multimodal-conversation', async (event) => {
  try {
    const multimodal = serviceManager?.get('multimodal');
    if (!multimodal) {
      return { success: false, error: 'Servicio multimodal no disponible' };
    }
    const result = await multimodal.stopConversation();
    return result;
  } catch (error) {
    console.error('Error en stop-multimodal-conversation:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('send-audio-stream', async (event, { audioData }) => {
  try {
    const multimodal = serviceManager?.get('multimodal');
    if (!multimodal) {
      return { success: false, error: 'Servicio multimodal no disponible' };
    }
    multimodal.sendAudioData(audioData);
    return { success: true };
  } catch (error) {
    console.error('Error en send-audio-stream:', error);
    return { success: false, error: error.message };
  }
});

// Nuevos handlers para sendText y sendVoice
ipcMain.handle('multimodal-send-text', async (event, { text, userId } = {}) => {
  try {
    const multimodal = serviceManager?.get('multimodal');
    if (!multimodal) {
      return { success: false, error: 'Servicio multimodal no disponible' };
    }
    const result = await multimodal.sendText(text, { userId });
    return result;
  } catch (error) {
    console.error('Error en multimodal-send-text:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('multimodal-send-voice', async (event, { audioBuffer, userId } = {}) => {
  try {
    const multimodal = serviceManager?.get('multimodal');
    if (!multimodal) {
      return { success: false, error: 'Servicio multimodal no disponible' };
    }
    const result = await multimodal.sendVoice(audioBuffer, { userId });
    return result;
  } catch (error) {
    console.error('Error en multimodal-send-voice:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-barge-in', async (event, { enabled }) => {
  try {
    const multimodal = serviceManager?.get('multimodal');
    if (!multimodal) {
      return { success: false, error: 'Servicio multimodal no disponible' };
    }
    multimodal.setBargeIn(enabled);
    return { success: true, enabled };
  } catch (error) {
    console.error('Error en set-barge-in:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-continuous-mode', async (event, { enabled }) => {
  try {
    const multimodal = serviceManager?.get('multimodal');
    if (!multimodal) {
      return { success: false, error: 'Servicio multimodal no disponible' };
    }
    multimodal.setContinuousMode(enabled);
    return { success: true, enabled };
  } catch (error) {
    console.error('Error en set-continuous-mode:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-multimodal-status', async (event) => {
  try {
    const multimodal = serviceManager?.get('multimodal');
    if (!multimodal) {
      return { success: false, error: 'Servicio multimodal no disponible' };
    }
    const status = multimodal.getStatus();
    return { success: true, status };
  } catch (error) {
    console.error('Error en get-multimodal-status:', error);
    return { success: false, error: error.message };
  }
});

// Estado general del sistema para UI
ipcMain.handle('get-system-status', async (event) => {
  try {
    const orchestrator = serviceManager?.get('ai-orchestrator');
    const availableProviders = orchestrator?.getAvailableProviders?.() || [];
    const currentProvider = orchestrator?.getCurrentProvider?.() || null;
    const names = [
      'ai-orchestrator','roles-system','neon-db','mcp-server',
      'deepgram','cartesia','heygen','multimodal',
      'bright-data','negotiation','pef','optimizer','live-updater'
    ];
    const services = names.map(name => ({
      name,
      ready: !!serviceManager?.get(name)
    }));
    return { success: true, data: { providers: availableProviders, currentProvider, services } };
  } catch (error) {
    console.error('Error en get-system-status:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('avatar-speak', async (event, { text }) => {
  try {
    const heygenService = serviceManager?.get('heygen');
    if (!heygenService) {
      return { success: false, error: 'Servicio HeyGen no disponible' };
    }
    const result = await heygenService.speak(text);
    return result;
  } catch (error) {
    console.error('Error en avatar-speak:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-avatar-session', async (event) => {
  try {
    const heygenService = serviceManager?.get('heygen');
    if (!heygenService) {
      return { success: false, error: 'Servicio HeyGen no disponible' };
    }
    const result = await heygenService.createStreamingSession();
    return result;
  } catch (error) {
    console.error('Error en create-avatar-session:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-avatar', async (event) => {
  try {
    const heygenService = serviceManager?.get('heygen');
    if (!heygenService) {
      return { success: false, error: 'Servicio HeyGen no disponible' };
    }
    const result = await heygenService.stop();
    return result;
  } catch (error) {
    console.error('Error en stop-avatar:', error);
    return { success: false, error: error.message };
  }
});

// ==================== APP EVENTS ====================

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
