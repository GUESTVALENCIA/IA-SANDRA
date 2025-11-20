# 🚀 Estado Deployment Vercel

**Fecha**: 20 de noviembre de 2025

## ✅ Configuración Actual

### Proyecto
- **ID**: `prj_HNCaiegvbQcqBHrV8kZwttlKrDPe`
- **Nombre**: `guestsvalencia-site`
- **Repositorio**: `https://github.com/GUESTVALENCIA/guestsvalencia-site`

### Dominios
- ✅ `guestsvalencia.es` - Configurado en Vercel
- ✅ `www.guestsvalencia.es` - Configurado en Vercel
- ⚠️ `guestsvalencia.es` - **NO asignado al deployment actual**

### Deployment
- **Estado**: READY ✅
- **URL**: `guestsvalencia-site-nuxwxfa4j-guests-valencias-projects.vercel.app`
- **Alias**: (ninguno asignado)

---

## 🔧 Acción Requerida

### Asignar Dominio al Deployment

**Opción 1: Manual (Recomendado)**
1. Ve a: https://vercel.com/dashboard
2. Proyecto: **guestsvalencia-site**
3. **Deployments** → Selecciona el último deployment (estado READY)
4. **Settings** → **Domains** → **Assign Domain**
5. Escribe: `guestsvalencia.es`
6. Guarda

**Opción 2: Script Automático**
```bash
node scripts/assign-vercel-domain.js
```

---

## 📋 Workflow GitHub Actions

**Archivo**: `.github/workflows/vercel.yml`

**Nota**: Este workflow está configurado para `guests-pwa` (workspace en IA-SANDRA).
Si la PWA está en el repositorio separado `guestsvalencia-site`, el workflow se ejecutará allí.

**Secrets necesarios** (en ambos repos si aplica):
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

---

## ⚠️ Netlify - En Pausa

- 🔴 Deploy bloqueado
- ⏳ Esperando resolución del litigio
- ✅ Mantenernos en Vercel como solución principal

---

## ✅ Próximos Pasos

1. **Asignar dominio** `guestsvalencia.es` al deployment actual
2. **Verificar** que `https://guestsvalencia.es` funciona
3. **Añadir secrets** en GitHub para workflow automático
4. **Esperar** resolución de Netlify

---

**Última actualización**: Deployment READY, pendiente asignar dominio

