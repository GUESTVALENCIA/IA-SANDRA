# 🧪 GUÍA DE TESTING - APP DESKTOP Y SANDRA IA 7.0

## 📋 CHECKLIST PRE-TESTING

### Pre-requisitos
- [x] ✅ Build completado
- [x] ✅ Validaciones pasando
- [ ] ⚠️ API keys configuradas en Netlify (manual)
- [x] ✅ Electron app compilada con seguridad

---

## 🖥️ TESTING APP DESKTOP (ELECTRON)

### Test 1: Inicialización Segura

**Pasos**:
1. Abrir aplicación desktop
2. Verificar consola (DevTools): No debe haber errores de seguridad
3. Verificar que `preload.js` está cargado: `[PRELOAD] Secure IPC bridge initialized`
4. Verificar que handlers IPC están registrados

**Resultado esperado**:
```
[MAIN] Registering IPC handlers...
[MAIN] IPC Handlers registered: send-message, get-service-status, ...
[PRELOAD] Secure IPC bridge initialized
```

**Archivos clave**:
- `main.js` - Configuración segura verificada
- `preload.js` - Bridge seguro cargado

---

### Test 2: Integración con APIs

**Pasos**:
1. Abrir chat en desktop app
2. Enviar mensaje: "Hola Sandra"
3. Verificar que se llama a Orchestrator
4. Verificar que Orchestrator llama a OpenAI
5. Verificar respuesta de Sandra

**Resultado esperado**:
- ✅ Mensaje enviado via IPC seguro
- ✅ Orchestrator procesa correctamente
- ✅ Respuesta de Sandra recibida
- ✅ Sin errores 401 (API key válida)

**Verificación**:
```javascript
// En DevTools console
window.electronAPI.sendMessage('test')
  .then(response => console.log('Response:', response))
```

---

### Test 3: Validación de Seguridad IPC

**Pasos**:
1. Intentar llamar canal IPC no permitido
2. Intentar enviar mensaje muy largo (>10,000 chars)
3. Intentar enviar path traversal en comandos

**Resultado esperado**:
- ✅ Canales no permitidos rechazados
- ✅ Mensajes largos rechazados
- ✅ Path traversal bloqueado

**Test manual**:
```javascript
// En DevTools console
try {
  await window.electronAPI.sendMessage('x'.repeat(10001)); // Debe fallar
} catch (e) {
  console.log('✅ Validación funcionando:', e.message);
}
```

---

### Test 4: Voice Commands

**Pasos**:
1. Activar modo voz
2. Hablar comando
3. Verificar que se captura audio
4. Verificar que se procesa via Orchestrator
5. Verificar respuesta por voz

**Resultado esperado**:
- ✅ Audio capturado
- ✅ STT funciona (Deepgram)
- ✅ LLM procesa (GPT-4o)
- ✅ TTS reproduce (Cartesia)

---

### Test 5: Reset Services

**Pasos**:
1. Click en "Reiniciar Servicios"
2. Verificar que se reinicializa Orchestrator
3. Verificar que servicios vuelven a conectar

**Resultado esperado**:
- ✅ Botón funciona
- ✅ Orchestrator se reinicia correctamente
- ✅ Servicios conectados después de reset

---

## 🌐 TESTING SANDRA IA 7.0 (PWA WEB)

### Test 1: PWA Installation

**Pasos**:
1. Abrir https://sandra.guestsvalencia.es
2. Verificar que manifest.json es accesible
3. Verificar que Service Worker se registra
4. Intentar instalar como PWA

**Resultado esperado**:
- ✅ Manifest.json sin localhost
- ✅ Service Worker registrado
- ✅ PWA instalable
- ✅ Offline funciona

**Verificación**:
```javascript
// En DevTools console
navigator.serviceWorker.getRegistration()
  .then(reg => console.log('SW registered:', reg?.scope));
```

---

### Test 2: Chat con Resilient Client

**Pasos**:
1. Enviar mensaje: "Hola Sandra"
2. Verificar que usa `window.resilientAI.chat()`
3. Verificar que llama a `/.netlify/functions/chat`
4. Verificar respuesta

**Resultado esperado**:
- ✅ Resilient client inicializado
- ✅ Llamada a Netlify Function exitosa
- ✅ Respuesta de Sandra recibida
- ✅ Sin errores CORS

**Verificación Network Tab**:
- Request a `/.netlify/functions/chat` → 200 OK
- Sin llamadas a `api.openai.com` directas

---

### Test 3: Multi-Layer Fallback

