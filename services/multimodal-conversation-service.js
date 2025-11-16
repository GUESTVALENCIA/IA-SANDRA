const path = require('path');
const fs = require('fs');
const DeepgramService = require('./deepgram-service');
const CartesiaService = require('./cartesia-service');
const HeyGenService = require('./heygen-service');
const LipSyncService = require('./lipsync-service');
const BrightDataService = require('./bright-data-service');

// WebRTC Manager opcional (para lip-sync avanzado)
let WebRTCAvatarManager;
try {
  WebRTCAvatarManager = require('./webrtc-avatar-manager');
} catch (e) {
  WebRTCAvatarManager = null;
  console.warn('⚠️ WebRTCAvatarManager no disponible (opcional)');
}

/**
 * CORE MULTIMODAL CONVERSATIONAL SERVICE - Sandra IA 8.0 Pro
 * Enterprise-level servicio multimodal con:
 * - GPT-4o para voz/video/avatar (conversacional completo)
 * - GPT-4o-mini para texto (rápido y eficiente)
 * - Barge-in en tiempo real
 * - Modo continuo (sin clicks)
 * - Lip-sync avanzado (HeyGen + futuro Sora)
 */
class MultimodalConversationService {
  constructor(aiGateway, db) {
    if (!aiGateway) {
      throw new Error('MultimodalConversationService requiere aiGateway');
    }

    this.deepgram = new DeepgramService();
    this.cartesia = new CartesiaService();
    this.heygen = new HeyGenService();
    this.lipsync = new LipSyncService();
    this.webrtcManager = WebRTCAvatarManager ? new WebRTCAvatarManager() : null;
    this.brightData = new BrightDataService();

    this.aiGateway = aiGateway;
    this.db = db;
    
    // Estado de sesión
    this.sessionId = null;
    this.userId = null;
    this.currentMode = 'text'; // 'text' | 'voice' | 'video' | 'avatar'
    
    // Estado de conversación
    this.sessionActive = false;
    this.isListening = false;
    this.isThinking = false;
    this.isSpeaking = false;
    
    // Barge-in y continuous mode
    this.bargeInEnabled = true;
    this.continuousMode = false;
    this.lastBargeInAt = null;
    this.bargeInInProgress = false;
    
    // Transcripts
    this.currentTranscript = '';
    this.interimTranscript = '';
    
    // Avatar / Lip-sync
    this.avatarProvider = 'heygen'; // futuro: 'sora'
    this.avatarLipSyncEnabled = true;

    // Datos en vivo de alojamientos (para controlar respuesta de voz)
    this.lastLiveAccommodationData = null;
    this.lastLiveGuests = null;
    
    // Callbacks para frontend
    this.onTranscriptUpdate = null;
    this.onResponseReady = null;
    this.onAvatarSpeaking = null;
    this.onLipSyncFrame = null;
    this.onSessionState = null;
    this.onError = null;

    // Bufferización de audio para Deepgram (reduce cierres por frames muy pequeños)
    this._audioQueue = [];
    this._audioFlushTimer = null;
    this._audioFlushIntervalMs = 40; // ~25 fps de audio
    
    console.log('✅ Multimodal Conversation Service inicializado (Enterprise)');
  }

