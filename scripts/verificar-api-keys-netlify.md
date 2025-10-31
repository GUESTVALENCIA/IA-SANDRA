# 🔐 GUÍA: VERIFICAR API KEYS EN NETLIFY

## 🎯 OBJETIVO

Verificar que todas las API keys necesarias están configuradas en Netlify Dashboard para que las funciones funcionen correctamente.

---

## 📋 API KEYS REQUERIDAS

### CRÍTICAS (Funciones no funcionan sin ellas):

1. **OPENAI_API_KEY**
   - Uso: `chat.js`, funciones que usan GPT-4o
   - Formato: `sk-proj-...`

2. **DEEPGRAM_API_KEY**
   - Uso: `voice-conversation-optimized.js` (STT)
   - Formato: `30e9dba...` (32 caracteres alfanuméricos)

3. **CARTESIA_API_KEY**
   - Uso: `voice-conversation-optimized.js` (TTS)
   - Formato: `sk_car_...`

### OPCIONALES (Mejoran funcionalidad):

4. **ANTHROPIC_API_KEY**
   - Uso: Fallback en `chat-resilient.js`
   - Formato: `sk-ant-api03-...`

5. **GROQ_API_KEY**
   - Uso: Opcional para respuestas rápidas
   - Formato: `gsk_...`

---

## 🚀 PASOS PARA VERIFICAR

### Paso 1: Acceder a Netlify Dashboard

1. Ir a: https://app.netlify.com/
2. Iniciar sesión con tu cuenta
3. Seleccionar el sitio: **grand-pasca-a584d5** o **sandra.guestsvalencia.es**

### Paso 2: Navegar a Environment Variables

1. En el sitio seleccionado, click en **Site settings**
2. En el menú lateral, click en **Environment variables**
3. Verás una lista de todas las variables configuradas

### Paso 3: Verificar Cada API Key

#### ✅ Verificar OPENAI_API_KEY:

1. Buscar en la lista: `OPENAI_API_KEY`
2. Si existe:
   - ✅ Click en el ojo 👁️ para ver el valor (debe empezar con `sk-proj-`)
   - ✅ Verificar que no está vacía
3. Si NO existe:
   - ❌ Click en **Add a variable**
   - Nombre: `OPENAI_API_KEY`
   - Valor: Tu API key de OpenAI
   - Scope: **All scopes** (o Production si solo producción)
   - Click **Save**

#### ✅ Verificar DEEPGRAM_API_KEY:

1. Buscar: `DEEPGRAM_API_KEY`
2. Si existe:
   - ✅ Verificar valor (32 caracteres)
3. Si NO existe:
   - ❌ Agregar variable:
     - Nombre: `DEEPGRAM_API_KEY`
     - Valor: Tu API key de Deepgram
     - Scope: **All scopes**
     - Click **Save**

#### ✅ Verificar CARTESIA_API_KEY:

1. Buscar: `CARTESIA_API_KEY`
2. Si existe:
   - ✅ Verificar valor (debe empezar con `sk_car_`)
3. Si NO existe:
   - ❌ Agregar variable:
     - Nombre: `CARTESIA_API_KEY`
     - Valor: Tu API key de Cartesia
     - Scope: **All scopes**
     - Click **Save**

---

## 🔍 VERIFICACIÓN RÁPIDA

### Método 1: Desde Netlify Dashboard

1. Site settings → Environment variables
2. Contar cuántas variables hay con estos nombres:
   - `OPENAI_API_KEY` ✅ o ❌
   - `DEEPGRAM_API_KEY` ✅ o ❌
   - `CARTESIA_API_KEY` ✅ o ❌

### Método 2: Desde la función health

1. Abrir: https://sandra.guestsvalencia.es/.netlify/functions/health
2. Debe responder con `{ "status": "healthy" }`
3. Si responde con error 500, probablemente faltan API keys

### Método 3: Probar función chat

1. Abrir: https://sandra.guestsvalencia.es
2. Enviar un mensaje de prueba
3. Si responde con error o "dificultades técnicas", falta `OPENAI_API_KEY`

---

## ⚠️ PROBLEMAS COMUNES

### Problema 1: "Voice APIs not configured"

**Causa**: Faltan `DEEPGRAM_API_KEY` o `CARTESIA_API_KEY`

**Solución**: Agregar ambas en Netlify Dashboard

### Problema 2: "500 Internal Server Error"

**Causa**: Falta alguna API key crítica

**Solución**: Verificar todas las keys críticas están configuradas

### Problema 3: "API key no encontrada en funciones"

**Causa**: Variables configuradas pero no en el scope correcto

**Solución**: Verificar que el scope es **All scopes** o **Production**

---

## 🔄 DESPUÉS DE AGREGAR VARIABLES

1. **Trigger redeploy**:
   - Ir a **Deploys**
   - Click en **Trigger deploy** → **Deploy site**
   - Esperar 2-3 minutos

2. **Verificar funcionamiento**:
   - Probar chat
   - Probar voice (si implementado)
   - Verificar logs en Netlify Functions

---

## 📝 CHECKLIST FINAL

- [ ] `OPENAI_API_KEY` configurada ✅
- [ ] `DEEPGRAM_API_KEY` configurada ✅
- [ ] `CARTESIA_API_KEY` configurada ✅
- [ ] Variables en scope correcto ✅
- [ ] Redeploy realizado ✅
- [ ] Funciones funcionando ✅

---

## 🆘 SI NECESITAS AYUDA

1. Ver logs de funciones:
   - Site settings → Functions → Ver logs

2. Verificar errores:
   - Site settings → Functions → Ver errores

3. Contactar soporte:
   - Netlify support si problemas con dashboard
   - Revisar documentación de cada API para obtener keys

---

**IMPORTANTE**: Las API keys son sensibles. NO las compartas ni las subas a Git.

