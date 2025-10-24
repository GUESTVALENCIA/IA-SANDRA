// ═══════════════════════════════════════════════════════
// SANDRA ORCHESTRATOR - MCP Master Controller
// Coordina todos los subagentes especializados
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

class SandraOrchestrator {
  constructor() {
    this.agents = {
      dev: { status: 'ready', speciality: 'desarrollo, github, netlify, deployment' },
      voice: { status: 'ready', speciality: 'heygen, elevenlabs, cartesia, speech' },
      ai: { status: 'ready', speciality: 'anthropic, openai, groq, reasoning' },
      business: { status: 'ready', speciality: 'paypal, airtable, supabase, crm' },
      comms: { status: 'ready', speciality: 'whatsapp, meta, twilio, messaging' }
    };
    
    this.server = new Server(
      {
        name: 'sandra-orchestrator',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // Lista de herramientas disponibles
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'delegate_task',
          description: 'Delega una tarea al subagente especializado apropiado',
          inputSchema: {
            type: 'object',
            properties: {
              task: { type: 'string', description: 'Descripción de la tarea' },
              agent: { 
                type: 'string', 
                enum: ['dev', 'voice', 'ai', 'business', 'comms', 'auto'],
                description: 'Agente especializado (auto = selección automática)'
              },
              priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
              context: { type: 'object', description: 'Contexto adicional' }
            },
            required: ['task']
          }
        },
        {
          name: 'get_agent_status',
          description: 'Consulta el estado de los subagentes',
          inputSchema: {
            type: 'object',
            properties: {
              agent: { type: 'string', description: 'Nombre del agente o "all"' }
            }
          }
        },
        {
          name: 'coordinate_multi_agent',
          description: 'Coordina múltiples agentes para tareas complejas',
          inputSchema: {
            type: 'object',
            properties: {
              workflow: { type: 'array', description: 'Secuencia de tareas' },
              parallel: { type: 'boolean', description: 'Ejecutar en paralelo' }
            }
          }
        }
      ]
    }));

    // Ejecutar herramientas
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'delegate_task':
          return await this.delegateTask(args);
        
        case 'get_agent_status':
          return this.getAgentStatus(args.agent);
        
        case 'coordinate_multi_agent':
          return await this.coordinateWorkflow(args);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async delegateTask(args) {
    const { task, agent = 'auto', priority = 'medium', context = {} } = args;

    // Selección automática del agente
    const selectedAgent = agent === 'auto' 
      ? await this.selectBestAgent(task)
      : agent;

    console.error(`[ORCHESTRATOR] Delegando tarea a: ${selectedAgent}`);
    console.error(`[ORCHESTRATOR] Tarea: ${task}`);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'delegated',
          agent: selectedAgent,
          task: task,
          priority: priority,
          message: `Tarea asignada a ${selectedAgent.toUpperCase()} Agent`
        }, null, 2)
      }]
    };
  }

  async selectBestAgent(task) {
    const taskLower = task.toLowerCase();
    
    // Palabras clave por agente
    const keywords = {
      dev: ['codigo', 'github', 'deploy', 'netlify', 'repo', 'commit', 'pull', 'merge', 'branch'],
      voice: ['voz', 'avatar', 'heygen', 'hablar', 'audio', 'speech', 'tts', 'video'],
      ai: ['razonar', 'analizar', 'claude', 'gpt', 'openai', 'pensar', 'decidir'],
      business: ['pago', 'paypal', 'crm', 'cliente', 'reserva', 'airtable', 'base de datos'],
      comms: ['whatsapp', 'mensaje', 'enviar', 'twilio', 'sms', 'contactar']
    };

    for (const [agent, words] of Object.entries(keywords)) {
      if (words.some(word => taskLower.includes(word))) {
        return agent;
      }
    }

    return 'ai'; // Default: agente IA para razonamiento general
  }

  getAgentStatus(agentName) {
    if (agentName === 'all') {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(this.agents, null, 2)
        }]
      };
    }

    const agent = this.agents[agentName];
    if (!agent) {
      throw new Error(`Agente no encontrado: ${agentName}`);
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ [agentName]: agent }, null, 2)
      }]
    };
  }

  async coordinateWorkflow(args) {
    const { workflow, parallel = false } = args;
    
    console.error(`[ORCHESTRATOR] Coordinando workflow: ${parallel ? 'PARALELO' : 'SECUENCIAL'}`);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'workflow_initiated',
          mode: parallel ? 'parallel' : 'sequential',
          tasks: workflow.length
        }, null, 2)
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sandra Orchestrator MCP Server running');
  }
}

const orchestrator = new SandraOrchestrator();
orchestrator.run().catch(console.error);
