// SANDRA IA - AIRTABLE INTEGRATION
// Sync conversations, messages, and metadata with Airtable
// Complements Supabase for data persistence and CMS capabilities

class AirtableIntegration {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.REACT_APP_AIRTABLE_API_KEY,
      baseId: config.baseId || process.env.REACT_APP_AIRTABLE_BASE_ID,
      tablesConfig: config.tablesConfig || {
        conversations: 'Conversations',
        messages: 'Messages',
        users: 'Users',
        sessions: 'Sessions'
      },
      batchSize: config.batchSize || 10,
      syncInterval: config.syncInterval || 5000, // 5 seconds
      ...config
    };

    this.apiUrl = 'https://api.airtable.com/v0';
    this.isInitialized = false;
    this.syncQueue = [];
    this.isSyncing = false;

    console.log('✅ Airtable Integration initialized');
  }

  /**
   * Initialize Airtable connection
   */
  async initialize() {
    try {
      console.log('🔗 Initializing Airtable connection...');

      // Verify API key and base exist
      const response = await this.fetch(`${this.config.baseId}/Conversations?maxRecords=1`);

      if (response.ok) {
        console.log('✅ Connected to Airtable');
        this.isInitialized = true;
        this.startSyncLoop();
        return true;
      } else {
        throw new Error('Invalid Airtable credentials');
      }
    } catch (error) {
      console.error('Airtable initialization error:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation record
   */
  async createConversation(conversationData) {
    try {
      const fields = {
        'Conversation ID': conversationData.id,
        'User ID': conversationData.userId,
        'Session ID': conversationData.sessionId,
        'Start Time': new Date().toISOString(),
        'Status': 'Active',
        'Model': conversationData.model || 'Qwen 2.5',
        'Metadata': JSON.stringify(conversationData.metadata || {})
      };

      const response = await this.fetch(
        `${this.config.baseId}/${this.config.tablesConfig.conversations}`,
        {
          method: 'POST',
          body: JSON.stringify({ records: [{ fields }] })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Conversation created in Airtable:', data.records[0].id);
        return data.records[0];
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Create conversation error:', error);
      this.queueForSync('createConversation', conversationData);
    }
  }

  /**
   * Add message to conversation
   */
  async addMessage(conversationId, messageData) {
    try {
      const fields = {
        'Conversation ID': conversationId,
        'Message ID': messageData.id,
        'Role': messageData.role, // 'user' or 'assistant'
        'Content': messageData.content,
        'Timestamp': messageData.timestamp || new Date().toISOString(),
        'Provider': messageData.provider || 'Ollama',
        'Tier': messageData.tier || 'Tier 1',
        'Tokens': messageData.tokens || 0,
        'Latency (ms)': messageData.latency || 0
      };

      const response = await this.fetch(
        `${this.config.baseId}/${this.config.tablesConfig.messages}`,
        {
          method: 'POST',
          body: JSON.stringify({ records: [{ fields }] })
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message added to Airtable');
        return data.records[0];
      } else {
        throw new Error('Failed to add message');
      }
    } catch (error) {
      console.error('Add message error:', error);
      this.queueForSync('addMessage', { conversationId, ...messageData });
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, profileData) {
    try {
      const fields = {
        'User ID': userId,
        'Name': profileData.name || '',
        'Email': profileData.email || '',
        'Phone': profileData.phone || '',
        'Last Seen': new Date().toISOString(),
        'Total Messages': profileData.totalMessages || 0,
        'Preferences': JSON.stringify(profileData.preferences || {}),
        'Region': profileData.region || 'Unknown'
      };

      const response = await this.fetch(
        `${this.config.baseId}/${this.config.tablesConfig.users}`,
        {
          method: 'POST',
          body: JSON.stringify({ records: [{ fields }] })
        }
      );

      if (response.ok) {
        console.log('✅ User profile updated in Airtable');
        return true;
      }
    } catch (error) {
      console.error('Update user profile error:', error);
      this.queueForSync('updateUserProfile', { userId, ...profileData });
    }
  }

  /**
   * Log session metadata
   */
  async logSession(sessionData) {
    try {
      const fields = {
        'Session ID': sessionData.sessionId,
        'User ID': sessionData.userId,
        'Start Time': sessionData.startTime || new Date().toISOString(),
        'End Time': sessionData.endTime || '',
        'Duration (minutes)': sessionData.duration || 0,
        'Total Messages': sessionData.totalMessages || 0,
        'Device': sessionData.device || 'Unknown',
        'Browser': sessionData.browser || 'Unknown',
        'Quality Score': sessionData.qualityScore || 0
      };

      const response = await this.fetch(
        `${this.config.baseId}/${this.config.tablesConfig.sessions}`,
        {
          method: 'POST',
          body: JSON.stringify({ records: [{ fields }] })
        }
      );

      if (response.ok) {
        console.log('✅ Session logged in Airtable');
        return true;
      }
    } catch (error) {
      console.error('Log session error:', error);
      this.queueForSync('logSession', sessionData);
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId) {
    try {
      const formula = `{Conversation ID} = '${conversationId}'`;
      const response = await this.fetch(
        `${this.config.baseId}/${this.config.tablesConfig.messages}?filterByFormula=${encodeURIComponent(formula)}&sort[0][field]=Timestamp&sort[0][direction]=asc`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Retrieved ${data.records.length} messages`);
        return data.records.map(r => r.fields);
      }
    } catch (error) {
      console.error('Get history error:', error);
      return [];
    }
  }

  /**
   * Queue operation for sync retry
   */
  queueForSync(operation, data) {
    this.syncQueue.push({ operation, data, timestamp: Date.now() });
    console.log(`⏳ Queued for sync: ${operation}`);
  }

  /**
   * Start sync loop
   */
  startSyncLoop() {
    setInterval(() => {
      if (this.syncQueue.length > 0 && !this.isSyncing) {
        this.processSyncQueue();
      }
    }, this.config.syncInterval);
  }

  /**
   * Process queued operations
   */
  async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) return;

    this.isSyncing = true;
    const batch = this.syncQueue.splice(0, this.config.batchSize);

    try {
      console.log(`🔄 Processing ${batch.length} queued operations...`);

      for (const item of batch) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting

        try {
          if (item.operation === 'createConversation') {
            await this.createConversation(item.data);
          } else if (item.operation === 'addMessage') {
            await this.addMessage(item.data.conversationId, item.data);
          } else if (item.operation === 'updateUserProfile') {
            await this.updateUserProfile(item.data.userId, item.data);
          } else if (item.operation === 'logSession') {
            await this.logSession(item.data);
          }
        } catch (error) {
          console.error(`Error processing ${item.operation}:`, error);
          // Re-queue if failed
          this.syncQueue.push(item);
        }
      }

      console.log('✅ Sync batch complete');
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Fetch helper with authentication
   */
  async fetch(path, options = {}) {
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    return fetch(`${this.apiUrl}/${path}`, {
      ...options,
      headers
    });
  }

  /**
   * Disconnect from Airtable
   */
  disconnect() {
    console.log('🔌 Disconnected from Airtable');
    this.isInitialized = false;
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.AirtableIntegration = AirtableIntegration;
}
