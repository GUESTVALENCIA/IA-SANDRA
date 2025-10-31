/**
 * Multi-Model Coordinator Galaxy
 * Sistema de coordinación inteligente para múltiples LLMs
 * SOLUCIÓN al Problema AI #2
 */

class MultiModelCoordinatorGalaxy {
  constructor() {
    // Pool de modelos con métricas de calidad, velocidad y costo
    this.modelPool = {
      'gpt-4o': {
        quality: 0.95,
        speed: 0.80,
        cost: 0.015, // por 1K tokens output
        maxTokens: 128000,
        bestFor: ['code', 'reasoning', 'complex']
      },
      'gpt-4o-mini': {
        quality: 0.85,
        speed: 0.95,
        cost: 0.0006, // 85% más barato
        maxTokens: 128000,
        bestFor: ['simple', 'voice', 'chat']
      },
      'gpt-3.5-turbo': {
        quality: 0.78,
        speed: 0.98,
        cost: 0.0015,
        maxTokens: 16385,
        bestFor: ['simple', 'quick']
      },
      'claude-3-5-sonnet': {
        quality: 0.97,
        speed: 0.85,
        cost: 0.015,
        maxTokens: 200000,
        bestFor: ['reasoning', 'code', 'long-context']
      },
      'claude-3-opus': {
        quality: 0.99,
        speed: 0.70,
        cost: 0.045,
        maxTokens: 200000,
        bestFor: ['complex-reasoning', 'advanced-code']
      }
    };
    
    // Historial de requests para learning
    this.requestHistory = [];
    this.maxHistorySize = 1000;
  }
  
  /**
   * Routing inteligente basado en tipo de tarea y prioridades
   */
  async intelligentRouting({ input, taskType, priority, maxCost = 0.10, maxLatency = 2000 }) {
    const startTime = Date.now();
    
    // Analizar tipo de tarea
    const detectedTaskType = this.detectTaskType(input);
    const effectiveTaskType = taskType || detectedTaskType;
    
    // Seleccionar modelo óptimo
    const selectedModel = this.selectOptimalModel(effectiveTaskType, priority, maxCost, maxLatency);
    
    console.log(`[MODEL-COORDINATOR] Selected: ${selectedModel.name} (${selectedModel.reason})`);
    
    try {
      // Ejecutar con el modelo seleccionado
      const result = await this.executeWithModel(selectedModel.name, input);
      
      const latency = Date.now() - startTime;
      const cost = this.estimateCost(selectedModel.name, input.length, result.text?.length || 0);
      
      // Registrar en historial
      this.recordRequest({
        taskType: effectiveTaskType,
        model: selectedModel.name,
        cost,
        latency,
        success: true,
        timestamp: Date.now()
      });
      
      return {
        output: result.text,
        selectedModel: selectedModel.name,
        cost: cost.toFixed(6),
        latency,
        metadata: {
          reason: selectedModel.reason,
          taskType: effectiveTaskType,
          priority
        }
      };
      
    } catch (error) {
      console.error(`[MODEL-COORDINATOR] Model ${selectedModel.name} failed:`, error);
      
      // Fallback automático
      return await this.fallbackRouting(input, selectedModel.name);
    }
  }
  
  /**
   * Detectar tipo de tarea desde el input
   */
  detectTaskType(input) {
    const lowerInput = input.toLowerCase();
    
    // Simple queries
    if (lowerInput.match(/^(hola|hi|gracias|thanks|ok|sí|yes|no)$/i)) {
      return 'simple';
    }
    
    // Code-related
    if (lowerInput.includes('código') || lowerInput.includes('code') || 
        lowerInput.includes('programar') || lowerInput.includes('bug') ||
        lowerInput.includes('error') || lowerInput.includes('function')) {
      return 'code';
    }
    
    // Complex reasoning
    if (lowerInput.includes('analiza') || lowerInput.includes('explica') ||
        lowerInput.includes('comparar') || lowerInput.includes('diferencias') ||
        lowerInput.includes('por qué') || lowerInput.includes('why')) {
      return 'reasoning';
    }
    
    // Long context
    if (input.length > 1000) {
      return 'long-context';
    }
    
    // Default
    return 'simple';
  }
  
