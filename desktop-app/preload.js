const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sandraAPI', {
  // restore manager
  restoreList: () => ipcRenderer.invoke('restore:list'),
  restoreCreate: (label) => ipcRenderer.invoke('restore:create', label),
  restoreApply: (tag) => ipcRenderer.invoke('restore:apply', tag),
  restoreSetMode: (mode) => ipcRenderer.invoke('restore:set-mode', mode),

  // Conversational lifecycle helpers (if handled in main)
  speechEnded: () => ipcRenderer.invoke('speech-ended'),
  startConversationalCall: () => ipcRenderer.invoke('start-conversational-call'),
  endConversationalCall: () => ipcRenderer.invoke('end-conversational-call'),

  // STT / transcripts and alarms
  onSTTConnectionChange: (cb) => ipcRenderer.on('stt-connection-change', (_e, payload) => cb(payload)),
  onTranscriptUpdate: (cb) => ipcRenderer.on('transcript:update', (_e, payload) => cb(payload)),

  // Alarmas (archivo/API/rol)
  onAlarm: (cb) => {
    try { ipcRenderer.removeAllListeners('alarm:event'); } catch {}
    ipcRenderer.on('alarm:event', (_e, payload) => { try { cb(payload); } catch {} });
  }
,
  // Multimodal control
  startMultimodalConversation: (opts) => ipcRenderer.invoke('start-multimodal-conversation', opts),
  stopMultimodalConversation: () => ipcRenderer.invoke('stop-multimodal-conversation'),
  multimodalSendVoice: (buffer, meta) => ipcRenderer.invoke('multimodal-send-voice', buffer, meta),
  sendAudioStream: (b64) => ipcRenderer.invoke('send-audio-stream', b64),
});


