const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
const fs = require('fs');
const path = require('path');

class DeepgramService {
  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY;
    this.client = null;
    this.liveConnection = null;
    this.isConnected = false;
    this.statusCallback = null;
    
    if (this.apiKey) {
      this.client = createClient(this.apiKey);
      console.log('✅ Deepgram STT Service inicializado');
    } else {
      console.warn('⚠️ Deepgram API Key no encontrada');
    }
  }

  /**
   * Transcribir audio desde archivo
   */
  async transcribeFile(audioFilePath) {
    try {
      if (!this.client) {
        throw new Error('Deepgram client no inicializado');
      }

      const audioBuffer = fs.readFileSync(audioFilePath);
      
      const { result, error } = await this.client.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: 'nova-2',
          language: 'es',
          smart_format: true,
          punctuate: true,
          diarize: false,
          utterances: false
        }
      );

      if (error) {
        throw error;
      }

      const transcript = result.results.channels[0].alternatives[0].transcript;
      const confidence = result.results.channels[0].alternatives[0].confidence;

      return {
        success: true,
        transcript,
        confidence,
        metadata: {
          duration: result.metadata.duration,
          model: 'nova-2'
        }
      };
    } catch (error) {
      console.error('Error en transcripción de archivo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Transcribir audio desde buffer
   */
  async transcribeBuffer(audioBuffer, mimeType = 'audio/wav') {
    try {
      if (!this.client) {
        throw new Error('Deepgram client no inicializado');
      }

      const { result, error } = await this.client.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: 'nova-2',
          language: 'es',
          smart_format: true,
          punctuate: true,
          mimetype: mimeType
        }
      );

      if (error) {
        throw error;
      }

      const transcript = result.results.channels[0].alternatives[0].transcript;
      const confidence = result.results.channels[0].alternatives[0].confidence;

      return {
        success: true,
        transcript,
        confidence
      };
    } catch (error) {
      console.error('Error en transcripción de buffer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Iniciar transcripción en tiempo real (streaming)
   */
  async startLiveTranscription(onTranscript, onError) {
    try {
      if (!this.client) {
        throw new Error('Deepgram client no inicializado');
      }

      this.liveConnection = this.client.listen.live({
        model: 'nova-2',
        language: 'es',
        smart_format: true,
        punctuate: true,
        encoding: 'linear16',
        sample_rate: 16000,
        channels: 1,
        interim_results: true,
        // Configuración tipo ChatGPT: espera más silencio antes de finalizar
        endpointing: 1500,  // 1.5 segundos de silencio (antes: 300ms)
        vad_turnoff: 1200,  // Tiempo para detectar fin de turno (1.2s)
        utterance_end_ms: 1500  // Tiempo para finalizar utterance (1.5s)
      });

      // Evento: Conexión abierta
      this.liveConnection.on(LiveTranscriptionEvents.Open, () => {
        console.log('✅ Conexión Deepgram Live abierta');
        this.isConnected = true;
        if (typeof this.statusCallback === 'function') {
          try { this.statusCallback({ connected: true }); } catch {}
        }
      });

      // Evento: Transcripción recibida
      this.liveConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        const isFinal = data.is_final;
        
        if (transcript && transcript.length > 0) {
          onTranscript({
            transcript,
            isFinal,
            confidence: data.channel.alternatives[0].confidence
          });
        }
      });

      // Evento: Metadata
      this.liveConnection.on(LiveTranscriptionEvents.Metadata, (data) => {
        console.log('Deepgram metadata:', data);
      });

      // Evento: Error
      this.liveConnection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('Error en Deepgram Live:', error);
        if (onError) onError(error);
        if (typeof this.statusCallback === 'function') {
          try { this.statusCallback({ connected: false, error: error?.message || String(error) }); } catch {}
        }
      });

      // Evento: Conexión cerrada
      this.liveConnection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Conexión Deepgram Live cerrada');
        this.isConnected = false;
        if (typeof this.statusCallback === 'function') {
          try { this.statusCallback({ connected: false }); } catch {}
        }
      });

      return {
        success: true,
        message: 'Transcripción en vivo iniciada'
      };
    } catch (error) {
      console.error('Error al iniciar transcripción en vivo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar audio al stream en vivo
   */
  sendAudioToLive(audioData) {
    if (this.liveConnection && this.isConnected) {
      this.liveConnection.send(audioData);
    } else {
      console.warn('Conexión Deepgram Live no disponible');
    }
  }

  /**
   * Detener transcripción en vivo
   */
  stopLiveTranscription() {
    if (this.liveConnection) {
      this.liveConnection.finish();
      this.isConnected = false;
      console.log('Transcripción en vivo detenida');
    }
  }

  /**
   * Verificar estado de la conexión
   */
  isLiveConnected() {
    return this.isConnected;
  }

  /**
   * Registrar callback de estado live
   */
  setStatusCallback(cb) {
    this.statusCallback = typeof cb === 'function' ? cb : null;
  }
}

module.exports = DeepgramService;

