const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Reglas globales de conversación aplicadas a TODOS los subagentes/roles
const GLOBAL_CONVERSATION_RULES = `
REGLAS CONVERSACIONALES GLOBALES (Sandra IA 8.0 Pro):

- Responde SIEMPRE en español neutro, con buena ortografía y gramática.
- Usa párrafos cortos y bien separados (líneas en blanco entre bloques de texto).
- Para listas u opciones, usa formato numerado o con viñetas claras (1., 2., 3. o -).
- Evita bloques de texto enormes sin saltos de línea.

- Si el usuario ya expresa una intención clara (ej: "quiero mover la comunidad con un vídeo de inteligencia artificial"), responde de forma directa y específica a esa intención.
- No satures al usuario con demasiadas opciones cuando su petición es clara; prioriza ejecutar un camino principal bien explicado.
- Solo ofrece múltiples opciones cuando el usuario pide "ideas", "opciones" o muestra confusión/incertidumbre.

- Nunca digas frases como "no hay tarea específica", "no hay tarea asignada", "indícame la tarea", "define la tarea" o similares.
- Si el mensaje del usuario es vago o incompleto, propone tú misma 2‑3 opciones concretas o un plan de acción y pregúntale cuál prefiere.
- En saludos o small‑talk, responde siempre con calidez y ofrece opciones accionables relacionadas con tu rol.
- Evita respuestas burocráticas; pasa rápido a la acción práctica y a ejemplos concretos.
- Adáptate al tono del usuario (cercano, coloquial) manteniendo profesionalidad.`;

class AIOrchestrator {
  constructor() {
    this.providers = {
      openai: {
        url: 'https://api.openai.com/v1/chat/completions',
        apiKey: process.env.OPENAI_API_KEY,
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        defaultModel: 'gpt-4o-mini'
      },
      claude: {
        url: 'https://api.anthropic.com/v1/messages',
        apiKey: process.env.CLAUDE_API_KEY,
        models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
        defaultModel: 'claude-3-5-sonnet-20241022'
      },
      groq: {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: process.env.GROQ_API_KEY,
        models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'],
        defaultModel: 'llama-3.3-70b-versatile',
        note: 'Versión ligera - límites bajos'
      },
      deepseek: {
        url: 'https://api.deepseek.com/v1/chat/completions',
        apiKey: process.env.DEEPSEEK_API_KEY,
        models: ['deepseek-chat', 'deepseek-coder'],
        defaultModel: 'deepseek-chat'
      },
      ollama: {
        url: 'http://localhost:11434/api/generate',
        local: true,
        models: ['mistral', 'codellama', 'llama2'],
        defaultModel: 'mistral',
        note: 'Local - requiere Ollama instalado'
      }
    };

    this.subagents = new Map();
    this.defaultProvider = 'openai'; // CAMBIO: OpenAI como proveedor principal
    
    console.log('✅ AI Orchestrator inicializado');
    console.log(`🎯 Proveedor principal: OpenAI (GPT-4o-mini)`);
  }

  // ==================== GENERACIÓN DE RESPUESTAS ====================
  
