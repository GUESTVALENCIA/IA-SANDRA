# 🤖 Chatbot Turístico: Llamadas + WhatsApp

## 🎯 Objetivo
Chatbot que responde automáticamente:
- ✅ **Llamadas telefónicas** (con voz natural)
- ✅ **Mensajes de WhatsApp**
- Para **actividades turísticas** (Guests Valencia)

---

## 🏗️ Arquitectura

```
WhatsApp/Llamada → Twilio → Webhook → Sandra IA → GPT-4o → Respuesta → Twilio → Usuario
```

---

## 🛠️ Stack Tecnológico

### Ya Tienes ✅
- **Sandra IA** (orquestador)
- **GPT-4o** (respuestas inteligentes)
- **Deepgram** (voz → texto)
- **Cartesia** (texto → voz)

### Necesitas Añadir 🔧
- **Twilio Account** (WhatsApp + Voice API)
- **Webhook endpoints** (`/api/twilio/whatsapp`, `/api/twilio/voice`)
- **Base de datos** de actividades turísticas

---

## 📋 Implementación Paso a Paso

### **Fase 1: WhatsApp (Más Fácil)** ⏱️ 2-3 horas

1. **Crear cuenta Twilio**
   - https://www.twilio.com
   - Activar WhatsApp Sandbox (gratis para testing)

2. **Crear webhook endpoint**
   - `POST /api/twilio/whatsapp`
   - Recibe mensajes de WhatsApp
   - Envía a Sandra IA → GPT-4o
   - Responde por WhatsApp

3. **Integrar con Sandra IA**
   - Usar `orchestrator.processMessage()`
   - Context: actividades turísticas

---

### **Fase 2: Llamadas Telefónicas** ⏱️ 4-5 horas

1. **Configurar Twilio Voice**
   - Número telefónico ($1/mes)
   - Voice API activada

2. **Crear webhook para llamadas**
   - `POST /api/twilio/voice/incoming` (llamada entrante)
   - `POST /api/twilio/voice/status` (estado de llamada)

3. **Pipeline de audio**:
   ```
   Audio recibido → Deepgram STT → Texto
   Texto → GPT-4o → Respuesta
   Respuesta → Cartesia TTS → Audio
   Audio → Twilio → Enviar al teléfono
   ```

4. **Twilio TwiML** (para controlar llamada)
   - `<Record>` para capturar audio
   - `<Play>` para reproducir respuesta

---

## 💰 Costos Estimados

**Twilio:**
- WhatsApp: **$0.005/mensaje**
- Llamadas: **$0.013/minuto**
- Número: **~$1/mes**

**Ejemplo (1000 usuarios/mes):**
- 5000 mensajes WhatsApp: **$25**
- 500 horas llamadas: **$65**
- **Total: ~$91/mes**

---

## 🚀 Código Base

Voy a crear:
1. ✅ Endpoint `/api/twilio/whatsapp`
2. ✅ Endpoint `/api/twilio/voice`
3. ✅ Integración con Sandra IA
4. ✅ Base de datos simple de actividades

**¿Quieres que empiece ahora?** 🎯

