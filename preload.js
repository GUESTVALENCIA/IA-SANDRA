/**
 * Preload Script - Secure Bridge between Main and Renderer
 * Context Isolation Enabled - Secure IPC Communication
 */

const { contextBridge, ipcRenderer } = require('electron');

// Whitelist de comandos IPC permitidos (seguridad)
const ALLOWED_IPC_CHANNELS = [
  'send-message',
  'get-service-status',
  'get-metrics',
  'reset-services',
  'voice-command',
  'voice-programming-status',
  'ai-voice-command',
  'ai-voice-commands-status'
];

/**
 * Validar canal IPC antes de enviar
 */
function validateChannel(channel) {
  if (!ALLOWED_IPC_CHANNELS.includes(channel)) {
    throw new Error(`IPC channel "${channel}" is not allowed`);
  }
  return true;
}

// Exponer API segura al renderer process
const electronAPI = {
  // Chat API
  sendMessage: async (message, options = {}) => {
    validateChannel('send-message');
    // Validar input
    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw new Error('Message must be a non-empty string');
    }
    if (message.length > 10000) {
      throw new Error('Message too long (max 10000 characters)');
    }
    console.log('[PRELOAD] sendMessage called via electronAPI');
    return await ipcRenderer.invoke('send-message', message, options);
  },

  // Service Status
  getServiceStatus: async () => {
    validateChannel('get-service-status');
    return await ipcRenderer.invoke('get-service-status');
  },

  // Metrics
  getMetrics: async () => {
    validateChannel('get-metrics');
    return await ipcRenderer.invoke('get-metrics');
  },

  // Reset Services
  resetServices: async () => {
    console.log('[PRELOAD] resetServices called via electronAPI');
    validateChannel('reset-services');
    try {
      const result = await ipcRenderer.invoke('reset-services');
      console.log('[PRELOAD] reset-services result:', result);
      return result;
    } catch (error) {
      console.error('[PRELOAD] Error in resetServices:', error);
      throw error;
    }
  },

  // Voice Command
  voiceCommand: async (audioBuffer, options = {}) => {
    validateChannel('voice-command');
    // Validar audioBuffer
    if (!audioBuffer || (typeof audioBuffer !== 'string' && !Buffer.isBuffer(audioBuffer))) {
      throw new Error('Invalid audio buffer format');
    }
    // Limitar tamaño (10MB máximo)
    const bufferSize = typeof audioBuffer === 'string' 
      ? Buffer.from(audioBuffer, 'base64').length 
      : audioBuffer.length;
    if (bufferSize > 10 * 1024 * 1024) {
      throw new Error('Audio buffer too large (max 10MB)');
    }
    return await ipcRenderer.invoke('voice-command', audioBuffer, options);
  },

  // Voice Programming Status
  getVoiceProgrammingStatus: async () => {
    validateChannel('voice-programming-status');
    return await ipcRenderer.invoke('voice-programming-status');
  },

  // AI Voice Command
  aiVoiceCommand: async (audioBuffer, options = {}) => {
    validateChannel('ai-voice-command');
    // Validar audioBuffer
    if (!audioBuffer || (typeof audioBuffer !== 'string' && !Buffer.isBuffer(audioBuffer))) {
      throw new Error('Invalid audio buffer format');
    }
    // Limitar tamaño (10MB máximo)
    const bufferSize = typeof audioBuffer === 'string' 
      ? Buffer.from(audioBuffer, 'base64').length 
      : audioBuffer.length;
    if (bufferSize > 10 * 1024 * 1024) {
      throw new Error('Audio buffer too large (max 10MB)');
    }
    return await ipcRenderer.invoke('ai-voice-command', audioBuffer, options);
  },

  // AI Voice Commands Status
  getAIVoiceCommandsStatus: async () => {
    validateChannel('ai-voice-commands-status');
    return await ipcRenderer.invoke('ai-voice-commands-status');
  },

  // Event Listeners (solo lectura, no se puede enviar)
  on: (channel, callback) => {
    if (channel.startsWith('orchestrator-')) {
      ipcRenderer.on(channel, callback);
    } else {
      throw new Error(`Event channel "${channel}" not allowed`);
    }
  },

  removeListener: (channel, callback) => {
    if (channel.startsWith('orchestrator-')) {
      ipcRenderer.removeListener(channel, callback);
    }
  }
};

// Exponer al renderer
try {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  console.log('[PRELOAD] ========================================');
  console.log('[PRELOAD] ✅ electronAPI exposed to window.electronAPI');
  console.log('[PRELOAD] Methods exposed:', Object.keys(electronAPI));
  console.log('[PRELOAD] resetServices available:', 'resetServices' in electronAPI);
  console.log('[PRELOAD] Secure IPC bridge initialized');
  console.log('[PRELOAD] ========================================');
} catch (error) {
  console.error('[PRELOAD] ❌ Error exposing electronAPI:', error);
  console.error('[PRELOAD] Error details:', error.message, error.stack);
  // Fallback: exponer directamente si contextBridge falla (no recomendado pero necesario)
  try {
    if (typeof window !== 'undefined') {
      window.electronAPI = electronAPI;
      console.log('[PRELOAD] ⚠️ Fallback: electronAPI exposed directly to window');
      console.log('[PRELOAD] This may indicate Context Isolation is disabled');
    }
  } catch (fallbackError) {
    console.error('[PRELOAD] ❌ Fallback also failed:', fallbackError);
  }
}

