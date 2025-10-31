/**
 * Sentry Configuration para Sandra IA
 * APM y Error Tracking
 */

let Sentry = null;
let initialized = false;

function initSentry() {
  if (initialized || process.env.NODE_ENV === 'development') {
    return;
  }

  try {
    // Dynamic require para evitar errores si no está instalado
    Sentry = require('@sentry/node');
    
    const dsn = process.env.SENTRY_DSN;
    if (!dsn) {
      console.warn('[Sentry] SENTRY_DSN no configurado, skipping initialization');
      return;
    }

    Sentry.init({
      dsn: dsn,
      environment: process.env.NODE_ENV || 'production',
      tracesSampleRate: 0.1, // 10% de requests para APM
      profilesSampleRate: 0.1,
      beforeSend(event) {
        // No enviar eventos en desarrollo
        if (process.env.NODE_ENV === 'development') {
          return null;
        }
        return event;
      },
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
      ],
    });

    initialized = true;
    console.log('[Sentry] ✅ APM inicializado');
  } catch (error) {
    console.warn('[Sentry] No disponible:', error.message);
  }
}

function getSentry() {
  if (!initialized) {
    initSentry();
  }
  return Sentry;
}

function captureException(error, context = {}) {
  const sentry = getSentry();
  if (!sentry) return;

  try {
    sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
      sentry.captureException(error);
    });
  } catch (e) {
    console.error('[Sentry] Error capturing exception:', e);
  }
}

function captureMessage(message, level = 'info', context = {}) {
  const sentry = getSentry();
  if (!sentry) return;

  try {
    sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
      sentry.captureMessage(message, level);
    });
  } catch (e) {
    console.error('[Sentry] Error capturing message:', e);
  }
}

function startTransaction(name, op = 'http.server') {
  const sentry = getSentry();
  if (!sentry) return null;

  try {
    return sentry.startTransaction({
      name,
      op,
    });
  } catch (e) {
    console.error('[Sentry] Error starting transaction:', e);
    return null;
  }
}

// Wrapper para async handlers
function withSentry(handler) {
  return async (event, context) => {
    const sentry = getSentry();
    if (!sentry) {
      return handler(event, context);
    }

    const transaction = startTransaction(
      event.path || event.requestContext?.http?.path || 'unknown',
      'netlify.function'
    );

    try {
      const result = await handler(event, context);
      
      if (transaction) {
        transaction.setStatus('ok');
        transaction.finish();
      }
      
      return result;
    } catch (error) {
      if (transaction) {
        transaction.setStatus('internal_error');
        transaction.finish();
      }
      
      captureException(error, {
        function: {
          name: context.functionName || 'unknown',
          version: context.functionVersion || 'unknown',
        },
        request: {
          path: event.path,
          method: event.httpMethod,
          headers: event.headers,
        },
      });

      throw error;
    }
  };
}

module.exports = {
  initSentry,
  getSentry,
  captureException,
  captureMessage,
  startTransaction,
  withSentry,
};

