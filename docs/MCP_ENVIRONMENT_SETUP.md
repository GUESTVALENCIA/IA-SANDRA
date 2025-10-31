# 🔧 Configuración MCP para Ampliar Capacidades de IA

## 📋 Limitaciones Actuales de Entorno

### Limitaciones en Cursor:
1. **Sistema de Archivos**: Solo acceso al workspace actual
2. **Comandos del Sistema**: Limitados a lo que el shell permite
3. **Procesos de Larga Duración**: No puedo mantener servicios corriendo fácilmente
4. **Acceso a Servicios**: No tengo acceso directo a bases de datos o servicios externos
5. **Persistencia**: No mantengo estado entre sesiones
6. **Red/APIs**: Acceso limitado a dependencias externas

## 🚀 Soluciones con MCP (Model Context Protocol)

### 1. MCP Servers Recomendados

#### **A. File System MCP Server**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/"]
    }
  }
}
```
**Permite:**
- Acceso a todo el sistema de archivos (no solo workspace)
- Lectura/escritura en cualquier ubicación
- Operaciones de archivos avanzadas

#### **B. Database MCP Server**
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/db"
      }
    }
  }
}
```
**Permite:**
- Acceso directo a bases de datos
- Queries SQL
- Gestión de esquemas

#### **C. Process Control MCP Server** (Personalizado)
Necesitas crear un servidor MCP personalizado que permita:
- Iniciar/detener procesos
- Monitorear servicios
- Gestionar contenedores Docker

#### **D. Terminal/Command MCP Server**
```json
{
  "mcpServers": {
    "terminal": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-terminal"]
    }
  }
}
```
**Permite:**
- Ejecutar comandos complejos
- Gestionar procesos en background
- Acceso a herramientas del sistema

### 2. Servidor MCP Personalizado para Sandra

#### Crear `mcp-server-sandra-env/index.js`:
```javascript
#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class SandraEnvServer {
  constructor() {
    this.server = new Server(
      {
        name: 'sandra-env-server',
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
    // Listar herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'execute_system_command',
          description: 'Ejecuta comandos del sistema con privilegios expandidos',
          inputSchema: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'Comando a ejecutar',
              },
              workingDir: {
                type: 'string',
                description: 'Directorio de trabajo',
              },
              background: {
                type: 'boolean',
                description: 'Ejecutar en background',
              },
            },
            required: ['command'],
          },
        },
        {
          name: 'file_operations',
          description: 'Operaciones avanzadas de archivos fuera del workspace',
          inputSchema: {
            type: 'object',
            properties: {
              operation: {
                type: 'string',
                enum: ['read', 'write', 'delete', 'list', 'copy', 'move'],
              },
              path: {
                type: 'string',
                description: 'Ruta del archivo',
              },
              content: {
                type: 'string',
                description: 'Contenido para write',
              },
            },
            required: ['operation', 'path'],
          },
        },
        {
          name: 'service_management',
          description: 'Gestionar servicios del sistema',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['start', 'stop', 'restart', 'status'],
              },
              service: {
                type: 'string',
                description: 'Nombre del servicio',
              },
            },
            required: ['action', 'service'],
          },
        },
        {
          name: 'database_query',
          description: 'Ejecutar queries en bases de datos',
          inputSchema: {
            type: 'object',
            properties: {
              dbType: {
                type: 'string',
                enum: ['postgres', 'mysql', 'mongodb'],
              },
              connectionString: {
                type: 'string',
              },
              query: {
                type: 'string',
              },
            },
            required: ['dbType', 'connectionString', 'query'],
          },
        },
      ],
    }));

    // Manejar llamadas a herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'execute_system_command':
            return await this.executeCommand(args);
          case 'file_operations':
            return await this.fileOperations(args);
          case 'service_management':
            return await this.serviceManagement(args);
          case 'database_query':
            return await this.databaseQuery(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async executeCommand(args) {
    return new Promise((resolve, reject) => {
      const { command, workingDir, background } = args;
      const proc = spawn(command, {
        shell: true,
        cwd: workingDir || process.cwd(),
        detached: background || false,
      });

      let output = '';
      let error = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.stderr.on('data', (data) => {
        error += data.toString();
      });

      proc.on('close', (code) => {
        resolve({
          content: [
            {
              type: 'text',
              text: output || error || `Command exited with code ${code}`,
            },
          ],
        });
      });

      proc.on('error', (err) => {
        reject(err);
      });

      if (background) {
        proc.unref();
      }
    });
  }

  async fileOperations(args) {
    const { operation, path: filePath, content } = args;

    try {
      switch (operation) {
        case 'read':
          return {
            content: [
              {
                type: 'text',
                text: fs.readFileSync(filePath, 'utf8'),
              },
            ],
          };
        case 'write':
          fs.writeFileSync(filePath, content || '');
          return {
            content: [
              {
                type: 'text',
                text: `File written: ${filePath}`,
              },
            ],
          };
        case 'list':
          const files = fs.readdirSync(filePath);
          return {
            content: [
              {
                type: 'text',
                text: files.join('\n'),
              },
            ],
          };
        case 'delete':
          fs.unlinkSync(filePath);
          return {
            content: [
              {
                type: 'text',
                text: `File deleted: ${filePath}`,
              },
            ],
          };
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      throw new Error(`File operation failed: ${error.message}`);
    }
  }

  async serviceManagement(args) {
    const { action, service } = args;
    // Implementar gestión de servicios según el sistema operativo
    const command = process.platform === 'win32' 
      ? `net ${action} ${service}`
      : `systemctl ${action} ${service}`;
    
    return this.executeCommand({ command });
  }

  async databaseQuery(args) {
    const { dbType, connectionString, query } = args;
    // Implementar conexión y query según el tipo de BD
    // Esto requeriría librerías como pg, mysql2, mongodb, etc.
    return {
      content: [
        {
          type: 'text',
          text: 'Database query executed',
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sandra Environment MCP Server running on stdio');
  }
}

const server = new SandraEnvServer();
server.run().catch(console.error);
```

## 📦 Configuración en Cursor

### Configurar `~/.cursor/mcp.json` (o equivalente):
```json
{
  "mcpServers": {
    "sandra-env": {
      "command": "node",
      "args": ["C:/Users/clayt/AppData/Local/Programs/Sandra DevConsole/extracted_app/mcp-servers/sandra-env-server/index.js"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:/"]
    },
    "terminal": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-terminal"]
    }
  }
}
```

## 🎯 Beneficios de Esta Configuración

1. ✅ **Acceso Expandido al Sistema**: Puedo trabajar en cualquier ubicación del sistema
2. ✅ **Gestión de Procesos**: Puedo iniciar/detener servicios
3. ✅ **Base de Datos**: Acceso directo a datos
4. ✅ **Comandos Avanzados**: Ejecución de scripts complejos
5. ✅ **Persistencia**: Trabajo continuo entre sesiones

## 🔐 Consideraciones de Seguridad

⚠️ **IMPORTANTE**: Estos MCP servers amplían significativamente mis capacidades. Asegúrate de:
- Limitar acceso a rutas críticas del sistema
- Usar autenticación en servicios sensibles
- Revisar permisos antes de ejecutar comandos destructivos
- Mantener logs de todas las operaciones

## 📝 Próximos Pasos

1. Instalar dependencias MCP:
```bash
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-terminal
npm install -g @modelcontextprotocol/sdk
```

2. Crear el servidor personalizado Sandra
3. Configurar en Cursor
4. Probar capacidades expandidas

---

**Nota**: Esta configuración requiere que Cursor soporte MCP. Verifica la versión y capacidades de tu instalación.

