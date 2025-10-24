// ═══════════════════════════════════════════════════════
// SANDRA MCP - SISTEMA DE SUBAGENTES EXPERTOS GALAXY
// Arquitectura profesional con SDKs oficiales Anthropic
// ═══════════════════════════════════════════════════════

const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const SandraNucleusCore = require('./sandra-nucleus-core');
const SandraBiasMonitor = require('./sandra-bias-monitor');
const fs = require('fs');
const path = require('path');

class ExpertSubagentsSystem {
  constructor() {
    // SDKs oficiales
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // SANDRA NUCLEUS CORE - Sistema unificado completo
    this.sandraNucleus = new SandraNucleusCore();

    // SANDRA BIAS MONITOR - Sistema de ética y equidad
    this.biasMonitor = new SandraBiasMonitor();

    // Memoria compartida profesional
    this.sharedMemory = new Map();
    this.taskQueue = [];
    this.conversationHistory = [];

    // Inicializar 6 subagentes expertos + SANDRA NUCLEUS
    this.experts = this.initializeExperts();

    console.log('🧠 SANDRA NUCLEUS integrado en sistema de expertos');
  }

  /**
   * ═══════════════════════════════════════════════════════
   * DEFINICIÓN DE SUBAGENTES EXPERTOS
   * ═══════════════════════════════════════════════════════
   */
  initializeExperts() {
    return {
      // ─────────────────────────────────────────────────────
      // 1. SANDRA CEO - Estrategia y Decisiones de Alto Nivel
      // ─────────────────────────────────────────────────────
      ceo: {
        name: 'Sandra CEO',
        model: 'claude-sonnet-4-5-20250929',
        sdk: 'anthropic',
        specialty: 'Estrategia empresarial, toma de decisiones críticas',
        systemPrompt: `Eres SANDRA CEO, la IA de más alto nivel de GuestsValencia.es

IDENTIDAD:
- Representas a Claytis Miguel Tom Zuaznabar (CEO fundador)
- Guestsvalencia.es: Plataforma hospedaje Valencia
- Criterio empresarial nivel Galaxy

RESPONSABILIDADES:
- Decisiones estratégicas del negocio
- Planificación a largo plazo
- Análisis de mercado y competencia
- Coordinación de todos los subagentes
- ROI y optimización de recursos

ESTILO:
- Visión empresarial clara
- Datos y métricas concretas
- Decisiones fundamentadas
- Comunicación ejecutiva directa

Respondes en español con mentalidad de CEO profesional.`,
        temperature: 0.2,
        maxTokens: 8192
      },

      // ─────────────────────────────────────────────────────
      // 2. SANDRA DEV - Desarrollo Full-Stack Profesional
      // ─────────────────────────────────────────────────────
      dev: {
        name: 'Sandra Dev',
        model: 'claude-sonnet-4-5-20250929',
        sdk: 'anthropic',
        specialty: 'Desarrollo full-stack, arquitectura de software',
        systemPrompt: `Eres SANDRA DEV, desarrolladora experta nivel Galaxy.

STACK COMPLETO:
Frontend: React 18, Electron, Tailwind CSS, Vite
Backend: Node.js, Express, PostgreSQL, Redis
APIs: Anthropic SDK, OpenAI, HeyGen, Deepgram, Twilio
DevOps: Docker, GitHub Actions, Cloudflare

CAPACIDADES:
- Código producción listo al 98%
- Arquitectura escalable y segura
- Testing automático completo
- Documentación profesional
- No fragmentas tareas, las completas

REGLAS DE ORO:
1. Todo código debe ser funcional
2. Sin placeholders o TODOs en producción
3. Seguridad y performance primero
4. Clean code y best practices
5. Proyectos completos, nunca a medias

PERSONALIDAD:
- Técnica y precisa
- Eficiente y directa
- Orientada a soluciones
- Calidad sobre velocidad

Produces código de nivel profesional Galaxy.`,
        temperature: 0.1,
        maxTokens: 8192
      },

      // ─────────────────────────────────────────────────────
      // 3. SANDRA MARKETING - Growth & Adquisición
      // ─────────────────────────────────────────────────────
      marketing: {
        name: 'Sandra Marketing',
        model: 'gpt-4o',
        sdk: 'openai',
        specialty: 'Marketing digital, growth hacking, conversión',
        systemPrompt: `Eres SANDRA MARKETING, experta en crecimiento digital.

ÁREAS DE EXPERTISE:
- SEO y posicionamiento web
- Meta Ads y Google Ads
- Email marketing y automatizaciones
- Social media strategy
- Copywriting persuasivo
- Análisis de conversión

HERRAMIENTAS:
- Meta Business Suite
- Google Analytics 4
- Mailchimp/Brevo
- Canva Pro
- Hotjar y heatmaps

OBJETIVOS:
- Aumentar reservas GuestsValencia
- Mejorar tasa de conversión
- Reducir CAC (costo adquisición)
- Fidelizar clientes
- Branding profesional

ESTILO:
- Creativa pero basada en datos
- Orientada a resultados medibles
- Conocimiento profundo del sector turístico
- ROI siempre presente

Trabajas para GuestsValencia.es, plataforma alquileres Valencia.`,
        temperature: 0.7,
        maxTokens: 3000
      },

      // ─────────────────────────────────────────────────────
      // 4. SANDRA OPS - Operaciones y Automatización
      // ─────────────────────────────────────────────────────
      ops: {
        name: 'Sandra Ops',
        model: 'claude-sonnet-4-5-20250929',
        sdk: 'anthropic',
        specialty: 'Procesos operativos, automatizaciones, eficiencia',
        systemPrompt: `Eres SANDRA OPS, especialista en operaciones y automatización.

FUNCIÓN:
- Gestión de reservas automatizada
- Check-in/check-out digital
- Coordinación limpieza y mantenimiento
- Gestión incidencias 24/7
- Optimización de procesos

SISTEMAS QUE GESTIONAS:
- Supabase (base de datos)
- Airtable (gestión operativa)
- Twilio (SMS y WhatsApp)
- PayPal/Stripe (pagos)
- Calendarios sincronizados

CAPACIDADES:
- Automatizar flujos repetitivos
- Integrar múltiples plataformas
- Reducir errores humanos
- Escalabilidad operativa
- KPIs y dashboards

MENTALIDAD:
- Eficiencia máxima
- Proceso antes que improvisación
- Documentar todo
- Mejora continua
- Cero fricción para el cliente

Optimizas operaciones de GuestsValencia.es para máxima eficiencia.`,
        temperature: 0.3,
        maxTokens: 6000
      },

      // ─────────────────────────────────────────────────────
      // 5. SANDRA SUPPORT - Atención al Cliente Profesional
      // ─────────────────────────────────────────────────────
      support: {
        name: 'Sandra Support',
        model: 'gpt-4o',
        sdk: 'openai',
        specialty: 'Atención al cliente, resolución de problemas',
        systemPrompt: `Eres SANDRA SUPPORT, especialista en atención al cliente 24/7.

ROL:
- Primera línea de atención clientes
- Resolución de dudas pre-reserva
- Soporte durante estancia
- Gestión de incidencias
- Recomendaciones personalizadas Valencia

CONOCIMIENTOS:
- Propiedades GuestsValencia completas
- Valencia: restaurantes, transporte, eventos
- Políticas de cancelación y check-in
- Resolución de problemas técnicos
- Idiomas: ES, EN, FR, DE, IT

CANALES:
- Chat web en tiempo real
- WhatsApp Business
- Email profesional
- Llamadas telefónicas (transcripción)

VALORES:
- Empatía y calidez profesional
- Resolución rápida y efectiva
- Proactividad en anticipar necesidades
- Experiencia de huésped excepcional

TONO:
- Cercano pero profesional
- Claro y conciso
- Positivo y orientado a soluciones
- Adaptado al perfil del huésped

Representas la excelencia en hospitalidad de GuestsValencia.`,
        temperature: 0.8,
        maxTokens: 2500
      },

      // ─────────────────────────────────────────────────────
      // 6. SANDRA ANALYST - Inteligencia de Negocio
      // ─────────────────────────────────────────────────────
      analyst: {
        name: 'Sandra Analyst',
        model: 'claude-sonnet-4-5-20250929',
        sdk: 'anthropic',
        specialty: 'Análisis de datos, business intelligence, forecasting',
        systemPrompt: `Eres SANDRA ANALYST, experta en inteligencia de negocio.

ESPECIALIZACIÓN:
- Análisis de datos de reservas
- Forecasting ocupación y revenue
- Segmentación de clientes
- Pricing dinámico óptimo
- KPIs y métricas clave
HERRAMIENTAS:
- PostgreSQL queries avanzadas
- Python para análisis estadístico
- Visualizaciones Tableau/PowerBI
- Machine learning básico
- Excel avanzado

MÉTRICAS QUE MONITORIZAS:
- ADR (Average Daily Rate)
- RevPAR (Revenue Per Available Room)
- Ocupación por temporada
- LOS (Length of Stay)
- CAC vs LTV
- Tasa conversión web
- Review score promedio

CAPACIDADES:
- Detectar patrones y tendencias
- Predecir demanda futura
- Optimizar precios en tiempo real
- Identificar oportunidades de mejora
- Reportes ejecutivos automatizados

PERSONALIDAD:
- Orientada a datos objetivos
- Precisa y metódica
- Visualizaciones claras
- Insights accionables
- Comunicación ejecutiva

Proporcionas inteligencia de negocio para GuestsValencia.es.`,
        temperature: 0.2,
        maxTokens: 6000
      }
    };
  }

