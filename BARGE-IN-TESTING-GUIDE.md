# GUÍA DE TESTING - Sistema Barge-In Sandra IA

## RESUMEN DEL FIX

El sistema barge-in ahora funciona correctamente con gestión de estados mejorada:

- **isSandraPlaying**: Rastrea si Sandra está reproduciendo audio
- **currentProcessingId**: ID único para cada request
- **isBargeIn**: Flag que indica si es una interrupción

## PRUEBAS REQUERIDAS

### NIVEL 1: TESTING BÁSICO

#### Test 1.1: Conversación Normal (Sin Interrupciones)
```
Pasos:
1. Abrir Sandra IA en navegador
2. Activar micrófono (🎤)
3. Decir: "Hola Sandra, ¿cómo estás?"
4. ESPERAR respuesta completa
5. Decir: "Cuéntame un chiste"
6. ESPERAR respuesta completa

✅ Resultado esperado:
- Sandra responde a ambas preguntas
- No hay bloqueos
- Audio se reproduce completo
```

#### Test 1.2: Barge-In Simple
```
Pasos:
1. Activar micrófono
2. Decir: "Cuéntame una historia larga"
3. MIENTRAS Sandra habla (2-3 segundos después)
4. Interrumpir diciendo: "¡Espera!"
5. Observar comportamiento

✅ Resultado esperado:
- Sandra se calla INMEDIATAMENTE al hablar
- Consola muestra: "BARGE-IN DETECTED"
- Sandra procesa "¡Espera!" y responde
- No hay error de "Query already in progress"
```

#### Test 1.3: Barge-In Múltiple
```
Pasos:
1. Decir: "Explícame la teoría de la relatividad"
2. Interrumpir después de 2s: "No, mejor..."
3. Interrumpir de nuevo después de 1s: "¿Qué hora es?"
4. Observar

✅ Resultado esperado:
- Cada interrupción cancela la anterior
- Solo se procesa la última query
- Logs muestran cancelaciones
```

### NIVEL 2: EDGE CASES

#### Test 2.1: Interrupción Inmediata
```
Pasos:
1. Decir: "Hola"
2. INMEDIATAMENTE (0.5s) interrumpir: "Adiós"

✅ Resultado esperado:
- Sistema maneja race condition
- Procesa última query
```

#### Test 2.2: Múltiples Interrupciones Rápidas
```
Pasos:
1. Hacer pregunta
2. Interrumpir 5 veces seguidas rápidamente

✅ Resultado esperado:
- No crash
- No memoria leak
- Procesa última interrupción
```

#### Test 2.3: Silencio Durante Respuesta
```
Pasos:
1. Hacer pregunta
2. NO interrumpir, solo esperar
3. Cuando termine, hacer otra pregunta

✅ Resultado esperado:
- Funciona normalmente
- isBargeIn = false
- No logs de cancelación
```

### NIVEL 3: VERIFICACIÓN DE ESTADOS

#### Test 3.1: Logs de Estado
```
Abrir DevTools Console y verificar logs durante barge-in:

Logs esperados:
[Sandra] 🗣️ Speech started
[Sandra] BARGE-IN DETECTED: Cancelando procesamiento anterior
[Sandra] BARGE-IN: Cancelando request anterior 5
[Sandra] Request cancelado por barge-in, descartando respuesta
[Sandra] 🤖 Pensando...
[Sandra] 📢 Hablando...
[Sandra] 🟢 Listo
```

#### Test 3.2: Variables de Estado
```javascript
// En DevTools Console durante testing:

// Antes de interrumpir (Sandra hablando):
console.log(isSandraPlaying); // true
console.log(isProcessing);    // true

// Justo después de interrumpir:
console.log(isSandraPlaying); // false
console.log(isProcessing);    // false (LIBERADO)

// Durante procesamiento de interrupción:
console.log(isProcessing);    // true
console.log(currentProcessingId); // número
```

