/**
 * Cost Optimizer Middleware
 * Cambia dinámicamente entre modelos según latencia y tokens
 */

const fs = require('fs');
const path = require('path');

// Variables de entorno con defaults
const MODEL_HIGH = process.env.MODEL_HIGH || 'gpt-4o';
const MODEL_LOW = process.env.MODEL_LOW || 'gpt-4o-mini';
const LAT_HIGH_MS = parseInt(process.env.LAT_HIGH_MS || '700', 10);
const TOK_HIGH = parseInt(process.env.TOK_HIGH || '600', 10);
const LAT_LOW_MS = parseInt(process.env.LAT_LOW_MS || '400', 10);
const TOK_LOW = parseInt(process.env.TOK_LOW || '200', 10);

// Precios por 1M tokens (aproximados)
const COSTS = {
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 }
};

/**
 * Cost Optimizer Middleware
 * @param {Object} ctx - Contexto con stats, model, switchModel, sessionId
 */
function costOptimizer(ctx) {
  const { stats } = ctx;
  
  if (!stats || !stats.latency || !stats.tokens) {
    return; // No hay suficientes datos
  }
  
  if (stats.latency.length === 0 || stats.tokens.length === 0) {
    return; // No hay datos aún
  }
  
  // Calcular promedios
  const avgLatency = stats.latency.reduce((a, b) => a + b, 0) / stats.latency.length;
  const sumTokens = stats.tokens.reduce((a, b) => a + b, 0);
  
  // Lógica de cambio de modelo
  if (ctx.model === MODEL_HIGH && (avgLatency > LAT_HIGH_MS || sumTokens > TOK_HIGH)) {
    console.log(`[cost-optimizer] Switching to ${MODEL_LOW} (latency: ${avgLatency.toFixed(0)}ms, tokens: ${sumTokens})`);
    ctx.switchModel(MODEL_LOW);
  }
  
  if (ctx.model === MODEL_LOW && avgLatency < LAT_LOW_MS && sumTokens < TOK_LOW) {
    console.log(`[cost-optimizer] Switching to ${MODEL_HIGH} (latency: ${avgLatency.toFixed(0)}ms, tokens: ${sumTokens})`);
    ctx.switchModel(MODEL_HIGH);
  }
}

/**
 * Log cost data to JSONL file
 * @param {Object} data - {ts, sessionId, model, latency_ms, tokens_in, tokens_out, cost_usd}
 */
function logCost(data) {
  try {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const logFile = path.join(__dirname, '../../logs', `costs-${today}.jsonl`);
    const logDir = path.dirname(logFile);
    
    // Crear directorio si no existe
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Calcular costo
    const modelCost = COSTS[data.model] || COSTS[MODEL_LOW];
    const costUsd = (data.tokens_in / 1_000_000 * modelCost.input) + 
                    (data.tokens_out / 1_000_000 * modelCost.output);
    data.cost_usd = parseFloat(costUsd.toFixed(6));
    
    // Escribir línea JSONL
    const line = JSON.stringify(data) + '\n';
    fs.appendFileSync(logFile, line, 'utf8');
  } catch (e) {
    console.error('[cost-optimizer] Error logging cost:', e);
  }
}

/**
 * Initialize cost optimizer context
 * @param {Object} options - {sessionId, initialModel, switchModelCallback}
 * @returns {Object} Context object
 */
function createContext(options = {}) {
  const {
    sessionId,
    initialModel = MODEL_HIGH,
    switchModelCallback
  } = options;
  
  const ctx = {
    sessionId,
    model: initialModel,
    stats: {
      latency: [],
      tokens: []
    },
    switchModel: (newModel) => {
      if (switchModelCallback) {
        switchModelCallback(newModel, ctx);
      }
      ctx.model = newModel;
    }
  };
  
  return ctx;
}

/**
 * Track response completion
 * @param {Object} ctx - Context
 * @param {Object} event - {latency_ms, usage: {input_tokens, output_tokens}}
 */
function trackResponse(ctx, event) {
  if (event.latency_ms) {
    ctx.stats.latency.push(event.latency_ms);
    // Mantener solo últimos 10 valores
    if (ctx.stats.latency.length > 10) {
      ctx.stats.latency.shift();
    }
  }
  
  if (event.usage) {
    const totalTokens = (event.usage.input_tokens || 0) + (event.usage.output_tokens || 0);
    ctx.stats.tokens.push(totalTokens);
    // Mantener solo últimos 10 valores
    if (ctx.stats.tokens.length > 10) {
      ctx.stats.tokens.shift();
    }
    
    // Log cost
    logCost({
      ts: new Date().toISOString(),
      sessionId: ctx.sessionId,
      model: ctx.model,
      latency_ms: event.latency_ms || 0,
      tokens_in: event.usage.input_tokens || 0,
      tokens_out: event.usage.output_tokens || 0
    });
  }
  
  // Ejecutar optimizador
  costOptimizer(ctx);
}

module.exports = {
  costOptimizer,
  logCost,
  createContext,
  trackResponse
};

