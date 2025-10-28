// SANDRA IA - SESSION MANAGER
// Manages user sessions with Redis for horizontal scalability

class SessionManager {
  constructor(config = {}) {
    this.config = {
      // Redis configuration (optional - falls back to in-memory if not provided)
      redisEnabled: config.redisEnabled || false,
      redisUrl: config.redisUrl || process.env.REDIS_URL,
      sessionTTL: config.sessionTTL || 3600, // 1 hour in seconds
      maxSessions: config.maxSessions || 10000,
      ...config
    };

    // In-memory sessions map (fallback or primary storage)
    this.sessions = new Map();

    // Redis client (if enabled)
    this.redisClient = null;

    console.log(`✅ Session manager initialized (Redis: ${this.config.redisEnabled ? 'enabled' : 'disabled'})`);
  }

  async initialize() {
    if (this.config.redisEnabled && this.config.redisUrl) {
      try {
        const redis = require('redis');

        this.redisClient = redis.createClient({
          url: this.config.redisUrl
        });

        this.redisClient.on('error', (err) => {
          console.error('❌ Redis error:', err);
        });

        await this.redisClient.connect();
        console.log('✅ Redis connected for session management');

        return true;

      } catch (error) {
        console.warn('⚠️ Redis initialization failed, using in-memory sessions:', error.message);
        this.config.redisEnabled = false;
        return false;
      }
    }

    return true;
  }

  // === SESSION CRUD ===

  async createSession(socketId, data) {
    try {
      const session = {
        socketId,
        userId: data.userId,
        roomId: data.roomId || `user_${data.userId}`,
        authenticated: true,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        conversationHistory: [],
        audioBuffer: [],
        callActive: false,
        metadata: data.metadata || {}
      };

      if (this.config.redisEnabled && this.redisClient) {
        // Store in Redis with TTL
        await this.redisClient.setEx(
          `session:${socketId}`,
          this.config.sessionTTL,
          JSON.stringify(session)
        );
      }

      // Always store in memory for quick access
      this.sessions.set(socketId, session);

      console.log(`✅ Session created: ${socketId} (user: ${data.userId})`);
      return session;

    } catch (error) {
      console.error('❌ Create session error:', error);
      throw error;
    }
  }

  async getSession(socketId) {
    try {
      // Try memory first (fastest)
      let session = this.sessions.get(socketId);

      if (!session && this.config.redisEnabled && this.redisClient) {
        // Fallback to Redis
        const data = await this.redisClient.get(`session:${socketId}`);

        if (data) {
          session = JSON.parse(data);
          // Restore to memory cache
          this.sessions.set(socketId, session);
        }
      }

      if (session) {
        // Update last activity
        session.lastActivity = Date.now();
        await this.updateSession(socketId, session);
      }

      return session;

    } catch (error) {
      console.error('❌ Get session error:', error);
      return null;
    }
  }

  async updateSession(socketId, updates) {
    try {
      const session = await this.getSession(socketId);

      if (!session) {
        console.warn(`⚠️ Session not found: ${socketId}`);
        return null;
      }

      // Merge updates
      Object.assign(session, updates);
      session.lastActivity = Date.now();

      // Update in memory
      this.sessions.set(socketId, session);

      // Update in Redis
      if (this.config.redisEnabled && this.redisClient) {
        await this.redisClient.setEx(
          `session:${socketId}`,
          this.config.sessionTTL,
          JSON.stringify(session)
        );
      }

      return session;

    } catch (error) {
      console.error('❌ Update session error:', error);
      throw error;
    }
  }

  async deleteSession(socketId) {
    try {
      // Delete from memory
      this.sessions.delete(socketId);

      // Delete from Redis
      if (this.config.redisEnabled && this.redisClient) {
        await this.redisClient.del(`session:${socketId}`);
      }

      console.log(`✅ Session deleted: ${socketId}`);
      return true;

    } catch (error) {
      console.error('❌ Delete session error:', error);
      return false;
    }
  }

  // === SESSION QUERIES ===

  async getSessionByUserId(userId) {
    try {
      // Search in memory
      for (const [socketId, session] of this.sessions) {
        if (session.userId === userId) {
          return session;
        }
      }

      // If Redis enabled, search there too
      if (this.config.redisEnabled && this.redisClient) {
        const keys = await this.redisClient.keys('session:*');

        for (const key of keys) {
          const data = await this.redisClient.get(key);
          const session = JSON.parse(data);

          if (session.userId === userId) {
            return session;
          }
        }
      }

      return null;

    } catch (error) {
      console.error('❌ Get session by user ID error:', error);
      return null;
    }
  }

  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  getSessionCount() {
    return this.sessions.size;
  }