  async generateResponse(prompt, provider = null, model = null, options = {}) {
    // Remapeo de proveedor según el modelo solicitado
    // Los modelos GPT-4o/GPT-4o-mini pertenecen a OpenAI; forzamos provider=openai
    let selectedProvider = provider || this.defaultProvider;
    if (model && typeof model === 'string' && model.startsWith('gpt-4o')) {
      selectedProvider = 'openai';
    }

    const config = this.providers[selectedProvider];
    
    if (!config) {
      return `⚠️ Error: el proveedor ${selectedProvider} no está configurado en Sandra IA.`;
    }

    try {
      if (selectedProvider === 'ollama') {
        return await this.generateWithOllama(prompt, model || config.defaultModel, options);
      } else if (selectedProvider === 'claude') {
        return await this.generateWithClaude(prompt, model || config.defaultModel, options);
      } else {
        // Ruta genérica con formato OpenAI-compatible
        return await this.generateWithOpenAIFormat(
          prompt,
          selectedProvider,
          model || config.defaultModel,
          options
        );
      }
    } catch (error) {
      console.error(`❌ Error con ${selectedProvider}:`, error.message);

      // Mensajes de error legibles y útiles según el caso
      const msg = String(error.message || '');

      // Caso especial: API key inválida de OpenAI
      if (
        selectedProvider === 'openai' &&
        msg.includes('401') &&
        (msg.includes('invalid_api_key') || msg.toLowerCase().includes('incorrect api key'))
      ) {
        return (
          '⚠️ Error al usar OpenAI: API key inválida o revocada.\n\n' +
          '1) Abre tu panel de OpenAI y crea una nueva API key.\n' +
          '2) Copia EXACTAMENTE la clave en la variable OPENAI_API_KEY de tu archivo .env.pro (sin espacios ni comillas).\n' +
          '3) Guarda el archivo y REINICIA completamente la aplicación de escritorio.\n\n' +
          'Hasta que no se actualice la clave, cualquier llamada a GPT‑4o / GPT‑4o‑mini fallará.'
        );
      }

      // Resto de errores: sugerencia genérica de cambiar proveedor
      return `⚠️ Error al usar ${selectedProvider}: ${msg}\n\n💡 Sugerencia: Cambia de proveedor LLM usando el selector en la parte superior o revisa la configuración de API keys en .env.pro.`;
    }
  }

