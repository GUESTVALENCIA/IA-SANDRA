/**
 * Sistema de 18 Roles Especializados de Sandra IA
 * Cada rol tiene capacidades EJECUTABLES, no solo teoría
 */

class RolesSystem {
  constructor(aiOrchestrator, mcpCore) {
    this.ai = aiOrchestrator;
    this.mcp = mcpCore;
    this.activeRoles = new Map();
    
    this.roles = this.defineRoles();
    
    console.log('✅ Sistema de 18 Roles inicializado');
  }

  defineRoles() {
    return {
      // 1. ADMINISTRADOR
      administrator: {
        name: 'Administrador',
        icon: '👔',
        description: 'Gestión completa del sistema',
        capabilities: [
          'system_management',
          'user_management',
          'configuration',
          'monitoring',
          'security'
        ],
        tools: [
          { name: 'system_status', type: 'command', command: 'systeminfo' },
          { name: 'process_list', type: 'command', command: 'tasklist' },
          { name: 'disk_usage', type: 'command', command: 'wmic logicaldisk get size,freespace,caption' }
        ],
        systemPrompt: 'Eres el administrador del sistema Sandra IA. Gestionas recursos, usuarios y configuraciones.'
      },

      // 2. DESARROLLADOR
      developer: {
        name: 'Desarrollador',
        icon: '💻',
        description: 'Generación y ejecución de código',
        capabilities: [
          'code_generation',
          'debugging',
          'testing',
          'deployment',
          'git_operations'
        ],
        tools: [
          { name: 'run_code', type: 'command', command: 'node' },
          { name: 'run_tests', type: 'command', command: 'npm test' },
          { name: 'git_commit', type: 'github', operation: 'commit' },
          { name: 'create_pr', type: 'github', operation: 'pull_request' }
        ],
        systemPrompt: 'Eres un desarrollador senior. Generas código EJECUTABLE y FUNCIONAL, no teoría.'
      },

      // 3. YOUTUBER
      youtuber: {
        name: 'YouTuber',
        icon: '🎬',
        description: 'Creación y monetización de contenido',
        capabilities: [
          'content_creation',
          'video_scripting',
          'seo_optimization',
          'monetization',
          'analytics'
        ],
        tools: [
          { name: 'generate_script', type: 'ai', model: 'groq' },
          { name: 'optimize_title', type: 'ai', model: 'groq' },
          { name: 'analyze_trends', type: 'api', endpoint: 'youtube_trends' }
        ],
        systemPrompt: 'Eres un creador de contenido profesional. Creas contenido VIRAL y MONETIZABLE.'
      },

      // 4. COMMUNITY MANAGER
      community: {
        name: 'Community Manager',
        icon: '👥',
        description: 'Gestión de redes sociales',
        capabilities: [
          'social_media',
          'content_scheduling',
          'engagement',
          'analytics',
          'crisis_management'
        ],
        tools: [
          { name: 'create_post', type: 'ai', model: 'groq' },
          { name: 'schedule_content', type: 'api', endpoint: 'buffer' },
          { name: 'analyze_engagement', type: 'api', endpoint: 'analytics' }
        ],
        systemPrompt: 'Eres un Community Manager experto. Creas contenido LISTO PARA PUBLICAR.'
      },

      // 5. ESPECIALISTA TURÍSTICO
      tourism: {
        name: 'Especialista Turístico',
        icon: '🏨',
        description: 'Negociación de alojamientos',
        capabilities: [
          'accommodation_search',
          'price_negotiation',
          'booking_management',
          'customer_service',
          'itinerary_planning'
        ],
        tools: [
          { name: 'search_airbnb', type: 'brightdata', platform: 'airbnb' },
          { name: 'search_booking', type: 'brightdata', platform: 'booking' },
          { name: 'negotiate_price', type: 'ai', model: 'groq' },
          { name: 'make_call', type: 'twilio', action: 'call' }
        ],
        systemPrompt: 'Eres un especialista en turismo. Negocias precios REALES y cierras reservas.'
      },

      // 6. NEGOCIADOR DE VENTAS
      sales: {
        name: 'Negociador de Ventas',
        icon: '💼',
        description: 'Cierre de ventas y negociación',
        capabilities: [
          'sales_negotiation',
          'objection_handling',
          'deal_closing',
          'crm_management',
          'follow_up'
        ],
        tools: [
          { name: 'create_proposal', type: 'ai', model: 'groq' },
          { name: 'send_email', type: 'api', endpoint: 'email' },
          { name: 'track_deal', type: 'api', endpoint: 'crm' },
          { name: 'process_payment', type: 'paypal', action: 'charge' }
        ],
        systemPrompt: 'Eres un negociador de ventas experto. Cierras DEALS REALES y maximizas márgenes.'
      },

      // 7. ANALISTA DE DATOS
      analyst: {
        name: 'Analista de Datos',
        icon: '📊',
        description: 'Análisis y reportes',
        capabilities: [
          'data_analysis',
          'reporting',
          'visualization',
          'predictions',
          'insights'
        ],
        tools: [
          { name: 'analyze_data', type: 'ai', model: 'groq' },
          { name: 'generate_report', type: 'ai', model: 'groq' },
          { name: 'create_chart', type: 'api', endpoint: 'charts' }
        ],
        systemPrompt: 'Eres un analista de datos profesional. Generas insights ACCIONABLES.'
      },

      // 8. ESPECIALISTA MARKETING
      marketing: {
        name: 'Especialista Marketing',
        icon: '📈',
        description: 'Estrategias de marketing digital',
        capabilities: [
          'campaign_creation',
          'ad_optimization',
          'copywriting',
          'roi_analysis',
          'funnel_optimization'
        ],
        tools: [
          { name: 'create_campaign', type: 'ai', model: 'groq' },
          { name: 'optimize_ads', type: 'api', endpoint: 'google_ads' },
          { name: 'track_conversions', type: 'api', endpoint: 'analytics' }
        ],
        systemPrompt: 'Eres un especialista en marketing. Creas campañas con ROI MEDIBLE.'
      },

      // 9. CEO/EJECUTIVO
      ceo: {
        name: 'CEO/Ejecutivo',
        icon: '🏢',
        description: 'Estrategia empresarial',
        capabilities: [
          'strategic_planning',
          'decision_making',
          'resource_allocation',
          'business_analysis',
          'leadership'
        ],
        tools: [
          { name: 'strategic_analysis', type: 'ai', model: 'claude' },
          { name: 'financial_review', type: 'ai', model: 'groq' },
          { name: 'market_research', type: 'api', endpoint: 'market_data' }
        ],
        systemPrompt: 'Eres un CEO experimentado. Tomas decisiones ESTRATÉGICAS basadas en datos.'
      },

      // 10. DISEÑADOR
      designer: {
        name: 'Diseñador',
        icon: '🎨',
        description: 'UX/UI y branding',
        capabilities: [
          'ui_design',
          'ux_design',
          'branding',
          'prototyping',
          'design_systems'
        ],
        tools: [
          { name: 'generate_design', type: 'ai', model: 'groq' },
          { name: 'create_mockup', type: 'api', endpoint: 'figma' },
          { name: 'color_palette', type: 'api', endpoint: 'coolors' }
        ],
        systemPrompt: 'Eres un diseñador UX/UI profesional. Creas diseños IMPLEMENTABLES.'
      },

      // 11. ABOGADO
      lawyer: {
        name: 'Abogado',
        icon: '⚖️',
        description: 'Asesoramiento legal',
        capabilities: [
          'legal_advice',
          'contract_review',
          'compliance',
          'risk_assessment',
          'documentation'
        ],
        tools: [
          { name: 'review_contract', type: 'ai', model: 'claude' },
          { name: 'legal_research', type: 'ai', model: 'groq' },
          { name: 'generate_document', type: 'ai', model: 'groq' }
        ],
        systemPrompt: 'Eres un abogado experto. Proporcionas asesoramiento legal PRÁCTICO.'
      },

      // 12. MÉDICO
      doctor: {
        name: 'Médico',
        icon: '🥼',
        description: 'Asesoramiento de salud',
        capabilities: [
          'health_advice',
          'symptom_analysis',
          'treatment_suggestions',
          'wellness_planning',
          'medical_research'
        ],
        tools: [
          { name: 'analyze_symptoms', type: 'ai', model: 'claude' },
          { name: 'research_treatment', type: 'api', endpoint: 'pubmed' },
          { name: 'wellness_plan', type: 'ai', model: 'groq' }
        ],
        systemPrompt: 'Eres un médico profesional. Proporcionas asesoramiento de salud RESPONSABLE.'
      },

      // 13. PROFESOR
      teacher: {
        name: 'Profesor',
        icon: '📚',
        description: 'Educación y tutoría',
        capabilities: [
          'teaching',
          'curriculum_design',
          'assessment',
          'tutoring',
          'educational_content'
        ],
        tools: [
          { name: 'create_lesson', type: 'ai', model: 'groq' },
          { name: 'generate_quiz', type: 'ai', model: 'groq' },
          { name: 'explain_concept', type: 'ai', model: 'claude' }
        ],
        systemPrompt: 'Eres un profesor experto. Enseñas de forma CLARA y EFECTIVA.'
      },

      // 14. ASESOR FINANCIERO
      financial: {
        name: 'Asesor Financiero',
        icon: '💰',
        description: 'Inversiones y análisis financiero',
        capabilities: [
          'investment_advice',
          'portfolio_management',
          'risk_analysis',
          'financial_planning',
          'market_analysis'
        ],
        tools: [
          { name: 'analyze_investment', type: 'ai', model: 'claude' },
          { name: 'market_data', type: 'api', endpoint: 'yahoo_finance' },
          { name: 'portfolio_optimization', type: 'ai', model: 'groq' }
        ],
        systemPrompt: 'Eres un asesor financiero profesional. Proporcionas consejos de inversión FUNDAMENTADOS.'
      },

      // 15. ARTISTA
      artist: {
        name: 'Artista',
        icon: '🎭',
        description: 'Creación artística',
        capabilities: [
          'creative_writing',
          'art_direction',
          'storytelling',
          'visual_concepts',
          'artistic_critique'
        ],
        tools: [
          { name: 'generate_story', type: 'ai', model: 'claude' },
          { name: 'create_concept', type: 'ai', model: 'groq' },
          { name: 'art_prompt', type: 'ai', model: 'groq' }
        ],
        systemPrompt: 'Eres un artista creativo. Generas contenido artístico ORIGINAL.'
      },

      // 16. CIENTÍFICO
      scientist: {
        name: 'Científico',
        icon: '🔬',
        description: 'Investigación científica',
        capabilities: [
          'research',
          'hypothesis_testing',
          'data_analysis',
          'scientific_writing',
          'methodology'
        ],
        tools: [
          { name: 'research_paper', type: 'api', endpoint: 'arxiv' },
          { name: 'analyze_data', type: 'ai', model: 'claude' },
          { name: 'generate_hypothesis', type: 'ai', model: 'groq' }
        ],
        systemPrompt: 'Eres un científico riguroso. Investigas con MÉTODO CIENTÍFICO.'
      },

      // 17. INGENIERO
      engineer: {
        name: 'Ingeniero',
        icon: '🔧',
        description: 'Diseño de sistemas',
        capabilities: [
          'system_design',
          'architecture',
          'optimization',
          'problem_solving',
          'technical_specs'
        ],
        tools: [
          { name: 'design_system', type: 'ai', model: 'claude' },
          { name: 'optimize_performance', type: 'ai', model: 'groq' },
          { name: 'technical_spec', type: 'ai', model: 'groq' }
        ],
        systemPrompt: 'Eres un ingeniero experto. Diseñas sistemas ESCALABLES y EFICIENTES.'
      },

      // 18. PSICÓLOGO
      psychologist: {
        name: 'Psicólogo',
        icon: '🧠',
        description: 'Asesoramiento psicológico',
        capabilities: [
          'counseling',
          'behavioral_analysis',
          'mental_health',
          'therapy_techniques',
          'wellness_strategies'
        ],
        tools: [
          { name: 'analyze_behavior', type: 'ai', model: 'claude' },
          { name: 'wellness_plan', type: 'ai', model: 'groq' },
          { name: 'coping_strategies', type: 'ai', model: 'groq' }
        ],
        systemPrompt: 'Eres un psicólogo profesional. Proporcionas apoyo EMPÁTICO y PROFESIONAL.'
      }
    };
  }