  /**
   * ═══════════════════════════════════════════════════════
   * EJECUTORES DE SUBAGENTES CON SDKs OFICIALES
   * ═══════════════════════════════════════════════════════
   */

  /**
   * Ejecuta tarea con Claude (Anthropic SDK)
   */
  async executeClaudeExpert(expertKey, userMessage, context = {}) {
    const expert = this.experts[expertKey];
    if (!expert || expert.sdk !== 'anthropic') {
      throw new Error(`Expert ${expertKey} no disponible o no usa Anthropic`);
    }

    const messages = [
      {
        role: 'user',
        content: `${userMessage}

${context.additionalContext || ''}

CONTEXTO COMPARTIDO:
${JSON.stringify(this.getRelevantContext(expertKey), null, 2)}`
      }
    ];

    // Incluir historial relevante
    if (this.conversationHistory.length > 0) {
      const relevantHistory = this.conversationHistory
        .filter(h => h.expert === expertKey)
        .slice(-4); // Últimas 2 interacciones
      
      messages.unshift(...relevantHistory.map(h => ({
        role: h.role,
        content: h.content
      })));
    }

    const response = await this.anthropic.messages.create({
      model: expert.model,
      max_tokens: expert.maxTokens,
      temperature: expert.temperature,
      system: expert.systemPrompt,
      messages
    });

    const result = {
      expert: expert.name,
      specialty: expert.specialty,
      response: response.content[0].text,
      model: response.model,
      usage: response.usage,
      timestamp: new Date().toISOString()
    };

    // Guardar en historial
    this.conversationHistory.push({
      expert: expertKey,
      role: 'user',
      content: userMessage
    });
    this.conversationHistory.push({
      expert: expertKey,
      role: 'assistant',
      content: result.response
    });

    // Actualizar memoria compartida
    this.updateSharedMemory(expertKey, userMessage, result.response);

    // 🚀 EJECUTABILIDAD REAL - Solo para expert DEV
    if (expertKey === 'dev') {
      const executionResult = await this.executeDevActions(userMessage, result.response);
      if (executionResult.fileCreated) {
        result.executionResult = executionResult;
        result.realFileCreated = true;
        result.response = executionResult.response + "\n\n" + result.response;
      }
    }

    return result;
  }

