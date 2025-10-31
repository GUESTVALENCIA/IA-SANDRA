/**
 * VOICE COMMANDS FOR AI ASSISTANT
 * Sistema de comandos de voz para controlar al asistente de IA
 * Permite interactuar con las capacidades del asistente mediante voz
 */

class VoiceCommandsForAI {
  constructor(nucleus) {
    this.nucleus = nucleus;
    this.isListening = false;
    this.commandHistory = [];
    this.activeCommands = new Map();
  }

  /**
   * Procesar comando de voz para el asistente
   * @param {Buffer} audioBuffer - Audio del comando
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async processAICommand(audioBuffer) {
    try {
      // 1. Speech-to-Text (STT)
      const text = await this.speechToText(audioBuffer);
      console.log('[AI-COMMAND] Comando reconocido:', text);

      // 2. Detectar tipo de comando
      const commandType = this.detectCommandType(text);
      console.log('[AI-COMMAND] Tipo detectado:', commandType);

      // 3. Ejecutar comando según tipo
      const result = await this.executeCommand(commandType, text);

      // 4. Feedback por voz
      if (result.feedback) {
        await this.textToSpeech(result.feedback);
      }

      // Guardar en historial
      this.commandHistory.push({
        timestamp: Date.now(),
        command: text,
        type: commandType,
        result: result.success,
        executionTime: result.executionTime || 0
      });

      return {
        success: result.success,
        command: text,
        type: commandType,
        result: result,
        feedback: result.feedback,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[AI-COMMAND] Error:', error);
      const errorMessage = `Error procesando comando: ${error.message}`;
      await this.textToSpeech(errorMessage);
      return {
        success: false,
        error: error.message,
        feedback: errorMessage
      };
    }
  }

  /**
   * Detectar tipo de comando
   */
  detectCommandType(text) {
    const lowerText = text.toLowerCase();

    // Comandos de búsqueda e investigación
    if (this.matchesPattern(lowerText, [
      'busca', 'buscar', 'encuentra', 'localiza', 'investiga', 'investigar',
      'search', 'find', 'look for', 'research'
    ])) {
      return 'search';
    }

    // Comandos de análisis
    if (this.matchesPattern(lowerText, [
      'analiza', 'analizar', 'revisa', 'revisar', 'examina', 'examinar',
      'analyze', 'review', 'examine', 'check'
    ])) {
      return 'analyze';
    }

    // Comandos de creación
    if (this.matchesPattern(lowerText, [
      'crea', 'crear', 'haz', 'hacer', 'genera', 'generar', 'construye',
      'create', 'make', 'generate', 'build'
    ])) {
      return 'create';
    }

    // Comandos de lectura
    if (this.matchesPattern(lowerText, [
      'lee', 'leer', 'muestra', 'mostrar', 'trae', 'traer', 'obtén',
      'read', 'show', 'display', 'get', 'fetch'
    ])) {
      return 'read';
    }

    // Comandos de escritura/modificación
    if (this.matchesPattern(lowerText, [
      'escribe', 'escribir', 'modifica', 'modificar', 'actualiza', 'actualizar',
      'write', 'modify', 'update', 'edit'
    ])) {
      return 'write';
    }

    // Comandos de navegación
    if (this.matchesPattern(lowerText, [
      've a', 'ir a', 'navega', 'navegar', 'abre', 'abrir',
      'go to', 'navigate', 'open'
    ])) {
      return 'navigate';
    }

    // Comandos de explicación
    if (this.matchesPattern(lowerText, [
      'explica', 'explicar', 'qué es', 'qué significa', 'dime sobre',
      'explain', 'what is', 'what does', 'tell me about'
    ])) {
      return 'explain';
    }

    // Comandos de acción/tarea
    if (this.matchesPattern(lowerText, [
      'haz que', 'ejecuta', 'ejecutar', 'realiza', 'realizar', 'procesa',
      'do', 'execute', 'run', 'perform', 'process'
    ])) {
      return 'execute';
    }

    // Comandos de resumen
    if (this.matchesPattern(lowerText, [
      'resume', 'resumen', 'resumir', 'sumariza', 'sumarizar',
      'summarize', 'brief'
    ])) {
      return 'summarize';
    }

    // Comandos de comparación
    if (this.matchesPattern(lowerText, [
      'compara', 'comparar', 'diferencia', 'diferencias',
      'compare', 'difference', 'differences'
    ])) {
      return 'compare';
    }

    // Comandos de ayuda/información
    if (this.matchesPattern(lowerText, [
      'ayuda', 'help', 'qué puedes', 'qué puedes hacer', 'capacidades',
      'capabilities', 'commands'
    ])) {
      return 'help';
    }

    // Default: conversación normal
    return 'chat';
  }

