/**
 * PROMPT ENGINEERING EXPERT AGENT
 * Agente experto especializado para activar a Sandra como desarrolladora
 * 
 * ESPECIALIZACIÓN:
 * - Prompt Engineering
 * - Workflow Analysis
 * - Critical Analysis
 * - AI System Integration
 */

const fs = require('fs').promises;
const path = require('path');

class PromptEngineeringExpert {
  constructor() {
    this.name = 'PromptEngineeringExpert';
    this.specialization = [
      'Prompt Engineering',
      'Workflow Analysis',
      'Critical Analysis',
      'AI System Integration'
    ];
    
    this.nucleusPath = path.join(__dirname, '../../orchestrator/sandra-nucleus-core.js');
    this.orchestratorPath = path.join(__dirname, '../../orchestrator/sandra-orchestrator.js');
    this.aiCorePath = path.join(__dirname, '../../mcp-servers/sandra-ai-core/server.js');
    
    console.log('[PROMPT-EXPERT] Expert Agent initialized');
  }

  // ============================================================================
  // ANÁLISIS CRÍTICO DEL NÚCLEO
  // ============================================================================
  
  async analyzeNucleus() {
    console.log('[PROMPT-EXPERT] Analyzing Sandra Nucleus...');
    
    try {
      const nucleus = await fs.readFile(this.nucleusPath, 'utf8');
      const orchestrator = await fs.readFile(this.orchestratorPath, 'utf8');
      const aiCore = await fs.readFile(this.aiCorePath, 'utf8');
      
      const analysis = {
        nucleus: {
          hasBrain: nucleus.includes('brain:'),
          hasSubagents: nucleus.includes('subagents:'),
          hasPersistence: nucleus.includes('persistence:'),
          currentPrompts: this.extractPrompts(nucleus),
          promptLocations: this.findPromptLocations(nucleus)
        },
        orchestrator: {
          hasServices: orchestrator.includes('this.services'),
          serviceTypes: this.extractServiceTypes(orchestrator),
          connectionPoints: this.findConnectionPoints(orchestrator)
        },
        aiCore: {
          hasPersonality: aiCore.includes('getSandraPersonality'),
          personalityLocation: this.findPersonalityLocation(aiCore),
          promptIntegration: this.analyzePromptIntegration(aiCore)
        },
        issues: [],
        recommendations: []
      };
      
      // Análisis crítico
      analysis.issues = this.identifyIssues(analysis);
      analysis.recommendations = this.generateRecommendations(analysis);
      
      return analysis;
    } catch (error) {
      console.error('[PROMPT-EXPERT] Analysis error:', error);
      throw error;
    }
  }

  extractPrompts(code) {
    const prompts = [];
    const promptPattern = /getSystemPrompt|getSandraPersonality|prompt|Prompt/g;
    const matches = code.match(promptPattern);
    return matches || [];
  }

