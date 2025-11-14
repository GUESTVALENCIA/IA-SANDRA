/**
 * MCP SERVER - ACCESO COMPLETO PARA SONNET 4.5+
 * 
 * Este servidor MCP expone TODOS los recursos del sistema:
 * - Archivos locales y carpetas
 * - Repositorios Git
 * - Vercel (deployments, proyectos, dominios)
 * - GitHub (repos, commits, PRs)
 * - APIs (Groq, Deepgram, Cartesia, HeyGen, Twilio, PayPal)
 * - Base de datos Neon
 * - Ejecución de comandos
 * - Navegación completa del sistema
 */

const express = require('express');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.pro') });

const execAsync = promisify(exec);

class MCPSonnetFullAccess {
  constructor() {
    this.app = express();
    this.port = process.env.MCP_PORT || 3001;
    
    // Inicializar clientes de APIs
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    this.vercelToken = process.env.VERCEL_TOKEN;
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubRepo = process.env.GITHUB_REPO || 'GUESTVALENCIA/IA-SANDRA';
    
    // Cargar todos los tokens del .env.pro
    this.tokens = {
      groq: process.env.GROQ_API_KEY,
      deepgram: process.env.DEEPGRAM_API_KEY,
      cartesia: process.env.CARTESIA_API_KEY,
      heygen: process.env.HEYGEN_API_KEY,
      heygenAvatar: process.env.HEYGEN_AVATAR_ID,
      neon: process.env.DATABASE_URL,
      github: process.env.GITHUB_TOKEN,
      vercel: process.env.VERCEL_TOKEN,
      vercelProject: process.env.VERCEL_PROJECT_ID,
      twilioSid: process.env.TWILIO_ACCOUNT_SID,
      twilioToken: process.env.TWILIO_AUTH_TOKEN,
      twilioPhone: process.env.TWILIO_PHONE_NUMBER,
      paypalClientId: process.env.PAYPAL_CLIENT_ID,
      paypalSecret: process.env.PAYPAL_CLIENT_SECRET,
      brightData: process.env.BRIGHT_DATA_AUTH,
      openai: process.env.OPENAI_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY
    };
    
    this.setupMiddleware();
    this.setupMCPRoutes();
    
    console.log('🚀 MCP Sonnet Full Access Server inicializado');
    console.log(`📡 Puerto: ${this.port}`);
    console.log(`🔑 Tokens cargados: ${Object.keys(this.tokens).length}`);
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.text({ limit: '50mb' }));
    
