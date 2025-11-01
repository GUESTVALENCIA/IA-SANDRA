# 🧪 Guía de Testing - Chatbot Turístico

## ✅ Pre-requisitos

1. ✅ Variables Twilio agregadas en Vercel
2. ✅ Deploy completado en Vercel
3. ✅ Webhooks configurados en Twilio Dashboard

---

## 📱 Testing WhatsApp

### **1. Configurar Webhook en Twilio**

1. Ve a **Twilio Console** > **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Busca **"Sandbox"** o **"WhatsApp Sandbox"**
3. Verás un código como: `join XXXXX`
4. Envía ese código a `+1 415 523 8886` desde WhatsApp para activar Sandbox

5. **Configurar Webhook:**
   - En **"When a message comes in"**:
     ```
     https://tu-dominio.vercel.app/api/twilio-whatsapp
     ```
   - Method: `POST`
   - Guarda

### **2. Probar WhatsApp**

**Desde tu WhatsApp personal:**

1. Envía mensaje a: `+1 415 523 8886` (número Sandbox de Twilio)
2. Mensajes de prueba:
   ```
   join XXXXX        (código que te da Twilio para activar)
   Hola
   Quiero ver actividades en Valencia
   Información sobre el Oceanográfico
   Actividades gratuitas
   ```

3. **Respuesta esperada:**
   - Deberías recibir respuesta automática de Sandra
   - Si pregunta sobre actividades, recibirás lista formateada

---

## 📞 Testing Llamadas Telefónicas

### **1. Configurar Webhook en Twilio**

1. Ve a **Twilio Console** > **Phone Numbers** > **Manage** > **Active Numbers**
2. Haz clic en tu número telefónico
3. En **"Voice Configuration"**:
   - **A CALL COMES IN**: 
     ```
     https://tu-dominio.vercel.app/api/twilio-voice
     ```
   - Method: `POST`
   - Guarda

### **2. Probar Llamada**

1. **Llama a tu número Twilio** desde cualquier teléfono

2. **Escucharás:**
   - Mensaje de bienvenida automático

3. **Di algo como:**
   - "Hola, información sobre actividades en Valencia"
   - "Quiero saber sobre el Oceanográfico"
   - "Actividades culturales"

4. **Sandra responderá:**
   - Por voz con la información solicitada
   - Te preguntará si necesitas más ayuda
   - Presiona 1 para más ayuda, 2 para finalizar

---

## 🔍 Verificar Logs

### **Vercel Logs:**
1. Ve a **Vercel Dashboard** > Tu proyecto > **Functions** > **Logs**
2. Busca logs que empiecen con `[TWILIO-WHATSAPP]` o `[TWILIO-VOICE]`

### **Twilio Logs:**
1. Ve a **Twilio Console** > **Monitor** > **Logs**
2. Verás todos los mensajes/llamadas recibidas
3. Revisa si hay errores

---

## 🐛 Troubleshooting

### **Error: "Variables Twilio no configuradas"**
- ✅ Verifica que agregaste las variables en Vercel
- ✅ Reinicia el deploy después de agregar variables

### **WhatsApp no responde**
- ✅ Verifica que el webhook esté configurado correctamente
- ✅ Verifica que la URL sea accesible (debe ser HTTPS)
- ✅ Verifica que el número esté en el Sandbox

### **Llamada no funciona**
- ✅ Verifica que el webhook de voz esté configurado
- ✅ Verifica que el número tenga capacidad de voz activada

### **Error 500 en logs**
- ✅ Revisa logs de Vercel para ver el error exacto
- ✅ Verifica que todas las variables de APIs estén configuradas
- ✅ Verifica que Sandra Orchestrator se inicialice correctamente

---

## ✅ Checklist de Testing

- [ ] Variables Twilio agregadas en Vercel
- [ ] Deploy completado sin errores
- [ ] Webhook WhatsApp configurado en Twilio
- [ ] Webhook Voice configurado en Twilio
- [ ] Probar mensaje WhatsApp → Recibe respuesta
- [ ] Probar llamada → Escucha respuesta por voz
- [ ] Verificar logs en Vercel (sin errores)

---

**¡Listo para probar!** 🚀
