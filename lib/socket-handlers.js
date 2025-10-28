// SANDRA IA - SOCKET.IO EVENT HANDLERS
// Handles all Socket.IO events for real-time communication
// Architecture: Namespace /sandra, rooms by user_id

const { Anthropic } = require('@anthropic-ai/sdk');
const AudioProcessor = require('./audio-processor');

class SocketHandlers {
  constructor(io, config = {}) {
    this.io = io;
    this.config = {
      anthropicApiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
      cartesiaApiKey: config.cartesiaApiKey || process.env.CARTESIA_API_KEY,
      cartesiaVoiceId: config.cartesiaVoiceId || process.env.CARTESIA_VOICE_ID,
      namespace: config.namespace || '/sandra',
      maxLatency: config.maxLatency || 500, // ms
      ...config
    };

    // Initialize Anthropic client
    this.anthropic = new Anthropic({
      apiKey: this.config.anthropicApiKey
    });

    // Audio processor
    this.audioProcessor = new AudioProcessor({
      cartesiaApiKey: this.config.cartesiaApiKey,
      cartesiaVoiceId: this.config.cartesiaVoiceId
    });

    // Session state tracking
    this.sessions = new Map();

    console.log('✅ Socket handlers initialized');
  }

  // Register all event handlers for a socket
  registerHandlers(socket) {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Connection lifecycle
    socket.on('disconnect', () => this.handleDisconnect(socket));
    socket.on('error', (error) => this.handleError(socket, error));

    // Authentication
    socket.on('authenticate', (data) => this.handleAuthenticate(socket, data));

    // Conversation events
    socket.on('call:start', (data) => this.handleCallStart(socket, data));
    socket.on('call:end', (data) => this.handleCallEnd(socket, data));
    socket.on('user:message', (data) => this.handleUserMessage(socket, data));
    socket.on('barge-in', (data) => this.handleBargeIn(socket, data));

    // Audio streaming
    socket.on('audio:stream', (data) => this.handleAudioStream(socket, data));
    socket.on('audio:chunk', (data) => this.handleAudioChunk(socket, data));
    socket.on('audio:end', (data) => this.handleAudioEnd(socket, data));

    // State sync
    socket.on('state:update', (data) => this.handleStateUpdate(socket, data));
    socket.on('ping', () => this.handlePing(socket));
  }

  // === CONNECTION HANDLERS ===

  async handleAuthenticate(socket, data) {
    try {
      const { userId, token } = data;

      // TODO: Implement JWT verification
      // For now, simple validation
      if (!userId) {
        socket.emit('error', { message: 'User ID required' });
        return;
      }

      // Join user-specific room
      const roomId = `user_${userId}`;
      await socket.join(roomId);

      // Initialize session
      this.sessions.set(socket.id, {
        userId,
        roomId,
        authenticated: true,
        connectedAt: Date.now(),
        conversationHistory: [],
        audioBuffer: []
      });

      console.log(`✅ Authenticated: ${userId} (${socket.id}) -> room: ${roomId}`);

      socket.emit('authenticated', {
        success: true,
        userId,
        roomId,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Authentication error:', error);
      socket.emit('error', { message: 'Authentication failed', error: error.message });
    }
  }

  handleDisconnect(socket) {
    const session = this.sessions.get(socket.id);

    if (session) {
      console.log(`🔌 Client disconnected: ${session.userId} (${socket.id})`);

      // Cleanup session
      if (session.audioBuffer) {
        session.audioBuffer = [];
      }

      this.sessions.delete(socket.id);
    } else {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    }
  }

  handleError(socket, error) {
    console.error(`❌ Socket error for ${socket.id}:`, error);
    socket.emit('error', { message: error.message || 'Unknown error' });
  }

  handlePing(socket) {
    socket.emit('pong', { timestamp: Date.now() });
  }

  // === CONVERSATION HANDLERS ===

  async handleCallStart(socket, data) {
    try {
      const session = this.sessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      console.log(`📞 Call started: ${session.userId}`);

      session.callActive = true;
      session.callStartedAt = Date.now();
      session.conversationHistory = [];

      socket.emit('call:started', {
        success: true,
        timestamp: Date.now()
      });

      // Send initial greeting
      await this.sendSandraMessage(socket, {
        message: '¡Hola! Soy Sandra, tu asistente inteligente. ¿En qué puedo ayudarte hoy?',
        isGreeting: true
      });

    } catch (error) {
      console.error('❌ Call start error:', error);
      socket.emit('error', { message: 'Failed to start call', error: error.message });
    }
  }

  async handleCallEnd(socket, data) {
    try {
      const session = this.sessions.get(socket.id);
      if (!session) {
        return;
      }

      console.log(`📞 Call ended: ${session.userId}`);

      const duration = session.callStartedAt ? Date.now() - session.callStartedAt : 0;

      session.callActive = false;
      session.audioBuffer = [];

      socket.emit('call:ended', {
        success: true,
        duration,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Call end error:', error);
    }
  }

  async handleUserMessage(socket, data) {
    try {
      const session = this.sessions.get(socket.id);
      if (!session || !session.authenticated) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { message, type = 'text' } = data;

      if (!message) {
        socket.emit('error', { message: 'Message is required' });
        return;
      }

      console.log(`💬 User message from ${session.userId}: ${message.substring(0, 50)}...`);

      // Add to conversation history
      session.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: Date.now()
      });

      // Emit typing indicator
      socket.emit('sandra:typing', { isTyping: true });

      // Get Claude response
      const response = await this.getClaudeResponse(session.conversationHistory);

      // Add to history
      session.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      });

      // Stop typing indicator
      socket.emit('sandra:typing', { isTyping: false });

      // Send response
      await this.sendSandraMessage(socket, {
        message: response,
        type: 'text'
      });

    } catch (error) {
      console.error('❌ User message error:', error);
      socket.emit('sandra:typing', { isTyping: false });
      socket.emit('error', { message: 'Failed to process message', error: error.message });
    }
  }