  getActiveCalls() {
    let count = 0;
    for (const [, session] of this.sessions) {
      if (session.callActive) {
        count++;
      }
    }
    return count;
  }

  // === CONVERSATION HISTORY ===

  async addMessage(socketId, role, content) {
    try {
      const session = await this.getSession(socketId);

      if (!session) {
        return false;
      }

      const message = {
        role,
        content,
        timestamp: Date.now()
      };

      session.conversationHistory.push(message);

      // Limit history size (keep last 50 messages)
      if (session.conversationHistory.length > 50) {
        session.conversationHistory = session.conversationHistory.slice(-50);
      }

      await this.updateSession(socketId, session);

      return true;

    } catch (error) {
      console.error('❌ Add message error:', error);
      return false;
    }
  }

  async getConversationHistory(socketId) {
    try {
      const session = await this.getSession(socketId);
      return session ? session.conversationHistory : [];

    } catch (error) {
      console.error('❌ Get conversation history error:', error);
      return [];
    }
  }

  async clearConversationHistory(socketId) {
    try {
      const session = await this.getSession(socketId);

      if (session) {
        session.conversationHistory = [];
        await this.updateSession(socketId, session);
      }

      return true;

    } catch (error) {
      console.error('❌ Clear conversation history error:', error);
      return false;
    }
  }

  // === AUDIO BUFFER MANAGEMENT ===

  async addAudioChunk(socketId, chunk) {
    try {
      const session = await this.getSession(socketId);

      if (!session) {
        return false;
      }

      session.audioBuffer.push(chunk);

      // Limit buffer size (max 10MB)
      const totalSize = session.audioBuffer.reduce((sum, c) => sum + c.chunk.length, 0);
      if (totalSize > 10 * 1024 * 1024) {
        console.warn(`⚠️ Audio buffer too large for ${socketId}, clearing oldest chunks`);
        session.audioBuffer = session.audioBuffer.slice(-100);
      }

      await this.updateSession(socketId, session);

      return true;

    } catch (error) {
      console.error('❌ Add audio chunk error:', error);
      return false;
    }
  }

  async getAudioBuffer(socketId) {
    try {
      const session = await this.getSession(socketId);
      return session ? session.audioBuffer : [];

    } catch (error) {
      console.error('❌ Get audio buffer error:', error);
      return [];
    }
  }

  async clearAudioBuffer(socketId) {
    try {
      const session = await this.getSession(socketId);

      if (session) {
        session.audioBuffer = [];
        await this.updateSession(socketId, session);
      }

      return true;

    } catch (error) {
      console.error('❌ Clear audio buffer error:', error);
      return false;
    }
  }

  // === CLEANUP ===

  async cleanupExpiredSessions() {
    try {
      const now = Date.now();
      const maxAge = this.config.sessionTTL * 1000; // Convert to ms
      let cleaned = 0;

      // Cleanup from memory
      for (const [socketId, session] of this.sessions) {
        if (now - session.lastActivity > maxAge) {
          await this.deleteSession(socketId);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`🗑️ Cleaned up ${cleaned} expired sessions`);
      }

      return cleaned;

    } catch (error) {
      console.error('❌ Cleanup error:', error);
      return 0;
    }
  }

  startCleanupInterval(intervalMs = 300000) { // 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, intervalMs);

    console.log(`✅ Session cleanup interval started (${intervalMs / 1000}s)`);
  }

  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🛑 Session cleanup interval stopped');
    }
  }

  // === STATISTICS ===

  getStatistics() {
    const sessions = this.getAllSessions();
    const now = Date.now();

    return {
      total: sessions.length,
      authenticated: sessions.filter(s => s.authenticated).length,
      activeCalls: sessions.filter(s => s.callActive).length,
      activeLastMinute: sessions.filter(s => now - s.lastActivity < 60000).length,
      activeLastHour: sessions.filter(s => now - s.lastActivity < 3600000).length,
      averageConversationLength: sessions.reduce((sum, s) => sum + s.conversationHistory.length, 0) / sessions.length || 0,
      redisEnabled: this.config.redisEnabled,
      redisConnected: this.redisClient?.isReady || false
    };
  }

  // === SHUTDOWN ===

  async shutdown() {
    try {
      console.log('🔌 Shutting down session manager...');

      // Stop cleanup interval
      this.stopCleanupInterval();

      // Clear memory sessions
      this.sessions.clear();

      // Disconnect Redis
      if (this.redisClient && this.redisClient.isReady) {
        await this.redisClient.quit();
        console.log('✅ Redis disconnected');
      }

      console.log('✅ Session manager shutdown complete');

    } catch (error) {
      console.error('❌ Shutdown error:', error);
    }
  }
}

module.exports = SessionManager;
