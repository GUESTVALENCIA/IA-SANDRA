# 🚀 MCP SERVER - ACCESO COMPLETO PARA SONNET 4.5+

Este servidor MCP concede **acceso total** a Sonnet 4.5 y superior para trabajar con tu sistema Sandra IA 8.0 Pro.

## 📋 **CAPACIDADES EXPUESTAS**

### ✅ **Archivos y Carpetas**
- ✅ Lectura de archivos locales
- ✅ Escritura de archivos
- ✅ Creación de carpetas
- ✅ Eliminación de archivos/carpetas
- ✅ Navegación completa del sistema

### ✅ **Repositorios Git**
- ✅ Listar repositorios
- ✅ Obtener commits
- ✅ Crear commits
- ✅ Push a GitHub
- ✅ Acceso completo a GitHub API

### ✅ **Vercel**
- ✅ Listar proyectos
- ✅ Crear deployments
- ✅ Listar deployments
- ✅ Gestión de dominios

### ✅ **APIs Disponibles**
- ✅ **Groq** - LLM (Mixtral, Llama, etc.)
- ✅ **Deepgram** - Speech-to-Text
- ✅ **Cartesia** - Text-to-Speech
- ✅ **HeyGen** - Avatar streaming
- ✅ **Twilio** - Llamadas telefónicas
- ✅ **PayPal** - Procesamiento de pagos
- ✅ **OpenAI** - GPT models
- ✅ **DeepSeek** - DeepSeek API
- ✅ **Neon DB** - Base de datos PostgreSQL

### ✅ **Ejecución de Comandos**
- ✅ Ejecutar cualquier comando del sistema
- ✅ Navegación de directorios
- ✅ Instalación de paquetes
- ✅ Ejecución de scripts

## 🚀 **INICIO RÁPIDO**

### Opción 1: Script Batch (Windows)
```batch
cd C:\Sandra-IA-8.0-Pro
mcp-server\start-sonnet-mcp.bat
```

### Opción 2: NPM Script
```bash
npm run start:sonnet-mcp
```

### Opción 3: Node Directo
```bash
cd C:\Sandra-IA-8.0-Pro
node mcp-server/mcp-sonnet-full-access.js
```

## 🔌 **CONFIGURACIÓN EN SONNET 4.5+**

### Para Cursor/Claude Desktop:

1. **Abrir configuración MCP**:
   - Cursor: `Settings > Features > Model Context Protocol`
   - Claude Desktop: Editar `claude_desktop_config.json`

2. **Añadir configuración**:
```json
{
  "mcpServers": {
    "sandra-full-access": {
      "command": "node",
      "args": [
        "C:\\Sandra-IA-8.0-Pro\\mcp-server\\mcp-sonnet-full-access.js"
      ],
      "env": {
        "MCP_PORT": "3001",
        "MCP_SECRET_KEY": "sandra_mcp_ultra_secure_2025"
      }
    }
  }
}
```

3. **Reiniciar Cursor/Claude Desktop**

## 📡 **ENDPOINTS DISPONIBLES**

### **Recursos (Archivos)**
- `POST /mcp/resources/list` - Listar archivos/carpetas
- `POST /mcp/resources/read` - Leer archivo
- `POST /mcp/resources/write` - Escribir archivo
- `POST /mcp/resources/create-folder` - Crear carpeta
- `POST /mcp/resources/delete` - Eliminar recurso

### **Git**
- `GET /mcp/git/repos` - Listar repositorios
- `POST /mcp/git/commits` - Obtener commits
- `POST /mcp/git/commit` - Crear commit
- `POST /mcp/git/push` - Push a GitHub

### **Vercel**
- `GET /mcp/vercel/projects` - Listar proyectos
- `POST /mcp/vercel/deploy` - Deploy proyecto
- `GET /mcp/vercel/deployments` - Listar deployments

