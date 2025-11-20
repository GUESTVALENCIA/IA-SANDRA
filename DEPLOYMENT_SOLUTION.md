# ✅ Solución al Error 404: DEPLOYMENT_NOT_FOUND

## 🔍 Diagnóstico

El error **404: DEPLOYMENT_NOT_FOUND** significa que:
- ✅ El dominio está configurado correctamente en Vercel
- ✅ El proyecto existe (`prj_xEESQwQomxT8svc4Q82AfIXny9Wu`)
- ❌ **NO hay un deployment activo** que sirva el contenido

## ✅ Solución: Activar Deploy Automático

El problema se resolverá automáticamente cuando el **workflow de GitHub Actions** se ejecute. Para activarlo:

### Opción 1: Hacer un cambio en guests-pwa (Recomendado)

```bash
# Hacer un cambio mínimo para activar el workflow
echo "# Guests-Valencia PWA" > guests-pwa/README.md

git add guests-pwa/README.md
git commit -m "chore: trigger Vercel deploy"
git push
```

Esto activará el workflow `.github/workflows/vercel.yml` que:
1. Construye la PWA
2. Hace deploy a Vercel
3. Asocia el deployment con el dominio

### Opción 2: Ejecutar Workflow Manualmente

1. Ve a: https://github.com/GUESTVALENCIA/IA-SANDRA/actions
2. Selecciona "Deploy PWA to Vercel"
3. Click en "Run workflow" → "Run workflow"

### Opción 3: Deploy Manual con Vercel CLI

```bash
cd guests-pwa
npm run build

# Configurar token
$env:VERCEL_TOKEN = "rTbbeIXzN70ZvXbG6L9Avj5d"

# Deploy
npx vercel --prod --token $env:VERCEL_TOKEN --yes
```

## 📋 Estado Actual

- ✅ **Proyecto Vercel**: `guests-pwa` (prj_xEESQwQomxT8svc4Q82AfIXny9Wu)
- ✅ **Dominios configurados**:
  - `www.guestsvalencia.es` ✅ Verificado
  - `guestsvalencia.es` ✅ Verificado
- ✅ **Build funciona**: `npm run build` ✅
- ⏳ **Deployment pendiente**: Necesita primer deploy

## 🎯 Próximos Pasos

1. **Hacer un cambio mínimo** en `guests-pwa/` (ej: actualizar README)
2. **Commit y push** a `main`
3. **Verificar workflow** en GitHub Actions
4. **Esperar deploy** (2-5 minutos)
5. **Probar** `https://www.guestsvalencia.es`

## ✅ Una vez resuelto

Después del primer deploy:
- ✅ El dominio mostrará la PWA
- ✅ Los siguientes cambios se desplegarán automáticamente
- ✅ No más errores 404

## 🔍 Verificar Deploy

```bash
# Ver deployments
$env:VERCEL_TOKEN = "rTbbeIXzN70ZvXbG6L9Avj5d"
$env:VERCEL_ORG_ID = "team_w9AY6yfr55sc9UzBFkS8OyY8"

$response = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=prj_xEESQwQomxT8svc4Q82AfIXny9Wu&teamId=$env:VERCEL_ORG_ID&limit=3" -Headers @{ "Authorization" = "Bearer $env:VERCEL_TOKEN" }
$response.deployments | Select-Object uid, state, url
```

**Dashboard Vercel**: https://vercel.com/guests-valencias-projects/guests-pwa/deployments

