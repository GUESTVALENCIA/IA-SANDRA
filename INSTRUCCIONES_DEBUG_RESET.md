# 🔧 INSTRUCCIONES PARA DEBUG DEL ERROR RESET SERVICES

## 🚨 ERROR ACTUAL

```
Error invoking remote method 'reset-services': Error: No handler registered for 'reset-services'
```

---

## 🔍 PASOS DE DEBUG

### Paso 1: Verificar Logs al Iniciar App

**Al iniciar la app Electron, buscar en la consola del main process** (terminal donde corre Electron):

```
[MAIN] Registering IPC handlers...
[MAIN] ✅ reset-services handler registered
[MAIN] Handler "reset-services": ✅ REGISTERED
[PRELOAD] ✅ electronAPI exposed to window.electronAPI
[PRELOAD] Methods exposed: ["sendMessage", "getServiceStatus", "getMetrics", "resetServices", ...]
```

**Si NO ves estos logs**:
- ❌ El `main.js` no se está ejecutando
- ❌ O la app está usando versión empaquetada (app.asar) sin actualizar

---

### Paso 2: Verificar en DevTools Console

**Abrir DevTools** (Ctrl+Shift+I o F12) → **Console**

**Ejecutar estos comandos**:

```javascript
// 1. Verificar que preload.js se cargó
// Debe aparecer: [PRELOAD] Secure IPC bridge initialized
// Si no aparece, preload.js no se cargó

// 2. Verificar electronAPI
window.electronAPI
// Debe mostrar: { sendMessage: ƒ, getServiceStatus: ƒ, resetServices: ƒ, ... }

// 3. Verificar resetServices específicamente
window.electronAPI.resetServices
// Debe mostrar: ƒ resetServices() { ... }

// 4. Verificar métodos disponibles
Object.keys(window.electronAPI)
// Debe incluir: ["sendMessage", "getServiceStatus", "getMetrics", "resetServices", ...]
```

---

### Paso 3: Probar Reset Services

**Hacer click en "Reiniciar Servicios"**

**Verificar logs en Console**:

```
[APP] ========================================
[APP] RESET SERVICES CALLED
[APP] ========================================
[APP] Checking electronAPI availability...
[APP] window.electronAPI: { ... }
[APP] ✅ window.electronAPI available
[APP] Methods: ["sendMessage", "getServiceStatus", "resetServices", ...]
[APP] resetServices exists: true
[API] resetServices called
[API] Using electronAPI.resetServices()
```

---

## 🚨 DIAGNÓSTICO POR CASOS

### Caso 1: `window.electronAPI` es `undefined`

**Causa**: `preload.js` no se está cargando

**Verificación**:
- Verificar path en `main.js` línea 21: `preload: path.join(__dirname, 'preload.js')`
- Verificar que `preload.js` existe en `extracted_app/preload.js`
- Verificar que no hay errores de sintaxis en `preload.js`

**Solución**:
- Si la app está empaquetada: Actualizar `app.asar`
- Si corre desde código: Verificar que `preload.js` está en la ruta correcta

### Caso 2: `window.electronAPI` existe pero `resetServices` es `undefined`

**Causa**: El método no se está exponiendo correctamente

**Verificación**:
- Ver `preload.js` línea 58-60: Debe tener `resetServices: async () => { ... }`
- Verificar que está en la lista de métodos permitidos (línea 13)

**Solución**:
- Verificar que `preload.js` tiene la versión actualizada

### Caso 3: Handler no registrado en main.js

**Causa**: `main.js` no está registrando el handler

**Verificación**:
- Ver logs del main process: Debe decir `[MAIN] ✅ reset-services handler registered`
- Si no aparece, el handler no se registró

**Solución**:
- Verificar que `main.js` tiene la versión actualizada
- Si la app está empaquetada: Actualizar `app.asar`

### Caso 4: La app está usando versión empaquetada (app.asar)

**Causa**: Los cambios en código fuente no se reflejan porque la app está empaquetada

**Verificación**:
- Verificar si la app está corriendo desde `app.asar`
- Los cambios en código fuente no afectan hasta que se reempaquete

**Solución**:
1. **Opción A**: Ejecutar desde código fuente (no empaquetado)
   ```bash
   cd extracted_app
   npm start
   ```

2. **Opción B**: Actualizar `app.asar` con los cambios
   - Usar script: `update-asar.bat` o `update-asar.ps1`
   - O manualmente: Extraer, actualizar, reempaquetar

---

## ✅ SOLUCIÓN RÁPIDA

### Si la app está empaquetada:

**Ejecutar desde código fuente** (recomendado para testing):
```bash
cd "C:\Users\clayt\AppData\Local\Programs\Sandra DevConsole\extracted_app"
npm start
```

Esto ejecutará la app directamente desde el código fuente, sin usar `app.asar`.

---

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Logs del main process muestran handler registrado
- [ ] Logs del preload muestran electronAPI expuesto
- [ ] DevTools Console: `window.electronAPI` existe
- [ ] DevTools Console: `window.electronAPI.resetServices` existe
- [ ] Al hacer click, logs muestran `[API] Using electronAPI.resetServices()`
- [ ] Handler se ejecuta correctamente

---

**IMPORTANTE**: Si la app está empaquetada, los cambios NO se reflejarán hasta actualizar `app.asar` o ejecutar desde código fuente.

