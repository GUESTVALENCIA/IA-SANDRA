# 🚀 Vercel - Deployment Principal

**Fecha**: 20 de noviembre de 2025

## ✅ Decisión

**Vercel es la plataforma principal** hasta que Netlify se desbloquee.

---

## 📋 Configuración Vercel

### Proyecto
- **Nombre**: `guestsvalencia-site`
- **ID**: `prj_HNCaiegvbQcqBHrV8kZwttlKrDPe`
- **Repositorio**: `https://github.com/GUESTVALENCIA/guestsvalencia-site`

### Dominios Configurados
- ✅ `guestsvalencia.es` (A record: 76.76.21.21)
- ✅ `www.guestsvalencia.es` (CNAME: nuxwxfa4j.vercel-dns.com)

### Workflow GitHub Actions
- ✅ `.github/workflows/vercel.yml` creado
- ⏳ Pendiente: Añadir secrets en GitHub

---

## 🔐 Secrets Necesarios

**URL**: https://github.com/GUESTVALENCIA/IA-SANDRA/settings/secrets/actions

```
VERCEL_TOKEN = rTbbeIXzN70ZvXbG6L9Avj5d
VERCEL_ORG_ID = team_w9AY6yfr55sc9UzBFkS8OyY8
VERCEL_PROJECT_ID = prj_HNCaiegvbQcqBHrV8kZwttlKrDPe
```

---

## 🔧 Verificación

### Si ves `DEPLOYMENT_NOT_FOUND`:

1. Ve a: https://vercel.com/dashboard
2. Proyecto: **guestsvalencia-site**
3. **Deployments** → Selecciona el último
4. **Settings** → **Domains** → **Assign Domain**
5. Escribe: `guestsvalencia.es`

### Verificar Deployment:

```bash
curl -I https://guestsvalencia.es
```

Debería mostrar `200 OK` (no `404 NOT_FOUND`)

---

## ⚠️ Netlify - En Pausa

- 🔴 Deploy bloqueado (litigio en curso)
- ✅ Cuenta accesible
- ⏳ Esperando resolución

**Acción**: No usar Netlify hasta que se desbloquee.

---

## ✅ Estado Final

- ✅ Vercel configurado y funcionando
- ✅ Dominios apuntando a Vercel
- ✅ Workflow listo (pendiente secrets)
- ⏳ Netlify en pausa

---

**Última actualización**: Vercel como plataforma principal

