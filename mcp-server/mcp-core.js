const express = require('express');
const { Octokit } = require('@octokit/rest');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs').promises;
const path = require('path');

class MCPCore {
  constructor() {
    this.app = express();
    this.port = process.env.MCP_PORT || 3001;
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    this.db = null; // Se inicializa después
    this.ai = null; // Se inicializa después
    this.activeAgents = new Map();
    this.taskQueue = [];
    
    this.setupMiddleware();
    this.setupRoutes();
    
    console.log('✅ MCP Core inicializado');
  }

  setupMiddleware() {
    this.app.use(express.json());
    
    // Middleware de autenticación
    this.app.use((req, res, next) => {
      // Permitir health check sin auth
      if (req.path === '/health') {
        return next();
      }
      
      const secret = req.headers['mcp-secret'];
      if (secret !== process.env.MCP_SECRET_KEY) {
        return res.status(403).json({ error: 'Acceso no autorizado' });
      }
      next();
    });

    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, mcp-secret');
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        activeAgents: this.activeAgents.size,
        queuedTasks: this.taskQueue.length,
        uptime: process.uptime()
      });
    });

    // Deploy project
    this.app.post('/deploy', this.handleDeploy.bind(this));
    
    // Generate code
    this.app.post('/generate', this.handleCodeGeneration.bind(this));
    
    // Sync with GitHub
    this.app.post('/sync', this.handleRepoSync.bind(this));
    
    // Execute command
    this.app.post('/execute', this.handleCommandExecution.bind(this));
    
    // Agent management
    this.app.post('/agent/spawn', this.handleSpawnAgent.bind(this));
    this.app.post('/agent/task', this.handleAgentTask.bind(this));
    this.app.get('/agent/status/:id', this.handleAgentStatus.bind(this));
    
    // GitHub operations
    this.app.post('/github/commit', this.handleGitHubCommit.bind(this));
    this.app.post('/github/pr', this.handleGitHubPR.bind(this));
    this.app.get('/github/status', this.handleGitHubStatus.bind(this));
  }

  // ==================== DEPLOY ====================
  async handleDeploy(req, res) {
    const { projectConfig } = req.body;
    
    try {
      console.log('🚀 Iniciando despliegue:', projectConfig.name);
      
      const result = await this.deployProject(projectConfig);
      
      res.json({ 
        success: true, 
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error en despliegue:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async deployProject(config) {
    const steps = [];
    
    // 1. Clonar repositorio
    steps.push(await this.cloneRepo(config.repoUrl, config.branch || 'main'));
    
    // 2. Instalar dependencias
    steps.push(await this.installDependencies(config.path));
    
    // 3. Build
    if (config.buildCommand) {
      steps.push(await this.runBuild(config.path, config.buildCommand));
    }
    
    // 4. Deploy a proveedor
    steps.push(await this.deployToProvider(config));
    
    // 5. Registrar en DB
    if (this.db) {
      await this.db.logDeployment({
        project: config.name,
        environment: config.environment || 'production',
        steps,
        timestamp: new Date()
      });
    }
    
    return {
      steps,
      status: 'completed',
      url: steps[steps.length - 1].url
    };
  }

  async cloneRepo(repoUrl, branch) {
    try {
      const repoName = repoUrl.split('/').pop().replace('.git', '');
      const targetPath = path.join(process.cwd(), 'temp', repoName);
      
      await execAsync(`git clone -b ${branch} ${repoUrl} ${targetPath}`);
      
      return {
        step: 'clone',
        status: 'success',
        path: targetPath
      };
    } catch (error) {
      throw new Error(`Error clonando repositorio: ${error.message}`);
    }
  }

  async installDependencies(projectPath) {
    try {
      const { stdout } = await execAsync('npm install', { cwd: projectPath });
      
      return {
        step: 'install',
        status: 'success',
        output: stdout
      };
    } catch (error) {
      throw new Error(`Error instalando dependencias: ${error.message}`);
    }
  }

  async runBuild(projectPath, buildCommand) {
    try {
      const { stdout } = await execAsync(buildCommand, { cwd: projectPath });
      
      return {
        step: 'build',
        status: 'success',
        output: stdout
      };
    } catch (error) {
      throw new Error(`Error en build: ${error.message}`);
    }
  }

  async deployToProvider(config) {
    // Implementar según el proveedor (Vercel, Netlify, etc.)
    const provider = config.provider || 'vercel';
    
    if (provider === 'vercel') {
      return await this.deployToVercel(config);
    } else if (provider === 'netlify') {
      return await this.deployToNetlify(config);
    }
    
    throw new Error(`Proveedor ${provider} no soportado`);
  }

  async deployToVercel(config) {
    try {
      const { stdout } = await execAsync(
        `vercel deploy --prod --token ${process.env.VERCEL_TOKEN}`,
        { cwd: config.path }
      );
      
      const urlMatch = stdout.match(/https:\/\/[^\s]+/);
      
      return {
        step: 'deploy',
        status: 'success',
        provider: 'vercel',
        url: urlMatch ? urlMatch[0] : null,
        output: stdout
      };
    } catch (error) {
      throw new Error(`Error desplegando a Vercel: ${error.message}`);
    }
  }

  // ==================== CODE GENERATION ====================
  async handleCodeGeneration(req, res) {
    const { task, role, language } = req.body;
    
    try {
      console.log('💻 Generando código:', task);
      
      if (!this.ai) {
        throw new Error('AI Orchestrator no inicializado');
      }
      
      const result = await this.generateCode(task, role, language);
      
      res.json({ 
        success: true, 
        result 
      });
    } catch (error) {
      console.error('❌ Error generando código:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async generateCode(task, role = 'developer', language = 'javascript') {
    // Usar AI Orchestrator para generar código
    const prompt = this.buildCodePrompt(task, role, language);
    const code = await this.ai.generateResponse(prompt, 'groq');
    
    // Validar código generado
    const validation = await this.validateCode(code, language);
    
    return {
      code,
      validation,
      language,
      role,
      timestamp: new Date().toISOString()
    };
  }

  buildCodePrompt(task, role, language) {
    return `Actúa como un ${role} experto en ${language}.

Tarea: ${task}

Genera código EJECUTABLE y FUNCIONAL. No teoría, solo código que funcione.

Requisitos:
- Código limpio y bien documentado
- Manejo de errores
- Tests si es necesario
- Código listo para producción

Responde SOLO con el código, sin explicaciones adicionales.`;
  }

  async validateCode(code, language) {
    // Validación básica
    const validation = {
      syntax: true,
      errors: [],
      warnings: []
    };
    
    // Aquí se pueden agregar validadores específicos por lenguaje
    
    return validation;
  }

  // ==================== REPO SYNC ====================
  async handleRepoSync(req, res) {
    try {
      console.log('🔄 Sincronizando con GitHub...');
      
      const result = await this.syncWithGitHub();
      
      res.json({ 
        success: true, 
        result 
      });
    } catch (error) {
      console.error('❌ Error sincronizando:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async syncWithGitHub() {
    const [owner, repo] = process.env.GITHUB_REPO.split('/');
    
    // Obtener último commit
    const { data: commits } = await this.octokit.repos.listCommits({
      owner,
      repo,
      per_page: 1
    });
    
    // Obtener estado del repo
    const { data: repoData } = await this.octokit.repos.get({
      owner,
      repo
    });
    
    return {
      lastCommit: commits[0],
      branch: repoData.default_branch,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      openIssues: repoData.open_issues_count
    };
  }

  // ==================== COMMAND EXECUTION ====================
  async handleCommandExecution(req, res) {
    const { command, cwd } = req.body;
    
    try {
      console.log('⚡ Ejecutando comando:', command);
      
      const { stdout, stderr } = await execAsync(command, { 
        cwd: cwd || process.cwd(),
        timeout: 60000 // 1 minuto timeout
      });
      
      res.json({ 
        success: true, 
        stdout, 
        stderr 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr
      });
    }
  }

  // ==================== AGENT MANAGEMENT ====================
  async handleSpawnAgent(req, res) {
    const { role, config } = req.body;
    
    try {
      const agentId = `agent_${Date.now()}_${role}`;
      
      this.activeAgents.set(agentId, {
        id: agentId,
        role,
        config,
        status: 'active',
        tasks: [],
        createdAt: new Date()
      });
      
      console.log(`🤖 Agente spawneado: ${agentId} (${role})`);
      
      res.json({ 
        success: true, 
        agentId,
        role
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async handleAgentTask(req, res) {
    const { agentId, task } = req.body;
    
    try {
      const agent = this.activeAgents.get(agentId);
      
      if (!agent) {
        throw new Error('Agente no encontrado');
      }
      
      // Ejecutar tarea con el agente
      const result = await this.executeAgentTask(agent, task);
      
      agent.tasks.push({
        task,
        result,
        timestamp: new Date()
      });
      
      res.json({ 
        success: true, 
        result 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async executeAgentTask(agent, task) {
    // Ejecutar tarea según el rol del agente
    console.log(`🔧 Agente ${agent.id} ejecutando: ${task.description}`);
    
    if (!this.ai) {
      throw new Error('AI Orchestrator no disponible');
    }
    
    const prompt = `Como ${agent.role}, ejecuta esta tarea:
${task.description}

Proporciona una respuesta EJECUTABLE y PRÁCTICA.`;
    
    const response = await this.ai.generateResponse(prompt, 'groq');
    
    return {
      agentId: agent.id,
      role: agent.role,
      response,
      timestamp: new Date()
    };
  }

  async handleAgentStatus(req, res) {
    const { id } = req.params;
    
    const agent = this.activeAgents.get(id);
    
    if (!agent) {
      return res.status(404).json({ 
        success: false, 
        error: 'Agente no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      agent 
    });
  }

  // ==================== GITHUB OPERATIONS ====================
  async handleGitHubCommit(req, res) {
    const { message, files } = req.body;
    
    try {
      // Implementar commit a GitHub
      const result = await this.commitToGitHub(message, files);
      
      res.json({ 
        success: true, 
        result 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async handleGitHubPR(req, res) {
    const { title, body, head, base } = req.body;
    
    try {
      const [owner, repo] = process.env.GITHUB_REPO.split('/');
      
      const { data } = await this.octokit.pulls.create({
        owner,
        repo,
        title,
        body,
        head,
        base: base || 'main'
      });
      
      res.json({ 
        success: true, 
        pr: data 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async handleGitHubStatus(req, res) {
    try {
      const status = await this.syncWithGitHub();
      
      res.json({ 
        success: true, 
        status 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // ==================== INITIALIZATION ====================
  setDependencies(db, ai) {
    this.db = db;
    this.ai = ai;
    console.log('✅ Dependencias MCP configuradas');
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 MCP Server activo en http://localhost:${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
    });
  }
}

module.exports = MCPCore;

