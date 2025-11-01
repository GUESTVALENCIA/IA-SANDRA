# 📱 Configuración Twilio para Chatbot Turístico

## ✅ Lo que está implementado

1. **WhatsApp Webhook**: `/api/twilio-whatsapp`
   - Recibe mensajes de WhatsApp
   - Integrado con Sandra IA
   - Base de datos de actividades turísticas

2. **Voice Webhook**: `/api/twilio-voice`
   - Maneja llamadas telefónicas
   - STT (Deepgram) → GPT-4o → TTS (Cartesia)

3. **Base de datos**: `data/tourist-activities.js`
   - 10 actividades turísticas en Valencia
   - Búsqueda por nombre, categoría, precio

---

## 🔧 Configuración en Twilio Dashboard

### **WhatsApp**

1. Ve a **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Conecta tu número de prueba
3. Configura webhook:
   - **URL**: `https://tu-dominio.com/api/twilio-whatsapp`
   - **Method**: `POST`
   - **Status callback**: (opcional)

### **Voice**

1. Ve a **Phone Numbers** > **Manage** > **Active Numbers**
2. Selecciona tu número
3. Configura webhooks:
   - **A CALL COMES IN**: `https://tu-dominio.com/api/twilio-voice`
   - **CALL STATUS CHANGES**: (opcional)

---

## 🔑 Variables de Entorno Requeridas

Agrega estas variables en Vercel/Netlify:

```env
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Ya las tienes:
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
CARTESIA_API_KEY=...
```

---

## 🧪 Testing

### **WhatsApp (Sandbox)**

1. Envía mensaje a: `whatsapp:+14155238886` (número de prueba)
2. Mensaje: "Hola, quiero ver actividades en Valencia"
3. Deberías recibir respuesta con actividades

### **Voice**

1. Llama a tu número Twilio
2. Di: "Quiero información sobre el Oceanográfico"
3. Sandra responderá por voz

---

## 📊 Endpoints Creados

- `POST /api/twilio-whatsapp` - Recibe mensajes WhatsApp
- `POST /api/twilio-voice` - Maneja llamadas entrantes
- `POST /api/twilio-voice/process` - Procesa audio grabado
- `POST /api/twilio-voice/followup` - Maneja respuestas DTMF

---

## 🚀 Próximos Pasos

1. **Agregar variables Twilio** a Vercel
2. **Configurar webhooks** en Twilio Dashboard
3. **Probar WhatsApp** con Sandbox
4. **Probar llamada** telefónica

**¿Necesitas ayuda con algún paso?** 🎯

