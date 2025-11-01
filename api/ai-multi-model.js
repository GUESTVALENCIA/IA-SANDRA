/**
 * Netlify Function: AI Multi-Model
 * Expone el Multi-Model Coordinator
 * SOLUCIÓN al Problema AI #2
 */

const { MultiModelCoordinatorGalaxy } = require('../../orchestrator/multi-model-coordinator-galaxy');
const { SandraNucleus } = require('../../orchestrator/sandra-nucleus-core');

const coordinator = new MultiModelCoordinatorGalaxy();

/**
 * Handler principal
 */
export default async (req, res) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://sandra.guestsvalencia.es';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  };
  
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({ error: 'Method not allowed' });
  }
  
  try {
    const body = JSON.parse(req.body || '{}');
    const { message, taskType, priority = 'cost', maxCost = 0.10 } = body;
    
    if (!message || typeof message !== 'string') {
      res.status(400).json({
          error: 'Invalid request',
          message: 'Message is required'
        });
    }
    
    // Usar coordinator para routing inteligente
    // Nota: executeWithModel necesita implementación real con APIs
    // Por ahora, usamos SandraNucleus como proxy
    const coordinatorResult = await coordinator.intelligentRouting({
      input: message,
      taskType: taskType || coordinator.detectTaskType(message),
      priority,
      maxCost
    });
    
    // Ejecutar con modelo seleccionado usando Nucleus
    const nucleusResponse = await SandraNucleus.brain.processMessage(message, {
      model: coordinatorResult.selectedModel,
      priority
    });
    
    res.status(200).json({
        response: nucleusResponse.text || nucleusResponse.response,
        model: coordinatorResult.selectedModel,
        cost: coordinatorResult.cost,
        latency: coordinatorResult.latency,
        metadata: coordinatorResult.metadata,
        timestamp: new Date().toISOString()
      });
    
  } catch (error) {
    console.error('[AI-MULTI-MODEL] Error:', error);
    
    res.status(500).json({
        error: 'Multi-model processing failed',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      });
  }
};

