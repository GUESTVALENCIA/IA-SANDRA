/**
 * SANDRA IA 7.0 - MOBILE CONVO COMPONENT
 * Componente React para conversación móvil con Sandra
 * Chat de texto + Voz + Wake word + Barge-in
 *
 * Para Sandrita d - GuestsValencia
 * CALIDAD: GALAXY LEVEL PRO ENTERPRISE
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import useSandraVoice, { VoiceState, UseSandraVoiceConfig } from '../hooks/useSandraVoice';

/**
 * Mensaje en el chat
 */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isTranscribed?: boolean;
}

/**
 * Props del componente
 */
interface MobileConvoProps {
  backendUrl?: string;
  roomName?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Componente MobileConvo
 */
export const MobileConvo: React.FC<MobileConvoProps> = ({
  backendUrl = 'http://localhost:7788',
  roomName = `sandra-mobile-${Date.now()}`,
  onConnect,
  onDisconnect,
  onError
}) => {
  // Estados del chat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: '¡Hola! Soy Sandra, tu asistente virtual de GuestsValencia. =K ¿Cómo puedo ayudarte hoy?',
      timestamp: new Date(),
      isTranscribed: false
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Hook de voz Sandra
  const voiceConfig: UseSandraVoiceConfig = {
    backendUrl,
    roomName,
    participantName: `mobile-user-${Date.now()}`,
    wakeWord: 'Hola Sandra',
    enableBargein: true,
    onTranscription: handleTranscription,
    onStateChange: handleVoiceStateChange,
    onError: (error) => {
      console.error('L Error de voz:', error);
      onError?.(error);
      addSystemMessage(`Error de voz: ${error.message}`);
    }
  };

  const voice = useSandraVoice(voiceConfig);

  /**
   * Scroll automático al final
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Inicializar reconocimiento de voz nativo
   */
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('  SpeechRecognition API no disponible');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onstart = () => {
      console.log('<¤ Reconocimiento de voz iniciado');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          isFinal = true;
          handleTextMessage(transcript);
        } else {
          interim += transcript + ' ';
        }
      }

