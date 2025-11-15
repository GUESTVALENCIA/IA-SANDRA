const { app, BrowserWindow, ipcMain, globalShortcut, Menu } = require('electron');
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
let backgroundDaemons = {
  systemMonitor: null,
  gitSync: null,
  convoGuard: null
};
let sosAgentId = null;
let sosPrimaryId = null;
let sosHotId = null;
let sosUnhealthyCount = 0;
const SOS_PROMPT = `Eres el Subagente SOS de Sandra IA. Objetivo: soporte en caliente, reacción inmediata ante incidentes, fallos de conversación o desconexiones de audio/video/voz.
Reglas:
- Responde solo lo imprescindible (máx. 3 viñetas o 4 frases).
- Ejecuta diagnóstico rápido (servicios críticos: Deepgram, Cartesia, Multimodal, UI) y propone 1 acción directa.
- Si detectas caída de un servicio, sugiere reinicio focalizado o fallback.
- Prioriza recuperar la llamada conversacional, la voz de Sandra y el avatar.
- Tono profesional, sin adornos, 1 emoji como máximo (solo si aclara).`;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#1a1a2e',
    autoHideMenuBar: true,
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
  // Ocultar completamente menú de aplicación
  try { Menu.setApplicationMenu(null); } catch {}

  // Abrir DevTools solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Atajos de depuración siempre disponibles
  try {
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      if (mainWindow && mainWindow.webContents) mainWindow.webContents.toggleDevTools();
    });
    globalShortcut.register('F12', () => {
      if (mainWindow && mainWindow.webContents) mainWindow.webContents.toggleDevTools();
    });
  } catch (e) {
    console.warn('No se pudieron registrar atajos de DevTools:', e.message);
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

    // Iniciar subagentes/daemons en segundo plano
    startBackgroundDaemons();
    // Iniciar SOS primario y monitor
    startSOSAgents();

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
    const brightData = serviceManager?.get('bright-data');

    if (!rolesSystem) {
      return { success: false, error: 'Sistema de roles no disponible' };
    }

    const sessionId = `session_${Date.now()}`;
    
    // Importante: preservar exactamente el contexto del usuario.
    // Desactivamos optimizer para evitar pérdida de intención/tema.
    let optimizedPrompt = message;

    // ==================== INTEGRACIÓN BRIGHT DATA ====================
    // Si el rol es Concierge o Turismo y el mensaje menciona alojamientos,
    // consultar automáticamente los datos reales de Guests-Valencia
    const isAccommodationQuery = /alojamiento|apartamento|hotel|hostal|dónde.*quedar|dónde.*alojar|disponible|reserva|habitación/i.test(message);
    const isHospitalityRole = ['concierge', 'tourism'].includes(role);
    
    console.log(`🔍 [Bright Data Check] Rol: ${role}, isHospitalityRole: ${isHospitalityRole}, isAccommodationQuery: ${isAccommodationQuery}`);
    
    if (brightData && isHospitalityRole && isAccommodationQuery) {
      try {
        // Extraer número de personas del mensaje (si existe)
        const guestsMatch = message.match(/(\d+)\s*(persona|gente|adulto)/i);
        const guests = guestsMatch ? parseInt(guestsMatch[1]) : 2;
        
        console.log(`🏨 [Bright Data] Consultando alojamientos de Guests-Valencia para ${guests} personas...`);
        const accommodationsData = await brightData.getMyAccommodations(null, null, guests);
        
        console.log(`📊 [Bright Data] Resultado:`, accommodationsData);
        
        if (accommodationsData.success && accommodationsData.accommodations.length > 0) {
          // Inyectar los datos reales en el prompt
          optimizedPrompt = `${message}

[DATOS EN TIEMPO REAL DE GUESTS-VALENCIA]:
${JSON.stringify(accommodationsData, null, 2)}

INSTRUCCIONES: Usa EXCLUSIVAMENTE estos datos reales para responder. Presenta los alojamientos disponibles de forma profesional y personalizada.`;
          
          console.log(`✅ [Bright Data] ${accommodationsData.accommodations.length} alojamientos inyectados en el prompt`);
        } else {
          console.warn('⚠️ [Bright Data] No se encontraron alojamientos o falló la consulta');
        }
      } catch (error) {
        console.error('❌ [Bright Data] Error consultando:', error);
        // Continuar sin los datos en tiempo real
      }
    } else {
      if (!brightData) console.warn('⚠️ [Bright Data] Servicio no disponible');
    }

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

// Consultar MIS alojamientos (El Cabañal, Valencia)
ipcMain.handle('get-my-accommodations', async (event, { checkIn, checkOut, guests }) => {
  try {
    const results = await brightData.getMyAccommodations(checkIn, checkOut, guests);
    return results;
  } catch (error) {
    console.error('Error en get-my-accommodations:', error);
    return { success: false, error: error.message };
  }
});

// ==================== IPC HANDLERS - LIPSYNC SOURCE ====================
const pathFs = require('path');
const fsSync = require('fs');
const fsPromises = require('fs').promises;

ipcMain.handle('set-lipsync-source-video', async (event, { filePath }) => {
  try {
    const multimodal = serviceManager?.get('multimodal');
    if (!multimodal) return { success: false, error: 'Servicio multimodal no disponible' };
    if (!filePath || !fsSync.existsSync(filePath)) return { success: false, error: 'Ruta inválida' };
    if (typeof multimodal.setLipSyncSourceVideo === 'function') {
      multimodal.setLipSyncSourceVideo(filePath);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('register-lipsync-source-video', async (event, { name, base64 }) => {
  try {
    const multimodal = serviceManager?.get('multimodal');
    if (!multimodal) return { success: false, error: 'Servicio multimodal no disponible' };
    if (!base64) return { success: false, error: 'Contenido vacío' };
    const tempDir = pathFs.join(__dirname, '..', 'temp-lipsync');
    await fsPromises.mkdir(tempDir, { recursive: true });
    const safeName = (name || 'sora_source.mp4').replace(/[^\w\-.]+/g, '_');
    const outPath = pathFs.join(tempDir, `src_${Date.now()}_${safeName}`);
    const buf = Buffer.from(base64, 'base64');
    await fsPromises.writeFile(outPath, buf);
    if (typeof multimodal.setLipSyncSourceVideo === 'function') {
      multimodal.setLipSyncSourceVideo(outPath);
    }
    return { success: true, filePath: outPath };
  } catch (error) {
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

    // Normalizar de forma robusta a Buffer antes de enviar
    // Aceptar tanto audioData crudo como { audioData: ... }
    if (audioData && typeof audioData === 'object' && audioData.audioData) {
      audioData = audioData.audioData;
    }
    let payload = audioData;
    try {
      if (Buffer.isBuffer(audioData)) {
        payload = audioData;
      } else if (audioData && audioData.type === 'Buffer' && Array.isArray(audioData.data)) {
        payload = Buffer.from(audioData.data);
      } else if (ArrayBuffer.isView(audioData)) {
        payload = Buffer.from(audioData.buffer, audioData.byteOffset, audioData.byteLength);
      } else if (audioData instanceof ArrayBuffer) {
        payload = Buffer.from(audioData);
      } else if (Array.isArray(audioData)) {
        payload = Buffer.from(Uint8Array.from(audioData));
      } else if (audioData && typeof audioData === 'object' && typeof audioData.length === 'number') {
        // Objeto array-like
        payload = Buffer.from(Uint8Array.from(audioData));
      } else if (typeof audioData === 'string') {
        // Intentar base64
        payload = Buffer.from(audioData, 'base64');
      }
    } catch (e) {
      console.warn('No se pudo normalizar audioData:', e.message);
    }

    multimodal.sendAudioData(payload);
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

// Disparar subagente SOS (wake word "Hola Sandra")
ipcMain.handle('trigger-sos', async (event) => {
  try {
    const aiOrchestrator = serviceManager?.get('ai-orchestrator');
    if (!aiOrchestrator) {
      return { success: false, error: 'AI Orchestrator no disponible' };
    }
    if (!sosAgentId) {
      const agent = await aiOrchestrator.spawnSubagent('sos', {
        provider: 'openai',
        model: 'gpt-4o-mini',
        systemPrompt: SOS_PROMPT
      });
      sosAgentId = agent.id;
      console.log('🆘 SOS subagente activado:', sosAgentId);
    } else {
      console.log('🆘 SOS ya activo:', sosAgentId);
    }
    return { success: true, agentId: sosAgentId };
  } catch (error) {
    console.error('Error en trigger-sos:', error);
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

// ==================== BACKGROUND DAEMONS (SUBAGENTES) ====================
function startBackgroundDaemons() {
  try {
    const aiOrchestrator = serviceManager?.get('ai-orchestrator');
    const rolesSystem = serviceManager?.get('roles-system');
    const multimodal = serviceManager?.get('multimodal');

    if (!aiOrchestrator || !rolesSystem) {
      console.warn('⚠️ No se pudo iniciar daemons: orquestador o roles no disponibles');
      return;
    }

    // 1) Monitoreo del sistema (cada 60s)
    clearInterval(backgroundDaemons.systemMonitor);
    backgroundDaemons.systemMonitor = setInterval(async () => {
      try {
        await rolesSystem.executeWithRole('dev_support', 'Monitorea estado del sistema y registra anomalías. Reporta solo si hay incidencia.', { mode: 'text' });
      } catch (e) {
        console.warn('⚠️ System monitor error:', e?.message);
      }
    }, 60_000);

    // 2) Sincronización GitHub silenciosa (cada 10 min)
    clearInterval(backgroundDaemons.gitSync);
    backgroundDaemons.gitSync = setInterval(async () => {
      try {
        const mcp = serviceManager?.get('mcp-server');
        if (mcp?.syncWithGitHub) {
          await mcp.syncWithGitHub();
        } else {
          // Fallback suave usando el orquestador para no bloquear
          await aiOrchestrator.generateResponse(
            'Verifica y sincroniza silenciosamente el repositorio Git si hay cambios. No abras ventanas.',
            'openai',
            'gpt-4o-mini',
            {}
          );
        }
      } catch (e) {
        console.warn('⚠️ Git sync daemon error:', e?.message);
      }
    }, 10 * 60_000);

    // 3) Guardián conversacional (cada 5s): asegurar barge-in activo durante llamadas
    clearInterval(backgroundDaemons.convoGuard);
    backgroundDaemons.convoGuard = setInterval(async () => {
      try {
        if (!multimodal?.getStatus) return;
        const st = multimodal.getStatus();
        if (st?.sessionActive && (st?.currentMode === 'voice' || st?.currentMode === 'avatar')) {
          if (!st?.bargeInEnabled && multimodal.setBargeIn) {
            multimodal.setBargeIn(true);
          }
        }
      } catch (e) {
        // no romper ciclo
      }
    }, 5_000);

    console.log('✅ Daemons de fondo iniciados (monitor, sync, guard)');
  } catch (e) {
    console.error('❌ Error iniciando background daemons:', e);
  }
}

// ==================== SOS AGENTS (PRIMARIO + HOT) ====================
function startSOSAgents() {
  try {
    const aiOrchestrator = serviceManager?.get('ai-orchestrator');
    if (!aiOrchestrator) {
      console.warn('⚠️ No se pudo iniciar SOS: orquestador no disponible');
      return;
    }

    // Crear SOS primario fijo si no existe
    const ensurePrimary = async () => {
      if (!sosPrimaryId) {
        const agent = await aiOrchestrator.spawnSubagent('sos', {
          provider: 'openai',
          model: 'gpt-4o-mini',
          systemPrompt: SOS_PROMPT
        });
        sosPrimaryId = agent.id;
        console.log('🟢 SOS primario activo:', sosPrimaryId);
      }
    };

    // Health-check periódico al primario; si falla, levantar HOT
    clearInterval(backgroundDaemons.sosHealth);
    backgroundDaemons.sosHealth = setInterval(async () => {
      try {
        await ensurePrimary();
        if (!sosPrimaryId) return;
        // Ping ligero
        await aiOrchestrator.executeWithSubagent(sosPrimaryId, 'PING', { mode: 'text' });
        sosUnhealthyCount = 0;
        // Si había HOT por contingencia y el primario está sano, podemos mantener HOT inactivo (no terminamos por ahora)
      } catch (e) {
        sosUnhealthyCount++;
        console.warn(`⚠️ SOS primario sin respuesta (${sosUnhealthyCount})`);
        // Elevar HOT si no existe o si el primario lleva 2+ fallos seguidos
        if (!sosHotId || sosUnhealthyCount >= 2) {
          try {
            const agentHot = await aiOrchestrator.spawnSubagent('sos', {
              provider: 'openai',
              model: 'gpt-4o-mini',
              systemPrompt: SOS_PROMPT + '\n\nModo: HOT STANDBY. Asume el control si el primario no responde.'
            });
            sosHotId = agentHot.id;
            console.log('🟠 SOS HOT levantado:', sosHotId);
          } catch (err) {
            console.error('❌ No se pudo levantar SOS HOT:', err.message);
          }
        }
      }
    }, 30_000);

  } catch (e) {
    console.error('❌ Error iniciando SOS agents:', e);
  }
}
