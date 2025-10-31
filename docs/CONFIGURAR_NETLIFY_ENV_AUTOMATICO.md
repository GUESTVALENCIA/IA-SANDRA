# 🔑 Configurar Variables de Entorno en Netlify - Automático

## 🚀 MÉTODO AUTOMÁTICO (Recomendado)

### Paso 1: Preparar Archivo .env

Crear o editar `.env` o `.env.production` en la raíz del proyecto:

```bash
OPENAI_API_KEY=sk-proj-tu_key_aqui
DEEPGRAM_API_KEY=tu_deepgram_key
CARTESIA_API_KEY=sk_car_tu_key_aqui
HEYGEN_API_KEY=tu_heygen_key
ANTHROPIC_API_KEY=sk-ant-tu_key_aqui
GROQ_API_KEY=gsk_tu_key_aqui
NODE_ENV=production
ALLOWED_ORIGIN=https://sandra.guestsvalencia.es
BASE_URL=https://sandra.guestsvalencia.es
REQUIRE_AUTH=true
```

### Paso 2: Obtener Netlify Auth Token

1. Ir a: https://app.netlify.com/user/applications
2. Click en "New access token"
3. Dar un nombre (ej: "Sandra DevConsole")
4. Copiar el token generado

### Paso 3: Configurar Token (Una vez)

**Windows (PowerShell)**:
```powershell
$env:NETLIFY_AUTH_TOKEN="tu_token_aqui"
```

**Windows (CMD)**:
```cmd
set NETLIFY_AUTH_TOKEN=tu_token_aqui
```

**Linux/Mac**:
```bash
export NETLIFY_AUTH_TOKEN=tu_token_aqui
```

**O crear archivo `.netlify-token`** (se agregará al .gitignore):
```bash
echo "tu_token_aqui" > .netlify-token
```

### Paso 4: Ejecutar Script

**Windows**:
```cmd
scripts\upload-env-to-netlify.bat
```

**Linux/Mac**:
```bash
chmod +x scripts/upload-env-to-netlify.sh
./scripts/upload-env-to-netlify.sh
```

**Directo con Node**:
```bash
node scripts/upload-env-to-netlify.js
```

---

## 📋 QUÉ HACE EL SCRIPT

1. ✅ Lee variables desde `.env` o `.env.production`
2. ✅ Verifica que todas las variables requeridas existan
3. ✅ Se conecta a Netlify API
4. ✅ Crea o actualiza cada variable
5. ✅ Verifica que se subieron correctamente

---

## ✅ VARIABLES REQUERIDAS

El script subirá automáticamente:

### Críticas (context: all)
- `OPENAI_API_KEY`
- `DEEPGRAM_API_KEY`
- `CARTESIA_API_KEY`
- `HEYGEN_API_KEY`

### Opcionales (context: production)
- `ANTHROPIC_API_KEY` (para fallback)
- `GROQ_API_KEY` (para fallback)
- `NODE_ENV` (production)
- `ALLOWED_ORIGIN` (https://sandra.guestsvalencia.es)
- `BASE_URL` (https://sandra.guestsvalencia.es)
- `REQUIRE_AUTH` (true)

---

## 🔍 VERIFICACIÓN

Después de ejecutar el script:

1. **Verificar en Dashboard**:
   https://app.netlify.com/sites/grand-pasca-a584d5/settings/env

2. **Usar script de verificación**:
   ```bash
   node scripts/verify-api-keys.js
   ```

---

## ⚠️ TROUBLESHOOTING

### Error: "NETLIFY_AUTH_TOKEN requerido"
**Solución**: Configura el token como variable de entorno o ingrésalo cuando el script lo pida.

### Error: "Failed to create/update"
**Posibles causas**:
- Token inválido o expirado
- Permisos insuficientes
- Rate limiting (espera 1 minuto y reintenta)

### Error: "No se encontró archivo .env"
**Solución**: Crea `.env` o `.env.production` con tus API keys.

---

## 🔒 SEGURIDAD

✅ El script **NO** expone las API keys en logs  
✅ Las keys se envían directamente a Netlify API (HTTPS)  
✅ `.env` está en `.gitignore` (no se sube a Git)

---

**Estado**: ✅ Script listo para usar

**Próximo paso**: Ejecutar script y verificar en Dashboard 🚀

