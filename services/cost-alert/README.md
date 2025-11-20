# Cost Alert Service

Servicio de alertas diarias por email cuando el coste de OpenAI supera un umbral.

## Configuración

### Variables de Entorno

```env
SMTP_URL=smtp://user:pass@smtp.mailgun.org:587
ALERT_EMAIL_TO=contabilidad@guestsvalencia.es
COST_LIMIT=5  # USD (opcional, por defecto 5)
```

### Ejemplos de SMTP_URL

**Mailgun:**
```
smtp://postmaster@mg.guestsvalencia.es:password@smtp.mailgun.org:587
```

**Gmail (App Password):**
```
smtp://tu-email@gmail.com:app-password@smtp.gmail.com:587
```

**SendGrid:**
```
smtp://apikey:TU_API_KEY@smtp.sendgrid.net:587
```

## Uso

```bash
npm run cost-alert
```

El servicio:
1. Se ejecuta inmediatamente al arrancar
2. Programa una ejecución diaria a las 06:05 (Europe/Madrid)
3. Lee los logs de costos de las últimas 24 horas
4. Envía email si el coste supera el límite

## Programación

- **Hora**: 06:05 (Europe/Madrid)
- **Frecuencia**: Diaria
- **Zona horaria**: Europe/Madrid

## Logs

El servicio lee los archivos `logs/costs-*.jsonl` generados por el cost-optimizer.

## Notas

- Si no se configuran `SMTP_URL` o `ALERT_EMAIL_TO`, el servicio sale con código 0
- El límite por defecto es $5 USD diarios
- El email incluye el coste acumulado y el umbral configurado

