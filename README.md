# Sandra IA · Mobile Conversational Pack (PWA + Netlify Functions)

Este paquete deja lista la **app móvil** con conversación por voz (**Barge‑In**), chat, avatar circular reactivo, y endpoints serverless para **LLM** y **TTS**. Se integra en un proyecto **Netlify**.

## Contenido
```
netlify/functions/chat/index.js   # /api/chat  (GROQ dev, OpenAI prod)
netlify/functions/tts/index.js    # /api/tts   (ElevenLabs -> Cartesia fallback)
public/js/sandra-mobile.js
public/css/sandra-mobile.css
public/img/avatar-sandra.png
netlify.toml                      
.env.example
```

## Variables de entorno (Netlify → Site settings → Environment variables)
- OPENAI_API_KEY, OPENAI_MODEL
- GROQ_API_KEY, GROQ_MODEL
- ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID
- CARTESIA_API_KEY, CARTESIA_VOICE_ID
- DEFAULT_MODE = dev | prod
- DEFAULT_LOCALE = es-ES | en-US | fr-FR

## Despliegue
1) Copia el contenido en la raíz del sitio en Netlify (o subcarpeta que sirva `public/`).
2) Define las variables en el panel de Netlify.
3) `netlify dev` o push a `main`.

iOS: Instalar PWA con **Compartir → Añadir a pantalla de inicio**.
Barge‑In: hablar mientras Sandra habla corta el TTS y atiende tu voz.
SOS: “SOS” o “Emergencia” dispara placeholder (sustitúyelo por tu rutina).
