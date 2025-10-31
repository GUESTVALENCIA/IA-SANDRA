# 🎯 BLOQUE 3: END-TO-END TESTING - PLAN

## 📋 OBJETIVO

Verificar que todo el flujo completo funciona correctamente:
- Frontend → Backend → API Externa → Respuesta → Frontend

---

## ✅ CHECKLIST DE TESTING E2E

### 1. Testing de Chat (Flujo Básico)

**Test Case**: Chat end-to-end
- [ ] Abrir `https://sandra.guestsvalencia.es`
- [ ] Enviar mensaje de prueba: "Hola Sandra"
- [ ] Verificar que NO aparece "[Offline Mode]"
- [ ] Verificar respuesta de GPT-4o (no respuesta pre-programada)
- [ ] Verificar en Network tab:
  - [ ] Request: `POST /.netlify/functions/chat`
  - [ ] Response: `200 OK`
  - [ ] Response time: < 5 segundos
  - [ ] Response body contiene respuesta de AI

### 2. Testing de Voice (Flujo Completo)

**Test Case**: Voice conversation end-to-end
- [ ] Activar modo voz
- [ ] Grabar mensaje de voz
- [ ] Verificar que se transcribe correctamente (STT)
- [ ] Verificar que se envía a LLM
- [ ] Verificar que se recibe respuesta TTS
- [ ] Verificar que se reproduce audio
- [ ] Verificar en Network tab:
  - [ ] Request a `/.netlify/functions/voice-conversation`
  - [ ] Response: `200 OK`
  - [ ] Response time: < 10 segundos (con timeout=26)

### 3. Testing de Estados UI

**Test Case**: Loading y Error States
- [ ] Enviar mensaje → Verificar loading indicator aparece
- [ ] Esperar respuesta → Verificar loading desaparece
- [ ] Simular error (desconectar internet) → Verificar error state
- [ ] Verificar retry button funciona
- [ ] Verificar toast notifications aparecen

### 4. Testing de Offline Detection

**Test Case**: Offline Mode
- [ ] Verificar connection status indicator aparece
- [ ] Desconectar internet → Verificar estado cambia a "Sin conexión"
- [ ] Reconectar internet → Verificar estado cambia a "En línea"
- [ ] Verificar toast notifications de conexión/desconexión

### 5. Testing de Service Worker

**Test Case**: PWA y Caching
- [ ] Verificar Service Worker registrado (DevTools → Application → Service Workers)
- [ ] Verificar cache funciona (Network tab → verificar requests cached)
- [ ] Verificar offline mode funciona (desconectar → cargar página)

### 6. Testing de Health Endpoint

**Test Case**: Health Check
- [ ] Abrir `https://sandra.guestsvalencia.es/.netlify/functions/health`
- [ ] Verificar response: `{ "status": "healthy" }`
- [ ] Verificar CORS headers presentes
- [ ] Verificar response time: < 1 segundo

---

## 🔍 VALIDACIÓN TÉCNICA

### Verificar en Netlify Dashboard:

1. **Functions Logs**:
   - [ ] `chat` function invocations > 0
   - [ ] `voice-conversation` function invocations > 0 (si probado)
   - [ ] `health` function invocations > 0
   - [ ] No errores en logs

2. **Environment Variables**:
   - [ ] `OPENAI_API_KEY` configurada
   - [ ] `DEEPGRAM_API_KEY` configurada (si voice usado)
   - [ ] `CARTESIA_API_KEY` configurada (si voice usado)

3. **Deploy Status**:
   - [ ] Último deploy exitoso
   - [ ] Functions deployadas correctamente

---

## 📊 MÉTRICAS A VERIFICAR

### Performance:
- [ ] Chat response time: < 5 segundos
- [ ] Voice response time: < 10 segundos
- [ ] Health check: < 1 segundo
- [ ] Page load time: < 3 segundos

### Reliability:
- [ ] Success rate: > 95%
- [ ] Error rate: < 5%
- [ ] Timeout rate: 0%

### User Experience:
- [ ] Loading states aparecen correctamente
- [ ] Error states muestran mensaje claro
- [ ] Offline detection funciona
- [ ] Toast notifications aparecen

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "[Offline Mode]" en respuestas

**Causa**: API Client no está llamando a Netlify Functions
**Solución**: Verificar que `window.sandraAPI` o `window.resilientAI` está inicializado

### Problema 2: CORS errors en console

**Causa**: Falta CORS preflight handler
**Solución**: Ya implementado, pero verificar que funciones responden a OPTIONS

### Problema 3: Timeout en voice

**Causa**: Pipeline > 10 segundos (ahora configurado a 26s)
**Solución**: Verificar que `netlify.toml` tiene `timeout = 26`

### Problema 4: 500 errors en funciones

**Causa**: API keys no configuradas
**Solución**: Verificar en Netlify Dashboard (guía creada)

---

## ✅ CRITERIOS DE ÉXITO

El BLOQUE 3 se considera completado cuando:

1. ✅ Chat funciona end-to-end sin "[Offline Mode]"
2. ✅ Voice funciona end-to-end (si implementado)
3. ✅ Loading/Error states funcionan correctamente
4. ✅ Offline detection funciona
5. ✅ Service Worker funciona
6. ✅ Health endpoint responde correctamente
7. ✅ No errores críticos en console
8. ✅ Métricas de performance dentro de objetivos

---

## 📝 REPORTE DE TESTING

Después de completar los tests, crear reporte con:

- [ ] Resultados de cada test case
- [ ] Screenshots de pruebas exitosas
- [ ] Métricas de performance
- [ ] Problemas encontrados (si hay)
- [ ] Soluciones aplicadas

---

**Estado**: ⏳ **PENDIENTE DE EJECUCIÓN**

**Siguiente**: Ejecutar tests E2E manuales y automatizados

