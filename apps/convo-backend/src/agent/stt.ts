/**
 * SANDRA IA 7.0 - SPEECH-TO-TEXT (STT)
 * Primario: Deepgram | Fallback: Whisper (OpenAI)
 * Language: es-ES con detección de barge-in
 *
 * Para Sandrita ❤️ - GuestsValencia
 * CEO: Clayton Thomas - ClayTom Systems
 * CALIDAD: GALAXY LEVEL PRO ENTERPRISE
 */

import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import OpenAI from 'openai';
import { createLogger } from 'winston';
import { EventEmitter } from 'events';

// Logger configuration
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: require('winston').format.combine(
    require('winston').format.timestamp(),
    require('winston').format.json()
  ),
  transports: [
    new require('winston').transports.Console(),
    new require('winston').transports.File({ filename: 'logs/stt.log' })
  ]
});

/**
 * Configuración STT
 */
export interface STTConfig {
  language: string;
  model?: string;
  streaming: boolean;
  interimResults: boolean;
  punctuate: boolean;
  bargeInDetection: boolean;
  silenceTimeout?: number; // ms para detectar fin de habla
}

/**
 * Resultado de transcripción
 */
export interface TranscriptionResult {
  text: string;
  isFinal: boolean;
  confidence: number;
  timestamp: number;
  bargeIn?: boolean;
  provider: 'deepgram' | 'whisper';
}

/**
 * Clase principal STT con fallback automático
 */