### **APIs**
- `POST /mcp/api/groq` - Usar Groq API
- `POST /mcp/api/deepgram` - Transcripción de audio
- `POST /mcp/api/cartesia` - Generación de voz
- `POST /mcp/api/heygen` - Avatar streaming

### **Comandos**
- `POST /mcp/command/execute` - Ejecutar comando del sistema

### **Configuración**
- `GET /mcp/tokens` - Ver tokens disponibles
- `GET /mcp/config` - Ver configuración completa
- `GET /health` - Health check

## 🔑 **TOKENS DISPONIBLES**

Todos los tokens del `.env.pro` están disponibles automáticamente:

- ✅ `GROQ_API_KEY`
- ✅ `DEEPGRAM_API_KEY`
- ✅ `CARTESIA_API_KEY`
- ✅ `HEYGEN_API_KEY`
- ✅ `GITHUB_TOKEN`
- ✅ `VERCEL_TOKEN`
- ✅ `TWILIO_ACCOUNT_SID`
- ✅ `TWILIO_AUTH_TOKEN`
- ✅ `PAYPAL_CLIENT_ID`
- ✅ `PAYPAL_CLIENT_SECRET`
- ✅ `OPENAI_API_KEY`
- ✅ `DEEPSEEK_API_KEY`
- ✅ `DATABASE_URL` (Neon)

## 📝 **EJEMPLOS DE USO**

### Leer archivo
```json
POST /mcp/resources/read
{
  "uri": "file://C:/Sandra-IA-8.0-Pro/package.json"
}
```

### Escribir archivo
```json
POST /mcp/resources/write
{
  "uri": "file://C:/Sandra-IA-8.0-Pro/test.txt",
  "contents": [{
    "text": "Contenido del archivo"
  }]
}
```

### Crear commit en GitHub
```json
POST /mcp/git/commit
{
  "message": "Update from Sonnet",
  "files": [
    {
      "path": "test.js",
      "content": "console.log('Hello');"
    }
  ],
  "branch": "main"
}
```

### Deploy a Vercel
```json
POST /mcp/vercel/deploy
{
  "projectId": "prj_xxx",
  "directory": "C:/Sandra-IA-8.0-Pro",
  "production": true
}
```

### Usar Groq API
```json
POST /mcp/api/groq
{
  "prompt": "Explica qué es MCP",
  "model": "mixtral-8x7b-32768"
}
```

### Ejecutar comando
```json
POST /mcp/command/execute
{
  "command": "npm install express",
  "cwd": "C:/Sandra-IA-8.0-Pro"
}
```

## 🔒 **SEGURIDAD**

- El servidor escucha en `localhost:3001` por defecto
- Se puede configurar autenticación con `MCP_SECRET_KEY`
- Todos los tokens se cargan desde `.env.pro` de forma segura

## 🎯 **ESTADO DEL SERVIDOR**

Verificar que el servidor está funcionando:
```bash
curl http://localhost:3001/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "protocol": "mcp",
  "version": "1.0.0",
  "capabilities": {
    "files": true,
    "git": true,
    "vercel": true,
    "github": true,
    "apis": true,
    "commands": true,
    "navigation": true
  },
  "tokens": 15
}
```

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### El servidor no inicia
- Verificar que el puerto 3001 no esté en uso
- Verificar que todas las dependencias estén instaladas: `npm install`

### Sonnet no se conecta
- Verificar que el servidor esté corriendo
- Verificar la ruta en la configuración MCP
- Verificar que el archivo `.env.pro` exista y tenga los tokens

### Error de permisos
- Verificar permisos de escritura en las carpetas
- Verificar permisos de ejecución de comandos

## 📞 **SOPORTE**

Para más información, consulta:
- Documentación MCP: https://modelcontextprotocol.io
- Repositorio: https://github.com/GUESTVALENCIA/IA-SANDRA

---

**✅ SERVIDOR MCP LISTO PARA SONNET 4.5+**

El servidor concede acceso completo a todos los recursos del sistema Sandra IA 8.0 Pro.

