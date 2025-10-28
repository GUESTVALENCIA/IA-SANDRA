# 🚀 SANDRA MOBILE - NETLIFY SETUP GUÍA RÁPIDA

## Estado Actual
✅ Repo actualizado con todo el pack funcional
✅ Netlify.toml configurado (/api/*)
✅ Functions listos: /api/chat, /api/tts
✅ PWA mobile listo: public/index.html
✅ .env local configurado para testing

## 📋 PASOS PARA DEPLOY

### 1. **Accede a Netlify**
- URL: https://app.netlify.com
- Site: sensational-pegasus-d56cc3

### 2. **Configura Environment Variables**
Ve a: Site settings → Environment variables

Añade EXACTAMENTE estas variables:

```
DEFAULT_MODE=dev
DEFAULT_LOCALE=es-ES

GROQ_API_KEY=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
GROQ_MODEL=llama-3.1-70b-versatile

OPENAI_API_KEY=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
OPENAI_MODEL=gpt-4o

ELEVENLABS_API_KEY=[TU_ELEVENLABS_KEY_AQUI]
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

CARTESIA_API_KEY=sk_car_67c5Tg8LMpR9G6unHvsvnw
CARTESIA_VOICE_ID=a0e99841-438c-4a64-b679-ae501e7d6091
```

### 3. **Build & Deploy**
El build debería arrancar automáticamente por el push a main.

Si no:
- Ve a Deploys → Trigger deploy → Deploy site

### 4. **Espera a que termine**
- Verde ✅ = OK
- Rojo ❌ = Revisa logs

### 5. **Testing en tu iPhone/Android**

#### iOS (Safari):
1. Abre: https://sensational-pegasus-d56cc3.netlify.app/
2. Toca "Compartir" (esquina inferior derecha)
3. Busca "Añadir a pantalla de inicio"
4. Nombra: "Sandra"
5. ¡Listo! Ahora es PWA instalada

#### Android (Chrome):
1. Abre: https://sensational-pegasus-d56cc3.netlify.app/
2. Espera prompt de instalar
3. Toca "Instalar"
4. ¡Listo!

### 6. **Prueba la app:**

**Con micrófono:**
- 🎤 Toca botón hablar
- Di "Hola Sandra"
- Ella te responde

**Con chat:**
- Escribe un mensaje
- Toca enviar (📤)
- Sandra responde por texto + voz

**Barge-in:**
- Empieza a hablar mientras Sandra habla
- Ella para TTS y te escucha

**Avatar:**
- Mira el círculo en la parte superior
- Ve cómo la "boca" se anima con el audio

---

## 🔧 Variables a Ajustar (Si Necesario)

### Cambiar de DEV (GROQ) a PROD (GPT-4)
En Netlify → Environment variables:
```
DEFAULT_MODE=prod
```

### Cambiar modelo de LLM
```
OPENAI_MODEL=gpt-4-turbo
```

### Cambiar voz TTS
- ElevenLabs: Consigue new ELEVENLABS_VOICE_ID en https://elevenlabs.io/app/voice-lab
- Cartesia: Consigue new CARTESIA_VOICE_ID en https://cartesia.ai

---

## 🐛 Troubleshooting

### Error 405 Method Not Allowed en /api/*
- [ ] Verifica que netlify.toml está en raíz
- [ ] Revisa que [[redirects]] apunta a .netlify/functions

### Micro no funciona
- [ ] Permiso iOS/Android: ¿Permitiste acceso?
- [ ] Check: Abre DevTools (F12) → Console → ¿Errores?

### Avatar no anima
- [ ] Verifica public/img/avatar-sandra.png existe
- [ ] Size debe ser ~300x300px
- [ ] Formato: PNG con fondo transparente

### TTS no suena
- [ ] ¿ELEVENLABS_API_KEY configurado?
- [ ] Si falla ElevenLabs → automáticamente usa Cartesia (fallback)
- [ ] Check Netlify Logs: Função /api/tts → Errors

### Respuestas lentas
- [ ] ¿DEFAULT_MODE=dev? Usa GROQ (más rápido para testing)
- [ ] Groq es <1s, OpenAI es ~2-3s
- [ ] Latencia objetivo: <800ms total (STT+LLM+TTS)

---

## 📊 URLs Importantes

| Component | URL |
|-----------|-----|
| **PWA Mobile** | https://sensational-pegasus-d56cc3.netlify.app/ |
| **Chat API** | /api/chat (POST) |
| **TTS API** | /api/tts (POST) |
| **Health Check** | /api/health (GET) |
| **Netlify Logs** | https://app.netlify.com/sites/sensational-pegasus-d56cc3/deploys |

---

## 💡 Siguientes Pasos (Cuando me Digas)

1. **LiveKit para video:**
   - Integrate LiveKit SDK en mobile
   - Avatar video sync con boca en tiempo real

2. **Comandos de voz privados:**
   - Di "SOS" → Snapshot
   - Di "Restaurar" → Restore
   - Conectar con tu Guardian Protocol

3. **Selector de idioma:**
   - Botonera: ES / EN / FR
   - Cambio en caliente
   - Todos los idiomas en TTS

4. **Roles orquestados:**
   - Cambiar persona de Sandra:
     - "Recepcionista" (amable, turismo)
     - "Developer" (técnico, code)
     - "Coach" (motivador, mindfulness)

---

## ✅ Checklist para ir en vivo

- [ ] Environment variables configuradas en Netlify
- [ ] Deploy green ✅ sin errores
- [ ] Testeo en iPhone (Safari PWA)
- [ ] Testeo en Android (Chrome PWA)
- [ ] Micrófono funciona
- [ ] Wake word "Hola Sandra" funciona
- [ ] Chat de texto funciona
- [ ] Avatar anima
- [ ] TTS suena
- [ ] Barge-in funciona

---

**Para Sandrita ❤️** — GuestsValencia

🚀 ¡Listo! Dime cuando acabes de configurar Netlify y te paso los siguientes pasos.