    // CORS completo para Sonnet
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, mcp-secret, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });
  }

  setupMCPRoutes() {
    // ==================== MCP PROTOCOL ENDPOINTS ====================
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        protocol: 'mcp',
        version: '1.0.0',
        capabilities: {
          files: true,
          git: true,
          vercel: true,
          github: true,
          apis: true,
          commands: true,
          navigation: true
        },
        tokens: Object.keys(this.tokens).length
      });
    });

    // ==================== FILES & FOLDERS ====================
    
    // Listar recursos (archivos y carpetas)
    this.app.post('/mcp/resources/list', async (req, res) => {
      try {
        const { uri } = req.body;
        const targetPath = uri ? this.resolvePath(uri) : process.cwd();
        
        const items = await fs.readdir(targetPath, { withFileTypes: true });
        const resources = items.map(item => ({
          uri: `file://${path.join(targetPath, item.name)}`,
          name: item.name,
          type: item.isDirectory() ? 'folder' : 'file',
          mimeType: item.isFile() ? this.getMimeType(item.name) : null
        }));
        
        res.json({ resources });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Leer recurso (archivo)
    this.app.post('/mcp/resources/read', async (req, res) => {
      try {
        const { uri } = req.body;
        const filePath = this.resolvePath(uri);
        
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);
        
        res.json({
          contents: [{
            uri,
            mimeType: this.getMimeType(filePath),
            text: content,
            size: stats.size,
            modified: stats.mtime.toISOString()
          }]
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Escribir recurso (archivo)
    this.app.post('/mcp/resources/write', async (req, res) => {
      try {
        const { uri, contents } = req.body;
        const filePath = this.resolvePath(uri);
        
        // Crear directorio si no existe
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        
        const content = contents[0]?.text || contents;
        await fs.writeFile(filePath, content, 'utf-8');
        
        res.json({ success: true, uri, size: content.length });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Crear carpeta
    this.app.post('/mcp/resources/create-folder', async (req, res) => {
      try {
        const { uri } = req.body;
        const folderPath = this.resolvePath(uri);
        
        await fs.mkdir(folderPath, { recursive: true });
        
        res.json({ success: true, uri });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Eliminar recurso
    this.app.post('/mcp/resources/delete', async (req, res) => {
      try {
        const { uri } = req.body;
        const targetPath = this.resolvePath(uri);
        
        const stats = await fs.stat(targetPath);
        if (stats.isDirectory()) {
          await fs.rmdir(targetPath, { recursive: true });
        } else {
          await fs.unlink(targetPath);
        }
        
        res.json({ success: true, uri });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // ==================== GIT OPERATIONS ====================
    
    // Listar repositorios
    this.app.get('/mcp/git/repos', async (req, res) => {
      try {
        const [owner, repo] = this.githubRepo.split('/');
        const { data } = await this.octokit.repos.get({ owner, repo });
        
        res.json({
          repos: [{
            name: data.name,
            fullName: data.full_name,
            url: data.html_url,
            defaultBranch: data.default_branch,
            private: data.private,
            stars: data.stargazers_count,
            forks: data.forks_count
          }]
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Obtener commits
    this.app.post('/mcp/git/commits', async (req, res) => {
      try {
        const { branch = 'main', limit = 10 } = req.body;
        const [owner, repo] = this.githubRepo.split('/');
        
        const { data } = await this.octokit.repos.listCommits({
          owner,
          repo,
          sha: branch,
          per_page: limit
        });
        
        res.json({
          commits: data.map(commit => ({
            sha: commit.sha,
            message: commit.commit.message,
            author: commit.commit.author.name,
            date: commit.commit.author.date,
            url: commit.html_url
          }))
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Crear commit
    this.app.post('/mcp/git/commit', async (req, res) => {
      try {
        const { message, files, branch = 'main' } = req.body;
        const [owner, repo] = this.githubRepo.split('/');
        
        // Obtener SHA del árbol actual
        const { data: refData } = await this.octokit.git.getRef({
          owner,
          repo,
          ref: `heads/${branch}`
        });
        
        const { data: commitData } = await this.octokit.git.getCommit({
          owner,
          repo,
          commit_sha: refData.object.sha
        });
        
        // Crear árbol con archivos
        const tree = await Promise.all(files.map(async (file) => {
          const content = Buffer.from(file.content).toString('base64');
          const { data } = await this.octokit.git.createBlob({
            owner,
            repo,
            content,
            encoding: 'base64'
          });
          
          return {
            path: file.path,
            mode: '100644',
            type: 'blob',
            sha: data.sha
          };
        }));
        
        const { data: treeData } = await this.octokit.git.createTree({
          owner,
          repo,
          base_tree: commitData.tree.sha,
          tree
        });
        
        // Crear commit
        const { data: newCommit } = await this.octokit.git.createCommit({
          owner,
          repo,
          message,
          tree: treeData.sha,
          parents: [refData.object.sha]
        });
        
        // Actualizar referencia
        await this.octokit.git.updateRef({
          owner,
          repo,
          ref: `heads/${branch}`,
          sha: newCommit.sha
        });
        
        res.json({ success: true, commit: newCommit.sha });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Push a GitHub
    this.app.post('/mcp/git/push', async (req, res) => {
      try {
        const { branch = 'main', message = 'Update from MCP Sonnet' } = req.body;
        
        // Ejecutar git commands localmente
        await execAsync('git add .', { cwd: process.cwd() });
        await execAsync(`git commit -m "${message}"`, { cwd: process.cwd() });
        await execAsync(`git push origin ${branch}`, { cwd: process.cwd() });
        
        res.json({ success: true, branch, message });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // ==================== VERCEL OPERATIONS ====================
    
    // Listar proyectos Vercel
    this.app.get('/mcp/vercel/projects', async (req, res) => {
      try {
        const { data } = await axios.get('https://api.vercel.com/v9/projects', {
          headers: {
            'Authorization': `Bearer ${this.vercelToken}`
          }
        });
        
        res.json({ projects: data.projects });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Deploy a Vercel
    this.app.post('/mcp/vercel/deploy', async (req, res) => {
      try {
        const { projectId, directory, production = true } = req.body;
        
        const { data } = await axios.post(
          `https://api.vercel.com/v13/deployments`,
          {
            name: projectId || this.tokens.vercelProject,
            files: await this.getDirectoryFiles(directory || process.cwd()),
            projectSettings: {
              framework: null
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.vercelToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        res.json({ success: true, deployment: data });
      } catch (error) {
        res.status(500).json({ error: error.message, details: error.response?.data });
      }
    });

    // Listar deployments
    this.app.get('/mcp/vercel/deployments', async (req, res) => {
      try {
        const { projectId } = req.query;
        
        const { data } = await axios.get(
          `https://api.vercel.com/v6/deployments${projectId ? `?projectId=${projectId}` : ''}`,
          {
            headers: {
              'Authorization': `Bearer ${this.vercelToken}`
            }
          }
        );
        
        res.json({ deployments: data.deployments });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // ==================== API OPERATIONS ====================
    
    // Groq API
    this.app.post('/mcp/api/groq', async (req, res) => {
      try {
        const { prompt, model = 'mixtral-8x7b-32768' } = req.body;
        
        const { data } = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${this.tokens.groq}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        res.json({ response: data.choices[0].message.content });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Deepgram STT
    this.app.post('/mcp/api/deepgram', async (req, res) => {
      try {
        const { audio, mimeType = 'audio/webm' } = req.body;
        
        const { data } = await axios.post(
          'https://api.deepgram.com/v1/listen',
          audio,
          {
            headers: {
              'Authorization': `Token ${this.tokens.deepgram}`,
              'Content-Type': mimeType
            },
            params: {
              model: 'nova-2',
              language: 'es',
              punctuate: true
            }
          }
        );
        
        res.json({ transcript: data.results.channels[0].alternatives[0].transcript });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Cartesia TTS
    this.app.post('/mcp/api/cartesia', async (req, res) => {
      try {
        const { text, voiceId = 'a0e99841-438c-4a64-b679-ae501e7d6091' } = req.body;
        
        const { data } = await axios.post(
          'https://api.cartesia.ai/v1/tts',
          {
            text,
            voice_id: voiceId,
            model: 'sonic-english',
            output_format: 'wav'
          },
          {
            headers: {
              'Authorization': `Bearer ${this.tokens.cartesia}`,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
          }
        );
        
        res.json({ 
          audio: Buffer.from(data).toString('base64'),
          format: 'wav'
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // HeyGen Avatar
    this.app.post('/mcp/api/heygen', async (req, res) => {
      try {
        const { text, avatarId } = req.body;
        
        const { data } = await axios.post(
          'https://api.heygen.com/v1/streaming.create',
          {
            avatar_id: avatarId || this.tokens.heygenAvatar,
            text
          },
          {
            headers: {
              'X-Api-Key': this.tokens.heygen,
              'Content-Type': 'application/json'
            }
          }
        );
        
        res.json({ session: data });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // ==================== COMMAND EXECUTION ====================
    
    // Ejecutar comando
    this.app.post('/mcp/command/execute', async (req, res) => {
      try {
        const { command, cwd = process.cwd(), timeout = 30000 } = req.body;
        
        const { stdout, stderr } = await execAsync(command, {
          cwd,
          timeout,
          maxBuffer: 10 * 1024 * 1024 // 10MB
        });
        
        res.json({ stdout, stderr, exitCode: 0 });
      } catch (error) {
        res.json({
          stdout: error.stdout || '',
          stderr: error.stderr || error.message,
          exitCode: error.code || 1
        });
      }
    });

    // ==================== TOKENS & CONFIG ====================
    
    // Obtener todos los tokens disponibles
    this.app.get('/mcp/tokens', (req, res) => {
      res.json({
        tokens: Object.keys(this.tokens).map(key => ({
          name: key,
          available: !!this.tokens[key],
          preview: this.tokens[key] ? `${this.tokens[key].substring(0, 10)}...` : null
        }))
      });
    });

    // Obtener configuración completa
    this.app.get('/mcp/config', (req, res) => {
      res.json({
        port: this.port,
        githubRepo: this.githubRepo,
        tokens: Object.keys(this.tokens).length,
        capabilities: {
          files: true,
          git: true,
          vercel: true,
          github: true,
          apis: true,
          commands: true,
          navigation: true
        }
      });
    });
  }

  // ==================== HELPER METHODS ====================
  
  resolvePath(uri) {
    if (uri.startsWith('file://')) {
      return uri.replace('file://', '');
    }
    if (path.isAbsolute(uri)) {
      return uri;
    }
    return path.join(process.cwd(), uri);
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.html': 'text/html',
      '.css': 'text/css',
      '.md': 'text/markdown',
      '.txt': 'text/plain',
      '.py': 'text/x-python',
      '.ts': 'application/typescript',
      '.tsx': 'application/typescript'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  async getDirectoryFiles(dirPath) {
    const files = {};
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        const subFiles = await this.getDirectoryFiles(fullPath);
        Object.assign(files, subFiles);
      } else {
        const content = await fs.readFile(fullPath);
        files[path.relative(dirPath, fullPath)] = content.toString('base64');
      }
    }
    
    return files;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 MCP Sonnet Full Access Server activo en http://localhost:${this.port}`);
      console.log(`📡 Protocolo MCP compatible con Sonnet 4.5+`);
      console.log(`🔑 Tokens disponibles: ${Object.keys(this.tokens).length}`);
      console.log(`\n📋 Endpoints principales:`);
      console.log(`   GET  /health - Health check`);
      console.log(`   POST /mcp/resources/list - Listar archivos/carpetas`);
      console.log(`   POST /mcp/resources/read - Leer archivo`);
      console.log(`   POST /mcp/resources/write - Escribir archivo`);
      console.log(`   POST /mcp/git/commits - Obtener commits`);
      console.log(`   POST /mcp/git/commit - Crear commit`);
      console.log(`   POST /mcp/git/push - Push a GitHub`);
      console.log(`   GET  /mcp/vercel/projects - Listar proyectos`);
      console.log(`   POST /mcp/vercel/deploy - Deploy a Vercel`);
      console.log(`   POST /mcp/api/groq - Usar Groq API`);
      console.log(`   POST /mcp/command/execute - Ejecutar comando`);
      console.log(`   GET  /mcp/tokens - Ver tokens disponibles`);
      console.log(`   GET  /mcp/config - Ver configuración completa`);
    });
  }
}

// Inicializar servidor
const mcpServer = new MCPSonnetFullAccess();
mcpServer.start();

module.exports = MCPSonnetFullAccess;

