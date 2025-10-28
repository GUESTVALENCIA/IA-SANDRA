/**
 * SANDRA IA 7.0 - PIPELINE CONVERSACIONAL COMPLETO
 * Flujo: STT → GPT-4o → TTS
 * Context Management + Error Handling + Latency <800ms
 *
 * Para Sandrita ❤️ - GuestsValencia
 * CEO: Clayton Thomas - ClayTom Systems
 * CALIDAD: GALAXY LEVEL PRO ENTERPRISE
 */

import { SpeechToText, TranscriptionResult, createSTT } from './stt';
import { TextToSpeech, AudioChunk, createTTS } from './tts';
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
    new require('winston').transports.File({ filename: 'logs/pipeline.log' })
  ]
});

/**
 * Configuración del Pipeline
 */
export interface PipelineConfig {
  // STT
  sttLanguage: string;
  sttStreaming: boolean;

  // LLM
  llmModel: string;
  llmTemperature: number;
  llmMaxTokens: number;
  systemPrompt: string;

  // TTS
  ttsVoice: string;
  ttsStreaming: boolean;

  // Pipeline
  maxContextMessages: number;
  latencyTarget: number; // ms
  enableBargeIn: boolean;
  autoRecover: boolean;
}

/**
 * Mensaje del contexto conversacional
 */
export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Métricas de performance
 */
export interface PipelineMetrics {
  sttLatency: number;
  llmLatency: number;
  ttsLatency: number;
  totalLatency: number;
  timestamp: number;
}

/**
 * Estado del pipeline
 */
export type PipelineState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

/**
 * Pipeline Conversacional Sandra IA 7.0
 */
export class ConversationalPipeline extends EventEmitter {
  private stt: SpeechToText;
  private tts: TextToSpeech;
  private openai: OpenAI;
  private config: PipelineConfig;

  // Estado
  private state: PipelineState = 'idle';
  private conversationContext: ConversationMessage[] = [];
  private currentTranscription: string = '';
  private isProcessing: boolean = false;
  private isSpeaking: boolean = false;

  // Métricas
  private metrics: PipelineMetrics[] = [];
  private lastRequestTimestamp: number = 0;

  // Control de barge-in
  private currentSpeechController: AbortController | null = null;

