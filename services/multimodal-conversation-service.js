const DeepgramService = require('./deepgram-service');
const CartesiaService = require('./cartesia-service');
const HeyGenService = require('./heygen-service');

class MultimodalConversationService {
  constructor(aiGateway, db) {
    this.deepgram = new DeepgramService();
    this.cartesia = new CartesiaService();
    this.heygen = new HeyGenService();
    this.aiGateway = aiGateway;
    this.db = db;
    
    // Estado de la conversación
    this.isListening = false;
    this.isSpeaking = false;
    this.conversationActive = false;
    this.bargeInEnabled = true;
    this.currentTranscript = '';
    this.interimTranscript = '';
    
    // Callbacks
    this.onTranscriptUpdate = null;
    this.onResponseReady = null;
    this.onAvatarSpeaking = null;
    this.onError = null;
    
    console.log('✅ Multimodal Conversation Service inicializado');
  }

  /**
   * Iniciar conversación multimodal
   */
  async startConversation(callbacks = {}) {
    try {
      this.onTranscriptUpdate = callbacks.onTranscriptUpdate;
      this.onResponseReady = callbacks.onResponseReady;
      this.onAvatarSpeaking = callbacks.onAvatarSpeaking;
      this.onError = callbacks.onError;

      // Iniciar sesión de HeyGen Avatar
      const avatarSession = await this.heygen.createStreamingSession();
      if (!avatarSession.success) {
        throw new Error('No se pudo iniciar sesión de avatar');
      }

      // Iniciar transcripción en vivo de Deepgram
      await this.deepgram.startLiveTranscription(
        this.handleTranscript.bind(this),
        this.handleError.bind(this)
      );

      this.conversationActive = true;

      return {
        success: true,
        message: 'Conversación multimodal iniciada',
        avatarConfig: this.heygen.getWebRTCConfig()
      };
    } catch (error) {
      console.error('Error iniciando conversación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Manejar transcripción de Deepgram
   */
  async handleTranscript(data) {
    const { transcript, isFinal, confidence } = data;

    if (isFinal) {
      // Transcripción final
      this.currentTranscript = transcript;
      
      // Notificar actualización
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate({
          transcript,
          isFinal: true,
          confidence
        });
      }

      // Implementar Barge-in: Si el usuario habla mientras Sandra responde
      if (this.isSpeaking && this.bargeInEnabled) {
        console.log('🔄 Barge-in detectado - Interrumpiendo respuesta');
        await this.stopSpeaking();
      }

      // Generar respuesta de IA
      await this.generateAndSpeak(transcript);
    } else {
      // Transcripción intermedia
      this.interimTranscript = transcript;
      
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate({
          transcript,
          isFinal: false,
          confidence
        });
      }
    }
  }

  /**
   * Generar respuesta y hacer que el avatar hable
   */
  async generateAndSpeak(userMessage) {
    try {
      this.isListening = false;

      // Generar respuesta con IA
      const aiResponse = await this.aiGateway.generateResponse(
        userMessage,
        'groq'
      );

      if (this.onResponseReady) {
        this.onResponseReady({
          userMessage,
          aiResponse
        });
      }

      // Guardar en base de datos
      if (this.db) {
        const sessionId = `session_${Date.now()}`;
        await this.db.logMessage(sessionId, userMessage, 'user');
        await this.db.logMessage(sessionId, aiResponse, 'assistant');
      }

      // Hacer que el avatar hable
      await this.speak(aiResponse);

    } catch (error) {
      console.error('Error generando y hablando:', error);
      if (this.onError) {
        this.onError(error);
      }
    }
  }

  /**
   * Hacer que el avatar hable (TTS + Avatar)
   */
  async speak(text) {
    try {
      this.isSpeaking = true;

      if (this.onAvatarSpeaking) {
        this.onAvatarSpeaking({ speaking: true, text });
      }

      // Opción 1: Usar HeyGen directamente (si tiene TTS integrado)
      const heygenResult = await this.heygen.speak(text);

      // Opción 2: Usar Cartesia + HeyGen (para más control)
      // const audioResult = await this.cartesia.generateSpeech(text);
      // if (audioResult.success) {
      //   await this.heygen.speak(text);
      // }

      // Esperar a que termine de hablar (estimación basada en duración)
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
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Detener la respuesta actual (Barge-in)
   */
  async stopSpeaking() {
    try {
      this.isSpeaking = false;
      
      // Detener Cartesia
      this.cartesia.stop();
      
      // Detener HeyGen (enviar comando de stop)
      await this.heygen.speak('', 'stop');

      console.log('✅ Respuesta interrumpida (Barge-in)');

      return {
        success: true,
        message: 'Respuesta detenida'
      };
    } catch (error) {
      console.error('Error deteniendo respuesta:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar audio al stream de Deepgram
   */
  sendAudioData(audioData) {
    if (this.deepgram.isLiveConnected()) {
      this.deepgram.sendAudioToLive(audioData);
    }
  }

  /**
   * Activar/desactivar Barge-in
   */
  setBargeIn(enabled) {
    this.bargeInEnabled = enabled;
    console.log(`Barge-in ${enabled ? 'activado' : 'desactivado'}`);
  }

  /**
   * Detener conversación
   */
  async stopConversation() {
    try {
      this.conversationActive = false;
      this.isListening = false;
      this.isSpeaking = false;

      // Detener Deepgram
      this.deepgram.stopLiveTranscription();

      // Detener HeyGen
      await this.heygen.stop();

      // Detener Cartesia
      this.cartesia.stop();

      return {
        success: true,
        message: 'Conversación detenida'
      };
    } catch (error) {
      console.error('Error deteniendo conversación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener estado de la conversación
   */
  getStatus() {
    return {
      conversationActive: this.conversationActive,
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      bargeInEnabled: this.bargeInEnabled,
      deepgramConnected: this.deepgram.isLiveConnected(),
      heygenStreaming: this.heygen.getIsStreaming()
    };
  }

  /**
   * Manejar errores
   */
  handleError(error) {
    console.error('Error en conversación multimodal:', error);
    if (this.onError) {
      this.onError(error);
    }
  }

  /**
   * Utilidad: Sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = MultimodalConversationService;

