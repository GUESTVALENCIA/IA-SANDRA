Despliegue Vercel (aislado)

- Directorio raíz del sitio estático: `vercel-app/`
- Crear proyecto en Vercel con Root Directory = `vercel-app/`
- Crear dos Deploy Hooks (Preview / Production) en Vercel → pegarlos en GitHub Secrets:
  - `VERCEL_HOOK_PREVIEW`
  - `VERCEL_HOOK_PRODUCTION`
- Workflow GitHub Actions `/.github/workflows/vercel-deploy.yml` ya incluido: dispara el Hook cuando cambia `vercel-app/**`.
- `.vercelignore` evita subir el monorepo completo si la configuración de Vercel estuviera en la raíz.
- (Opcional) Ignored Build Step en Vercel:

```
if git diff --name-only $VERCEL_GIT_COMMIT_SHA^ $VERCEL_GIT_COMMIT_SHA -- vercel-app/ vercel-app/vercel.json | grep .; then
  echo "Cambios en vercel-app -> construir"
  exit 1
else
  echo "Sin cambios web -> ignorar build"
  exit 0
fi
```

Retención/Seguridad:
- `desktop-app/main.js` vigila `vercel-app/public/index.html` y `vercel-app/vercel.json` como archivos críticos; si se eliminan/rompen, se emitirá alarma y puede dispararse auto-restore (si está activado).


