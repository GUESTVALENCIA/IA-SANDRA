# 🤖 Chatbot Turístico - README Completo

## ✅ IMPLEMENTACIÓN COMPLETA

Sistema de chatbot turístico integrado con **Sandra IA** para:
- 📱 **WhatsApp** - Mensajes automáticos
- 📞 **Llamadas telefónicas** - Respuestas por voz

---

## 📁 Estructura de Archivos

```
extracted_app/
├── api/
│   ├── twilio-whatsapp.js          # Webhook WhatsApp
│   ├── twilio-voice.js             # Webhook llamadas entrantes
│   ├── twilio-voice-process.js     # Procesa audio (STT→GPT→TTS)
│   └── twilio-voice-followup.js    # Maneja respuestas durante llamada
│
├── data/
│   └── tourist-activities.js       # Base de datos 10 actividades Valencia
│
├── orchestrator/
│   └── tourist-activity-handler.js # Búsqueda inteligente actividades
│
└── CHATBOT_TURISTICO_COMPLETO.md   # Este archivo
```

---

## 🎯 Funcionalidades

### **WhatsApp:**
- ✅ Recibe mensajes de WhatsApp vía Twilio
- ✅ Búsqueda inteligente en base de datos de actividades
- ✅ Si no encuentra en BD, usa GPT-4o con contexto turístico
- ✅ Respuestas formateadas con emojis
- ✅ Límite de 4000 caracteres (WhatsApp permite 4096)

### **Llamadas Telefónicas:**
- ✅ Recibe llamadas
- ✅ Graba audio del usuario (max 30 segundos)
- ✅ STT: Deepgram convierte voz → texto
- ✅ GPT-4o genera respuesta inteligente
- ✅ TTS: Cartesia convierte texto → voz natural
- ✅ Menús interactivos (DTMF: presionar 1, 2, etc.)
- ✅ Conversación continua hasta que el usuario cuelga

---

## 🔑 Variables de Entorno

Agregar en **Vercel Dashboard** > Environment Variables:

```env
# Twilio (NUEVAS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Ya las tienes configuradas:
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
CARTESIA_API_KEY=...
```

---

## 🔧 Configuración en Twilio

### **1. WhatsApp Webhook**

1. Ve a **Twilio Console** > **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Conecta tu número de prueba (Sandbox)
3. En **Webhook URL**:
   ```
   https://tu-dominio.vercel.app/api/twilio-whatsapp
   ```
4. Method: `POST`
5. Guarda

### **2. Voice Webhook**

1. Ve a **Twilio Console** > **Phone Numbers** > **Manage** > **Active Numbers**
2. Selecciona tu número telefónico
3. En **Voice Configuration**:
   - **A CALL COMES IN**: 
     ```
     https://tu-dominio.vercel.app/api/twilio-voice
     ```
   - Method: `POST`
4. Guarda

---

## 🧪 Testing

### **WhatsApp (Sandbox):**

1. Envía mensaje a: `whatsapp:+14155238886` (número de prueba)
2. Mensajes de prueba:
   - "Hola, quiero ver actividades en Valencia"
   - "Información sobre el Oceanográfico"
   - "Actividades gratuitas"
3. Deberías recibir respuesta automática

### **Llamada Telefónica:**

1. Llama a tu número Twilio
2. Escucha el mensaje de bienvenida
3. Habla: "Información sobre el Oceanográfico"
4. Sandra responderá por voz con información

---

## 📊 Base de Datos de Actividades

Actualmente incluye **10 actividades turísticas en Valencia**:

| ID | Nombre | Categoría | Precio |
|---|---|---|---|
| city-arts-sciences | Ciudad de las Artes y las Ciencias | cultura | Desde 8€ |
| oceanografic | Oceanográfico | naturaleza | 31.30€ |
| bioparc | Bioparc Valencia | naturaleza | 23.80€ |
| albufera | Albufera de Valencia | naturaleza | Paseo 4€ |
| fallas | Museo de las Fallas | cultura | 2€ |
| cathedral | Catedral de Valencia | religioso | 8€ |
| central-market | Mercado Central | gastronomia | Gratis |
| turia-garden | Jardín del Turia | naturaleza | Gratis |
| silk-exchange | Lonja de la Seda | cultura | 2€ |
| beaches | Playas de Valencia | naturaleza | Gratis |

**Para agregar más actividades:** Edita `data/tourist-activities.js`

---

## 💡 Características Avanzadas

### **Búsqueda Inteligente:**
- Busca por nombre: "Oceanográfico"
- Busca por categoría: "actividades culturales"
- Busca por precio: "actividades gratuitas"
- Busca por palabras clave: "museo", "playa", "naturaleza"

### **Integración con Sandra IA:**
- Si no encuentra en BD, usa GPT-4o con contexto turístico
- Rol específico: `guests-valencia`
- Personalización según plataforma (WhatsApp vs Voz)

### **Fallbacks:**
- Si Deepgram falla → usa transcripción de Twilio
- Si Cartesia falla → usa TTS de Twilio (Polly)
- Si Sandra IA falla → mensaje de error amigable

---

## 🚀 Deploy

1. **Commit y push:**
   ```bash
   git add .
   git commit -m "Chatbot turístico: WhatsApp + Voice con Twilio"
   git push origin main
   ```

2. **Vercel deploy automático** (si está conectado a GitHub)

3. **Agregar variables Twilio** en Vercel Dashboard

4. **Configurar webhooks** en Twilio Dashboard

5. **¡Probar!** 🎉

---

## 📞 Soporte

Si hay problemas:
1. Revisa logs en Vercel Dashboard
2. Revisa logs en Twilio Console
3. Verifica que las variables estén configuradas
4. Verifica que los webhooks apunten a la URL correcta

---

**¡Todo listo para funcionar!** 🚀

