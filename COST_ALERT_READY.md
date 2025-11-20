# 💰 CostAlertAgent - Listo para Ejecutar

**Fecha**: 20 de noviembre de 2025

## ✅ Estado

El servicio de alerta de costes **ya está implementado** y listo para usar.

---

## 📁 Archivos

- **Servicio**: `services/cost-alert/index.js`
- **Test**: `testing/cost-alert.test.js`
- **Script**: `npm run cost-alert`

---

## ⚙️ Configuración

### Variables de Entorno Necesarias

Añade a `.env.pro`:

```env
# Cost Alert Configuration
SMTP_URL=smtp://user:pass@smtp.mailgun.org:587
ALERT_EMAIL_TO=contabilidad@guestsvalencia.es
COST_LIMIT=5
```

**Ejemplos de SMTP_URL**:
- Mailgun: `smtp://postmaster:password@smtp.mailgun.org:587`
- Gmail: `smtp://user:app_password@smtp.gmail.com:587`
- SendGrid: `smtp://apikey:KEY@smtp.sendgrid.net:587`

---

## 🚀 Ejecutar

### Opción 1: Directo
```bash
npm run cost-alert
```

### Opción 2: Con PM2 (recomendado para producción)
```bash
pm2 start npm --name "cost-alert" -- run cost-alert
pm2 save
```

### Opción 3: Como servicio del sistema
Configurar como servicio de Windows/Linux para que se ejecute automáticamente.

---

## ⏰ Funcionamiento

- **Frecuencia**: Todos los días a las **06:05** (Europe/Madrid)
- **Verificación**: Lee logs de `logs/costs-*.jsonl`
- **Umbral**: $5 USD por defecto (configurable con `COST_LIMIT`)
- **Acción**: Envía email si el coste supera el límite

---

## 📊 Qué Hace

1. Lee todos los archivos `logs/costs-*.jsonl`
2. Suma los costes de las últimas 24 horas
3. Si supera el límite → envía email de alerta
4. Si está OK → solo registra en consola

---

## ✅ Checklist

- [x] Servicio implementado
- [x] Test creado
- [x] Script en package.json
- [ ] Variables de entorno configuradas
- [ ] Servicio en ejecución

---

## 🎯 Próximo Paso

Cuando quieras activarlo, solo necesitas:
1. Añadir las variables de entorno a `.env.pro`
2. Ejecutar `npm run cost-alert`
3. O configurarlo como servicio permanente

---

**Estado**: ✅ Listo para usar cuando lo necesites