  /**
   * Verificar si el texto coincide con algún patrón
   */
  matchesPattern(text, patterns) {
    return patterns.some(pattern => text.includes(pattern));
  }

  /**
   * Ejecutar comando según tipo
   */
  async executeCommand(type, originalText) {
    const startTime = Date.now();

    switch (type) {
      case 'search':
        return await this.handleSearchCommand(originalText);
      
      case 'analyze':
        return await this.handleAnalyzeCommand(originalText);
      
      case 'create':
        return await this.handleCreateCommand(originalText);
      
      case 'read':
        return await this.handleReadCommand(originalText);
      
      case 'write':
        return await this.handleWriteCommand(originalText);
      
      case 'navigate':
        return await this.handleNavigateCommand(originalText);
      
      case 'explain':
        return await this.handleExplainCommand(originalText);
      
      case 'execute':
        return await this.handleExecuteCommand(originalText);
      
      case 'summarize':
        return await this.handleSummarizeCommand(originalText);
      
      case 'compare':
        return await this.handleCompareCommand(originalText);
      
      case 'help':
        return await this.handleHelpCommand(originalText);
      
      case 'chat':
      default:
        return await this.handleChatCommand(originalText);
    }
  }

  /**
   * Manejar comando de búsqueda
   */
  async handleSearchCommand(text) {
    // Extraer término de búsqueda
    const searchTerm = this.extractSearchTerm(text);
    
    return {
      success: true,
      action: 'search',
      searchTerm: searchTerm,
      feedback: `Buscando información sobre ${searchTerm}`,
      executionTime: Date.now()
    };
  }

  /**
   * Manejar comando de análisis
   */
  async handleAnalyzeCommand(text) {
    // Extraer qué analizar
    const target = this.extractTarget(text);
    
    return {
      success: true,
      action: 'analyze',
      target: target,
      feedback: `Analizando ${target || 'el código actual'}`,
      executionTime: Date.now()
    };
  }

  /**
   * Manejar comando de creación
   */
  async handleCreateCommand(text) {
    const target = this.extractTarget(text);
    
    return {
      success: true,
      action: 'create',
      target: target,
      feedback: `Creando ${target}`,
      executionTime: Date.now()
    };
  }

  /**
   * Manejar comando de lectura
   */
  async handleReadCommand(text) {
    const target = this.extractTarget(text);
    
    return {
      success: true,
      action: 'read',
      target: target,
      feedback: `Leyendo ${target || 'el archivo'}`,
      executionTime: Date.now()
    };
  }

  /**
   * Manejar comando de escritura
   */
  async handleWriteCommand(text) {
    const target = this.extractTarget(text);
    
    return {
      success: true,
      action: 'write',
      target: target,
      feedback: `Modificando ${target || 'el archivo'}`,
      executionTime: Date.now()
    };
  }

  /**
   * Manejar comando de navegación
   */
  async handleNavigateCommand(text) {
    const target = this.extractTarget(text);
    
    return {
      success: true,
      action: 'navigate',
      target: target,
      feedback: `Navegando a ${target}`,
      executionTime: Date.now()
    };
  }

  /**
   * Manejar comando de explicación
   */
  async handleExplainCommand(text) {
    const topic = this.extractSearchTerm(text);
    
    return {
      success: true,
      action: 'explain',
      topic: topic,
      feedback: `Explicando ${topic}`,
      executionTime: Date.now()
    };
  }

