/* UMD simple: expone helpers al window sin colisiones */
(function (root) {
  const DEFAULTS = {
    ringSrc: null,       // p.ej.: 'assets/audio/ring.mp3'
    pickupSrc: null,     // p.ej.: 'assets/audio/pickup.wav'
    hangupSrc: null,     // p.ej.: 'assets/audio/hangup.wav'
    volume: 0.55
  };

  const state = {
    inited: false,
    cfg: { ...DEFAULTS },
    ringAudio: null,
    pickupAudio: null,
    hangupAudio: null
  };

  function _makeAudio(src, loop=false) {
    if (!src) return null;
    const a = new Audio(src);
    a.preload = 'auto';
    a.loop = !!loop;
    a.volume = state.cfg.volume;
    return a;
  }

  function initCallAudio(config) {
    if (state.inited) return;
    state.cfg = { ...DEFAULTS, ...(config || {}) };
    state.ringAudio   = _makeAudio(state.cfg.ringSrc, true);
    state.pickupAudio = _makeAudio(state.cfg.pickupSrc, false);
    state.hangupAudio = _makeAudio(state.cfg.hangupSrc, false);
    state.inited = true;
    console.log('🔧 [CallCenterAudio] Inicializado');
  }

  function startRingtone() {
    if (!state.inited) initCallAudio();
    // Fallback si no hay ringSrc: pequeño "dial tone" generado
    if (state.ringAudio) {
      try { state.ringAudio.currentTime = 0; state.ringAudio.play(); } catch(e){}
    } else {
      _beepStart();
    }
  }

  function stopRingtone() {
    if (state.ringAudio) {
      try { state.ringAudio.pause(); state.ringAudio.currentTime = 0; } catch(e){}
    }
    _beepStop();
  }

  function playPickup() {
    if (!state.inited) initCallAudio();
    if (state.pickupAudio) { try { state.pickupAudio.currentTime = 0; state.pickupAudio.play(); } catch(e){} }
  }

  function playHangup() {
    if (!state.inited) initCallAudio();
    if (state.hangupAudio) { try { state.hangupAudio.currentTime = 0; state.hangupAudio.play(); } catch(e){} }
  }

  // --- Fallback: beep con WebAudio si no hay assets ---
  let _ctx = null, _osc = null, _gain = null;
  function _beepStart() {
    try {
      if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
      _osc = _ctx.createOscillator();
      _gain = _ctx.createGain();
      _osc.type = 'sine';
      _osc.frequency.value = 440;
      _gain.gain.value = 0.05;
      _osc.connect(_gain).connect(_ctx.destination);
      _osc.start();
    } catch (e) {}
  }
  function _beepStop() {
    try {
      if (_osc) { _osc.stop(); _osc.disconnect(); }
      if (_gain) _gain.disconnect();
      _osc = null; _gain = null;
    } catch (e) {}
  }

  // Exponer en window (helpers usados por index.html)
  root.CallCenterAudio = { initCallAudio, startRingtone, stopRingtone, playPickup, playHangup };
  root.initCallAudio   = initCallAudio;
  root.startRingtone   = startRingtone;
  root.stopRingtone    = stopRingtone;
  root.playPickup      = playPickup;
  root.playHangup      = playHangup;
})(window);

// Minimal ES module bridge to global helpers (ensures file exists where HTML expects it)
export function initCallAudio() {
  if (!window.__sandraCallAudio) {
    window.__sandraCallAudio = {};
  }
  if (typeof window.initCallAudio === 'function') {
    try { window.initCallAudio(); } catch(e) { console.warn('initCallAudio bridge error', e); }
  }
}

export function startRingtone() {
  if (typeof window.startRingtone === 'function') {
    try { window.startRingtone(); } catch(e) { console.warn('startRingtone bridge error', e); }
  }
}

export function stopRingtone() {
  if (typeof window.stopRingtone === 'function') {
    try { window.stopRingtone(); } catch(e) { console.warn('stopRingtone bridge error', e); }
  }
}

export function playPickup() {
  if (typeof window.playPickup === 'function') {
    try { window.playPickup(); } catch(e) { console.warn('playPickup bridge error', e); }
  }
}

export function playHangup() {
  if (typeof window.playHangup === 'function') {
    try { window.playHangup(); } catch(e) { console.warn('playHangup bridge error', e); }
  }
}
