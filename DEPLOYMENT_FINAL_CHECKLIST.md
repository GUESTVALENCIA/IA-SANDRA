# ✅ Checklist Final - Deployment Vercel

**Fecha**: 20 de noviembre de 2025

## 📋 Estado Actual

### DNS
- ✅ Configurado en PiensaSolution
- ✅ Valores correctos verificados
- ✅ Registros bloqueados (normal - protección)

### Vercel
- ✅ Workflow `.github/workflows/vercel.yml` creado
- ✅ Commit realizado (debería trigger deployment)
- ✅ Dominios configurados: `guestsvalencia.es`, `www.guestsvalencia.es`
- ⏳ Pendiente: Añadir secrets en GitHub

### Netlify
- ✅ Limpieza completada (82 deployments eliminados)
- ✅ Sitio encontrado: `sandra-guestsvalencia`
- ✅ CNAME: `sandra-guestsvalencia.netlify.app`

---

## 🔐 Secrets de GitHub (PENDIENTE)

**URL**: https://github.com/GUESTVALENCIA/IA-SANDRA/settings/secrets/actions

**Añadir**:
1. `VERCEL_TOKEN` = `rTbbeIXzN70ZvXbG6L9Avj5d`
2. `VERCEL_ORG_ID` = `team_w9AY6yfr55sc9UzBFkS8OyY8`
3. `VERCEL_PROJECT_ID` = `prj_HNCaiegvbQcqBHrV8kZwttlKrDPe`

---

## 🚀 Próximos Pasos

### 1. Añadir Secrets en GitHub
- Ve a la URL arriba
- Añade los 3 secrets
- El workflow se ejecutará automáticamente

### 2. Verificar Deployment
- Ve a: https://vercel.com/dashboard
- Proyecto: **guestsvalencia-site**
- Verifica que el deployment está en estado **READY**

### 3. Asignar Dominio (si es necesario)
Si ves `DEPLOYMENT_NOT_FOUND`:
- Ve a: **Deployments** → Último deployment
- **Settings** → **Domains** → **Assign Domain**
- Escribe: `guestsvalencia.es`

### 4. Verificar Producción
```bash
curl -I https://guestsvalencia.es
```
Debería mostrar `200 OK` (no `404 NOT_FOUND`)

---

## ✅ CostAlertAgent

**Estado**: ✅ Implementado y listo

**Para activar**:
1. Añadir variables a `.env.pro`:
   - `SMTP_URL`
   - `ALERT_EMAIL_TO`
   - `COST_LIMIT` (opcional, default: 5)
2. Ejecutar: `npm run cost-alert`

---

## 🎯 Avisar Cuando

1. ✅ El deploy de Vercel muestre: `✅ Production: https://guestsvalencia.es`
2. ✅ Quieras ejecutar el bloque CostAlertAgent
3. ✅ Quieras afinar la PWA y documentación para Meta/WhatsApp Business

---

**Última actualización**: Workflow creado, pendiente secrets en GitHub

