// ═══════════════════════════════════════════════════════════════
// SANDRA MCP PROFESSIONAL - ELECTRON PRELOAD SCRIPT
// Comunicación Segura Renderer-Main Process
// CEO: Claytis Miguel Tom Zuaznabar | GuestsValencia
// ═══════════════════════════════════════════════════════════════

const { contextBridge, ipcRenderer } = require('electron');

// API Segura para el Renderer Process
contextBridge.exposeInMainWorld('electronAPI', {
  // Información de la aplicación
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // Gestión de reportes
  saveReport: (filePath, data) => ipcRenderer.invoke('save-report', filePath, data),

  // Diálogos del sistema
  showError: (title, message) => ipcRenderer.invoke('show-error', title, message),
  showInfo: (title, message) => ipcRenderer.invoke('show-info', title, message),

  // Eventos del Main Process hacia Renderer
  onShowSettings: (callback) => {
    ipcRenderer.on('show-settings', callback);
  },

  onTestAllConnectors: (callback) => {
    ipcRenderer.on('test-all-connectors', callback);
  },

  onTestConnector: (callback) => {
    ipcRenderer.on('test-connector', callback);
  },

  onRunQualityTests: (callback) => {
    ipcRenderer.on('run-quality-tests', callback);
  },

  onTestGrammar: (callback) => {
    ipcRenderer.on('test-grammar', callback);
  },

  onExportReport: (callback) => {
    ipcRenderer.on('export-report', callback);
  },

  onShowLogs: (callback) => {
    ipcRenderer.on('show-logs', callback);
  },

  onBackendRestarted: (callback) => {
    ipcRenderer.on('backend-restarted', callback);
  },

  // Cleanup de listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// API para Sandra MCP
contextBridge.exposeInMainWorld('sandraAPI', {
  // Conectores MCP
  testConnector: async (connectorName) => {
    const response = await fetch(`http://localhost:5000/api/test/${connectorName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  // Chat con Sandra
  chatWithSandra: async (message) => {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return response.json();
  },

  // Tests de calidad
  runQualityTests: async () => {
    const response = await fetch('http://localhost:5000/api/quality/sandra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  // Test gramática específico
  testGrammar: async (text) => {
    const response = await fetch('http://localhost:5000/api/quality/grammar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return response.json();
  },

  // Estado del sistema
  getSystemHealth: async () => {
    const response = await fetch('http://localhost:5000/health');
    return response.json();
  },

  // Logs del sistema
  getSystemLogs: async () => {
    const response = await fetch('http://localhost:5000/api/logs');
    return response.json();
  },

  // Test todos los conectores
  testAllConnectors: async () => {
    const connectors = [
      'claude', 'openai', 'gemini', 'grok', 'groq', 'ollama',
      'heygen', 'elevenlabs', 'cartesia',
      'github', 'netlify',
      'twilio', 'meta',
      'paypal', 'desktop-commander'
    ];

    const results = {};
    for (const connector of connectors) {
      try {
        const result = await fetch(`http://localhost:5000/api/test/${connector}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        results[connector] = await result.json();
      } catch (error) {
        results[connector] = { success: false, error: error.message };
      }
    }
    return results;
  }
});

// API de utilidades del sistema
contextBridge.exposeInMainWorld('systemAPI', {
  // Información del entorno
  platform: process.platform,
  version: process.versions,

  // URLs útiles
  urls: {
    localhost: 'http://localhost:5000',
    health: 'http://localhost:5000/health',
    api: 'http://localhost:5000/api',
    interface: 'http://localhost:5000/frontend/sandra-mcp-interface.html'
  },

  // Configuración de conectores
  connectors: {
    ia: ['claude', 'openai', 'gemini', 'grok', 'groq', 'ollama'],
    voice: ['heygen', 'elevenlabs', 'cartesia'],
    dev: ['github', 'netlify'],
    communication: ['twilio', 'meta'],
    business: ['paypal', 'desktop-commander']
  }
});

console.log('Sandra MCP Professional - Preload script cargado correctamente');