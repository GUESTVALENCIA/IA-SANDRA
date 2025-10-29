// SANDRA IA - SUPABASE REALTIME CLIENT
// Real-time communication using Supabase + PostgreSQL
// Replaces Socket.IO with native WebSocket via Supabase

class SupabaseRealtimeClient {
  constructor(config = {}) {
    this.config = {
      supabaseUrl: config.supabaseUrl || process.env.REACT_APP_SUPABASE_URL,
      supabaseKey: config.supabaseKey || process.env.REACT_APP_SUPABASE_ANON_KEY,
      channelName: config.channelName || 'sandra-channel',
      namespace: config.namespace || '/sandra',
      ...config
    };

    this.supabase = null;
    this.channel = null;
    this.userId = null;
    this.sessionId = null;
    this.isConnected = false;

    // Event listeners
    this.listeners = {
      'connect': [],
      'disconnect': [],
      'message': [],
      'audio:chunk': [],
      'audio:stream:start': [],
      'audio:stream:end': [],
      'tts:ready': [],
      'error': []
    };

    console.log('✅ Supabase Realtime Client initialized');
  }

  /**
   * Initialize Supabase connection
   */
  async connect() {
    try {
      console.log('🔌 Connecting to Supabase Realtime...');

      // Import Supabase client
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');

      // Create Supabase client
      this.supabase = createClient(
        this.config.supabaseUrl,
        this.config.supabaseKey
      );

      // Generate session ID
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.userId = this.getUserId();

      // Subscribe to channel
      this.channel = this.supabase.channel(this.config.channelName, {
        config: {
          presence: { key: this.userId },
          broadcast: { self: true }
        }
      });

      // Handle presence updates
      this.channel.on('presence', { event: 'sync' }, () => {
        console.log('👥 Presence sync:', this.channel.presenceState());
      });

      // Handle broadcast messages
      this.channel.on('broadcast', { event: 'message' }, (payload) => {
        console.log('💬 Message received:', payload);
        this.emit('message', payload.payload);
      });

      // Handle audio chunks
      this.channel.on('broadcast', { event: 'audio:chunk' }, (payload) => {
        console.log('🔊 Audio chunk received');
        this.emit('audio:chunk', payload.payload);
      });

      // Subscribe
      await this.channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to Supabase Realtime');
          this.isConnected = true;

          // Track presence
          await this.channel.track({
            user_id: this.userId,
            session_id: this.sessionId,
            connected_at: new Date().toISOString(),
            user_agent: navigator.userAgent
          });

          this.emit('connect');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error');
          this.emit('error', { type: 'CHANNEL_ERROR' });
        } else if (status === 'CLOSED') {
          console.log('🔌 Channel closed');
          this.isConnected = false;
          this.emit('disconnect');
        }
      });

      return this;
    } catch (error) {
      console.error('Connection error:', error);
      this.emit('error', { type: 'CONNECTION_ERROR', error });
      throw error;
    }
  }

  /**
   * Send message via broadcast
   */
  async sendMessage(text) {
    if (!this.channel) {
      throw new Error('Not connected to Supabase');
    }

    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'message',
        payload: {
          user_id: this.userId,
          session_id: this.sessionId,
          text,
          timestamp: new Date().toISOString()
        }
      });

      console.log('✅ Message sent');
    } catch (error) {
      console.error('Send error:', error);
      this.emit('error', { type: 'SEND_ERROR', error });
      throw error;
    }
  }

  /**
   * Send audio chunk
   */
  async sendAudioChunk(audioData, sequence = 0) {
    if (!this.channel) {
      throw new Error('Not connected to Supabase');
    }

    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'audio:chunk',
        payload: {
          user_id: this.userId,
          session_id: this.sessionId,
          audio: audioData,
          sequence,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Audio send error:', error);
      this.emit('error', { type: 'AUDIO_SEND_ERROR', error });
    }
  }

  /**
   * Start audio stream
   */
  async startAudioStream() {
    if (!this.channel) {
      throw new Error('Not connected to Supabase');
    }

    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'audio:stream:start',
        payload: {
          user_id: this.userId,
          session_id: this.sessionId,
          timestamp: new Date().toISOString()
        }
      });

      this.emit('audio:stream:start');
    } catch (error) {
      console.error('Stream start error:', error);
      this.emit('error', { type: 'STREAM_START_ERROR', error });
    }
  }

  /**
   * End audio stream
   */
  async endAudioStream() {
    if (!this.channel) {
      throw new Error('Not connected to Supabase');
    }

    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'audio:stream:end',
        payload: {
          user_id: this.userId,
          session_id: this.sessionId,
          timestamp: new Date().toISOString()
        }
      });

      this.emit('audio:stream:end');
    } catch (error) {
      console.error('Stream end error:', error);
      this.emit('error', { type: 'STREAM_END_ERROR', error });
    }
  }

  /**
   * Disconnect from channel
   */
  async disconnect() {
    if (this.channel) {
      await this.supabase.removeChannel(this.channel);
      this.channel = null;
      this.isConnected = false;
      this.emit('disconnect');
      console.log('✅ Disconnected from Supabase');
    }
  }

  /**
   * Event listener registration
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event
   */
  emit(event, data = null) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Get user ID (from localStorage or generate)
   */
  getUserId() {
    let userId = localStorage.getItem('sandra_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sandra_user_id', userId);
    }
    return userId;
  }

  /**
   * Check connection status
   */
  isConnectedToRealtime() {
    return this.isConnected && this.channel !== null;
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.SupabaseRealtimeClient = SupabaseRealtimeClient;
}
