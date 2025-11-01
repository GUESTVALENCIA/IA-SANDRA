# 📱 Actualizar Webhooks de Twilio para Producción

## 🎯 Objetivo

Actualizar los webhooks de Twilio para que apunten al dominio de producción: `https://sandra.guestsvalencia.es`

---

## 🔗 URLs de Producción

### **WhatsApp Webhook:**
```
https://sandra.guestsvalencia.es/api/twilio-whatsapp
```

### **Voice Webhook:**
```
https://sandra.guestsvalencia.es/api/twilio-voice
```

---

## 📋 Pasos para Actualizar en Twilio

### **Paso 1: Acceder a Twilio Console**

1. Ve a: **https://console.twilio.com**
2. Inicia sesión con tu cuenta

### **Paso 2: Configurar WhatsApp Webhook**

1. Ve a: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. O ve a: **Phone Numbers** → **Manage** → **Active numbers**
3. Busca tu número de WhatsApp de Twilio
4. Haz clic en el número
5. Busca la sección **"WhatsApp Configuration"**
6. En **"A MESSAGE COMES IN"**, cambia la URL a:
   ```
   https://sandra.guestsvalencia.es/api/twilio-whatsapp
   ```
7. Selecciona **HTTP POST**
8. Guarda los cambios

### **Paso 3: Configurar Voice Webhook**

1. Ve a: **Phone Numbers** → **Manage** → **Active numbers**
2. Busca tu número de teléfono (voice) de Twilio
3. Haz clic en el número
4. Busca la sección **"Voice & Fax"**
5. En **"A CALL COMES IN"**, cambia la URL a:
   ```
   https://sandra.guestsvalencia.es/api/twilio-voice
   ```
6. Selecciona **HTTP POST**
7. Guarda los cambios

---

## ✅ Verificación

### **Prueba WhatsApp:**

1. Envía un mensaje de WhatsApp a tu número de Twilio
2. El mensaje debería ser procesado por Sandra IA
3. Deberías recibir una respuesta

### **Prueba Voice:**

1. Llama a tu número de Twilio
2. Deberías escuchar el saludo de Sandra
3. Puedes hacer una pregunta y recibir respuesta

---

## 📝 Notas Importantes

- ⚠️ **Asegúrate de que el dominio esté verificado en Vercel** antes de actualizar
- 🔒 **HTTPS es obligatorio** para webhooks de Twilio
- ⏰ **Los cambios pueden tardar unos minutos en propagarse**

---

## 🆘 Troubleshooting

### **Webhook no funciona:**
1. Verifica que la URL sea exactamente: `https://sandra.guestsvalencia.es/api/twilio-whatsapp`
2. Verifica que el dominio esté funcionando
3. Revisa los logs en Vercel Dashboard → Functions

### **Error 404:**
1. Verifica que las funciones estén deployadas en Vercel
2. Verifica la ruta: debe ser `/api/twilio-whatsapp` (sin `/` al final)

---

**¡Webhooks actualizados para producción!** 🚀📱

