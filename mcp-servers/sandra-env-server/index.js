#!/usr/bin/env node
/**
 * SANDRA ENVIRONMENT MCP SERVER
 * Servidor MCP personalizado para ampliar capacidades de entorno
 * Permite acceso expandido al sistema, archivos, procesos y bases de datos
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAIMemoryManager } from '../../orchestrator/ai-memory-manager.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SandraEnvServer {
  constructor() {
    this.server = new Server(
      {
        name: 'sandra-env-server',
        version: '1.0.0',
        description: 'MCP Server para ampliar capacidades de entorno de Sandra',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // Listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'execute_system_command',
          description: 'Ejecuta comandos del sistema con privilegios expandidos. Permite ejecutar cualquier comando en el sistema operativo.',
          inputSchema: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'Comando a ejecutar (puede incluir pipes, redirecciones, etc.)',
              },
              workingDir: {
                type: 'string',
                description: 'Directorio de trabajo (opcional)',
              },
              background: {
                type: 'boolean',
                description: 'Ejecutar en background (opcional, default: false)',
              },
              timeout: {
                type: 'number',
                description: 'Timeout en milisegundos (opcional, default: 30000)',
              },
            },
            required: ['command'],
          },
        },
        {
          name: 'file_read',
          description: 'Lee contenido de archivos en cualquier ubicación del sistema',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Ruta completa del archivo',
              },
              encoding: {
                type: 'string',
                description: 'Codificación (utf8, binary, etc.)',
                default: 'utf8',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'file_write',
          description: 'Escribe contenido en archivos en cualquier ubicación del sistema',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Ruta completa del archivo',
              },
              content: {
                type: 'string',
                description: 'Contenido a escribir',
              },
              append: {
                type: 'boolean',
                description: 'Agregar al final del archivo (opcional)',
                default: false,
              },
            },
            required: ['path', 'content'],
          },
        },
        {
          name: 'file_list',
          description: 'Lista archivos y directorios en cualquier ubicación',
          inputSchema: {
            type: 'object',
            properties: {
              directory: {
                type: 'string',
                description: 'Ruta del directorio',
              },
              recursive: {
                type: 'boolean',
                description: 'Recursivo (opcional)',
                default: false,
              },
              includeHidden: {
                type: 'boolean',
                description: 'Incluir archivos ocultos (opcional)',
                default: false,
              },
            },
            required: ['directory'],
          },
        },
        {
          name: 'file_copy',
          description: 'Copia archivos o directorios',
          inputSchema: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                description: 'Ruta origen',
              },
              destination: {
                type: 'string',
                description: 'Ruta destino',
              },
              recursive: {
                type: 'boolean',
                description: 'Copiar directorios recursivamente',
                default: false,
              },
            },
            required: ['source', 'destination'],
          },
        },
        {
          name: 'file_move',
          description: 'Mueve/renombra archivos o directorios',
          inputSchema: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                description: 'Ruta origen',
              },
              destination: {
                type: 'string',
                description: 'Ruta destino',
              },
            },
            required: ['source', 'destination'],
          },
        },
        {
          name: 'file_delete',
          description: 'Elimina archivos o directorios',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Ruta del archivo o directorio',
              },
              recursive: {
                type: 'boolean',
                description: 'Eliminar directorios recursivamente',
                default: false,
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'file_info',
          description: 'Obtiene información detallada de un archivo o directorio',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Ruta del archivo',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'directory_create',
          description: 'Crea directorios (incluyendo estructura completa)',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Ruta del directorio',
              },
              recursive: {
                type: 'boolean',
                description: 'Crear estructura completa',
                default: true,
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'service_start',
          description: 'Inicia un servicio del sistema',
          inputSchema: {
            type: 'object',
            properties: {
              service: {
                type: 'string',
                description: 'Nombre del servicio',
              },
            },
            required: ['service'],
          },
        },
        {
          name: 'service_stop',
          description: 'Detiene un servicio del sistema',
          inputSchema: {
            type: 'object',
            properties: {
              service: {
                type: 'string',
                description: 'Nombre del servicio',
              },
            },
            required: ['service'],
          },
        },
        {
          name: 'service_status',
          description: 'Obtiene el estado de un servicio',
          inputSchema: {
            type: 'object',
            properties: {
              service: {
                type: 'string',
                description: 'Nombre del servicio',
              },
            },
            required: ['service'],
          },
        },
        {
          name: 'process_spawn',
          description: 'Inicia un proceso en background y retorna su PID',
          inputSchema: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'Comando a ejecutar',
              },
              args: {
                type: 'array',
                items: { type: 'string' },
                description: 'Argumentos del comando',
              },
              workingDir: {
                type: 'string',
                description: 'Directorio de trabajo',
              },
              detached: {
                type: 'boolean',
                description: 'Ejecutar como proceso independiente',
                default: true,
              },
            },
            required: ['command'],
          },
        },
        {
          name: 'process_list',
          description: 'Lista procesos en ejecución',
          inputSchema: {
            type: 'object',
            properties: {
              filter: {
                type: 'string',
                description: 'Filtro por nombre (opcional)',
              },
            },
          },
        },
        {
          name: 'database_query',
          description: 'Ejecuta queries en bases de datos',
          inputSchema: {
            type: 'object',
            properties: {
              dbType: {
                type: 'string',
                enum: ['postgres', 'mysql', 'mongodb', 'sqlite'],
                description: 'Tipo de base de datos',
              },
              connectionString: {
                type: 'string',
                description: 'String de conexión o ruta para SQLite',
              },
              query: {
                type: 'string',
                description: 'Query SQL o comando MongoDB',
              },
            },
            required: ['dbType', 'connectionString', 'query'],
          },
        },
        {
          name: 'environment_variable',
          description: 'Lee o escribe variables de entorno del sistema',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['get', 'set', 'list'],
                description: 'Acción a realizar',
              },
              name: {
                type: 'string',
                description: 'Nombre de la variable (requerido para get/set)',
              },
              value: {
                type: 'string',
                description: 'Valor para set (requerido para set)',
              },
            },
            required: ['action'],
          },
        },
        {
          name: 'network_request',
          description: 'Realiza peticiones HTTP/HTTPS',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL a consultar',
              },
              method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                default: 'GET',
              },
              headers: {
                type: 'object',
                description: 'Headers HTTP (opcional)',
              },
              body: {
                type: 'string',
                description: 'Cuerpo de la petición (opcional)',
              },
            },
            required: ['url'],
          },
        },
        {
          name: 'ai_save_memory',
          description: 'Guarda memoria/conversación para recordarla en futuras sesiones',
          inputSchema: {
            type: 'object',
            properties: {
              userMessage: {
                type: 'string',
                description: 'Mensaje del usuario',
              },
              aiResponse: {
                type: 'string',
                description: 'Respuesta de la IA',
              },
              context: {
                type: 'object',
                description: 'Contexto adicional (opcional)',
              },
            },
            required: ['userMessage', 'aiResponse'],
          },
        },
        {
          name: 'ai_load_memory',
          description: 'Carga memoria/conversaciones anteriores para contexto',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Número de conversaciones a cargar (opcional, default: 20)',
              },
              search: {
                type: 'string',
                description: 'Buscar conversaciones por texto (opcional)',
              },
            },
          },
        },
        {
          name: 'ai_save_context',
          description: 'Guarda contexto importante (hechos, preferencias, etc.)',
          inputSchema: {
            type: 'object',
            properties: {
              context: {
                type: 'object',
                description: 'Contexto a guardar',
              },
            },
            required: ['context'],
          },
        },
        {
          name: 'ai_load_context',
          description: 'Carga contexto guardado',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // Manejar llamadas a herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result;
        switch (name) {
          case 'execute_system_command':
            result = await this.executeCommand(args);
            break;
          case 'file_read':
            result = await this.fileRead(args);
            break;
          case 'file_write':
            result = await this.fileWrite(args);
            break;
          case 'file_list':
            result = await this.fileList(args);
            break;
          case 'file_copy':
            result = await this.fileCopy(args);
            break;
          case 'file_move':
            result = await this.fileMove(args);
            break;
          case 'file_delete':
            result = await this.fileDelete(args);
            break;
          case 'file_info':
            result = await this.fileInfo(args);
            break;
          case 'directory_create':
            result = await this.directoryCreate(args);
            break;
          case 'service_start':
            result = await this.serviceStart(args);
            break;
          case 'service_stop':
            result = await this.serviceStop(args);
            break;
          case 'service_status':
            result = await this.serviceStatus(args);
            break;
          case 'process_spawn':
            result = await this.processSpawn(args);
            break;
          case 'process_list':
            result = await this.processList(args);
            break;
          case 'database_query':
            result = await this.databaseQuery(args);
            break;
          case 'environment_variable':
            result = await this.environmentVariable(args);
            break;
          case 'network_request':
            result = await this.networkRequest(args);
            break;
          case 'ai_save_memory':
            result = await this.aiSaveMemory(args);
            break;
          case 'ai_load_memory':
            result = await this.aiLoadMemory(args);
            break;
          case 'ai_save_context':
            result = await this.aiSaveContext(args);
            break;
          case 'ai_load_context':
            result = await this.aiLoadContext(args);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}\n${error.stack || ''}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  // ============================================================================
  // IMPLEMENTACIÓN DE HERRAMIENTAS
  // ============================================================================

  async executeCommand(args) {
    const { command, workingDir, background, timeout = 30000 } = args;
    
    if (background) {
      const proc = spawn(command, {
        shell: true,
        cwd: workingDir || process.cwd(),
        detached: true,
        stdio: 'ignore',
      });
      proc.unref();
      return `Command started in background with PID: ${proc.pid}`;
    }

    const { stdout, stderr } = await Promise.race([
      execAsync(command, {
        cwd: workingDir || process.cwd(),
        maxBuffer: 10 * 1024 * 1024,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Command timeout')), timeout)
      ),
    ]);

    return stdout || stderr || 'Command executed successfully';
  }

  async fileRead(args) {
    const { path: filePath, encoding = 'utf8' } = args;
    const content = await fs.readFile(filePath, encoding);
    return content;
  }

  async fileWrite(args) {
    const { path: filePath, content, append = false } = args;
    if (append) {
      await fs.appendFile(filePath, content);
      return `Content appended to ${filePath}`;
    }
    await fs.writeFile(filePath, content);
    return `Content written to ${filePath}`;
  }

  async fileList(args) {
    const { directory, recursive = false, includeHidden = false } = args;
    
    if (!recursive) {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      const filtered = includeHidden 
        ? entries 
        : entries.filter(e => !e.name.startsWith('.'));
      
      return filtered.map(e => ({
        name: e.name,
        type: e.isDirectory() ? 'directory' : 'file',
        path: path.join(directory, e.name),
      }));
    }

    // Recursivo
    const result = [];
    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!includeHidden && entry.name.startsWith('.')) continue;
        
        const fullPath = path.join(dir, entry.name);
        result.push({
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          path: fullPath,
        });
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        }
      }
    }
    await walk(directory);
    return result;
  }

  async fileCopy(args) {
    const { source, destination, recursive = false } = args;
    await fs.cp(source, destination, { recursive });
    return `Copied ${source} to ${destination}`;
  }

  async fileMove(args) {
    const { source, destination } = args;
    await fs.rename(source, destination);
    return `Moved ${source} to ${destination}`;
  }

  async fileDelete(args) {
    const { path: filePath, recursive = false } = args;
    await fs.rm(filePath, { recursive, force: true });
    return `Deleted ${filePath}`;
  }

  async fileInfo(args) {
    const { path: filePath } = args;
    const stats = await fs.stat(filePath);
    return {
      path: filePath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      mode: stats.mode.toString(8),
    };
  }

  async directoryCreate(args) {
    const { path: dirPath, recursive = true } = args;
    await fs.mkdir(dirPath, { recursive });
    return `Directory created: ${dirPath}`;
  }

  async serviceStart(args) {
    const { service } = args;
    const command = process.platform === 'win32'
      ? `net start "${service}"`
      : `sudo systemctl start ${service}`;
    
    const { stdout, stderr } = await execAsync(command);
    return stdout || stderr || `Service ${service} started`;
  }

  async serviceStop(args) {
    const { service } = args;
    const command = process.platform === 'win32'
      ? `net stop "${service}"`
      : `sudo systemctl stop ${service}`;
    
    const { stdout, stderr } = await execAsync(command);
    return stdout || stderr || `Service ${service} stopped`;
  }

  async serviceStatus(args) {
    const { service } = args;
    const command = process.platform === 'win32'
      ? `sc query "${service}"`
      : `systemctl status ${service}`;
    
    try {
      const { stdout } = await execAsync(command);
      return stdout;
    } catch (error) {
      return `Service ${service} status: ${error.message}`;
    }
  }

  async processSpawn(args) {
    const { command, args: procArgs = [], workingDir, detached = true } = args;
    const proc = spawn(command, procArgs, {
      cwd: workingDir || process.cwd(),
      detached,
      stdio: 'ignore',
    });

    if (detached) {
      proc.unref();
    }

    return {
      pid: proc.pid,
      command,
      args: procArgs,
      message: detached ? 'Process spawned in background' : 'Process spawned',
    };
  }

  async processList(args) {
    const { filter } = args;
    const command = process.platform === 'win32'
      ? 'tasklist'
      : 'ps aux';
    
    const { stdout } = await execAsync(command);
    
    if (filter) {
      const lines = stdout.split('\n').filter(line => 
        line.toLowerCase().includes(filter.toLowerCase())
      );
      return lines.join('\n');
    }
    
    return stdout;
  }

  async databaseQuery(args) {
    const { dbType, connectionString, query } = args;
    
    // Implementación básica - requiere librerías específicas
    if (dbType === 'sqlite') {
      const sqlite3 = await import('sqlite3').catch(() => null);
      if (!sqlite3) {
        throw new Error('sqlite3 package not installed');
      }
      
      return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(connectionString);
        db.all(query, (err, rows) => {
          db.close();
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
    
    // Para otros tipos de BD, se requerirían las librerías correspondientes
    throw new Error(`Database type ${dbType} requires additional configuration`);
  }

  async environmentVariable(args) {
    const { action, name, value } = args;
    
    switch (action) {
      case 'get':
        return process.env[name] || `Variable ${name} not found`;
      case 'set':
        process.env[name] = value;
        return `Variable ${name} set to ${value}`;
      case 'list':
        return Object.keys(process.env).sort();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async networkRequest(args) {
    const { url, method = 'GET', headers = {}, body } = args;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body || undefined,
    });

    const text = await response.text();
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: text,
    };
  }

  async aiSaveMemory(args) {
    const { userMessage, aiResponse, context = {} } = args;
    const memoryManager = getAIMemoryManager();
    const id = await memoryManager.saveConversation(userMessage, aiResponse, context);
    return {
      success: true,
      id,
      message: 'Memory saved successfully'
    };
  }

  async aiLoadMemory(args) {
    const { limit = 20, search = null } = args;
    const memoryManager = getAIMemoryManager();
    
    let conversations;
    if (search) {
      conversations = await memoryManager.searchConversations(search, limit);
    } else {
      conversations = await memoryManager.getRecentConversations(limit);
    }
    
    return {
      success: true,
      count: conversations.length,
      conversations
    };
  }

  async aiSaveContext(args) {
    const { context } = args;
    const memoryManager = getAIMemoryManager();
    const success = await memoryManager.saveContext(context);
    return {
      success,
      message: success ? 'Context saved successfully' : 'Failed to save context'
    };
  }

  async aiLoadContext(args) {
    const memoryManager = getAIMemoryManager();
    const context = await memoryManager.loadContext();
    return {
      success: true,
      context
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sandra Environment MCP Server running on stdio');
  }
}

const server = new SandraEnvServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

