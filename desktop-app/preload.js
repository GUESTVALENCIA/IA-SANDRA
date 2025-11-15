const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sandraAPI', {
  // ==================== CHAT Y MENSAJES ====================
  sendMessage: (message, role, mode = 'text') => ipcRenderer.invoke('send-message', { message, role, mode }),
  
  // ==================== ROLES ====================
  getAllRoles: () => ipcRenderer.invoke('get-all-roles'),
  activateRole: (roleName) => ipcRenderer.invoke('activate-role', { roleName }),
  deactivateRole: (roleName) => ipcRenderer.invoke('deactivate-role', { roleName }),
  getActiveRoles: () => ipcRenderer.invoke('get-active-roles'),
  executeWithRole: (roleName, task) => ipcRenderer.invoke('execute-with-role', { roleName, task }),
  
  // ==================== MCP (MODULAR CONTROL PANEL) ====================
  mcpDeploy: (projectConfig) => ipcRenderer.invoke('mcp-deploy', { projectConfig }),
  mcpGenerateCode: (task, role, language) => ipcRenderer.invoke('mcp-generate-code', { task, role, language }),
  mcpSyncGitHub: () => ipcRenderer.invoke('mcp-sync-github'),
  mcpExecuteCommand: (command, cwd) => ipcRenderer.invoke('mcp-execute-command', { command, cwd }),
  mcpSpawnAgent: (role, config) => ipcRenderer.invoke('mcp-spawn-agent', { role, config }),
  mcpGetAgents: () => ipcRenderer.invoke('mcp-get-agents'),
  
  // ==================== LIVE UPDATER ====================
  checkUpdates: () => ipcRenderer.invoke('check-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  
  // ==================== TAREAS ====================
  executeTask: (task, role) => ipcRenderer.invoke('execute-task', { task, role }),
  validateRole: (role, task) => ipcRenderer.invoke('validate-role', { role, task }),
  
  // ==================== NEGOCIACIÓN ====================
  negotiateAccommodation: (accommodationData) => ipcRenderer.invoke('negotiate-accommodation', { accommodationData }),
  
  // ==================== BÚSQUEDA ====================
  searchAccommodations: (destination, checkIn, checkOut, guests) => ipcRenderer.invoke('search-accommodations', { destination, checkIn, checkOut, guests }),
  getMyAccommodations: (checkIn, checkOut, guests) => ipcRenderer.invoke('get-my-accommodations', { checkIn, checkOut, guests }),
  
  // ==================== VENTAS ====================
  processSale: (saleData) => ipcRenderer.invoke('process-sale', { saleData }),
  
  // ==================== LLAMADAS ====================
  makePhoneCall: (phoneNumber, message) => ipcRenderer.invoke('make-phone-call', { phoneNumber, message }),
  
  // ==================== ESTADÍSTICAS ====================
  getStats: () => ipcRenderer.invoke('get-stats'),
  
  // ==================== PROVEEDOR LLM ====================
  getCurrentProvider: () => ipcRenderer.invoke('get-current-provider'),
  getAvailableProviders: () => ipcRenderer.invoke('get-available-providers'),
  setProvider: (provider) => ipcRenderer.invoke('set-provider', { provider }),
  
  // ==================== MULTIMODAL ====================
  transcribeAudio: (audioPath) => ipcRenderer.invoke('transcribe-audio', { audioPath }),
  transcribeBuffer: (audioBuffer, mimeType) => ipcRenderer.invoke('transcribe-buffer', { audioBuffer, mimeType }),
  generateSpeech: (text, options) => ipcRenderer.invoke('generate-speech', { text, options }),
  
  // Conversación multimodal completa
  startMultimodalConversation: (options = {}) => ipcRenderer.invoke('start-multimodal-conversation', options),
  stopMultimodalConversation: () => ipcRenderer.invoke('stop-multimodal-conversation'),
  
  // Envío de mensajes
  multimodalSendText: (text, userId) => ipcRenderer.invoke('multimodal-send-text', { text, userId }),
  multimodalSendVoice: (audioBuffer, userId) => ipcRenderer.invoke('multimodal-send-voice', { audioBuffer, userId }),
  
  // Streaming de audio
  sendAudioStream: (audioData) => ipcRenderer.invoke('send-audio-stream', { audioData }),
  
  // Control de modos
  setBargeIn: (enabled) => ipcRenderer.invoke('set-barge-in', { enabled }),
  setContinuousMode: (enabled) => ipcRenderer.invoke('set-continuous-mode', { enabled }),
  getMultimodalStatus: () => ipcRenderer.invoke('get-multimodal-status'),

  // SOS
  triggerSOS: () => ipcRenderer.invoke('trigger-sos'),

  // Sistema
  getSystemStatus: () => ipcRenderer.invoke('get-system-status'),
  
  // Avatar
  avatarSpeak: (text) => ipcRenderer.invoke('avatar-speak', { text }),
  createAvatarSession: () => ipcRenderer.invoke('create-avatar-session'),
  stopAvatar: () => ipcRenderer.invoke('stop-avatar'),
  
  // ==================== EVENTOS ====================
  onServicesReady: (callback) => ipcRenderer.on('services-ready', (event, data) => callback(data)),
  onServicesError: (callback) => ipcRenderer.on('services-error', (event, data) => callback(data)),
  
  // Eventos multimodales
  onTranscriptUpdate: (callback) => ipcRenderer.on('transcript-update', (event, data) => callback(data)),
  onResponseReady: (callback) => ipcRenderer.on('response-ready', (event, data) => callback(data)),
  onAvatarSpeaking: (callback) => ipcRenderer.on('avatar-speaking', (event, data) => callback(data)),
  onLipSyncFrame: (callback) => ipcRenderer.on('lip-sync-frame', (event, data) => callback(data)),
  onMultimodalSessionState: (callback) => ipcRenderer.on('multimodal-session-state', (event, data) => callback(data)),
  onMultimodalError: (callback) => ipcRenderer.on('multimodal-error', (event, data) => callback(data)),
  
  // Eventos de actualización
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, data) => callback(data)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, data) => callback(data))
});

console.log('✅ Sandra API completa expuesta correctamente');
console.log('📦 Funcionalidades disponibles:');
console.log('   - Chat multimodal con 18 roles');
console.log('   - MCP (Modular Control Panel)');
console.log('   - Live Updater');
console.log('   - Negociación automática');
console.log('   - Búsqueda de alojamientos');
console.log('   - Procesamiento de ventas');
console.log('   - Llamadas telefónicas');
console.log('   - Transcripción de audio');
console.log('   - Generación de voz');
console.log('   - Avatar HeyGen');