### NIVEL 4: TESTING DE INTEGRACIÓN

#### Test 4.1: VAD Handler Integration
```
Verificar en vad-handler.js:
- onBargeIn callback se ejecuta
- remoteAudioPlaying actualiza correctamente
- Detección de voz funciona durante audio playback
```

#### Test 4.2: Audio Stream Handler
```
Verificar en audio-stream-handler.js:
- stopPlayback() se llama al interrumpir
- Audio buffer se limpia
- No hay audio residual
```

## CHECKLIST DE VALIDACIÓN

### Funcionalidad Core
- [ ] Sandra responde normalmente sin interrupciones
- [ ] Sandra se calla al interrumpir
- [ ] Sandra responde después de interrupción
- [ ] Múltiples interrupciones funcionan
- [ ] No hay bloqueos permanentes

### Estados y Locks
- [ ] isProcessing se libera correctamente
- [ ] isSandraPlaying tracking funciona
- [ ] currentProcessingId incrementa correctamente
- [ ] Requests antiguos se descartan

### Audio y TTS
- [ ] Audio se detiene inmediatamente
- [ ] No hay audio solapado
- [ ] currentAudio.stop() no genera errores
- [ ] Audio reproduction tracking correcto

### Logs y Debugging
- [ ] Logs de barge-in aparecen
- [ ] Logs de cancelación correctos
- [ ] No hay errores en console
- [ ] Métricas de latencia se actualizan

### Edge Cases
- [ ] Interrupción inmediata funciona
- [ ] Múltiples interrupciones rápidas OK
- [ ] Race conditions manejadas
- [ ] No memory leaks

## TESTING EN DIFERENTES NAVEGADORES

### Chrome/Edge (Blink)
```
✅ Speech Recognition: Sí
✅ Web Audio API: Sí
✅ VAD: Sí
Testing priority: ALTO
```

### Safari (iOS/macOS)
```
✅ Speech Recognition: Sí (webkit)
⚠️  Web Audio API: Limitaciones en iOS
✅ VAD: Sí
Testing priority: ALTO (iOS es target principal)
```

### Firefox
```
⚠️  Speech Recognition: Limitado
✅ Web Audio API: Sí
✅ VAD: Sí
Testing priority: MEDIO
```

## COMANDOS DE DEBUG

### Activar logs detallados
```javascript
// En DevTools Console:
localStorage.setItem('sandra_debug', 'true');
location.reload();
```

### Simular barge-in manual
```javascript
// Forzar interrupción desde console:
if (currentAudio) {
  currentAudio.stop();
  isSandraPlaying = false;
  isProcessing = false;
  console.log('🛑 Barge-in manual activado');
}
```

### Verificar estado actual
```javascript
console.table({
  isProcessing,
  isSandraPlaying,
  requestId,
  currentProcessingId,
  recognizing,
  hasCurrentAudio: !!currentAudio
});
```

## CRITERIOS DE ÉXITO

### ✅ PASS: Sistema funciona si...
- Sandra responde correctamente después de interrupción
- No hay errores "Query already in progress"
- Audio se detiene inmediatamente
- Estados se resetean correctamente
- Logs muestran flujo esperado

### ❌ FAIL: Sistema falla si...
- Sandra no responde después de interrumpir
- Aparece "Query already in progress" en barge-in
- Audio continúa después de interrumpir
- Sistema se bloquea permanentemente
- Hay errores en console

## PRÓXIMOS PASOS DESPUÉS DEL TESTING

1. **Si PASS**: Documentar y preparar para producción
2. **Si FAIL**: Analizar logs y ajustar lógica de estados
3. **Optimizaciones**: Reducir latencia de detección
4. **UX**: Agregar feedback visual de barge-in
5. **Analytics**: Trackear frecuencia de interrupciones

---

**Fecha**: 2025-10-29
**Versión**: v1.0
**Status**: 📋 TESTING PENDIENTE
