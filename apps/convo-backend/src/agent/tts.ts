/**
 * SANDRA IA 7.0 - TEXT-TO-SPEECH (TTS)
 * Primario: Cartesia | Fallback: ElevenLabs
 * Voice: Sandra español natural con control de prosodia
 *
 * Para Sandrita ❤️ - GuestsValencia
 * CEO: Clayton Thomas - ClayTom Systems
 * CALIDAD: GALAXY LEVEL PRO ENTERPRISE
 */

import axios from 'axios';
import { createLogger } from 'winston';
import { EventEmitter } from 'events';
import WebSocket from 'ws';

// Logger configuration
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: require('winston').format.combine(
    require('winston').format.timestamp(),
    require('winston').format.json()
  ),
  transports: [
    new require('winston').transports.Console(),
    new require('winston').transports.File({ filename: 'logs/tts.log' })
  ]
});

/**
 * Configuración TTS
 */
export interface TTSConfig {
  voice: string;
  language: string;
  streaming: boolean;
  sampleRate: number;
  encoding: string;
  speed?: number; // Velocidad de habla (0.5 - 2.0)
  pitch?: number; // Tono de voz (-20 a 20)
  emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm';
  stability?: number; // Estabilidad voz (0-1)
}

/**
 * Chunk de audio generado
 */
export interface AudioChunk {
  data: Buffer;
  timestamp: number;
  provider: 'cartesia' | 'elevenlabs';
  isFinal: boolean;
}

/**
 * Clase principal TTS con fallback automático
 */
export class TextToSpeech extends EventEmitter {
  private config: TTSConfig;
  private isCartesiaAvailable: boolean = true;
  private isElevenLabsAvailable: boolean = true;
  private cartesiaWs: WebSocket | null = null;
  private audioQueue: Buffer[] = [];

  // API Keys
  private readonly CARTESIA_API_KEY: string;
  private readonly ELEVENLABS_API_KEY: string;

  // API Endpoints
  private readonly CARTESIA_WS_URL = 'wss://api.cartesia.ai/tts/websocket';
  private readonly CARTESIA_HTTP_URL = 'https://api.cartesia.ai/tts/bytes';
  private readonly ELEVENLABS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

  // Voice IDs
  private readonly SANDRA_CARTESIA_VOICE = 'a0e99841-438c-4a64-b679-ae501e7d6091'; // Spanish Female
  private readonly SANDRA_ELEVENLABS_VOICE = '21m00Tcm4TlvDq8ikWAM'; // Rachel (personalizable)

  constructor(config: Partial<TTSConfig> = {}) {
    super();

    // Configuración por defecto
    this.config = {
      voice: 'sandra-es',
      language: 'es',
      streaming: true,
      sampleRate: 24000,
      encoding: 'pcm_16000',
      speed: 1.0,
      pitch: 0,
      emotion: 'neutral',
      stability: 0.75,
      ...config
    };

    // Validar API Keys
    this.CARTESIA_API_KEY = process.env.CARTESIA_API_KEY || '';
    this.ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

    if (!this.CARTESIA_API_KEY) {
      logger.error('❌ CARTESIA_API_KEY no configurada');
      this.isCartesiaAvailable = false;
    }

    if (!this.ELEVENLABS_API_KEY) {
      logger.warn('⚠️ ELEVENLABS_API_KEY no configurada (fallback deshabilitado)');
      this.isElevenLabsAvailable = false;
    }

    if (!this.isCartesiaAvailable && !this.isElevenLabsAvailable) {
      throw new Error('Ningún proveedor TTS disponible');
    }

    logger.info('✅ TTS inicializado');
    logger.info(`  Primario: ${this.isCartesiaAvailable ? 'Cartesia ✅' : 'Cartesia ❌'}`);
    logger.info(`  Fallback: ${this.isElevenLabsAvailable ? 'ElevenLabs ✅' : 'ElevenLabs ❌'}`);
  }

