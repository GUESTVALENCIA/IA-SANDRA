const path = require('path');
const fs = require('fs');
const os = require('os');
const { interpret } = require('xstate');
const { conversationMachine } = require('../src/fsm/conversationMachine');
const DeepgramService = require('./deepgram-service');
const CartesiaService = require('./cartesia-service');
const HeyGenService = require('./heygen-service');
const BrightDataService = require('./bright-data-service');
const EventEmitter = require('events');

// Timeout de inactividad configurable (evita "Llamada colgada por inactividad" durante backoff de STT)
const IDLE_TIMEOUT_MS = parseInt(process.env.CALL_IDLE_MS || '120000', 10);

/**
 * CORE MULTIMODAL CONVERSATIONAL SERVICE - Sandra IA 8.0 Pro
 * Enterprise-level servicio multimodal con FSM unificada
 */
class MultimodalConversationService extends EventEmitter {
  constructor(aiGateway, db) {
    super();
    if (!aiGateway) throw new Error('MultimodalConversationService requiere aiGateway');

    this.deepgram = new DeepgramService();
    this.cartesia = new CartesiaService();
    this.heygen = new HeyGenService();
    this.brightData = new BrightDataService();
    this.aiGateway = aiGateway;
    this.db = db;
    
    // Estado de sesión
    this.sessionId = null;
    this.userId = null;
    this.currentMode = 'text';
    
    // FSM - Conversation State Machine (Source of Truth)
    this.fsm = conversationMachine;
    this.fsmService = interpret(this.fsm);
    this.fsmService.start();
    
    // Estado derivado de FSM
    this.sessionActive = false;
    this.isListening = false;
    this.isThinking = false;
    this.isSpeaking = false;
    
    // Barge-in
    this.bargeInEnabled = true;
    this.lastBargeInAt = null;
    
    // Transcripts
    this.currentTranscript = '';
    this.interimTranscript = '';
    
    // Avatar
    this.avatarLipSyncEnabled = true;
    
    // Callbacks
    this.onTranscriptUpdate = null;
    this.onResponseReady = null;
    this.onSessionState = null;
    this.onError = null;

    // Suscribirse a cambios de estado FSM
    this.fsmService.onTransition((state) => {
      this._syncFSMState(state);
      this._emitSessionState();
    });

    console.log('✅ Multimodal Conversation Service inicializado con FSM');
  }

  _syncFSMState(state) {
    const currentState = state.value;
    this.isListening = currentState === 'LISTENING';
    this.isThinking = currentState === 'THINKING';
    this.isSpeaking = currentState === 'SPEAKING';
    this.sessionActive = currentState !== 'IDLE';
  }

  _emitSessionState() {
    if (this.onSessionState) {
      this.onSessionState({
        sessionId: this.sessionId,
        userId: this.userId,
        mode: this.currentMode,
        sessionActive: this.sessionActive,
        isListening: this.isListening,
        isThinking: this.isThinking,
        isSpeaking: this.isSpeaking,
        bargeInEnabled: this.bargeInEnabled,
        continuousMode: false,
        avatarLipSyncEnabled: this.avatarLipSyncEnabled,
        deepgramConnected: this.deepgram?.isConnected || false,
        heygenStreaming: false
      });
    }
  }

  async startConversation(options = {}) {
    try {
      this.sessionId = `session_${Date.now()}`;
      this.userId = options.userId || null;
      this.currentMode = options.mode || 'voice';
      
      if (this.currentMode === 'voice') {
        await this.deepgram.connectLive();
        this.deepgram.on('transcript', (data) => {
          if (this.onTranscriptUpdate) this.onTranscriptUpdate(data);
        });
      }
      
      this.fsmService.send('WAKE');
      return { success: true, sessionId: this.sessionId };
    } catch (error) {
      console.error('Error iniciando conversación:', error);
      return { success: false, error: error.message };
    }
  }

  async stopConversation() {
    try {
      if (this.deepgram.isConnected) {
        this.deepgram.stopLiveTranscription();
      }
      this.fsmService.send('TIMEOUT');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendVoice(audioBuffer, options = {}) {
    try {
      if (!this.deepgram.isConnected) {
        await this.deepgram.connectLive();
      }
      
      this.deepgram.sendAudioToLive(audioBuffer);
      this.fsmService.send('VOICE_IN');
      
      return { success: true };
    } catch (error) {
      console.error('Error enviando voz:', error);
      return { success: false, error: error.message };
    }
  }

  handleWakeWord() {
    const currentState = this.fsmService.state.value;
    if (currentState === 'IDLE') {
      this.fsmService.send('WAKE');
      return true;
    }
    return false;
  }

  // Métodos para CallCenter
  async startCall({ sessionId, roleId, pipeline, rolesSystem }) {
    try {
      // Activar rol si hay sistema de roles disponible
      const rs = rolesSystem || this.ctx?.rolesSystem || global.serviceManager?.get?.('roles-system');
      if (rs && typeof rs.activateRole === 'function') {
        try {
          await rs.activateRole(roleId);
          console.log(`✅ Rol activado: ${roleId}`);
        } catch (e) {
          console.warn(`⚠️ No se pudo activar rol ${roleId}:`, e.message);
        }
      }
      
      // Iniciar conversación con el pipeline especificado
      const mode = pipeline === 'avatar_sora' ? 'video' : 'voice';
      const result = await this.startConversation({ 
        userId: sessionId, 
        mode,
        roleId 
      });
      
      if (!result.success) {
        return { success: false, error: result.error || 'startConversation_failed' };
      }
      
      return { success: true, sessionId: this.sessionId || sessionId, roleId, pipeline };
    } catch (error) {
      console.error('Error en startCall:', error);
      return { success: false, error: error.message };
    }
  }

  async endCall({ sessionId }) {
    try {
      await this.stopConversation();
      return { success: true, sessionId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = MultimodalConversationService;

