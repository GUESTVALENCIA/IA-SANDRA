const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { SandraOrchestrator } = require('./orchestrator/sandra-orchestrator');
const ipcSecurity = require('./main-ipc-security');

let mainWindow;
let orchestrator;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // SEGURIDAD: Context Isolation habilitado
      contextIsolation: true,
      // SEGURIDAD: Node Integration deshabilitado
      nodeIntegration: false,
      // SEGURIDAD: Web Security habilitada
      webSecurity: true,
      // Preload script para bridge seguro
      preload: path.join(__dirname, 'preload.js'),
      // Sandbox deshabilitado (necesario para algunas APIs)
      sandbox: false
    },
    title: 'Sandra DevConsole',
    show: false
  });

  mainWindow.loadFile('frontend/index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    initializeOrchestrator();
  });

  // DevTools en modo desarrollo
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (orchestrator) {
      orchestrator.shutdown();
    }
  });
}

async function initializeOrchestrator() {
  try {
    orchestrator = new SandraOrchestrator();
    await orchestrator.initialize();

    // Solo enviar ready si el orchestrator se inicializó correctamente
    if (orchestrator.isInitialized) {
      mainWindow.webContents.send('orchestrator-ready', {
        status: 'connected',
        services: orchestrator.getServiceStatus()
      });
    } else {
      throw new Error('Orchestrator initialization completed but not marked as initialized');
    }
  } catch (error) {
    console.error('Error initializing orchestrator:', error);
    orchestrator = null; // Asegurar que se establece a null si falla
    mainWindow.webContents.send('orchestrator-error', {
      error: error.message
    });
  }
}

// IPC Handlers - Registrados al inicio
console.log('[MAIN] Registering IPC handlers...');

ipcMain.handle('send-message', async (event, message, options = {}) => {
  // SEGURIDAD: Validar canal
  ipcSecurity.validateChannel('send-message');
  
  // SEGURIDAD: Validar mensaje
  ipcSecurity.validateMessage(message);

  if (!orchestrator || !orchestrator.isInitialized) {
    // Intentar reinicializar si no está inicializado
    if (!orchestrator || !orchestrator.isInitialized) {
      try {
        console.log('Attempting to reinitialize orchestrator...');
        if (!orchestrator) {
          orchestrator = new SandraOrchestrator();
        }
        await orchestrator.initialize();
      } catch (initError) {
        throw new Error(`Orchestrator not initialized: ${initError.message}`);
      }
    }
  }

  try {
    const response = await orchestrator.processMessage(message, options);
    return response;
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  }
});

ipcMain.handle('get-service-status', async () => {
  if (!orchestrator) {
    return { connected: false };
  }

  return orchestrator.getServiceStatus();
});

ipcMain.handle('get-metrics', async () => {
  if (!orchestrator) {
    return {};
  }

  return orchestrator.getMetrics();
});

ipcMain.handle('reset-services', async () => {
  console.log('[MAIN] reset-services handler called');
  
  if (!orchestrator) {
    console.error('[MAIN] Orchestrator not initialized');
    throw new Error('Orchestrator not initialized');
  }

  try {
    console.log('[MAIN] Resetting all services...');
    
    // Reinicializar el orchestrator
    await orchestrator.shutdown();
    orchestrator = new SandraOrchestrator();
    await orchestrator.initialize();

    // Enviar evento de ready al frontend
    if (mainWindow && orchestrator.isInitialized) {
      mainWindow.webContents.send('orchestrator-ready', {
        status: 'reset-complete',
        services: orchestrator.getServiceStatus()
      });
    }

    const status = orchestrator.getServiceStatus();
    console.log('[MAIN] Services reset complete:', Object.keys(status));
    return status;
  } catch (error) {
    console.error('[MAIN] Error resetting services:', error);
    throw error;
  }
});

console.log('[MAIN] ✅ reset-services handler registered');
console.log('[MAIN] Verifying handler is actually registered...');
console.log('[MAIN] ipcMain handlers:', ipcMain.eventNames());

// Verificar que el handler está realmente registrado
const handlersList = [
  'send-message',
  'get-service-status', 
  'get-metrics',
  'reset-services',
  'voice-command',
  'voice-programming-status',
  'ai-voice-command',
  'ai-voice-commands-status'
];

