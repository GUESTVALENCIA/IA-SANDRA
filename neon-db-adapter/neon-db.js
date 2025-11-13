/**
 * Neon DB Adapter - Modo Offline
 * Base de datos simulada para modo offline
 */

class NeonDB {
  constructor() {
    this.conversations = [];
    this.deployments = [];
    this.updates = [];
    this.config = {};
    console.log('✅ Neon DB Adapter inicializado (Modo offline)');
  }

  async logMessage(sessionId, message, sender = 'user') {
    this.conversations.push({
      sessionId,
      message,
      sender,
      timestamp: new Date()
    });
    return { success: true };
  }

  async logUpdateStatus(status, details = {}) {
    this.updates.push({
      status,
      details,
      timestamp: new Date()
    });
    return { success: true };
  }

  async logDeployment(deployment) {
    this.deployments.push({
      ...deployment,
      timestamp: new Date()
    });
    return { success: true };
  }

  async getConversationHistory(sessionId, limit = 10) {
    return this.conversations
      .filter(c => c.sessionId === sessionId)
      .slice(-limit);
  }

  async getConfig(key) {
    return this.config[key] || null;
  }

  async setConfig(key, value) {
    this.config[key] = value;
    return { success: true };
  }
}

module.exports = NeonDB;
