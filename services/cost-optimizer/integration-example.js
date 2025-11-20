/**
 * Ejemplo de integración del Cost Optimizer
 * Este archivo muestra cómo integrar el cost-optimizer en un servidor de voice-agent
 */

const { createContext, trackResponse } = require('./index');

// Ejemplo de integración en un servidor de voice-agent
function setupCostOptimizer(sessionId, initialModel, switchModelCallback) {
  // Crear contexto
  const ctx = createContext({
    sessionId,
    initialModel,
    switchModelCallback: (newModel, context) => {
      // Aquí se actualizaría la sesión con el nuevo modelo
      console.log(`[server] Switching model to ${newModel} for session ${sessionId}`);
      
      if (switchModelCallback) {
        switchModelCallback(newModel, context);
      }
      
      // Ejemplo: actualizar sesión en base de datos o API
      // await session.update({ model: newModel });
    }
  });
  
  return ctx;
}

// Ejemplo de uso en un handler de eventos
function handleResponseCompleted(ctx, event) {
  // event debe tener: { latency_ms, usage: { input_tokens, output_tokens } }
  trackResponse(ctx, event);
}

// Ejemplo completo
/*
// En tu server.js o handler de eventos:

const costOptimizer = require('./services/cost-optimizer');

// Al crear una sesión
const ctx = costOptimizer.createContext({
  sessionId: 'session-123',
  initialModel: 'gpt-4o',
  switchModelCallback: async (newModel, context) => {
    // Actualizar modelo en la sesión
    await session.update({ model: newModel });
    console.log(`Model switched to ${newModel}`);
  }
});

// En el handler de response.completed
eventEmitter.on('response.completed', (event) => {
  costOptimizer.trackResponse(ctx, {
    latency_ms: event.latency_ms,
    usage: {
      input_tokens: event.response.usage?.input_tokens || 0,
      output_tokens: event.response.usage?.output_tokens || 0
    }
  });
});
*/

module.exports = {
  setupCostOptimizer,
  handleResponseCompleted
};

