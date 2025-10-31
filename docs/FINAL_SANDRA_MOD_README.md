# Guía de integración para Sandra IA Mobile (Prompts + Orquestador)

Este paquete contiene los archivos necesarios para finalizar la integración de Sandra IA Mobile con el orquestador central y unificar los prompts y políticas. Sigue estos pasos para incorporar estos cambios en tu proyecto.

## Estructura de archivos

- `prompts/common-prompts.json` – Define el mensaje de sistema y los roles de subagentes (dev, business, comms, voice, vision) que la IA utilizará de forma consistente.
- `policies/guardian.md` – Documenta las políticas de privacidad, seguridad, sesgo y uso de subagentes.
- `mobile/orchestrator-bridge.js` – Función que envía las preguntas del usuario al backend orquestador y devuelve la respuesta estructurada.
- `mobile/orchestrator-integration-example.js` – Ejemplo de cómo integrar `sendMessage` en el código de tu PWA.
- `README.md` – Esta guía.

## 1. Unificar prompts y políticas

1. Copia el archivo `prompts/common-prompts.json` dentro de tu proyecto en una ubicación accesible.  
2. Carga las definiciones desde tu backend (por ejemplo, al arrancar el servidor) y usa la clave `system` como prompt inicial.  
3. Cuando un subagente intervenga, usa los prompts específicos de `agents` para contextualizar la respuesta.

## 2. Políticas Guardian

Consulta `policies/guardian.md` y asegúrate de que tu backend cumpla estas directrices. Integra la verificación de datos sensibles y la selección de subagentes según estas reglas.

## 3. Orquestador Bridge

1. Copia `mobile/orchestrator-bridge.js` en tu carpeta de scripts móviles.  
2. En tu fichero `sandra-ia-mobile-galaxy.html` (o en el componente que gestione el chat), importa la función:

```html
<script type="module">
  import { sendMessage } from './mobile/orchestrator-bridge.js';

  async function handleUserInput(text) {
    const result = await sendMessage(text, { sessionId: currentSessionId, userId: currentUserId });
    if (result.error) {
      // manejar error
    } else {
      // mostrar result.response en el chat y ejecutar acciones si es necesario
    }
  }
</script>
```

3. Sustituye las llamadas directas a OpenAI/Groq en tu PWA por esta función. Ajusta `API_BASE` en `orchestrator-bridge.js` para que apunte a la URL de tu backend.

## 4. Adaptar modo offline

- Añade un detector de conectividad (`navigator.onLine`) y muestra un aviso o guarda las interacciones en una cola local si la red no está disponible.  
- Envía la cola al orquestador cuando la conexión se recupere para no perder mensajes.

## 5. Generar APK y TestFlight

- Utiliza `scripts/build-downloads.js` (ya presente en tu proyecto) para generar la APK y configurar TestFlight. Este script copiará tu APK y generará la página de descarga actualizada con la información del orquestador.

Con esta integración, tu app móvil aprovechará todo el potencial de Sandra IA y sus subagentes. Si necesitas ayuda adicional para adaptar el código, no dudes en contactarme.
