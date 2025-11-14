const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class AIOrchestrator {
  constructor() {
    this.providers = {
      groq: {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: process.env.GROQ_API_KEY,
        models: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
        defaultModel: 'mixtral-8x7b-32768'
      },
      deepseek: {
        url: 'https://api.deepseek.com/v1/chat/completions',
        apiKey: process.env.DEEPSEEK_API_KEY,
        models: ['deepseek-chat', 'deepseek-coder'],
        defaultModel: 'deepseek-chat'
      },
      claude: {
        url: 'https://api.anthropic.com/v1/messages',
        apiKey: process.env.CLAUDE_API_KEY,
        models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
        defaultModel: 'claude-3-5-sonnet-20241022'
      },
      ollama: {
        url: 'http://localhost:11434/api/generate',
        local: true,
        models: ['mistral', 'codellama', 'llama2'],
        defaultModel: 'mistral'
      }
    };

    this.subagents = new Map();
    this.defaultProvider = 'groq';
    
    console.log('✅ AI Orchestrator inicializado');
  }

  // ==================== GENERACIÓN DE RESPUESTAS ====================
  
  async generateResponse(prompt, provider = null, model = null, options = {}) {
    const selectedProvider = provider || this.defaultProvider;
    const config = this.providers[selectedProvider];
    
    if (!config) {
      throw new Error(`Proveedor ${selectedProvider} no configurado`);
    }

    try {
      if (selectedProvider === 'ollama') {
        return await this.generateWithOllama(prompt, model || config.defaultModel, options);
      } else if (selectedProvider === 'claude') {
        return await this.generateWithClaude(prompt, model || config.defaultModel, options);
      } else {
        return await this.generateWithOpenAIFormat(prompt, selectedProvider, model || config.defaultModel, options);
      }
    } catch (error) {
      console.error(`Error con ${selectedProvider}:`, error.message);
      
      // Fallback automático
      if (options.fallback !== false) {
        console.log('🔄 Intentando con proveedor de respaldo...');
        return await this.multiProviderFallback(prompt, selectedProvider, options);
      }
      
      throw error;
    }
  }

  async generateWithOpenAIFormat(prompt, provider, model, options) {
    const config = this.providers[provider];
    
    // Validar API key
    if (!config.apiKey || config.apiKey === 'undefined' || config.apiKey.trim() === '') {
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
          'Authorization': `Bearer ${config.apiKey}`,
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
    
    const response = await axios.post(config.url, {
      model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.maxTokens || 4000
      }
    }, {
      timeout: options.timeout || 120000
    });

    return response.data.response;
  }

  async multiProviderFallback(prompt, failedProvider, options) {
    const fallbackOrder = ['groq', 'deepseek', 'ollama'];
    
    for (const provider of fallbackOrder) {
      if (provider === failedProvider) continue;
      
      try {
        console.log(`🔄 Intentando con ${provider}...`);
        return await this.generateResponse(prompt, provider, null, { ...options, fallback: false });
      } catch (error) {
        console.error(`❌ ${provider} también falló:`, error.message);
      }
    }
    
    throw new Error('Todos los proveedores fallaron');
  }

  setDefaultProvider(provider) {
    if (!this.providers[provider]) {
      throw new Error(`Proveedor ${provider} no existe`);
    }
    
    this.defaultProvider = provider;
    console.log(`✅ Proveedor por defecto cambiado a: ${provider}`);
  }

  // ==================== SISTEMA DE SUBAGENTES ====================

  async spawnSubagent(role, config = {}) {
    const agentId = `agent_${Date.now()}_${role}`;
    
    const agent = {
      id: agentId,
      role,
      provider: config.provider || this.defaultProvider,
      model: config.model || null,
      systemPrompt: this.getRoleSystemPrompt(role),
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

  async executeWithSubagent(agentId, task) {
    const agent = this.subagents.get(agentId);
    
    if (!agent) {
      throw new Error(`Subagente ${agentId} no encontrado`);
    }

    // Convertir task a string si no lo es
    const taskString = typeof task === 'string' ? task : JSON.stringify(task);
    const taskPreview = taskString.length > 50 ? taskString.substring(0, 50) + '...' : taskString;
    
    console.log(`🔧 ${agent.role} ejecutando: ${taskPreview}`);

    // Construir prompt con contexto del agente
    const fullPrompt = `${agent.systemPrompt}

Tarea: ${taskString}

Ejecuta esta tarea de forma PRÁCTICA y REAL. No teoría, solo ejecución.`;

    const response = await this.generateResponse(
      fullPrompt,
      agent.provider,
      agent.model,
      { systemPrompt: agent.systemPrompt }
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

