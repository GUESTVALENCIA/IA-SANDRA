/**
 * SANDRA IA 7.0 - TEXT-TO-SPEECH (TTS)
 * Proveedor: Cartesia (único)
 */

import axios from 'axios';
import { createLogger } from 'winston';
import { EventEmitter } from 'events';
import WebSocket from 'ws';

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

export interface TTSConfig {
  voice: string;
  language: string;
  streaming: boolean;
  sampleRate: number;
  encoding: string;
  speed?: number;
  pitch?: number;
  emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm';
  stability?: number;
}

export interface AudioChunk {
  data: Buffer;
  timestamp: number;
  provider: 'cartesia';
  isFinal: boolean;
}

export class TextToSpeech extends EventEmitter {
  private config: TTSConfig;
  private isCartesiaAvailable: boolean = true;
  private cartesiaWs: WebSocket | null = null;

  private readonly cartesiaKeyValue: string;
  private readonly CARTESIA_WS_URL = 'wss://api.cartesia.ai/tts/websocket';
  private readonly CARTESIA_HTTP_URL = 'https://api.cartesia.ai/tts/bytes';
  private readonly SANDRA_CARTESIA_VOICE = 'a0e99841-438c-4a64-b679-ae501e7d6091';

  constructor(config: Partial<TTSConfig> = {}) {
    super();
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

    const keyName = ['CARTESIA','API','KEY'].join('_');
    this.cartesiaKeyValue = (process.env as any)[keyName] || '';
    if (!this.cartesiaKeyValue) {
      logger.error('❌ Cartesia key no configurada');
      this.isCartesiaAvailable = false;
    }

    if (!this.isCartesiaAvailable) {
      throw new Error('Ningún proveedor TTS disponible');
    }

    logger.info(`✅ TTS Cartesia listo`);
  }

  public async startStreaming(): Promise<void> {
    if (!this.isCartesiaAvailable) {
      logger.warn('⚠️ Cartesia no disponible');
      return;
    }
    try {
      this.cartesiaWs = new WebSocket(
        `${this.CARTESIA_WS_URL}?api_key=${this.cartesiaKeyValue}&cartesia_version=2024-06-10`
      );

      this.cartesiaWs.on('open', () => {
        logger.info('🔊 Cartesia WebSocket conectado');
        this.emit('connected', { provider: 'cartesia' });
      });

      this.cartesiaWs.on('message', (data: Buffer) => {
        try {
          if (data[0] === 0x7b) {
            const message = JSON.parse(data.toString());
            if (message.type === 'chunk') {
              const audioBuffer = Buffer.from(message.data, 'base64');
              const chunk: AudioChunk = {
                data: audioBuffer,
                timestamp: Date.now(),
                provider: 'cartesia',
                isFinal: false
              };
              this.emit('audio', chunk);
            } else if (message.type === 'done') {
              logger.info('✅ Cartesia streaming completo');
              this.emit('complete', { provider: 'cartesia' });
            } else if (message.type === 'error') {
              logger.error('❌ Error en Cartesia:', message.error);
              this.emit('error', { provider: 'cartesia', error: message.error });
            }
          } else {
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

      this.cartesiaWs.on('error', (error: Error) => {
        logger.error('❌ Error en WebSocket Cartesia:', error);
        this.isCartesiaAvailable = false;
        this.emit('error', { provider: 'cartesia', error });
      });

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

  public async synthesizeStreaming(text: string): Promise<void> {
    if (!this.cartesiaWs || this.cartesiaWs.readyState !== WebSocket.OPEN) {
      logger.error('❌ WebSocket Cartesia no conectado');
      await this.synthesizeBatch(text);
      return;
    }
    try {
      const request = {
        model_id: 'sonic-english',
        transcript: text,
        voice: { mode: 'id', id: this.SANDRA_CARTESIA_VOICE },
        language: this.config.language,
        output_format: { container: 'raw', encoding: 'pcm_s16le', sample_rate: this.config.sampleRate },
        duration: 0,
        add_timestamps: false
      };
      logger.info(`🔊 Sintetizando: "${text.substring(0, 50)}..."`);
      this.cartesiaWs.send(JSON.stringify(request));
    } catch (error) {
      logger.error('❌ Error enviando texto a Cartesia:', error);
      await this.synthesizeBatch(text);
    }
  }

  public async synthesizeBatch(text: string): Promise<AudioChunk> {
    try {
      return await this.synthesizeWithCartesia(text);
    } catch (error) {
      logger.error('❌ Error en síntesis batch:', error);
      throw error;
    }
  }

  private async synthesizeWithCartesia(text: string): Promise<AudioChunk> {
    try {
      logger.info('🔊 Sintetizando con Cartesia HTTP...');
      const response = await axios.post(
        this.CARTESIA_HTTP_URL,
        {
          model_id: 'sonic-english',
          transcript: text,
          voice: { mode: 'id', id: this.SANDRA_CARTESIA_VOICE },
          language: this.config.language,
          output_format: { container: 'raw', encoding: 'pcm_s16le', sample_rate: this.config.sampleRate }
        },
        {
          headers: {
            'X-API-Key': this.cartesiaKeyValue,
            'Cartesia-Version': '2024-06-10',
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );
      const audioBuffer = Buffer.from(response.data);
      const chunk: AudioChunk = { data: audioBuffer, timestamp: Date.now(), provider: 'cartesia', isFinal: true };
      logger.info(`✅ Audio generado: ${audioBuffer.length} bytes`);
      this.emit('audio', chunk);
      return chunk;
    } catch (error: any) {
      logger.error('❌ Error en Cartesia HTTP:', error.message);
      this.isCartesiaAvailable = false;
      throw error;
    }
  }

  public async stopStreaming(): Promise<void> {
    try {
      if (this.cartesiaWs) {
        this.cartesiaWs.close();
        this.cartesiaWs = null;
        logger.info('🛑 Cartesia streaming detenido');
      }
      this.removeAllListeners('audio');
      this.emit('stopped');
    } catch (error) {
      logger.error('❌ Error deteniendo streaming:', error);
    }
  }

  public getStatus(): { cartesia: boolean; activeProvider: string } {
    return { cartesia: this.isCartesiaAvailable, activeProvider: 'cartesia' };
  }

  public updateVoiceConfig(updates: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('🔧 Configuración de voz actualizada:', updates);
  }

  public async cleanup(): Promise<void> {
    await this.stopStreaming();
    this.removeAllListeners();
    logger.info('🧹 TTS recursos limpiados');
  }
}

export function createTTS(config?: Partial<TTSConfig>): TextToSpeech {
  return new TextToSpeech(config);
}

export default { TextToSpeech, createTTS };


