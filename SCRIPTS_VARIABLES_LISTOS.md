# ✅ SCRIPTS PARA SUBIR VARIABLES A NETLIFY - LISTOS

## 🎉 SCRIPTS CREADOS

### Opción 1: Netlify CLI (⭐ Recomendado)

**Windows**:
```cmd
scripts\upload-env-to-netlify-cli.bat
```

**Linux/Mac**:
```bash
chmod +x scripts/upload-env-to-netlify-cli.sh
./scripts/upload-env-to-netlify-cli.sh
```

**Ventajas**:
- ✅ Más simple (CLI oficial)
- ✅ Auto-autenticación
- ✅ Auto-link del sitio
- ✅ Manejo robusto de errores

---

### Opción 2: API Directa (Alternativa)

**Windows**:
```cmd
scripts\upload-env-to-netlify.bat
```

**Linux/Mac**:
```bash
chmod +x scripts/upload-env-to-netlify.sh
./scripts/upload-env-to-netlify.sh
```

**Requiere**:
- Netlify Auth Token (configurar como variable de entorno o ingresar cuando se pida)

---

## 📋 PRE-REQUISITOS

### Para Opción 1 (CLI):
```bash
npm install -g netlify-cli
```

### Para Opción 2 (API):
- Netlify Auth Token de: https://app.netlify.com/user/applications
- Configurar: `set NETLIFY_AUTH_TOKEN=tu_token` (Windows) o `export NETLIFY_AUTH_TOKEN=tu_token` (Linux/Mac)

---

## ✅ ARCHIVO .env REQUERIDO

Crear/editar `.env` o `.env.production` con:

```bash
OPENAI_API_KEY=sk-proj-tu_key
DEEPGRAM_API_KEY=tu_key
CARTESIA_API_KEY=tu_key
HEYGEN_API_KEY=tu_key
ANTHROPIC_API_KEY=tu_key
NODE_ENV=production
ALLOWED_ORIGIN=https://sandra.guestsvalencia.es
BASE_URL=https://sandra.guestsvalencia.es
REQUIRE_AUTH=true
```

---

## 🚀 EJECUTAR

1. **Preparar .env** con tus API keys
2. **Ejecutar script** (Opción 1 recomendada)
3. **Verificar** en Dashboard o con `node scripts/verify-api-keys.js`

---

## 📚 DOCUMENTACIÓN

- `SUBIR_VARIABLES_NETLIFY.md` - Guía rápida
- `README_UPLOAD_ENV.md` - Instrucciones detalladas
- `docs/CONFIGURAR_NETLIFY_ENV_AUTOMATICO.md` - Guía completa

---

**Estado**: ✅ **SCRIPTS LISTOS PARA USAR**

**Recomendación**: Usa Opción 1 (CLI) - Es más simple 🚀

