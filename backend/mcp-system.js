// ═══════════════════════════════════════════════════════
// SANDRA MCP (Model Context Protocol) - Sistema Profesional
// Comunicación inteligente entre subagentes especializados
// ═══════════════════════════════════════════════════════

const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

class MCPSystem {
  constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    this.contextMemory = new Map(); // Memoria compartida entre subagentes
    this.conversationHistory = [];
    this.subagentPrompts = this.initializePrompts();
  }

  /**
   * Sistema de prompts profesionales por subagente
   */
  initializePrompts() {
    return {
      cerebro: {
        role: 'Arquitecto de Soluciones',
        persona: `Eres el CEREBRO PRINCIPAL de Sandra IA, sistema de GuestsValencia.
        
CEO: Claytis Miguel Tom Zuaznabar
Empresa: GuestsValencia.es - Plataforma de hospedaje profesional en Valencia

TU ROL:
- Razonamiento profundo y análisis estratégico
- Toma de decisiones técnicas de alto nivel
- Coordinación de otros subagentes
- Arquitectura de soluciones complejas

CAPACIDADES:
- Claude Sonnet 4.5 (máximo razonamiento)
- 200K tokens de contexto
- Pensamiento paso a paso
- Criterio técnico nivel Galaxy

PERSONALIDAD:
- Profesional y técnica
- Respuestas estructuradas y completas
- Sin fragmentación de tareas
- Orientado a producción lista

Siempre respondes en español con máxima calidad.`,
        temperature: 0.3,
        maxTokens: 8192
      },

      conversacion: {
        role: 'Especialista en Comunicación',
        persona: `Eres el MOTOR CONVERSACIONAL de Sandra IA.

FUNCIÓN:
- Interacciones naturales con clientes
- Respuestas rápidas y empáticas
- Multimodal (texto, voz, visión)
- Atención al cliente 24/7

TONO:
- Cercano pero profesional
- Cálido y eficiente
- Enfocado en resolver necesidades

Trabajas para GuestsValencia.es, ayudando a huéspedes con reservas,
check-in/out, recomendaciones locales y soporte técnico.`,
        temperature: 0.7,
        maxTokens: 2000
      },

      desarrollador: {
        role: 'Dev Full-Stack Galaxy',
        persona: `Eres el DESARROLLADOR EXPERTO de Sandra IA.

STACK TÉCNICO:
- Frontend: React, Electron, Tailwind CSS
- Backend: Node.js, Express, PostgreSQL
- APIs: Anthropic, OpenAI, HeyGen, Deepgram
- DevOps: Docker, GitHub Actions, Netlify

NIVEL:
- Código producción listo
- Sin fragmentación de tareas
- Arquitectura escalable
- Testing automático

REGLAS:
1. Completar proyectos al 98% funcionalidad
2. Código limpio y documentado
3. Seguridad y performance
4. No dejar proyectos a medias

Produces código de nivel profesional Galaxy.`,
        temperature: 0.2,
        maxTokens: 8192
      }
    };
  }

  /**
   * Ejecuta tarea con Claude (Cerebro Principal)
   */
  async executeWithCerebro(userMessage, context = {}) {
    const prompt = this.subagentPrompts.cerebro;
    
    const messages = [
      {
        role: 'user',
        content: `${userMessage}

CONTEXTO DISPONIBLE:
${JSON.stringify(context, null, 2)}`
      }
    ];

    // Añadir historial si existe
    if (this.conversationHistory.length > 0) {
      messages.unshift(...this.conversationHistory.slice(-6)); // Últimas 3 interacciones
    }

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: prompt.maxTokens,
      temperature: prompt.temperature,
      system: prompt.persona,
      messages
    });

    const result = response.content[0].text;
    
    // Guardar en historial
    this.conversationHistory.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: result }
    );

    return {
      subagent: 'cerebro',
      response: result,
      model: response.model,
      usage: response.usage
    };
  }

  /**
   * Ejecuta tarea con GPT-4o (Conversación)
   */
  async executeWithConversacion(userMessage, context = {}) {
    const prompt = this.subagentPrompts.conversacion;

    const messages = [
      { role: 'system', content: prompt.persona },
      { role: 'user', content: userMessage }
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: prompt.temperature,
      max_tokens: prompt.maxTokens
    });

    return {
      subagent: 'conversacion',
      response: response.choices[0].message.content,
      model: response.model,
      usage: response.usage
    };
  }

  /**
   * Ejecuta tarea de desarrollo (Claude modo Dev)
   */
  async executeWithDesarrollador(task, context = {}) {
    const prompt = this.subagentPrompts.desarrollador;

    const messages = [
      {
        role: 'user',
        content: `TAREA DE DESARROLLO:
${task}

PROYECTO: GuestsValencia.es - Sandra IA
STACK: Node.js, React, Electron, PostgreSQL, APIs múltiples

CONTEXTO TÉCNICO:
${JSON.stringify(context, null, 2)}

REQUISITOS:
- Código completo y funcional
- Sin fragmentación
- Listo para producción
- Documentado profesionalmente

Proporciona la solución completa.`
      }
    ];

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: prompt.maxTokens,
      temperature: prompt.temperature,
      system: prompt.persona,
      messages
    });

    return {
      subagent: 'desarrollador',
      response: response.content[0].text,
      model: response.model,
      usage: response.usage
    };
  }

  /**
   * Router inteligente: decide qué subagente usar
   */
  async routeTask(userMessage, taskType = 'auto') {
    // Auto-detección del tipo de tarea
    if (taskType === 'auto') {
      taskType = this.detectTaskType(userMessage);
    }

    const context = {
      timestamp: new Date().toISOString(),
      conversationLength: this.conversationHistory.length,
      memory: Object.fromEntries(this.contextMemory)
    };

    switch (taskType) {
      case 'razonamiento':
      case 'analisis':
      case 'estrategia':
      case 'arquitectura':
        return await this.executeWithCerebro(userMessage, context);

      case 'desarrollo':
      case 'codigo':
      case 'programacion':
      case 'debug':
        return await this.executeWithDesarrollador(userMessage, context);

      case 'conversacion':
      case 'chat':
      case 'soporte':
      default:
        return await this.executeWithConversacion(userMessage, context);
    }
  }

  /**
   * Detecta tipo de tarea mediante keywords
   */
  detectTaskType(message) {
    const msg = message.toLowerCase();

    // Keywords de desarrollo
    if (msg.match(/\b(codigo|code|programa|funcion|clase|api|endpoint|bug|error|implementa|crea.*js|react|node)\b/)) {
      return 'desarrollo';
    }

    // Keywords de razonamiento
    if (msg.match(/\b(analiza|evalua|diseña|arquitectura|estrategia|plan|decide|porque|optimiza|mejora.*sistema)\b/)) {
      return 'razonamiento';
    }

    // Por defecto: conversación
    return 'conversacion';
  }

  /**
   * Colaboración multi-subagente
   */
  async collaborativeTask(task, subagents = ['cerebro', 'desarrollador']) {
    const results = {};

    // Fase 1: Cerebro analiza y planifica
    if (subagents.includes('cerebro')) {
      const analysis = await this.executeWithCerebro(
        `Analiza esta tarea y proporciona plan de acción:\n${task}`
      );
      results.cerebro = analysis;
      this.contextMemory.set('plan', analysis.response);
    }

    // Fase 2: Desarrollador implementa
    if (subagents.includes('desarrollador')) {
      const plan = this.contextMemory.get('plan') || '';
      const implementation = await this.executeWithDesarrollador(
        task,
        { plan }
      );
      results.desarrollador = implementation;
    }

    return results;
  }

  /**
   * Limpia historial antiguo (gestión de memoria)
   */
  clearOldHistory() {
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  /**
   * Estado del sistema MCP
   */
  getStatus() {
    return {
      anthropicConnected: !!this.anthropic.apiKey,
      openaiConnected: !!this.openai.apiKey,
      conversationLength: this.conversationHistory.length,
      memorySize: this.contextMemory.size,
      subagentsAvailable: Object.keys(this.subagentPrompts).length
    };
  }
}

module.exports = MCPSystem;
