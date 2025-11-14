const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.pro') });

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
let db, aiOrchestrator, brightData, negotiation, pef, optimizer;
let deepgram, cartesia, heygen, multimodal;
let liveUpdater, mcpServer, rolesSystem;

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
      webSecurity: true
    },
    icon: path.join(__dirname, 'assets', 'icon.ico')
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Abrir DevTools temporalmente para debug
  mainWindow.webContents.openDevTools();

  // Inicializar servicios
  initializeServices();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function initializeServices() {
  try {
    console.log('🚀 Iniciando servicios de Sandra IA 8.0 Pro...');

    const initializedServices = [];

    // 1. Base de datos (con manejo de errores)
    try {
      db = new NeonDB();
      if (db.initializeDatabase) {
        await db.initializeDatabase();
      }
      console.log('✅ Neon DB inicializada');
      initializedServices.push('neon-db');
    } catch (error) {
      console.warn('⚠️ Neon DB no disponible (modo offline):', error.message);
      db = { 
        logMessage: async () => ({}), 
        getStats: async () => ({ conversations: 0, deployments: 0 }),
        initializeDatabase: async () => ({})
      };
    }

    // 2. AI Orchestrator (núcleo de IA)
    try {
      aiOrchestrator = new AIOrchestrator();
      console.log('✅ AI Orchestrator inicializado');
      initializedServices.push('ai-orchestrator');
    } catch (error) {
      console.warn('⚠️ AI Orchestrator error:', error.message);
      aiOrchestrator = {
        generateResponse: async (prompt) => 'Respuesta en modo offline',
        spawnSubagent: async () => ({ id: 'offline', role: 'offline' }),
        getAllSubagents: () => []
      };
    }

    // 3. Sistema de 18 Roles
    try {
      rolesSystem = new RolesSystem(aiOrchestrator, null);
      console.log('✅ Sistema de 18 Roles inicializado');
      initializedServices.push('roles-system');
    } catch (error) {
      console.warn('⚠️ Roles System error:', error.message);
      rolesSystem = {
        getAllRoles: () => [],
        getActiveRoles: () => [],
        executeWithRole: async (role, task) => ({ response: 'Modo offline', role, icon: '💬' }),
        activateRole: async () => ({}),
        deactivateRole: () => true
      };
    }

    // 4. MCP Server (con manejo de errores)
    try {
      mcpServer = new MCPCore();
      if (mcpServer.setDependencies) {
        mcpServer.setDependencies(db, aiOrchestrator);
      }
      // Iniciar MCP en puerto separado (sin bloquear)
      setTimeout(() => {
        try {
          mcpServer.start();
          console.log('✅ MCP Server inicializado');
        } catch (e) {
          console.warn('⚠️ MCP Server no pudo iniciar:', e.message);
        }
      }, 1000);
      initializedServices.push('mcp-server');
    } catch (error) {
      console.warn('⚠️ MCP Server error:', error.message);
      mcpServer = {
        deployProject: async () => ({ success: false }),
        generateCode: async () => ({ code: '// Modo offline' }),
        syncWithGitHub: async () => ({ success: false })
      };
    }

    // 5-8. Servicios opcionales
    try {
      brightData = new BrightDataService();
      console.log('✅ Bright Data Service inicializado');
      initializedServices.push('bright-data');
    } catch (error) {
      console.warn('⚠️ Bright Data no disponible');
      brightData = { extractAccommodationData: async () => [], processSale: async () => ({}) };
    }

    try {
      negotiation = new NegotiationService(aiOrchestrator, db);
      console.log('✅ Negotiation Service inicializado');
      initializedServices.push('negotiation');
    } catch (error) {
      console.warn('⚠️ Negotiation Service no disponible');
      negotiation = { initiateNegotiation: async () => ({}), initiatePhoneCall: async () => ({}) };
    }

    try {
      pef = new PracticalExecutionFramework(aiOrchestrator);
      console.log('✅ PEF inicializado');
      initializedServices.push('pef');
    } catch (error) {
      console.warn('⚠️ PEF no disponible');
      pef = { executeTask: async () => ({}), validateRoleExecution: async () => ({}) };
    }

    try {
      optimizer = new SandraPromptOptimizer();
      console.log('✅ Sandra Prompt Optimizer inicializado');
      initializedServices.push('optimizer');
    } catch (error) {
      console.warn('⚠️ Optimizer no disponible');
      optimizer = { optimizePromptForRole: (msg) => msg };
    }

    // 9. Servicios multimodales (opcionales)
    try {
      deepgram = new DeepgramService();
      console.log('✅ Deepgram STT inicializado');
      initializedServices.push('deepgram');
    } catch (error) {
      console.warn('⚠️ Deepgram no disponible');
      deepgram = { transcribeFile: async () => ({}), transcribeBuffer: async () => ({}) };
    }

    try {
      cartesia = new CartesiaService();
      console.log('✅ Cartesia TTS inicializado');
      initializedServices.push('cartesia');
    } catch (error) {
      console.warn('⚠️ Cartesia no disponible');
      cartesia = { generateSpeech: async () => ({}) };
    }

    try {
      heygen = new HeyGenService();
      console.log('✅ HeyGen Avatar inicializado');
      initializedServices.push('heygen');
    } catch (error) {
      console.warn('⚠️ HeyGen no disponible');
      heygen = { speak: async () => ({}), createStreamingSession: async () => ({}), stop: async () => ({}) };
    }

    try {
      multimodal = new MultimodalConversationService(aiOrchestrator, db);
      console.log('✅ Multimodal Conversation Service inicializado');
      initializedServices.push('multimodal');
    } catch (error) {
      console.warn('⚠️ Multimodal Service no disponible');
      multimodal = {
        startConversation: async () => ({}),
        stopConversation: async () => ({}),
        sendAudioData: () => {},
        setBargeIn: () => {},
        getStatus: () => ({ active: false })
      };
    }

    // 10. Live Updater (opcional)
    try {
      liveUpdater = new LiveUpdater(mainWindow, db);
      if (liveUpdater.startAutoCheck) {
        liveUpdater.startAutoCheck(60);
      }
      console.log('✅ Live Updater inicializado');
      initializedServices.push('live-updater');
    } catch (error) {
      console.warn('⚠️ Live Updater no disponible');
      liveUpdater = { checkForUpdates: async () => false, installUpdate: async () => ({}) };
    }

    // Notificar al renderer que todo está listo
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('services-ready', {
        status: 'ready',
        services: initializedServices,
        rolesCount: rolesSystem.getAllRoles ? rolesSystem.getAllRoles().length : 18,
        mcpPort: 3001
      });
    }

    console.log(`🎉 Servicios iniciados: ${initializedServices.length} de 13`);
    console.log('✅ Sandra IA 8.0 Pro lista para usar');
  } catch (error) {
    console.error('❌ Error crítico inicializando servicios:', error);
    console.error('Stack:', error.stack);
    
    // Intentar notificar al renderer incluso con error
    if (mainWindow && mainWindow.webContents) {
      try {
        mainWindow.webContents.send('services-error', {
          error: error.message,
          stack: error.stack
        });
      } catch (e) {
        console.error('No se pudo notificar error al renderer:', e);
      }
    }
  }
}

