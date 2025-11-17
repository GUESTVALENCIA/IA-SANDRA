# Configuración API y Modelos - Sandra IA 8.0 Pro

## 📋 Resumen de Configuración Actual

### API Keys Configuradas

Todas las claves API están almacenadas en `.env.pro` (archivo ignorado por Git):

```env
# OpenAI (Principal)
OPENAI_API_KEY=tu_clave_aqui

# Speech-to-Text
DEEPGRAM_API_KEY=tu_clave_aqui

# Text-to-Speech
CARTESIA_API_KEY=tu_clave_aqui

# Avatar
HEYGEN_API_KEY=tu_clave_aqui

# Base de datos
DATABASE_URL=tu_url_aqui
```

### Lógica de Uso de Modelos

#### Modo Voz/Video (Conversacional)
- **Clasificación rápida**: GPT-4o-mini
  - Genera placeholder inmediato
  - Clasifica intención del usuario
  - NO se vocaliza
  
- **Respuesta final**: GPT-4o
  - Genera respuesta completa
  - Filtrada con `markdownToSpeech()`
  - SE vocaliza UNA VEZ

#### Modo Texto
- **Modelo**: GPT-4o-mini
- Sin vocalización
- Respuesta directa

### Parámetros de Voz (Cartesia TTS)

#### Perfil Super-Calm (Predeterminado)
```javascript
{
  speed: 0.74,           // Velocidad pausada
  emotion: [
    { id: 'warm', strength: 0.25 }  // Calidez suave
  ],
  gain: -10              // Reducción de volumen para evitar metálico
}
```

#### Saludo
- Padding: 800ms antes, 400ms después
- Mismo perfil super-calm
- Archivo cacheado: `hello_supercalm.mp3`

### Sistema de Barge-in

- **Cooldown**: 3 segundos entre interrupciones
- **Tiempo mínimo de habla**: 1200ms (Sandra debe hablar >1.2s antes de permitir interrupción)
- **Palabras mínimas**: 4 palabras sostenidas por 1 segundo
- **Ventana anti-prisa**: 1 segundo después del saludo con barge-in desactivado

### Timeout BrightData

- **Timeout**: 1500ms
- **Placeholder**: "Déjame verificar opciones..." (si tarda >1s)
- **Comportamiento**: Si no responde a tiempo, no menciona alojamientos

## 🔧 Cómo Configurar OpenAI API

### 1. Obtener API Key

