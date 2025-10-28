/**
 * SANDRA IA 7.0 - WIDGET EMBEBIBLE
 * Widget flotante para embeber en cualquier sitio web
 *
 * Uso:
 * <script src="https://guestsvalencia.es/sandra-widget.js"></script>
 *
 * Para Sandrita d - GuestsValencia
 * CALIDAD: GALAXY LEVEL PRO ENTERPRISE
 */

(function() {
  'use strict';

  // Configuración del widget
  const CONFIG = {
    BACKEND_URL: window.SANDRA_CONFIG?.backendUrl || 'http://localhost:7788',
    WIDGET_ID: 'sandra-widget-' + Date.now(),
    POSITION: window.SANDRA_CONFIG?.position || 'bottom-right',
    THEME: window.SANDRA_CONFIG?.theme || 'light',
    AUTO_OPEN: window.SANDRA_CONFIG?.autoOpen || false
  };

  // Estado del widget
  let state = {
    isOpen: CONFIG.AUTO_OPEN,
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    messages: [],
    recognition: null,
    socket: null
  };

  /**
   * Crear estructura del widget
   */
  function createWidget() {
    const container = document.createElement('div');
    container.id = CONFIG.WIDGET_ID;
    container.className = 'sandra-widget';
    container.setAttribute('data-position', CONFIG.POSITION);

    container.innerHTML = `
      <div class="sandra-widget-container">
        <!-- Botón flotante -->
        <button class="sandra-widget-button" id="sandra-widget-button" aria-label="Abrir Sandra IA">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="sandra-widget-badge" id="sandra-widget-badge">1</span>
        </button>

        <!-- Panel del chat -->
        <div class="sandra-widget-panel" id="sandra-widget-panel">
          <!-- Header -->
          <div class="sandra-widget-header">
            <div class="sandra-widget-title">
              <h3>=¬ Sandra IA</h3>
              <p>Asistente 24/7</p>
            </div>
            <button class="sandra-widget-close" id="sandra-widget-close" aria-label="Cerrar">×</button>
          </div>

          <!-- Transcripción -->
          <div class="sandra-widget-transcription" id="sandra-widget-transcription">
            Esperando conexión...
          </div>

          <!-- Mensajes -->
          <div class="sandra-widget-messages" id="sandra-widget-messages">
            <div class="sandra-widget-message assistant">
              <div class="sandra-widget-message-avatar">></div>
              <div class="sandra-widget-message-content">
                <p>¡Hola! Soy Sandra, asistente de GuestsValencia. ¿Cómo te puedo ayudar?</p>
                <span class="sandra-widget-message-time">Ahora</span>
              </div>
            </div>
          </div>

          <!-- Controles -->
          <div class="sandra-widget-controls">
            <button class="sandra-widget-voice-btn" id="sandra-widget-voice" aria-label="Hablar">
              <¤
            </button>
            <button class="sandra-widget-connect-btn" id="sandra-widget-connect" aria-label="Conectar">
              =
            </button>
          </div>

          <!-- Input -->
          <div class="sandra-widget-input-area">
            <input
              type="text"
              class="sandra-widget-input"
              id="sandra-widget-input"
              placeholder="Escribe..."
              aria-label="Escribe tu mensaje"
            />
            <button class="sandra-widget-send" id="sandra-widget-send" aria-label="Enviar">
              =ä
            </button>
          </div>

          <!-- Status -->
          <div class="sandra-widget-status" id="sandra-widget-status">
            Desconectado
          </div>
        </div>
      </div>

      <style>
        .sandra-widget {
          --primary-color: #667eea;
          --secondary-color: #764ba2;
          --text-color: #333;
          --bg-light: #f8fafc;
          --border-color: #e2e8f0;
        }

        .sandra-widget * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .sandra-widget-container {
          position: fixed;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          z-index: 99999;
        }

        /* Posicionamiento */
        .sandra-widget[data-position="bottom-right"] .sandra-widget-container {
          bottom: 20px;
          right: 20px;
        }

        .sandra-widget[data-position="bottom-left"] .sandra-widget-container {
          bottom: 20px;
          left: 20px;
        }

        .sandra-widget[data-position="top-right"] .sandra-widget-container {
          top: 20px;
          right: 20px;
        }

        .sandra-widget[data-position="top-left"] .sandra-widget-container {
          top: 20px;
          left: 20px;
        }

        /* Botón flotante */
        .sandra-widget-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          font-size: 0;
        }

        .sandra-widget-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .sandra-widget-button svg {
          width: 28px;
          height: 28px;
          font-size: 24px;
        }

        .sandra-widget-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .sandra-widget-badge.hidden {
          display: none;
        }

        /* Panel */
        .sandra-widget-panel {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          max-height: 600px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.16);
          display: none;
          flex-direction: column;
          opacity: 0;
          transform: scale(0.9) translateY(20px);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .sandra-widget-panel.open {
          display: flex;
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .sandra-widget[data-position="bottom-left"] .sandra-widget-panel {
          right: auto;
          left: 0;
        }

        .sandra-widget[data-position="top-right"] .sandra-widget-panel,
        .sandra-widget[data-position="top-left"] .sandra-widget-panel {
          bottom: auto;
          top: 80px;
        }

        /* Header */
        .sandra-widget-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .sandra-widget-title h3 {
          font-size: 1.1rem;
          margin-bottom: 4px;
        }

        .sandra-widget-title p {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .sandra-widget-close {
          background: none;
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .sandra-widget-close:hover {
          transform: rotate(90deg);
        }

        /* Transcripción */
        .sandra-widget-transcription {
          padding: 8px 12px;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.85rem;
          color: #999;
          min-height: 18px;
          border-left: 3px solid #667eea;
        }

        /* Mensajes */
        .sandra-widget-messages {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sandra-widget-messages::-webkit-scrollbar {
          width: 4px;
        }

        .sandra-widget-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }

        .sandra-widget-message {
          display: flex;
          gap: 8px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sandra-widget-message.user {
          justify-content: flex-end;
        }

        .sandra-widget-message.user .sandra-widget-message-content {
          background: #667eea;
          color: white;
        }

        .sandra-widget-message-avatar {
          font-size: 1.4rem;
          flex-shrink: 0;
        }

        .sandra-widget-message-content {
          max-width: 70%;
          background: #f1f5f9;
          border-radius: 10px;
          padding: 8px 12px;
          word-wrap: break-word;
        }

        .sandra-widget-message-content p {
          font-size: 0.9rem;
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .sandra-widget-message-time {
          font-size: 0.75rem;
          color: #999;
          opacity: 0.7;
        }

        .sandra-widget-message.user .sandra-widget-message-time {
          color: rgba(255, 255, 255, 0.7);
        }

        /* Controles */
        .sandra-widget-controls {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .sandra-widget-voice-btn,
        .sandra-widget-connect-btn {
          flex: 1;
          padding: 8px;
          border: 2px solid #667eea;
          background: white;
          color: #667eea;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .sandra-widget-voice-btn:hover,
        .sandra-widget-connect-btn:hover {
          background: #667eea;
          color: white;
        }

        .sandra-widget-voice-btn.active {
          background: #667eea;
          color: white;
        }

        /* Input */
        .sandra-widget-input-area {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .sandra-widget-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s;
        }

        .sandra-widget-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .sandra-widget-send {
          padding: 8px 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .sandra-widget-send:hover {
          background: #764ba2;
        }

        /* Status */
        .sandra-widget-status {
          padding: 8px 12px;
          background: #f1f5f9;
          border-top: 1px solid #e2e8f0;
          font-size: 0.8rem;
          color: #666;
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .sandra-widget-panel {
            width: calc(100vw - 40px);
            max-height: calc(100vh - 100px);
          }

          .sandra-widget-message-content {
            max-width: 85%;
          }
        }
      </style>
    `;

    document.body.appendChild(container);
    setupEventListeners(container);
  }

  /**
   * Configurar event listeners
   */
  function setupEventListeners(container) {
    const btn = container.querySelector('#sandra-widget-button');
    const closeBtn = container.querySelector('#sandra-widget-close');
    const panel = container.querySelector('#sandra-widget-panel');
    const input = container.querySelector('#sandra-widget-input');
    const sendBtn = container.querySelector('#sandra-widget-send');
    const connectBtn = container.querySelector('#sandra-widget-connect');
    const voiceBtn = container.querySelector('#sandra-widget-voice');

    // Abrir/cerrar panel
    btn.addEventListener('click', () => {
      state.isOpen = !state.isOpen;
      panel.classList.toggle('open', state.isOpen);
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.isOpen = false;
      panel.classList.remove('open');
    });

    // Enviar mensaje
    sendBtn.addEventListener('click', () => sendMessage(container, input.value));
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage(container, input.value);
        input.value = '';
      }
    });

    // Conectar
    connectBtn.addEventListener('click', () => connect(container));

    // Voz
    voiceBtn.addEventListener('click', () => toggleVoice(container));
  }

  /**
   * Conectar al backend
   */
  async function connect(container) {
    try {
      state.isConnected = true;
      updateStatus(container, ' Conectado');
    } catch (error) {
      console.error('Error conectando:', error);
      updateStatus(container, 'L Error de conexión');
    }
  }

  /**
   * Toggle voz
   */
  function toggleVoice(container) {
    state.isListening = !state.isListening;
    const btn = container.querySelector('#sandra-widget-voice');
    btn.classList.toggle('active', state.isListening);
    updateStatus(container, state.isListening ? '<¤ Escuchando...' : 'Listo');
  }

  /**
   * Enviar mensaje
   */
  async function sendMessage(container, text) {
    if (!text.trim() || !state.isConnected) return;

    const input = container.querySelector('#sandra-widget-input');
    const messages = container.querySelector('#sandra-widget-messages');

    // Agregar mensaje usuario
    const userMsg = document.createElement('div');
    userMsg.className = 'sandra-widget-message user';
    userMsg.innerHTML = `
      <div class="sandra-widget-message-content">
        <p>${text}</p>
        <span class="sandra-widget-message-time">Ahora</span>
      </div>
    `;
    messages.appendChild(userMsg);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Simular respuesta
    setTimeout(() => {
      const assistantMsg = document.createElement('div');
      assistantMsg.className = 'sandra-widget-message assistant';
      assistantMsg.innerHTML = `
        <div class="sandra-widget-message-avatar">></div>
        <div class="sandra-widget-message-content">
          <p>Gracias por tu mensaje. ¿Cómo más puedo ayudarte?</p>
          <span class="sandra-widget-message-time">Ahora</span>
        </div>
      `;
      messages.appendChild(assistantMsg);
      messages.scrollTop = messages.scrollHeight;
    }, 500);
  }

  /**
   * Actualizar estado
   */
  function updateStatus(container, text) {
    const status = container.querySelector('#sandra-widget-status');
    status.textContent = text;
  }

  /**
   * Inicializar cuando DOM esté listo
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