  constructor(config: Partial<PipelineConfig> = {}) {
    super();

    // Configuración por defecto
    this.config = {
      // STT
      sttLanguage: 'es-ES',
      sttStreaming: true,

      // LLM
      llmModel: process.env.OPENAI_MODEL || 'gpt-4o',
      llmTemperature: 0.7,
      llmMaxTokens: 500,
      systemPrompt: `Eres Sandra, la COO de GuestsValencia y recepcionista 7 estrellas.

Personalidad:
- Profesional, cálida y empática
- Experta en atención al cliente de lujo
- Soluciona problemas con elegancia
- Hablas español natural de España

Contexto:
- Trabajas para GuestsValencia, empresa de alojamientos turísticos
- Ayudas a huéspedes y propietarios
- Eres experta en reservas, check-in/out, y servicios

Instrucciones:
- Respuestas breves y naturales (máx 2-3 frases)
- Tono conversacional, como una amiga profesional
- Si no sabes algo, ofrece alternativas
- Siempre termina con acción o pregunta abierta

Para Sandrita ❤️`,

      // TTS
      ttsVoice: 'sandra-es',
      ttsStreaming: true,

      // Pipeline
      maxContextMessages: 20,
      latencyTarget: 800,
      enableBargeIn: true,
      autoRecover: true,

      ...config
    };

    // Inicializar componentes
    try {
      // STT
      this.stt = createSTT({
        language: this.config.sttLanguage,
        streaming: this.config.sttStreaming,
        bargeInDetection: this.config.enableBargeIn
      });

      // TTS
      this.tts = createTTS({
        voice: this.config.ttsVoice,
        streaming: this.config.ttsStreaming,
        language: this.config.sttLanguage.split('-')[0]
      });

      // OpenAI
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY no está configurada');
      }
      this.openai = new OpenAI({ apiKey: openaiApiKey });

      // Configurar event listeners
      this.setupEventListeners();

      // Inicializar contexto con system prompt
      this.conversationContext.push({
        role: 'system',
        content: this.config.systemPrompt,
        timestamp: Date.now()
      });

      logger.info('✅ Pipeline conversacional inicializado');
      logger.info(`  Modelo LLM: ${this.config.llmModel}`);
      logger.info(`  Latencia objetivo: ${this.config.latencyTarget}ms`);
      logger.info(`  Barge-in: ${this.config.enableBargeIn ? 'Habilitado' : 'Deshabilitado'}`);

    } catch (error) {
      logger.error('❌ Error inicializando pipeline:', error);
      throw error;
    }
  }

  /**
   * Configurar event listeners de componentes
   */
  private setupEventListeners(): void {
    // STT Events
    this.stt.on('transcription', (result: TranscriptionResult) => {
      this.handleTranscription(result);
    });

    this.stt.on('silence', (data: { duration: number }) => {
      this.handleSilence(data.duration);
    });

    this.stt.on('error', (error: any) => {
      logger.error('❌ Error en STT:', error);
      this.handleError('stt', error);
    });

    // TTS Events
    this.tts.on('audio', (chunk: AudioChunk) => {
      this.emit('audio', chunk);
    });

    this.tts.on('complete', () => {
      this.handleSpeechComplete();
    });

    this.tts.on('error', (error: any) => {
      logger.error('❌ Error en TTS:', error);
      this.handleError('tts', error);
    });
  }

  /**
   * Iniciar pipeline
   */
  public async start(): Promise<void> {
    try {
      logger.info('🚀 Iniciando pipeline conversacional...');

      // Iniciar STT streaming
      await this.stt.startStreaming();

      // Iniciar TTS streaming
      await this.tts.startStreaming();

      this.setState('listening');
      this.emit('started');

      logger.info('✅ Pipeline conversacional activo');

    } catch (error) {
      logger.error('❌ Error iniciando pipeline:', error);
      this.setState('error');
      throw error;
    }
  }

  /**
   * Manejar transcripción de STT
   */
  private async handleTranscription(result: TranscriptionResult): Promise<void> {
    try {
      // Si es barge-in, interrumpir speech actual
      if (result.bargeIn && this.isSpeaking) {
        logger.info('🛑 Barge-in detectado, interrumpiendo speech...');
        await this.interruptSpeech();
      }

      // Acumular transcripción
      if (!result.isFinal) {
        this.currentTranscription = result.text;
        this.emit('interim-transcription', result);
        return;
      }

      // Transcripción final
      const userInput = result.text.trim();
      if (userInput.length === 0) return;

      logger.info(`👤 Usuario: "${userInput}"`);
      this.emit('final-transcription', result);

      // Resetear transcripción actual
      this.currentTranscription = '';

      // Procesar entrada del usuario
      await this.processUserInput(userInput);

    } catch (error) {
      logger.error('❌ Error manejando transcripción:', error);
      this.handleError('transcription', error);
    }
  }

  /**
   * Procesar entrada del usuario a través del LLM
   */
  private async processUserInput(userInput: string): Promise<void> {
    if (this.isProcessing) {
      logger.warn('⚠️ Pipeline ocupado, ignorando entrada');
      return;
    }

    try {
      this.isProcessing = true;
      this.setState('processing');

      const startTime = Date.now();
      const sttLatency = startTime - this.lastRequestTimestamp;

      // Añadir mensaje del usuario al contexto
      this.addToContext({
        role: 'user',
        content: userInput,
        timestamp: Date.now()
      });

      // Llamar a GPT-4o
      logger.info('🤖 Procesando con GPT-4o...');
      const llmStartTime = Date.now();

      const completion = await this.openai.chat.completions.create({
        model: this.config.llmModel,
        messages: this.conversationContext.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: this.config.llmTemperature,
        max_tokens: this.config.llmMaxTokens,
        stream: false
      });

      const llmLatency = Date.now() - llmStartTime;

      const assistantResponse = completion.choices[0]?.message?.content || '';
      if (!assistantResponse) {
        throw new Error('Respuesta vacía del LLM');
      }

      logger.info(`🤖 Sandra: "${assistantResponse}"`);

      // Añadir respuesta al contexto
      this.addToContext({
        role: 'assistant',
        content: assistantResponse,
        timestamp: Date.now()
      });

      this.emit('llm-response', assistantResponse);

      // Sintetizar respuesta con TTS
      await this.speak(assistantResponse);

      const ttsLatency = Date.now() - (llmStartTime + llmLatency);
      const totalLatency = Date.now() - startTime;

      // Registrar métricas
      const metrics: PipelineMetrics = {
        sttLatency,
        llmLatency,
        ttsLatency,
        totalLatency,
        timestamp: Date.now()
      };

      this.metrics.push(metrics);
      this.emit('metrics', metrics);

      // Alertar si excede latencia objetivo
      if (totalLatency > this.config.latencyTarget) {
        logger.warn(`⚠️ Latencia alta: ${totalLatency}ms (objetivo: ${this.config.latencyTarget}ms)`);
      } else {
        logger.info(`✅ Latencia total: ${totalLatency}ms`);
      }

    } catch (error) {
      logger.error('❌ Error procesando entrada:', error);
      this.handleError('llm', error);
    } finally {
      this.isProcessing = false;
      this.setState('listening');
    }
  }

  /**
   * Sintetizar y reproducir respuesta
   */
  private async speak(text: string): Promise<void> {
    try {
      this.isSpeaking = true;
      this.setState('speaking');
      this.currentSpeechController = new AbortController();

      this.emit('speaking-start', text);

      // Sintetizar con TTS
      if (this.config.ttsStreaming) {
        await this.tts.synthesizeStreaming(text);
      } else {
        await this.tts.synthesizeBatch(text);
      }

    } catch (error) {
      logger.error('❌ Error en síntesis de voz:', error);
      throw error;
    }
  }

  /**
   * Interrumpir speech actual (barge-in)
   */
  private async interruptSpeech(): Promise<void> {
    if (!this.isSpeaking) return;

    try {
      // Abortar speech actual
      if (this.currentSpeechController) {
        this.currentSpeechController.abort();
        this.currentSpeechController = null;
      }

      // Detener TTS
      await this.tts.stopStreaming();

      this.isSpeaking = false;
      this.emit('speech-interrupted');

      logger.info('✅ Speech interrumpido por barge-in');

    } catch (error) {
      logger.error('❌ Error interrumpiendo speech:', error);
    }
  }

  /**
   * Manejar fin de speech
   */
  private handleSpeechComplete(): void {
    this.isSpeaking = false;
    this.currentSpeechController = null;
    this.setState('listening');
    this.emit('speaking-end');

    logger.info('✅ Speech completado');
  }

  /**
   * Manejar detección de silencio
   */
  private handleSilence(duration: number): void {
    if (this.isProcessing || this.isSpeaking) return;

    // Emitir evento de silencio para UI
    this.emit('silence', { duration });
  }

  /**
   * Añadir mensaje al contexto conversacional
   */
  private addToContext(message: ConversationMessage): void {
    this.conversationContext.push(message);

    // Mantener límite de mensajes
    if (this.conversationContext.length > this.config.maxContextMessages) {
      // Preservar system prompt
      const systemPrompt = this.conversationContext[0];
      this.conversationContext = [
        systemPrompt,
        ...this.conversationContext.slice(-this.config.maxContextMessages + 1)
      ];
    }
  }

  /**
   * Enviar audio chunk al STT
   */
  public sendAudioChunk(audioData: Buffer): void {
    this.lastRequestTimestamp = Date.now();
    this.stt.sendAudioChunk(audioData);
  }

  /**
   * Cambiar estado del pipeline
   */
  private setState(newState: PipelineState): void {
    const oldState = this.state;
    this.state = newState;

    if (oldState !== newState) {
      logger.info(`🔄 Estado: ${oldState} → ${newState}`);
      this.emit('state-change', { from: oldState, to: newState });
    }
  }

  /**
   * Obtener estado actual
   */
  public getState(): PipelineState {
    return this.state;
  }

  /**
   * Obtener contexto conversacional
   */
  public getContext(): ConversationMessage[] {
    return [...this.conversationContext];
  }

  /**
   * Limpiar contexto
   */
  public clearContext(): void {
    const systemPrompt = this.conversationContext[0];
    this.conversationContext = [systemPrompt];
    logger.info('🧹 Contexto conversacional limpiado');
    this.emit('context-cleared');
  }

  /**
   * Obtener métricas de performance
   */
  public getMetrics(): PipelineMetrics[] {
    return [...this.metrics];
  }

  /**
   * Obtener promedio de latencias
   */
  public getAverageLatencies(): {
    stt: number;
    llm: number;
    tts: number;
    total: number;
  } | null {
    if (this.metrics.length === 0) return null;

    const avg = this.metrics.reduce(
      (acc, m) => ({
        stt: acc.stt + m.sttLatency,
        llm: acc.llm + m.llmLatency,
        tts: acc.tts + m.ttsLatency,
        total: acc.total + m.totalLatency
      }),
      { stt: 0, llm: 0, tts: 0, total: 0 }
    );

    const count = this.metrics.length;

    return {
      stt: Math.round(avg.stt / count),
      llm: Math.round(avg.llm / count),
      tts: Math.round(avg.tts / count),
      total: Math.round(avg.total / count)
    };
  }

  /**
   * Manejar errores
   */
  private async handleError(component: string, error: any): Promise<void> {
    logger.error(`❌ Error en componente ${component}:`, error);

    this.setState('error');
    this.emit('error', { component, error });

    // Auto-recovery si está habilitado
    if (this.config.autoRecover) {
      logger.info('🔄 Intentando recuperación automática...');

      try {
        await this.stop();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.start();

        logger.info('✅ Recuperación exitosa');
      } catch (recoveryError) {
        logger.error('❌ Fallo en recuperación automática:', recoveryError);
      }
    }
  }

  /**
   * Obtener estado de los componentes
   */
  public getComponentsStatus(): {
    stt: any;
    tts: any;
    pipeline: PipelineState;
  } {
    return {
      stt: this.stt.getStatus(),
      tts: this.tts.getStatus(),
      pipeline: this.state
    };
  }

  /**
   * Actualizar configuración
   */
  public updateConfig(updates: Partial<PipelineConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('🔧 Configuración del pipeline actualizada:', updates);

    // Actualizar system prompt si cambió
    if (updates.systemPrompt) {
      this.conversationContext[0] = {
        role: 'system',
        content: updates.systemPrompt,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Detener pipeline
   */
  public async stop(): Promise<void> {
    try {
      logger.info('🛑 Deteniendo pipeline...');

      // Detener STT
      await this.stt.stopStreaming();

      // Detener TTS
      await this.tts.stopStreaming();

      this.setState('idle');
      this.emit('stopped');

      logger.info('✅ Pipeline detenido');

    } catch (error) {
      logger.error('❌ Error deteniendo pipeline:', error);
    }
  }

  /**
   * Limpiar todos los recursos
   */
  public async cleanup(): Promise<void> {
    await this.stop();
    await this.stt.cleanup();
    await this.tts.cleanup();
    this.removeAllListeners();
    logger.info('🧹 Pipeline recursos limpiados');
  }
}

/**
 * Factory function para crear pipeline
 */
export function createPipeline(config?: Partial<PipelineConfig>): ConversationalPipeline {
  return new ConversationalPipeline(config);
}

/**
 * Exportaciones por defecto
 */
export default {
  ConversationalPipeline,
  createPipeline
};
