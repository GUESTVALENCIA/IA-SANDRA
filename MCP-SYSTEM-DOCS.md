# 🚀 SANDRA IA - SISTEMA MCP PROFESIONAL

## Sistema de Subagentes Inteligentes con Anthropic SDK

**Empresa:** GuestsValencia.es  
**CEO:** Claytis Miguel Tom Zuaznabar  
**Arquitectura:** Galaxy Level - Producción Lista

---

## 📋 ÍNDICE

1. [¿Qué es el Sistema MCP?](#qué-es-el-sistema-mcp)
2. [Subagentes Disponibles](#subagentes-disponibles)
3. [Endpoints API](#endpoints-api)
4. [Pruebas del Sistema](#pruebas-del-sistema)
5. [Uso en Frontend](#uso-en-frontend)

---

## 🧠 ¿QUÉ ES EL SISTEMA MCP?

**MCP (Model Context Protocol)** es la arquitectura que permite a Sandra IA operar con múltiples subagentes especializados, cada uno experto en su dominio.

### Ventajas:
✅ **Razonamiento Profundo** - Claude Sonnet 4.5 para análisis complejos  
✅ **Respuestas Rápidas** - GPT-4o para chat conversacional  
✅ **Código Profesional** - Desarrollador experto nivel Galaxy  
✅ **Routing Inteligente** - Detección automática del tipo de tarea  
✅ **Memoria Compartida** - Contexto persistente entre subagentes  

---

## 🤖 SUBAGENTES DISPONIBLES

### 1. **CEREBRO PRINCIPAL** 
- **Modelo:** Claude Sonnet 4.5
- **Función:** Razonamiento profundo, análisis estratégico
- **Uso:** Tareas complejas, arquitectura, decisiones críticas
- **Endpoint:** `/api/sandra/cerebro`

### 2. **CONVERSACIÓN**
- **Modelo:** GPT-4o
- **Función:** Chat natural, atención al cliente
- **Uso:** Interacciones rápidas, soporte, multimodal
- **Endpoint:** `/api/sandra/conversacion`

### 3. **DESARROLLADOR**
- **Modelo:** Claude Sonnet 4.5 (modo Dev)
- **Función:** Código producción, arquitectura técnica
- **Uso:** Desarrollo full-stack, APIs, debugging
- **Endpoint:** `/api/sandra/dev`

---

## 🌐 ENDPOINTS API

### 🔵 Endpoint Principal (Auto-Routing)

```javascript
POST http://localhost:5000/api/sandra

Body:
{
  "message": "Tu mensaje aquí",
  "taskType": "auto",  // auto | conversacion | razonamiento | desarrollo
  "context": {}
}

Respuesta:
{
  "success": true,
  "subagent": "cerebro",
  "response": "Respuesta del subagente...",
  "model": "claude-sonnet-4-5-20250929",
  "usage": { "input_tokens": 100, "output_tokens": 200 }
}
```

### 🧠 Cerebro (Razonamiento Profundo)

```javascript
POST http://localhost:5000/api/sandra/cerebro

Body:
{
  "message": "Analiza la arquitectura para escalar a 1000 propiedades",
  "context": {}
}
```

### 💬 Conversación (Chat Natural)

```javascript
POST http://localhost:5000/api/sandra/conversacion

Body:
{
  "message": "Hola Sandra, ¿qué apartamentos tienes disponibles?",
  "context": {}
}
```

### 💻 Desarrollador (Código Profesional)

```javascript
POST http://localhost:5000/api/sandra/dev

Body:
{
  "task": "Crea endpoint para check-in con validación DNI",
  "context": {
    "framework": "Express.js",
    "database": "PostgreSQL"
  }
}
```

### 🤝 Colaborativo (Multi-Subagente)

```javascript
POST http://localhost:5000/api/sandra/colaborativo

Body:
{
  "task": "Sistema de reservas con pasarela de pago",
  "subagents": ["cerebro", "desarrollador"]
}

Respuesta:
{
  "success": true,
  "results": {
    "cerebro": { response: "Plan estratégico...", ... },
    "desarrollador": { response: "Código implementado...", ... }
  }
}
```

### 📊 Estado del Sistema

```javascript
GET http://localhost:5000/api/sandra/status

Respuesta:
{
  "success": true,
  "anthropicConnected": true,
  "openaiConnected": true,
  "conversationLength": 4,
  "memorySize": 2,
  "subagentsAvailable": 3
}
```

---

## 🧪 PRUEBAS DEL SISTEMA

### Paso 1: Verificar API Keys

Asegúrate de tener en `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxx...
OPENAI_API_KEY=sk-proj-xxx...
```

### Paso 2: Ejecutar Test Completo

```bash
node test-mcp.js
```

**Tests incluidos:**
1. ✅ Conversación natural
2. ✅ Razonamiento profundo
3. ✅ Desarrollo de código
4. ✅ Colaboración multi-subagente

### Paso 3: Iniciar Backend

```bash
cd backend
node server.js
```

Debe mostrar:
```
🚀 Sandra Professional Backend
📡 Servidor activo en http://localhost:5000
✅ Servicios conectados:
   - OpenAI (GPT-4o)
   - Anthropic (Claude Sonnet 4.5)
   - Sistema MCP inicializado
```

---

## 💻 USO EN FRONTEND

### Ejemplo con Fetch API

```javascript
async function consultarSandra(mensaje, tipo = 'auto') {
  try {
    const response = await fetch('http://localhost:5000/api/sandra', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: mensaje,
        taskType: tipo
      })
    });
    
    const data = await response.json();
    console.log(`Subagente usado: ${data.subagent}`);
    console.log(`Respuesta: ${data.response}`);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uso
await consultarSandra("Hola Sandra, ¿cómo funciona el check-in?");
```

### Ejemplo para Desarrollo

```javascript
async function solicitarCodigo(tarea) {
  const response = await fetch('http://localhost:5000/api/sandra/dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task: tarea,
      context: {
        framework: 'React',
        apis: ['Anthropic', 'Supabase']
      }
    })
  });
  
  const { response: codigo } = await response.json();
  console.log(codigo);
}

// Uso
await solicitarCodigo("Crea componente React para reservas");
```

---

## 🎯 CASOS DE USO

### 1. Chat con Huéspedes
```javascript
// Usa auto-routing (detecta conversación)
POST /api/sandra
{ "message": "¿A qué hora es el check-in?" }
→ Responde: Conversación (GPT-4o, rápido)
```

### 2. Análisis de Negocio
```javascript
// Fuerza razonamiento profundo
POST /api/sandra/cerebro
{ "message": "Optimiza precios según temporada" }
→ Responde: Cerebro (Claude, análisis detallado)
```

### 3. Desarrollo Técnico
```javascript
// Código producción listo
POST /api/sandra/dev
{ "task": "API para gestión de propiedades" }
→ Responde: Desarrollador (código completo)
```

### 4. Proyecto Complejo
```javascript
// Múltiples subagentes colaboran
POST /api/sandra/colaborativo
{ 
  "task": "Plataforma reservas con IA",
  "subagents": ["cerebro", "desarrollador"]
}
→ Plan estratégico + Implementación completa
```

---

## 🔧 TROUBLESHOOTING

### Error: "ANTHROPIC_API_KEY not found"
✅ Verifica que `.env` tiene la key correcta

### Error: "Cannot find module '@anthropic-ai/sdk'"
✅ Ejecuta: `cd backend && npm install`

### Subagente no responde
✅ Revisa `/api/sandra/status` para ver estado

### Respuestas lentas
✅ Normal en primera llamada (carga de modelo)
✅ Posteriores llamadas son más rápidas

---

## 📊 MONITOREO

### Health Check Completo
```bash
curl http://localhost:5000/health
```

### Estado Sistema MCP
```bash
curl http://localhost:5000/api/sandra/status
```

---

## 🚀 PRÓXIMOS PASOS

1. ✅ **Sistema MCP** → Implementado
2. ⏳ **Frontend Electron** → Integración visual
3. ⏳ **Avatar HeyGen** → Video sincronizado
4. ⏳ **Voz Neural** → TTS/STT completo
5. ⏳ **Base de Datos** → Supabase + memoria persistente

---

## 👨‍💼 CONTACTO

**CEO:** Claytis Miguel Tom Zuaznabar  
**Proyecto:** GuestsValencia.es  
**Arquitectura:** Sandra IA Professional Galaxy

**¡Sistema MCP operativo y listo para producción! 🎉**
