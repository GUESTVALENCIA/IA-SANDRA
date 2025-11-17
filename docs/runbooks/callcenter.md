# CallCenter por Rol - Runbook

## Descripción

El CallCenter por Rol es un sistema profesional, aislado y "por rol" que permite iniciar llamadas conversacionales con roles específicos sin mezclar contextos. Se apoya en RoleLock (rol único por sesión) y en el Multimodal Conversation Service.

## Arquitectura

- **Configuración**: `callcenter/config/dialplan.json`
- **Servicio Backend**: `callcenter/service.js`
- **UI**: `desktop-app/renderer/callcenter.html`
- **IPC**: Handlers en `desktop-app/main.js`
- **API Bridge**: `desktop-app/preload.js`

## Configuración del Dialplan

### Estructura

```json
{
  "defaultPipeline": "voice_only",
  "roles": {
    "roleId": {
      "title": "Nombre del Rol",
      "pipeline": "voice_only" | "avatar_sora"
    }
  },
  "campaigns": {
    "campaignId": {
      "title": "Nombre de Campaña",
      "roleId": "roleId",
      "pipeline": "voice_only" | "avatar_sora"
    }
  }
}
```

### Pipelines Disponibles

- **voice_only**: Solo voz (Deepgram STT + Cartesia TTS)
- **avatar_sora**: Voz + Avatar Sora (futuro)

## Añadir Nuevos Roles

### Método 1: Editar dialplan.json manualmente

1. Abre `callcenter/config/dialplan.json`
2. Añade el nuevo rol en `roles`:

```json
"nuevo_rol": {
  "title": "Nuevo Rol",
  "pipeline": "voice_only"
}
```

3. Guarda el archivo

### Método 2: Generar automáticamente

```bash
node scripts/generate-dialplan.js
```

Este script:
- Lee `core/roles-system.js` (si existe)
- Genera entradas para todos los roles encontrados
- Asigna `avatar_sora` a roles infantiles/educativos
- Asigna `voice_only` al resto

## Añadir Nuevas Campañas

Edita `callcenter/config/dialplan.json` y añade en `campaigns`:

```json
"mi_campana": {
  "title": "Mi Campaña",
  "roleId": "concierge",
  "pipeline": "voice_only"
}
```

## Uso

### Desde la UI

1. Abre `desktop-app/renderer/callcenter.html` en Electron
2. Verás una grid con todos los roles configurados
3. Haz clic en un rol para iniciar la llamada
4. El ringback sonará hasta que STT se conecte
5. Usa el botón "Colgar" para finalizar

### Por Campaña (Query String)

```
callcenter.html?campaign=guarderias
```

Esto iniciará automáticamente la llamada con el rol configurado para esa campaña.

### Comandos de Voz

- **Wake-word**: "Hola Sandra"
- **Iniciar llamada**: "llama [nombre del rol]"
- **Colgar**: "finaliza", "termina", "corta", "cuelga"

### Desde Código (IPC)

```javascript
// Listar rutas disponibles
const routes = await window.sandraAPI.ccListRoutes();

// Iniciar por rol
const result = await window.sandraAPI.ccStartByRole('concierge');

// Iniciar por campaña
const result = await window.sandraAPI.ccStartByCampaign('guarderias');

// Colgar
await window.sandraAPI.ccEnd(sessionId);
```

## Integración con Roles System

El CallCenter **NO modifica** `core/roles-system.js`. Solo:

1. Activa el rol mediante `rolesSystem.activateRole(roleId)` antes de iniciar la llamada
2. El RoleLock del sistema de roles garantiza que solo un rol esté activo por sesión
3. El Multimodal Conversation Service usa el rol activo para generar respuestas

## Troubleshooting

### Error: "multimodal_service_unavailable"

- Verifica que el servicio multimodal esté inicializado en `global.serviceManager`
- Revisa los logs de inicialización en `main.js`

### Error: "role_not_found"

- El `roleId` no existe en `dialplan.json`
- Ejecuta `node scripts/generate-dialplan.js` para actualizar

### Ringback no se detiene

- Verifica que `onSTTConnectionChange` esté funcionando
- Revisa que Deepgram se conecte correctamente

### Rol no se activa

- Verifica que `rolesSystem.activateRole` esté disponible
- Revisa los logs del servicio de roles

## Próximos Pasos

- [ ] Integrar Avatar Sora cuando esté disponible
- [ ] Añadir métricas de llamadas (duración, coste)
- [ ] Dashboard de campañas activas
- [ ] Grabación de llamadas opcional

