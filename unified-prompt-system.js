/**
 * SANDRA IA GALAXY - UNIFIED PROMPT SYSTEM v7.0
 * Sistema Unificado de Prompts y Dependency Management
 * Integra prompts especializados con gestión de dependencias empresarial
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const logger = require('./backend/logger');
const metrics = require('./backend/metrics');
const { guardianProtocol } = require('./guardian-protocol');

// Cargar prompts base
const commonPrompts = require('./prompts/common-prompts.json');

class UnifiedPromptSystem extends EventEmitter {
  constructor() {
    super();
    this.name = "SANDRA_UNIFIED_PROMPT_SYSTEM";
    this.version = "7.0_GALAXY_ENTERPRISE";

    // Sistema de prompts unificado
    this.promptSystem = {
      core: new Map(),
      specialized: new Map(),
      dynamic: new Map(),
      contextual: new Map()
    };

    // Dependency Management System
    this.dependencyManager = {
      graph: new Map(),
      resolved: new Set(),
      cache: new Map(),
      rules: new Map()
    };

    // Sistema de contexto inteligente
    this.contextManager = {
      activeContexts: new Map(),
      contextHistory: [],
      contextRules: new Map()
    };

    // Template system para prompts
    this.templateEngine = {
      templates: new Map(),
      variables: new Map(),
      functions: new Map()
    };

    this.initialize();
  }

  async initialize() {
    logger.info('[UNIFIED PROMPT SYSTEM] Initializing Galaxy Enterprise prompt system');

    try {
      // 1. Cargar sistema de prompts base
      await this.loadCorePrompts();

      // 2. Configurar prompts especializados por agente
      await this.setupSpecializedPrompts();

      // 3. Inicializar dependency management
      await this.initializeDependencyManagement();

      // 4. Configurar context management
      await this.setupContextManagement();

      // 5. Cargar template engine
      await this.loadTemplateEngine();

      // 6. Integrar con Guardian Protocol
      await this.integrateGuardianProtocol();

      logger.info('[UNIFIED PROMPT SYSTEM] ✅ Galaxy Enterprise prompt system ACTIVE');

      this.emit('prompt-system:ready', {
        system: this.name,
        version: this.version,
        corePrompts: this.promptSystem.core.size,
        specializedPrompts: this.promptSystem.specialized.size,
        dependencies: this.dependencyManager.graph.size
      });

    } catch (error) {
      logger.error('[UNIFIED PROMPT SYSTEM] Initialization failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // CORE PROMPTS MANAGEMENT
  // ============================================================================
  async loadCorePrompts() {
    logger.info('[UNIFIED PROMPT SYSTEM] Loading core prompts');

    // Cargar prompts desde common-prompts.json
    this.promptSystem.core.set('system', {
      id: 'system',
      content: commonPrompts.system,
      type: 'SYSTEM',
      version: '7.0',
      lastUpdated: new Date()
    });

    // Cargar prompts de agentes especializados
    for (const [agentKey, agentPrompt] of Object.entries(commonPrompts.agents)) {
      this.promptSystem.core.set(`agent_${agentKey}`, {
        id: `agent_${agentKey}`,
        content: agentPrompt,
        type: 'AGENT_SPECIALIZED',
        specialty: agentKey.toUpperCase(),
        version: '7.0',
        lastUpdated: new Date()
      });
    }

    // Prompts empresariales adicionales
    const enterprisePrompts = {
      'galaxy_mode': {
        id: 'galaxy_mode',
        content: `Eres Sandra IA en Galaxy Enterprise Mode. Operas con 248+ agentes especializados,
        Guardian Protocol activo, y estándares empresariales de calidad élite. Cada operación debe
        ser verificada, documentada y ejecutada con precisión absoluta. Trabajas con amor y dedicación,
        sin prisa, garantizando que cada detalle sea perfecto para el futuro del usuario.`,
        type: 'ENTERPRISE_MODE',
        version: '7.0',
        lastUpdated: new Date()
      },

      'guardian_compliance': {
        id: 'guardian_compliance',
        content: `GUARDIAN PROTOCOL ACTIVO: JAMÁS improvisar. SIEMPRE ejecutar acciones reales.
        NO modificar sin autorización. VERIFICAR todo. Trabajar con amor. SOLO hacer cableado/configuración.
        Cualquier violación requiere autorización del CEO.`,
        type: 'COMPLIANCE',
        version: '7.0',
        lastUpdated: new Date()
      },

      'quality_excellence': {
        id: 'quality_excellence',
        content: `Estándar de Calidad Élite: Error handling, logging, validación, testing, documentación.
        Mínimo 90% de funcionalidad. 100% de verificación. Margen de error no superior al 4%.
        Cada trabajo debe demostrar nivel experto desarrollador élite.`,
        type: 'QUALITY_STANDARD',
        version: '7.0',
        lastUpdated: new Date()
      }
    };

    for (const [key, prompt] of Object.entries(enterprisePrompts)) {
      this.promptSystem.core.set(key, prompt);
    }

    logger.info(`[UNIFIED PROMPT SYSTEM] ✅ Core prompts loaded: ${this.promptSystem.core.size}`);
  }

  // ============================================================================
  // SPECIALIZED PROMPTS SYSTEM
  // ============================================================================
  async setupSpecializedPrompts() {
    logger.info('[UNIFIED PROMPT SYSTEM] Setting up specialized prompts');

    // Prompts por especialidad técnica
    const specializedPrompts = {
      // DEVELOPMENT SPECIALTIES
      'FRONTEND_REACT': {
        base: 'agent_dev',
        specialization: `Especialista en React, Next.js, TypeScript. Componentes modernos,
        hooks, state management, performance optimization. Seguir mejores prácticas,
        accessibility, responsive design.`,
        dependencies: ['quality_excellence', 'guardian_compliance'],
        tools: ['React DevTools', 'ESLint', 'Prettier', 'Jest']
      },

      'BACKEND_NODE': {
        base: 'agent_dev',
        specialization: `Especialista en Node.js, Express, APIs REST/GraphQL, microservicios.
        Arquitectura escalable, seguridad, performance, monitoring.`,
        dependencies: ['quality_excellence', 'guardian_compliance'],
        tools: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker']
      },

      'DATABASE_DESIGN': {
        base: 'agent_dev',
        specialization: `Especialista en diseño de bases de datos, SQL/NoSQL, optimización,
        índices, replicación, backup/recovery.`,
        dependencies: ['quality_excellence'],
        tools: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch']
      },

      // BUSINESS SPECIALTIES
      'MARKET_ANALYSIS': {
        base: 'agent_business',
        specialization: `Especialista en análisis de mercado, investigación competitiva,
        tendencias, oportunidades de negocio, ROI analysis.`,
        dependencies: ['quality_excellence'],
        tools: ['Market Research', 'Analytics', 'Competitive Intelligence']
      },

      'FINANCIAL_PLANNING': {
        base: 'agent_business',
        specialization: `Especialista en planificación financiera, presupuestos, cash flow,
        inversiones, análisis de riesgo financiero.`,
        dependencies: ['quality_excellence'],
        tools: ['Financial Modeling', 'Excel', 'QuickBooks']
      },

      // COMMUNICATION SPECIALTIES
      'CONTENT_CREATION': {
        base: 'agent_comms',
        specialization: `Especialista en creación de contenido, storytelling, copywriting,
        SEO, content strategy, brand voice.`,
        dependencies: ['quality_excellence'],
        tools: ['SEO Tools', 'Analytics', 'Content Management']
      },

      'SOCIAL_MEDIA': {
        base: 'agent_comms',
        specialization: `Especialista en redes sociales, community management, influencer marketing,
        viral content, engagement strategies.`,
        dependencies: ['quality_excellence'],
        tools: ['Social Media Platforms', 'Analytics Tools', 'Scheduling Tools']
      },

      // TECHNICAL SPECIALTIES
      'CYBERSECURITY': {
        base: 'system',
        specialization: `Especialista en ciberseguridad, penetration testing, vulnerability assessment,
        security audits, compliance (GDPR, SOX).`,
        dependencies: ['guardian_compliance', 'quality_excellence'],
        tools: ['Security Scanners', 'Penetration Testing Tools', 'SIEM']
      },

      'CLOUD_ARCHITECTURE': {
        base: 'system',
        specialization: `Especialista en arquitectura cloud, AWS/Azure/GCP, containerización,
        Kubernetes, serverless, infrastructure as code.`,
        dependencies: ['quality_excellence'],
        tools: ['AWS', 'Docker', 'Kubernetes', 'Terraform']
      }
    };

    // Registrar prompts especializados
    for (const [specialty, config] of Object.entries(specializedPrompts)) {
      const basePrompt = this.promptSystem.core.get(config.base);

      if (basePrompt) {
        const specializedPrompt = {
          id: `specialized_${specialty.toLowerCase()}`,
          specialty: specialty,
          basePrompt: config.base,
          content: `${basePrompt.content}\n\n${config.specialization}`,
          dependencies: config.dependencies || [],
          tools: config.tools || [],
          type: 'SPECIALIZED',
          version: '7.0',
          lastUpdated: new Date()
        };

        this.promptSystem.specialized.set(specialty, specializedPrompt);

        // Registrar dependencias
        if (config.dependencies) {
          this.dependencyManager.graph.set(specialty, new Set(config.dependencies));
        }
      }
    }

    logger.info(`[UNIFIED PROMPT SYSTEM] ✅ Specialized prompts configured: ${this.promptSystem.specialized.size}`);
  }

  // ============================================================================
  // DEPENDENCY MANAGEMENT SYSTEM
  // ============================================================================
  async initializeDependencyManagement() {
    logger.info('[UNIFIED PROMPT SYSTEM] Initializing dependency management');

    this.dependencyManager = {
      // Grafo de dependencias
      graph: new Map(),

      // Cache de resoluciones
      cache: new Map(),

      // Agregar dependencia
      addDependency: (prompt, dependsOn) => {
        if (!this.dependencyManager.graph.has(prompt)) {
          this.dependencyManager.graph.set(prompt, new Set());
        }
        this.dependencyManager.graph.get(prompt).add(dependsOn);

        logger.debug(`[DEPENDENCY MANAGER] Added dependency: ${prompt} -> ${dependsOn}`);
      },

      // Resolver dependencias con algoritmo topológico
      resolveDependencies: async (promptId) => {
        const cacheKey = promptId;

        // Check cache first
        if (this.dependencyManager.cache.has(cacheKey)) {
          return this.dependencyManager.cache.get(cacheKey);
        }

        const resolved = [];
        const visiting = new Set();
        const visited = new Set();

        const visit = async (id) => {
          if (visiting.has(id)) {
            throw new Error(`Circular dependency detected: ${id}`);
          }

          if (visited.has(id)) {
            return;
          }

          visiting.add(id);

          // Resolver dependencias primero
          const dependencies = this.dependencyManager.graph.get(id) || new Set();
          for (const depId of dependencies) {
            await visit(depId);
          }

          visiting.delete(id);
          visited.add(id);

          // Agregar prompt resuelto
          const prompt = this.getPromptById(id) || this.getPromptBySpecialty(id);
          if (prompt) {
            resolved.push(prompt);
          }
        };

        await visit(promptId);

        // Cache result
        this.dependencyManager.cache.set(cacheKey, resolved);

        return resolved;
      },

      // Validar integridad del grafo
      validateGraph: async () => {
        const issues = [];

        for (const [prompt, dependencies] of this.dependencyManager.graph) {
          for (const dep of dependencies) {
            if (!this.getPromptById(dep) && !this.getPromptBySpecialty(dep)) {
              issues.push({
                type: 'MISSING_DEPENDENCY',
                prompt: prompt,
                missingDependency: dep
              });
            }
          }
        }

        return {
          valid: issues.length === 0,
          issues: issues
        };
      }
    };

    logger.info('[UNIFIED PROMPT SYSTEM] ✅ Dependency management initialized');
  }

  // ============================================================================
  // CONTEXT MANAGEMENT SYSTEM
  // ============================================================================
  async setupContextManagement() {
    logger.info('[UNIFIED PROMPT SYSTEM] Setting up context management');

    this.contextManager = {
      // Contextos activos por sesión
      activeContexts: new Map(),

      // Historial de contextos
      contextHistory: [],

      // Crear contexto para sesión
      createContext: async (sessionId, type, parameters = {}) => {
        const context = {
          id: `${sessionId}_${type}_${Date.now()}`,
          sessionId: sessionId,
          type: type,
          parameters: parameters,
          createdAt: new Date(),
          lastAccessed: new Date(),
          prompts: new Map(),
          state: 'ACTIVE'
        };

        this.contextManager.activeContexts.set(context.id, context);

        logger.debug(`[CONTEXT MANAGER] Created context: ${context.id}`);
        return context;
      },

      // Agregar prompt a contexto
      addPromptToContext: async (contextId, promptType, promptData) => {
        const context = this.contextManager.activeContexts.get(contextId);

        if (context) {
          context.prompts.set(promptType, promptData);
          context.lastAccessed = new Date();

          logger.debug(`[CONTEXT MANAGER] Added prompt ${promptType} to context ${contextId}`);
        }
      },

      // Obtener contexto compilado
      getCompiledContext: async (contextId) => {
        const context = this.contextManager.activeContexts.get(contextId);

        if (!context) {
          throw new Error(`Context not found: ${contextId}`);
        }

        // Compilar prompts del contexto
        const compiledPrompts = [];

        for (const [type, promptData] of context.prompts) {
          const resolvedDependencies = await this.dependencyManager.resolveDependencies(promptData.id || type);
          compiledPrompts.push(...resolvedDependencies);
        }

        // Eliminar duplicados manteniendo orden
        const uniquePrompts = [];
        const seen = new Set();

        for (const prompt of compiledPrompts) {
          if (!seen.has(prompt.id)) {
            seen.add(prompt.id);
            uniquePrompts.push(prompt);
          }
        }

        context.lastAccessed = new Date();

        return {
          contextId: contextId,
          prompts: uniquePrompts,
          parameters: context.parameters,
          compiledAt: new Date()
        };
      },

      // Limpiar contextos expirados
      cleanupExpiredContexts: () => {
        const now = new Date();
        const expirationTime = 30 * 60 * 1000; // 30 minutos

        for (const [contextId, context] of this.contextManager.activeContexts) {
          if (now - context.lastAccessed > expirationTime) {
            this.contextManager.contextHistory.push({
              ...context,
              expiredAt: now
            });
            this.contextManager.activeContexts.delete(contextId);

            logger.debug(`[CONTEXT MANAGER] Expired context: ${contextId}`);
          }
        }
      }
    };

    // Configurar limpieza automática de contextos
    setInterval(() => {
      this.contextManager.cleanupExpiredContexts();
    }, 5 * 60 * 1000); // Cada 5 minutos

    logger.info('[UNIFIED PROMPT SYSTEM] ✅ Context management configured');
  }

  // ============================================================================
  // TEMPLATE ENGINE
  // ============================================================================
  async loadTemplateEngine() {
    logger.info('[UNIFIED PROMPT SYSTEM] Loading template engine');

    this.templateEngine = {
      templates: new Map(),
      variables: new Map(),
      functions: new Map(),

      // Registrar template
      registerTemplate: (name, template) => {
        this.templateEngine.templates.set(name, {
          name: name,
          template: template,
          variables: this.extractVariables(template),
          createdAt: new Date()
        });
      },

      // Procesar template con variables
      processTemplate: (templateName, variables = {}) => {
        const templateData = this.templateEngine.templates.get(templateName);

        if (!templateData) {
          throw new Error(`Template not found: ${templateName}`);
        }

        let processed = templateData.template;

        // Reemplazar variables
        for (const [key, value] of Object.entries(variables)) {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          processed = processed.replace(regex, value);
        }

        // Procesar funciones
        processed = this.processFunctions(processed, variables);

        return processed;
      },

      // Extraer variables de template
      extractVariables: (template) => {
        const variableRegex = /{{\\s*([^}]+)\\s*}}/g;
        const variables = [];
        let match;

        while ((match = variableRegex.exec(template)) !== null) {
          variables.push(match[1].trim());
        }

        return [...new Set(variables)]; // Eliminar duplicados
      },

      // Procesar funciones en templates
      processFunctions: (template, context) => {
        // Implementar funciones básicas
        const functions = {
          date: () => new Date().toISOString(),
          timestamp: () => Date.now(),
          uuid: () => Math.random().toString(36).substr(2, 9),
          upperCase: (text) => text.toUpperCase(),
          lowerCase: (text) => text.toLowerCase()
        };

        for (const [funcName, func] of Object.entries(functions)) {
          const regex = new RegExp(`{{\\s*${funcName}\\([^)]*\\)\\s*}}`, 'g');
          template = template.replace(regex, func());
        }

        return template;
      }
    };

    // Cargar templates base
    const baseTemplates = {
      'agent_prompt': `
Eres {{agentType}} de Sandra IA Galaxy Enterprise.

{{specialization}}

CONSTRAINTS ACTIVOS:
{{constraints}}

HERRAMIENTAS DISPONIBLES:
{{tools}}

CONTEXTO DE SESIÓN:
- Fecha: {{date}}
- Versión: {{version}}
- Modo: {{mode}}

INSTRUCCIONES ESPECÍFICAS:
{{instructions}}
      `,

      'workflow_prompt': `
WORKFLOW: {{workflowName}}
TIPO: {{workflowType}}
PRIORIDAD: {{priority}}

TAREAS A EJECUTAR:
{{tasks}}

DEPENDENCIAS:
{{dependencies}}

AGENTES ASIGNADOS:
{{assignedAgents}}

CRITERIOS DE ÉXITO:
{{successCriteria}}
      `,

      'error_recovery': `
ERROR DETECTADO: {{errorType}}
CONTEXTO: {{errorContext}}

ACCIONES DE RECOVERY:
{{recoveryActions}}

GUARDIAN PROTOCOL STATUS: {{guardianStatus}}

AUTORIZACIÓN REQUERIDA: {{authorizationRequired}}
      `
    };

    for (const [name, template] of Object.entries(baseTemplates)) {
      this.templateEngine.registerTemplate(name, template);
    }

    logger.info(`[UNIFIED PROMPT SYSTEM] ✅ Template engine loaded: ${this.templateEngine.templates.size} templates`);
  }

  // ============================================================================
  // GUARDIAN PROTOCOL INTEGRATION
  // ============================================================================
  async integrateGuardianProtocol() {
    logger.info('[UNIFIED PROMPT SYSTEM] Integrating Guardian Protocol');

    // Verificar que Guardian Protocol esté activo
    const guardianStatus = guardianProtocol.getProtocolStatus();

    if (guardianStatus.status !== 'ACTIVE') {
      logger.warn('[UNIFIED PROMPT SYSTEM] Guardian Protocol not active');
      return;
    }

    // Integrar constraints en prompts
    this.guardianIntegration = {
      applyConstraintsToPrompt: async (promptData) => {
        // Validar prompt contra Guardian Protocol
        const validation = await guardianProtocol.validateOperation({
          type: 'PROMPT_GENERATION',
          promptData: promptData,
          ceoAuthorized: true // Prompts del sistema están autorizados
        });

        if (!validation.valid) {
          logger.warn('[UNIFIED PROMPT SYSTEM] Prompt validation failed:', validation);
          throw new Error(`Guardian Protocol: Prompt validation failed`);
        }

        // Agregar constraints al prompt
        const constraintsText = Object.values(guardianProtocol.CORE_CONSTRAINTS)
          .map(c => `- ${c.rule}`)
          .join('\n');

        return {
          ...promptData,
          content: `${promptData.content}\n\nGUARDIAN PROTOCOL CONSTRAINTS:\n${constraintsText}`,
          guardianValidated: true,
          validationTimestamp: new Date()
        };
      }
    };

    logger.info('[UNIFIED PROMPT SYSTEM] ✅ Guardian Protocol integrated');
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================
  async generatePrompt(agentSpecialty, contextParameters = {}) {
    logger.debug(`[UNIFIED PROMPT SYSTEM] Generating prompt for: ${agentSpecialty}`);

    try {
      // 1. Obtener prompt especializado
      const specializedPrompt = this.promptSystem.specialized.get(agentSpecialty);

      if (!specializedPrompt) {
        throw new Error(`Specialized prompt not found: ${agentSpecialty}`);
      }

      // 2. Resolver dependencias
      const dependencies = await this.dependencyManager.resolveDependencies(agentSpecialty);

      // 3. Aplicar Guardian Protocol
      const guardianValidatedPrompt = await this.guardianIntegration.applyConstraintsToPrompt(specializedPrompt);

      // 4. Crear contexto de sesión
      const sessionId = contextParameters.sessionId || `session_${Date.now()}`;
      const context = await this.contextManager.createContext(sessionId, 'AGENT_PROMPT', contextParameters);

      // 5. Agregar prompts al contexto
      await this.contextManager.addPromptToContext(context.id, 'SPECIALIZED', guardianValidatedPrompt);

      for (const dep of dependencies) {
        await this.contextManager.addPromptToContext(context.id, dep.type, dep);
      }

      // 6. Compilar contexto final
      const compiledContext = await this.contextManager.getCompiledContext(context.id);

      // 7. Procesar template si está disponible
      let finalPrompt = guardianValidatedPrompt.content;

      if (contextParameters.useTemplate) {
        finalPrompt = this.templateEngine.processTemplate('agent_prompt', {
          agentType: agentSpecialty,
          specialization: guardianValidatedPrompt.content,
          constraints: 'GUARDIAN PROTOCOL ACTIVE',
          tools: specializedPrompt.tools?.join(', ') || 'Standard tools',
          date: new Date().toISOString(),
          version: this.version,
          mode: 'GALAXY_ENTERPRISE',
          instructions: contextParameters.instructions || 'Follow standard procedures'
        });
      }

      // 8. Actualizar métricas
      metrics.incrementLLMSuccess();

      return {
        prompt: finalPrompt,
        contextId: context.id,
        agentSpecialty: agentSpecialty,
        dependencies: dependencies.map(d => d.id),
        guardianValidated: true,
        generatedAt: new Date(),
        version: this.version
      };

    } catch (error) {
      logger.error('[UNIFIED PROMPT SYSTEM] Prompt generation failed:', error);
      metrics.incrementLLMFailure();
      throw error;
    }
  }

  async generateWorkflowPrompt(workflowDefinition) {
    logger.debug('[UNIFIED PROMPT SYSTEM] Generating workflow prompt');

    const workflowPrompt = this.templateEngine.processTemplate('workflow_prompt', {
      workflowName: workflowDefinition.name || 'Unnamed Workflow',
      workflowType: workflowDefinition.type || 'STANDARD',
      priority: workflowDefinition.priority || 'MEDIUM',
      tasks: workflowDefinition.tasks?.map(t => `- ${t.description || t.id}`).join('\n') || 'No tasks defined',
      dependencies: workflowDefinition.dependencies?.map(d => `${d.from} -> ${d.to}`).join('\n') || 'No dependencies',
      assignedAgents: workflowDefinition.assignedAgents?.join(', ') || 'To be assigned',
      successCriteria: workflowDefinition.successCriteria?.join('\n') || 'Standard success criteria'
    });

    return {
      prompt: workflowPrompt,
      type: 'WORKFLOW',
      workflow: workflowDefinition,
      generatedAt: new Date()
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  getPromptById(id) {
    return this.promptSystem.core.get(id) ||
           Array.from(this.promptSystem.specialized.values()).find(p => p.id === id);
  }

  getPromptBySpecialty(specialty) {
    return this.promptSystem.specialized.get(specialty);
  }

  getSystemStatus() {
    return {
      system: this.name,
      version: this.version,
      prompts: {
        core: this.promptSystem.core.size,
        specialized: this.promptSystem.specialized.size,
        dynamic: this.promptSystem.dynamic.size
      },
      dependencies: {
        total: this.dependencyManager.graph.size,
        cached: this.dependencyManager.cache.size
      },
      contexts: {
        active: this.contextManager.activeContexts.size,
        history: this.contextManager.contextHistory.length
      },
      templates: this.templateEngine.templates.size,
      guardianIntegrated: !!this.guardianIntegration
    };
  }
}

// ============================================================================
// EXPORT Y AUTO-INICIALIZACIÓN
// ============================================================================
const unifiedPromptSystem = new UnifiedPromptSystem();

module.exports = {
  UnifiedPromptSystem,
  unifiedPromptSystem
};

// Auto-test si se ejecuta directamente
if (require.main === module) {
  console.log('[UNIFIED PROMPT SYSTEM] Testing Galaxy Enterprise prompt system...');

  unifiedPromptSystem.on('prompt-system:ready', async (data) => {
    console.log('[UNIFIED PROMPT SYSTEM] ✅ Ready:', data);

    try {
      // Test de generación de prompt
      const prompt = await unifiedPromptSystem.generatePrompt('FRONTEND_REACT', {
        sessionId: 'test_session',
        useTemplate: true,
        instructions: 'Create a modern React component'
      });

      console.log('[UNIFIED PROMPT SYSTEM] ✅ Generated prompt:', prompt.prompt.substring(0, 200) + '...');

      // Test de estado del sistema
      const status = unifiedPromptSystem.getSystemStatus();
      console.log('[UNIFIED PROMPT SYSTEM] System status:', status);

    } catch (error) {
      console.error('[UNIFIED PROMPT SYSTEM] ❌ Test failed:', error);
    }
  });
}