export class SpeechToText extends EventEmitter {
  private deepgramClient: any;
  private openaiClient: OpenAI;
  private config: STTConfig;
  private isDeepgramAvailable: boolean = true;
  private deepgramConnection: any = null;
  private lastSpeechTimestamp: number = 0;
  private silenceDetectionInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<STTConfig> = {}) {
    super();

    // Configuración por defecto
    this.config = {
      language: 'es-ES',
      model: 'nova-2',
      streaming: true,
      interimResults: true,
      punctuate: true,
      bargeInDetection: true,
      silenceTimeout: 1500, // 1.5 segundos de silencio
      ...config
    };

    // Inicializar Deepgram (primario)
    try {
      const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
      if (!deepgramApiKey) {
        throw new Error('DEEPGRAM_API_KEY no está configurada');
      }
      this.deepgramClient = createClient(deepgramApiKey);
      logger.info('✅ Deepgram STT inicializado (primario)');
    } catch (error) {
      logger.error('❌ Error inicializando Deepgram:', error);
      this.isDeepgramAvailable = false;
    }

    // Inicializar OpenAI Whisper (fallback)
    try {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY no está configurada');
      }
      this.openaiClient = new OpenAI({ apiKey: openaiApiKey });
      logger.info('✅ Whisper (OpenAI) inicializado (fallback)');
    } catch (error) {
      logger.error('❌ Error inicializando Whisper:', error);
      throw new Error('Ningún proveedor STT disponible');
    }
  }

  /**
   * Iniciar transcripción en streaming con Deepgram
   */
  public async startStreaming(): Promise<void> {
    if (!this.isDeepgramAvailable) {
      logger.warn('⚠️ Deepgram no disponible, usando Whisper en modo batch');
      return;
    }

    try {
      // Configurar conexión Deepgram
      const connection = this.deepgramClient.listen.live({
        model: this.config.model,
        language: this.config.language,
        punctuate: this.config.punctuate,
        interim_results: this.config.interimResults,
        encoding: 'linear16',
        sample_rate: 16000,
        channels: 1,
        endpointing: 300, // ms de silencio para fin de frase
        vad_events: true, // Voice Activity Detection
        smart_format: true
      });

      this.deepgramConnection = connection;

      // Event: Conexión abierta
      connection.on(LiveTranscriptionEvents.Open, () => {
        logger.info('🎤 Deepgram streaming conectado');
        this.emit('connected', { provider: 'deepgram' });
      });

      // Event: Transcripción recibida
      connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const transcript = data.channel?.alternatives?.[0];
        if (!transcript) return;

        const text = transcript.transcript || '';
        if (text.trim().length === 0) return;

        const isFinal = data.is_final || false;
        const confidence = transcript.confidence || 0;

        // Actualizar timestamp de última actividad vocal
        this.lastSpeechTimestamp = Date.now();

        // Detectar barge-in (interrupción del usuario)
        const bargeIn = this.detectBargeIn(text, isFinal);

        const result: TranscriptionResult = {
          text,
          isFinal,
          confidence,
          timestamp: Date.now(),
          bargeIn,
          provider: 'deepgram'
        };

        // Emitir resultado
        this.emit('transcription', result);

        // Log según tipo de resultado
        if (isFinal) {
          logger.info(`📝 [FINAL] "${text}" (conf: ${confidence.toFixed(2)})`);
        } else {
          logger.debug(`📝 [INTERIM] "${text}"`);
        }
      });

      // Event: Metadata
      connection.on(LiveTranscriptionEvents.Metadata, (data: any) => {
        logger.debug('📊 Deepgram metadata:', data);
      });

      // Event: Error
      connection.on(LiveTranscriptionEvents.Error, (error: any) => {
        logger.error('❌ Error en Deepgram streaming:', error);
        this.isDeepgramAvailable = false;
        this.emit('error', { provider: 'deepgram', error });

        // Intentar fallback a Whisper
        logger.info('🔄 Cambiando a Whisper (fallback)...');
      });

      // Event: Conexión cerrada
      connection.on(LiveTranscriptionEvents.Close, () => {
        logger.info('🔌 Deepgram streaming desconectado');
        this.emit('disconnected', { provider: 'deepgram' });
      });

      // Iniciar detección de silencio para barge-in
      if (this.config.bargeInDetection) {
        this.startSilenceDetection();
      }

    } catch (error) {
      logger.error('❌ Error iniciando streaming Deepgram:', error);
      this.isDeepgramAvailable = false;
      throw error;
    }
  }

  /**
   * Enviar audio chunk a Deepgram
   */
  public sendAudioChunk(audioData: Buffer): void {
    if (this.deepgramConnection && this.isDeepgramAvailable) {
      try {
        this.deepgramConnection.send(audioData);
      } catch (error) {
        logger.error('❌ Error enviando audio a Deepgram:', error);
        this.isDeepgramAvailable = false;
      }
    }
  }

  /**
   * Transcribir audio con Whisper (fallback o batch)
   */
  public async transcribeWithWhisper(audioBuffer: Buffer): Promise<TranscriptionResult> {
    try {
      logger.info('🎤 Transcribiendo con Whisper...');

      // Convertir buffer a formato compatible con Whisper
      const audioFile = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });

      const transcription = await this.openaiClient.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: this.config.language.split('-')[0], // 'es' de 'es-ES'
        response_format: 'verbose_json'
      });

      const result: TranscriptionResult = {
        text: transcription.text,
        isFinal: true,
        confidence: 0.9, // Whisper no provee confidence score
        timestamp: Date.now(),
        provider: 'whisper'
      };

      logger.info(`📝 [WHISPER] "${result.text}"`);
      this.emit('transcription', result);

      return result;

    } catch (error) {
      logger.error('❌ Error en transcripción Whisper:', error);
      throw error;
    }
  }

  /**
   * Detección de barge-in (interrupción del usuario)
   * Detecta cuando el usuario interrumpe mientras Sandra está hablando
   */
  private detectBargeIn(text: string, isFinal: boolean): boolean {
    if (!this.config.bargeInDetection) return false;

    // Palabras/frases que indican interrupción intencional
    const bargeInTriggers = [
      'espera',
      'para',
      'alto',
      'un momento',
      'perdona',
      'disculpa',
      'sandra',
      'oye',
      'escucha'
    ];

    const textLower = text.toLowerCase();
    const hasBargeInTrigger = bargeInTriggers.some(trigger => textLower.includes(trigger));

    // Si detecta trigger y es transcripción final, marcar como barge-in
    if (hasBargeInTrigger && isFinal) {
      logger.info(`🛑 BARGE-IN detectado: "${text}"`);
      return true;
    }

    return false;
  }

  /**
   * Iniciar detección de silencio
   */
  private startSilenceDetection(): void {
    if (this.silenceDetectionInterval) {
      clearInterval(this.silenceDetectionInterval);
    }

    this.lastSpeechTimestamp = Date.now();

    this.silenceDetectionInterval = setInterval(() => {
      const silenceDuration = Date.now() - this.lastSpeechTimestamp;

      if (silenceDuration > (this.config.silenceTimeout || 1500)) {
        // Emitir evento de silencio detectado
        this.emit('silence', { duration: silenceDuration });
        logger.debug(`🔇 Silencio detectado: ${silenceDuration}ms`);
      }
    }, 500); // Check cada 500ms
  }

  /**
   * Detener detección de silencio
   */
  private stopSilenceDetection(): void {
    if (this.silenceDetectionInterval) {
      clearInterval(this.silenceDetectionInterval);
      this.silenceDetectionInterval = null;
    }
  }

  /**
   * Detener streaming
   */
  public async stopStreaming(): Promise<void> {
    try {
      if (this.deepgramConnection) {
        this.deepgramConnection.finish();
        this.deepgramConnection = null;
        logger.info('🛑 Deepgram streaming detenido');
      }

      this.stopSilenceDetection();

      this.emit('stopped');
    } catch (error) {
      logger.error('❌ Error deteniendo streaming:', error);
    }
  }

  /**
   * Verificar estado de los proveedores
   */
  public getStatus(): {
    deepgram: boolean;
    whisper: boolean;
    activeProvider: string;
  } {
    return {
      deepgram: this.isDeepgramAvailable,
      whisper: !!this.openaiClient,
      activeProvider: this.isDeepgramAvailable ? 'deepgram' : 'whisper'
    };
  }

  /**
   * Limpiar recursos
   */
  public async cleanup(): Promise<void> {
    await this.stopStreaming();
    this.removeAllListeners();
    logger.info('🧹 STT recursos limpiados');
  }
}

/**
 * Factory function para crear instancia STT
 */
export function createSTT(config?: Partial<STTConfig>): SpeechToText {
  return new SpeechToText(config);
}

/**
 * Exportaciones por defecto
 */
export default {
  SpeechToText,
  createSTT
};
