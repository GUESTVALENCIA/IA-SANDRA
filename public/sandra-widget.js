/**
 * SANDRA IA 7.0 - WIDGET EMBEBIBLE
 * Widget flotante para embeber en cualquier sitio web
 *
 * Uso:
 * <script src="https://guestsvalencia.es/sandra-widget.js"></script>
 *
 * Para Sandrita d - GuestsValencia
 * CALIDAD: GALAXY LEVEL PRO ENTERPRISE
 */

(function() {
  'use strict';

  // CONFIGURACIÓN DEL WIDGET
  const CONFIG = {
    NETLIFY_BASE: (window.SANDRA_CONFIG && window.SANDRA_CONFIG.nettylifyBase) || window.location.origin,
    ROLE: (window.SANDRA_CONFIG && window.SANDRA_CONFIG.role) || 'guests-valencia',
    LOCALE: (window.SANDRA_CONFIG && window.SANDRA_CONFIG.locale) || 'es-ES',
    POSITION: (window.SANDRA_CONFIG && window.SANDRA_CONFIG.position) || 'bottom-right',
    THEME: (window.SANDRA_CONFIG && window.SANDRA_CONFIG.theme) || 'light',
    AUTO_OPEN: (window.SANDRA_CONFIG && window.SANDRA_CONFIG.autoOpen) || false
  };

  // ESTADO
  const state = {
    isOpen: !!CONFIG.AUTO_OPEN,
    isConnected: false,
    isListening: false,
    recognition: null,
    messages: [],
    history: []
  };

  // UI CREATION
  function createWidget() {
    const container = document.createElement('div');
    container.id = 'sandra-widget';
    container.className = 'sandra-widget';
    container.setAttribute('data-position', CONFIG.POSITION);

    container.innerHTML = `
      <div class="sandra-widget-container">
        <button class="sandra-widget-button" id="sandra-widget-button" aria-label="Abrir Sandra IA">
          <span class="sr-only">Abrir Sandra IA</span>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="sandra-widget-badge hidden" id="sandra-widget-badge">1</span>
        </button>

        <div class="sandra-widget-panel" id="sandra-widget-panel">
          <div class="sandra-widget-header">
            <div class="sandra-widget-title">
              <h3>Sandra IA</h3>
              <p>Asistente 24/7</p>
            </div>
            <button class="sandra-widget-close" id="sandra-widget-close" aria-label="Cerrar">×</button>
          </div>

          <div class="sandra-widget-transcription" id="sandra-widget-transcription">Listo</div>

          <div class="sandra-widget-messages" id="sandra-widget-messages">
            <div class="sandra-widget-message assistant">
              <div class="sandra-widget-message-avatar">🤖</div>
              <div class="sandra-widget-message-content">
                <p>¡Hola! Soy Sandra, asistente de GuestsValencia. ¿Cómo te puedo ayudar?</p>
                <span class="sandra-widget-message-time">Ahora</span>
              </div>
            </div>
          </div>

          <div class="sandra-widget-controls">
            <button class="sandra-widget-voice-btn" id="sandra-widget-voice" aria-label="Hablar">🎤</button>
            <button class="sandra-widget-connect-btn" id="sandra-widget-connect" aria-label="Conectar">Conectar</button>
          </div>

          <div class="sandra-widget-input-area">
            <input type="text" class="sandra-widget-input" id="sandra-widget-input" placeholder="Escribe..." aria-label="Escribe tu mensaje" />
            <button class="sandra-widget-send" id="sandra-widget-send" aria-label="Enviar">Enviar</button>
          </div>

          <div class="sandra-widget-status" id="sandra-widget-status">Desconectado</div>
        </div>
      </div>

      <style>
        .sandra-widget { --primary: #00ff88; --text: #333; --light: #f8fafc; --border: #e2e8f0; }
        .sandra-widget * { box-sizing: border-box; }
        .sandra-widget-container { position: fixed; z-index: 99999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .sandra-widget[data-position="bottom-right"] .sandra-widget-container { bottom: 20px; right: 20px; }
        .sandra-widget[data-position="bottom-left"] .sandra-widget-container { bottom: 20px; left: 20px; }
        .sandra-widget[data-position="top-right"] .sandra-widget-container { top: 20px; right: 20px; }
        .sandra-widget[data-position="top-left"] .sandra-widget-container { top: 20px; left: 20px; }

        .sandra-widget-button { width: 60px; height: 60px; border-radius: 50%; background: #0a0a0a; color: #fff; border: 1px solid #222; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; transition: transform .2s; }
        .sandra-widget-button:hover { transform: scale(1.06); }
        .sandra-widget-badge { position: absolute; top: -6px; right: -6px; background: #ef4444; color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .sandra-widget-badge.hidden { display: none; }

        .sandra-widget-panel { position: absolute; bottom: 80px; right: 0; width: 360px; max-height: 600px; background: #fff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,.16); display: none; flex-direction: column; opacity: 0; transform: scale(.95) translateY(10px); transition: all .2s; overflow: hidden; }
        .sandra-widget-panel.open { display: flex; opacity: 1; transform: scale(1) translateY(0); }
        .sandra-widget[data-position="bottom-left"] .sandra-widget-panel { right: auto; left: 0; }
        .sandra-widget[data-position="top-right"] .sandra-widget-panel, .sandra-widget[data-position="top-left"] .sandra-widget-panel { bottom: auto; top: 80px; }

        .sandra-widget-header { background: #0a0a0a; color: #fff; padding: 14px; display: flex; justify-content: space-between; align-items: center; }
        .sandra-widget-title h3 { margin: 0 0 2px 0; font-size: 16px; }
        .sandra-widget-title p { margin: 0; font-size: 12px; color: #aaa; }
        .sandra-widget-close { background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; }

        .sandra-widget-transcription { padding: 8px 12px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #666; min-height: 18px; border-left: 3px solid var(--primary); }

        .sandra-widget-messages { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
        .sandra-widget-message { display: flex; gap: 8px; }
        .sandra-widget-message.user { justify-content: flex-end; }
        .sandra-widget-message-avatar { font-size: 18px; }
        .sandra-widget-message-content { max-width: 72%; background: #f1f5f9; border-radius: 10px; padding: 8px 12px; }
        .sandra-widget-message.user .sandra-widget-message-content { background: #00ff88; color: #0a0a0a; }
        .sandra-widget-message-time { font-size: 11px; color: #999; }

        .sandra-widget-controls { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
        .sandra-widget-voice-btn, .sandra-widget-connect-btn { flex: 1; padding: 8px; border: 2px solid #0a0a0a; background: #fff; color: #0a0a0a; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .sandra-widget-voice-btn.active { background: #0a0a0a; color: #00ff88; border-color: #0a0a0a; }

        .sandra-widget-input-area { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #e2e8f0; }
        .sandra-widget-input { flex: 1; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
        .sandra-widget-send { padding: 8px 12px; background: #00ff88; color: #0a0a0a; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }

        .sandra-widget-status { padding: 8px 12px; background: #f1f5f9; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666; text-align: center; }

        @media (max-width: 480px) { .sandra-widget-panel { width: calc(100vw - 40px); max-height: calc(100vh - 100px); } .sandra-widget-message-content { max-width: 85%; } }
      </style>
    `;

    document.body.appendChild(container);
    setupEventListeners(container);
  }

  // EVENTOS
  function setupEventListeners(container) {
    const panel = container.querySelector('#sandra-widget-panel');
    const btn = container.querySelector('#sandra-widget-button');
    const closeBtn = container.querySelector('#sandra-widget-close');
    const input = container.querySelector('#sandra-widget-input');
    const sendBtn = container.querySelector('#sandra-widget-send');
    const connectBtn = container.querySelector('#sandra-widget-connect');
    const voiceBtn = container.querySelector('#sandra-widget-voice');

    btn.addEventListener('click', () => {
      state.isOpen = !state.isOpen;
      panel.classList.toggle('open', state.isOpen);
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.isOpen = false;
      panel.classList.remove('open');
    });

    sendBtn.addEventListener('click', () => sendMessage(container, input.value));
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage(container, input.value);
        input.value = '';
      }
    });

    connectBtn.addEventListener('click', () => connect(container));
    voiceBtn.addEventListener('click', () => toggleVoice(container));
  }

  // CONEXIÓN
  async function connect(container) {
    try {
      const health = await fetch(`${CONFIG.NETLIFY_BASE}/.netlify/functions/health`);
      if (health.ok) {
        state.isConnected = true;
        updateStatus(container, '✅ Conectado');
      } else {
        throw new Error('Health check failed');
      }
    } catch (e) {
      console.error('Conexión fallida:', e);
      state.isConnected = false;
      updateStatus(container, '❌ Error de conexión');
    }
  }

  // MENSAJES
  let typingNode = null;
  async function sendMessage(container, text) {
    const input = container.querySelector('#sandra-widget-input');
    const messages = container.querySelector('#sandra-widget-messages');
    const status = container.querySelector('#sandra-widget-status');

    if (!text || !text.trim()) return;

    // Mensaje usuario
    const userMsg = document.createElement('div');
    userMsg.className = 'sandra-widget-message user';
    userMsg.innerHTML = `
      <div class="sandra-widget-message-content">
        <p>${escapeHtml(text)}</p>
        <span class="sandra-widget-message-time">Ahora</span>
      </div>
    `;
    messages.appendChild(userMsg);
    messages.scrollTop = messages.scrollHeight;

    // Historial
    state.history.push({ role: 'user', content: text });

    // Indicador escribiendo
    typingNode = document.createElement('div');
    typingNode.className = 'sandra-widget-message assistant';
    typingNode.innerHTML = `
      <div class="sandra-widget-message-avatar">🤖</div>
      <div class="sandra-widget-message-content"><p>Escribiendo...</p></div>
    `;
    messages.appendChild(typingNode);
    messages.scrollTop = messages.scrollHeight;

    try {
      const resp = await fetch(`${CONFIG.NETLIFY_BASE}/.netlify/functions/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sandra-Role': CONFIG.ROLE
        },
        body: JSON.stringify({
          messages: state.history.slice(-20),
          locale: CONFIG.LOCALE,
          mode: 'dev',
          role: CONFIG.ROLE
        })
      });

      if (typingNode) typingNode.remove();

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      state.history.push({ role: 'assistant', content: data.text });

      const assistantMsg = document.createElement('div');
      assistantMsg.className = 'sandra-widget-message assistant';
      assistantMsg.innerHTML = `
        <div class="sandra-widget-message-avatar">🤖</div>
        <div class="sandra-widget-message-content">
          <p>${escapeHtml(data.text)}</p>
          <span class="sandra-widget-message-time">Ahora</span>
        </div>
      `;
      messages.appendChild(assistantMsg);
      messages.scrollTop = messages.scrollHeight;

      if (!state.isConnected) {
        state.isConnected = true;
        updateStatus(container, '✅ Conectado');
      }

      status.textContent = `Proveedor: ${data.provider || 'GROQ/Claude'}`;
    } catch (e) {
      if (typingNode) typingNode.remove();
      const errorMsg = document.createElement('div');
      errorMsg.className = 'sandra-widget-message assistant';
      errorMsg.innerHTML = `
        <div class="sandra-widget-message-avatar">⚠️</div>
        <div class="sandra-widget-message-content">
          <p>Error de conexión. Reinténtalo.</p>
          <span class="sandra-widget-message-time">Ahora</span>
        </div>
      `;
      messages.appendChild(errorMsg);
      messages.scrollTop = messages.scrollHeight;
      state.isConnected = false;
      updateStatus(container, '❌ Desconectado');
    } finally {
      input.value = '';
    }
  }

  // VOZ
  function toggleVoice(container) {
    const voiceBtn = container.querySelector('#sandra-widget-voice');
    const transcription = container.querySelector('#sandra-widget-transcription');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      updateStatus(container, '⚠️ Voz no disponible');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!state.recognition) {
      state.recognition = new SpeechRecognition();
      state.recognition.lang = CONFIG.LOCALE;
      state.recognition.continuous = false;
      state.recognition.interimResults = true;

      state.recognition.onresult = (e) => {
        let text = '';
        let final = false;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
          if (e.results[i].isFinal) final = true;
        }
        transcription.textContent = text || 'Escuchando...';
        if (final && text.trim()) {
          sendMessage(container, text.trim());
          toggleVoice(container);
        }
      };

      state.recognition.onerror = () => {
        toggleVoice(container);
      };

      state.recognition.onend = () => {
        if (state.isListening) toggleVoice(container);
      };
    }

    if (state.isListening) {
      state.isListening = false;
      voiceBtn.classList.remove('active');
      state.recognition.stop();
      transcription.textContent = 'Listo';
    } else {
      try {
        state.isListening = true;
        voiceBtn.classList.add('active');
        state.recognition.start();
        transcription.textContent = '🎤 Escuchando...';
      } catch (e) {
        state.isListening = false;
        voiceBtn.classList.remove('active');
        updateStatus(container, '⚠️ Error iniciando voz');
      }
    }
  }

  // UTILIDADES
  function updateStatus(container, text) {
    const status = container.querySelector('#sandra-widget-status');
    if (status) status.textContent = text;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"]+/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  }

  // INIT
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
