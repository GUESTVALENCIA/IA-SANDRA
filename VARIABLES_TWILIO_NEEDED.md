# 🔑 Variables de Twilio Necesarias

## Variables a agregar en Vercel Dashboard

Ve a: **Vercel Dashboard** > Tu proyecto > **Settings** > **Environment Variables**

Agrega estas 4 variables:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## 📍 Dónde encontrarlas en Twilio

1. **TWILIO_ACCOUNT_SID**: 
   - Twilio Console > Dashboard > Account Info > Account SID

2. **TWILIO_AUTH_TOKEN**: 
   - Twilio Console > Dashboard > Account Info > Auth Token
   - ⚠️ Si no la ves, haz clic en "View" para revelarla

3. **TWILIO_PHONE_NUMBER**: 
   - Tu número telefónico (ej: +1234567890)
   - Twilio Console > Phone Numbers > Manage > Active Numbers

4. **TWILIO_WHATSAPP_NUMBER**: 
   - Para testing: `whatsapp:+14155238886` (Sandbox)
   - Para producción: `whatsapp:+TUNUMERO` (cuando actives WhatsApp Business)

---

## ✅ Variables Ya Configuradas (No tocar)

Estas ya las tienes y funcionan:
- `OPENAI_API_KEY` ✅
- `DEEPGRAM_API_KEY` ✅
- `CARTESIA_API_KEY` ✅
- `HEYGEN_API_KEY` ✅ (no se usa en chatbot, pero está)

---

**Después de agregar las variables, reinicia el deploy en Vercel** 🔄

