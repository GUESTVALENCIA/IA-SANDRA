# 🔐 Guía: Configurar Secrets para GitHub Actions

## Requeridos para Deploy a Netlify

Configurar en GitHub → Settings → Secrets and variables → Actions → New repository secret

Secrets requeridos:

- `NETLIFY_AUTH_TOKEN`: Token personal de Netlify (User settings → Applications → Personal access tokens)
- `NETLIFY_SITE_ID`: ID del sitio (Netlify Dashboard → Site settings → Site information)

## Opcionales (según integración)

- `SENTRY_DSN`: DSN de Sentry para error tracking
- `UPTIMEROBOT_API_KEY`: API key para automatizar monitorización

## Verificación

1. Hacer push a `main`
2. Verificar ejecución del workflow en GitHub → Actions
3. Ver en logs: deploy exitoso

---

En caso de error: verifica que los secrets están correctamente definidos y que el workflow `.github/workflows/deploy.yml` existe en la rama.