handlersList.forEach(handlerName => {
  // Verificar si el handler está registrado
  console.log(`[MAIN] Handler "${handlerName}": ${ipcMain.listenerCount(handlerName) > 0 ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
});

// Handler para programación por voz
ipcMain.handle('voice-command', async (event, audioBuffer, options = {}) => {
  // SEGURIDAD: Validar canal
  ipcSecurity.validateChannel('voice-command');
  
  // SEGURIDAD: Validar audio buffer
  ipcSecurity.validateAudioBuffer(audioBuffer);

  if (!orchestrator || !orchestrator.isInitialized) {
    try {
      console.log('Attempting to reinitialize orchestrator for voice command...');
      if (!orchestrator) {
        orchestrator = new SandraOrchestrator();
      }
      await orchestrator.initialize();
    } catch (initError) {
      throw new Error(`Orchestrator not initialized: ${initError.message}`);
    }
  }

  try {
    // Convertir audioBuffer si viene como ArrayBuffer o base64
    let buffer;
    if (Buffer.isBuffer(audioBuffer)) {
      buffer = audioBuffer;
    } else if (audioBuffer instanceof ArrayBuffer) {
      buffer = Buffer.from(audioBuffer);
    } else if (typeof audioBuffer === 'string') {
      // Asumir base64
      buffer = Buffer.from(audioBuffer, 'base64');
    } else if (audioBuffer && audioBuffer.data) {
      // Si viene con wrapper
      buffer = Buffer.from(audioBuffer.data);
    } else {
      throw new Error('Invalid audio buffer format');
    }

    const response = await orchestrator.processVoiceCommand(buffer, options);
    return response;
  } catch (error) {
    console.error('Error processing voice command:', error);
    throw error;
  }
});

// Handler para obtener estado de programación por voz
ipcMain.handle('voice-programming-status', async () => {
  if (!orchestrator || !orchestrator.isInitialized) {
    return { available: false };
  }

  if (!orchestrator.services.nucleus || !orchestrator.services.nucleus.voiceProgramming) {
    return { available: false };
  }

  return {
    available: true,
    listening: orchestrator.services.nucleus.voiceProgramming.isListening || false,
    commandHistory: orchestrator.services.nucleus.voiceProgramming.commandHistory?.length || 0
  };
});

// Handler para comandos de voz para el asistente IA
ipcMain.handle('ai-voice-command', async (event, audioBuffer, options = {}) => {
  // SEGURIDAD: Validar canal
  ipcSecurity.validateChannel('ai-voice-command');
  
  // SEGURIDAD: Validar audio buffer
  ipcSecurity.validateAudioBuffer(audioBuffer);

  if (!orchestrator || !orchestrator.isInitialized) {
    try {
      console.log('Attempting to reinitialize orchestrator for AI voice command...');
      if (!orchestrator) {
        orchestrator = new SandraOrchestrator();
      }
      await orchestrator.initialize();
    } catch (initError) {
      throw new Error(`Orchestrator not initialized: ${initError.message}`);
    }
  }

  try {
    // Convertir audioBuffer
    let buffer;
    if (Buffer.isBuffer(audioBuffer)) {
      buffer = audioBuffer;
    } else if (audioBuffer instanceof ArrayBuffer) {
      buffer = Buffer.from(audioBuffer);
    } else if (typeof audioBuffer === 'string') {
      buffer = Buffer.from(audioBuffer, 'base64');
    } else if (audioBuffer && audioBuffer.data) {
      buffer = Buffer.from(audioBuffer.data);
    } else {
      throw new Error('Invalid audio buffer format');
    }

    const response = await orchestrator.processAIVoiceCommand(buffer, options);
    return response;
  } catch (error) {
    console.error('Error processing AI voice command:', error);
    throw error;
  }
});

// Handler para estado de comandos de voz del asistente
ipcMain.handle('ai-voice-commands-status', async () => {
  if (!orchestrator || !orchestrator.isInitialized) {
    return { available: false };
  }

  if (!orchestrator.services.nucleus || !orchestrator.services.nucleus.voiceCommandsForAI) {
    return { available: false };
  }

  return {
    available: true,
    listening: orchestrator.services.nucleus.voiceCommandsForAI.isListening || false,
    commandHistory: orchestrator.services.nucleus.voiceCommandsForAI.commandHistory?.length || 0
  };
});

// Verificar que todos los handlers están registrados
console.log('[MAIN] IPC Handlers registered:', [
  'send-message',
  'get-service-status',
  'get-metrics',
  'reset-services',
  'voice-command',
  'voice-programming-status',
  'ai-voice-command',
  'ai-voice-commands-status'
].join(', '));

// App Events
app.whenReady().then(() => {
  console.log('[MAIN] App ready, creating window...');
  createWindow();
});

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

app.on('before-quit', () => {
  if (orchestrator) {
    orchestrator.shutdown();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});