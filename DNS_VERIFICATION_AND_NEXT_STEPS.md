# ✅ DNS Verificado - Próximos Pasos

**Fecha**: 20 de noviembre de 2025

## ✅ Estado DNS

Los DNS ya están configurados correctamente en PiensaSolution:
- ✅ `guestsvalencia.es` → A `76.76.21.21` (Vercel)
- ✅ `www.guestsvalencia.es` → CNAME `nuxwxfa4j.vercel-dns.com` (Vercel)
- ✅ `site.guestsvalencia.es` → CNAME `sandra-guestsvalencia.netlify.app` (Netlify)
- ✅ `api.guestsvalencia.es` → CNAME `cname.vercel-dns.com`
- ✅ `sandra.guestsvalencia.es` → CNAME `cname.vercel-dns.com`

**Nota**: Los registros "no editables" son normales - PiensaSolution los bloquea para evitar cambios accidentales.

---

## 🔧 Próximos Pasos Completados

### 1. ✅ Workflow de Vercel Creado

**Archivo**: `.github/workflows/vercel.yml`

**Secrets necesarios en GitHub**:
- `VERCEL_TOKEN`: `rTbbeIXzN70ZvXbG6L9Avj5d`
- `VERCEL_ORG_ID`: (obtener de Vercel Dashboard → Settings → General)
- `VERCEL_PROJECT_ID`: `prj_HNCaiegvbQcqBHrV8kZwttlKrDPe`

**Cómo añadir secrets**:
1. Ve a: https://github.com/GUESTVALENCIA/IA-SANDRA/settings/secrets/actions
2. Haz clic en **New repository secret**
3. Añade cada uno de los secrets arriba

### 2. ✅ Commit Trivial Realizado

- Workflow añadido y pusheado
- Esto debería trigger un nuevo deployment en Vercel

### 3. ⏳ Verificar Deployment

Si ves `DEPLOYMENT_NOT_FOUND`:
1. Ve a: https://vercel.com/dashboard
2. Proyecto: **guestsvalencia-site**
3. **Deployments** → Selecciona el último
4. **Settings** → **Domains** → **Assign Domain**
5. Escribe: `guestsvalencia.es`

---

## 📋 CostAlertAgent - Listo para Ejecutar

El servicio de alerta de costes ya está implementado:

**Archivo**: `services/cost-alert/index.js`

**Variables necesarias**:
- `SMTP_URL`: URL SMTP (ej: `smtp://user:pass@smtp.mailgun.org:587`)
- `ALERT_EMAIL_TO`: Email destino (ej: `contabilidad@guestsvalencia.es`)
- `COST_LIMIT`: Límite USD diarios (default: 5)

**Ejecutar**:
```bash
npm run cost-alert
```

**Funcionalidad**:
- ✅ Verifica costes cada día a las 06:05 (Europe/Madrid)
- ✅ Envía email si el coste supera el límite
- ✅ Lee logs de `logs/costs-*.jsonl`

---

## ✅ Checklist Final

### DNS
- [x] DNS configurado en PiensaSolution
- [x] Valores correctos verificados
- [x] Registros bloqueados (normal)

### Vercel
- [x] Workflow creado
- [ ] Secrets añadidos en GitHub (pendiente)
- [ ] Deployment verificado
- [ ] Dominio asignado al deployment

### CostAlert
- [x] Servicio implementado
- [ ] Variables de entorno configuradas
- [ ] Servicio en ejecución

---

## 🚀 Cuando Esté Listo

**Avisa cuando**:
1. ✅ El deploy de Vercel muestre: `✅ Production: https://guestsvalencia.es`
2. ✅ Quieras ejecutar el bloque CostAlertAgent
3. ✅ Quieras afinar la PWA y documentación para Meta/WhatsApp Business

---

**Última actualización**: Workflow creado, pendiente añadir secrets en GitHub

