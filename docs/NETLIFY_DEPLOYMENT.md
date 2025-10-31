# 🚀 Guía de Deployment en Netlify

## 📋 Preparación

### 1. Configurar Variables de Entorno en Netlify

En Netlify Dashboard → Site settings → Environment variables:

```
NODE_ENV=production
ALLOWED_ORIGIN=https://sandra.guestsvalencia.es
REQUIRE_AUTH=true
AUTH_REQUIRED=true
API_KEYS=sk_prod_key_1,sk_prod_key_2
OPENAI_API_KEY=sk-...
CARTESIA_API_KEY=...
DEEPGRAM_API_KEY=...
HEYGEN_API_KEY=...
```

### 2. Build Settings

En `netlify.toml` ya configurado:
- Build command: `npm run build`
- Publish directory: `frontend`
- Functions directory: `netlify/functions`

### 3. Deploy

```bash
# Opción 1: Netlify CLI
netlify deploy --prod

# Opción 2: Git push (CI/CD automático)
git push origin main
```

## ✅ Verificación Post-Deploy

1. **Health Check**:
   ```bash
   curl https://sandra.guestsvalencia.es/.netlify/functions/health
   ```

2. **CORS Test**:
   ```bash
   curl -H "Origin: https://evil.com" \
        https://sandra.guestsvalencia.es/.netlify/functions/chat
   # Debe fallar con CORS error
   ```

3. **Rate Limit Test**:
   ```bash
   for i in {1..15}; do
     curl https://sandra.guestsvalencia.es/.netlify/functions/chat
     sleep 1
   done
   # Requests 11-15 deben retornar 429
   ```

---

**Estado**: ✅ Sistema listo para deploy en Netlify

