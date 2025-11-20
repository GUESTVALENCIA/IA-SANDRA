# Configuración Vercel - Guests-Valencia PWA

## ✅ Configuración Completada

### Secrets en GitHub (Configurados automáticamente)

- ✅ `VERCEL_TOKEN` = Configurado
- ✅ `VERCEL_ORG_ID` = `team_w9AY6yfr55sc9UzBFkS8OyY8`
- ✅ `VERCEL_PROJECT_ID` = `prj_xEESQwQomxT8svc4Q82AfIXny9Wu`

### Proyecto Vercel

- **Nombre**: `guests-pwa`
- **ID**: `prj_xEESQwQomxT8svc4Q82AfIXny9Wu`
- **Org**: `guests-valencias-projects` (team_w9AY6yfr55sc9UzBFkS8OyY8)
- **Dashboard**: https://vercel.com/guests-valencias-projects/guests-pwa

### Dominio

- **Dominio principal**: `guestsvalencia.es`
- **Estado**: ✅ Verificado
- **Registros DNS actuales**:
  - `ALIAS @` → `cname.vercel-dns-017.com.`
  - `ALIAS *` → `cname.vercel-dns-017.com.`
  - `CAA` → `0 issue "letsencrypt.org"`

## 📋 Registros DNS Configurados

Los siguientes registros DNS ya están configurados en tu proveedor DNS:

```
Tipo    Nombre    Valor
----    ------    -----
ALIAS   @         cname.vercel-dns-017.com.
ALIAS   *         cname.vercel-dns-017.com.
CAA     @         0 issue "letsencrypt.org"
```

## 🚀 Deploy Automático

El deploy se activa automáticamente cuando:
- Se hace push a `main`
- Y hay cambios en `guests-pwa/**`, `package.json` o `.github/workflows/vercel.yml`

## 🔧 Scripts Disponibles

### Configurar Secrets (ya ejecutado)
```bash
GITHUB_TOKEN=xxx VERCEL_TOKEN=xxx node scripts/setup-vercel-secrets.js
```

### Configurar DNS
```bash
VERCEL_TOKEN=xxx VERCEL_ORG_ID=xxx VERCEL_PROJECT_ID=xxx node scripts/configure-vercel-dns.js
```

## 📱 URLs de Producción

Una vez desplegado, la PWA estará disponible en:
- **Vercel**: `https://guests-pwa.vercel.app` (temporal)
- **Dominio personalizado**: `https://guestsvalencia.es` (cuando DNS esté configurado)

## ✅ Estado Actual

- ✅ Proyecto creado en Vercel
- ✅ Secrets configurados en GitHub
- ✅ Dominio agregado al proyecto
- ✅ Workflow de deploy configurado
- ✅ DNS verificado

## 📝 Próximos Pasos

1. **Verificar deploy**: El siguiente push a `main` activará el deploy automático
2. **Verificar DNS**: Los registros DNS ya están configurados correctamente
3. **Probar PWA**: Una vez desplegado, verificar que funciona en `https://guestsvalencia.es`

## 🔍 Verificar Estado

```bash
# Ver deployments
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=prj_xEESQwQomxT8svc4Q82AfIXny9Wu&teamId=team_w9AY6yfr55sc9UzBFkS8OyY8"

# Ver dominio
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v4/domains/guestsvalencia.es?teamId=team_w9AY6yfr55sc9UzBFkS8OyY8"
```

