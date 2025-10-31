/**
 * AI MEMORY MANAGER
 * Sistema de memoria persistente para la IA (Composer/Auto)
 * Permite recordar conversaciones y contexto entre sesiones
 */

const fs = require('fs').promises;
const path = require('path');

class AIMemoryManager {
  constructor(baseDir = null) {
    // Usar directorio en AppData o en el proyecto
    const memoryBaseDir = baseDir || 
      path.join(process.env.APPDATA || process.env.HOME || __dirname, '.ai-memory') ||
      path.join(__dirname, '.ai-memory');
    
    this.memoryDir = memoryBaseDir;
    this.conversationsFile = path.join(this.memoryDir, 'conversations.json');
    this.contextFile = path.join(this.memoryDir, 'context.json');
    this.knowledgeFile = path.join(this.memoryDir, 'knowledge.json');
    
    // Asegurar que el directorio existe
    this.ensureMemoryDirectory();
  }

  async ensureMemoryDirectory() {
    try {
      await fs.mkdir(this.memoryDir, { recursive: true });
    } catch (error) {
      console.warn('[AI-MEMORY] Failed to create memory directory:', error.message);
    }
  }

  // ============================================================================
  // GESTIÓN DE CONVERSACIONES
  // ============================================================================

  async saveConversation(userMessage, aiResponse, metadata = {}) {
    try {
      const conversations = await this.loadConversations();
      
      const entry = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        user: userMessage,
        ai: aiResponse,
        metadata: {
          ...metadata,
          session: metadata.sessionId || 'default',
          model: metadata.model || 'auto',
          context: metadata.context || null
        }
      };
      
      conversations.push(entry);
      
      // Mantener solo las últimas 1000 conversaciones
      if (conversations.length > 1000) {
        conversations.splice(0, conversations.length - 1000);
      }
      
      await fs.writeFile(
        this.conversationsFile,
        JSON.stringify(conversations, null, 2),
        'utf8'
      );
      
      console.log('[AI-MEMORY] Conversation saved');
      return entry.id;
    } catch (error) {
      console.error('[AI-MEMORY] Failed to save conversation:', error);
      return null;
    }
  }

  async loadConversations(limit = null) {
    try {
      const data = await fs.readFile(this.conversationsFile, 'utf8');
      const conversations = JSON.parse(data);
      
      if (limit && conversations.length > limit) {
        return conversations.slice(-limit);
      }
      
      return conversations;
    } catch (error) {
      // Si el archivo no existe, retornar array vacío
      if (error.code === 'ENOENT') {
        return [];
      }
      console.error('[AI-MEMORY] Failed to load conversations:', error);
      return [];
    }
  }

  async getRecentConversations(limit = 20) {
    const conversations = await this.loadConversations();
    return conversations.slice(-limit);
  }

  async searchConversations(query, limit = 10) {
    const conversations = await this.loadConversations();
    const lowerQuery = query.toLowerCase();
    
    return conversations
      .filter(conv => 
        conv.user.toLowerCase().includes(lowerQuery) ||
        conv.ai.toLowerCase().includes(lowerQuery)
      )
      .slice(-limit);
  }

  // ============================================================================
  // GESTIÓN DE CONTEXTO
  // ============================================================================

  async saveContext(context) {
    try {
      const currentContext = await this.loadContext();
      const updatedContext = {
        ...currentContext,
        ...context,
        lastUpdate: new Date().toISOString()
      };
      
      await fs.writeFile(
        this.contextFile,
        JSON.stringify(updatedContext, null, 2),
        'utf8'
      );
      
      console.log('[AI-MEMORY] Context saved');
      return true;
    } catch (error) {
      console.error('[AI-MEMORY] Failed to save context:', error);
      return false;
    }
  }

  async loadContext() {
    try {
      const data = await fs.readFile(this.contextFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Retornar contexto por defecto
        return {
          user: {
            name: null,
            role: null,
            preferences: {},
            lastInteraction: null
          },
          project: {
            name: null,
            type: null,
            status: null
          },
          importantFacts: [],
          currentContext: null
        };
      }
      console.error('[AI-MEMORY] Failed to load context:', error);
      return null;
    }
  }

  async addImportantFact(fact, category = 'general') {
    try {
      const context = await this.loadContext();
      if (!context.importantFacts) {
        context.importantFacts = [];
      }
      
      context.importantFacts.push({
        fact,
        category,
        timestamp: new Date().toISOString()
      });
      
      // Mantener solo los últimos 500 hechos importantes
      if (context.importantFacts.length > 500) {
        context.importantFacts = context.importantFacts.slice(-500);
      }
      
      return await this.saveContext(context);
    } catch (error) {
      console.error('[AI-MEMORY] Failed to add important fact:', error);
      return false;
    }
  }

  // ============================================================================
  // GESTIÓN DE CONOCIMIENTO
  // ============================================================================

  async saveKnowledge(topic, knowledge, source = null) {
    try {
      const knowledgeBase = await this.loadKnowledge();
      
      knowledgeBase[topic] = {
        content: knowledge,
        source: source || 'conversation',
        updated: new Date().toISOString(),
        accessed: new Date().toISOString()
      };
      
      await fs.writeFile(
        this.knowledgeFile,
        JSON.stringify(knowledgeBase, null, 2),
        'utf8'
      );
      
      console.log('[AI-MEMORY] Knowledge saved');
      return true;
    } catch (error) {
      console.error('[AI-MEMORY] Failed to save knowledge:', error);
      return false;
    }
  }

  async loadKnowledge() {
    try {
      const data = await fs.readFile(this.knowledgeFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {};
      }
      console.error('[AI-MEMORY] Failed to load knowledge:', error);
      return {};
    }
  }

  async getKnowledge(topic) {
    const knowledgeBase = await this.loadKnowledge();
    if (knowledgeBase[topic]) {
      // Actualizar timestamp de acceso
      knowledgeBase[topic].accessed = new Date().toISOString();
      await fs.writeFile(
        this.knowledgeFile,
        JSON.stringify(knowledgeBase, null, 2),
        'utf8'
      );
    }
    return knowledgeBase[topic] || null;
  }

  // ============================================================================
  // RESUMEN Y RESUMEN DE SESIÓN
  // ============================================================================

  async getSessionSummary(sessionId) {
    const conversations = await this.loadConversations();
    const sessionConversations = conversations.filter(
      conv => conv.metadata.session === sessionId
    );
    
    return {
      sessionId,
      totalMessages: sessionConversations.length,
      firstMessage: sessionConversations[0]?.timestamp,
      lastMessage: sessionConversations[sessionConversations.length - 1]?.timestamp,
      topics: this.extractTopics(sessionConversations)
    };
  }

  extractTopics(conversations) {
    // Extraer temas principales de las conversaciones
    const topics = new Set();
    conversations.forEach(conv => {
      // Simple keyword extraction
      const words = (conv.user + ' ' + conv.ai).toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 5) {
          topics.add(word);
        }
      });
    });
    return Array.from(topics).slice(0, 10);
  }

  async getMemorySummary() {
    const conversations = await this.loadConversations();
    const context = await this.loadContext();
    const knowledge = await this.loadKnowledge();
    
    return {
      totalConversations: conversations.length,
      lastConversation: conversations[conversations.length - 1]?.timestamp,
      user: context.user,
      project: context.project,
      importantFacts: context.importantFacts?.length || 0,
      knowledgeTopics: Object.keys(knowledge).length
    };
  }
}

// Exportar singleton
let memoryManagerInstance = null;

function getAIMemoryManager(baseDir = null) {
  if (!memoryManagerInstance) {
    memoryManagerInstance = new AIMemoryManager(baseDir);
  }
  return memoryManagerInstance;
}

module.exports = {
  AIMemoryManager,
  getAIMemoryManager
};

