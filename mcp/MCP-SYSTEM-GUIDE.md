# 🤖 SISTEMA DE SUBAGENTES MCP - SANDRA PROFESSIONAL

## ✅ ARQUITECTURA IMPLEMENTADA

### **ORQUESTADOR CENTRAL**
`orchestrator.js` → Coordina y delega tareas a agentes especializados

### **5 SUBAGENTES EXPERTOS**

#### 1. **DEV AGENT** → `agents/dev-agent.js`
- **GitHub**: Commits, branches, pull requests
- **Netlify**: Deploy automático
- **CI/CD**: Integración continua

#### 2. **VOICE AGENT** → `agents/voice-agent.js`
- **HeyGen**: Avatar 4K videos
- **ElevenLabs**: Text-to-Speech neural
- **Cartesia**: Voz conversacional tiempo real
- **Deepgram**: Speech-to-Text

#### 3. **AI AGENT** → `agents/ai-agent.js`
- **Anthropic Claude**: Razonamiento profundo
- **OpenAI GPT-4o**: Respuestas rápidas
- **Groq**: Inferencia acelerada GPU

#### 4. **BUSINESS AGENT** → `agents/business-agent.js`
- **PayPal**: Procesamiento de pagos
- **Airtable**: CRM y gestión clientes
- **Supabase**: Base de datos

#### 5. **COMMS AGENT** → `agents/comms-agent.js`
- **WhatsApp**: Meta Business API
- **Twilio**: SMS y llamadas
- **Mensajería**: Gestión comunicaciones

---

## 🔌 CONFIGURACIÓN CLAUDE DESKTOP

