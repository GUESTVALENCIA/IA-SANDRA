# 🔍 DIAGNÓSTICO: Reset Services Error

## 🚨 ERROR ACTUAL

```
Error invoking remote method 'reset-services': Error: No handler registered for 'reset-services'
```

**Ubicación**: `api.js:85` → `resetServices()`

---

## 🔍 ANÁLISIS

### Estado del Handler:

✅ **main.js** (línea 122): Handler `reset-services` registrado correctamente
✅ **preload.js** (línea 58): Método `resetServices` expuesto en `electronAPI`
✅ **api.js**: Intenta usar `electronAPI.resetServices()`

### Problema Identificado:

El error dice "No handler registered", lo que sugiere:

1. **`electronAPI` no está disponible** en el renderer process
   - Posible causa: `preload.js` no se está cargando
   - Posible causa: Context Isolation no está funcionando correctamente

2. **O está usando `ipcRenderer.invoke` directamente**
   - Con Context Isolation habilitado, esto NO funciona
   - Solo debe usar `electronAPI` expuesto por `preload.js`

---

## ✅ FIX APLICADO

### Mejoras en `api.js`:

1. **Logging mejorado** para debugging:
   - Verifica si `electronAPI` está disponible
   - Muestra métodos disponibles
   - Verifica si `resetServices` existe en `electronAPI`

2. **Múltiples fallbacks**:
   - Prioridad 1: `electronAPI.resetServices()`
   - Prioridad 2: `window.electronAPI.resetServices()` directamente
   - Prioridad 3: `ipcRenderer.invoke()` (solo si Context Isolation deshabilitado)
   - Prioridad 4: Fallback web

3. **Verificación de disponibilidad**:
   - Comprueba `window.electronAPI` antes de usarlo
   - Valida que `resetServices` existe

---

## 🔧 VERIFICACIÓN MANUAL

### Paso 1: Verificar que preload.js se carga

**En DevTools Console**:
```javascript
// Debe mostrar: [PRELOAD] Secure IPC bridge initialized
// Si no aparece, preload.js no se está cargando
```

### Paso 2: Verificar electronAPI

**En DevTools Console**:
```javascript
window.electronAPI
// Debe mostrar objeto con métodos: sendMessage, getServiceStatus, resetServices, etc.

window.electronAPI.resetServices
// Debe mostrar: function resetServices() { ... }
// Si es undefined, el método no está expuesto
```

### Paso 3: Verificar main.js registra handler

**En logs de main process** (terminal donde corre Electron):
```
[MAIN] ✅ reset-services handler registered
[MAIN] IPC Handlers registered: ..., reset-services, ...
```

---

## 🚨 POSIBLES CAUSAS Y SOLUCIONES

### Causa 1: App empaquetada (app.asar) no actualizada

**Síntoma**: Cambios en código no se reflejan

**Solución**:
1. Actualizar `app.asar` con los cambios
2. O ejecutar app desde código fuente (sin empaquetar)

### Causa 2: preload.js no se carga

**Síntoma**: `window.electronAPI` es `undefined`

**Verificación**:
- Verificar path de `preload.js` en `main.js` línea 21
- Verificar que archivo existe: `extracted_app/preload.js`
- Verificar que no hay errores en console del renderer

**Solución**:
- Asegurar que `preload.js` está en la ruta correcta
- Verificar que no hay errores de sintaxis

### Causa 3: Context Isolation conflictivo

**Síntoma**: `ipcRenderer.invoke` falla con "No handler registered"

**Solución**:
- Usar SOLO `electronAPI` (no `ipcRenderer` directo)
- Verificar que `contextIsolation: true` en `main.js`

---

## 🚀 PRÓXIMOS PASOS

1. **Reiniciar la app Electron** completamente
2. **Abrir DevTools** → Console
3. **Verificar logs**:
   - Buscar `[API] Available electronAPI methods:`
   - Verificar que `resetServices` está en la lista
4. **Probar botón "Reiniciar Servicios"** nuevamente
5. **Si persiste**:
   - Verificar logs de main process
   - Verificar que `preload.js` se carga
   - Verificar que handler está registrado en `main.js`

---

## ✅ RESULTADO ESPERADO

Después del fix y reiniciar la app:

```
[API] Sandra API initialized (Electron IPC mode - secure via electronAPI)
[API] Available electronAPI methods: ["sendMessage", "getServiceStatus", "getMetrics", "resetServices", ...]
[API] resetServices available: true
```

Y al hacer click en "Reiniciar Servicios":
```
[API] resetServices called
[API] Using electronAPI.resetServices()
[MAIN] reset-services handler called
[MAIN] Services reset complete
```

---

**Estado**: ✅ **FIX APLICADO - REQUIERE REINICIAR APP**

