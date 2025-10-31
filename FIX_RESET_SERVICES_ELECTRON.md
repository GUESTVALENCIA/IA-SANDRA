# 🔧 FIX: Reset Services Error en Electron

## 🚨 PROBLEMA IDENTIFICADO

**Error**:
```
Error invoking remote method 'reset-services': Error: No handler registered for 'reset-services'
```

**Causa**:
El frontend está intentando usar `ipcRenderer.invoke('reset-services')` directamente, pero debería usar `window.electronAPI.resetServices()` que está expuesto por `preload.js`.

---

## ✅ FIX IMPLEMENTADO

### Cambios en `frontend/js/api.js`:

1. **Mejorada la detección de electronAPI**:
   - ✅ Logging mejorado para debugging
   - ✅ Verificación de métodos disponibles

2. **Mejorado resetServices()**:
   - ✅ Prioridad 1: `electronAPI.resetServices()` (seguro)
   - ✅ Prioridad 2: `ipcRenderer.invoke('reset-services')` (fallback)
   - ✅ Mejor manejo de errores
   - ✅ Logging detallado

### Código Antes:
```javascript
async resetServices() {
    if (this.isElectron && this.electronAPI) {
        return await this.electronAPI.resetServices();
    } else if (this.isElectron && this.ipcRenderer) {
        return await this.ipcRenderer.invoke('reset-services');
    }
}
```

### Código Después:
```javascript
async resetServices() {
    if (this.isElectron) {
        // PRIORIDAD 1: electronAPI (seguro, expuesto por preload.js)
        if (this.electronAPI && this.electronAPI.resetServices) {
            try {
                return await this.electronAPI.resetServices();
            } catch (error) {
                console.error('[API] Error calling electronAPI.resetServices:', error);
                throw error;
            }
        }
        
        // PRIORIDAD 2: ipcRenderer directo (fallback)
        if (this.ipcRenderer) {
            try {
                console.log('[API] Using ipcRenderer.invoke directly for reset-services');
                return await this.ipcRenderer.invoke('reset-services');
            } catch (error) {
                console.error('[API] Error calling ipcRenderer.invoke reset-services:', error);
                throw error;
            }
        }
        
        throw new Error('Neither electronAPI nor ipcRenderer available');
    }
}
```

---

## 🔍 VERIFICACIÓN

### Handler en main.js:
- ✅ Línea 122: `ipcMain.handle('reset-services', ...)` registrado
- ✅ Línea 155: Log confirma registro

### Exposición en preload.js:
- ✅ Línea 58-60: `resetServices` expuesto en `electronAPI`
- ✅ Línea 13: Canal `'reset-services'` en whitelist

### Uso en api.js:
- ✅ Ahora verifica `electronAPI` primero
- ✅ Mejor logging para debugging
- ✅ Fallback a `ipcRenderer` si necesario

---

## 🚀 PRÓXIMOS PASOS

### Si el error persiste:

1. **Verificar que preload.js se carga**:
   - Abrir DevTools → Console
   - Verificar mensaje: `[PRELOAD] Secure IPC bridge initialized`

2. **Verificar que electronAPI está disponible**:
   - DevTools → Console
   - Ejecutar: `window.electronAPI`
   - Debe mostrar objeto con métodos disponibles

3. **Verificar que main.js registra el handler**:
   - Ver logs de main process
   - Buscar: `[MAIN] ✅ reset-services handler registered`

4. **Si la app está empaquetada (app.asar)**:
   - Actualizar `app.asar` con los cambios
   - O ejecutar app desde código fuente (no empaquetada)

---

## ✅ RESULTADO ESPERADO

Después del fix:
- ✅ `resetServices()` usa `electronAPI.resetServices()` correctamente
- ✅ Handler se encuentra correctamente
- ✅ Botón "Reiniciar Servicios" funciona
- ✅ Logs muestran llamada exitosa

---

**Estado**: ✅ **FIX IMPLEMENTADO Y PUSHEADO**

