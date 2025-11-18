// Sandra MCP Bridge Server - EXECUTABLE EXPERTS INTEGRATION
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const AIGateway = require('./services/ai-gateway');

// Utilidad básica de seguridad para FS
const BASE_DIR = path.resolve(process.cwd());
function safeResolve(p) {
    const abs = path.resolve(BASE_DIR, p || '.');
    if (!abs.startsWith(BASE_DIR)) throw new Error('path_outside_base_dir');
    return abs;
}
function execSh(cmd, cwd = BASE_DIR) {
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd }, (err, stdout, stderr) => {
            if (err) return reject(new Error(stderr || err.message));
            resolve(stdout.trim());
        });
    });
}

// IMPORTAR SISTEMA DE EXPERTOS EJECUTABLES
const { sandraDevExpert, EXECUTABLE_CONSTRAINTS } = require('./sandra-experts-executable');

class SandraMCPBridge {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.activeConnections = new Map();
        this.subagents = new Map();
        this.initializeServer();
        this.initializeSubagents();
    }

    initializeServer() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));

        // ENDPOINT DE SALUD CON INFO DE EXPERTOS
        this.app.get('/health', (req, res) => {
            const executableExperts = Array.from(this.subagents.values())
                .filter(agent => agent.type === 'EXECUTABLE_EXPERT');

            res.json({
                service: 'Sandra MCP Bridge - EXECUTABLE EXPERTS',
                status: 'active',
                version: '7.0',
                mode: 'EXECUTION_MODE',
                subagents: this.subagents.size,
                executableExperts: executableExperts.length,
                connections: this.activeConnections.size,
                constraints: 'ACTIVE',
                devExpertStatus: sandraDevExpert ? 'READY' : 'NOT_LOADED'
            });
        });

        // ENDPOINT PARA EJECUTAR TAREAS DE DESARROLLO
        this.app.post('/api/dev/execute', async (req, res) => {
            try {
                const result = await this.executeWithDevExpert(req.body);
                res.json(result);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                    expert: 'sandra-dev',
                    mode: 'EXECUTABLE'
                });
            }
        });

        // ENDPOINT PARA LISTAR CAPACIDADES DEL EXPERTO
        this.app.get('/api/dev/capabilities', (req, res) => {
            const devExpert = this.subagents.get('sandra-dev');
            res.json({
                expert: 'sandra-dev',
                capabilities: devExpert?.capabilities || [],
                constraints: EXECUTABLE_CONSTRAINTS,
                mode: 'EXECUTABLE',
                status: devExpert?.status || 'unknown'
            });
        });

        // ============================================================================
        // GUARDIAN MCP TOOLS
        // ============================================================================
        
        // POST /api/guardian/snapshot/create - Crear snapshot
        this.app.post('/api/guardian/snapshot/create', async (req, res) => {
            try {
                const { context } = req.body;
                const snapshotId = `snapshot_${Date.now()}`;
                
                const snapshot = {
                    id: snapshotId,
                    timestamp: new Date().toISOString(),
                    context: context || {},
                    createdAt: new Date().toISOString()
                };

                // TODO: En producción, crear tag en GitHub
                // const ghPat = process.env.GH_PAT;
                // const ghRepo = process.env.GH_REPO_FULL;
                // if (ghPat && ghRepo) {
                //     await createGitHubTag(ghPat, ghRepo, `restore-${snapshotId}`);
                // }

                console.log(`✅ Guardian snapshot created: ${snapshotId}`);
                
                res.json({
                    success: true,
                    snapshotId,
                    snapshot,
                    message: 'Snapshot creado exitosamente'
                });
            } catch (error) {
                console.error('❌ Guardian snapshot error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // ============================================================================
        // AI GATEWAY TOOLS (OpenAI / Anthropic via registry)
        // ============================================================================
        this.app.get('/api/ai/models', (_req, res) => {
            try {
                const models = AIGateway.listModels();
                res.json({ success: true, models });
            } catch (e) { res.status(500).json({ success:false, error: e.message }); }
        });

        this.app.post('/api/ai/chat', async (req, res) => {
            try {
                const { provider, model, messages } = req.body || {};
                const result = await AIGateway.runModel({ provider, model, messages });
                res.json({ success: true, result });
            } catch (e) { res.status(500).json({ success:false, error: e.message }); }
        });

        // ============================================================================
        // MCP-LIKE TOOLS REGISTRY (schemas + invocation + logs)
        // ============================================================================
        const toolLogs = [];
        const MAX_TOOL_LOGS = 200;
        function logToolInvocation(entry) {
            try {
                toolLogs.push({ ts: new Date().toISOString(), ...entry });
                while (toolLogs.length > MAX_TOOL_LOGS) toolLogs.shift();
            } catch {}
        }

        const tools = [
            // ================= AI =================
            {
                name: 'ai_model_list',
                description: 'Lista modelos disponibles en el registro interno (OpenAI/Anthropic)',
                input_schema: { type: 'object', properties: {}, required: [] },
                output_schema: { type: 'object', properties: {
                    success: { type: 'boolean' },
                    models: { type: 'array' }
                }, required: ['success','models'] }
            },
            {
                name: 'openai_chat',
                description: 'Llama a modelos de OpenAI con mensajes en formato chat',
                input_schema: { type: 'object', properties: {
                    model: { type: 'string' },
                    messages: { type: 'array', items: { type: 'object', properties: {
                        role: { type: 'string' },
                        content: { type: 'string' }
                    }, required: ['content'] } }
                }, required: ['model','messages'] },
                output_schema: { type: 'object', properties: {
                    success: { type: 'boolean' }, result: { type: 'object' }
                }, required: ['success'] }
            },
            {
                name: 'anthropic_chat',
                description: 'Llama a modelos de Anthropic (Claude) con mensajes en formato chat',
                input_schema: { type: 'object', properties: {
                    model: { type: 'string' },
                    messages: { type: 'array', items: { type: 'object', properties: {
                        role: { type: 'string' },
                        content: { type: 'string' }
                    }, required: ['content'] } }
                }, required: ['model','messages'] },
                output_schema: { type: 'object', properties: {
                    success: { type: 'boolean' }, result: { type: 'object' }
                }, required: ['success'] }
            },
            {
                name: 'ai_chat',
                description: 'Llama a modelos de OpenAI o Anthropic, especificando provider y model',
                input_schema: { type: 'object', properties: {
                    provider: { type: 'string', enum: ['openai','anthropic'] },
                    model: { type: 'string' },
                    messages: { type: 'array', items: { type: 'object', properties: {
                        role: { type: 'string' },
                        content: { type: 'string' }
                    }, required: ['content'] } }
                }, required: ['provider','model','messages'] },
                output_schema: { type: 'object', properties: {
                    success: { type: 'boolean' }, result: { type: 'object' }
                }, required: ['success'] }
            },
            // ================ FILESYSTEM ================
            {
                name: 'filesystem_read',
                description: 'Lee un archivo del repositorio (relativo a la raíz del proyecto)',
                input_schema: { type: 'object', properties: {
                    filePath: { type: 'string' },
                    encoding: { type: 'string', default: 'utf8' }
                }, required: ['filePath'] },
                output_schema: { type: 'object', properties: {
                    success: { type: 'boolean' }, content: { type: 'string' }
                }, required: ['success'] }
            },
            {
                name: 'filesystem_write',
                description: 'Escribe un archivo en el repositorio (crea o sobreescribe)',
                input_schema: { type: 'object', properties: {
                    filePath: { type: 'string' },
                    content: { type: 'string' },
                    encoding: { type: 'string', default: 'utf8' }
                }, required: ['filePath','content'] },
                output_schema: { type: 'object', properties: {
                    success: { type: 'boolean' }
                }, required: ['success'] }
            },
            {
                name: 'filesystem_list',
                description: 'Lista archivos en un directorio',
                input_schema: { type: 'object', properties: {
                    dirPath: { type: 'string' }
                }, required: ['dirPath'] },
                output_schema: { type: 'object', properties: {
                    success: { type: 'boolean' }, items: { type: 'array' }
                }, required: ['success'] }
            },
            // ==================== GIT ====================
            {
                name: 'git_status',
                description: 'Devuelve el estado de git en la raíz del proyecto',
                input_schema: { type: 'object', properties: {}, required: [] },
                output_schema: { type: 'object', properties: {
                    success: { type: 'boolean' }, output: { type: 'string' }
                }, required: ['success'] }
            },
            {
                name: 'git_commit',
                description: 'Realiza un commit',
                input_schema: { type: 'object', properties: {
                    message: { type: 'string' }
                }, required: ['message'] },
                output_schema: { type: 'object', properties: {
                    success: { type: 'boolean' }, output: { type: 'string' }
                }, required: ['success'] }
            },
            {
                name: 'git_pull',
                description: 'git pull --rebase --autostash',
                input_schema: { type: 'object', properties: {}, required: [] },
                output_schema: { type: 'object', properties: {
                    success: { type: 'boolean' }, output: { type: 'string' }
                }, required: ['success'] }
            },
            {
                name: 'git_push',
                description: 'git push (o --force-with-lease si se especifica)',
                input_schema: { type: 'object', properties: {
                    forceWithLease: { type: 'boolean', default: false }
                }, required: [] },
                output_schema: { type: 'object', properties: {
                    success: { type: 'boolean' }, output: { type: 'string' }
                }, required: ['success'] }
            },
            // =================== HTTP ====================
            {
                name: 'http_fetch',
                description: 'Realiza una petición HTTP(S) simple',
                input_schema: { type: 'object', properties: {
                    url: { type: 'string' },
                    method: { type: 'string', default: 'GET' },
                    headers: { type: 'object' },
                    body: { type: 'string' }
                }, required: ['url'] },
                output_schema: { type: 'object', properties: {
                    success: { type: 'boolean' }, status: { type: 'number' }, data: { type: 'object' }
                }, required: ['success'] }
            }
        ];

        // GET /api/tools - lista de herramientas y schemas
        this.app.get('/api/tools', (_req, res) => {
            res.json({ success: true, tools });
        });

        // GET /api/tools/logs - últimas invocaciones
        this.app.get('/api/tools/logs', (_req, res) => {
            res.json({ success: true, logs: toolLogs.slice(-MAX_TOOL_LOGS) });
        });

        // POST /api/tools/invoke - invocar una herramienta por nombre
        this.app.post('/api/tools/invoke', async (req, res) => {
            const { name, args } = req.body || {};
            const startedAt = Date.now();
            try {
                if (!name) throw new Error('tool_name_required');
                const tool = tools.find(t => t.name === name);
                if (!tool) throw new Error(`unknown_tool:${name}`);

                let result = null;
                if (name === 'ai_model_list') {
                    result = { success: true, models: AIGateway.listModels() };
                } else if (name === 'openai_chat') {
                    const { model, messages } = args || {};
                    if (!model || !messages) throw new Error('model_and_messages_required');
                    const out = await AIGateway.runModel({ provider: 'openai', model, messages });
                    result = { success: true, result: out };
                } else if (name === 'anthropic_chat') {
                    const { model, messages } = args || {};
                    if (!model || !messages) throw new Error('model_and_messages_required');
                    const out = await AIGateway.runModel({ provider: 'anthropic', model, messages });
                    result = { success: true, result: out };
                } else if (name === 'ai_chat') {
                    const { provider, model, messages } = args || {};
                    if (!provider || !model || !messages) throw new Error('provider_model_messages_required');
                    const out = await AIGateway.runModel({ provider, model, messages });
                    result = { success: true, result: out };
                } else if (name === 'filesystem_read') {
                    const { filePath, encoding = 'utf8' } = args || {};
                    if (!filePath) throw new Error('filePath_required');
                    const abs = safeResolve(filePath);
                    const content = await fs.readFile(abs, encoding);
                    result = { success: true, content };
                } else if (name === 'filesystem_write') {
                    const { filePath, content, encoding = 'utf8' } = args || {};
                    if (!filePath) throw new Error('filePath_required');
                    const abs = safeResolve(filePath);
                    await fs.mkdir(path.dirname(abs), { recursive: true });
                    await fs.writeFile(abs, content ?? '', encoding);
                    result = { success: true };
                } else if (name === 'filesystem_list') {
                    const { dirPath } = args || {};
                    if (!dirPath) throw new Error('dirPath_required');
                    const abs = safeResolve(dirPath);
                    const items = await fs.readdir(abs, { withFileTypes: true });
                    result = { success: true, items: items.map(d => ({ name: d.name, type: d.isDirectory() ? 'dir' : 'file' })) };
                } else if (name === 'git_status') {
                    const out = await execSh('git status --porcelain=v1');
                    result = { success: true, output: out };
                } else if (name === 'git_commit') {
                    const { message } = args || {};
                    if (!message) throw new Error('commit_message_required');
                    await execSh('git add -A');
                    const out = await execSh(`git commit -m "${message.replace(/"/g,'\\"')}"`);
                    result = { success: true, output: out };
                } else if (name === 'git_pull') {
                    const out = await execSh('git pull --rebase --autostash');
                    result = { success: true, output: out };
                } else if (name === 'git_push') {
                    const { forceWithLease = false } = args || {};
                    const out = await execSh(forceWithLease ? 'git push --force-with-lease' : 'git push');
                    result = { success: true, output: out };
                } else if (name === 'http_fetch') {
                    const { url, method = 'GET', headers = {}, body } = args || {};
                    if (!url) throw new Error('url_required');
                    const { request } = require('https');
                    const u = new URL(url);
                    const isHttps = u.protocol === 'https:';
                    const hreq = (isHttps ? require('https') : require('http')).request;
                    result = await new Promise((resolve, reject) => {
                        const req = hreq({
                            method,
                            hostname: u.hostname,
                            path: u.pathname + (u.search || ''),
                            headers
                        }, (res) => {
                            let data = '';
                            res.on('data', (c) => data += c);
                            res.on('end', () => {
                                try { resolve({ success: true, status: res.statusCode, data: data ? JSON.parse(data) : {} }); }
                                catch { resolve({ success: true, status: res.statusCode, data: { raw: data } }); }
                            });
                        });
                        req.on('error', reject);
                        if (body) req.write(body);
                        req.end();
                    });
                } else {
                    throw new Error(`tool_not_implemented:${name}`);
                }

                logToolInvocation({ name, args, ms: Date.now() - startedAt, ok: true });
                res.json(result);
            } catch (e) {
                logToolInvocation({ name, args, ms: Date.now() - startedAt, ok: false, error: String(e && e.message || e) });
                res.status(500).json({ success: false, error: String(e && e.message || e) });
            }
        });

        // GET /api/guardian/restore/latest - Restaurar último snapshot
        this.app.get('/api/guardian/restore/latest', async (req, res) => {
            try {
                // TODO: En producción, obtener último tag de GitHub
                // const ghPat = process.env.GH_PAT;
                // const ghRepo = process.env.GH_REPO_FULL;
                // if (ghPat && ghRepo) {
                //     const latestTag = await getLatestRestoreTag(ghPat, ghRepo);
                //     return res.json({ success: true, restoredFrom: latestTag });
                // }

                res.json({
                    success: true,
                    message: 'Restore endpoint - Usar Netlify Function /api/guardian con RESTAURAR',
                    endpoint: '/.netlify/functions/guardian'
                });
            } catch (error) {
                console.error('❌ Guardian restore error:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // GET /api/guardian/health - Health loop para auto-restore
        this.app.get('/api/guardian/health', async (req, res) => {
            const healthStatus = {
                status: 'active',
                service: 'Guardian MCP Tools',
                timestamp: new Date().toISOString(),
                endpoints: {
                    snapshot: '/api/guardian/snapshot/create',
                    restore: '/api/guardian/restore/latest',
                    netlify: '/.netlify/functions/guardian'
                },
                autoRestore: {
                    enabled: true,
                    interval: '10-15s',
                    mode: 'polling'
                }
            };
            res.json(healthStatus);
        });
        this.server = this.app.listen(this.port, () => {
            console.log(`🚀 Sandra MCP Bridge running on port ${this.port}`);
        });

        this.wss = new WebSocket.Server({ server: this.server });
        
        this.wss.on('connection', (ws, req) => {
            const id = Date.now();
            this.activeConnections.set(id, { ws, ip: req.socket.remoteAddress });
            console.log(`✅ New connection: ${id}`);

            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);
                    const result = await this.processCommand(data);
                    ws.send(JSON.stringify(result));
                } catch (error) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: error.message
                    }));
                }
            });

            ws.on('close', () => {
                this.activeConnections.delete(id);
                console.log(`❌ Connection closed: ${id}`);
            });
        });
    }
    initializeSubagents() {
        // EXPERTOS EJECUTABLES - NO CONVERSACIONALES
        const executableExperts = [
            {
                id: 'sandra-dev',
                name: 'Sandra DEV Expert - EXECUTABLE',
                type: 'EXECUTABLE_EXPERT',
                handler: sandraDevExpert,
                constraints: EXECUTABLE_CONSTRAINTS,
                capabilities: [
                    'CREATE_COMPONENT',
                    'CREATE_FILE',
                    'MODIFY_FILE',
                    'GIT_COMMIT',
                    'INSTALL_PACKAGE',
                    'RUN_COMMAND'
                ]
            },
            { id: 'file-system', name: 'File System Manager', type: 'BASIC' },
            { id: 'docker', name: 'Docker Controller', type: 'BASIC' },
            { id: 'git', name: 'Git Operations', type: 'BASIC' },
            { id: 'terminal', name: 'Terminal Executor', type: 'BASIC' },
            { id: 'npm', name: 'NPM Package Manager', type: 'BASIC' }
        ];

        executableExperts.forEach(agent => {
            this.subagents.set(agent.id, {
                ...agent,
                status: 'ready',
                lastActivity: new Date(),
                mode: agent.type === 'EXECUTABLE_EXPERT' ? 'EXECUTION' : 'BASIC'
            });
        });

        console.log(`[MCP BRIDGE] ✅ Executable experts initialized: ${executableExperts.filter(e => e.type === 'EXECUTABLE_EXPERT').length}`);
    }

    async processCommand(data) {
        const { command, params = {}, expert = 'sandra-dev' } = data;
        console.log(`📋 Processing: ${command} with expert: ${expert}`);

        try {
            // REDIRIGIR A EXPERTO EJECUTABLE
            if (expert === 'sandra-dev' || command.startsWith('dev:')) {
                return await this.executeWithDevExpert(data);
            }

            // COMANDOS BÁSICOS (legacy)
            return await this.executeBasicCommand(data);

        } catch (error) {
            console.error(`[MCP BRIDGE] Command failed:`, error);
            return {
                type: 'error',
                command,
                success: false,
                message: error.message,
                expert,
                realActionAttempted: true
            };
        }
    }

    // ============================================================================
    // EJECUTAR CON EXPERTO DEV - MODO EJECUTABLE
    // ============================================================================
    async executeWithDevExpert(data) {
        const { command, params } = data;

        console.log(`[MCP BRIDGE] Delegating to Sandra DEV Expert (EXECUTABLE)`);

        // MAPEAR COMANDO A TAREA DE DESARROLLO
        const devTask = this.mapCommandToDevTask(command, params);

        // EJECUTAR CON EXPERTO DEV
        const result = await sandraDevExpert.handleMCPRequest(devTask);

        // VERIFICAR QUE LA ACCIÓN SE EJECUTÓ
        if (!result.success) {
            throw new Error(`DEV Expert execution failed: ${result.error}`);
        }

        console.log(`[MCP BRIDGE] ✅ DEV Expert executed successfully`);

        return {
            type: 'dev_response',
            command,
            success: true,
            expert: 'sandra-dev',
            mode: 'EXECUTABLE',
            result: result.result,
            constraints_applied: true,
            real_action_performed: true,
            verification_passed: result.result?.verificationPassed || false
        };
    }

    // ============================================================================
    // MAPEAR COMANDOS A TAREAS DE DESARROLLO
    // ============================================================================
    mapCommandToDevTask(command, params) {
        const commandMap = {
            'create_component': {
                type: 'CREATE_COMPONENT',
                params: {
                    name: params.name || 'NewComponent',
                    props: params.props || [],
                    directory: params.directory || 'src/components',
                    includeStyles: params.includeStyles || true
                }
            },
            'create_file': {
                type: 'CREATE_FILE',
                params: {
                    filePath: params.filePath,
                    content: params.content,
                    encoding: params.encoding || 'utf8'
                }
            },
            'modify_file': {
                type: 'MODIFY_FILE',
                params: {
                    filePath: params.filePath,
                    modifications: params.modifications || []
                }
            },
            'git_commit': {
                type: 'GIT_COMMIT',
                params: {
                    message: params.message,
                    files: params.files || ['.']
                }
            },
            'install_package': {
                type: 'INSTALL_PACKAGE',
                params: {
                    packageName: params.packageName,
                    dev: params.dev || false
                }
            },
            'run_command': {
                type: 'RUN_COMMAND',
                params: {
                    command: params.command,
                    cwd: params.cwd
                }
            }
        };

        // Normalizar comando
        const normalizedCommand = command.replace('dev:', '').toLowerCase();

        if (commandMap[normalizedCommand]) {
            return commandMap[normalizedCommand];
        }

        // Default: Comando personalizado
        return {
            type: 'RUN_COMMAND',
            params: {
                command: params.command || command,
                cwd: params.cwd
            }
        };
    }

    // ============================================================================
    // COMANDOS BÁSICOS (LEGACY)
    // ============================================================================
    async executeBasicCommand(data) {
        const { command, params = {} } = data;

        return {
            type: 'basic_response',
            command,
            success: true,
            message: `Basic command ${command} executed`,
            data: params,
            mode: 'LEGACY'
        };
    }
}

const bridge = new SandraMCPBridge();

console.log(`
╔════════════════════════════════════════╗
║     SANDRA MCP BRIDGE - GALAXY 7.0    ║
║    Development Interface Activated     ║
╚════════════════════════════════════════╝
`);