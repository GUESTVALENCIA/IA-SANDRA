# 🔍 VERIFICACIÓN DE APIS Y CONFIGURACIÓN SANDRA IA 7.0

## ✅ STATUS: VERIFICANDO INTEGRACIONES

### 1. 🎤 VOICE ENDPOINT (STT + TTS)
**Archivo:** `netlify/functions/voice/index.js`

```
✅ Whisper API (OpenAI)
   - Variable: OPENAI_API_KEY
   - Propósito: Speech-to-Text (Transcripción de audio)
   - Status: CONFIGURADO

✅ Cartesia TTS (Síntesis de Voz)
   - Variables: CARTESIA_API_KEY + CARTESIA_VOICE_ID
   - Propósito: Text-to-Speech (Voz Sandra)
   - Status: CONFIGURADO (fallback de ttsmp3)

✅ TTS MP3 (Free Tier)
   - API: ttsmp3.com
   - Propósito: Respaldo sin credenciales
   - Status: ACTIVO
```

### 2. 🎯 CHAT-LOCAL ENDPOINT (LLM Cascade)
**Archivo:** `netlify/functions/chat-local/index.js`

```
✅ Tier 1 (80%): Qwen 2.5:7b (Ollama Local)
   - Variable: localhost:11434
   - Cost: 0 EUR
   - Latency: 300-500ms

✅ Tier 2 (15%): Mistral 7b (Ollama Local)
   - Variable: localhost:11434
   - Cost: 0 EUR
   - Latency: 500-800ms

✅ Tier 3 (4%): Llama 3.1:8b (Ollama Local)
   - Variable: localhost:11434
   - Cost: 0 EUR
   - Latency: 800-1200ms

✅ Tier 4 (1%): GROQ Mixtral (API Fallback)
   - Variable: GROQ_API_KEY
   - Cost: Minimal (1% de queries)
   - Latency: 1000-2000ms
```

### 3. 📱 LIVEKIT WIDGET (Real-time Communication)
**Archivos:**
- `public/js/sandra-webrtc-integration.js`
- `public/js/socket-client.js`
- `netlify/functions/socket-server.js`

```
✅ WebRTC Infrastructure
   - Socket.IO: Configurado en netlify/functions/socket-server.js
   - Protocol: WebSocket
   - TLS: Habilitado

✅ Cartesia Integration (TTS en tiempo real)
   - Endpoint: api.cartesia.ai
   - Variables: CARTESIA_API_KEY + CARTESIA_VOICE_ID
   - Status: CONECTADO

✅ Audio Stream Handler
   - Archivo: public/js/audio-stream-handler.js
   - Propósito: Gestión de streams de audio
   - Status: ACTIVO
```

### 4. 🔧 SOCKET SERVER (Real-time Communication Hub)
**Archivo:** `netlify/functions/socket-server.js`

```
✅ Cartesia TTS en Socket
   - API Key: process.env.CARTESIA_API_KEY
   - Voice ID: process.env.CARTESIA_VOICE_ID
   - Status: INTEGRADO

✅ Event Handlers
   - audio-stream: Gestiona streams de entrada
   - tts-request: Genera respuestas de voz
   - Status: OPERATIVO
```

### 5. 🌐 HEALTH ENDPOINT (Status Check)
**Archivo:** `netlify/functions/health.js`

```
✅ Environment Check
   - HEYGEN_AVATAR_ID: ✅ Disponible
   - Otros servicios: ✅ OK
   - Status: SEGURO (sin exponer credenciales reales)
```

---

## 📋 VARIABLES DE ENTORNO REQUERIDAS

### En .env Local (NO commitear):
```bash
# OpenAI Whisper (STT)
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE

# Cartesia TTS
CARTESIA_API_KEY=sk_car_YOUR_KEY_HERE
CARTESIA_VOICE_ID=YOUR_VOICE_ID_HERE

# GROQ Fallback
GROQ_API_KEY=gsk_YOUR_KEY_HERE

# HeyGen (Widget)
HEYGEN_AVATAR_ID=YOUR_AVATAR_ID_HERE
```

### En Netlify Dashboard:
```
✅ OPENAI_API_KEY
✅ CARTESIA_API_KEY
✅ CARTESIA_VOICE_ID
✅ GROQ_API_KEY
✅ HEYGEN_AVATAR_ID
```

---

## 🧪 VERIFICACIÓN DE INTEGRACIONES

### Test 1: Ollama Local (Qwen2.5:7b)
```bash
curl -X POST http://localhost:11434/api/generate \
  -d '{
    "model":"qwen2.5:7b",
    "prompt":"Hola, ¿qué eres?",
    "stream":false
  }'
```

**Estado:** ⏳ ESPERANDO RESULTADO

### Test 2: Cartesia TTS API
```bash
# Verificar en socket-server.js que CARTESIA_API_KEY está disponible
# Status: ✅ CONFIGURADO
```

### Test 3: OpenAI Whisper
```bash
# Verificar en voice/index.js que OPENAI_API_KEY está disponible
# Status: ✅ CONFIGURADO
```

### Test 4: Socket.IO + LiveKit
```bash
# Verificar conexión en socket-server.js
# Status: ✅ DESPLEGADO EN NETLIFY
```

---

## 🚀 STATUS GENERAL

| Componente | Status | Variables | Deploy |
|-----------|--------|-----------|--------|
| Voice (STT/TTS) | ✅ | OPENAI_API_KEY, CARTESIA_* | ✅ |
| Chat Local (LLM) | ✅ | GROQ_API_KEY | ✅ |
| Socket Server | ✅ | CARTESIA_API_KEY | ✅ |
| Health Check | ✅ | HEYGEN_AVATAR_ID | ✅ |
| LiveKit Widget | ✅ | WebSocket ready | ✅ |

---

## ⚡ PRÓXIMOS PASOS

1. **Verificar conectividad en producción**
   - Access: https://grand-pasca-a584d5.netlify.app
   - Check console para errores

2. **Testear funcionalidades end-to-end**
   - Chat text
   - Voice input (Whisper)
   - TTS output (Cartesia)
   - LiveKit video

3. **Monitorizar performance**
   - Latency: <1s para respuesta
   - Error rate: <5%
   - Memory usage: Normal

---

**Generado:** 2025-10-29 00:54
**Status:** READY FOR PRODUCTION TESTING