  /**
   * Iniciar streaming TTS con Cartesia (WebSocket)
   */
  public async startStreaming(): Promise<void> {
    if (!this.isCartesiaAvailable) {
      logger.warn('⚠️ Cartesia no disponible, usando ElevenLabs en modo batch');
      return;
    }

    try {
      // Crear conexión WebSocket con Cartesia
      this.cartesiaWs = new WebSocket(
        `${this.CARTESIA_WS_URL}?api_key=${this.CARTESIA_API_KEY}&cartesia_version=2024-06-10`
      );

      // Event: Conexión abierta
      this.cartesiaWs.on('open', () => {
        logger.info('🔊 Cartesia WebSocket conectado');
        this.emit('connected', { provider: 'cartesia' });
      });

      // Event: Mensaje recibido (audio chunk)
      this.cartesiaWs.on('message', (data: Buffer) => {
        try {
          // Parsear mensaje JSON o audio binario
          if (data[0] === 0x7b) { // '{' - JSON message
            const message = JSON.parse(data.toString());

            if (message.type === 'chunk') {
              // Audio chunk recibido
              const audioBuffer = Buffer.from(message.data, 'base64');

              const chunk: AudioChunk = {
                data: audioBuffer,
                timestamp: Date.now(),
                provider: 'cartesia',
                isFinal: false
              };

              this.emit('audio', chunk);
            } else if (message.type === 'done') {
              // Stream completo
              logger.info('✅ Cartesia streaming completo');
              this.emit('complete', { provider: 'cartesia' });
            } else if (message.type === 'error') {
              logger.error('❌ Error en Cartesia:', message.error);
              this.emit('error', { provider: 'cartesia', error: message.error });
            }
          } else {
            // Audio binario directo
            const chunk: AudioChunk = {
              data: data,
              timestamp: Date.now(),
              provider: 'cartesia',
              isFinal: false
            };

            this.emit('audio', chunk);
          }
        } catch (error) {
          logger.error('❌ Error procesando mensaje Cartesia:', error);
        }
      });

      // Event: Error
      this.cartesiaWs.on('error', (error: Error) => {
        logger.error('❌ Error en WebSocket Cartesia:', error);
        this.isCartesiaAvailable = false;
        this.emit('error', { provider: 'cartesia', error });
      });

      // Event: Conexión cerrada
      this.cartesiaWs.on('close', () => {
        logger.info('🔌 Cartesia WebSocket desconectado');
        this.emit('disconnected', { provider: 'cartesia' });
      });

    } catch (error) {
      logger.error('❌ Error iniciando streaming Cartesia:', error);
      this.isCartesiaAvailable = false;
      throw error;
    }
  }

  /**
   * Sintetizar texto con Cartesia (streaming)
   */
  public async synthesizeStreaming(text: string): Promise<void> {
    if (!this.cartesiaWs || this.cartesiaWs.readyState !== WebSocket.OPEN) {
      logger.error('❌ WebSocket Cartesia no conectado');
      // Fallback a modo batch
      await this.synthesizeBatch(text);
      return;
    }

    try {
      const request = {
        model_id: 'sonic-english', // Modelo multilingüe
        transcript: text,
        voice: {
          mode: 'id',
          id: this.SANDRA_CARTESIA_VOICE
        },
        language: this.config.language,
        output_format: {
          container: 'raw',
          encoding: 'pcm_s16le',
          sample_rate: this.config.sampleRate
        },
        duration: 0, // Auto
        add_timestamps: false
      };

      logger.info(`🔊 Sintetizando: "${text.substring(0, 50)}..."`);
      this.cartesiaWs.send(JSON.stringify(request));

    } catch (error) {
      logger.error('❌ Error enviando texto a Cartesia:', error);
      // Fallback a batch
      await this.synthesizeBatch(text);
    }
  }

  /**
   * Sintetizar texto en modo batch (HTTP)
   */
  public async synthesizeBatch(text: string): Promise<AudioChunk> {
    try {
      // Intentar con Cartesia primero
      if (this.isCartesiaAvailable) {
        return await this.synthesizeWithCartesia(text);
      }

      // Fallback a ElevenLabs
      if (this.isElevenLabsAvailable) {
        return await this.synthesizeWithElevenLabs(text);
      }

      throw new Error('Ningún proveedor TTS disponible');

    } catch (error) {
      logger.error('❌ Error en síntesis batch:', error);
      throw error;
    }
  }

