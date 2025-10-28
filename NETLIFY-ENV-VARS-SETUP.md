# 🔧 NETLIFY ENVIRONMENT VARIABLES - CONFIGURACIÓN MANUAL

## Acceso a Netlify

1. Abre: **https://app.netlify.com**
2. Busca tu site: **sensational-pegasus-d56cc3**
3. Ve a: **Site settings** (esquina superior derecha)
4. En el menú izquierdo: **Build & deploy** → **Environment**

---

## Variables a Añadir (Copia-Pega Exacto)

### Modo de funcionamiento
```
DEFAULT_MODE=dev
DEFAULT_LOCALE=es-ES
```

### LLM - GROQ (Dev/Barato)
```
GROQ_API_KEY=***REMOVED***
GROQ_MODEL=llama-3.1-70b-versatile
```

### LLM - OpenAI (Prod/GPT-4)
```
OPENAI_API_KEY=***REMOVED***
OPENAI_MODEL=gpt-4o
```

### TTS - ElevenLabs (Primario)
```
ELEVENLABS_API_KEY=sk_72e3c3e0c13f47e5b0c0a3c5f8e9c2d1
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

### TTS - Cartesia (Fallback)
```
CARTESIA_API_KEY=sk_car_67c5Tg8LMpR9G6unHvsvnw
CARTESIA_VOICE_ID=a0e99841-438c-4a64-b679-ae501e7d6091
```

---

## Pasos Exactos en Netlify

1. **Abre Build & deploy → Environment**

2. **Haz click en "Add variable"** (o similar, según versión)

3. **Para CADA variable:**
   - **Key:** El nombre (ej: DEFAULT_MODE)
   - **Value:** El valor (ej: dev)
   - Haz click **Save**

4. **Después de añadir todas:**
   - Netlify detecta cambios → **Rebuild automático** ✅
   - En la sección **Deploys**, verás:
     - Estado: "Building..." 🔄
     - Después: "Published" ✅ (verde)

5. **Espera a que termine (2-3 min)**

---

## ¿Cómo Saber que Está Desplegado?

En **Deploys** verás:
- **Verde ✅** = Listo
- **Rojo ❌** = Error (revisa logs)

URL de tu PWA:
```
https://sensational-pegasus-d56cc3.netlify.app
```

---

## Prueba Inmediata

Después de deploy verde ✅:

### En iPhone (Safari)
1. Abre: https://sensational-pegasus-d56cc3.netlify.app
2. Espera a que cargue completamente
3. Toca **Compartir** (esquina inferior derecha)
4. Busca y toca **"Añadir a pantalla de inicio"**
5. Dale nombre: "Sandra"
6. Toca **"Añadir"**
7. ¡PWA instalada en home!

### En Android (Chrome)
1. Abre: https://sensational-pegasus-d56cc3.netlify.app
2. Espera a que aparezca el aviso **"Instalar"** (esquina inferior)
3. Toca **"Instalar"**
4. ¡PWA instalada!

### Prueba la App
1. **Toca el botón 🎤 (micrófono)**
2. **Permite acceso al micrófono** (popup)
3. **Di "Hola Sandra"**
4. **Deberías ver:**
   - ✅ Transcripción en pantalla
   - ✅ Avatar círculo animando boca
   - ✅ Respuesta de Sandra por texto + voz
5. **Prueba barge-in:**
   - Empieza a hablar mientras Sandra habla
   - Ella debería pausar TTS y escucharte

---

## 🐛 Si Algo Falla

### Deploy rojo ❌
- Revisa **Logs** en Deploy
- Posibles errores:
  - `GROQ_API_KEY not found` → Variable no configurada
  - `Function error` → Código roto (unlikely)

### App no carga en iPhone
- Limpia cache: Settings → Safari → Clear History and Website Data
- Intenta de nuevo

### Micro no funciona
- ¿Permitiste acceso? (popup iOS)
- ¿Conexión HTTPS? (iOS requiere HTTPS)
- Abre DevTools (F12) → Console → ¿Errores?

### TTS no suena
- ¿ELEVENLABS_API_KEY válida?
- Si ElevenLabs falla → automáticamente usa Cartesia (fallback)
- Revisa **Netlify Logs** → Function `/api/tts`

### Avatar no anima
- Verifica archivo: `public/img/avatar-sandra.png` existe
- Tamaño: ~300x300px
- Formato: PNG con fondo transparente

---

## Próximos Comandos (Cuando Funcione)

CEO, una vez esté en vivo:
- Di "listo" → Activo LiveKit + avatar vídeo
- Di "snapshot" → Conecto Guardian + restore commands
- Di "idiomas" → Agrego selector ES/EN/FR

---

**HANNAH READY PARA SANDRA** 💚🔥

Para Sandrita ❤️ — GuestsValencia
