const { contextBridge, ipcRenderer } = require('electron');

// Ringback global, expuesto en window para evitar ReferenceError en cualquier renderer
let __ringEl = null;
function __startRing() {
  try {
    if (!__ringEl) {
      __ringEl = new Audio('assets/audio/ringback.ogg');
      __ringEl.loop = true;
      __ringEl.volume = 0.18;
    }
    __ringEl.currentTime = 0;
    __ringEl.play().catch(()=>{});
    console.log('▶ ringback');
  } catch (e) { console.warn('ringback err', e); }
}
function __stopRing() {
  try { __ringEl && __ringEl.pause(); console.log('⏹ ringback'); } catch {}
}
// Expón funciones exactamente con estos nombres para que el código existente las encuentre
contextBridge.exposeInMainWorld('startRingtone', __startRing);
contextBridge.exposeInMainWorld('stopRingtone', __stopRing);

contextBridge.exposeInMainWorld('sandraAPI', {
  // restore manager
  restoreList: () => ipcRenderer.invoke('restore:list'),
  restoreCreate: (label) => ipcRenderer.invoke('restore:create', label),
  restoreApply: (tag) => ipcRenderer.invoke('restore:apply', tag),
  restoreSetMode: (mode) => ipcRenderer.invoke('restore:set-mode', mode),
  // Auto-recovery
  autoRecoverySet: (on) => ipcRenderer.invoke('auto-recovery:set', on),
  autoRecoveryGet: () => ipcRenderer.invoke('auto-recovery:get'),

  // Conversational lifecycle helpers (if handled in main)
  speechEnded: () => ipcRenderer.invoke('speech-ended'),
  startConversationalCall: () => ipcRenderer.invoke('start-conversational-call'),
  endConversationalCall: () => ipcRenderer.invoke('end-conversational-call'),

  // STT / transcripts and alarms
  onSTTConnectionChange: (cb) => {
    try { ipcRenderer.removeAllListeners('stt:conn'); } catch {}
    ipcRenderer.on('stt:conn', (_e, payload) => { try { cb(payload); } catch {} });
  },
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
  
  // CallCenter
  ccListRoutes: () => ipcRenderer.invoke('cc:listRoutes'),
  ccStartByRole: (roleId, sessionId) => ipcRenderer.invoke('cc:startByRole', { roleId, sessionId }),
  ccStartByCampaign: (campaignId, sessionId) => ipcRenderer.invoke('cc:startByCampaign', { campaignId, sessionId }),
  ccEnd: (sessionId) => ipcRenderer.invoke('cc:end', { sessionId }),
});