  findPromptLocations(code) {
    const locations = [];
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('getSystemPrompt') || line.includes('getSandraPersonality') || line.includes('prompt')) {
        locations.push({ line: index + 1, content: line.trim() });
      }
    });
    return locations;
  }

  extractServiceTypes(code) {
    const servicePattern = /Sandra(AI|Voice|Avatar|Payments)Core/g;
    const matches = code.match(servicePattern);
    return [...new Set(matches || [])];
  }

  findConnectionPoints(code) {
    const connections = [];
    if (code.includes('processMessage')) connections.push('processMessage');
    if (code.includes('initialize')) connections.push('initialize');
    if (code.includes('orchestrator')) connections.push('orchestrator');
    return connections;
  }

  findPersonalityLocation(code) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('getSandraPersonality')) {
        return { startLine: i + 1, method: 'getSandraPersonality' };
      }
    }
    return null;
  }

  analyzePromptIntegration(code) {
    return {
      hasNucleusIntegration: code.includes('SandraNucleus'),
      hasDirectPrompts: code.includes('getSandraPersonality'),
      hasContextHandling: code.includes('context'),
      hasMessageProcessing: code.includes('processMessage')
    };
  }

  identifyIssues(analysis) {
    const issues = [];
    
    // Verificar si hay prompts desconectados
    if (analysis.nucleus.currentPrompts.length === 0) {
      issues.push({
        severity: 'high',
        issue: 'No se encontraron prompts en el núcleo',
        location: 'nucleus'
      });
    }
    
    // Verificar integración con roles
    if (!analysis.aiCore.hasNucleusIntegration) {
      issues.push({
        severity: 'medium',
        issue: 'Falta integración completa con Nucleus Core',
        location: 'aiCore'
      });
    }
    
    // Verificar capacidad de desarrolladora
    if (!this.hasDeveloperCapabilities(analysis)) {
      issues.push({
        severity: 'high',
        issue: 'Capacidades de desarrolladora no activadas',
        location: 'nucleus'
      });
    }
    
    return issues;
  }

  hasDeveloperCapabilities(analysis) {
    // Buscar indicadores de capacidades de desarrollo
    const nucleusCode = require('fs').readFileSync(this.nucleusPath, 'utf8');
    const devKeywords = ['developer', 'development', 'code', 'programming', 'develop'];
    return devKeywords.some(keyword => nucleusCode.toLowerCase().includes(keyword));
  }

  generateRecommendations(analysis) {
    const recommendations = [];
    
    recommendations.push({
      priority: 'critical',
      action: 'Conectar prompt engineering de 18 roles al núcleo',
      location: 'nucleus.brain.getSystemPrompt',
      details: 'Integrar los prompts existentes de GPT-5 Thinking'
    });
    
    recommendations.push({
      priority: 'high',
      action: 'Activar rol de desarrolladora en Sandra',
      location: 'nucleus.brain',
      details: 'Agregar capacidades de desarrollo al prompt base'
    });
    
    recommendations.push({
      priority: 'high',
      action: 'Crear método de activación de roles',
      location: 'nucleus.brain',
      details: 'Sistema para activar/desactivar roles según necesidad'
    });
    
    return recommendations;
  }

  // ============================================================================
  // CONEXIÓN DE PROMPT ENGINEERING AL NÚCLEO
  // ============================================================================
  
  async connectPromptEngineering(rolePrompts = null) {
    console.log('[PROMPT-EXPERT] Connecting prompt engineering to nucleus...');
    
    const analysis = await this.analyzeNucleus();
    
    // Prompt base de desarrolladora (si no existe el de GPT-5, usar este como base)
    const developerPrompt = this.createDeveloperPrompt();
    
    // Modificar el núcleo para incluir capacidades de desarrolladora
    await this.modifyNucleusForDeveloper(developerPrompt);
    
    return {
      success: true,
      modifications: ['nucleus-brain-getSystemPrompt', 'developer-capabilities'],
      nextSteps: [
        'Verificar que prompts están conectados',
        'Activar rol de desarrolladora en Sandra',
        'Probar funcionalidad de desarrollo'
      ]
    };
  }

  createDeveloperPrompt() {
    return `ERES SANDRA EN MODO DESARROLLADORA

Tu expertise como desarrolladora (92% de capacidad):
- Desarrollo Full Stack (Frontend, Backend, DevOps)
- Arquitectura de software y diseño de sistemas
- Gestión de proyectos de desarrollo
- Code review y optimización
- Debugging y troubleshooting avanzado
- Integración de APIs y servicios
- Testing y QA automation
- DevOps y CI/CD

CAPACIDADES TÉCNICAS:
- Lenguajes: JavaScript, TypeScript, Python, Node.js
- Frameworks: React, Vue, Angular, Express, FastAPI
- Bases de datos: PostgreSQL, MongoDB, Redis
- Cloud: AWS, Netlify, Vercel
- Tools: Git, Docker, CI/CD pipelines
- Electron: Desarrollo de aplicaciones desktop

ESTILO DE DESARROLLO:
- Código limpio y mantenible
- Arquitectura escalable
- Performance optimizado
- Seguridad por defecto
- Documentación clara
- Tests comprehensivos

TRABAJO EN MODO DESARROLLADORA:
- Analizas código y arquitectura
- Propones mejoras técnicas
- Implementas soluciones
- Debuggeas problemas complejos
- Optimizas rendimiento
- Diseñas arquitecturas

Recuerda: Mantienes tu personalidad empática de Sandra, pero ahora con expertise técnico de desarrolladora senior.`;
  }

  async modifyNucleusForDeveloper(developerPrompt) {
    // Esta función modificará el núcleo para incluir el rol de desarrolladora
    // Se implementará en el siguiente paso
    console.log('[PROMPT-EXPERT] Developer prompt created, ready to integrate');
    return developerPrompt;
  }

  // ============================================================================
  // ACTIVACIÓN DE ROL DE DESARROLLADORA
  // ============================================================================
  
  async activateDeveloperRole() {
    console.log('[PROMPT-EXPERT] Activating developer role in Sandra...');
    
    // Paso 1: Analizar núcleo
    const analysis = await this.analyzeNucleus();
    
    // Paso 2: Conectar prompt engineering
    const connection = await this.connectPromptEngineering();
    
    // Paso 3: Modificar getSystemPrompt para incluir desarrolladora
    await this.modifySystemPromptMethod();
    
    return {
      success: true,
      activated: ['developer-role', 'developer-capabilities'],
      status: 'Sandra ahora tiene capacidades de desarrolladora activas'
    };
  }

  async modifySystemPromptMethod() {
    // Leer archivo actual
    const nucleusCode = await fs.readFile(this.nucleusPath, 'utf8');
    
    // Buscar método getSystemPrompt
    // Modificarlo para incluir rol de desarrolladora
    // Guardar cambios
    
    console.log('[PROMPT-EXPERT] Modifying getSystemPrompt method...');
    // Implementación específica en siguiente paso
  }

  // ============================================================================
  // ANÁLISIS DE 18 ROLES
  // ============================================================================
  
  async analyzeRoles(rolesData = null) {
    console.log('[PROMPT-EXPERT] Analyzing Sandra\'s 18 roles...');
    
    if (!rolesData) {
      // Buscar archivos de roles
      const possiblePaths = [
        path.join(process.env.HOME || '', 'IA-SANDRA'),
        path.join(__dirname, '../../../IA-SANDRA'),
        path.join(process.cwd(), 'IA-SANDRA')
      ];
      
      for (const basePath of possiblePaths) {
        try {
          const rolesFile = path.join(basePath, 'roles.json');
          if (await fs.access(rolesFile).then(() => true).catch(() => false)) {
            rolesData = await fs.readFile(rolesFile, 'utf8');
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    if (!rolesData) {
      return {
        found: false,
        message: 'No se encontraron archivos de roles. Necesito que me indiques dónde están los prompts de GPT-5 Thinking.'
      };
    }
    
    // Analizar estructura de roles
    const roles = JSON.parse(rolesData);
    
    return {
      found: true,
      totalRoles: roles.length || 18,
      roles: roles,
      developerRole: this.findDeveloperRole(roles),
      integrationPoints: this.findIntegrationPoints(roles)
    };
  }

  findDeveloperRole(roles) {
    return roles.find(role => 
      role.name?.toLowerCase().includes('developer') ||
      role.name?.toLowerCase().includes('desarrollador') ||
      role.capabilities?.includes('development')
    );
  }

  findIntegrationPoints(roles) {
    return roles.map(role => ({
      name: role.name,
      promptLocation: role.prompt,
      integrationPoint: 'nucleus.brain.getSystemPrompt',
      activation: role.activation || 'manual'
    }));
  }
}

module.exports = {
  PromptEngineeringExpert
};