  /**
   * Manejar comando de ejecución
   */
  async handleExecuteCommand(text) {
    const task = this.extractTarget(text);
    
    return {
      success: true,
      action: 'execute',
      task: task,
      feedback: `Ejecutando ${task}`,
      executionTime: Date.now()
    };
  }

  /**
   * Manejar comando de resumen
   */
  async handleSummarizeCommand(text) {
    const target = this.extractTarget(text);
    
    return {
      success: true,
      action: 'summarize',
      target: target,
      feedback: `Resumiendo ${target || 'el contenido'}`,
      executionTime: Date.now()
    };
  }

  /**
   * Manejar comando de comparación
   */
  async handleCompareCommand(text) {
    return {
      success: true,
      action: 'compare',
      feedback: `Comparando elementos`,
      executionTime: Date.now()
    };
  }

  /**
   * Manejar comando de ayuda
   */
  async handleHelpCommand(text) {
    const capabilities = [
      'Buscar información',
      'Analizar código',
      'Crear archivos',
      'Leer archivos',
      'Modificar código',
      'Explicar conceptos',
      'Ejecutar tareas',
      'Resumir contenido',
      'Comparar elementos'
    ];

    return {
      success: true,
      action: 'help',
      capabilities: capabilities,
      feedback: `Puedo ayudarte con: ${capabilities.slice(0, 3).join(', ')}, y más. ¿En qué puedo ayudarte?`,
      executionTime: Date.now()
    };
  }

  /**
   * Manejar comando de chat normal
   */
  async handleChatCommand(text) {
    // Usar el sistema normal de procesamiento de mensajes
    if (this.nucleus && this.nucleus.brain) {
      const response = await this.nucleus.brain.processMessage(text, {
        tenant: 'clayton-enterprise',
        language: 'es'
      });
      
      return {
        success: true,
        action: 'chat',
        response: response.text,
        feedback: response.text.substring(0, 100) + '...',
        executionTime: Date.now()
      };
    }

    return {
      success: false,
      feedback: 'Sistema de chat no disponible',
      executionTime: Date.now()
    };
  }

  /**
   * Extraer término de búsqueda del comando
   */
  extractSearchTerm(text) {
    // Remover palabras de comando
    const cleanText = text
      .replace(/busca|buscar|encuentra|localiza|investiga|investigar|sobre|about/gi, '')
      .trim();
    
    return cleanText || 'información';
  }

  /**
   * Extraer objetivo del comando
   */
  extractTarget(text) {
    // Buscar palabras clave como "el archivo X", "la función Y", etc.
    const patterns = [
      /(?:el|la|los|las)\s+(\w+(?:\s+\w+)?)/i,
      /(?:archivo|función|clase|variable)\s+(\w+)/i,
      /(\w+\.\w+)/, // archivo.extensión
      /"([^"]+)"/,  // entre comillas
      /'([^']+)'/   // entre comillas simples
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Speech-to-Text usando el núcleo
   */
  async speechToText(audioBuffer) {
    if (!this.nucleus || !this.nucleus.multimodal) {
      throw new Error('Nucleus multimodal no disponible');
    }
    return await this.nucleus.multimodal.speechToText(audioBuffer);
  }

  /**
   * Text-to-Speech usando el núcleo
   */
  async textToSpeech(text) {
    if (!this.nucleus || !this.nucleus.multimodal) {
      throw new Error('Nucleus multimodal no disponible');
    }
    return await this.nucleus.multimodal.textToSpeech(text);
  }

  /**
   * Iniciar escucha continua
   */
  async startListening() {
    this.isListening = true;
    console.log('[AI-COMMANDS] Escucha activada');
  }

  /**
   * Detener escucha
   */
  stopListening() {
    this.isListening = false;
    console.log('[AI-COMMANDS] Escucha detenida');
  }

  /**
   * Obtener historial de comandos
   */
  getCommandHistory(limit = 10) {
    return this.commandHistory.slice(-limit);
  }

  /**
   * Limpiar historial
   */
  clearHistory() {
    this.commandHistory = [];
  }
}

module.exports = VoiceCommandsForAI;

