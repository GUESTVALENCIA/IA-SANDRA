const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const { existsSync } = require('fs');

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('[Main] ❌ Uncaught Exception:', error);
  console.error('[Main] Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Main] ❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
// AI Gateway experimental (aislado)
let AIGateway;
try {
  AIGateway = require('../experimental/ai-gateway/gateway');
} catch (e) {
  console.warn('[Main] AI Gateway experimental no disponible:', e.message);
  AIGateway = null;
}

// ==== CallCenter ====
let CallCenter;
let callCenter;
try {
  CallCenter = require('../callcenter/service');
} catch (e) {
  console.warn('[Main] CallCenter no disponible:', e.message);
  CallCenter = null;
}

// --- Utils git ---
function sh(cmd, cwd) {
  return execSync(cmd, { cwd, stdio: 'pipe', encoding: 'utf8' }).trim();
}
function repoRoot() {
  // Asume que main.js vive en desktop-app/, sube 1 nivel
  const root = path.resolve(__dirname, '..');
  const git = existsSync(path.join(root, '.git')) ? root : sh('git rev-parse --show-toplevel');
  return git;
}

let mainWindow;
function createWindow() {
  console.log('[Main] Creando ventana...');
  try {
  mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false, // No mostrar hasta que esté lista
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      }
    });

    // Manejar errores de carga
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('[Main] Error cargando:', errorCode, errorDescription, validatedURL);
    });

    mainWindow.webContents.on('crashed', () => {
      console.error('[Main] Renderer process crashed');
    });

    // Mostrar ventana cuando esté lista
    mainWindow.once('ready-to-show', () => {
      console.log('[Main] Ventana lista, mostrando...');
      mainWindow.show();
      mainWindow.focus();
    });

    const indexPath = path.join(__dirname, 'renderer', 'index.html');
    console.log('[Main] Cargando:', indexPath);
    
    if (!existsSync(indexPath)) {
      console.error('[Main] index.html no encontrado en:', indexPath);
      const fallbackPath = path.join(__dirname, '..', 'index.html');
      if (existsSync(fallbackPath)) {
        console.log('[Main] Usando fallback:', fallbackPath);
        mainWindow.loadFile(fallbackPath).catch(err => {
          console.error('[Main] Error cargando fallback:', err);
        });
        } else {
        console.error('[Main] No se encontró ningún index.html');
        mainWindow.loadURL('data:text/html,<h1>Error: index.html no encontrado</h1>');
      }
    } else {
      mainWindow.loadFile(indexPath).catch(err => {
        console.error('[Main] Error cargando index.html:', err);
        // Fallback
        try {
          const fallbackPath = path.join(__dirname, '..', 'index.html');
          if (existsSync(fallbackPath)) {
            mainWindow.loadFile(fallbackPath);
          }
        } catch (e) {
          console.error('[Main] Error en fallback:', e);
        }
      });
    }

    // Abrir DevTools en desarrollo
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
      mainWindow.webContents.openDevTools();
    }
  } catch (err) {
    console.error('[Main] Error creando ventana:', err);
  }
}

