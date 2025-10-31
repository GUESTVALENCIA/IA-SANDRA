/**
 * VOICE PROGRAMMING MODULE
 * Procesamiento de comandos de voz para generación de código
 * Similar a Cursor 2.0 voice programming capabilities
 */

const { detectRole } = require('./sandra-prompts');

class VoiceProgramming {
  constructor(nucleus) {
    this.nucleus = nucleus;
    this.isListening = false;
    this.commandHistory = [];
  }

  /**
   * Procesar comando de voz completo
   * @param {Buffer} audioBuffer - Audio del usuario
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async processVoiceCommand(audioBuffer) {
    try {
      // 1. Speech-to-Text (STT) usando Deepgram
      const text = await this.speechToText(audioBuffer);
      console.log('[VOICE] Comando reconocido:', text);

      // 2. Procesar comando
      const command = await this.parseCommand(text);
      console.log('[VOICE] Comando parseado:', command);

      // 3. Generar código usando GPT-4o
      const codeResult = await this.generateCode(command);
      console.log('[VOICE] Código generado');

      // 4. Aplicar código al proyecto
      const applyResult = await this.applyCode(codeResult);

      // 5. Feedback por voz
      const feedback = this.generateFeedback(applyResult);
      await this.textToSpeech(feedback);

      return {
        success: true,
        command: text,
        parsedCommand: command,
        generatedCode: codeResult.code,
        applied: applyResult.success,
        message: feedback
      };
    } catch (error) {
      console.error('[VOICE] Error procesando comando:', error);
      const errorMessage = `Error: ${error.message}`;
      await this.textToSpeech(errorMessage);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Convertir voz a texto usando Deepgram
   */
  async speechToText(audioBuffer) {
    if (!this.nucleus || !this.nucleus.multimodal) {
      throw new Error('Nucleus multimodal no disponible');
    }

    return await this.nucleus.multimodal.speechToText(audioBuffer);
  }

  /**
   * Convertir texto a voz usando Cartesia
   */
  async textToSpeech(text) {
    if (!this.nucleus || !this.nucleus.multimodal) {
      throw new Error('Nucleus multimodal no disponible');
    }

    return await this.nucleus.multimodal.textToSpeech(text);
  }

  /**
   * Parsear comando de texto a estructura ejecutable
   */
  async parseCommand(text) {
    const lowerText = text.toLowerCase();

    // Detectar acción principal
    const action = this.detectAction(lowerText);

    // Detectar rol si es necesario (para contexto de desarrollo)
    const role = detectRole(text, { defaultRole: 'dev-fullstack' });

    // Extraer entidades
    const entities = this.extractEntities(text);

    // Parsear estructura
    const structure = this.parseStructure(text);

    return {
      action,
      role,
      entities,
      structure,
      originalText: text,
      timestamp: Date.now()
    };
  }

  /**
   * Detectar tipo de acción del comando
   */
  detectAction(text) {
    const actionPatterns = {
      create: ['crea', 'añade', 'implementa', 'agrega', 'haz', 'genera'],
      modify: ['modifica', 'cambia', 'reemplaza', 'actualiza', 'edita'],
      get: ['trae', 'obtén', 'lee', 'consulta', 'muestra', 'dame'],
      delete: ['elimina', 'borra', 'quita', 'remueve'],
      navigate: ['abre', 've a', 'muestra', 'ir a', 'navega'],
      execute: ['ejecuta', 'corre', 'run', 'ejecutar'],
      test: ['prueba', 'test', 'valida', 'verifica']
    };

    for (const [action, keywords] of Object.entries(actionPatterns)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return action;
      }
    }

