## Workflow pendiente Sandra IA 8.0

### Contexto actual
- **FASE 1** (Multimodal premium) parcialmente completada. Falta:
  - 1.2 `Barge-in` en tiempo real (interrumpir respuesta del avatar al detectar voz del usuario).
  - 1.2 Conversación continua (modo “sin clicks”) estable.
  - 1.3 Avatar HeyGen con WebRTC real (sin placeholder, video en vivo en `#heygen-avatar-video`).
- **FASE 4** (ruteo de modelos) pendiente de refinamiento:
  - Seleccionar GPT-4o para voz/video y GPT-4o-mini para texto desde `llm-orchestrator/ai-orchestrator.js`.
  - Añadir fallback Claude (razonamiento) y preparar “Sandra Mini” con Groq para modo ahorro.
- `services/multimodal-conversation-service.js` se eliminó durante pruebas de barge-in y debe restaurarse antes de seguir.

### Pasos inmediatos
1. **Restaurar servicio multimodal**
   ```bash
   git checkout -- services/multimodal-conversation-service.js
   ```

2. **Implementar Barge-in en tiempo real**
   - Añadir estados (`lastBargeInAt`, `bargeInInProgress`) en la clase.
   - En `handleTranscript`, detectar interrupciones incluso con transcripciones intermedias.
   - `stopSpeaking(interrupted = false)` debe detener Cartesia y HeyGen (`task_type = 'interrupt'`), reactivar `isListening`.
   - `sendAudioData` debe convertir `ArrayBuffer`/`Uint8Array` a `Buffer` antes de enviarlo a Deepgram (para la llamada `sendAudioToLive`).

3. **Conversación continua**
   - Revisar `desktop-app/renderer/index.html` (toggles `continuous-mode` y `barge-in-toggle`).
   - Cuando `continuousMode` esté activo, `startMultimodalConversation` debe iniciar Deepgram Live y mantenerlo hasta que el usuario lo desactive.

4. **Avatar HeyGen con WebRTC**
   - Implementar `services/webrtc-avatar-manager.js` para usar `avatarConfig` que devuelve HeyGen (`sdp`, `iceServers`).
   - Conectar `video#heygen-avatar-video` al `MediaStream` remoto.
   - Actualizar UI con estados de avatar (conectado, escuchando, hablando, error).

5. **Ruteo inteligente de modelos (FASE 4)**
   - En `ai-orchestrator.js`, crear `selectModel(task, role, mode)`:
     - `mode === 'voice' || mode === 'video'` → `gpt-4o`.
     - `mode === 'text'` → `gpt-4o-mini`.
     - Casos de análisis complejo → Claude.
     - Sandra Lite (Groq) para tareas rápidas/económicas.
   - En `core/roles-system.js`, asegurar que `mode` se propaga correctamente a `ai.executeWithSubagent`.

6. **Commits pequeños y push tras cada bloque**
   - Restauración servicio → commit.
   - Barge-in real → commit.
   - Conversación continua + WebRTC → commit.
   - Ruteo modelos → commit.

### Archivos clave por fase
- `services/multimodal-conversation-service.js`
- `services/deepgram-service.js`
- `services/heygen-service.js`
- `services/webrtc-avatar-manager.js`
- `desktop-app/main.js`
- `desktop-app/preload.js`
- `desktop-app/renderer/index.html`
- `llm-orchestrator/ai-orchestrator.js`
- `core/roles-system.js`

Con este resumen podemos cerrar la sesión, reiniciar Cursor y retomar exactamente desde los puntos críticos sin perder el contexto del trabajo pendiente.

