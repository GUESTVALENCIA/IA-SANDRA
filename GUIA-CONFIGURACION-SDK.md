# ═══════════════════════════════════════════════════════
# SANDRA PROFESSIONAL - GUÍA DE CONFIGURACIÓN SDK
# Configuración de variables de entorno faltantes
# ═══════════════════════════════════════════════════════

## 🎯 OBJETIVO

Completar la configuración de las SDKs oficiales para que todos los servicios 
estén 100% operacionales.

## ✅ SERVICIOS YA CONFIGURADOS

Los siguientes servicios ya tienen sus API keys configuradas:

- ✅ Anthropic Claude Sonnet 4.5
- ✅ OpenAI GPT-4o
- ✅ Groq (Llama)
- ✅ HeyGen (Avatar + Video)
- ✅ ElevenLabs (Text-to-Speech)
- ✅ Cartesia (TTS Conversacional)
- ✅ Deepgram (Speech-to-Text)
- ✅ PayPal (Pagos)
- ✅ Meta (WhatsApp Business)
- ✅ GitHub (Repositorios)
- ✅ Netlify (Deploy)

## ⚙️ SERVICIOS QUE NECESITAN CONFIGURACIÓN

### 1. SUPABASE (Base de Datos)

**Variables necesarias en `.env`:**
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key-aqui
```

**Cómo obtenerlas:**
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a Settings > API
4. Copia:
   - `Project URL` → `SUPABASE_URL`
   - `anon/public key` → `SUPABASE_KEY`

---

### 2. AIRTABLE (CRM y Bases de Datos)

**Variables necesarias en `.env`:**
```env
AIRTABLE_BASE_ID=tu-base-id-aqui
```

**Cómo obtenerla:**
1. Ve a https://airtable.com/
2. Abre tu base
3. Ve a Help > API documentation
4. En la URL verás algo como: `https://airtable.com/appXXXXXXXXX/api/docs`
5. El `appXXXXXXXXX` es tu BASE_ID

---

### 3. TWILIO (SMS y WhatsApp)

**Variables necesarias en `.env`:**
```env
TWILIO_AUTH_TOKEN=tu-auth-token-aqui
```

**Cómo obtenerla:**
1. Ve a https://console.twilio.com/
2. En el Dashboard verás:
   - Account SID (ya configurado)
   - Auth Token (necesitas copiar este)
3. Copia el Auth Token → `TWILIO_AUTH_TOKEN`

---

## 🚀 PASOS PARA ACTIVAR TODO EL SISTEMA

### PASO 1: Completar las variables

Edita el archivo `.env` en la raíz del proyecto y completa las variables 
faltantes según las instrucciones anteriores.

### PASO 2: Reiniciar el servidor

```bash
# Si el servidor está corriendo, detenlo (Ctrl+C)
# Luego inícialo nuevamente:
node backend/server.js
```

O usa el batch file:
```
INICIAR-BACKEND.bat
```

### PASO 3: Ejecutar tests de integración

Abre otra terminal y ejecuta:
```bash
node test-integration.js
```

O usa el batch file:
```
TEST-INTEGRACION.bat
```

---

## 📊 VERIFICACIÓN DEL SISTEMA

El script de testing verificará:

1. ✅ Health check del servidor
2. ✅ Claude Sonnet 4.5 (conversación)
3. ✅ GPT-4o (conversación)
4. ✅ Groq (conversación)
5. ✅ ElevenLabs (text-to-speech)
6. ✅ Cartesia (text-to-speech)
7. ✅ HeyGen (video avatar)
8. ⚠️  Deepgram (requiere audio en base64)
9. ⚠️  Supabase (requiere URL y KEY)
10. ⚠️  Airtable (requiere BASE_ID)
11. ⚠️  PayPal (funcional pero en modo sandbox)
12. ⚠️  Twilio (requiere AUTH_TOKEN)

---

## 🎓 USO DE LAS APIS

### Ejemplo: Claude Sonnet 4.5

```javascript
POST http://localhost:5000/api/claude
Content-Type: application/json

{
  "message": "Hola Sandra, ¿cómo estás?",
  "context": [],
  "mode": "professional"
}
```

### Ejemplo: ElevenLabs TTS

```javascript
POST http://localhost:5000/api/voice/elevenlabs/speak
Content-Type: application/json

{
  "text": "Hola, soy Sandra de GuestsValencia",
  "voiceId": "06H5cbUvetCmVYi9HUXk"
}
```

### Ejemplo: Supabase Query

```javascript
POST http://localhost:5000/api/supabase/query
Content-Type: application/json

{
  "table": "bookings",
  "query": {
    "select": "*",
    "limit": 10
  }
}
```

---

## 🔧 TROUBLESHOOTING

### Error: "API Key inválida"
- Verifica que la variable en `.env` esté correcta
- Sin espacios antes o después del valor
- Sin comillas en los valores

### Error: "Cannot connect to database"
- Para Supabase: verifica URL y KEY
- Para Airtable: verifica BASE_ID

### Error: "Module not found"
- Ejecuta: `npm install`
- Verifica que estés en la carpeta correcta

### El servidor no inicia
- Verifica que el puerto 5000 no esté en uso
- Revisa el archivo `.env` en busca de errores de sintaxis

---

## 📞 SOPORTE

Para dudas o problemas:
- CEO: Claytis Miguel Tom Zuaznabar
- Empresa: GuestsValencia
- Proyecto: Sandra Professional

---

## 🎯 PRÓXIMOS PASOS

Una vez completada la configuración:

1. ✅ Todas las SDKs operacionales
2. ✅ Sistema de testing funcional
3. ✅ Backend API Gateway completo
4. 🔄 Integrar con Electron (frontend)
5. 🔄 Agregar MCP agents al flujo
6. 🔄 Testing end-to-end completo
7. 🚀 Deploy a producción

---

**ÚLTIMA ACTUALIZACIÓN:** 24 Octubre 2025
**VERSIÓN:** 1.0
**ESTADO:** SDKs oficiales integradas - Configuración pendiente