1. Accede a [platform.openai.com](https://platform.openai.com)
2. Ve a "API Keys"
3. Crea una nueva clave
4. Copia la clave (solo se muestra una vez)

### 2. Configurar en Sandra IA

Edita el archivo `.env.pro` en la raíz del proyecto:

```bash
OPENAI_API_KEY=sk-proj-...tu_clave_completa_aqui
```

**Importante**: La clave debe estar en una sola línea, sin saltos de línea.

### 3. Verificar Configuración

El sistema valida la clave al iniciar. Si hay error, verás:

```
❌ OpenAI API Key inválida o expirada.

Por favor:
1. Verifica tu clave en .env.pro
2. Asegúrate de que la clave sea válida
3. Verifica que tu cuenta OpenAI tenga créditos
```

## 📊 Pipeline de Respuesta

```
Usuario habla
    ↓
[Deepgram STT] → Transcripción
    ↓
[GPT-4o-mini] → quickIntent (clasificación + placeholder)
    ↓
[Placeholder mostrado en UI] (draft=true, NO vocalizado)
    ↓
[BrightData] → Datos en tiempo real (timeout 1500ms)
    ↓
[GPT-4o] → Respuesta final
    ↓
[markdownToSpeech()] → Filtrado (sin Markdown/emojis)
    ↓
[Cartesia TTS] → Audio (perfil super-calm)
    ↓
[UI + Audio] → Respuesta vocalizada (messageId, draft=false)
```

## 🎯 Filtrado de Texto para TTS

La función `markdownToSpeech()` elimina:

- Bloques de código: ` ```...``` `
- Código inline: `` `...` ``
- Enlaces: `[texto](url)`
- Imágenes: `![alt](url)`
- Negritas/cursivas: `**...**`, `*...*`
- Encabezados: `### ...`
- Emojis y pictogramas
- Prefijos de lista: `1.`, `-`, `*`, `•`
- **Filtro final**: Solo letras, números, puntuación básica (.,¡!¿?) y espacios

## 🔍 Logs de TTS

Cada generación de audio registra:

```javascript
🔊 [TTS] {
  text: "Hola, soy Sandra. ¿En qué puedo ayudarte?",
  chars: 42,
  profile: {
    speed: 0.74,
    emotion: [{ id: 'warm', strength: 0.25 }],
    gain: -10
  }
}
```

Útil para afinar parámetros en caliente.

## ⚠️ Solución de Problemas

### Error: "Incorrect API key provided"

1. Verifica que la clave en `.env.pro` sea correcta
2. Asegúrate de que esté en una sola línea
3. Verifica que tu cuenta OpenAI tenga créditos
4. Reinicia la aplicación

### Error: "Cannot find module"

1. Verifica que todos los archivos de servicios estén presentes
2. Ejecuta `npm install` para instalar dependencias
3. Reinicia la aplicación

### Voz metálica o estresada

1. Verifica que el perfil `superCalm` esté configurado
2. Ajusta `gain` (más negativo = más suave)
3. Ajusta `speed` (más bajo = más pausado)
4. Ajusta `emotion.strength` (más bajo = menos intenso)

### Botón de llamada duplicado

El sistema ahora solo usa el botón bajo el avatar (`btn-convo-call`).
La función `initCallCenterSystem()` ha sido eliminada para evitar duplicados.

## 📝 Estructura Completa de .env.pro

```env
# OpenAI (Principal)
OPENAI_API_KEY=sk-proj-...

# Groq (Opcional, no usado actualmente)
GROQ_API_KEY=gsk_...

# Speech-to-Text
DEEPGRAM_API_KEY=...

# Text-to-Speech
CARTESIA_API_KEY=...
CARTESIA_VOICE_ID=a0e99841-438c-4a64-b679-ae501e7d6091

# Avatar
HEYGEN_API_KEY=...

# Base de datos
DATABASE_URL=postgresql://...
```

## 🎬 Sistema de Persistencia de Video Avatar

### Funcionalidad

El video del avatar ahora se guarda automáticamente en `localStorage` y se carga al abrir la aplicación.

### Características

- **Guardado automático**: Al cargar un video, se guarda automáticamente
- **Carga automática**: Al abrir la aplicación, se carga el último video guardado
- **Botón de eliminación**: Botón 🗑️ para eliminar el video guardado
- **Indicador de estado**: Muestra el nombre del video cargado/guardado

### Uso

1. **Cargar video**:
   - Haz clic en el selector de archivo
   - Selecciona un video (MP4, WebM, etc.)
   - El video se carga y se guarda automáticamente
   - Verás: `✅ Guardado: nombre_del_video.mp4`

2. **Video persistente**:
   - Al cerrar y abrir la aplicación, el video se carga automáticamente
   - Verás: `📹 Cargado: nombre_del_video.mp4`

3. **Eliminar video**:
   - Haz clic en el botón 🗑️
   - Confirma la eliminación
   - El video se elimina de localStorage
   - Verás: `🗑️ Video eliminado`

### Limitaciones

- **Tamaño máximo**: localStorage tiene un límite de ~5-10MB
- **Videos grandes**: Si el video es muy grande, verás: `❌ Error al guardar (video muy grande)`
- **Solución**: Usa videos más pequeños o comprimidos

### Datos Guardados

El sistema guarda en localStorage:
- `sandra_avatar_video`: Video en formato base64
- `sandra_avatar_video_name`: Nombre del archivo
- `sandra_avatar_video_type`: Tipo MIME del video

## 🚀 Próximos Pasos

1. **Reinicia la aplicación** para cargar todos los cambios
2. **Carga un video avatar** (se guardará automáticamente)
3. **Prueba una conversación** para verificar:
   - Saludo pausado y suave
   - Placeholder inmediato
   - Respuesta sin Markdown/emojis
   - Barge-in coherente (>1.2s de habla)
4. **Observa los logs** de TTS para afinar parámetros si es necesario
5. **Ajusta parámetros** en `cartesia-service.js` si la voz necesita más refinamiento

---

**Última actualización**: Noviembre 2024
**Versión**: Sandra IA 8.0 Pro v8.0.0