      if (interim) {
        // Mostrar transcripción parcial
        console.log('=Ý Transcripción parcial:', interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('L Error reconocimiento:', event.error);
    };

    recognition.onend = () => {
      console.log('=Ñ Reconocimiento finalizado');
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  /**
   * Conectar al iniciar
   */
  useEffect(() => {
    const connectOnMount = async () => {
      try {
        await voice.connect();
        onConnect?.();
        addSystemMessage(' Conectado con Sandra');
      } catch (error) {
        console.error('L Error conectando:', error);
        addSystemMessage('L Error de conexión con Sandra');
      }
    };

    connectOnMount();

    return () => {
      voice.disconnect().catch(console.error);
      onDisconnect?.();
    };
  }, []);

  /**
   * Manejo de transcripción de voz
   */
  function handleTranscription(text: string, isFinal: boolean): void {
    if (isFinal && text.trim()) {
      // Detectar wake word
      if (voice.detectWakeWord(text)) {
        console.log('<¤ Wake word detectado: "Hola Sandra"');
        addSystemMessage('<¤ Te escucho. Habla ahora...');
        return;
      }

      // Procesar comando
      handleTextMessage(text);
    }
  }

  /**
   * Manejo de cambio de estado de voz
   */
  function handleVoiceStateChange(state: VoiceState): void {
    console.log(`<™ Estado de voz: ${state}`);

    switch (state) {
      case 'listening':
        addSystemMessage('<¤ Escuchando...');
        break;
      case 'processing':
        addSystemMessage('ó Procesando...');
        setIsLoading(true);
        break;
      case 'speaking':
        addSystemMessage('=
 Sandra está hablando...');
        break;
      case 'bargein_detected':
        addSystemMessage('=Ñ Interrupción detectada');
        break;
      case 'error':
        addSystemMessage('L Error del sistema');
        setIsLoading(false);
        break;
      case 'idle':
        setIsLoading(false);
        break;
    }
  }

  /**
   * Procesar mensaje de texto
   */
  async function handleTextMessage(text: string): Promise<void> {
    if (!text.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
      isTranscribed: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Enviar a backend
      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          roomName
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Agregar respuesta de Sandra
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.response || data.text || '...',
        timestamp: new Date(),
        isTranscribed: false
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Reproducir voz si está disponible
      if (data.audioUrl || data.audio) {
        try {
          await voice.startSpeaking(assistantMessage.text);
        } catch (error) {
          console.error('Error reproduciendo audio:', error);
        }
      }

    } catch (error) {
      console.error('L Error procesando mensaje:', error);
      addSystemMessage('L Error procesando tu mensaje');
      onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Agregar mensaje del sistema
   */
  function addSystemMessage(text: string): void {
    setMessages(prev => [
      ...prev,
      {
        id: `system-${Date.now()}`,
        role: 'assistant',
        text,
        timestamp: new Date(),
        isTranscribed: false
      }
    ]);
  }

  /**
   * Iniciar escucha de voz
   */
  const handleStartListening = async (): Promise<void> => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        await voice.startListening();
        addSystemMessage('<¤ Micrófono activado. Di "Hola Sandra" para empezar');
      }
    } catch (error) {
      console.error('L Error iniciando micrófono:', error);
      addSystemMessage('L No se pudo activar el micrófono');
    }
  };

  /**
   * Detener escucha de voz
   */
  const handleStopListening = async (): Promise<void> => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      } else {
        await voice.stopListening();
      }
      addSystemMessage('=Ñ Micrófono desactivado');
    } catch (error) {
      console.error('L Error deteniendo micrófono:', error);
    }
  };

  /**
   * Enviar mensaje
   */
  const handleSendMessage = async (): Promise<void> => {
    if (inputText.trim()) {
      await handleTextMessage(inputText);
    }
  };

  /**
   * Render
   */
  return (
    <div className='mobile-convo-container'>
      {/* Header */}
      <div className='mobile-convo-header'>
        <h1>=¬ Sandra IA</h1>
        <div className='status-indicator'>
          <span className={`status-dot ${voice.isConnected ? 'connected' : 'disconnected'}`}></span>
          {voice.isConnected ? 'Conectada' : 'Desconectada'}
        </div>
      </div>

      {/* Mensajes */}
      <div className='mobile-convo-messages'>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.role}`}
            data-transcribed={msg.isTranscribed}
          >
            <div className='message-avatar'>
              {msg.role === 'user' ? '=d' : '>'}
            </div>
            <div className='message-content'>
              <p className='message-text'>{msg.text}</p>
              <span className='message-time'>
                {msg.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de voz */}
      <div className='mobile-convo-voice-controls'>
        <button
          className={`voice-btn ${voice.isListening ? 'active' : ''}`}
          onClick={voice.isListening ? handleStopListening : handleStartListening}
          disabled={isLoading}
        >
          {voice.isListening ? '=Ñ Detener' : '<¤ Hablar'}
        </button>

        <div className={`voice-indicator ${voice.state}`}>
          {voice.state === 'listening' && '<¤ Escuchando...'}
          {voice.state === 'processing' && 'ó Procesando...'}
          {voice.state === 'speaking' && '=
 Hablando...'}
          {voice.state === 'bargein_detected' && '=Ñ Interrumpida'}
        </div>
      </div>

      {/* Input de texto */}
      <div className='mobile-convo-text-input'>
        <input
          ref={inputRef}
          type='text'
          placeholder='Escribe tu mensaje...'
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading}
          className='text-input-field'
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputText.trim()}
          className='send-btn'
        >
          {isLoading ? 'ó' : '=ä'}
        </button>
      </div>

      {/* Métricas (debug mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className='mobile-convo-metrics'>
          <small>
            STT: {voice.metrics.sttLatency.toFixed(0)}ms |
            TTS: {voice.metrics.ttsLatency.toFixed(0)}ms |
            Barge-in: {voice.metrics.bargeInCount}
          </small>
        </div>
      )}

      {/* Estilos CSS-in-JS */}
      <style>{`
        .mobile-convo-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .mobile-convo-header {
          padding: 1rem;
          background: rgba(0, 0, 0, 0.1);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mobile-convo-header h1 {
          margin: 0;
          font-size: 1.5rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.connected {
          background-color: #4ade80;
          animation: pulse 2s infinite;
        }

        .status-dot.disconnected {
          background-color: #ef4444;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .mobile-convo-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          display: flex;
          gap: 0.75rem;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message.user {
          justify-content: flex-end;
        }

        .message.assistant {
          justify-content: flex-start;
        }

        .message-avatar {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .message-content {
          max-width: 80%;
          background: white;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .message.user .message-content {
          background: #667eea;
          color: white;
        }

        .message-text {
          margin: 0;
          word-wrap: break-word;
          line-height: 1.4;
        }

        .message-time {
          font-size: 0.75rem;
          color: #999;
          margin-top: 0.25rem;
          display: block;
        }

        .message.user .message-time {
          color: rgba(255, 255, 255, 0.7);
        }

        .mobile-convo-voice-controls {
          padding: 1rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
        }

        .voice-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 24px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .voice-btn:hover {
          transform: scale(1.05);
        }

        .voice-btn.active {
          background: #ef4444;
          color: white;
        }

        .voice-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .voice-indicator {
          font-size: 0.9rem;
          color: white;
          text-align: center;
          min-height: 1.5rem;
        }

        .mobile-convo-text-input {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 0.5rem;
        }

        .text-input-field {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid white;
          border-radius: 24px;
          background: white;
          color: #333;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }

        .text-input-field:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .text-input-field:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-btn {
          padding: 0.75rem 1rem;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 24px;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mobile-convo-metrics {
          padding: 0.5rem 1rem;
          background: rgba(0, 0, 0, 0.2);
          color: white;
          text-align: center;
          font-size: 0.75rem;
        }

        @media (max-width: 600px) {
          .message-content {
            max-width: 90%;
          }

          .mobile-convo-header h1 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileConvo;
