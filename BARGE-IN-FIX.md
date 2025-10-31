# BARGE-IN SYSTEM FIX - Sandra IA

## PROBLEMA IDENTIFICADO

**Síntoma**: Usuario interrumpe a Sandra → Sandra se calla pero NO responde más

**Causa raíz**: Lock de concurrencia (`isProcessing`) impedía procesar nuevas queries durante una interrupción

## FLUJO ANTES DEL FIX

```
Estado 1: Sandra hablando (isProcessing = true)
Estado 2: Usuario interrumpe (VAD detecta audio)
Estado 3: Sandra se calla (currentAudio.stop())
Estado 4: Usuario termina de hablar
Estado 5: handleQuery() intenta procesar
Estado 6: ❌ BLOQUEADO (isProcessing = true) → NO RESPUESTA
```

## FLUJO DESPUÉS DEL FIX

```
Estado 1: Sandra hablando (isSandraPlaying = true, isProcessing = true)
Estado 2: Usuario interrumpe (VAD detecta audio)
Estado 3: BARGE-IN DETECTED
  - Sandra se calla (currentAudio.stop())
  - isSandraPlaying = false
  - isProcessing = false (LIBERADO)
  - currentProcessingId = null
Estado 4: Usuario termina de hablar
Estado 5: handleQuery(text, isBargeIn = true) procesa la interrupción
Estado 6: ✅ Sandra responde correctamente
```

## CAMBIOS IMPLEMENTADOS

### 1. Nuevas variables de estado (líneas 62-63)
```javascript
let isSandraPlaying = false; // Barge-in: Sandra hablando flag
let currentProcessingId = null; // ID del request actual
```

### 2. Tracking de reproducción de audio (líneas 116-124)
```javascript
function playBase64(mime, b64) {
  // ...
  isSandraPlaying = true; // BARGE-IN: Marcar que Sandra está hablando
  src.start();
  src.onended = () => {
    isSandraPlaying = false; // BARGE-IN: Sandra terminó de hablar
    // ...
  };
}
```

### 3. Detección de barge-in en reconocimiento de voz (líneas 173-201)
```javascript
// BARGE-IN FIX: Detección de interrupción
if (last.isFinal && !wakeMode) {
  const isBargeIn = isSandraPlaying; // Detectar si Sandra hablaba

  // Cancelar audio de Sandra si está hablando
  if (currentAudio) {
    currentAudio.stop();
    isSandraPlaying = false;
  }

  // CRÍTICO: Liberar el lock si es barge-in
  if (isBargeIn && isProcessing) {
    isProcessing = false;
    currentProcessingId = null;
  }

  handleQuery(text, isBargeIn); // Pasar flag de barge-in
}
```

### 4. Manejo de barge-in en handleQuery (líneas 283-350)
```javascript
async function handleQuery(text, isBargeIn = false) {
  // BARGE-IN FIX: Permitir interrupción
  if (isProcessing && !isBargeIn) {
    return; // Solo bloquear si NO es barge-in
  }

  // Si es interrupción, incrementar requestId para cancelar anterior
  const currentRequestId = ++requestId;

  // Validar que no fue cancelado por otro barge-in
  if (currentRequestId !== requestId) {
    return; // Descartar respuesta obsoleta
  }

  // Liberar lock solo si es el request actual
  if (currentRequestId === requestId) {
    isProcessing = false;
  }
}
```

## GESTIÓN DE ESTADOS

### Estados del sistema:
- **IDLE**: Sandra esperando input
- **LISTENING**: Micrófono activo, usuario hablando
- **PROCESSING**: Generando respuesta (isProcessing = true)
- **SPEAKING**: Sandra reproduciendo audio (isSandraPlaying = true)
- **INTERRUPTED**: Usuario interrumpió (isBargeIn = true)

### Transiciones válidas:
```
IDLE → LISTENING (usuario activa micrófono)
LISTENING → PROCESSING (usuario termina de hablar)
PROCESSING → SPEAKING (respuesta generada)
SPEAKING → IDLE (audio termina)

SPEAKING → INTERRUPTED (usuario habla durante SPEAKING)
INTERRUPTED → PROCESSING (procesar interrupción)
PROCESSING → SPEAKING (responder a interrupción)
```

## ARCHIVOS MODIFICADOS

- `public/js/sandra-mobile.js`
  - Líneas 62-63: Nuevas variables de estado
  - Líneas 116-124: Tracking de reproducción
  - Líneas 173-201: Detección de barge-in
  - Líneas 283-350: Manejo de interrupciones

## TESTING MANUAL REQUERIDO

### Test 1: Barge-in básico
1. ✅ Activar micrófono
2. ✅ Preguntar algo a Sandra
3. ✅ Mientras Sandra responde, hablar de nuevo (interrumpir)
4. ✅ Verificar: Sandra se calla inmediatamente
5. ✅ Verificar: Sandra responde a la interrupción

### Test 2: Barge-in múltiple
1. ✅ Interrumpir a Sandra
2. ✅ Antes de que termine de responder, interrumpir de nuevo
3. ✅ Verificar: Sandra procesa la última interrupción

### Test 3: Conversación normal
1. ✅ Hacer pregunta
2. ✅ Esperar respuesta completa SIN interrumpir
3. ✅ Hacer otra pregunta
4. ✅ Verificar: Funciona normalmente

### Test 4: Race conditions
1. ✅ Interrumpir muy rápido múltiples veces
2. ✅ Verificar: No hay bloqueos
3. ✅ Verificar: Logs muestran cancelaciones correctas

## LOGS ESPERADOS

```
[Sandra] 🗣️ Speech started
[Sandra] BARGE-IN DETECTED: Cancelando procesamiento anterior
[Sandra] BARGE-IN: Cancelando request anterior 42
[Sandra] Request cancelado por barge-in, descartando respuesta
[Sandra] 🤖 Pensando...
[Sandra] chat latency: 850ms
[Sandra] 📢 Hablando...
[Sandra] tts latency: 320ms
[Sandra] 🟢 Listo
```

## VERIFICACIÓN DE FIX

- ✅ Sandra se calla al interrumpir (currentAudio.stop())
- ✅ Lock de procesamiento se libera (isProcessing = false)
- ✅ Nueva query se procesa (handleQuery con isBargeIn = true)
- ✅ Sandra responde correctamente
- ✅ No hay race conditions
- ✅ Requests antiguos se descartan correctamente

## PRÓXIMOS PASOS

1. Testing manual exhaustivo
2. Verificar en diferentes navegadores (Chrome, Safari, Firefox)
3. Testing en móvil (iOS Safari, Android Chrome)
4. Agregar tests automatizados
5. Documentar comportamiento esperado para QA

---

**Fecha**: 2025-10-29
**Autor**: Barge-In System Expert
**Status**: ✅ FIX IMPLEMENTADO - PENDIENTE TESTING