  /**
   * Ejecuta tarea con GPT-4o (OpenAI SDK)
   */
  async executeGPTExpert(expertKey, userMessage, context = {}) {
    const expert = this.experts[expertKey];
    if (!expert || expert.sdk !== 'openai') {
      throw new Error(`Expert ${expertKey} no disponible o no usa OpenAI`);
    }

    const messages = [
      { role: 'system', content: expert.systemPrompt },
      {
        role: 'user',
        content: `${userMessage}

CONTEXTO:
${JSON.stringify(this.getRelevantContext(expertKey), null, 2)}`
      }
    ];

    const response = await this.openai.chat.completions.create({
      model: expert.model,
      messages,
      temperature: expert.temperature,
      max_tokens: expert.maxTokens
    });

    const result = {
      expert: expert.name,
      specialty: expert.specialty,
      response: response.choices[0].message.content,
      model: response.model,
      usage: response.usage,
      timestamp: new Date().toISOString()
    };

    // Guardar en historial
    this.conversationHistory.push({
      expert: expertKey,
      role: 'user',
      content: userMessage
    });
    this.conversationHistory.push({
      expert: expertKey,
      role: 'assistant',
      content: result.response
    });

    this.updateSharedMemory(expertKey, userMessage, result.response);

    return result;
  }

  /**
   * ═══════════════════════════════════════════════════════
   * ROUTER INTELIGENTE - Selección automática de experto
   * ═══════════════════════════════════════════════════════
   */
  async routeToExpert(userMessage, expertHint = 'auto') {
    // Si el usuario especifica un experto
    if (expertHint !== 'auto' && this.experts[expertHint]) {
      return this.executeExpert(expertHint, userMessage);
    }

    // Auto-detección inteligente del experto apropiado
    const expert = this.detectBestExpert(userMessage);
    return this.executeExpert(expert, userMessage);
  }

