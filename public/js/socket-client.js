// SANDRA IA - SOCKET.IO CLIENT
// Real-time bidirectional communication with WebSocket support
// Integrates with WebRTC, VAD, and Avatar Sync

class SocketClient {
  constructor(config = {}) {
    this.config = {
      serverUrl: config.serverUrl || window.location.origin,
      namespace: config.namespace || '/sandra',
      autoConnect: config.autoConnect !== false,
      reconnection: config.reconnection !== false,
      reconnectionAttempts: config.reconnectionAttempts || 5,
      reconnectionDelay: config.reconnectionDelay || 1000,
      transports: config.transports || ['websocket', 'polling'],
      ...config
    };

    this.socket = null;
    this.connected = false;
    this.authenticated = false;
    this.userId = null;
    this.roomId = null;

    // Event handlers
    this.onConnected = null;
    this.onDisconnected = null;
    this.onAuthenticated = null;
    this.onError = null;
    this.onSandraResponse = null;
    this.onSandraTyping = null;
    this.onSandraAudioStart = null;
    this.onSandraAudioChunk = null;
    this.onSandraAudioEnd = null;
    this.onCallStarted = null;
    this.onCallEnded = null;
    this.onBargeInAck = null;

    // Metrics
    this.metrics = {
      messagesSent: 0,
      messagesReceived: 0,
      audioChunksSent: 0,
      audioChunksReceived: 0,
      latency: 0,
      lastPingTime: 0
    };
  }

  // === CONNECTION ===

  connect() {
    if (this.socket && this.socket.connected) {
      console.warn('⚠️ Socket already connected');
      return;
    }

    console.log('🔌 Connecting to Socket.IO server...');

    // Load Socket.IO client library if not already loaded
    if (typeof io === 'undefined') {
      console.error('❌ Socket.IO client library not loaded');
      return false;
    }

    // Create socket connection
    this.socket = io(`${this.config.serverUrl}${this.config.namespace}`, {
      autoConnect: this.config.autoConnect,
      reconnection: this.config.reconnection,
      reconnectionAttempts: this.config.reconnectionAttempts,
      reconnectionDelay: this.config.reconnectionDelay,
      transports: this.config.transports
    });

    // Register event listeners
    this.registerListeners();

    // Connect if autoConnect is false
    if (!this.config.autoConnect) {
      this.socket.connect();
    }

    return true;
  }

  disconnect() {
    if (!this.socket) {
      return;
    }

    console.log('🔌 Disconnecting from Socket.IO server...');

    this.socket.disconnect();
    this.connected = false;
    this.authenticated = false;
  }

  // === AUTHENTICATION ===

  authenticate(userId, token = null) {
    if (!this.socket || !this.socket.connected) {
      console.error('❌ Cannot authenticate: not connected');
      return false;
    }

    console.log(`🔐 Authenticating user: ${userId}`);

    this.userId = userId;

    this.socket.emit('authenticate', {
      userId,
      token,
      timestamp: Date.now()
    });

    return true;
  }

  // === CONVERSATION ===

  startCall() {
    if (!this.authenticated) {
      console.error('❌ Cannot start call: not authenticated');
      return false;
    }

    console.log('📞 Starting call...');

    this.socket.emit('call:start', {
      timestamp: Date.now()
    });

    return true;
  }

  endCall() {
    if (!this.authenticated) {
      return false;
    }

    console.log('📞 Ending call...');

    this.socket.emit('call:end', {
      timestamp: Date.now()
    });

    return true;
  }

  sendMessage(message, type = 'text') {
    if (!this.authenticated) {
      console.error('❌ Cannot send message: not authenticated');
      return false;
    }

    console.log(`💬 Sending message: ${message.substring(0, 50)}...`);

    this.socket.emit('user:message', {
      message,
      type,
      timestamp: Date.now()
    });

    this.metrics.messagesSent++;

    return true;
  }

  triggerBargeIn() {
    if (!this.authenticated) {
      return false;
    }

    console.log('🛑 Triggering barge-in...');

    this.socket.emit('barge-in', {
      timestamp: Date.now()
    });

    return true;
  }

  // === AUDIO STREAMING ===

  startAudioStream() {
    if (!this.authenticated) {
      console.error('❌ Cannot start audio stream: not authenticated');
      return false;
    }

    console.log('🎤 Starting audio stream...');

    this.socket.emit('audio:stream', {
      timestamp: Date.now()
    });

    return true;
  }

  sendAudioChunk(chunk, sequence) {
    if (!this.authenticated) {
      return false;
    }

    this.socket.emit('audio:chunk', {
      chunk,
      sequence,
      timestamp: Date.now()
    });

    this.metrics.audioChunksSent++;

    return true;
  }

  endAudioStream() {
    if (!this.authenticated) {
      return false;
    }

    console.log('🎤 Ending audio stream...');

    this.socket.emit('audio:end', {
      timestamp: Date.now()
    });

    return true;
  }

  // === STATE SYNC ===

  updateState(state) {
    if (!this.authenticated) {
      return false;
    }

    this.socket.emit('state:update', state);

    return true;
  }

  // === PING/LATENCY ===

  ping() {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.metrics.lastPingTime = Date.now();

    this.socket.emit('ping');
  }

