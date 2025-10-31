# 📤 SUBIR VARIABLES A NETLIFY - INSTRUCCIONES

## 🚀 MÉTODO RÁPIDO (Recomendado)

### Paso 1: Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

### Paso 2: Preparar .env
Edita `.env` con tus API keys:
```
OPENAI_API_KEY=sk-proj-tu_key
DEEPGRAM_API_KEY=tu_key
CARTESIA_API_KEY=tu_key
HEYGEN_API_KEY=tu_key
```

### Paso 3: Ejecutar Script

**Windows**:
```cmd
scripts\upload-env-to-netlify-cli.bat
```

**Linux/Mac**:
```bash
./scripts/upload-env-to-netlify-cli.sh
```

El script:
1. ✅ Te pedirá login en Netlify (si no estás logueado)
2. ✅ Linkeará tu sitio automáticamente
3. ✅ Subirá todas las variables del .env
4. ✅ Te mostrará el resultado

---

## 📋 Scripts Disponibles

1. **`upload-env-to-netlify-cli.*`** - Usa Netlify CLI (Recomendado)
2. **`upload-env-to-netlify.*`** - Usa API directa (Alternativa)

---

## ✅ Verificar

Después de ejecutar:
1. Dashboard: https://app.netlify.com/sites/grand-pasca-a584d5/settings/env
2. O script: `node scripts/verify-api-keys.js`

---

**¡Listo para usar!** 🚀

