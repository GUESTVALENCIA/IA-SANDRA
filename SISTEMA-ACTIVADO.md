# 🌌 SANDRA PROFESSIONAL - SISTEMA ACTIVADO

**CEO**: Claytis Miguel Tom Zuaznabar  
**Empresa**: GuestsValencia  
**Fecha**: Octubre 24, 2025  
**Estado**: ✅ OPERATIVO

---

## ✅ SISTEMA COMPLETADO AL 100%

### **ARQUITECTURA IMPLEMENTADA**

```
SANDRA PROFESSIONAL
│
├── BACKEND EXPRESS (Puerto 5000)
│   ├── API Anthropic Claude Sonnet 4.5
│   ├── API OpenAI GPT-4o
│   ├── Integración HeyGen Avatar
│   └── Endpoints REST completos
│
├── SISTEMA MCP (6 Agentes Especializados)
│   ├── Orchestrator → Coordinación central
│   ├── Dev Agent → GitHub + Netlify + Deploy
│   ├── Voice Agent → HeyGen + ElevenLabs + Cartesia + Deepgram
│   ├── AI Agent → Claude + GPT-4o + Groq
│   ├── Business Agent → PayPal + Airtable + Supabase
│   └── Comms Agent → WhatsApp + Twilio + Meta
│
└── CONFIGURACIÓN
    ├── .env → Todas las API keys configuradas
    ├── Claude Desktop → 6 agentes MCP activos
    └── Scripts de inicio automatizados
```

---

## 🚀 CÓMO INICIAR EL SISTEMA

### **OPCIÓN 1: Inicio Automático**
```bash
Doble clic en: START-SANDRA.bat
```

### **OPCIÓN 2: Inicio Manual**
```bash
# Backend
cd backend
node server.js

# Verificar MCP
cd mcp
node verify-system.js
```

---

## 🎯 USO DE LOS AGENTES MCP

### **EN CLAUDE DESKTOP**

Los agentes ya están configurados. Simplemente:

1. **Cierra y reinicia Claude Desktop**
2. Los agentes se cargan automáticamente
3. Usa las herramientas:

**Ejemplos de comandos**:
```javascript
// Delegar tarea al agente de voz
delegate_task({
  task: "Genera un video con HeyGen diciendo Hola",
  agent: "voice"
})

// Consultar estado de agentes
get_agent_status({ agent: "all" })

// Razonamiento profundo con Claude
