# 📤 Script de Subida de Variables a Netlify

## 🚀 Uso Rápido

### Windows:
```cmd
scripts\upload-env-to-netlify.bat
```

### Linux/Mac:
```bash
./scripts/upload-env-to-netlify.sh
```

### Directo:
```bash
node scripts/upload-env-to-netlify.js
```

---

## 📋 Requisitos

1. ✅ Archivo `.env` o `.env.production` con tus API keys
2. ✅ Netlify Auth Token (ver instrucciones abajo)

---

## 🔑 Obtener Netlify Auth Token

1. Ir a: https://app.netlify.com/user/applications
2. Click "New access token"
3. Nombre: "Sandra DevConsole"
4. Copiar token

**Configurar una vez**:
```bash
# Windows
set NETLIFY_AUTH_TOKEN=tu_token

# Linux/Mac
export NETLIFY_AUTH_TOKEN=tu_token
```

O el script te pedirá el token interactivamente.

---

## ✅ Variables que se subirán

**Requeridas**:
- OPENAI_API_KEY
- DEEPGRAM_API_KEY
- CARTESIA_API_KEY
- HEYGEN_API_KEY

**Opcionales**:
- ANTHROPIC_API_KEY
- GROQ_API_KEY
- NODE_ENV
- ALLOWED_ORIGIN
- BASE_URL
- REQUIRE_AUTH

---

**Listo para usar** 🚀

