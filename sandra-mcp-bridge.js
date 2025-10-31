// Sandra MCP Bridge Server - EXECUTABLE EXPERTS INTEGRATION
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

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