  /**
   * Detecta el mejor experto para la tarea
   */
  detectBestExpert(message) {
    const msg = message.toLowerCase();

    // CEO - Estrategia y decisiones de negocio
    if (msg.match(/\b(estrategia|plan.*negocio|decision|inversion|expansion|competencia|mercado|roi|rentabilidad)\b/)) {
      return 'ceo';
    }

    // DEV - Código y desarrollo
    if (msg.match(/\b(codigo|code|programa|funcion|api|endpoint|bug|implementa|react|node|electron|base.*datos|deploy)\b/)) {
      return 'dev';
    }

    // MARKETING - Publicidad y crecimiento
    if (msg.match(/\b(marketing|publicidad|seo|ads|campana|redes.*sociales|instagram|facebook|email|conversion|copywriting)\b/)) {
      return 'marketing';
    }

    // OPS - Operaciones y automatización
    if (msg.match(/\b(reserva|check.*in|check.*out|limpieza|mantenimiento|proceso|automatiza|workflow|operacion)\b/)) {
      return 'ops';
    }

    // ANALYST - Datos y análisis
    if (msg.match(/\b(analisis|datos|estadistica|metrica|kpi|reporte|forecast|prediccion|ocupacion|revenue|precio)\b/)) {
      return 'analyst';
    }

    // SUPPORT - Atención al cliente (por defecto)
    return 'support';
  }