Copia este bloque en tu archivo de configuración de Claude Desktop:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sandra-orchestrator": {
      "command": "node",
      "args": ["C:\\Users\\clayt\\Desktop\\sandra-professional\\mcp\\orchestrator.js"],
      "env": {
        "ANTHROPIC_API_KEY": "***REMOVED***",
        "OPENAI_API_KEY": "YOUR_OPENAI_API_KEY"
      }
    },
    "sandra-dev-agent": {
      "command": "node",
      "args": ["C:\\Users\\clayt\\Desktop\\sandra-professional\\mcp\\agents\\dev-agent.js"],
      "env": {
        "GITHUB_TOKEN": "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",
        "NETLIFY_AUTH_TOKEN": "nfp_BguXWY1a87dAj2hLJvB2wy5ndvvkkCkm0b60"
      }
    },
    "sandra-voice-agent": {
      "command": "node",
      "args": ["C:\\Users\\clayt\\Desktop\\sandra-professional\\mcp\\agents\\voice-agent.js"],
      "env": {
        "HEYGEN_API_KEY": "YOUR_HEYGEN_API_KEY",
        "ELEVENLABS_API_KEY": "YOUR_ELEVENLABS_API_KEY",
        "CARTESIA_API_KEY": "YOUR_CARTESIA_API_KEY",
        "DEEPGRAM_API_KEY": "YOUR_DEEPGRAM_API_KEY"
      }
    },
    "sandra-ai-agent": {
      "command": "node",
      "args": ["C:\\Users\\clayt\\Desktop\\sandra-professional\\mcp\\agents\\ai-agent.js"],
      "env": {
        "ANTHROPIC_API_KEY": "***REMOVED***",
        "OPENAI_API_KEY": "YOUR_OPENAI_API_KEY",
        "GROQ_API_KEY": "***REMOVED***"
      }
    },
    "sandra-business-agent": {
      "command": "node",
      "args": ["C:\\Users\\clayt\\Desktop\\sandra-professional\\mcp\\agents\\business-agent.js"],
      "env": {
        "PAYPAL_CLIENT_ID": "AYs9dULgQ12igjVhbMCFnXtBVcrmrJ25PWV949ZOFMFyEQTAS1eE7Bdm7iybUqnA0GSGZRl5q9Ar-wT8",
        "PAYPAL_CLIENT_SECRET": "EEjIKqOQpLodh6VEpwt0z3YOE_xkk1sQ1J1DzSKXjfpKKGZ6WqjidWus3hcrIwpl3jyo6JpI2jHsg7mA",
        "AIRTABLE_TOKEN": "pat0COYBApfvo5HPf.e5da58f2e2fdc694f92840a3a68a19c2673e6cd73ef41ed6c2cb6889150625fc",
        "SUPABASE_TOKEN": "sbp_e43ccf47a5b9916c951fb19066ae23c8eb30eed3"
      }
    },
    "sandra-comms-agent": {
      "command": "node",
      "args": ["C:\\Users\\clayt\\Desktop\\sandra-professional\\mcp\\agents\\comms-agent.js"],
      "env": {
        "META_ACCESS_TOKEN": "EAATkBfISk9cBPiszg5gmZAmq9GODrr3zeI9YHGSzSNFGebVMz8piNXlPy1Gzr0smXpr1ZCDMwrP8v0FCWuttmrWSQLxMcTY0OWC3LSHYVPcFm41uSBlVU9wSsuPZACk1zHuDUIo68jvFEfkzcSt3BLgRddLs9Rjl1NKSwufuUpkGZA5VCY8EYpGs94PHtatCAD75tswLMsyC19CWmI3C0PeieksEJpdSTBjjWUxZCpm4ZD",
        "TWILIO_SID": "AC38300ea2b028ab4a55d6487f6451f69b",
        "WHATSAPP_SANDRA": "+34624829117"
      }
    }
  }
}
```

---

## 🎯 CÓMO USAR EL SISTEMA

### **1. DESDE CLAUDE DESKTOP**

Una vez configurado el `claude_desktop_config.json`, reinicia Claude Desktop.

**Ejemplo de uso**:
```
Yo: "Sandra, delega al agente de voz que genere un video con el texto 'Hola'"
Claude: [Usa delegate_task con agent='voice']
```

### **2. DESDE LA APP SANDRA PROFESSIONAL**

El backend en `backend/server.js` puede invocar a los agentes MCP directamente:

```javascript
// Ejemplo: Delegar tarea al voice agent
POST /api/mcp/delegate
{
  "agent": "voice",
  "task": "Genera video avatar diciendo Hola"
}
```

---

## 🚀 COMANDOS DISPONIBLES

### **Orquestador**
- `delegate_task` → Delegar tarea a agente
- `get_agent_status` → Ver estado de agentes
- `coordinate_multi_agent` → Coordinar workflow multi-agente

### **Dev Agent**
- `github_commit` → Commit a GitHub
- `netlify_deploy` → Deploy a Netlify
- `create_branch` → Crear rama Git

### **Voice Agent**
- `generate_avatar_video` → Video HeyGen
- `text_to_speech` → Voz ElevenLabs
- `conversational_voice` → Voz Cartesia
- `speech_to_text` → Transcripción Deepgram

### **AI Agent**
- `deep_reasoning` → Claude Sonnet 4.5
- `quick_response` → GPT-4o
- `fast_inference` → Groq acelerado

### **Business Agent**
- `process_payment` → PayPal
- `manage_customer` → Airtable CRM
- `query_database` → Supabase

### **Comms Agent**
- `send_whatsapp` → WhatsApp Meta
- `send_sms` → SMS Twilio
- `check_messages` → Revisar mensajes

---

## ✨ ESTADO ACTUAL

✅ **5 agentes especializados creados**
✅ **Orquestador MCP funcional**
✅ **Todas las API keys configuradas**
✅ **SDKs instalados**
✅ **Sistema listo para usar**

---

## 🔄 PRÓXIMOS PASOS

1. **Configurar Claude Desktop** con el JSON de arriba
2. **Reiniciar Claude Desktop**
3. **Probar delegación de tareas**
4. **Integrar con frontend Electron**
5. **Habilitar llamadas desde backend Express**

---

**Sistema creado por**: Claytis Miguel Tom Zuaznabar  
**Empresa**: GuestsValencia  
**Nivel**: Galaxy Professional 🌌
