# 📈 Monitoring Setup (Sentry + UptimeRobot)

## 1) Sentry (Error Tracking)

### Crear proyecto
1. Ir a https://sentry.io/
2. Crear organización/proyecto (JavaScript/Browser y Node.js)
3. Copiar el DSN

### Frontend (Browser)
Agregar snippet de Sentry al `index.html` (opcional, solo si quieres errores del cliente):

```html
<script src="https://browser.sentry-cdn.com/7.116.0/bundle.tracing.replay.min.js" integrity="sha384-..." crossorigin="anonymous"></script>
<script>
Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
</script>
```

### Netlify Functions (Node.js)
Envolver handlers con captura básica:

```js
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });

exports.handler = async (event, context) => {
  try {
    // ... lógica
  } catch (err) {
    Sentry.captureException(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
```

Instalar dependencias en funciones si usas bundling personalizado.

## 2) UptimeRobot (Uptime + Latency)

1. Ir a https://uptimerobot.com/
2. Crear monitor tipo HTTPS apuntando a:
   - `https://sandra.guestsvalencia.es` (sitio)
   - `https://sandra.guestsvalencia.es/.netlify/functions/health` (función)
3. Notificaciones por email/Telegram/Slack

## 3) Netlify Analytics
- Activar Netlify Analytics en el Dashboard para métricas de tráfico y rendimiento

## 4) Alertas de Coste (Opcional)
- Configurar alertas de uso en OpenAI/Deepgram/Cartesia desde sus dashboards

---

Con esto, tendrás visibilidad de errores, uptime y rendimiento en producción.