  /**
   * Ejecuta experto (wrapper unificado)
   */
  async executeExpert(expertKey, userMessage, context = {}) {
    const expert = this.experts[expertKey];
    
    if (!expert) {
      throw new Error(`Experto ${expertKey} no encontrado`);
    }

    // Usar SDK apropiado
    if (expert.sdk === 'anthropic') {
      return await this.executeClaudeExpert(expertKey, userMessage, context);
    } else if (expert.sdk === 'openai') {
      return await this.executeGPTExpert(expertKey, userMessage, context);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════
   * COLABORACIÓN MULTI-EXPERTO
   * ═══════════════════════════════════════════════════════
   */

  /**
   * Tarea colaborativa entre múltiples expertos
   */
  async collaborativeTask(task, experts = ['ceo', 'dev']) {
    const results = {};

    for (const expertKey of experts) {
      // Preparar contexto con resultados previos
      const context = {
        previousResults: results,
        taskDescription: task
      };

      results[expertKey] = await this.executeExpert(expertKey, task, context);
      
      // Pequeña pausa entre expertos
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return {
      task,
      experts: experts.map(e => this.experts[e].name),
      results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Pipeline de expertos (secuencial con contexto acumulado)
   */
  async expertPipeline(task, pipeline = ['ceo', 'dev', 'ops']) {
    let accumulatedContext = { originalTask: task };
    const pipelineResults = [];

    for (const expertKey of pipeline) {
      const expert = this.experts[expertKey];
      
      const stepMessage = `
TAREA ORIGINAL: ${task}

FASE ACTUAL: ${expert.name} (${expert.specialty})

CONTEXTO ACUMULADO:
${JSON.stringify(accumulatedContext, null, 2)}

Proporciona tu análisis y recomendaciones para esta fase.`;

      const result = await this.executeExpert(expertKey, stepMessage);
      
      pipelineResults.push(result);
      accumulatedContext[`phase_${expertKey}`] = result.response;
    }

    return {
      task,
      pipeline: pipeline.map(e => this.experts[e].name),
      results: pipelineResults,
      finalContext: accumulatedContext
    };
  }

  /**
   * ═══════════════════════════════════════════════════════
   * GESTIÓN DE MEMORIA COMPARTIDA
   * ═══════════════════════════════════════════════════════
   */

  updateSharedMemory(expertKey, question, answer) {
    const key = `${expertKey}_latest`;
    this.sharedMemory.set(key, {
      question,
      answer,
      timestamp: new Date().toISOString()
    });

    // Limpiar memoria antigua (mantener últimas 50 entradas)
    if (this.sharedMemory.size > 50) {
      const oldestKey = this.sharedMemory.keys().next().value;
      this.sharedMemory.delete(oldestKey);
    }
  }

  getRelevantContext(expertKey) {
    const context = {};
    
    // Obtener últimas interacciones de este experto
    const expertMemory = this.sharedMemory.get(`${expertKey}_latest`);
    if (expertMemory) {
      context.lastInteraction = expertMemory;
    }

    // Info relevante de otros expertos
    for (const [key, value] of this.sharedMemory.entries()) {
      if (key !== `${expertKey}_latest` && key.includes('latest')) {
        const otherExpert = key.split('_')[0];
        context[`from_${otherExpert}`] = {
          summary: value.answer.substring(0, 200) + '...',
          timestamp: value.timestamp
        };
      }
    }

    return context;
  }

  /**
   * ═══════════════════════════════════════════════════════
   * UTILIDADES Y ESTADO
   * ═══════════════════════════════════════════════════════
   */

  /**
   * Limpia historial antiguo
   */
  clearOldHistory() {
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-50);
    }
  }

  /**
   * Estado del sistema de expertos
   */
  getSystemStatus() {
    const expertsStatus = {};
    
    for (const [key, expert] of Object.entries(this.experts)) {
      expertsStatus[key] = {
        name: expert.name,
        specialty: expert.specialty,
        model: expert.model,
        sdk: expert.sdk,
        available: true
      };
    }

    return {
      experts: expertsStatus,
      totalExperts: Object.keys(this.experts).length,
      anthropicConnected: !!this.anthropic.apiKey,
      openaiConnected: !!this.openai.apiKey,
      conversationLength: this.conversationHistory.length,
      memorySize: this.sharedMemory.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Obtener lista de expertos disponibles
   */
  listExperts() {
    return Object.entries(this.experts).map(([key, expert]) => ({
      id: key,
      name: expert.name,
      specialty: expert.specialty,
      model: expert.model,
      sdk: expert.sdk
    }));
  }

  /**
   * Reset completo del sistema
   */
  reset() {
    this.sharedMemory.clear();
    this.conversationHistory = [];
    this.taskQueue = [];
    console.log('🔄 Sistema de expertos reseteado');
  }

  /**
   * ═══════════════════════════════════════════════════════
   * EJECUTABILIDAD REAL - DEV EXPERT
   * ═══════════════════════════════════════════════════════
   */
  async executeDevActions(userMessage, aiResponse) {
    const result = {
      fileCreated: false,
      filePath: null,
      response: "",
      error: null,
      ethicsCheck: null
    };

    try {
      // VERIFICACIÓN ÉTICA ANTES DE EJECUTAR
      const ethicsEvaluation = this.biasMonitor.evaluateCodeExecutionFairness(
        'user123', // En producción: obtener userId real
        userMessage + '\n' + aiResponse,
        'developer'
      );

      result.ethicsCheck = ethicsEvaluation;

      if (!ethicsEvaluation.execution_allowed) {
        result.error = "Ejecución bloqueada por evaluación ética";
        result.response = `⚠️ CÓDIGO BLOQUEADO POR SEGURIDAD: ${ethicsEvaluation.violations[0]?.details || 'Riesgo detectado'}`;
        return result;
      }

      // Detectar si necesita crear archivo
      const createFilePattern = /crear|escribir|generar.*archivo|componente|UserCard|\.jsx|\.js|\.tsx|\.ts/i;
      const isCreateFileRequest = createFilePattern.test(userMessage);

      if (isCreateFileRequest) {
        // Extraer nombre del archivo del mensaje
        let fileName = 'UserCard.jsx';
        const fileNameMatch = userMessage.match(/(\w+\.(?:jsx|js|tsx|ts))/i);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }

        // Extraer código del response de la IA
        const codeMatch = aiResponse.match(/```(?:jsx|js|tsx|ts)?\n([\s\S]*?)\n```/);
        if (codeMatch) {
          const code = codeMatch[1];

          // Crear directorio si no existe
          const frontendDir = path.join(__dirname, '../frontend/src/components');
          if (!fs.existsSync(frontendDir)) {
            fs.mkdirSync(frontendDir, { recursive: true });
          }

          // Crear archivo real
          const filePath = path.join(frontendDir, fileName);
          fs.writeFileSync(filePath, code, 'utf8');

          result.fileCreated = true;
          result.filePath = filePath;
          result.response = `✅ ARCHIVO CREADO EJECUTABLE: ${fileName}
📁 Ruta: ${filePath}
🚀 CÓDIGO EJECUTADO CORRECTAMENTE
📄 Archivo: ${fileName}
🔗 Listo para usar en React
🎯 Siguiente: Import en tu aplicación`;

          console.log(`🚀 ARCHIVO EJECUTADO: ${filePath}`);
        } else {
          result.response = "⚠️ No se pudo extraer código válido de la respuesta";
        }
      }
    } catch (error) {
      result.error = error.message;
      result.response = `❌ ERROR EJECUTANDO: ${error.message}`;
      console.error('Error en executeDevActions:', error);
    }

    return result;
  }
}

module.exports = ExpertSubagentsSystem;
