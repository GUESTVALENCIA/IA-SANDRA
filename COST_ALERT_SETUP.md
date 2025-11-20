# 🚨 Cost Alert Service - Configuración

## ✅ Implementación Completada

El servicio de alertas de costos diarias ha sido implementado y está listo para usar.

## 📋 Archivos Creados

- `services/cost-alert/index.js` - Servicio principal
- `services/cost-alert/README.md` - Documentación
- `testing/cost-alert.test.js` - Test básico
- Script agregado a `package.json`: `npm run cost-alert`

## 🔧 Configuración Requerida

### Variables de Entorno

Agrega estas variables a tu `.env.pro` o GitHub Secrets:

```env
SMTP_URL=smtp://user:pass@smtp.mailgun.org:587
ALERT_EMAIL_TO=contabilidad@guestsvalencia.es
COST_LIMIT=5  # USD (opcional, por defecto 5)
```

### Ejemplos de SMTP_URL

**Mailgun:**
```
SMTP_URL=smtp://postmaster@mg.guestsvalencia.es:password@smtp.mailgun.org:587
```

**Gmail (App Password):**
```
SMTP_URL=smtp://tu-email@gmail.com:app-password@smtp.gmail.com:587
```

**SendGrid:**
```
SMTP_URL=smtp://apikey:TU_API_KEY@smtp.sendgrid.net:587
```

## 🚀 Uso

### Ejecutar manualmente:
```bash
npm run cost-alert
```

### Ejecutar como servicio (PM2, systemd, etc.):
```bash
# Con PM2
pm2 start npm --name "cost-alert" -- run cost-alert

# O directamente
node services/cost-alert/index.js
```

## ⏰ Programación

- **Hora**: 06:05 (Europe/Madrid)
- **Frecuencia**: Diaria
- **Ejecución inicial**: Al arrancar el servicio

## 📊 Funcionamiento

1. Lee los archivos `logs/costs-*.jsonl`
2. Suma los costos de las últimas 24 horas
3. Compara con el límite configurado (`COST_LIMIT`)
4. Si supera el límite, envía email de alerta
5. Programa ejecución diaria a las 06:05

## 📧 Formato del Email

**Asunto:**
```
⚠️ Coste alto: $X.XX (últimas 24 h)
```

**Contenido:**
```
El gasto acumulado de OpenAI en las últimas 24 horas es $X.XX USD.

Umbral: $5
Hora: [fecha y hora]
```

## ✅ Verificación

### Test básico:
```bash
npm test -- testing/cost-alert.test.js
```

### Ejecución de prueba (sin SMTP):
```bash
# Sin SMTP_URL configurado, debe salir con código 0
node services/cost-alert/index.js
```

## 🔒 Seguridad

- Los tokens SMTP deben estar en variables de entorno
- No commitees credenciales en el código
- Usa GitHub Secrets para CI/CD

## 📝 Próximos Pasos

1. **Configurar SMTP_URL** en `.env.pro` o GitHub Secrets
2. **Configurar ALERT_EMAIL_TO** con el email de destino
3. **Opcional**: Ajustar `COST_LIMIT` según necesidades
4. **Ejecutar** el servicio o configurarlo como daemon
5. **Verificar** que el email llega mañana a las 06:05

## 🆘 Troubleshooting

### El servicio no envía emails:
- Verifica que `SMTP_URL` y `ALERT_EMAIL_TO` estén configurados
- Verifica que los logs de costos existan en `logs/costs-*.jsonl`
- Revisa los logs del servicio para errores

### El cron no se ejecuta:
- Verifica que el servicio esté corriendo
- Verifica la zona horaria (Europe/Madrid)
- Revisa los logs del servicio

### Email no llega:
- Verifica credenciales SMTP
- Revisa spam/correo no deseado
- Verifica que el servidor SMTP esté accesible

