# 🔧 Solución al Error 404: DEPLOYMENT_NOT_FOUND

## ❌ Problema

El dominio `guestsvalencia.es` está configurado en Vercel, pero no hay un deployment activo. Esto causa el error:

```
404: NOT_FOUND
Code: DEPLOYMENT_NOT_FOUND
```

## ✅ Solución

Hay dos formas de resolverlo:

### Opción 1: Forzar Deploy Manual (Rápido)

Ejecuta el script de deploy manual:

```bash
# Configurar variables
$env:VERCEL_TOKEN = "rTbbeIXzN70ZvXbG6L9Avj5d"
$env:VERCEL_ORG_ID = "team_w9AY6yfr55sc9UzBFkS8OyY8"
$env:VERCEL_PROJECT_ID = "prj_xEESQwQomxT8svc4Q82AfIXny9Wu"

# Ejecutar deploy
node scripts/deploy-vercel-manual.js
```

O directamente con Vercel CLI:

```bash
cd guests-pwa
npm run build
npx vercel --prod --token $VERCEL_TOKEN --confirm \
  --org-id $VERCEL_ORG_ID --project-id $VERCEL_PROJECT_ID
```

### Opción 2: Activar Workflow de GitHub Actions (Automático)

El workflow se ejecuta automáticamente cuando hay cambios en `guests-pwa/**`. Para forzarlo:

1. **Hacer un cambio mínimo en guests-pwa** (ej: actualizar README)
2. **Commit y push:**
   ```bash
   git add guests-pwa/README.md
   git commit -m "chore: trigger Vercel deploy"
   git push
   ```
3. **Verificar en GitHub Actions:**
   - https://github.com/GUESTVALENCIA/IA-SANDRA/actions
   - Debe ejecutarse el workflow "Deploy PWA to Vercel"

## 🔍 Verificar Estado

### Ver deployments en Vercel:

```bash
$env:VERCEL_TOKEN = "rTbbeIXzN70ZvXbG6L9Avj5d"
$env:VERCEL_ORG_ID = "team_w9AY6yfr55sc9UzBFkS8OyY8"
$env:VERCEL_PROJECT_ID = "prj_xEESQwQomxT8svc4Q82AfIXny9Wu"

$response = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=$env:VERCEL_PROJECT_ID&teamId=$env:VERCEL_ORG_ID&limit=5" -Headers @{ "Authorization" = "Bearer $env:VERCEL_TOKEN" }
$response.deployments | Select-Object uid, state, url
```

### Verificar dominio:

```bash
$response = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$env:VERCEL_PROJECT_ID/domains?teamId=$env:VERCEL_ORG_ID" -Headers @{ "Authorization" = "Bearer $env:VERCEL_TOKEN" }
$response.domains | Select-Object name, verified
```

## 📋 Checklist

- [ ] Verificar que `guests-pwa` tiene contenido (App.jsx, etc.)
- [ ] Verificar que `guests-pwa/package.json` tiene script `build`
- [ ] Verificar que los secrets están en GitHub:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
- [ ] Ejecutar deploy manual o activar workflow
- [ ] Verificar que el deployment aparece en Vercel Dashboard
- [ ] Probar acceso a `https://www.guestsvalencia.es`

## 🎯 Resultado Esperado

Después del deploy:

1. ✅ Deployment aparece en Vercel Dashboard
2. ✅ `https://www.guestsvalencia.es` muestra la PWA
3. ✅ `https://guestsvalencia.es` redirige o muestra la PWA (según DNS)
4. ✅ No más errores 404

## 🆘 Si Sigue Fallando

1. **Verificar logs del deployment** en Vercel Dashboard
2. **Verificar que el build funciona localmente:**
   ```bash
   cd guests-pwa
   npm run build
   ```
3. **Verificar configuración de Vercel:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Revisar vercel.json** si existe configuración especial

