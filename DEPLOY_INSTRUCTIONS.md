# 🚀 INSTRUCCIONES DE DEPLOYMENT

## ✅ BUILD COMPLETADO

El build de producción se completó exitosamente:
- ✅ Validaciones pasadas
- ✅ Manifest generado
- ✅ Service Worker validado
- ✅ Archivos copiados a `dist/`

## 📋 PASOS PARA DEPLOY

### Opción 1: Deploy Manual a Netlify

1. **Instalar Netlify CLI** (si no está instalado):
   ```bash
   npm install -g netlify-cli
   ```

2. **Autenticarse**:
   ```bash
   netlify login
   ```

3. **Linkear sitio** (si es la primera vez):
   ```bash
   netlify link
   ```
   O especificar Site ID:
   ```bash
   netlify link --name sandra-devconsole
   ```

4. **Deploy**:
   ```bash
   netlify deploy --prod --dir=frontend
   ```

### Opción 2: Deploy desde Netlify Dashboard

1. Ir a https://app.netlify.com
2. Seleccionar sitio o crear nuevo
3. Configurar:
   - **Build command**: `npm run build:prod`
   - **Publish directory**: `frontend`
   - **Functions directory**: `netlify/functions`
4. Connect Git repository (opcional)
5. Deploy manual o automático

### Opción 3: Deploy via GitHub Actions (Automático)

1. Configurar secrets en GitHub:
   - `NETLIFY_AUTH_TOKEN`
   - `NETLIFY_SITE_ID`

2. Hacer push a `main`:
   ```bash
   git push origin main
   ```

3. GitHub Actions ejecutará el deploy automáticamente

---

## ⚠️ ANTES DE DEPLOY

### 1. Configurar API Keys en Netlify Dashboard

**CRÍTICO**: Configurar en Netlify → Site settings → Environment variables:

```
OPENAI_API_KEY=sk-...
CARTESIA_API_KEY=...
DEEPGRAM_API_KEY=...
HEYGEN_API_KEY=...
NODE_ENV=production
ALLOWED_ORIGIN=https://sandra.guestsvalencia.es
BASE_URL=https://sandra.guestsvalencia.es
```

Ver: `docs/CONFIGURAR_API_KEYS_NETLIFY.md`

### 2. Verificar netlify.toml

✅ Ya está configurado correctamente:
- Publish directory: `frontend`
- Functions: `netlify/functions`
- Headers de seguridad
- Redirects configurados

---

## 🧪 VERIFICACIÓN POST-DEPLOY

Después del deploy, verificar:

1. **Sitio online**:
   ```bash
   curl https://sandra.guestsvalencia.es
   ```

2. **Manifest accesible**:
   ```bash
   curl https://sandra.guestsvalencia.es/manifest.json
   ```

3. **Service Worker**:
   ```bash
   curl https://sandra.guestsvalencia.es/sw.js
   ```

4. **Netlify Function**:
   ```bash
   curl -X POST https://sandra.guestsvalencia.es/.netlify/functions/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "test"}'
   ```

5. **CORS Preflight**:
   ```bash
   curl -X OPTIONS https://sandra.guestsvalencia.es/.netlify/functions/chat \
     -H "Origin: https://sandra.guestsvalencia.es" \
     -H "Access-Control-Request-Method: POST" \
     -v
   ```

---

## 📊 ESTADO ACTUAL

- ✅ Build completado
- ✅ Validaciones pasadas
- ✅ Archivos listos en `dist/`
- ⚠️ Pendiente: Deploy a Netlify
- ⚠️ Pendiente: Configurar API keys en Netlify Dashboard

---

**Próximo paso**: Ejecutar deploy según una de las opciones arriba.

