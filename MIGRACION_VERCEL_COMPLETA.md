# ✅ MIGRACIÓN COMPLETA NETLIFY → VERCEL

## 📋 Cambios Aplicados

### Archivos Actualizados

1. **sandra-coo-desktop**
   - `config.json`: Rutas cambiadas a `/api/*`
   - `app.js`: Health check a `/api/health`

2. **sandra-widget.js**
   - `NETLIFY_BASE` → `API_BASE`
   - Todas las rutas: `/.netlify/functions/*` → `/api/*`

3. **sandra-mobile.js**
   - `/.netlify/functions/chat-local` → `/api/chat`

4. **sandra-mobile-app.js**
   - `NETLIFY_BASE` → `API_BASE`
   - Todas las rutas actualizadas a `/api/*`

5. **desktop/app.js**
   - `NETLIFY_BASE` → `API_BASE`
   - Todas las rutas actualizadas a `/api/*`

6. **frontend/js/api.js**
   - `sendToNetlifyFunction` → `sendToVercelAPI`
   - Referencias actualizadas

## 🚀 Endpoints en Vercel

Todas las apps ahora usan:
- `/api/chat` - Chat con OpenAI
- `/api/cartesia-tts` - Text-to-Speech
- `/api/health` - Health check
- `/api/barge-in` - Interrupciones de voz

## ✅ Estado

**TODAS las apps están migradas a Vercel API Gateway**