  startPingInterval(intervalMs = 30000) {
    this.pingInterval = setInterval(() => {
      this.ping();
    }, intervalMs);

    console.log(`✅ Ping interval started (${intervalMs / 1000}s)`);
  }

  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
      console.log('🛑 Ping interval stopped');
    }
  }

  // === EVENT LISTENERS ===

  registerListeners() {
    // Connection events
    this.socket.on('connect', () => this.handleConnect());
    this.socket.on('disconnect', (reason) => this.handleDisconnect(reason));
    this.socket.on('connect_error', (error) => this.handleConnectError(error));
    this.socket.on('error', (error) => this.handleError(error));

    // Authentication
    this.socket.on('authenticated', (data) => this.handleAuthenticated(data));

    // Conversation events
    this.socket.on('call:started', (data) => this.handleCallStarted(data));
    this.socket.on('call:ended', (data) => this.handleCallEnded(data));
    this.socket.on('sandra:response', (data) => this.handleSandraResponse(data));
    this.socket.on('sandra:typing', (data) => this.handleSandraTyping(data));
    this.socket.on('sandra:interrupted', (data) => this.handleSandraInterrupted(data));
    this.socket.on('barge-in:ack', (data) => this.handleBargeInAck(data));

    // Audio streaming
    this.socket.on('audio:stream:ack', (data) => this.handleAudioStreamAck(data));
    this.socket.on('audio:chunk:ack', (data) => this.handleAudioChunkAck(data));
    this.socket.on('audio:end:ack', (data) => this.handleAudioEndAck(data));
    this.socket.on('audio:transcription', (data) => this.handleAudioTranscription(data));

    // Sandra audio
    this.socket.on('sandra:audio:start', (data) => this.handleSandraAudioStart(data));
    this.socket.on('sandra:audio:chunk', (data) => this.handleSandraAudioChunk(data));
    this.socket.on('sandra:audio:end', (data) => this.handleSandraAudioEnd(data));

    // State sync
    this.socket.on('state:sync', (data) => this.handleStateSync(data));

    // Ping/pong
    this.socket.on('pong', (data) => this.handlePong(data));

    // Metrics
    this.socket.on('metrics', (data) => this.handleMetrics(data));
  }

  // === EVENT HANDLERS ===

  handleConnect() {
    console.log('✅ Socket connected');
    this.connected = true;

    if (this.onConnected) {
      this.onConnected();
    }

    // Start ping interval
    this.startPingInterval();
  }

  handleDisconnect(reason) {
    console.log(`🔌 Socket disconnected: ${reason}`);
    this.connected = false;
    this.authenticated = false;

    if (this.onDisconnected) {
      this.onDisconnected(reason);
    }

    // Stop ping interval
    this.stopPingInterval();
  }

  handleConnectError(error) {
    console.error('❌ Connection error:', error);

    if (this.onError) {
      this.onError(error);
    }
  }

  handleError(error) {
    console.error('❌ Socket error:', error);

    if (this.onError) {
      this.onError(error);
    }
  }

  handleAuthenticated(data) {
    console.log('✅ Authenticated:', data);
    this.authenticated = true;
    this.userId = data.userId;
    this.roomId = data.roomId;

    if (this.onAuthenticated) {
      this.onAuthenticated(data);
    }
  }

  handleCallStarted(data) {
    console.log('📞 Call started:', data);

    if (this.onCallStarted) {
      this.onCallStarted(data);
    }
  }

  handleCallEnded(data) {
    console.log('📞 Call ended:', data);

    if (this.onCallEnded) {
      this.onCallEnded(data);
    }
  }

  handleSandraResponse(data) {
    console.log('💬 Sandra response:', data.message);
    this.metrics.messagesReceived++;

    if (this.onSandraResponse) {
      this.onSandraResponse(data);
    }
  }

  handleSandraTyping(data) {
    if (this.onSandraTyping) {
      this.onSandraTyping(data);
    }
  }

  handleSandraInterrupted(data) {
    console.log('🛑 Sandra interrupted');
  }

  handleBargeInAck(data) {
    console.log('✅ Barge-in acknowledged');

    if (this.onBargeInAck) {
      this.onBargeInAck(data);
    }
  }

  handleAudioStreamAck(data) {
    console.log('✅ Audio stream acknowledged');
  }

  handleAudioChunkAck(data) {
    // Acknowledge receipt of audio chunk
  }

  handleAudioEndAck(data) {
    console.log('✅ Audio stream ended:', data);
  }

  handleAudioTranscription(data) {
    console.log('🎤 Audio transcription:', data.text);
  }

  handleSandraAudioStart(data) {
    console.log('🔊 Sandra audio starting...');

    if (this.onSandraAudioStart) {
      this.onSandraAudioStart(data);
    }
  }

  handleSandraAudioChunk(data) {
    this.metrics.audioChunksReceived++;

    if (this.onSandraAudioChunk) {
      this.onSandraAudioChunk(data);
    }
  }

  handleSandraAudioEnd(data) {
    console.log('🔊 Sandra audio ended');

    if (this.onSandraAudioEnd) {
      this.onSandraAudioEnd(data);
    }
  }

  handleStateSync(data) {
    console.log('📊 State sync:', data);
  }

  handlePong(data) {
    const latency = Date.now() - this.metrics.lastPingTime;
    this.metrics.latency = latency;

    console.log(`🏓 Pong received (latency: ${latency}ms)`);
  }

  handleMetrics(data) {
    console.log('📊 Server metrics:', data);
  }

  // === GETTERS ===

  isConnected() {
    return this.connected;
  }

  isAuthenticated() {
    return this.authenticated;
  }

  getUserId() {
    return this.userId;
  }

  getRoomId() {
    return this.roomId;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getLatency() {
    return this.metrics.latency;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocketClient;
}
