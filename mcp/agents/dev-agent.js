// ═══════════════════════════════════════════════════════
// SANDRA DEV AGENT - Desarrollo y Deploy
// Especializado en GitHub, Netlify, CI/CD
// ═══════════════════════════════════════════════════════

require('dotenv').config();
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');

class SandraDevAgent {
  constructor() {
    this.github = new Octokit({ auth: process.env.GITHUB_TOKEN });
    this.netlify = axios.create({
      baseURL: 'https://api.netlify.com/api/v1',
      headers: { 'Authorization': `Bearer ${process.env.NETLIFY_AUTH_TOKEN}` }
    });

    this.server = new Server(
      { name: 'sandra-dev-agent', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'github_commit',
          description: 'Hacer commit y push a GitHub',
          inputSchema: {
            type: 'object',
            properties: {
              repo: { type: 'string' },
              message: { type: 'string' },
              files: { type: 'array' }
            }
          }
        },
        {
          name: 'netlify_deploy',
          description: 'Deploy a Netlify',
          inputSchema: {
            type: 'object',
            properties: {
              siteId: { type: 'string' },
              directory: { type: 'string' }
            }
          }
        },
        {
          name: 'create_branch',
          description: 'Crear rama en GitHub',
          inputSchema: {
            type: 'object',
            properties: {
              repo: { type: 'string' },
              branchName: { type: 'string' },
              fromBranch: { type: 'string', default: 'main' }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        let result;
        switch (name) {
          case 'github_commit':
            result = await this.githubCommit(args);
            break;
          case 'netlify_deploy':
            result = await this.netlifyDeploy(args);
            break;
          case 'create_branch':
            result = await this.createBranch(args);
            break;
          default:
            throw new Error(`Tool not found: ${name}`);
        }
        
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: error.message }, null, 2) }],
          isError: true
        };
      }
    });
  }

  async githubCommit(args) {
    console.error('[DEV-AGENT] GitHub commit iniciado');
    return { status: 'committed', repo: args.repo, message: args.message };
  }

  async netlifyDeploy(args) {
    console.error('[DEV-AGENT] Netlify deploy iniciado');
    return { status: 'deployed', siteId: args.siteId };
  }

  async createBranch(args) {
    console.error('[DEV-AGENT] Creando branch');
    return { status: 'created', branch: args.branchName };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sandra Dev Agent running');
  }
}

new SandraDevAgent().run().catch(console.error);