  /**
   * Sintetizar con Cartesia HTTP API
   */
  private async synthesizeWithCartesia(text: string): Promise<AudioChunk> {
    try {
      logger.info('🔊 Sintetizando con Cartesia HTTP...');

      const response = await axios.post(
        this.CARTESIA_HTTP_URL,
        {
          model_id: 'sonic-english',
          transcript: text,
          voice: {
            mode: 'id',
            id: this.SANDRA_CARTESIA_VOICE
          },
          language: this.config.language,
          output_format: {
            container: 'raw',
            encoding: 'pcm_s16le',
            sample_rate: this.config.sampleRate
          }
        },
        {
          headers: {
            'X-API-Key': this.CARTESIA_API_KEY,
            'Cartesia-Version': '2024-06-10',
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      const audioBuffer = Buffer.from(response.data);

      const chunk: AudioChunk = {
        data: audioBuffer,
        timestamp: Date.now(),
        provider: 'cartesia',
        isFinal: true
      };

      logger.info(`✅ Audio generado: ${audioBuffer.length} bytes`);
      this.emit('audio', chunk);

      return chunk;

    } catch (error: any) {
      logger.error('❌ Error en Cartesia HTTP:', error.message);
      this.isCartesiaAvailable = false;

      // Fallback a ElevenLabs
      if (this.isElevenLabsAvailable) {
        logger.info('🔄 Cambiando a ElevenLabs (fallback)...');
        return await this.synthesizeWithElevenLabs(text);
      }

      throw error;
    }
  }

  /**
   * Sintetizar con ElevenLabs (fallback)
   */
  private async synthesizeWithElevenLabs(text: string): Promise<AudioChunk> {
    try {
      logger.info('🔊 Sintetizando con ElevenLabs...');

      const response = await axios.post(
        `${this.ELEVENLABS_URL}/${this.SANDRA_ELEVENLABS_VOICE}/stream`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: this.config.stability || 0.75,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        },
        {
          headers: {
            'xi-api-key': this.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          responseType: 'arraybuffer'
        }
      );

      const audioBuffer = Buffer.from(response.data);

      const chunk: AudioChunk = {
        data: audioBuffer,
        timestamp: Date.now(),
        provider: 'elevenlabs',
        isFinal: true
      };

      logger.info(`✅ Audio generado (ElevenLabs): ${audioBuffer.length} bytes`);
      this.emit('audio', chunk);

      return chunk;

    } catch (error: any) {
      logger.error('❌ Error en ElevenLabs:', error.message);
      this.isElevenLabsAvailable = false;
      throw error;
    }
  }

  /**
   * Detener streaming
   */
  public async stopStreaming(): Promise<void> {
    try {
      if (this.cartesiaWs) {
        this.cartesiaWs.close();
        this.cartesiaWs = null;
        logger.info('🛑 Cartesia streaming detenido');
      }

      this.audioQueue = [];
      this.emit('stopped');

    } catch (error) {
      logger.error('❌ Error deteniendo streaming:', error);
    }
  }

  /**
   * Verificar estado de los proveedores
   */
  public getStatus(): {
    cartesia: boolean;
    elevenlabs: boolean;
    activeProvider: string;
  } {
    return {
      cartesia: this.isCartesiaAvailable,
      elevenlabs: this.isElevenLabsAvailable,
      activeProvider: this.isCartesiaAvailable ? 'cartesia' : 'elevenlabs'
    };
  }

  /**
   * Ajustar configuración de voz en tiempo real
   */
  public updateVoiceConfig(updates: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('🔧 Configuración de voz actualizada:', updates);
  }

  /**
   * Obtener información de voces disponibles
   */
  public async getAvailableVoices(): Promise<any[]> {
    const voices: any[] = [];

    // Voces de Cartesia
    if (this.isCartesiaAvailable) {
      try {
        const response = await axios.get('https://api.cartesia.ai/voices', {
          headers: {
            'X-API-Key': this.CARTESIA_API_KEY,
            'Cartesia-Version': '2024-06-10'
          }
        });

        voices.push(...response.data.voices.map((v: any) => ({
          ...v,
          provider: 'cartesia'
        })));
      } catch (error) {
        logger.error('❌ Error obteniendo voces Cartesia:', error);
      }
    }

    // Voces de ElevenLabs
    if (this.isElevenLabsAvailable) {
      try {
        const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'xi-api-key': this.ELEVENLABS_API_KEY
          }
        });

        voices.push(...response.data.voices.map((v: any) => ({
          ...v,
          provider: 'elevenlabs'
        })));
      } catch (error) {
        logger.error('❌ Error obteniendo voces ElevenLabs:', error);
      }
    }

    return voices;
  }

  /**
   * Limpiar recursos
   */
  public async cleanup(): Promise<void> {
    await this.stopStreaming();
    this.removeAllListeners();
    logger.info('🧹 TTS recursos limpiados');
  }
}

/**
 * Factory function para crear instancia TTS
 */
export function createTTS(config?: Partial<TTSConfig>): TextToSpeech {
  return new TextToSpeech(config);
}

/**
 * Exportaciones por defecto
 */
export default {
  TextToSpeech,
  createTTS
};