  async activateRole(roleName, config = {}) {
    const role = this.roles[roleName];
    
    if (!role) {
      throw new Error(`Rol ${roleName} no existe`);
    }

    // Spawn subagent con el rol
    const agent = await this.ai.spawnSubagent(roleName, {
      provider: config.provider || 'groq',
      model: config.model || null
    });

    this.activeRoles.set(roleName, {
      agent,
      role,
      activatedAt: new Date()
    });

    console.log(`✅ Rol activado: ${role.icon} ${role.name}`);

    return agent;
  }

  async executeWithRole(roleName, task) {
    let activeRole = this.activeRoles.get(roleName);
    
    // Si el rol no está activo, activarlo
    if (!activeRole) {
      await this.activateRole(roleName);
      activeRole = this.activeRoles.get(roleName);
    }

    const result = await this.ai.executeWithSubagent(activeRole.agent.id, task);

    return {
      ...result,
      role: activeRole.role.name,
      icon: activeRole.role.icon
    };
  }

  getRoleInfo(roleName) {
    return this.roles[roleName] || null;
  }

  getAllRoles() {
    return Object.entries(this.roles).map(([key, role]) => ({
      id: key,
      name: role.name,
      icon: role.icon,
      description: role.description,
      capabilities: role.capabilities,
      active: this.activeRoles.has(key)
    }));
  }

  getActiveRoles() {
    return Array.from(this.activeRoles.entries()).map(([key, data]) => ({
      id: key,
      name: data.role.name,
      icon: data.role.icon,
      agentId: data.agent.id,
      activatedAt: data.activatedAt
    }));
  }

  deactivateRole(roleName) {
    const activeRole = this.activeRoles.get(roleName);
    
    if (activeRole) {
      this.ai.terminateSubagent(activeRole.agent.id);
      this.activeRoles.delete(roleName);
      console.log(`🔴 Rol desactivado: ${activeRole.role.name}`);
      return true;
    }
    
    return false;
  }

  deactivateAllRoles() {
    for (const [roleName, data] of this.activeRoles.entries()) {
      this.ai.terminateSubagent(data.agent.id);
    }
    
    this.activeRoles.clear();
    console.log('🔴 Todos los roles desactivados');
  }
}

module.exports = RolesSystem;

