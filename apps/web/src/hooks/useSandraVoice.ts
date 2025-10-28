/**
 * SANDRA IA 7.0 - USESANDRAVOICE HOOK
 * Hook React para integración de voz con LiveKit
 * Maneja: STT, TTS, barge-in, wake word
 *
 * Para Sandrita d - GuestsValencia
 * CALIDAD: GALAXY LEVEL PRO ENTERPRISE
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { LiveKitRoom, useAudioContext, useRoom } from '@livekit/react';
import { LocalParticipant, RemoteParticipant, Room, RoomEvent, Track } from 'livekit-client';

/**
 * Configuración del hook
 */
export interface UseSandraVoiceConfig {
  backendUrl: string;
  roomName: string;
  participantName: string;
  wakeWord?: string;
  enableBargein?: boolean;
  onTranscription?: (text: string, isFinal: boolean) => void;
  onAudioPlay?: (audioBuffer: ArrayBuffer) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: VoiceState) => void;
}

/**
 * Estados del sistema de voz
 */
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'bargein_detected';

/**
 * Datos del hook
 */
export interface UseSandraVoiceReturn {
  // Estados
  state: VoiceState;
  isListening: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
  lastTranscription: string;
  lastError: Error | null;

  // Funciones
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  startSpeaking: (text: string) => Promise<void>;
  stopSpeaking: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  detectWakeWord: (text: string) => boolean;

  // Datos
  token: string | null;
  room: Room | null;
  metrics: VoiceMetrics;
}

/**
 * Métricas de performance
 */
export interface VoiceMetrics {
  sttLatency: number;
  ttsLatency: number;
  llmLatency: number;
  totalLatency: number;
  bargeInCount: number;
  commandsProcessed: number;
  lastUpdate: Date;
}

/**
 * Hook React para conversación de voz con Sandra
 */
export function useSandraVoice(config: UseSandraVoiceConfig): UseSandraVoiceReturn {
  // Estados principales
  const [state, setState] = useState<VoiceState>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [lastTranscription, setLastTranscription] = useState('');
  const [lastError, setLastError] = useState<Error | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<VoiceMetrics>({
    sttLatency: 0,
    ttsLatency: 0,
    llmLatency: 0,
    totalLatency: 0,
    bargeInCount: 0,
    commandsProcessed: 0,
    lastUpdate: new Date()
  });

  // Referencias internas
  const roomRef = useRef<Room | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const wakeWordRef = useRef(config.wakeWord || 'Hola Sandra');

  /**
   * Obtener token de LiveKit
   */
  const getToken = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch(`${config.backendUrl}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: config.roomName,
          participantName: config.participantName
        })
      });

      if (!response.ok) {
        throw new Error(`Error obteniendo token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setLastError(err);
      throw err;
    }
  }, [config]);

  /**
   * Conectar a LiveKit
   */
  const connect = useCallback(async () => {
    try {
      setState('processing');

      // Obtener token
      const newToken = await getToken();
      setToken(newToken);

      // Crear conexión WebSocket para streaming STT
      const wsUrl = `ws://${new URL(config.backendUrl).host}/stt-stream`;
      webSocketRef.current = new WebSocket(wsUrl);

      webSocketRef.current.onopen = () => {
        console.log(' WebSocket STT conectado');
      };

      webSocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'transcription') {
          setLastTranscription(data.text);
          config.onTranscription?.(data.text, data.isFinal);

          // Detectar barge-in
          if (config.enableBargein && data.isFinal && data.bargeIn) {
            setState('bargein_detected');
            setMetrics(prev => ({ ...prev, bargeInCount: prev.bargeInCount + 1 }));
          }
        }
      };

      webSocketRef.current.onerror = (error) => {
        console.error('L Error WebSocket:', error);
        setLastError(new Error('Error en conexión STT'));
      };

      setState('idle');
      setIsConnected(true);
      config.onStateChange?.('idle');

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setState('error');
      setLastError(err);
      config.onStateChange?.('error');
      throw err;
    }
  }, [config, getToken]);

  /**
   * Desconectar de LiveKit
   */
  const disconnect = useCallback(async () => {
    try {
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }

      if (roomRef.current) {
        await roomRef.current.disconnect();
        roomRef.current = null;
      }

      setIsConnected(false);
      setState('idle');
      config.onStateChange?.('idle');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setLastError(err);
      throw err;
    }
  }, [config]);

  /**
   * Iniciar escucha de voz
   */
  const startListening = useCallback(async () => {
    try {
      if (!navigator.mediaDevices) {
        throw new Error('Dispositivo sin soporte de audio');
      }

      setState('listening');
      config.onStateChange?.('listening');

      // Obtener acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });

      mediaStreamRef.current = stream;

      // Enviar audio a través de WebSocket
      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamAudioSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (event) => {
          const audioData = event.inputBuffer.getChannelData(0);
          const int16Data = Float32ToInt16(audioData);
          webSocketRef.current?.send(int16Data);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setState('error');
      setLastError(err);
      config.onError?.(err);
    }
  }, [config]);

  /**
   * Detener escucha de voz
   */
  const stopListening = useCallback(async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      setState('idle');
      config.onStateChange?.('idle');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setLastError(err);
    }
  }, [config]);

  /**
   * Iniciar reproducción de voz (TTS)
   */
  const startSpeaking = useCallback(async (text: string) => {
    try {
      setState('speaking');
      config.onStateChange?.('speaking');

      const startTime = performance.now();

      // Solicitar síntesis al backend
      const response = await fetch(`${config.backendUrl}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`Error en TTS: ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const latency = performance.now() - startTime;

      // Reproducir audio
      const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer_ = await audioContext.decodeAudioData(audioBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer_;
      source.connect(audioContext.destination);
      source.start(0);

      config.onAudioPlay?.(audioBuffer);

      // Actualizar métricas
      setMetrics(prev => ({
        ...prev,
        ttsLatency: latency,
        lastUpdate: new Date()
      }));

      // Esperar a que termine
      await new Promise(resolve => {
        source.onended = resolve;
      });

      setState('idle');
      config.onStateChange?.('idle');

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setState('error');
      setLastError(err);
      config.onError?.(err);
    }
  }, [config]);

  /**
   * Detener reproducción de voz
   */
  const stopSpeaking = useCallback(async () => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setState('idle');
      config.onStateChange?.('idle');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error desconocido');
      setLastError(err);
    }
  }, [config]);

  /**
   * Detectar wake word
   */
  const detectWakeWord = useCallback((text: string): boolean => {
    return text.toLowerCase().includes(wakeWordRef.current.toLowerCase());
  }, []);

  /**
   * Limpiar recursos al desmontar
   */
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    state,
    isListening: state === 'listening',
    isSpeaking: state === 'speaking',
    isConnected,
    lastTranscription,
    lastError,
    startListening,
    stopListening,
    startSpeaking,
    stopSpeaking,
    connect,
    disconnect,
    detectWakeWord,
    token,
    room: roomRef.current,
    metrics
  };
}

/**
 * Convertir Float32 a Int16
 */
function Float32ToInt16(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    int16Array[i] = float32Array[i] < 0
      ? float32Array[i] * 0x8000
      : float32Array[i] * 0x7fff;
  }
  return int16Array;
}

/**
 * Export
 */
export default useSandraVoice;