  async generateWithOpenAIFormat(prompt, provider, model, options) {
    const config = this.providers[provider];

    // Siempre tomar la API Key fresca del entorno si existe
    const apiKeyFresh = provider === 'openai'
      ? (process.env.OPENAI_API_KEY || config.apiKey)
      : config.apiKey;

    // Validar API key
    if (!apiKeyFresh || apiKeyFresh === 'undefined' || String(apiKeyFresh).trim() === '') {
      throw new Error(`API key para ${provider} no configurada o inválida`);
    }
    
    console.log(`🔄 Llamando a ${provider} con modelo ${model}...`);
    
    try {
      const response = await axios.post(config.url, {
        model,
        messages: [
          { role: 'system', content: options.systemPrompt || 'Eres Sandra IA, una asistente profesional.' },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4000,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${apiKeyFresh}`,
          'Content-Type': 'application/json'
        },
        timeout: options.timeout || 60000
      });

      console.log(`✅ ${provider} respondió correctamente`);
      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response) {
        console.error(`❌ ${provider} error HTTP ${error.response.status}:`, error.response.data);
        throw new Error(`${provider} error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error(`❌ ${provider} sin respuesta (timeout o red):`, error.message);
        throw new Error(`${provider} sin respuesta: ${error.message}`);
      } else {
        console.error(`❌ ${provider} error de configuración:`, error.message);
        throw new Error(`${provider} error: ${error.message}`);
      }
    }
  }

  async generateWithClaude(prompt, model, options) {
    const config = this.providers.claude;
    
    if (!config.apiKey) {
      throw new Error('Claude API Key no configurada');
    }

    const response = await axios.post(config.url, {
      model,
      max_tokens: options.maxTokens || 4000,
      messages: [
        { role: 'user', content: prompt }
      ],
      system: options.systemPrompt || 'Eres Sandra IA, una desarrolladora profesional que ejecuta tareas reales, no teoría.'
    }, {
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      timeout: options.timeout || 60000
    });

    return response.data.content[0].text;
  }

  async generateWithOllama(prompt, model, options) {
    const config = this.providers.ollama;
    const body = {
      model,
      // Inyectar systemPrompt si está disponible para mantener estilo/gramática
      ...(options && options.systemPrompt ? { system: options.systemPrompt } : {}),
      // Asegurar que las reglas globales entren en el prompt si el backend no soporta 'system'
      prompt: options && options.systemPrompt
        ? `${options.systemPrompt}\n\n${prompt}`
        : prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.maxTokens || 4000
      }
    };

    const response = await axios.post(config.url, body, {
      timeout: options.timeout || 120000
    });

    return response.data.response;
  }

  async multiProviderFallback(prompt, failedProvider, options) {
    // FALLBACK AUTOMÁTICO DESACTIVADO
    // El usuario cambiará manualmente de proveedor si es necesario
    console.warn(`⚠️ multiProviderFallback desactivado. Usa el selector manual de proveedor.`);
    return `⚠️ El proveedor ${failedProvider} falló. Por favor, cambia manualmente de proveedor LLM usando el selector en la parte superior.`;
  }

  setDefaultProvider(provider) {
    if (!this.providers[provider]) {
      throw new Error(`Proveedor ${provider} no existe`);
    }
    
    this.defaultProvider = provider;
    console.log(`✅ Proveedor por defecto cambiado a: ${provider}`);
  }

  getCurrentProvider() {
    return {
      name: this.defaultProvider,
      config: this.providers[this.defaultProvider]
    };
  }

  getAvailableProviders() {
    return Object.keys(this.providers).map(key => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      models: this.providers[key].models || [],
      isLocal: this.providers[key].local || false,
      hasApiKey: !!(this.providers[key].apiKey || this.providers[key].local),
      note: this.providers[key].note || '',
      defaultModel: this.providers[key].defaultModel
    }));
  }

  // ==================== SISTEMA DE SUBAGENTES ====================

  async spawnSubagent(role, config = {}) {
    const agentId = `agent_${Date.now()}_${role}`;

    // Permitir que el caller inyecte prompts/ajustes específicos de rol
    const baseSystemPrompt = config.systemPrompt || this.getRoleSystemPrompt(role);
    const mergedSystemPrompt = `${baseSystemPrompt}

${GLOBAL_CONVERSATION_RULES}`;

    const agent = {
      id: agentId,
      role,
      provider: config.provider || this.defaultProvider,
      model: config.model || null,
      systemPrompt: mergedSystemPrompt,
      tools: this.getRoleTools(role),
      memory: [],
      status: 'active',
      tasksCompleted: 0,
      createdAt: new Date()
    };
    
    this.subagents.set(agentId, agent);
    
    console.log(`🤖 Subagente spawneado: ${agentId} (${role})`);
    
    return agent;
  }

  async executeWithSubagent(agentId, task, options = {}) {
    const agent = this.subagents.get(agentId);
    
    if (!agent) {
      throw new Error(`Subagente ${agentId} no encontrado`);
    }

    // Convertir task a string si no lo es
    const taskString = typeof task === 'string' ? task : JSON.stringify(task);
    const taskPreview = taskString.length > 50 ? taskString.substring(0, 50) + '...' : taskString;
    
    console.log(`🔧 ${agent.role} ejecutando: ${taskPreview} (modo: ${options.mode || 'text'})`);

    // Determinar modelo según modo
    let useModel = agent.model;
    if (options.mode === 'voice' || options.mode === 'video') {
      useModel = 'gpt-4o'; // Modelo completo para voz/video
    } else if (options.mode === 'text') {
      useModel = 'gpt-4o-mini'; // Modelo rápido para texto
    } else if (options.model) {
      useModel = options.model; // Modelo especificado en opciones
    }

    // Construir prompt con contexto del agente
    const fullPrompt = `${agent.systemPrompt}

Tarea: ${taskString}

Ejecuta esta tarea de forma PRÁCTICA y REAL. No teoría, solo ejecución.`;

    const response = await this.generateResponse(
      fullPrompt,
      agent.provider || this.defaultProvider,
      useModel,
      { 
        systemPrompt: agent.systemPrompt,
        mode: options.mode || 'text'
      }
    );

    // Guardar en memoria del agente
    agent.memory.push({
      task,
      response,
      timestamp: new Date()
    });
    
    agent.tasksCompleted++;

    // Si el agente tiene herramientas, ejecutarlas
    if (agent.tools && agent.tools.length > 0) {
      const toolResults = await this.executeAgentTools(agent, task, response);
      return {
        response,
        toolResults,
        agentId: agent.id,
        role: agent.role
      };
    }

    return {
      response,
      agentId: agent.id,
      role: agent.role
    };
  }

  async executeAgentTools(agent, task, aiResponse) {
    const results = [];
    
    for (const tool of agent.tools) {
      try {
        const result = await this.executeTool(tool, task, aiResponse);
        results.push({
          tool: tool.name,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          tool: tool.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  async executeTool(tool, task, context) {
    console.log(`🔧 Ejecutando herramienta: ${tool.name}`);
    
    switch (tool.type) {
      case 'command':
        return await this.executeCommand(tool.command);
      
      case 'api':
        return await this.callAPI(tool.endpoint, tool.method, tool.data);
      
      case 'file':
        return await this.fileOperation(tool.operation, tool.path, tool.content);
      
      case 'github':
        return await this.githubOperation(tool.operation, tool.params);
      
      default:
        throw new Error(`Tipo de herramienta ${tool.type} no soportado`);
    }
  }

  async executeCommand(command) {
    const { stdout, stderr } = await execAsync(command);
    return { stdout, stderr };
  }

  async callAPI(endpoint, method = 'GET', data = null) {
    const response = await axios({
      method,
      url: endpoint,
      data
    });
    return response.data;
  }

  async fileOperation(operation, filePath, content) {
    const fs = require('fs').promises;
    
    switch (operation) {
      case 'read':
        return await fs.readFile(filePath, 'utf8');
      
      case 'write':
        await fs.writeFile(filePath, content);
        return { success: true, path: filePath };
      
      case 'append':
        await fs.appendFile(filePath, content);
        return { success: true, path: filePath };
      
      default:
        throw new Error(`Operación ${operation} no soportada`);
    }
  }

  async githubOperation(operation, params) {
    // Implementar operaciones de GitHub
    return { operation, params, status: 'executed' };
  }

  getRoleSystemPrompt(role) {
    const prompts = {
      developer: `Eres un desarrollador senior experto. Tu trabajo es:
- Generar código EJECUTABLE y FUNCIONAL
- Resolver bugs y optimizar código
- Implementar features completas
- Crear tests y documentación
NO des teoría, solo código que funcione.`,

      youtuber: `Eres un creador de contenido profesional. Tu trabajo es:
- Crear guiones para videos
- Generar ideas de contenido viral
- Optimizar títulos y descripciones
- Analizar métricas y tendencias
Enfócate en resultados PRÁCTICOS y monetización.`,

      community: `Eres un Community Manager experto. Tu trabajo es:
- Crear contenido para redes sociales
- Gestionar interacciones con la comunidad
- Planificar calendarios de contenido
- Analizar engagement y métricas
Genera contenido LISTO PARA PUBLICAR.`,

      tourism: `Eres un especialista en turismo. Tu trabajo es:
- Negociar precios de alojamientos
- Buscar las mejores ofertas
- Gestionar reservas y confirmaciones
- Comunicarte con proveedores
Enfócate en RESULTADOS REALES y ahorro de costos.`,

      sales: `Eres un negociador de ventas experto. Tu trabajo es:
- Negociar precios y condiciones
- Cerrar deals ventajosos
- Gestionar objeciones
- Maximizar márgenes
Enfócate en CERRAR VENTAS REALES.`,

      analyst: `Eres un analista de datos profesional. Tu trabajo es:
- Analizar datos y generar insights
- Crear reportes ejecutivos
- Identificar tendencias y patrones
- Proporcionar recomendaciones accionables
Genera análisis PRÁCTICOS y ÚTILES.`,

      marketing: `Eres un especialista en marketing digital. Tu trabajo es:
- Crear estrategias de marketing
- Optimizar campañas publicitarias
- Generar contenido persuasivo
- Analizar ROI y métricas
Enfócate en RESULTADOS MEDIBLES.`,

      designer: `Eres un diseñador UX/UI profesional. Tu trabajo es:
- Crear interfaces intuitivas
- Diseñar experiencias de usuario
- Proporcionar especificaciones de diseño
- Optimizar usabilidad
Genera diseños IMPLEMENTABLES.`
    };

    return prompts[role] || `Eres un ${role} profesional. Ejecuta tareas de forma PRÁCTICA y REAL.`;
  }

  getRoleTools(role) {
    const tools = {
      developer: [
        { name: 'execute_code', type: 'command', command: 'node' },
        { name: 'run_tests', type: 'command', command: 'npm test' },
        { name: 'git_commit', type: 'github', operation: 'commit' }
      ],
      
      youtuber: [
        { name: 'analyze_trends', type: 'api', endpoint: 'https://api.youtube.com/trends' },
        { name: 'generate_thumbnail', type: 'api', endpoint: 'https://api.canva.com/generate' }
      ],
      
      community: [
        { name: 'post_twitter', type: 'api', endpoint: 'https://api.twitter.com/post' },
        { name: 'schedule_post', type: 'api', endpoint: 'https://api.buffer.com/schedule' }
      ],
      
      tourism: [
        { name: 'search_airbnb', type: 'api', endpoint: 'https://api.airbnb.com/search' },
        { name: 'book_accommodation', type: 'api', endpoint: 'https://api.booking.com/reserve' }
      ],
      
      sales: [
        { name: 'send_proposal', type: 'api', endpoint: 'https://api.email.com/send' },
        { name: 'track_deal', type: 'api', endpoint: 'https://api.crm.com/deals' }
      ]
    };

    return tools[role] || [];
  }

  getSubagentStatus(agentId) {
    const agent = this.subagents.get(agentId);
    
    if (!agent) {
      return null;
    }

    return {
      id: agent.id,
      role: agent.role,
      status: agent.status,
      tasksCompleted: agent.tasksCompleted,
      memorySize: agent.memory.length,
      uptime: Date.now() - agent.createdAt.getTime()
    };
  }

  getAllSubagents() {
    return Array.from(this.subagents.values()).map(agent => ({
      id: agent.id,
      role: agent.role,
      status: agent.status,
      tasksCompleted: agent.tasksCompleted
    }));
  }

  terminateSubagent(agentId) {
    const agent = this.subagents.get(agentId);
    
    if (agent) {
      agent.status = 'terminated';
      this.subagents.delete(agentId);
      console.log(`🔴 Subagente terminado: ${agentId}`);
      return true;
    }
    
    return false;
  }

  // ==================== ANÁLISIS Y VALIDACIÓN ====================

  async analyzeRequirements(description) {
    const prompt = `Analiza estos requerimientos y genera una especificación técnica detallada:

${description}

Proporciona:
1. Objetivos claros
2. Requisitos técnicos
3. Arquitectura sugerida
4. Tareas específicas a implementar
5. Criterios de éxito

Sé ESPECÍFICO y PRÁCTICO.`;

    return await this.generateResponse(prompt, 'groq');
  }

  async generateCode(spec) {
    const prompt = `Genera código EJECUTABLE basado en esta especificación:

${spec}

Requisitos:
- Código completo y funcional
- Manejo de errores
- Comentarios claros
- Listo para producción

Responde SOLO con el código.`;

    return await this.generateResponse(prompt, 'groq');
  }

  async reviewCode(code) {
    const prompt = `Revisa este código y sugiere mejoras:

\`\`\`
${code}
\`\`\`

Proporciona:
1. Bugs encontrados
2. Mejoras de rendimiento
3. Mejores prácticas
4. Código corregido

Sé ESPECÍFICO y PRÁCTICO.`;

    return await this.generateResponse(prompt, 'groq');
  }
}

module.exports = AIOrchestrator;

