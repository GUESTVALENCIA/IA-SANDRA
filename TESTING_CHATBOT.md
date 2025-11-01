# 🧪 Testing del Chatbot Turístico

## 📱 Testing WhatsApp

### **Opción 1: Twilio Sandbox (Gratis para testing)**

1. Ve a **Twilio Console** > **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Conecta tu número WhatsApp personal al Sandbox
3. Envía mensaje de prueba:
   ```
   join <codigo-sandbox>
   ```
4. Una vez conectado, envía:
   - "Hola, quiero ver actividades en Valencia"
   - "Información sobre el Oceanográfico"
   - "Actividades gratuitas"

### **Opción 2: WhatsApp Business API (Producción)**

Requiere:
- Tu cuenta de WhatsApp Business aprobada por Meta
- Webhook configurado en Twilio Dashboard
- URL: `https://tu-dominio.vercel.app/api/twilio-whatsapp`

---

## 📞 Testing Llamadas Telefónicas

### **Opción 1: Número de Prueba Twilio**

1. Twilio te da un número de prueba gratis
2. Llama a ese número desde tu teléfono
3. Di: "Información sobre el Oceanográfico"
4. Escucha la respuesta de Sandra

### **Opción 2: Tu Número Twilio**

1. Compra un número en Twilio (~$1/mes)
2. Configura webhook en Twilio Dashboard:
   - **A CALL COMES IN**: `https://tu-dominio.vercel.app/api/twilio-voice`
3. Llama a tu número
4. Prueba diferentes consultas:
   - "Actividades culturales"
   - "Qué hacer en Valencia gratis"
   - "Información sobre playas"

---

## ✅ Checklist de Testing

### **WhatsApp:**
- [ ] Mensaje recibido correctamente
- [ ] Búsqueda de actividades funciona
- [ ] Respuesta formateada con emojis
- [ ] Si no encuentra actividad, usa GPT-4o
- [ ] Respuestas no exceden 4000 caracteres

### **Llamadas:**
- [ ] Llamada se recibe
- [ ] Mensaje de bienvenida se reproduce
- [ ] Audio del usuario se graba
- [ ] STT convierte voz a texto correctamente
- [ ] GPT-4o genera respuesta adecuada
- [ ] TTS reproduce respuesta (o usa Twilio Polly)
- [ ] Menú interactivo funciona (DTMF)

---

## 🔧 Troubleshooting

### **"Invalid Twilio signature"**
- Verifica que `TWILIO_AUTH_TOKEN` esté correcto
- En desarrollo, se permite continuar aunque falle

### **"Orchestrator not initialized"**
- Verifica que las variables de entorno estén configuradas
- Revisa logs en Vercel

### **"No activities found"**
- Verifica que `data/tourist-activities.js` existe
- Prueba búsquedas más generales

### **Audio no se reproduce**
- Verifica que Cartesia esté configurado
- Si falla, usa TTS de Twilio (Polly) como fallback

---

## 📊 Monitoreo

Revisa logs en:
1. **Vercel Dashboard** > Functions > Logs
2. **Twilio Console** > Monitor > Logs

Busca:
- `[TWILIO-WHATSAPP]` - Mensajes WhatsApp
- `[TWILIO-VOICE]` - Llamadas
- `[TWILIO-VOICE-PROCESS]` - Procesamiento de audio

---

**¡Listo para probar!** 🚀

