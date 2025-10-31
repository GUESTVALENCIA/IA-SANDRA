# 🔑 SUBIR VARIABLES A NETLIFY - GUÍA RÁPIDA

## ⚡ MÉTODO RÁPIDO (2 opciones)

### Opción 1: Netlify CLI (Recomendado - Más Simple)

#### 1. Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

#### 2. Preparar .env
Crear/editar `.env` con tus API keys:
```bash
OPENAI_API_KEY=sk-proj-...
DEEPGRAM_API_KEY=...
CARTESIA_API_KEY=...
HEYGEN_API_KEY=...
```

#### 3. Ejecutar Script

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
- ✅ Más simple (usa CLI oficial)
- ✅ Auto-autenticación (te pide login si no estás logueado)
- ✅ Auto-link del sitio
- ✅ Manejo de errores mejorado

---

### Opción 2: API Directa (Alternativa)

Si prefieres usar la API directamente:

#### 1. Preparar .env (igual que arriba)

#### 2. Obtener Token Netlify
1. https://app.netlify.com/user/applications
2. "New access token"
3. Copiar token
4. Configurar: `set NETLIFY_AUTH_TOKEN=tu_token` (Windows) o `export NETLIFY_AUTH_TOKEN=tu_token` (Linux/Mac)

#### 3. Ejecutar Script

**Windows**:
```cmd
scripts\upload-env-to-netlify.bat
```

**Linux/Mac**:
```bash
chmod +x scripts/upload-env-to-netlify.sh
./scripts/upload-env-to-netlify.sh
```

---

## 🔍 Verificar

Después del script, verificar en:
https://app.netlify.com/sites/grand-pasca-a584d5/settings/env

O usar:
```bash
node scripts/verify-api-keys.js
```

---

## ✅ RECOMENDACIÓN

**Usa Opción 1 (CLI)** - Es más simple y robusta 🚀