app.whenReady().then(() => {
  console.log('[Main] ✅ Electron app ready');
  console.log('[Main] Directorio actual:', __dirname);
  console.log('[Main] AIGateway disponible:', AIGateway !== null);
  console.log('[Main] CallCenter disponible:', CallCenter !== null);
  createWindow();
  // Arrancar vigilancia y eventos de API al inicializar
  try { watchCritical(); } catch (e) { console.warn('watchCritical failed:', e.message); }
  try { tapServiceApiEvents(); } catch (e) { console.warn('tapServiceApiEvents failed:', e.message); }
  // Inicializar CallCenter
  if (CallCenter) {
    try {
      // Si tienes un serviceManager global, pásalo; si no, este ctor funciona igual
      const mm = global.serviceManager?.get?.('multimodal');
      const rs = global.serviceManager?.get?.('roles-system');
      callCenter = new CallCenter({ 
        serviceManager: global.serviceManager, 
        multimodal: mm,
        rolesSystem: rs
      });
      console.log('✅ CallCenter inicializado');
    } catch (e) { console.warn('CallCenter init failed:', e.message); }
  } else {
    console.warn('⚠️ CallCenter no disponible (módulo no encontrado)');
  }
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// ============ RESTORE MANAGER IPC ============
let RESTORE_MODE = 'safe'; // 'safe' | 'hard'
let AUTO_RECOVERY_ENABLED = true;

ipcMain.handle('restore:list', async () => {
  const root = repoRoot();
  try {
    const out = sh(`git for-each-ref refs/tags/rp --format="%(refname:short)|%(objectname)|%(taggerdate:iso8601)|%(subject)"`, root);
    const items = (out ? out.split('\n') : []).map(line => {
      const [tag, sha, date, meta] = line.split('|');
      return { tag: tag.replace(/^rp\//,''), sha, date, meta };
    });
    return { success: true, items };
      } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('restore:create', async (_evt, label) => {
  const root = repoRoot();
  try {
    const ts = new Date();
    const pad = n=>String(n).padStart(2,'0');
    const name = `rp/${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}${label?'-'+String(label).replace(/\s+/g,'_'):''}`;
    const sha = sh('git rev-parse HEAD', root);
    const meta = JSON.stringify({ type:'restore_point', created_at:ts.toISOString(), sha, label }, null, 2);
    sh(`git tag -a "${name}" -m '${meta}'`, root);
    sh('git push --tags', root);
    return { success: true, tag: name.replace(/^rp\//,''), sha };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('restore:set-mode', async (_evt, mode) => {
  RESTORE_MODE = (mode === 'hard') ? 'hard' : 'safe';
  return { success: true, mode: RESTORE_MODE };
});

ipcMain.handle('restore:apply', async (_evt, tag) => {
  const root = repoRoot();
  try {
    sh('git fetch --all --tags', root);
    const full = tag.startsWith('rp/') ? tag : `rp/${tag}`;
    const sha = sh(`git rev-list -n 1 "${full}"`, root);
    if (RESTORE_MODE === 'hard') {
      sh(`git reset --hard "${sha}"`, root);
      sh('git clean -fd', root);
      sh('git push --force', root);
      return { success: true, mode: 'hard', sha };
    }
    // SAFE
    sh(`git read-tree --reset -u "${sha}^{tree}"`, root);
    sh(`git commit -m "restore: apply snapshot ${full} (${sha.substring(0,7)})"`, root);
    sh(`git push`, root);
    return { success: true, mode: 'safe', sha };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Auto-recovery ON/OFF
ipcMain.handle('auto-recovery:set', async (_e, on) => {
  AUTO_RECOVERY_ENABLED = !!on;
  return { success:true, enabled: AUTO_RECOVERY_ENABLED };
});
ipcMain.handle('auto-recovery:get', async () => ({ success:true, enabled: AUTO_RECOVERY_ENABLED }));


// -------------------- Alarmas: vigilancia de archivos críticos --------------------

const CRITICAL_FILES = [
  'desktop-app/main.js',
  'desktop-app/preload.js',
  'desktop-app/renderer/index.html',
  'services/multimodal-conversation-service.js',
  'services/deepgram-service.js',
  'services/cartesia-service.js',
  'core/roles-system.js',
  'vercel-app/public/index.html',
  'vercel-app/vercel.json'
].map(p => path.resolve(repoRoot(), p));

function sha256(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }
let baseline = new Map();
function snapshotBaseline() {
  baseline.clear();
  for (const f of CRITICAL_FILES) {
    try {
      const h = sha256(fs.readFileSync(f));
      baseline.set(f, h);
    } catch {}
  }
}

function emitAlarm(payload) {
  try { mainWindow?.webContents.send('alarm:event', payload); } catch {}
  try { autoRecoveryMaybe(payload); } catch {}
}

function watchCritical() {
  snapshotBaseline();
  for (const f of CRITICAL_FILES) {
    try {
      fs.watch(f, { persistent: true }, (_ev, _fname) => {
        setTimeout(() => {
          let status = 'modified', oldH = baseline.get(f), newH = null;
          try { newH = sha256(fs.readFileSync(f)); } catch { status = 'deleted'; }
          emitAlarm({ type:'file', status, path: f, oldHash: oldH, newHash: newH, ts: Date.now(), message: `Archivo crítico ${status}: ${path.relative(repoRoot(), f)}` });
          if (newH) baseline.set(f, newH);
        }, 60);
      });
    } catch {}
  }
}

// -------------------- Puente para alarmas de API --------------------

function tapServiceApiEvents() {
  try {
    const multimodal = global.serviceManager?.get?.('multimodal') || (global.serviceManager && global.serviceManager.get && global.serviceManager.get('multimodal'));
    const deepgram = global.serviceManager?.get?.('deepgram') || (global.serviceManager && global.serviceManager.get && global.serviceManager.get('deepgram'));
    const cartesia = global.serviceManager?.get?.('cartesia') || (global.serviceManager && global.serviceManager.get && global.serviceManager.get('cartesia'));
    const counters = { deepgram:[], cartesia:[], sttCloses:[] };

    deepgram?.on?.('stt:open', () => emitAlarm({ type:'api', service:'deepgram', status:'open', ts:Date.now(), message:'Deepgram conectado' }));
    deepgram?.on?.('stt:close', () => {
      emitAlarm({ type:'api', service:'deepgram', status:'close', ts:Date.now(), message:'Deepgram cerrado' });
      const now = Date.now();
      counters.sttCloses.push(now);
      counters.sttCloses = counters.sttCloses.filter(t => now - t <= 90000);
      if (counters.sttCloses.length >= 3) emitAlarm({ type:'policy', status:'stt_unstable', ts:now, message:'STT inestable (3 cierres/≤90s)' });
    });
    deepgram?.on?.('api:error', (e) => {
      emitAlarm({ type:'api', service:'deepgram', status:'error', detail:String(e&&e.message||e), ts:Date.now(), message:'Deepgram error' });
      const now = Date.now();
      counters.deepgram.push(now);
      counters.deepgram = counters.deepgram.filter(t => now - t <= 60000);
      if (counters.deepgram.length >= 3) emitAlarm({ type:'policy', status:'asr_errors', service:'deepgram', ts:now, message:'ASR errores repetidos (≥3/≤60s)' });
    });
    cartesia?.on?.('api:error', (e) => {
      emitAlarm({ type:'api', service:'cartesia', status:'error', detail:String(e&&e.message||e), ts:Date.now(), message:'Cartesia error' });
      const now = Date.now();
      counters.cartesia.push(now);
      counters.cartesia = counters.cartesia.filter(t => now - t <= 60000);
      if (counters.cartesia.length >= 3) emitAlarm({ type:'policy', status:'tts_errors', service:'cartesia', ts:now, message:'TTS errores repetidos (≥3/≤60s)' });
    });
    multimodal?.on?.('role:changed', ({ sessionId, roleId }) => emitAlarm({ type:'role', status:'changed', sessionId, roleId, ts:Date.now(), message:`Cambio de rol activo: ${roleId}` }));
  } catch {}
}

// --- Estrategia de auto-restauración ---
function getLatestSnapshotTag() {
  try {
    const root = repoRoot();
    const lines = sh(`git for-each-ref refs/tags/rp --format="%(refname:short)" | sort -r`, root).split('\n').filter(Boolean);
    return (lines[0] || '').replace(/^rp\//, '');
  } catch { return null; }
}

function autoRestoreNow(reason='auto') {
  if (!AUTO_RECOVERY_ENABLED) return;
  const tag = getLatestSnapshotTag();
  if (!tag) return;
  try {
    const root = repoRoot();
    sh('git fetch --all --tags', root);
    const full = tag.startsWith('rp/') ? tag : `rp/${tag}`;
    const sha = sh(`git rev-list -n 1 "${full}"`, root);
    if (RESTORE_MODE === 'hard') {
      sh(`git reset --hard "${sha}"`, root);
      sh('git clean -fd', root);
      sh('git push --force', root);
    } else {
      sh(`git read-tree --reset -u "${sha}^{tree}"`, root);
      sh(`git commit -m "auto-restore(${reason}): ${full} (${sha.substring(0,7)})"`, root);
      sh(`git push`, root);
    }
    emitAlarm({ type:'restore', status:RESTORE_MODE, ts:Date.now(), message:`Auto-restore por ${reason} → ${full}` });
  } catch (e) {
    emitAlarm({ type:'restore', status:'failed', ts:Date.now(), message:`Auto-restore fallido (${reason}): ${e.message}` });
  }
}

function autoRecoveryMaybe(a) {
  if (!AUTO_RECOVERY_ENABLED) return;
  if (a.type==='file' && a.status==='deleted') return autoRestoreNow('file_deleted');
  if (a.type==='policy' && (a.status==='asr_errors' || a.status==='tts_errors')) return autoRestoreNow(a.status);
  if (a.type==='policy' && a.status==='stt_unstable') return autoRestoreNow('stt_unstable');
}

// -------------------- IPC helpers for conversational lifecycle (optional) --------------------
ipcMain.handle('speech-ended', async () => {
  try {
    const multimodal = global.serviceManager?.get?.('multimodal');
    if (multimodal && typeof multimodal.speechEnded === 'function') {
      multimodal.speechEnded();
    }
    return { success: true };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('start-conversational-call', async () => {
  try {
    const multimodal = global.serviceManager?.get?.('multimodal');
    if (multimodal && typeof multimodal.startConversation === 'function') {
      return multimodal.startConversation({ mode: 'voice', continuous: false });
    }
    return { success: false, error: 'Multimodal service not available' };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('end-conversational-call', async () => {
  try {
    const multimodal = global.serviceManager?.get?.('multimodal');
    if (multimodal && typeof multimodal.stopConversation === 'function') {
      return multimodal.stopConversation();
    }
    return { success: false, error: 'Multimodal service not available' };
  } catch (e) { return { success: false, error: e.message }; }
});

// Multimodal full handlers (used by renderer)
ipcMain.handle('start-multimodal-conversation', async (_e, { mode = 'text', continuous = false, userId = null } = {}) => {
  try {
    const multimodal = global.serviceManager?.get?.('multimodal');
    const deepgram = global.serviceManager?.get?.('deepgram');
    if (!multimodal) return { success: false, error: 'Multimodal service not available' };

    // Forward STT connection events to renderer
    if (deepgram) {
      deepgram.on?.('stt:open', () => { try { mainWindow?.webContents.send('stt-connection-change', { connected: true }); } catch {} });
      deepgram.on?.('stt:close', () => { try { mainWindow?.webContents.send('stt-connection-change', { connected: false }); } catch {} });
      deepgram.on?.('transcript', (payload) => { try { mainWindow?.webContents.send('transcript:update', payload); } catch {} });
    }

    if (typeof multimodal.startConversation === 'function') {
      return await multimodal.startConversation({ mode, continuous, userId });
    } else if (typeof multimodal.startMultimodalConversation === 'function') {
      return await multimodal.startMultimodalConversation({ mode, continuous, userId });
    } else {
      return { success: false, error: 'Multimodal start not implemented' };
    }
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('stop-multimodal-conversation', async () => {
  try {
    const multimodal = global.serviceManager?.get?.('multimodal');
    if (!multimodal) return { success: false, error: 'Multimodal service not available' };
    if (typeof multimodal.stopConversation === 'function') return await multimodal.stopConversation();
    if (typeof multimodal.stopMultimodalConversation === 'function') return await multimodal.stopMultimodalConversation();
    return { success: false, error: 'Multimodal stop not implemented' };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('multimodal-send-voice', async (_e, buffer, meta) => {
  try {
    const multimodal = global.serviceManager?.get?.('multimodal');
    if (!multimodal) return { success: false, error: 'Multimodal service not available' };
    if (typeof multimodal.sendVoice === 'function') return await multimodal.sendVoice(buffer, meta);
    if (typeof multimodal.multimodalSendVoice === 'function') return await multimodal.multimodalSendVoice(buffer, meta);
    return { success: false, error: 'sendVoice not implemented' };
  } catch (e) { return { success: false, error: e.message }; }
});

ipcMain.handle('send-audio-stream', async (_e, b64) => {
  try {
    const deepgram = global.serviceManager?.get?.('deepgram');
    if (deepgram && typeof deepgram.sendAudioToLive === 'function') {
      try { deepgram.sendAudioToLive(Buffer.from(b64, 'base64')); } catch (e) { return { success: false, error: String(e) }; }
    return { success: true };
    }
    return { success: false, error: 'Deepgram not available' };
  } catch (e) { return { success: false, error: e.message }; }
});

// ---- IPC CallCenter ----
ipcMain.handle('cc:listRoutes', async () => {
  try { 
    if (!callCenter) return { success: false, error: 'CallCenter not initialized' };
    return { success: true, data: callCenter.listRoutes() }; 
  } catch(e){ return { success: false, error: e.message }; }
});

// ---- IPC: AI Gateway (EXPERIMENTAL) ----
ipcMain.handle('ai:listModels', async () => {
  try {
    if (!AIGateway) {
      return { success: false, error: 'AI Gateway experimental no disponible' };
    }
    const list = AIGateway.listModels();
    return { success: true, models: list };
  } catch (e) { 
    console.error('[AI:ListModels] Error:', e);
    return { success: false, error: e.message }; 
  }
});

ipcMain.handle('ai:chat', async (_e, { provider, model, messages }) => {
  try {
    if (!AIGateway) {
      return { success: false, error: 'AI Gateway experimental no disponible' };
    }
    if (!provider || !model || !messages) {
      return { success: false, error: 'provider, model y messages son requeridos' };
    }
    const res = await AIGateway.chat({ provider, model, messages });
    return { success: true, text: res.text, raw: res.raw };
  } catch (e) { 
    console.error('[AI:Chat] Error:', e);
    return { success: false, error: e.message }; 
  }
});

ipcMain.handle('cc:startByRole', async (_evt, { roleId, sessionId }) => {
  try {
    if (!callCenter) return { success: false, error: 'CallCenter not initialized' };
    const sid = sessionId || `cc_${Date.now()}`;
    const r = await callCenter.startByRole({ sessionId: sid, roleId });
    return { success: true, ...r };
  } catch(e){ return { success: false, error: e.message }; }
});

ipcMain.handle('cc:startByCampaign', async (_evt, { campaignId, sessionId }) => {
  try {
    if (!callCenter) return { success: false, error: 'CallCenter not initialized' };
    const sid = sessionId || `cc_${Date.now()}`;
    const r = await callCenter.startByCampaign({ sessionId: sid, campaignId });
    return { success: true, ...r };
  } catch(e){ return { success: false, error: e.message }; }
});

ipcMain.handle('cc:end', async (_evt, { sessionId }) => {
  try { 
    if (!callCenter) return { success: false, error: 'CallCenter not initialized' };
    const r = await callCenter.end({ sessionId }); 
    return { success: true, ...r }; 
  } catch(e){ return { success: false, error: e.message }; }
});