  /**
   * Iniciar conversación multimodal
   * @param {Object} options
   * @param {'text'|'voice'|'video'|'avatar'} [options.mode='text']
   * @param {boolean} [options.continuous=false]
   * @param {string} [options.userId]
   * @param {Object} [options.callbacks]
   */
  async startConversation(options = {}) {
    const {
      mode = 'text',
      continuous = false,
      userId = null,
      callbacks = {}
    } = options;

    try {
      this.currentMode = mode;
      this.continuousMode = !!continuous;
      this.userId = userId || this.userId;
      this.sessionId = this.sessionId || `session_${Date.now()}`;

      this._bindCallbacks(callbacks);

      this.sessionActive = true;
      this.isListening = mode !== 'text';
      this.isThinking = false;
      this.isSpeaking = false;

      this._emitSessionState();

      // Deepgram Live para voz/video/avatar
      if (mode === 'voice' || mode === 'video' || mode === 'avatar') {
        await this._ensureDeepgramLive();
      }

      // Avatar/WebRTC para avatar o video
      if ((mode === 'avatar' || mode === 'video') && this.avatarProvider === 'heygen') {
        await this._initAvatarSession();
      }

      // Inactividad: colgar llamada si no hay actividad
      this._resetIdleTimer();

      return {
        success: true,
        message: 'Conversación multimodal iniciada',
        mode: this.currentMode,
        sessionId: this.sessionId,
        avatarConfig: mode === 'avatar' || mode === 'video' ? this.heygen.getWebRTCConfig() : null
      };
    } catch (error) {
      console.error('Error iniciando conversación:', error);
      this._emitError(error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Callback de Deepgram Live - Maneja transcripciones + barge-in + continuous mode
   */
  async handleTranscript(data) {
    const { transcript, isFinal, confidence } = data || {};
    const normalized = (transcript || '').trim();
    if (!normalized) return;

    // actividad detectada → resetear temporizador
    this._resetIdleTimer();

    // Barge-in: detectar interrupciones incluso en transcripciones intermedias
    if (!isFinal && this.isSpeaking && this.bargeInEnabled) {
      await this._handlePotentialBargeIn(normalized);
    }

    if (isFinal) {
      this.currentTranscript = normalized;
      this.interimTranscript = '';
      
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate({
          transcript: normalized,
          isFinal: true,
          confidence
        });
      }

      // Continuous mode: respuesta automática sin clicks
      if (this.sessionActive && normalized) {
        await this._processFinalTranscript(normalized);
      }
    } else {
      // Transcripción intermedia
      this.interimTranscript = normalized;
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate({
          transcript: normalized,
          isFinal: false,
          confidence
        });
      }
    }
  }

  /**
   * Procesar transcripción final y generar respuesta
   */
  async _processFinalTranscript(transcript) {
    this.isThinking = true;
    this._emitSessionState();

    try {
      // Selección automática de modelo según modo
      const model = (this.currentMode === 'text') ? 'gpt-4o-mini' : 'gpt-4o';

      // Integración Bright Data en voz/video: inyectar datos cuando detecte consulta de alojamientos
      let inputForLLM = transcript;
      try {
        const isAccommodationQuery = /alojamiento|alojamientos|apartamento|hotel|hostal|disponibil|reserva|habita|precio|valencia|montanejos/i.test(transcript);
        if (isAccommodationQuery && this.brightData && typeof this.brightData.getMyAccommodations === 'function') {
          // Intento simple: estimar huéspedes por números en texto
          const guestsMatch = transcript.match(/(\d+)\s*(personas|personas|adultos?)/i);
          const guests = guestsMatch ? parseInt(guestsMatch[1], 10) : 2;
          const liveData = await this.brightData.getMyAccommodations(null, null, guests);
          if (liveData && liveData.success && Array.isArray(liveData.accommodations)) {
            inputForLLM = `${transcript}\n\n[DATOS EN TIEMPO REAL DE GUESTS-VALENCIA]:\n${JSON.stringify(liveData, null, 2)}\n\nINSTRUCCIONES: Usa EXCLUSIVAMENTE estos datos para responder. Presenta opciones con precio/ubicación/disponibilidad si están presentes.`;
          }
        }
      } catch {}

      const response = await this.aiGateway.generateResponse(
        inputForLLM,
        'openai',
        model,
        {
          mode: this.currentMode,
          sessionId: this.sessionId,
          userId: this.userId
        }
      );

      // Sobre-escritura controlada cuando hay datos live (solo alojamientos propios)
      let finalText = response;
      if (this.lastLiveAccommodationData && this.lastLiveAccommodationData.success) {
        finalText = this._composeAccommodationReply(this.lastLiveAccommodationData, this.lastLiveGuests);
      }

      await this._logMessages(transcript, finalText);

      // TTS en streaming dúplex (preferred) o fallback a generateSpeech
      let ttsAudio = null;
      this._ttsController = null;
      if (this.currentMode === 'voice' || this.currentMode === 'video' || this.currentMode === 'avatar') {
        const spoken = this._sanitizeForSpeech(finalText);
        try {
          // Intentar streaming dúplex: cartesia.streamSpeechDuplex(text, onChunk, options)
          const ctrl = await this.cartesia.streamSpeechDuplex(spoken, (chunk) => {
            // chunk es Buffer; emitir al frontend vía callback onResponseReady con streaming flag
            try {
              const b64 = Buffer.from(chunk).toString('base64');
              if (this.onResponseReady) {
                this.onResponseReady({ text: finalText, audioChunk: b64, streaming: true });
              }
            } catch (e) { /* ignore */ }
          }, { voiceId: this.cartesia.voiceId, speed: 0.78, emotion: [{ id: 'warm', strength: 0.6 }] });
          if (ctrl && ctrl.success) {
            this._ttsController = ctrl;
            // Mark speaking state while streaming
            this.isSpeaking = true;
            this._emitSessionState();
            // Wait until controller ends - controller.stop will be called by stopSpeaking or on finish by cartesia stream end
            // Note: cartesia stream signals handled via callback; we don't block here.
          } else {
            // Fallback: synchronous generateSpeech
            const ttsResult = await this.cartesia.generateSpeech(spoken, { voiceId: this.cartesia.voiceId, speed: 0.78, emotion: [{ id: 'warm', strength: 0.6 }] });
            ttsAudio = ttsResult?.audioBuffer || null;
          }
        } catch (e) {
          // Fallback robusto
          try {
            const ttsResult = await this.cartesia.generateSpeech(spoken, { voiceId: this.cartesia.voiceId, speed: 0.78, emotion: [{ id: 'warm', strength: 0.6 }] });
            ttsAudio = ttsResult?.audioBuffer || null;
          } catch (err) {
            console.warn('TTS fallback failed:', err.message);
          }
        }
      }

      this.isThinking = false;
      this._emitSessionState();

      // Lip-sync avanzado opcional (engine externo) si hay audio y avatar/video
      let syncedVideoPath = null;
      if (this.avatarLipSyncEnabled && ttsAudio && (this.currentMode === 'avatar' || this.currentMode === 'video') && this.lipsync && this.lipsync.enabled) {
        try {
          const sourceVideo = this.lipsyncSourceVideo || process.env.LIPSYNC_SOURCE_VIDEO;
          if (sourceVideo && fs.existsSync(sourceVideo)) {
            const sync = await this.lipsync.generateSyncedVideo(sourceVideo, ttsAudio);
            if (sync.success) {
              syncedVideoPath = sync.videoPath;
            }
          }
        } catch (e) {
          // Ignorar errores de lip-sync externo para no romper la llamada
        }
      }

      this._emitResponse({ text: finalText, audioBuffer: ttsAudio, syncedVideoPath });

      // Lip-sync de animación rápida (pseudo) para overlays si no hubo video sincronizado
      if (!syncedVideoPath && this.avatarLipSyncEnabled && ttsAudio && (this.currentMode === 'avatar' || this.currentMode === 'video')) {
        await this.handleLipSyncFrame(ttsAudio);
      }

      // actividad de salida (voz) → resetear temporizador
      this._resetIdleTimer();
    } catch (error) {
      this.isThinking = false;
      this._emitSessionState();
      this._emitError(error);
    }
  }

  /**
   * Enviar mensaje de texto → GPT-4o-mini
   */
  async sendText(text, { userId } = {}) {
    if (!text || !text.trim()) return { success: false, error: 'Texto vacío' };

    const clean = text.trim();
    this.currentMode = 'text';
    this.userId = userId || this.userId;
    this.isThinking = true;
    this._emitSessionState();

    try {
      const response = await this.aiGateway.generateResponse(
        clean,
        'openai',
        'gpt-4o-mini',
        {
          mode: 'text',
          sessionId: this.sessionId,
          userId: this.userId
        }
      );

      await this._logMessages(clean, response);

      this.isThinking = false;
      this._emitSessionState();

      this._emitResponse({ text: response, audioBuffer: null });

      return { success: true, text: response };
    } catch (error) {
      this.isThinking = false;
      this._emitSessionState();
      this._emitError(error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar mensaje de voz (buffer ~30s) → Deepgram STT + GPT-4o + Cartesia TTS
   */
  async sendVoice(audioBuffer, { userId } = {}) {
    if (!audioBuffer) return { success: false, error: 'audioBuffer vacío' };

    this.currentMode = 'voice';
    this.userId = userId || this.userId;
    this.isThinking = true;
    this._emitSessionState();

    try {
      // STT con Deepgram
      const sttResult = await this.deepgram.transcribeBuffer(audioBuffer, 'audio/webm');
      if (!sttResult || !sttResult.success) {
        throw new Error(`Deepgram STT error: ${sttResult?.error || 'desconocido'}`);
      }

      const transcript = (sttResult.transcript || '').trim();
      if (!transcript) {
        throw new Error('Transcripción vacía');
      }

      // GPT-4o para voz (inyectando datos live si aplica)
      let inputForLLM = transcript;
      try {
        const isAccommodationQuery = /alojamiento|alojamientos|apartamento|hotel|hostal|disponibil|reserva|habita|precio|valencia|montanejos/i.test(transcript);
        if (isAccommodationQuery && this.brightData && typeof this.brightData.getMyAccommodations === 'function') {
          const guestsMatch = transcript.match(/(\d+)\s*(personas|personas|adultos?)/i);
          const guests = guestsMatch ? parseInt(guestsMatch[1], 10) : 2;
          const liveData = await this.brightData.getMyAccommodations(null, null, guests);
          if (liveData && liveData.success && Array.isArray(liveData.accommodations)) {
            this.lastLiveAccommodationData = liveData;
            this.lastLiveGuests = guests;
            inputForLLM = `${transcript}\n\n[DATOS EN TIEMPO REAL DE GUESTS-VALENCIA]:\n${JSON.stringify(liveData, null, 2)}\n\nINSTRUCCIONES: Responde de forma conversacional (sin listas ni emojis), breve y directa, usando estos datos.`;
          }
        }
      } catch {}

      const response = await this.aiGateway.generateResponse(
        inputForLLM,
        'openai',
        'gpt-4o',
        {
          mode: 'voice',
          sessionId: this.sessionId,
          userId: this.userId
        }
      );

      // Si hay datos live, componer respuesta controlada SOLO con nuestros alojamientos
      let finalText = response;
      if (this.lastLiveAccommodationData && this.lastLiveAccommodationData.success) {
        finalText = this._composeAccommodationReply(this.lastLiveAccommodationData, this.lastLiveGuests);
      }

      await this._logMessages(transcript, finalText);

      // TTS con Cartesia (saneado para voz)
      const spoken = this._sanitizeForSpeech(finalText);
      const ttsResult = await this.cartesia.generateSpeech(spoken, { voiceId: this.cartesia.voiceId, speed: 0.78, emotion: [{ id: 'warm', strength: 0.6 }] });
      const ttsAudio = ttsResult?.audioBuffer || null;

      this.isThinking = false;
      this._emitSessionState();

      this._emitResponse({ text: finalText, audioBuffer: ttsAudio });

      // Lip-sync si hay avatar
      if (this.avatarLipSyncEnabled && ttsAudio) {
        await this.handleLipSyncFrame(ttsAudio);
      }

      return { success: true, text: response };
    } catch (error) {
      this.isThinking = false;
      this._emitSessionState();
      this._emitError(error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Hacer que el avatar hable (TTS + Avatar + Lip-sync)
   */
  async speak(text) {
    try {
      this.isSpeaking = true;

      if (this.onAvatarSpeaking) {
        this.onAvatarSpeaking({ speaking: true, text });
      }

      // Generar TTS con Cartesia
      const ttsResult = await this.cartesia.generateSpeech(this._sanitizeForSpeech(text));
      const audioBuffer = ttsResult?.audioBuffer || null;

      // Emitir hacia el frontend para reproducción inmediata del saludo (independiente de HeyGen)
      if (audioBuffer) {
        this._emitResponse({ text, audioBuffer, syncedVideoPath: null });
      }

      // HeyGen avatar (no bloquear si falla)
      let heygenResult = { success: false };
      try {
        heygenResult = await this.heygen.speak(text);
      } catch (e) {
        console.warn('HeyGen speak error (saludo):', e.message);
      }

      // Lip-sync avanzado
      if (this.avatarLipSyncEnabled && audioBuffer) {
        await this.handleLipSyncFrame(audioBuffer);
      }

      // Esperar duración estimada
      if (heygenResult.success && heygenResult.duration) {
        await this.sleep(heygenResult.duration * 1000);
      }

      this.isSpeaking = false;
      this.isListening = true;

      if (this.onAvatarSpeaking) {
        this.onAvatarSpeaking({ speaking: false, text: '' });
      }

      return {
        success: true,
        message: 'Avatar habló correctamente'
      };
    } catch (error) {
      console.error('Error al hacer hablar al avatar:', error);
      this.isSpeaking = false;
      this._emitError(error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Detener respuesta actual (Barge-in)
   * @param {boolean} interrupted - Si es true, envía 'interrupt' en vez de 'stop'
   */
  async stopSpeaking(interrupted = false) {
    if (!this.isSpeaking && !interrupted) {
      return { success: true, message: 'No había respuesta activa' };
    }

    try {
      this.isSpeaking = false;
      // Detener controlador de stream si existe
      try { if (this._ttsController && typeof this._ttsController.stop === 'function') this._ttsController.stop(); } catch {}
      // Detener Cartesia (por seguridad)
      try { if (this.cartesia && typeof this.cartesia.stop === 'function') this.cartesia.stop(); } catch {}

      // Detener HeyGen (interrupt o stop)
      try {
        await this.heygen.speak('', interrupted ? 'interrupt' : 'stop');
      } catch (e) {
        console.warn('HeyGen speak(stop/interrupt) error:', e.message);
      }

      this.isListening = true;
      this._emitSessionState();

      console.log('✅ Respuesta detenida' + (interrupted ? ' por barge-in' : ''));

      return {
        success: true,
        message: 'Respuesta detenida'
      };
    } catch (error) {
      this._emitError(error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Manejar barge-in potencial en tiempo real
   */
  async _handlePotentialBargeIn(transcript) {
    const now = Date.now();
    const cooldownMs = 3500;  // Más margen entre interrupciones
    const holdMs = 1000;      // Requiere ~1s de voz sostenida antes de cortar TTS

    if (this.bargeInInProgress) return;
    if (this.lastBargeInAt && now - this.lastBargeInAt < cooldownMs) return;

    // Solo activar barge-in si el transcript tiene suficiente contenido
    // (evita interrupciones por ruido o palabras sueltas)
    const words = transcript.trim().split(/\s+/);
    if (words.length < 4) {
      // Menos de 3 palabras → probablemente ruido o inicio de frase
      return;
    }

    // Ventana de retención: esperar ~1s de habla continua antes de interrumpir
    if (!this._bargeHoldStartAt) this._bargeHoldStartAt = now;
    const elapsedHold = now - this._bargeHoldStartAt;
    if (elapsedHold < holdMs) {
      // Aún no se cumple el tiempo sostenido: no interrumpir
      return;
    }
    // Reset para próxima detección
    this._bargeHoldStartAt = null;

    this.bargeInInProgress = true;
    this.lastBargeInAt = now;

    try {
      console.log(`🔄 Barge-in detectado (${words.length} palabras). Interrumpiendo TTS/avatar…`);
      await this.stopSpeaking(true);
    } catch (error) {
      this._emitError(error);
    } finally {
      this.bargeInInProgress = false;
    }
  }

  /**
   * Enviar audio al stream de Deepgram Live
   */
  sendAudioData(audioData) {
    if (!this.deepgram.isLiveConnected()) {
      console.warn('Deepgram no está conectado (live). Audio ignorado.');
      return;
    }

    // Aceptar múltiples formatos: Buffer/ArrayBuffer/View/Base64
    const buffer = this._normalizeAudioBuffer(audioData);
    if (!buffer) {
      console.warn('Formato de audio no soportado en sendAudioData');
      return;
    }

    // Encolar y enviar en lotes para mayor estabilidad
    this._audioQueue.push(buffer);
    if (!this._audioFlushTimer) {
      this._audioFlushTimer = setTimeout(() => {
        try {
          const totalLen = this._audioQueue.reduce((acc, b) => acc + b.length, 0);
          const merged = Buffer.concat(this._audioQueue, totalLen);
          this._audioQueue = [];
          this.deepgram.sendAudioToLive(merged);
        } catch (e) {
          console.warn('Error al enviar lote de audio:', e.message);
        } finally {
          this._audioFlushTimer = null;
        }
      }, this._audioFlushIntervalMs);
    }
  }

  /**
   * Activar/desactivar Barge-in
   */
  setBargeIn(enabled) {
    this.bargeInEnabled = !!enabled;
    console.log(`Barge-in ${enabled ? 'activado' : 'desactivado'}`);
    this._emitSessionState();
  }

  /**
   * Activar/desactivar modo continuo
   */
  setContinuousMode(enabled) {
    this.continuousMode = !!enabled;
    console.log(`Continuous mode ${enabled ? 'activado' : 'desactivado'}`);
    this._emitSessionState();
  }

  /**
   * Activar/desactivar lip-sync de avatar
   */
  setAvatarLipSyncEnabled(enabled) {
    this.avatarLipSyncEnabled = !!enabled;
    this._emitSessionState();
  }

  /**
   * Detener conversación multimodal
   */
  async stopConversation() {
    this.sessionActive = false;
      this.isListening = false;
    this.isThinking = false;
      this.isSpeaking = false;

    this._emitSessionState();

    try {
      // Siempre detener Deepgram Live
      try {
        await this.deepgram.stopLiveTranscription();
      } catch (e) {
        console.warn('Deepgram stopLiveTranscription error:', e.message);
      }

      try {
      await this.heygen.stop();
      } catch (e) {
        console.warn('HeyGen stop error:', e.message);
      }

      if (this.webrtcManager) {
        try {
          this.webrtcManager.close();
        } catch (e) {
          console.warn('WebRTC manager close error:', e.message);
        }
      }

      return {
        success: true,
        message: 'Conversación detenida'
      };
    } catch (error) {
      this._emitError(error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener estado completo de la conversación
   */
  getStatus() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      mode: this.currentMode,
      sessionActive: this.sessionActive,
      isListening: this.isListening,
      isThinking: this.isThinking,
      isSpeaking: this.isSpeaking,
      bargeInEnabled: this.bargeInEnabled,
      continuousMode: this.continuousMode,
      avatarLipSyncEnabled: this.avatarLipSyncEnabled,
      deepgramConnected: this.deepgram.isLiveConnected(),
      heygenStreaming: this.heygen.getIsStreaming()
    };
  }

  /**
   * Manejar frame de lip-sync avanzado
   */
  async handleLipSyncFrame(audioBuffer) {
    if (!audioBuffer || !this.avatarLipSyncEnabled) return;

    if (this.avatarProvider === 'heygen' && this.webrtcManager && typeof this.webrtcManager.generateLipSyncFrames === 'function') {
      this.webrtcManager.generateLipSyncFrames(audioBuffer, (frame) => {
        if (this.onLipSyncFrame) this.onLipSyncFrame(frame);
      });
    }

    // Futuro: provider === 'sora' → mapping audio→frames para vídeos Sora
  }

  /**
   * Manejar errores de Deepgram
   */
  handleError(error) {
    this._emitError(new Error('Deepgram Live: ' + (error?.message || error)));
  }

  /**
   * Inicializar sesión de avatar
   */
  async _initAvatarSession() {
    const avatarSession = await this.heygen.createStreamingSession();
    if (!avatarSession || !avatarSession.success) {
      throw new Error('No se pudo iniciar sesión de avatar HeyGen');
    }

    if (this.webrtcManager && typeof this.webrtcManager.initializeConnection === 'function') {
      const { sdp, iceServers, sessionId } = avatarSession.session || {};
      await this.webrtcManager.initializeConnection(
        { sdp, iceServers, sessionId },
        'heygen-avatar-video' // id del <video> en la UI
      );
    }
  }

  /**
   * Asegurar que Deepgram Live está activo
   */
  async _ensureDeepgramLive() {
    if (this.deepgram.isLiveConnected()) return;
    // Emitir estado cuando Deepgram cambie
    if (typeof this.deepgram.setStatusCallback === 'function') {
      this.deepgram.setStatusCallback(() => {
        this._emitSessionState();
      });
    }
    await this.deepgram.startLiveTranscription(
      this.handleTranscript.bind(this),
      this.handleError.bind(this)
    );
    // Estado inicial tras iniciar
    this._emitSessionState();
  }

  /**
   * Bind callbacks
   */
  _bindCallbacks(callbacks) {
    this.onTranscriptUpdate = callbacks.onTranscriptUpdate || null;
    this.onResponseReady = callbacks.onResponseReady || null;
    this.onAvatarSpeaking = callbacks.onAvatarSpeaking || null;
    this.onLipSyncFrame = callbacks.onLipSyncFrame || null;
    this.onSessionState = callbacks.onSessionState || null;
    this.onError = callbacks.onError || null;
  }

  /**
   * Emitir estado de sesión
   */
  _emitSessionState() {
    if (this.onSessionState) {
      this.onSessionState(this.getStatus());
    }
  }

  /**
   * Emitir respuesta
   */
  _emitResponse({ text, audioBuffer, syncedVideoPath }) {
    if (this.onResponseReady) {
      this.onResponseReady({ text, audioBuffer, syncedVideoPath });
    }
  }

  /**
   * Saneado de texto para voz (no leer emojis ni numeraciones de listas)
   * - Elimina emojis y pictogramas
   * - Quita prefijos de lista: "1. ", "2) ", "- ", "• ", "* "
   * - Normaliza espacios y signos repetidos
   */
  _sanitizeForSpeech(text) {
    if (!text) return '';
    // Eliminar bloques de metadatos (por si acaso llegan) tipo [DATOS ...]
    let out = text.replace(/\[[^\]]+\]/g, ' ');
    // Quitar emojis/pictogramas comunes
    out = out.replace(/[\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}]/gu, '');
    // Procesar por líneas para quitar prefijos de lista
    const lines = out.split(/\r?\n+/).map(l => {
      return l
        .replace(/^\s*[\-\*\u2022]\s+/g, '')       // "- ", "* ", "• "
        .replace(/^\s*\(?\d+\)?[\.\)]\s+/g, '')    // "1. ", "2) ", "(3) "
        .trim();
    }).filter(Boolean);
    out = lines.join('. ');
    // Normalizaciones
    out = out
      .replace(/\s{2,}/g, ' ')     // espacios múltiples
      .replace(/[\.!\?]{2,}/g, '.') // signos repetidos
      .replace(/\s*([,.;:])\s*/g, '$1 ') // espacios alrededor de puntuación
      .replace(/\s+\./g, '.')      // espacio antes del punto
      .trim();
    return out;
  }

  /**
   * Componer una respuesta breve SOLO con nuestros alojamientos (sin listas)
   */
  _composeAccommodationReply(liveData, guests) {
    try {
      const accs = Array.isArray(liveData.accommodations) ? liveData.accommodations.slice(0, 3) : [];
      const parts = accs.map(a => {
        const n = a.name || 'Alojamiento';
        const loc = a.location ? `, ${a.location}` : '';
        const p = a.price ? `, desde ${a.price}` : '';
        return `${n}${loc}${p}`.trim();
      }).filter(Boolean);
      const g = guests ? ` para ${guests} personas` : '';
      if (parts.length === 0) return `Puedo verificar disponibilidad${g}. ¿Qué fechas exactas necesitas?`;
      const joined = parts.join(' | ');
      return `Opciones Guests‑Valencia${g}: ${joined}. ¿Confirmas fechas para verificar disponibilidad en tiempo real?`;
    } catch {
      return `Puedo verificar disponibilidad. ¿Qué fechas exactas necesitas?`;
    }
  }

  /**
   * Emitir error
   */
  _emitError(error) {
    console.error('[MultimodalConversationService] Error:', error);
    if (this.onError) {
      this.onError(error);
    }
  }

  /**
   * Establecer video fuente de Sora para lip-sync
   */
  setLipSyncSourceVideo(filePath) {
    this.lipsyncSourceVideo = filePath;
  }

  /**
   * Temporizador de inactividad para colgar llamada
   * - No cierra permisos de micrófono; solo detiene sesión STT/LLM/TTS
   */
  _resetIdleTimer() {
    const idleMs = Number(process.env.CALL_IDLE_TIMEOUT_MS || 45000); // 45s por defecto
    try { if (this._idleTimer) clearTimeout(this._idleTimer); } catch {}
    this._idleTimer = setTimeout(async () => {
      try {
        if (this.sessionActive) {
          console.log(`⏱️ Llamada colgada por inactividad (${idleMs}ms)`);
          await this.stopConversation();
        }
      } catch (e) {
        this._emitError(e);
      }
    }, idleMs);
  }

  /**
   * Log mensajes en DB
   */
  async _logMessages(userText, assistantText) {
    if (!this.db || typeof this.db.logMessage !== 'function') return;
    try {
      await this.db.logMessage(this.sessionId, userText, 'user');
      await this.db.logMessage(this.sessionId, assistantText, 'assistant');
    } catch (e) {
      console.warn('Neon logMessage error:', e.message);
    }
  }

  /**
   * Normalizar audio buffer
   */
  _normalizeAudioBuffer(audioData) {
    if (!audioData) return null;
    // Caso: objeto Buffer serializado { type: 'Buffer', data: [...] }
    if (audioData && audioData.type === 'Buffer' && Array.isArray(audioData.data)) {
      try { return Buffer.from(audioData.data); } catch { /* ignore */ }
    }
    if (Buffer.isBuffer(audioData)) return audioData;
    if (audioData instanceof ArrayBuffer) return Buffer.from(audioData);
    if (ArrayBuffer.isView(audioData)) {
      return Buffer.from(audioData.buffer, audioData.byteOffset, audioData.byteLength);
    }
    if (typeof audioData === 'string') {
      return Buffer.from(audioData, 'base64');
    }
    return null;
  }

  /**
   * Utilidad: Sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = MultimodalConversationService;

