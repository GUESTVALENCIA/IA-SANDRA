/**
 * Sistema de 62 Roles Especializados de Sandra IA 8.0 Pro
 * - 7 Roles Core SOE (Orquestación)
 * - 18 Roles Sandra IA 7.0 (Sistema original)
 * - 27 Roles Especializados (Nuevos)
 * - 10 Subagentes de Marketing (Monetización)
 * Cada rol tiene capacidades EJECUTABLES, no solo teoría
 * Prompts optimizados por @prompt-engineer
 */

const optimizedPrompts = require('./optimized-prompts');

class RolesSystem {
  constructor(aiOrchestrator, mcpCore) {
    this.ai = aiOrchestrator;
    this.mcp = mcpCore;
    this.activeRoles = new Map();
    
    this.roles = this.defineRoles();
    
    console.log(`✅ Sistema de ${Object.keys(this.roles).length} Roles inicializado`);
  }

  defineRoles() {
    return {
      // 0. GENERAL (ROL POR DEFECTO)
      general: {
        name: 'General',
        icon: '💬',
        description: 'Asistente general multiproposito',
        capabilities: [
          'conversation',
          'general_assistance',
          'information',
          'coordination',
          'routing'
        ],
        tools: [
          { name: 'chat', type: 'ai', model: 'groq' },
          { name: 'search', type: 'api', endpoint: 'search' }
        ],
        systemPrompt: optimizedPrompts.general
      },

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
        systemPrompt: optimizedPrompts.administrator
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
        systemPrompt: optimizedPrompts.developer
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
        systemPrompt: optimizedPrompts.youtuber
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
        systemPrompt: optimizedPrompts.tourism
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
        systemPrompt: optimizedPrompts.psychologist
      },

      // ==================== ROLES CORE SOE (FALTANTES) ====================
      
      // 19. ORCHESTRATOR
      orchestrator: {
        name: 'Orquestador',
        icon: '🎯',
        description: 'Orquestación principal y routing inteligente',
        capabilities: [
          'task_routing',
          'agent_coordination',
          'workflow_management',
          'intelligent_dispatch',
          'system_coordination'
        ],
        tools: [
          { name: 'route_task', type: 'ai', model: 'claude' },
          { name: 'coordinate_agents', type: 'mcp', operation: 'orchestrate' },
          { name: 'manage_workflow', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.orchestrator
      },

      // 20. PRODUCT/CEO OPS
      product_ceo: {
        name: 'Product/CEO Ops',
        icon: '🏢',
        description: 'Estrategia de negocio y monetización',
        capabilities: [
          'business_strategy',
          'monetization',
          'product_planning',
          'executive_decisions',
          'revenue_optimization'
        ],
        tools: [
          { name: 'strategic_analysis', type: 'ai', model: 'claude' },
          { name: 'monetization_plan', type: 'ai', model: 'groq' },
          { name: 'market_analysis', type: 'api', endpoint: 'market_data' }
        ],
        systemPrompt: optimizedPrompts.product_ceo
      },

      // 21. DEVOPS/SRE
      devops: {
        name: 'DevOps/SRE',
        icon: '⚙️',
        description: 'Infraestructura, CI/CD y MCP',
        capabilities: [
          'infrastructure',
          'ci_cd',
          'deployment',
          'monitoring',
          'mcp_management'
        ],
        tools: [
          { name: 'deploy_service', type: 'mcp', operation: 'deploy' },
          { name: 'monitor_system', type: 'api', endpoint: 'monitoring' },
          { name: 'manage_mcp', type: 'mcp', operation: 'manage' }
        ],
        systemPrompt: optimizedPrompts.devops
      },

      // 22. API/INTEGRATIONS DESIGNER
      api_designer: {
        name: 'API/Integrations Designer',
        icon: '🔌',
        description: 'Diseño de APIs y webhooks',
        capabilities: [
          'api_design',
          'webhook_creation',
          'integration_development',
          'endpoint_optimization',
          'api_documentation'
        ],
        tools: [
          { name: 'design_api', type: 'ai', model: 'groq' },
          { name: 'create_webhook', type: 'api', endpoint: 'webhooks' },
          { name: 'test_endpoint', type: 'api', endpoint: 'testing' }
        ],
        systemPrompt: optimizedPrompts.api_designer
      },

      // 23. SECURITY SPECIALIST
      security: {
        name: 'Security Specialist',
        icon: '🔒',
        description: 'Seguridad, compliance y hardening',
        capabilities: [
          'security_audit',
          'compliance',
          'vulnerability_assessment',
          'hardening',
          'security_policies'
        ],
        tools: [
          { name: 'security_scan', type: 'api', endpoint: 'security' },
          { name: 'compliance_check', type: 'ai', model: 'claude' },
          { name: 'vulnerability_test', type: 'api', endpoint: 'vuln_scan' }
        ],
        systemPrompt: optimizedPrompts.security
      },

      // 24. PROMPT ENGINEER
      prompt_engineer: {
        name: 'Prompt Engineer',
        icon: '✍️',
        description: 'Optimización de prompts y estilo',
        capabilities: [
          'prompt_optimization',
          'style_consistency',
          'prompt_testing',
          'template_creation',
          'quality_assurance'
        ],
        tools: [
          { name: 'optimize_prompt', type: 'ai', model: 'claude' },
          { name: 'test_prompt', type: 'ai', model: 'groq' },
          { name: 'create_template', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.prompt_engineer
      },

      // ==================== ROLES SANDRA IA 7.0 (18) ====================
      
      // 25. CONCIERGE (Recepcionista 7 Estrellas)
      concierge: {
        name: 'Concierge',
        icon: '🏨',
        description: 'Recepcionista 7 estrellas, atención premium',
        capabilities: [
          'premium_service',
          'guest_relations',
          'reservation_management',
          'concierge_services',
          'hospitality_excellence'
        ],
        tools: [
          { name: 'manage_reservation', type: 'api', endpoint: 'bookings' },
          { name: 'guest_communication', type: 'twilio', action: 'message' },
          { name: 'service_coordination', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.concierge
      },

      // 26. OWNER ACQUISITION
      owner_acquisition: {
        name: 'Owner Acquisition',
        icon: '🔑',
        description: 'Adquisición de propietarios',
        capabilities: [
          'owner_outreach',
          'partnership_development',
          'acquisition_strategy',
          'relationship_building',
          'contract_negotiation'
        ],
        tools: [
          { name: 'outreach_campaign', type: 'ai', model: 'groq' },
          { name: 'track_prospects', type: 'api', endpoint: 'crm' },
          { name: 'generate_proposal', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.owner_acquisition
      },

      // 27. LISTINGS MANAGER
      listings_manager: {
        name: 'Listings Manager',
        icon: '📋',
        description: 'Gestión de listados',
        capabilities: [
          'listing_creation',
          'content_optimization',
          'multi_platform_sync',
          'listing_analytics',
          'pricing_optimization'
        ],
        tools: [
          { name: 'create_listing', type: 'api', endpoint: 'listings' },
          { name: 'optimize_content', type: 'ai', model: 'groq' },
          { name: 'sync_platforms', type: 'api', endpoint: 'channel_sync' }
        ],
        systemPrompt: optimizedPrompts.listings_manager
      },

      // 28. PRICING REVENUE
      pricing_revenue: {
        name: 'Pricing Revenue',
        icon: '💰',
        description: 'Optimización de precios y revenue',
        capabilities: [
          'dynamic_pricing',
          'revenue_optimization',
          'market_analysis',
          'competitor_pricing',
          'demand_forecasting'
        ],
        tools: [
          { name: 'calculate_optimal_price', type: 'ai', model: 'claude' },
          { name: 'analyze_market', type: 'api', endpoint: 'market_data' },
          { name: 'forecast_demand', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.pricing_revenue
      },

      // 29. CHANNEL SYNC
      channel_sync: {
        name: 'Channel Sync',
        icon: '🔄',
        description: 'Sincronización multi-canal',
        capabilities: [
          'multi_channel_sync',
          'inventory_management',
          'booking_synchronization',
          'availability_updates',
          'rate_parity'
        ],
        tools: [
          { name: 'sync_channels', type: 'api', endpoint: 'channel_sync' },
          { name: 'update_availability', type: 'api', endpoint: 'inventory' },
          { name: 'check_rate_parity', type: 'api', endpoint: 'pricing' }
        ],
        systemPrompt: optimizedPrompts.channel_sync
      },

      // 30. HOUSEKEEPING MAINTENANCE
      housekeeping_maintenance: {
        name: 'Housekeeping Maintenance',
        icon: '🧹',
        description: 'Mantenimiento y limpieza',
        capabilities: [
          'maintenance_scheduling',
          'cleaning_coordination',
          'supply_management',
          'quality_inspection',
          'vendor_coordination'
        ],
        tools: [
          { name: 'schedule_maintenance', type: 'api', endpoint: 'maintenance' },
          { name: 'coordinate_cleaning', type: 'api', endpoint: 'housekeeping' },
          { name: 'manage_supplies', type: 'api', endpoint: 'inventory' }
        ],
        systemPrompt: optimizedPrompts.housekeeping_maintenance
      },

      // 31. CHECK-IN CHECK-OUT
      checkin_checkout: {
        name: 'Check-in Check-out',
        icon: '📥',
        description: 'Procesos de entrada/salida',
        capabilities: [
          'check_in_process',
          'check_out_process',
          'guest_verification',
          'key_management',
          'deposit_handling'
        ],
        tools: [
          { name: 'process_checkin', type: 'api', endpoint: 'bookings' },
          { name: 'process_checkout', type: 'api', endpoint: 'bookings' },
          { name: 'verify_guest', type: 'api', endpoint: 'verification' }
        ],
        systemPrompt: optimizedPrompts.checkin_checkout
      },

      // 32. PERFORMANCE MARKETING
      performance_marketing: {
        name: 'Performance Marketing',
        icon: '📊',
        description: 'Marketing de rendimiento',
        capabilities: [
          'campaign_optimization',
          'roi_analysis',
          'conversion_tracking',
          'a_b_testing',
          'attribution_modeling'
        ],
        tools: [
          { name: 'optimize_campaign', type: 'ai', model: 'groq' },
          { name: 'analyze_roi', type: 'api', endpoint: 'analytics' },
          { name: 'track_conversions', type: 'api', endpoint: 'tracking' }
        ],
        systemPrompt: optimizedPrompts.performance_marketing
      },

      // 33. CONTENT SEO
      content_seo: {
        name: 'Content SEO',
        icon: '🔍',
        description: 'Contenido optimizado SEO',
        capabilities: [
          'seo_optimization',
          'content_creation',
          'keyword_research',
          'eeat_optimization',
          'content_cannibalization'
        ],
        tools: [
          { name: 'optimize_seo', type: 'ai', model: 'groq' },
          { name: 'research_keywords', type: 'api', endpoint: 'seo_tools' },
          { name: 'analyze_eeat', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.content_seo
      },

      // 34. SOCIAL YOUTUBE
      social_youtube: {
        name: 'Social YouTube',
        icon: '📺',
        description: 'Gestión de YouTube y redes',
        capabilities: [
          'youtube_management',
          'content_scheduling',
          'community_engagement',
          'analytics_tracking',
          'monetization'
        ],
        tools: [
          { name: 'manage_youtube', type: 'api', endpoint: 'youtube' },
          { name: 'schedule_content', type: 'api', endpoint: 'scheduler' },
          { name: 'track_analytics', type: 'api', endpoint: 'youtube_analytics' }
        ],
        systemPrompt: optimizedPrompts.social_youtube
      },

      // 35. LEGAL POLICY
      legal_policy: {
        name: 'Legal Policy',
        icon: '⚖️',
        description: 'Asuntos legales y políticas',
        capabilities: [
          'legal_compliance',
          'policy_creation',
          'contract_review',
          'regulatory_analysis',
          'risk_assessment'
        ],
        tools: [
          { name: 'review_legal', type: 'ai', model: 'claude' },
          { name: 'create_policy', type: 'ai', model: 'groq' },
          { name: 'assess_compliance', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.legal_policy
      },

      // 36. FINANCE INVOICING
      finance_invoicing: {
        name: 'Finance Invoicing',
        icon: '💳',
        description: 'Finanzas y facturación',
        capabilities: [
          'invoice_generation',
          'payment_processing',
          'financial_reporting',
          'expense_tracking',
          'reconciliation'
        ],
        tools: [
          { name: 'generate_invoice', type: 'api', endpoint: 'invoicing' },
          { name: 'process_payment', type: 'paypal', action: 'charge' },
          { name: 'financial_report', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.finance_invoicing
      },

      // 37. DATA ANALYTICS (Agent #250)
      data_analytics: {
        name: 'Data Analytics',
        icon: '📈',
        description: 'Análisis de datos (Agent #250)',
        capabilities: [
          'data_analysis',
          'conversational_analytics',
          'real_time_analytics',
          'smart_visualizations',
          'predictive_analytics'
        ],
        tools: [
          { name: 'analyze_data', type: 'ai', model: 'claude' },
          { name: 'create_visualization', type: 'api', endpoint: 'charts' },
          { name: 'predictive_model', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.data_analytics
      },

      // 38. DEVOPS VERCEL
      devops_vercel: {
        name: 'DevOps Vercel',
        icon: '🚀',
        description: 'Deployment y DevOps',
        capabilities: [
          'vercel_deployment',
          'ci_cd_pipelines',
          'environment_management',
          'performance_monitoring',
          'auto_scaling'
        ],
        tools: [
          { name: 'deploy_vercel', type: 'mcp', operation: 'deploy' },
          { name: 'manage_env', type: 'api', endpoint: 'vercel' },
          { name: 'monitor_performance', type: 'api', endpoint: 'monitoring' }
        ],
        systemPrompt: optimizedPrompts.devops_vercel
      },

      // 39. VOICE TELEPHONY
      voice_telephony: {
        name: 'Voice Telephony',
        icon: '📞',
        description: 'Llamadas y telefonía',
        capabilities: [
          'voice_calls',
          'call_routing',
          'ivr_management',
          'call_analytics',
          'telephony_integration'
        ],
        tools: [
          { name: 'make_call', type: 'twilio', action: 'call' },
          { name: 'route_call', type: 'api', endpoint: 'telephony' },
          { name: 'analyze_calls', type: 'api', endpoint: 'call_analytics' }
        ],
        systemPrompt: optimizedPrompts.voice_telephony
      },

      // 40. FEEDBACK INTELLIGENCE
      feedback_intelligence: {
        name: 'Feedback Intelligence',
        icon: '💬',
        description: 'Análisis de feedback',
        capabilities: [
          'feedback_collection',
          'sentiment_analysis',
          'feedback_categorization',
          'action_planning',
          'improvement_tracking'
        ],
        tools: [
          { name: 'analyze_feedback', type: 'ai', model: 'claude' },
          { name: 'sentiment_analysis', type: 'ai', model: 'groq' },
          { name: 'categorize_feedback', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.feedback_intelligence
      },

      // 41. MEMORY LIBRARIAN
      memory_librarian: {
        name: 'Memory Librarian',
        icon: '📚',
        description: 'Gestión de memoria y contexto',
        capabilities: [
          'context_management',
          'memory_retrieval',
          'knowledge_organization',
          'context_optimization',
          'long_term_memory'
        ],
        tools: [
          { name: 'retrieve_memory', type: 'ai', model: 'claude' },
          { name: 'organize_knowledge', type: 'ai', model: 'groq' },
          { name: 'optimize_context', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.memory_librarian
      },

      // ==================== ROLES ESPECIALIZADOS (27) ====================
      
      // 42. COMMUNITY MANAGER
      community_manager: {
        name: 'Community Manager',
        icon: '👥',
        description: 'Gestión de comunidad y engagement',
        capabilities: [
          'community_management',
          'engagement_strategy',
          'content_moderation',
          'member_relations',
          'community_growth'
        ],
        tools: [
          { name: 'manage_community', type: 'api', endpoint: 'social_media' },
          { name: 'create_engagement', type: 'ai', model: 'groq' },
          { name: 'moderate_content', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.community_manager
      },

      // 43. INFLUENCER MARKETING
      influencer_marketing: {
        name: 'Influencer Marketing',
        icon: '⭐',
        description: 'Estrategia de influencers y viralización',
        capabilities: [
          'influencer_outreach',
          'campaign_management',
          'viral_strategy',
          'partnership_development',
          'roi_tracking'
        ],
        tools: [
          { name: 'find_influencers', type: 'api', endpoint: 'influencer_db' },
          { name: 'manage_campaign', type: 'ai', model: 'groq' },
          { name: 'track_viral', type: 'api', endpoint: 'analytics' }
        ],
        systemPrompt: optimizedPrompts.influencer_marketing
      },

      // 44. CRYPTOCURRENCY EXPERT
      cryptocurrency: {
        name: 'Cryptocurrency Expert',
        icon: '₿',
        description: 'Criptomonedas, blockchain y DeFi',
        capabilities: [
          'crypto_analysis',
          'blockchain_expertise',
          'defi_strategies',
          'trading_advice',
          'nft_knowledge'
        ],
        tools: [
          { name: 'analyze_crypto', type: 'api', endpoint: 'crypto_data' },
          { name: 'blockchain_info', type: 'api', endpoint: 'blockchain' },
          { name: 'defi_analysis', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.cryptocurrency
      },

      // 45. VIRAL CONTENT CREATOR
      viral_content_creator: {
        name: 'Viral Content Creator',
        icon: '🔥',
        description: 'Contenido viral para TikTok/Instagram',
        capabilities: [
          'viral_content',
          'trend_analysis',
          'short_form_video',
          'engagement_optimization',
          'platform_specific'
        ],
        tools: [
          { name: 'create_viral', type: 'ai', model: 'groq' },
          { name: 'analyze_trends', type: 'api', endpoint: 'trends' },
          { name: 'optimize_engagement', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.viral_content_creator
      },

      // 46. UI/UX DESIGNER
      ui_ux_designer: {
        name: 'UI/UX Designer',
        icon: '🎨',
        description: 'Diseño de interfaces y experiencia de usuario',
        capabilities: [
          'ui_design',
          'ux_research',
          'prototyping',
          'usability_testing',
          'design_systems'
        ],
        tools: [
          { name: 'create_design', type: 'ai', model: 'groq' },
          { name: 'prototype', type: 'api', endpoint: 'figma' },
          { name: 'test_usability', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.ui_ux_designer
      },

      // 47. FINANCIAL ADVISOR
      financial_advisor: {
        name: 'Financial Advisor',
        icon: '💵',
        description: 'Asesoría financiera e inversiones',
        capabilities: [
          'financial_planning',
          'investment_advice',
          'portfolio_management',
          'risk_assessment',
          'tax_planning'
        ],
        tools: [
          { name: 'financial_plan', type: 'ai', model: 'claude' },
          { name: 'analyze_investment', type: 'api', endpoint: 'finance' },
          { name: 'portfolio_optimize', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.financial_advisor
      },

      // 48. YOGA INSTRUCTOR
      yoga_instructor: {
        name: 'Yoga Instructor',
        icon: '🧘',
        description: 'Clases de yoga y mindfulness',
        capabilities: [
          'yoga_instruction',
          'pose_guidance',
          'breathing_techniques',
          'meditation_guidance',
          'wellness_coaching'
        ],
        tools: [
          { name: 'create_yoga_sequence', type: 'ai', model: 'groq' },
          { name: 'guide_meditation', type: 'ai', model: 'groq' },
          { name: 'wellness_plan', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.yoga_instructor
      },

      // 49. MINDFULNESS COACH
      mindfulness_coach: {
        name: 'Mindfulness Coach',
        icon: '🧘‍♀️',
        description: 'Meditación y bienestar mental',
        capabilities: [
          'meditation_guidance',
          'mindfulness_practices',
          'stress_management',
          'emotional_regulation',
          'wellness_programs'
        ],
        tools: [
          { name: 'guide_meditation', type: 'ai', model: 'groq' },
          { name: 'stress_techniques', type: 'ai', model: 'groq' },
          { name: 'wellness_program', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.mindfulness_coach
      },

      // 50. SEXOLOGIST
      sexologist: {
        name: 'Sexologist',
        icon: '💕',
        description: 'Sexología y educación sexual',
        capabilities: [
          'sexual_education',
          'relationship_counseling',
          'intimacy_guidance',
          'health_information',
          'professional_advice'
        ],
        tools: [
          { name: 'educational_content', type: 'ai', model: 'claude' },
          { name: 'relationship_advice', type: 'ai', model: 'claude' },
          { name: 'health_info', type: 'api', endpoint: 'health_data' }
        ],
        systemPrompt: optimizedPrompts.sexologist
      },

      // 51. WEB CONTENT CREATOR
      web_content_creator: {
        name: 'Web Content Creator',
        icon: '🌐',
        description: 'Creación de contenido web',
        capabilities: [
          'web_content',
          'blog_writing',
          'seo_content',
          'content_strategy',
          'multimedia_content'
        ],
        tools: [
          { name: 'create_web_content', type: 'ai', model: 'groq' },
          { name: 'write_blog', type: 'ai', model: 'groq' },
          { name: 'seo_optimize', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.web_content_creator
      },

      // 52. CHILDREN'S ENTERTAINER
      children_entertainer: {
        name: "Children's Entertainer",
        icon: '🎪',
        description: 'Animación infantil y cuentos',
        capabilities: [
          'children_content',
          'storytelling',
          'educational_entertainment',
          'age_appropriate',
          'creative_activities'
        ],
        tools: [
          { name: 'create_story', type: 'ai', model: 'groq' },
          { name: 'educational_game', type: 'ai', model: 'groq' },
          { name: 'creative_activity', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.children_entertainer
      },

      // 53. LANGUAGE TEACHER
      language_teacher: {
        name: 'Language Teacher',
        icon: '🗣️',
        description: 'Enseñanza de idiomas y acentos regionales',
        capabilities: [
          'language_instruction',
          'accent_training',
          'cultural_context',
          'conversation_practice',
          'grammar_teaching'
        ],
        tools: [
          { name: 'teach_language', type: 'ai', model: 'groq' },
          { name: 'accent_guide', type: 'ai', model: 'groq' },
          { name: 'cultural_info', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.language_teacher
      },

      // 54. EMPATHY SPECIALIST
      empathy_specialist: {
        name: 'Empathy Specialist',
        icon: '❤️',
        description: 'Apoyo emocional y empatía',
        capabilities: [
          'emotional_support',
          'empathy_communication',
          'active_listening',
          'emotional_validation',
          'compassionate_guidance'
        ],
        tools: [
          { name: 'emotional_support', type: 'ai', model: 'claude' },
          { name: 'empathy_response', type: 'ai', model: 'claude' },
          { name: 'validation', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.empathy_specialist
      },

      // 55. GEOGRAPHER
      geographer: {
        name: 'Geographer',
        icon: '🌍',
        description: 'Geografía, culturas y regiones',
        capabilities: [
          'geographical_knowledge',
          'cultural_insights',
          'regional_information',
          'travel_guidance',
          'cultural_etiquette'
        ],
        tools: [
          { name: 'geographical_info', type: 'ai', model: 'claude' },
          { name: 'cultural_context', type: 'ai', model: 'claude' },
          { name: 'travel_guide', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.geographer
      },

      // 56. STARTUP VISIONARY
      startup_visionary: {
        name: 'Startup Visionary',
        icon: '🚀',
        description: 'Creación de startups e innovación',
        capabilities: [
          'startup_creation',
          'innovation_strategy',
          'business_modeling',
          'fundraising',
          'market_disruption'
        ],
        tools: [
          { name: 'create_startup_plan', type: 'ai', model: 'claude' },
          { name: 'business_model', type: 'ai', model: 'claude' },
          { name: 'fundraising_strategy', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.startup_visionary
      },

      // 57. SELF-DEVELOPMENT COACH
      self_development_coach: {
        name: 'Self-Development Coach',
        icon: '🌟',
        description: 'Autodesarrollo y autoconocimiento',
        capabilities: [
          'personal_growth',
          'goal_setting',
          'habit_formation',
          'self_awareness',
          'motivation_coaching'
        ],
        tools: [
          { name: 'growth_plan', type: 'ai', model: 'claude' },
          { name: 'goal_strategy', type: 'ai', model: 'groq' },
          { name: 'habit_tracker', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.self_development_coach
      },

      // 58. PROJECT ANALYST
      project_analyst: {
        name: 'Project Analyst',
        icon: '📋',
        description: 'Análisis de proyectos y optimización',
        capabilities: [
          'project_analysis',
          'optimization_strategy',
          'risk_assessment',
          'resource_planning',
          'success_metrics'
        ],
        tools: [
          { name: 'analyze_project', type: 'ai', model: 'claude' },
          { name: 'optimize_strategy', type: 'ai', model: 'claude' },
          { name: 'risk_assessment', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.project_analyst
      },

      // 59. YOUTUBE CHANNEL CREATOR
      youtube_channel_creator: {
        name: 'YouTube Channel Creator',
        icon: '📹',
        description: 'Creación y monetización de canales YouTube',
        capabilities: [
          'channel_strategy',
          'content_planning',
          'monetization',
          'growth_hacking',
          'analytics_optimization'
        ],
        tools: [
          { name: 'channel_strategy', type: 'ai', model: 'groq' },
          { name: 'content_plan', type: 'ai', model: 'groq' },
          { name: 'monetization_plan', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.youtube_channel_creator
      },

      // 60. TIKTOK CREATOR
      tiktok_creator: {
        name: 'TikTok Creator',
        icon: '🎵',
        description: 'Contenido TikTok y viralización',
        capabilities: [
          'tiktok_content',
          'short_video_creation',
          'trend_adaptation',
          'viral_strategy',
          'engagement_optimization'
        ],
        tools: [
          { name: 'create_tiktok', type: 'ai', model: 'groq' },
          { name: 'trend_analysis', type: 'api', endpoint: 'tiktok_trends' },
          { name: 'viral_strategy', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.tiktok_creator
      },

      // 61. INSTAGRAM CREATOR
      instagram_creator: {
        name: 'Instagram Creator',
        icon: '📸',
        description: 'Contenido Instagram y engagement',
        capabilities: [
          'instagram_content',
          'visual_storytelling',
          'hashtag_strategy',
          'stories_creation',
          'engagement_optimization'
        ],
        tools: [
          { name: 'create_instagram', type: 'ai', model: 'groq' },
          { name: 'hashtag_strategy', type: 'ai', model: 'groq' },
          { name: 'engagement_plan', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.instagram_creator
      },

      // 62. DEV SUPPORT
      dev_support: {
        name: 'Dev Support',
        icon: '🛠️',
        description: 'Soporte técnico y troubleshooting',
        capabilities: [
          'technical_support',
          'troubleshooting',
          'bug_fixing',
          'documentation',
          'user_assistance'
        ],
        tools: [
          { name: 'troubleshoot', type: 'ai', model: 'groq' },
          { name: 'fix_bug', type: 'ai', model: 'groq' },
          { name: 'create_docs', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.dev_support
      },

      // 63. LOGISTICS COORDINATOR
      logistics_coordinator: {
        name: 'Logistics Coordinator',
        icon: '🚚',
        description: 'Logística y transporte',
        capabilities: [
          'logistics_planning',
          'transport_coordination',
          'supply_chain',
          'route_optimization',
          'inventory_management'
        ],
        tools: [
          { name: 'plan_logistics', type: 'ai', model: 'groq' },
          { name: 'optimize_route', type: 'api', endpoint: 'maps' },
          { name: 'manage_inventory', type: 'api', endpoint: 'inventory' }
        ],
        systemPrompt: optimizedPrompts.logistics_coordinator
      },

      // 64. ORGANIZER
      organizer: {
        name: 'Organizer',
        icon: '📅',
        description: 'Organización y coordinación',
        capabilities: [
          'event_planning',
          'schedule_coordination',
          'resource_organization',
          'workflow_optimization',
          'task_management'
        ],
        tools: [
          { name: 'plan_event', type: 'ai', model: 'groq' },
          { name: 'coordinate_schedule', type: 'api', endpoint: 'calendar' },
          { name: 'optimize_workflow', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.organizer
      },

      // 65. GENERAL KNOWLEDGE EXPERT
      general_knowledge_expert: {
        name: 'General Knowledge Expert',
        icon: '📖',
        description: 'Conocimientos generales, cultura y política',
        capabilities: [
          'general_knowledge',
          'cultural_awareness',
          'political_insights',
          'historical_context',
          'current_events'
        ],
        tools: [
          { name: 'knowledge_base', type: 'ai', model: 'claude' },
          { name: 'cultural_info', type: 'ai', model: 'claude' },
          { name: 'current_events', type: 'api', endpoint: 'news' }
        ],
        systemPrompt: optimizedPrompts.general_knowledge_expert
      },

      // 66. AI MONETIZATION EXPERT
      ai_monetization_expert: {
        name: 'AI Monetization Expert',
        icon: '🤖',
        description: 'Monetización de IA y mercado IA',
        capabilities: [
          'ai_monetization',
          'market_analysis',
          'business_models',
          'revenue_streams',
          'industry_trends'
        ],
        tools: [
          { name: 'monetization_strategy', type: 'ai', model: 'claude' },
          { name: 'market_analysis', type: 'api', endpoint: 'market_data' },
          { name: 'revenue_models', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.ai_monetization_expert
      },

      // ==================== SUBAGENTES DE MARKETING (10) ====================
      
      // 67. BUSINESS ANALYST (Marketing)
      business_analyst: {
        name: 'Analista de Negocios',
        icon: '📊',
        description: 'KPIs, dashboards y decisiones',
        capabilities: [
          'kpi_tracking',
          'dashboard_creation',
          'data_visualization',
          'executive_decisions',
          'performance_analysis'
        ],
        tools: [
          { name: 'track_kpis', type: 'api', endpoint: 'analytics' },
          { name: 'create_dashboard', type: 'api', endpoint: 'dashboards' },
          { name: 'analyze_performance', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.business_analyst
      },

      // 68. MARKETING STRATEGIST
      marketing_strategist: {
        name: 'Estratega de Marketing',
        icon: '🎯',
        description: 'Campañas virales y posicionamiento',
        capabilities: [
          'viral_campaigns',
          'creative_strategy',
          'brand_positioning',
          'market_positioning',
          'campaign_planning'
        ],
        tools: [
          { name: 'viral_strategy', type: 'ai', model: 'groq' },
          { name: 'campaign_plan', type: 'ai', model: 'groq' },
          { name: 'positioning_analysis', type: 'ai', model: 'claude' }
        ],
        systemPrompt: optimizedPrompts.marketing_strategist
      },

      // 69. CONTENT MARKETER
      content_marketer: {
        name: 'Content Marketer',
        icon: '✍️',
        description: 'Publicaciones y email marketing',
        capabilities: [
          'content_creation',
          'email_marketing',
          'emotional_writing',
          'viral_content',
          'engagement_optimization'
        ],
        tools: [
          { name: 'create_content', type: 'ai', model: 'groq' },
          { name: 'email_campaign', type: 'api', endpoint: 'mailchimp' },
          { name: 'viral_writing', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.content_marketer
      },

      // 70. YOUTUBE GROWTH HACKER
      youtube_growth_hacker: {
        name: 'YouTube Growth Hacker',
        icon: '📈',
        description: 'Crecimiento de canales YouTube',
        capabilities: [
          'channel_growth',
          'shorts_strategy',
          'thumbnail_optimization',
          'pacing_strategy',
          'retention_optimization'
        ],
        tools: [
          { name: 'growth_strategy', type: 'ai', model: 'groq' },
          { name: 'optimize_thumbnails', type: 'ai', model: 'groq' },
          { name: 'retention_analysis', type: 'api', endpoint: 'youtube_analytics' }
        ],
        systemPrompt: optimizedPrompts.youtube_growth_hacker
      },

      // 71. TIKTOK VIRALITY AGENT
      tiktok_virality_agent: {
        name: 'TikTok Virality Agent',
        icon: '🔥',
        description: 'Reels y TikToks virales',
        capabilities: [
          'viral_reels',
          'audio_video_sync',
          'duet_strategy',
          'trend_adaptation',
          'engagement_maximization'
        ],
        tools: [
          { name: 'create_viral', type: 'ai', model: 'groq' },
          { name: 'sync_audio_video', type: 'api', endpoint: 'video_editing' },
          { name: 'trend_adapt', type: 'api', endpoint: 'tiktok_trends' }
        ],
        systemPrompt: optimizedPrompts.tiktok_virality_agent
      },

      // 72. SEO CONTENT WIZARD
      seo_content_wizard: {
        name: 'SEO Content Wizard',
        icon: '🔮',
        description: 'Textos optimizados SEO y EEAT',
        capabilities: [
          'seo_optimization',
          'eeat_compliance',
          'content_cannibalization',
          'keyword_optimization',
          'search_ranking'
        ],
        tools: [
          { name: 'seo_optimize', type: 'ai', model: 'groq' },
          { name: 'eeat_analysis', type: 'ai', model: 'claude' },
          { name: 'keyword_research', type: 'api', endpoint: 'seo_tools' }
        ],
        systemPrompt: optimizedPrompts.seo_content_wizard
      },

      // 73. SALES AUTOMATOR
      sales_automator: {
        name: 'Automator de Ventas',
        icon: '🤖',
        description: 'Prospección y automatización CRM',
        capabilities: [
          'lead_prospecting',
          'automated_responses',
          'crm_integration',
          'sales_automation',
          'pipeline_management'
        ],
        tools: [
          { name: 'prospect_leads', type: 'api', endpoint: 'crm' },
          { name: 'automate_responses', type: 'api', endpoint: 'automation' },
          { name: 'manage_pipeline', type: 'api', endpoint: 'crm' }
        ],
        systemPrompt: optimizedPrompts.sales_automator
      },

      // 74. YOUTUBE TUTORIAL AGENT
      youtube_tutorial_agent: {
        name: 'YouTube Tutorial Agent',
        icon: '🎓',
        description: 'Tutoriales interactivos paso a paso',
        capabilities: [
          'tutorial_creation',
          'interactive_content',
          'step_by_step',
          'educational_videos',
          'script_optimization'
        ],
        tools: [
          { name: 'create_tutorial', type: 'ai', model: 'groq' },
          { name: 'interactive_script', type: 'ai', model: 'groq' },
          { name: 'optimize_script', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.youtube_tutorial_agent
      },

      // 75. CREATIVE WRITER SANDRITA
      creative_writer_sandrita: {
        name: 'Redactor Creativo Sandrita',
        icon: '📚',
        description: 'Historias y cuentos virales infantiles',
        capabilities: [
          'children_stories',
          'viral_content',
          'creative_writing',
          'age_appropriate',
          'educational_entertainment'
        ],
        tools: [
          { name: 'create_story', type: 'ai', model: 'groq' },
          { name: 'viral_narrative', type: 'ai', model: 'groq' },
          { name: 'educational_story', type: 'ai', model: 'groq' }
        ],
        systemPrompt: optimizedPrompts.creative_writer_sandrita
      },

      // 76. COMMUNITY SANDRITA AGENT
      community_sandra_agent: {
        name: 'Community Sandra Agent',
        icon: '💝',
        description: 'Soporte emocional y comunidad fiel',
        capabilities: [
          'emotional_support',
          'community_engagement',
          'loyalty_building',
          'live_interaction',
          'follower_retention'
        ],
        tools: [
          { name: 'emotional_support', type: 'ai', model: 'claude' },
          { name: 'community_engage', type: 'api', endpoint: 'social_media' },
          { name: 'live_interaction', type: 'api', endpoint: 'live_streaming' }
        ],
        systemPrompt: optimizedPrompts.community_sandra_agent
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
      model: config.model || null,
      // Usar el systemPrompt optimizado definido en este RolesSystem
      systemPrompt: role.systemPrompt
    });

    this.activeRoles.set(roleName, {
      agent,
      role,
      activatedAt: new Date()
    });

    console.log(`✅ Rol activado: ${role.icon} ${role.name}`);

    return agent;
  }

  async executeWithRole(roleName, task, options = {}) {
    // Usar el mensaje original (si viene) para detectar saludos, no el prompt optimizado
    const raw = options.rawMessage != null ? String(options.rawMessage) : String(task || '');
    const taskString = raw.toLowerCase().trim();
    const isGreeting = /^(hola+|holaa+|hi|hello|buenas|buenos días|buenas tardes|buenas noches|hey|saludos)$/i.test(taskString);
    const currentRole = this.roles[roleName] || this.roles.general;

    // Respuesta especial para saludos según rol
    if (isGreeting) {
      if (!roleName || roleName === 'general') {
        const greetingResponse = `¡Hola! 👋 Soy Sandra IA 8.0 Pro. ¿En qué puedo ayudarte hoy?

Puedo asistirte con:
1. 🚀 Verificar estado del sistema y servicios
2. 💻 Generar código o revisar implementaciones
3. 📊 Analizar datos o crear visualizaciones
4. 🎬 Crear contenido para YouTube/TikTok/Instagram
5. 💼 Analizar proyectos y estrategias de monetización
6. 🏨 Buscar y negociar alojamientos

¿Cuál prefieres? O dime directamente qué necesitas.`;

        return {
          response: greetingResponse,
          role: 'General',
          icon: '💬'
        };
      }

      const greetingResponse = `¡Hola! ${currentRole.icon} Soy ${currentRole.name} de Sandra IA 8.0 Pro.

Puedo ayudarte con:
- ${currentRole.description}.

Cuéntame brevemente qué quieres conseguir y empezaré directamente con un plan concreto para ayudarte.`;

      return {
        response: greetingResponse,
        role: currentRole.name,
        icon: currentRole.icon
      };
    }

    let activeRole = this.activeRoles.get(roleName);
    
    // Si el rol no está activo, activarlo
    if (!activeRole) {
      await this.activateRole(roleName);
      activeRole = this.activeRoles.get(roleName);
    }

    // Determinar modo (voz/texto) y modelo apropiado
    const mode = options.mode || 'text'; // 'text', 'voice', 'video'
    const useModel = mode === 'voice' || mode === 'video' ? 'gpt-4o' : 'gpt-4o-mini';
    
    // Ejecutar con el modelo apropiado
    const result = await this.ai.executeWithSubagent(activeRole.agent.id, task, {
      ...options,
      model: useModel,
      mode
    });

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