  /**
   * Seleccionar modelo óptimo según prioridades
   */
  selectOptimalModel(taskType, priority, maxCost, maxLatency) {
    const candidates = [];
    
    // Filtrar modelos por task type
    for (const [modelName, modelInfo] of Object.entries(this.modelPool)) {
      if (modelInfo.bestFor.includes(taskType) || modelInfo.bestFor.includes('all')) {
        candidates.push({
          name: modelName,
          ...modelInfo
        });
      }
    }
    
    if (candidates.length === 0) {
      // Fallback: usar todos los modelos
      candidates.push(...Object.entries(this.modelPool).map(([name, info]) => ({
        name,
        ...info
      })));
    }
    
    // Filtrar por maxCost
    const affordableModels = candidates.filter(m => m.cost <= maxCost);
    const modelsToConsider = affordableModels.length > 0 ? affordableModels : candidates;
    
    // Seleccionar según prioridad
    let selected;
    
    if (priority === 'cost') {
      // Seleccionar el más barato que cumpla calidad mínima
      selected = modelsToConsider
        .filter(m => m.quality >= 0.80)
        .sort((a, b) => a.cost - b.cost)[0];
    } else if (priority === 'speed') {
      // Seleccionar el más rápido
      selected = modelsToConsider.sort((a, b) => b.speed - a.speed)[0];
    } else if (priority === 'quality') {
      // Seleccionar el de mejor calidad
      selected = modelsToConsider.sort((a, b) => b.quality - a.quality)[0];
    } else {
      // Balance (default)
      const scored = modelsToConsider.map(m => ({
        ...m,
        score: (m.quality * 0.5) + (m.speed * 0.3) + ((1 - m.cost / 0.015) * 0.2)
      }));
      selected = scored.sort((a, b) => b.score - a.score)[0];
    }
    
    // Fallback si no hay selección
    if (!selected) {
      selected = {
        name: 'gpt-4o-mini',
        reason: 'default_fallback'
      };
    }
    
    return {
      name: selected.name,
      reason: `task_${taskType}_priority_${priority}`
    };
  }
  
  /**
   * Ejecutar con modelo específico (requiere integración con APIs)
   */
  async executeWithModel(modelName, input) {
    // Esto se integrará con las funciones de API reales
    // Por ahora retorna estructura básica
    
    // En producción, esto llamaría a:
    // - OpenAI API para modelos GPT
    // - Anthropic API para modelos Claude
    // - etc.
    
    throw new Error(`Model execution not yet implemented for ${modelName}`);
  }
  
  /**
   * Fallback automático si el modelo primario falla
   */
  async fallbackRouting(input, failedModel) {
    console.log(`[FALLBACK] Primary model ${failedModel} failed, trying fallback...`);
    
    // Seleccionar fallback (más simple pero confiable)
    const fallbackModel = failedModel === 'gpt-4o' ? 'gpt-4o-mini' : 'gpt-3.5-turbo';
    
    try {
      const result = await this.executeWithModel(fallbackModel, input);
      
      return {
        output: result.text,
        selectedModel: `${fallbackModel} (fallback)`,
        cost: this.estimateCost(fallbackModel, input.length, result.text?.length || 0).toFixed(6),
        latency: Date.now(),
        metadata: {
          reason: 'fallback',
          originalModel: failedModel
        }
      };
    } catch (error) {
      throw new Error(`All models failed. Last error: ${error.message}`);
    }
  }
  
  /**
   * Estimar costo de request
   */
  estimateCost(modelName, inputTokens, outputTokens) {
    const model = this.modelPool[modelName];
    if (!model) return 0;
    
    // Simplificación: asumir tokens basados en caracteres
    const inputChars = inputTokens || 0;
    const outputChars = outputTokens || 0;
    
    // ~4 caracteres por token
    const inputTokenCount = Math.ceil(inputChars / 4);
    const outputTokenCount = Math.ceil(outputChars / 4);
    
    // Costo por 1K tokens (aproximado)
    const inputCost = (inputTokenCount / 1000) * (model.cost * 0.3); // Input generalmente más barato
    const outputCost = (outputTokenCount / 1000) * model.cost;
    
    return inputCost + outputCost;
  }
  
  /**
   * Registrar request en historial
   */
  recordRequest(request) {
    this.requestHistory.push(request);
    
    // Limitar tamaño
    if (this.requestHistory.length > this.maxHistorySize) {
      this.requestHistory.shift();
    }
  }
  
  /**
   * Obtener estadísticas de uso
   */
  getStats() {
    const stats = {
      totalRequests: this.requestHistory.length,
      byModel: {},
      averageCost: 0,
      averageLatency: 0
    };
    
    if (this.requestHistory.length === 0) {
      return stats;
    }
    
    let totalCost = 0;
    let totalLatency = 0;
    
    this.requestHistory.forEach(req => {
      // Por modelo
      if (!stats.byModel[req.model]) {
        stats.byModel[req.model] = {
          count: 0,
          totalCost: 0,
          totalLatency: 0
        };
      }
      stats.byModel[req.model].count++;
      stats.byModel[req.model].totalCost += parseFloat(req.cost);
      stats.byModel[req.model].totalLatency += req.latency;
      
      // Totales
      totalCost += parseFloat(req.cost);
      totalLatency += req.latency;
    });
    
    stats.averageCost = totalCost / this.requestHistory.length;
    stats.averageLatency = totalLatency / this.requestHistory.length;
    
    return stats;
  }
}

module.exports = { MultiModelCoordinatorGalaxy };