    return 'general';
  }

  /**
   * Extraer entidades del comando (nombres, archivos, etc.)
   */
  extractEntities(text) {
    const entities = {
      functionName: null,
      fileName: null,
      className: null,
      variableName: null,
      parameters: [],
      returnType: null
    };

    // Extraer nombre de función (patrones comunes)
    const functionPatterns = [
      /función (?:llamada )?([a-záéíóúñ][a-záéíóúñ0-9]*)/i,
      /función ([a-záéíóúñ][a-záéíóúñ0-9]*)/i,
      /(?:crea|haz) ([a-záéíóúñ][a-záéíóúñ0-9]*)/i
    ];

    for (const pattern of functionPatterns) {
      const match = text.match(pattern);
      if (match) {
        entities.functionName = match[1];
        break;
      }
    }

    // Extraer nombre de archivo
    const filePattern = /(?:archivo|file) ([a-záéíóúñ][a-záéíóúñ0-9]*\.(?:js|ts|py|java))/i;
    const fileMatch = text.match(filePattern);
    if (fileMatch) {
      entities.fileName = fileMatch[1];
    }

    // Extraer parámetros (números, strings, etc.)
    const paramPattern = /(?:reciba|recibe|que tome) ([^y]+?)(?: y|$)/i;
    const paramMatch = text.match(paramPattern);
    if (paramMatch) {
      entities.parameters = paramMatch[1].split(/y|,/).map(p => p.trim());
    }

    return entities;
  }

  /**
   * Parsear estructura del comando
   */
  parseStructure(text) {
    const structure = {
      type: null, // function, class, variable, loop, etc.
      modifiers: [],
      scope: null
    };

    // Detectar tipo
    if (text.includes('función') || text.includes('function')) {
      structure.type = 'function';
    } else if (text.includes('clase') || text.includes('class')) {
      structure.type = 'class';
    } else if (text.includes('bucle') || text.includes('loop') || text.includes('for')) {
      structure.type = 'loop';
    } else if (text.includes('condicional') || text.includes('if')) {
      structure.type = 'conditional';
    }

    // Detectar modificadores (async, export, etc.)
    if (text.includes('asíncrona') || text.includes('async')) {
      structure.modifiers.push('async');
    }
    if (text.includes('exporta') || text.includes('export')) {
      structure.modifiers.push('export');
    }

    return structure;
  }

  /**
   * Generar código usando GPT-4o con contexto del proyecto
   */
  async generateCode(command) {
    if (!this.nucleus || !this.nucleus.brain) {
      throw new Error('Nucleus brain no disponible');
    }

    // Construir prompt para generación de código
    const codePrompt = this.buildCodePrompt(command);

    // Contexto enriquecido para generación
    const context = {
      message: codePrompt,
      role: command.role || 'dev-fullstack',
      intent: 'code_generation',
      entities: command.entities,
      structure: command.structure
    };

    // Usar el brain del núcleo para generar
    const response = await this.nucleus.brain.processMessage(codePrompt, context);

    // Extraer código del response
    const code = this.extractCodeFromResponse(response.text);

    return {
      code,
      explanation: response.text,
      metadata: {
        role: command.role,
        action: command.action,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Construir prompt para generación de código
   */
  buildCodePrompt(command) {
    let prompt = `Genera código JavaScript/Node.js para el siguiente comando:\n\n`;
    prompt += `"${command.originalText}"\n\n`;

    if (command.entities.functionName) {
      prompt += `Nombre de función: ${command.entities.functionName}\n`;
    }

    if (command.entities.parameters.length > 0) {
      prompt += `Parámetros: ${command.entities.parameters.join(', ')}\n`;
    }

    if (command.structure.type) {
      prompt += `Tipo: ${command.structure.type}\n`;
    }

    if (command.structure.modifiers.length > 0) {
      prompt += `Modificadores: ${command.structure.modifiers.join(', ')}\n`;
    }

    prompt += `\nGenera solo el código, sin explicaciones adicionales. Usa JavaScript/Node.js moderno.`;

    return prompt;
  }

  /**
   * Extraer código de la respuesta del LLM
   */
  extractCodeFromResponse(text) {
    // Buscar código entre backticks
    const codeBlockRegex = /```(?:javascript|js|typescript|ts)?\n([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    
    if (match) {
      return match[1].trim();
    }

    // Si no hay bloques de código, buscar código directo
    // (asumir que la respuesta es principalmente código)
    const lines = text.split('\n');
    const codeLines = lines.filter(line => {
      // Filtrar líneas que parecen código (no explicaciones)
      return line.trim().startsWith('function') ||
             line.trim().startsWith('const') ||
             line.trim().startsWith('let') ||
             line.trim().startsWith('class') ||
             line.trim().startsWith('export') ||
             line.includes('=>') ||
             line.includes('(') && line.includes(')');
    });

    return codeLines.join('\n');
  }

  /**
   * Aplicar código generado al proyecto con validación
   */
  async applyCode(codeResult) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      // 1. Determinar archivo objetivo
      const fileName = codeResult.metadata?.fileName || 'generated-code.js';
      const projectRoot = process.cwd();
      const targetDir = codeResult.metadata?.targetDir || 'extracted_app';
      const targetPath = path.join(projectRoot, targetDir, fileName);
      
      // 2. Crear backup si el archivo existe
      let backupPath = null;
      try {
        const stats = await fs.stat(targetPath);
        if (stats.isFile()) {
          backupPath = targetPath + `.backup.${Date.now()}`;
          await fs.copyFile(targetPath, backupPath);
          console.log('[VOICE] Backup creado:', backupPath);
        }
      } catch (e) {
        // Archivo no existe, no necesita backup
      }
      
      // 3. Validar sintaxis básica (solo para JavaScript)
      if (fileName.endsWith('.js')) {
        try {
          // Intentar parsear el código
          new Function(codeResult.code);
        } catch (syntaxError) {
          throw new Error(`Error de sintaxis: ${syntaxError.message}`);
        }
      }
      
      // 4. Crear directorio si no existe
      const targetDirPath = path.dirname(targetPath);
      await fs.mkdir(targetDirPath, { recursive: true });
      
      // 5. Escribir código al archivo
      await fs.writeFile(targetPath, codeResult.code, 'utf8');
      console.log('[VOICE] Código aplicado en:', targetPath);
      
      return {
        success: true,
        message: 'Código aplicado exitosamente',
        file: fileName,
        filePath: targetPath,
        backupPath: backupPath,
        line: codeResult.metadata?.line || 0,
        size: codeResult.code.length
      };
    } catch (error) {
      console.error('[VOICE] Error aplicando código:', error);
      return {
        success: false,
        message: `Error al aplicar código: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Generar feedback para el usuario
   */
  generateFeedback(result) {
    if (result.success) {
      return `Código generado y aplicado exitosamente en ${result.file}`;
    } else {
      return `Error al aplicar código: ${result.message}`;
    }
  }

  /**
   * Iniciar escucha continua de comandos de voz
   */
  async startListening() {
    this.isListening = true;
    console.log('[VOICE] Escucha activada');
    // TODO: Implementar escucha continua
  }

  /**
   * Detener escucha
   */
  stopListening() {
    this.isListening = false;
    console.log('[VOICE] Escucha detenida');
  }
}

module.exports = VoiceProgramming;