// ==================== IPC HANDLERS - CHAT Y MENSAJES ====================

ipcMain.handle('send-message', async (event, { message, role }) => {
  try {
    const sessionId = `session_${Date.now()}`;
    
    // Optimizar prompt según el rol
    const optimizedPrompt = optimizer.optimizePromptForRole(message, role);
    
    // Ejecutar con el rol específico
    const result = await rolesSystem.executeWithRole(role, optimizedPrompt);
    
    // Guardar en base de datos
    await db.logMessage(sessionId, message, 'user');
    await db.logMessage(sessionId, result.response, 'assistant');
    
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

// ==================== IPC HANDLERS - ROLES ====================

ipcMain.handle('get-all-roles', async (event) => {
  try {
    const roles = rolesSystem.getAllRoles();
    return { success: true, roles };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('activate-role', async (event, { roleName }) => {
  try {
    const agent = await rolesSystem.activateRole(roleName);
    return { success: true, agent };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('deactivate-role', async (event, { roleName }) => {
  try {
    const result = rolesSystem.deactivateRole(roleName);
    return { success: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-active-roles', async (event) => {
  try {
    const roles = rolesSystem.getActiveRoles();
    return { success: true, roles };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('execute-with-role', async (event, { roleName, task }) => {
  try {
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

ipcMain.handle('start-multimodal-conversation', async (event) => {
  try {
    const result = await multimodal.startConversation({
      onTranscriptUpdate: (data) => {
        mainWindow.webContents.send('transcript-update', data);
      },
      onResponseReady: (data) => {
        mainWindow.webContents.send('response-ready', data);
      },
      onAvatarSpeaking: (data) => {
        mainWindow.webContents.send('avatar-speaking', data);
      },
      onError: (error) => {
        mainWindow.webContents.send('multimodal-error', { error: error.message });
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
    const result = await multimodal.stopConversation();
    return result;
  } catch (error) {
    console.error('Error en stop-multimodal-conversation:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('send-audio-stream', async (event, { audioData }) => {
  try {
    multimodal.sendAudioData(audioData);
    return { success: true };
  } catch (error) {
    console.error('Error en send-audio-stream:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('set-barge-in', async (event, { enabled }) => {
  try {
    multimodal.setBargeIn(enabled);
    return { success: true, enabled };
  } catch (error) {
    console.error('Error en set-barge-in:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-multimodal-status', async (event) => {
  try {
    const status = multimodal.getStatus();
    return { success: true, status };
  } catch (error) {
    console.error('Error en get-multimodal-status:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('avatar-speak', async (event, { text }) => {
  try {
    const result = await heygen.speak(text);
    return result;
  } catch (error) {
    console.error('Error en avatar-speak:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-avatar-session', async (event) => {
  try {
    const result = await heygen.createStreamingSession();
    return result;
  } catch (error) {
    console.error('Error en create-avatar-session:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-avatar', async (event) => {
  try {
    const result = await heygen.stop();
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
