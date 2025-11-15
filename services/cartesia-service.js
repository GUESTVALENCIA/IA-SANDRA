const axios = require('axios');
const fs = require('fs');
const path = require('path');
const VoiceCacheService = require('./voice-cache-service');

class CartesiaService {
  constructor() {
    this.apiKey = process.env.CARTESIA_API_KEY;
    // Base URL según docs actuales de Cartesia
    this.baseUrl = 'https://api.cartesia.ai';
    this.apiVersion = '2024-11-13';
    this.voiceId = process.env.CARTESIA_VOICE_ID || 'a0e99841-438c-4a64-b679-ae501e7d6091'; // Voz por defecto (puede ser sobrescrita por env)
    this.currentAudio = null;
    this.isPlaying = false;
    this.cache = new VoiceCacheService();
    this.cacheEnabled = true;
    
    if (this.apiKey) {
      console.log('✅ Cartesia TTS Service inicializado con caché');
      if (this.voiceId) {
        console.log(`🔊 Cartesia voice id: ${this.voiceId}`);
      }
    } else {
      console.warn('⚠️ Cartesia API Key no encontrada');
    }
  }

  /**
   * Generar audio desde texto
   */
  async generateSpeech(text, options = {}) {
    try {
      const voiceId = options.voiceId || this.voiceId;

      // Verificar caché primero
      if (this.cacheEnabled) {
        const cached = await this.cache.getFromCache(text, voiceId);
        if (cached.success && cached.cached) {
          console.log('✅ Audio obtenido de caché');
          return {
            success: true,
            audioBuffer: cached.audioBuffer,
            format: 'wav',
            sampleRate: 44100,
            cached: true
          };
        }
      }

      if (!this.apiKey) {
        throw new Error('Cartesia API Key no configurada');
      }

      // Endpoint /tts/bytes para obtener audio completo en una respuesta
      const { data } = await axios.post(
        `${this.baseUrl}/tts/bytes`,
        {
          model_id: 'sonic-english',
          transcript: text,
          voice: {
            mode: 'id',
            id: voiceId
          },
          output_format: {
            container: 'wav',
            encoding: 'pcm_s16le',
            sample_rate: 44100
          },
          language: 'es'
        },
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Cartesia-Version': this.apiVersion,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );

      const audioBuffer = Buffer.from(data);

      // Guardar en caché
      if (this.cacheEnabled) {
        await this.cache.saveToCache(text, audioBuffer, voiceId, {
          model: 'sonic-english',
          sampleRate: 44100
        });
      }

      return {
        success: true,
        audioBuffer,
        format: 'wav',
        sampleRate: 44100,
        cached: false
      };
    } catch (error) {
      const status = error.response?.status;
      const body = error.response?.data;
      console.error('Error generando speech:', status, body || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generar y guardar audio en archivo
   */
  async generateSpeechToFile(text, outputPath, options = {}) {
    try {
      const result = await this.generateSpeech(text, options);
      
      if (!result.success) {
        return result;
      }

      fs.writeFileSync(outputPath, result.audioBuffer);

      return {
        success: true,
        filePath: outputPath,
        message: 'Audio generado y guardado correctamente'
      };
    } catch (error) {
      console.error('Error guardando audio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Streaming de audio en tiempo real
   */
  async streamSpeech(text, onAudioChunk, options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('Cartesia API Key no configurada');
      }

      const response = await axios.post(
        `${this.baseUrl}/tts/sse`,
        {
          model_id: 'sonic-english',
          transcript: text,
          voice: {
            mode: 'id',
            id: options.voiceId || this.voiceId
          },
          output_format: {
            container: 'wav',
            encoding: 'pcm_s16le',
            sample_rate: 44100
          },
          language: 'es'
        },
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Cartesia-Version': this.apiVersion,
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );

      response.data.on('data', (chunk) => {
        if (onAudioChunk) {
          onAudioChunk(chunk);
        }
      });

      response.data.on('end', () => {
        console.log('Stream de audio completado');
      });

      return {
        success: true,
        message: 'Streaming iniciado'
      };
    } catch (error) {
      console.error('Error en streaming de audio:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener voces disponibles
   */
  async getVoices() {
    try {
      if (!this.apiKey) {
        throw new Error('Cartesia API Key no configurada');
      }

      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      return {
        success: true,
        voices: response.data
      };
    } catch (error) {
      console.error('Error obteniendo voces:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cambiar voz
   */
  setVoice(voiceId) {
    this.voiceId = voiceId;
    console.log(`Voz cambiada a: ${voiceId}`);
  }

  /**
   * Detener reproducción actual
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
      this.isPlaying = false;
    }
  }

  /**
   * Verificar si está reproduciendo
   */
  getIsPlaying() {
    return this.isPlaying;
  }

  /**
   * Activar/desactivar caché
   */
  setCacheEnabled(enabled) {
    this.cacheEnabled = enabled;
    console.log(`Caché de voz ${enabled ? 'activado' : 'desactivado'}`);
  }

  /**
   * Limpiar caché
   */
  clearCache() {
    return this.cache.clearCache();
  }

  /**
   * Obtener estadísticas de caché
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

module.exports = CartesiaService;

