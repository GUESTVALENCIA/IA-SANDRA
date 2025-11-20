/**
 * Tests para Cost Optimizer
 * Verifica el cambio dinámico de modelos según latencia y tokens
 */

const { createContext, trackResponse } = require('../services/cost-optimizer');
const fs = require('fs');
const path = require('path');

describe('Cost Optimizer', () => {
  let ctx;
  let switchModelCalls = [];
  
  beforeEach(() => {
    switchModelCalls = [];
    
    ctx = createContext({
      sessionId: 'test-session-123',
      initialModel: 'gpt-4o',
      switchModelCallback: (newModel, context) => {
        switchModelCalls.push({ model: newModel, timestamp: Date.now() });
      }
    });
  });
  
  afterEach(() => {
    // Limpiar archivos de log de prueba
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const logFile = path.join(__dirname, '../logs', `costs-${today}.jsonl`);
    if (fs.existsSync(logFile)) {
      // No eliminar, solo limpiar para tests
    }
  });
  
  test('Switches to mini after 3 slow+big events', () => {
    // Primero 3 eventos lentos y grandes
    trackResponse(ctx, {
      latency_ms: 800, // > 700
      usage: { input_tokens: 300, output_tokens: 400 } // total 700 > 600
    });
    
    trackResponse(ctx, {
      latency_ms: 750,
      usage: { input_tokens: 250, output_tokens: 350 } // total 600
    });
    
    trackResponse(ctx, {
      latency_ms: 900,
      usage: { input_tokens: 200, output_tokens: 500 } // total 700 > 600
    });
    
    // Debería haber cambiado a mini
    expect(switchModelCalls.length).toBeGreaterThan(0);
    const lastSwitch = switchModelCalls[switchModelCalls.length - 1];
    expect(lastSwitch.model).toBe('gpt-4o-mini');
    expect(ctx.model).toBe('gpt-4o-mini');
  });
  
  test('Switches back to high after 2 fast+small events', () => {
    // Primero cambiar a mini
    ctx.model = 'gpt-4o-mini';
    
    // Luego 2 eventos rápidos y pequeños
    trackResponse(ctx, {
      latency_ms: 300, // < 400
      usage: { input_tokens: 50, output_tokens: 100 } // total 150 < 200
    });
    
    trackResponse(ctx, {
      latency_ms: 350,
      usage: { input_tokens: 60, output_tokens: 80 } // total 140 < 200
    });
    
    // Debería haber cambiado de vuelta a high
    expect(switchModelCalls.length).toBeGreaterThan(0);
    const lastSwitch = switchModelCalls[switchModelCalls.length - 1];
    expect(lastSwitch.model).toBe('gpt-4o');
    expect(ctx.model).toBe('gpt-4o');
  });
  
  test('Tracks latency and tokens correctly', () => {
    trackResponse(ctx, { latency_ms: 500, usage: { input_tokens: 100, output_tokens: 200 } });
    trackResponse(ctx, { latency_ms: 600, usage: { input_tokens: 150, output_tokens: 250 } });
    
    expect(ctx.stats.latency.length).toBe(2);
    expect(ctx.stats.tokens.length).toBe(2);
    expect(ctx.stats.latency).toContain(500);
    expect(ctx.stats.latency).toContain(600);
    expect(ctx.stats.tokens).toContain(300); // 100 + 200
    expect(ctx.stats.tokens).toContain(400); // 150 + 250
  });
  
  test('Logs cost data to JSONL file', () => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const logFile = path.join(__dirname, '../logs', `costs-${today}.jsonl`);
    
    // Limpiar archivo si existe
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }
    
    trackResponse(ctx, {
      latency_ms: 500,
      usage: { input_tokens: 1000, output_tokens: 2000 }
    });
    
    // Verificar que se creó el archivo
    expect(fs.existsSync(logFile)).toBe(true);
    
    // Leer y verificar contenido
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.trim().split('\n');
    expect(lines.length).toBeGreaterThan(0);
    
    const logEntry = JSON.parse(lines[0]);
    expect(logEntry.sessionId).toBe('test-session-123');
    expect(logEntry.model).toBe('gpt-4o');
    expect(logEntry.latency_ms).toBe(500);
    expect(logEntry.tokens_in).toBe(1000);
    expect(logEntry.tokens_out).toBe(2000);
    expect(logEntry.cost_usd).toBeDefined();
    expect(typeof logEntry.cost_usd).toBe('number');
  });
  
  test('Maintains only last 10 values in stats', () => {
    // Agregar más de 10 valores
    for (let i = 0; i < 15; i++) {
      trackResponse(ctx, {
        latency_ms: 500 + i,
        usage: { input_tokens: 100, output_tokens: 200 }
      });
    }
    
    expect(ctx.stats.latency.length).toBeLessThanOrEqual(10);
    expect(ctx.stats.tokens.length).toBeLessThanOrEqual(10);
  });
  
  test('Does not switch if conditions not met', () => {
    // Eventos normales que no deberían causar cambio
    trackResponse(ctx, {
      latency_ms: 500, // < 700
      usage: { input_tokens: 100, output_tokens: 200 } // total 300 < 600
    });
    
    trackResponse(ctx, {
      latency_ms: 600,
      usage: { input_tokens: 150, output_tokens: 250 } // total 400 < 600
    });
    
    // No debería haber cambiado
    expect(ctx.model).toBe('gpt-4o');
    expect(switchModelCalls.length).toBe(0);
  });
});

