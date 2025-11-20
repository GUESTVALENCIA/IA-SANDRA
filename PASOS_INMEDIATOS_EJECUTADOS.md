# ✅ Pasos Inmediatos - Ejecutados

**Fecha**: 20 de noviembre de 2025

## ✅ PASO 1: SiteCleaner

**Estado**: ✅ **YA COMPLETADO**

- ✅ Workflow Netlify eliminado
- ✅ netlify.toml eliminado
- ✅ Repo corporativo limpio
- ✅ Solo queda configuración de Vercel

---

## ✅ PASO 2: Trigger Vercel Deploy

**Acción**: Commit trivial realizado

- ✅ `guests-pwa/README.md` actualizado
- ✅ Commit: `docs: trigger vercel deploy`
- ✅ Push a main completado
- ⏳ Workflow de Vercel se ejecutará automáticamente

**Verificar en**: https://github.com/GUESTVALENCIA/IA-SANDRA/actions

**Resultado esperado**: 
```
✅ Production: https://guestsvalencia.es
```

---

## ⏳ PASO 3: CostAlertAgent

**Estado**: ✅ Implementado, ⏳ Pendiente configuración SMTP

### Variables Necesarias

Añadir a `.env.pro` o GitHub Secrets:

```env
SMTP_URL=smtp://user:pass@smtp.mailgun.org:587
ALERT_EMAIL_TO=contabilidad@guestsvalencia.es
COST_LIMIT=5
```

### Para Activar

```bash
npm run cost-alert
```

O con PM2:
```bash
pm2 start npm --name "cost-alert" -- run cost-alert
pm2 save
```

**Funcionamiento**:
- Verifica costes cada día a las **06:05** (Europe/Madrid)
- Envía email si el coste supera el límite ($5 por defecto)
- Lee logs de `logs/costs-*.jsonl`

---

## 📋 Checklist

- [x] SiteCleaner completado
- [x] Commit trivial realizado (trigger Vercel)
- [x] CostAlertAgent implementado
- [ ] SMTP_URL configurado en `.env.pro`
- [ ] ALERT_EMAIL_TO configurado en `.env.pro`
- [ ] CostAlertAgent en ejecución

---

## 🚀 Próximos Pasos

1. ⏳ Verificar que el workflow de Vercel se ejecuta correctamente
2. ⏳ Configurar SMTP_URL y ALERT_EMAIL_TO
3. ⏳ Activar CostAlertAgent
4. ⏳ Afinar PWA (WhatsApp Business, textos legales, etc.)

---

**Última actualización**: Pasos 1 y 2 completados, paso 3 pendiente configuración SMTP

