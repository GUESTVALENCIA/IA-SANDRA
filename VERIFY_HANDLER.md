# 🔍 VERIFICACIÓN DEL HANDLER reset-services

## Problema

El handler `reset-services` está correctamente definido en `main.js` pero la aplicación empaquetada no lo reconoce.

## Verificación

Cuando reinicies la aplicación, **deberías ver estos logs en la consola de Electron** (no en DevTools del navegador):

```
[MAIN] Registering IPC handlers...
[MAIN] ✅ reset-services handler registered
[MAIN] IPC Handlers registered: send-message, get-service-status, get-metrics, reset-services, ...
```

## Solución

La aplicación Electron está **empaquetada** y usa el código desde `app.asar`. Necesitas:

### Opción 1: Ejecutar en modo desarrollo

Si tienes acceso a ejecutar la app desde la línea de comandos:

```bash
cd extracted_app
electron . --dev
```

### Opción 2: Re-empaquetar la aplicación

Si la aplicación está empaquetada como `.asar`, necesitas:

1. **Extraer el app.asar** (si existe)
2. **Copiar el nuevo main.js** a la ubicación correcta
3. **O ejecutar la app desde extracted_app directamente**

### Opción 3: Verificar ubicación del main.js

Asegúrate de que la aplicación está usando el `main.js` correcto. Verifica:

- La ruta en `package.json` apunta a `main.js`
- El archivo `main.js` contiene el handler `reset-services`
- La aplicación se ejecuta desde el directorio correcto

## Handler Verificado

El handler está en `main.js` línea 107-138 y se registra **antes** de que la app esté lista.

---

**Si los logs `[MAIN]` no aparecen, la app está usando una versión empaquetada antigua.**

