# 🔧 ACTUALIZAR app.asar CON EL NUEVO HANDLER

## Problema

La aplicación está ejecutándose desde `resources\app.asar` (código empaquetado) y **NO está usando** el código fuente en `extracted_app/`.

Por eso el handler `reset-services` no está disponible aunque esté en el código fuente.

## Solución: Re-empaquetar app.asar

Necesitas actualizar el `app.asar` con el código nuevo. Tienes dos opciones:

### Opción 1: Usar `asar` para extraer y re-empaquetar

```bash
# 1. Instalar asar globalmente (si no está instalado)
npm install -g asar

# 2. Extraer el app.asar actual
cd "C:\Users\clayt\AppData\Local\Programs\Sandra DevConsole\resources"
asar extract app.asar app_extracted

# 3. Copiar el nuevo main.js
copy "..\extracted_app\main.js" "app_extracted\main.js"

# 4. Re-empaquetar
asar pack app_extracted app.asar.new

# 5. Hacer backup del original y reemplazar
move app.asar app.asar.backup
move app.asar.new app.asar
```

### Opción 2: Copiar todo extracted_app al app.asar

Si prefieres, puedes extraer el asar, copiar todo el contenido de `extracted_app/` y volver a empaquetar.

### Opción 3: Ejecutar desde código fuente (temporal)

Para probar rápidamente sin empaquetar:

1. Cierra la aplicación
2. Mueve/renombra temporalmente `resources\app.asar` a `app.asar.backup`
3. Copia todo `extracted_app\` a `resources\app\`
4. Reinicia la aplicación

**⚠️ Nota**: Esto es solo para testing. Para producción necesitas re-empaquetar correctamente.

## Verificación

Después de actualizar el `app.asar`, cuando inicies la aplicación deberías ver:

```
[MAIN] Registering IPC handlers...
[MAIN] ✅ reset-services handler registered
[MAIN] IPC Handlers registered: ...
```

Si ves estos logs, el handler está registrado y funcionará.

---

**El handler está correcto en `extracted_app/main.js`, solo necesita estar en el `app.asar` también.**

