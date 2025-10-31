# PLAN DE ROBUSTEZ - SANDRA IA MÓVIL

**Fecha:** 2025-10-28
**CEO:** Clayton Thomas
**Estado:** ✅ VOZ CARTESIA FUNCIONAL - Robustez pendiente
**Prioridad:** 🔴 ALTA

---

## 🎉 LOGROS ACTUALES

✅ API Cartesia conectada y funcional
✅ Voz personalizada sonando correctamente
✅ Latencia aceptable
✅ Primera respuesta perfecta en iPhone

---

## 🐛 PROBLEMAS DETECTADOS

### 1. BUCLE INFINITO EN RECONOCIMIENTO DE VOZ
**Síntoma:** Después de la primera respuesta, entra en bucle repitiendo consultas
**Causa:** `rec.continuous = true` + Sandra se escucha a sí misma
**Ubicación:** `public/js/sandra-mobile.js:122`

**Solución:**
```javascript
// OPCIÓN A: Detener rec después de cada consulta
rec.onresult = (evt) => {
  const last = evt.results[evt.results.length-1];
  if (last.isFinal && !wakeMode) {
    const text = last[0].transcript.trim();
    pushMsg('user', text);
    stopRec();  // ← AÑADIR: Detener micrófono
    handleQuery(text);
  }
};

// OPCIÓN B: Usar rec.continuous = false (mejor para conversaciones)
rec.continuous = false;  // ← Parar automáticamente después de cada frase
```

### 2. SIN RATE LIMITING
**Síntoma:** Múltiples clicks/llamadas simultáneas causan cuelgues
**Causa:** Sin protección contra llamadas concurrentes
**Ubicación:** `public/js/sandra-mobile.js:182-198`

**Solución:**
```javascript
let isProcessing = false;  // ← AÑADIR variable global

async function handleQuery(text){
  // AÑADIR protección concurrencia
  if (isProcessing) {
    console.warn('⚠️ Ya procesando consulta anterior');
    return;
  }

  isProcessing = true;
  try {
    state('🤖 Pensando...');
    const { text:answer } = await chatLLM(text);
    if (!answer) throw new Error('Empty response from LLM');
    pushMsg('assistant', answer);
    state('📢 Hablando...');
    await ttsSpeak(answer);
    state('🟢 Listo');
  }
  catch(e){
    console.error('handleQuery error:', e);
    state('❌ Error: ' + (e.message || 'Unknown error'));
    pushMsg('assistant', '❌ Disculpa, hubo un error. Reinténtalo.');
  }
  finally {
    isProcessing = false;  // ← Liberar lock
  }
}
```

### 3. BOTÓN SEND SIN PROTECCIÓN
**Síntoma:** Múltiples clicks envían la misma consulta varias veces
**Causa:** Sin debouncing ni lock
**Ubicación:** `public/js/sandra-mobile.js:198`

**Solución:**
```javascript
sendBtn.onclick = () => {
  const v = input.value.trim();
  if (!v || isProcessing) return;  // ← AÑADIR: Verificar isProcessing
  pushMsg('user', v);
  input.value='';
  sendBtn.disabled = true;  // ← AÑADIR: Deshabilitar botón
  handleQuery(v).finally(() => sendBtn.disabled = false);  // ← Rehabilitar después
};
```

### 4. CANCELACIÓN DE AUDIO INCOMPLETA
**Síntoma:** Si usuario habla mientras Sandra está hablando, audio anterior no se cancela correctamente
**Causa:** Cancelación manual no espera a que audio termine
**Ubicación:** `public/js/sandra-mobile.js:132`

**Solución:**
```javascript
rec.onresult = (evt) => {
  // ...
  if (currentAudio) {
    try {
      currentAudio.stop();
      currentAudio.disconnect();  // ← AÑADIR: Desconectar también
    } catch(e) {
      console.warn('Error stopping audio:', e);
    }
    currentAudio = null;
  }
  // ...
};
```

### 5. SIN TIMEOUT EN FETCH
**Síntoma:** Si API tarda demasiado, la app se queda colgada esperando
**Causa:** Sin timeout en llamadas fetch
**Ubicación:** `public/js/sandra-mobile.js:142-160, 161-181`

**Solución:**
```javascript
async function chatLLM(text){
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);  // ← 15s timeout

  try {
    const r = await fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body),
      signal: controller.signal  // ← AÑADIR: Signal de abort
    });
    clearTimeout(timeoutId);
    // ...
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout: La consulta tardó demasiado');
    }
    throw error;
  }
}
```

### 6. SIN REINTENTOS AUTOMÁTICOS
**Síntoma:** Si una API falla temporalmente, no hay reintentos
**Causa:** Sin lógica de retry
**Ubicación:** `public/js/sandra-mobile.js:142-160, 161-181`

**Solución:**
```javascript
async function retryFetch(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));  // Backoff exponencial
        continue;
      }
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## 🎯 PRIORIZACIÓN DE FIXES

### CRÍTICO (Implementar YA):
1. ✅ **Fix bucle de voz:** Detener `rec` después de cada consulta
2. ✅ **Rate limiting:** Variable `isProcessing` global
3. ✅ **Botón send:** Deshabilitar durante procesamiento

### ALTA (Próxima sesión):
4. 🔶 **Timeout en fetch:** 15s límite para APIs
5. 🔶 **Cancelación audio:** Desconectar correctamente

### MEDIA (Mejoras futuras):
6. 🔷 **Reintentos automáticos:** Retry logic para APIs
7. 🔷 **UI feedback:** Loading spinners, progress bars
8. 🔷 **Error handling mejorado:** Mensajes específicos por tipo de error

---

## 📝 NOTAS DEL CEO

> "En la primera prueba respondió perfectamente Sandra con la voz de Cartesia. La latencia estaba bien, pero luego entró en bucle repitiendo consultas y se colgó el sistema. Imagino que causará una tontería."

**Análisis CTO:**
- ✅ La API funciona perfectamente
- ✅ La latencia es buena
- ❌ El problema es frontend: reconocimiento de voz continuo
- ❌ Sandra se escucha a sí misma → bucle infinito

**Solución simple:** Detener micrófono después de cada consulta.

---

## 🚀 SIGUIENTE PASO

**CEO debe decidir:**

### Opción A: Fix rápido (15 minutos)
- Implemento los 3 fixes críticos
- Deploy inmediato
- Testing en iPhone

### Opción B: Fix completo (1 hora)
- Implemento todos los 6 fixes
- Testing exhaustivo local
- Deploy robusto final

### Opción C: Solo documentación
- Dejamos este documento como guía
- CEO decide cuándo implementar

---

**¿Qué prefieres, CEO?**