  async handleBargeIn(socket, data) {
    try {
      const session = this.sessions.get(socket.id);
      if (!session) {
        return;
      }

      console.log(`🛑 BARGE-IN detected: ${session.userId}`);

      // Stop current Sandra audio/response
      socket.emit('sandra:interrupted', {
        timestamp: Date.now()
      });

      // Clear audio buffer
      session.audioBuffer = [];

      // Emit acknowledgment
      socket.emit('barge-in:ack', {
        success: true,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Barge-in error:', error);
    }
  }

  // === AUDIO STREAMING HANDLERS ===

  async handleAudioStream(socket, data) {
    try {
      const session = this.sessions.get(socket.id);
      if (!session) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      console.log(`🎤 Audio stream started: ${session.userId}`);

      session.audioStreaming = true;
      session.audioBuffer = [];

      socket.emit('audio:stream:ack', {
        success: true,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Audio stream error:', error);
      socket.emit('error', { message: 'Failed to start audio stream', error: error.message });
    }
  }

  async handleAudioChunk(socket, data) {
    try {
      const session = this.sessions.get(socket.id);
      if (!session || !session.audioStreaming) {
        return;
      }

      const { chunk, sequence } = data;

      if (!chunk) {
        return;
      }

      // Add to buffer
      session.audioBuffer.push({
        chunk,
        sequence,
        receivedAt: Date.now()
      });

      // Optional: Emit acknowledgment for large transfers
      if (sequence % 10 === 0) {
        socket.emit('audio:chunk:ack', { sequence });
      }

    } catch (error) {
      console.error('❌ Audio chunk error:', error);
    }
  }

  async handleAudioEnd(socket, data) {
    try {
      const session = this.sessions.get(socket.id);
      if (!session || !session.audioStreaming) {
        return;
      }

      console.log(`🎤 Audio stream ended: ${session.userId} (${session.audioBuffer.length} chunks)`);

      session.audioStreaming = false;

      // Process audio buffer
      if (session.audioBuffer.length > 0) {
        await this.processAudioBuffer(socket, session);
      }

      socket.emit('audio:end:ack', {
        success: true,
        chunksReceived: session.audioBuffer.length,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Audio end error:', error);
      socket.emit('error', { message: 'Failed to process audio', error: error.message });
    }
  }

  // === HELPER METHODS ===

  async getClaudeResponse(conversationHistory) {
    try {
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: messages,
        system: 'Eres Sandra, una asistente virtual amable y profesional. Respondes de forma concisa y útil. Tu usuario es Sandrita, una niña de 7 años, así que usa un lenguaje apropiado y educativo.'
      });

      return response.content[0].text;

    } catch (error) {
      console.error('❌ Claude API error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  async sendSandraMessage(socket, data) {
    const { message, type = 'text', isGreeting = false } = data;

    // Emit text response
    socket.emit('sandra:response', {
      message,
      type,
      timestamp: Date.now()
    });

    // Generate and stream audio
    try {
      const audioStream = await this.audioProcessor.textToSpeechStream(message);

      socket.emit('sandra:audio:start', {
        timestamp: Date.now()
      });

      // Stream audio chunks
      for await (const chunk of audioStream) {
        socket.emit('sandra:audio:chunk', {
          chunk: chunk.toString('base64'),
          timestamp: Date.now()
        });
      }

      socket.emit('sandra:audio:end', {
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Audio generation error:', error);
      // Continue without audio on error
    }
  }

  async processAudioBuffer(socket, session) {
    try {
      // Sort chunks by sequence
      const sortedChunks = session.audioBuffer
        .sort((a, b) => a.sequence - b.sequence)
        .map(item => item.chunk);

      // Concatenate audio data
      const audioData = Buffer.concat(sortedChunks);

      // TODO: Implement speech-to-text conversion
      // For now, return a placeholder
      console.log(`🎤 Processing ${audioData.length} bytes of audio`);

      // Clear buffer
      session.audioBuffer = [];

      // Placeholder: Emit recognition result
      socket.emit('audio:transcription', {
        text: '[Audio transcription would go here]',
        confidence: 0.95,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Audio processing error:', error);
      throw error;
    }
  }

  handleStateUpdate(socket, data) {
    const session = this.sessions.get(socket.id);
    if (!session) {
      return;
    }

    console.log(`📊 State update from ${session.userId}:`, data);

    // Broadcast state to other devices in same room (if multi-device support)
    socket.to(session.roomId).emit('state:sync', data);
  }

  // === SESSION MANAGEMENT ===

  getSession(socketId) {
    return this.sessions.get(socketId);
  }

  getSessionCount() {
    return this.sessions.size;
  }

  getActiveCalls() {
    let count = 0;
    for (const [, session] of this.sessions) {
      if (session.callActive) count++;
    }
    return count;
  }
}

module.exports = SocketHandlers;