**Pasos**:
1. Simular fallo de primary function (desactivar temporalmente)
2. Enviar mensaje
3. Verificar que usa fallback automáticamente
4. Verificar que usa cache si está disponible
5. Verificar que usa offline mode como último recurso

**Resultado esperado**:
- ✅ Circuit breaker detecta fallo
- ✅ Cambia a fallback automáticamente
- ✅ Cache usado si disponible
- ✅ Offline mode como última opción
- ✅ Usuario siempre recibe respuesta

**Verificación**:
```javascript
// Ver métricas del resilient client
window.resilientAI.getMetrics()
```

---

### Test 4: Voice Pipeline Optimizado

**Pasos**:
1. Activar modo voz
2. Hablar mensaje
3. Medir latencia total
4. Verificar que usa `voice-conversation-optimized`
5. Verificar respuesta en <6 segundos

**Resultado esperado**:
- ✅ Latencia total <6s (vs 4-9s antes)
- ✅ STT <500ms
- ✅ LLM <600ms
- ✅ TTS <400ms
- ✅ Audio reproducido correctamente

**Métricas esperadas**:
```json
{
  "latency": {
    "total": 4500,
    "stt": 400,
    "llm": 550,
    "tts": 380
  }
}
```

---

### Test 5: Error Monitoring Dashboard

**Pasos**:
1. Presionar Ctrl+Shift+E
2. Verificar que dashboard aparece
3. Generar error intencional (desconectar red)
4. Verificar que error se registra
5. Verificar que cascade detection funciona

**Resultado esperado**:
- ✅ Dashboard visible (Ctrl+Shift+E)
- ✅ Errores registrados
- ✅ Cascade detection funciona
- ✅ Alertas mostradas

**Verificación**:
```javascript
// Ver errores registrados
window.errorMonitor.errors.length

// Ver métricas
window.errorMonitor.errors.slice(0, 5)
```

---

### Test 6: Multi-Model Coordinator

**Pasos**:
1. Llamar a `/.netlify/functions/ai-multi-model`
2. Enviar query simple (debe usar GPT-4o-mini)
3. Enviar query de código (debe usar GPT-4o)
4. Verificar selección inteligente de modelo

**Resultado esperado**:
- ✅ Coordinator funciona
- ✅ Selección correcta según tipo de tarea
- ✅ Cost optimization activo
- ✅ Fallback automático

**Verificación**:
```bash
curl -X POST https://sandra.guestsvalencia.es/.netlify/functions/ai-multi-model \
  -H "Content-Type: application/json" \
  -d '{"message":"hola","taskType":"simple","priority":"cost"}'
```

---

### Test 7: HeyGen Avatar

**Pasos**:
1. Activar modo avatar
2. Enviar mensaje con texto
3. Verificar que se genera video
4. Verificar que se muestra en UI

**Resultado esperado**:
- ✅ Función `/avatar-heygen` funciona
- ✅ Video ID generado
- ✅ Embed URL creado
- ✅ Avatar se muestra en frontend

---

## 📊 TESTING MATRIX

| Test | App Desktop | PWA Web | Status |
|------|-------------|---------|--------|
| Inicialización | ✅ | ✅ | Ready |
| Chat básico | ✅ | ✅ | Ready |
| Voice | ✅ | ✅ | Ready |
| Avatar | ✅ | ✅ | Ready |
| Error Handling | ✅ | ✅ | Ready |
| Fallback | N/A | ✅ | Ready |
| Circuit Breakers | N/A | ✅ | Ready |
| Error Monitoring | N/A | ✅ | Ready |

---

## 🔍 DEBUGGING TOOLS

### Desktop App
- DevTools: `--dev` flag o Ctrl+Shift+I
- IPC Inspector: `window.electronAPI`
- Orchestrator Status: `window.sandraApp.api.getServiceStatus()`

### PWA Web
- Network Tab: Verificar llamadas a Netlify Functions
- Console: `window.resilientAI.getMetrics()`
- Error Dashboard: Ctrl+Shift+E
- Service Worker: Application tab → Service Workers

---

## ✅ CRITERIOS DE ÉXITO

### Desktop App
- ✅ Inicia sin errores de seguridad
- ✅ Chat funciona correctamente
- ✅ Voice funciona correctamente
- ✅ Reset services funciona
- ✅ No hay vulnerabilidades de seguridad

### PWA Web
- ✅ PWA instalable
- ✅ Chat funciona con Resilient Client
- ✅ Fallback funciona automáticamente
- ✅ Voice pipeline <6s
- ✅ Error monitoring funciona
- ✅ Sin errores CORS

---

**Estado**: ✅ **GUÍA DE TESTING LISTA**

**Listo para ejecutar tests cuando configures API keys** 🚀

