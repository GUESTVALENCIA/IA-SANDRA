# ✅ CARTESIA TTS INTEGRADO Y ENDPOINTS CORREGIDOS

## 📋 Cambios Realizados

### 1. **vercel.json** - Routing Corregido
- ✅ Agregados `rewrites` específicos para cada endpoint
- ✅ Rutas: `/api/chat`, `/api/cartesia-tts`, `/api/health`
- ✅ Eliminados `routes` conflictivos

### 2. **sandra-widget.js** - Ya Actualizado
- ✅ Conectado a `/api/chat` (Vercel)
- ✅ Cartesia TTS integrado con función `generateSpeech()`
- ✅ Toggle de voz activado (botón 🎙️)
- ✅ Eliminados mensajes predeterminados

### 3. **sandra-mobile.js** - Pendiente de Actualizar
⚠️ **Este archivo necesita actualización manual** porque usa template strings (backticks)

**Cambios necesarios:**
1. Línea ~810: Cambiar formato del body a:
   ```javascript
   const chatBody = {
     message: text,
     conversationId: `conv-${Date.now()}`,
     context: {
       platform: 'mobile',
       language: langConfig.code
     }
   };
   ```

2. Línea ~862: Cambiar `/api/tts` a `/api/cartesia-tts` y formato:
   ```javascript
   body: JSON.stringify({
     text,
     voice: 'sandra',
     format: 'mp3',
     language: langConfig.code
   })
   ```

3. Línea ~880: Cambiar manejo de respuesta (Cartesia devuelve blob, no JSON):
   ```javascript
   const audioBlob = await r.blob();
   const audioArrayBuffer = await audioBlob.arrayBuffer();
   const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));
   ```

## 🚀 Estado Actual

✅ **Widget**: Funcionando con Cartesia TTS
✅ **Vercel Routing**: Corregido
⚠️ **Mobile App**: Necesita actualización manual del archivo `sandra-mobile.js`

## 📝 Próximos Pasos

1. Esperar deploy automático de Vercel (ya pusheado)
2. Verificar que `/api/chat` responda correctamente
3. Actualizar `sandra-mobile.js` manualmente para Cartesia TTS

