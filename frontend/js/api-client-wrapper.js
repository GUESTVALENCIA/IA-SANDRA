/**
 * API Client Wrapper Unificado
 * Golden Path para todas las llamadas API
 * Integra Electron IPC, Netlify Functions y HTTP API
 */

class SandraAPIClient {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.require;
    this.ipcRenderer = null;
    this.config = this.detectConfig();
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 5000
    };
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0
    };

    if (this.isElectron) {
      try {
        const { ipcRenderer } = window.require('electron');
        this.ipcRenderer = ipcRenderer;
      } catch (error) {
        console.warn('[API Client] Failed to initialize IPC renderer:', error);
      }
    }

    console.log('[API Client] Initialized', {
      mode: this.config.mode,
      baseUrl: this.config.baseUrl
    });
  }

  /**
   * Detectar configuración según entorno
   */
  detectConfig() {
    // Prioridad 1: Electron IPC
    if (this.isElectron && this.ipcRenderer) {
      return {
        mode: 'electron-ipc',
        baseUrl: null,
        apiEndpoint: null
      };
    }

    // Prioridad 2: Netlify Functions (producción web)
    if (window.location.hostname.includes('netlify.app') || 
        window.location.hostname.includes('guestsvalencia.es')) {
      return {
        mode: 'netlify-functions',
        baseUrl: '',
        apiEndpoint: '/.netlify/functions'
      };
    }

    // Prioridad 3: HTTP API directa (desarrollo o servidor propio)
    const configUrl = window.SANDRA_API_URL || process.env.API_BASE_URL || 'http://localhost:7777';
    return {
      mode: 'http-api',
      baseUrl: configUrl,
      apiEndpoint: '/api'
    };
  }

  /**
   * Chat method (método principal para chat)
   */
  async chat(message, options = {}) {
    return await this.request('/chat', {
      method: 'POST',
      body: { message, ...options }
    });
  }

  /**
   * Llamada API unificada (Golden Path)
   */
  async request(endpoint, options = {}) {
    const startTime = performance.now();
    this.metrics.totalRequests++;

    try {
      let response;

      // Prioridad 1: Electron IPC
      if (this.config.mode === 'electron-ipc') {
        response = await this.requestElectron(endpoint, options);
      }
      // Prioridad 2: Netlify Functions
      else if (this.config.mode === 'netlify-functions') {
        response = await this.requestNetlify(endpoint, options);
      }
      // Prioridad 3: HTTP API
      else {
        response = await this.requestHTTP(endpoint, options);
      }

      const latency = performance.now() - startTime;
      this.recordMetric(true, latency);
      
      return response;

    } catch (error) {
      const latency = performance.now() - startTime;
      this.recordMetric(false, latency);
      
      // Retry logic
      if (options.retry !== false && this.retryConfig.maxRetries > 0) {
        return await this.retryRequest(endpoint, options, error);
      }

      throw this.formatError(error);
    }
  }

  /**
   * Request via Electron IPC
   */
  async requestElectron(endpoint, options) {
    const { method = 'POST', body = {} } = options;
    
    if (method === 'GET') {
      return await this.ipcRenderer.invoke(endpoint.replace('/api/', ''));
    }

    // Mapear endpoints IPC
    const ipcChannel = endpoint.replace('/api/', '').replace(/^\/\.netlify\/functions\//, '');
    return await this.ipcRenderer.invoke(ipcChannel, body);
  }

  /**
   * Request via Netlify Functions
   */
  async requestNetlify(endpoint, options) {
    const { method = 'POST', body = {} } = options;
    
    // Extraer nombre de función del endpoint
    const functionName = endpoint
      .replace('/api/', '')
      .replace('/.netlify/functions/', '')
      .split('/')[0] || 'chat';

    const url = `/.netlify/functions/${functionName}`;
    
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': window.SANDRA_API_KEY || ''
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    };

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Request via HTTP API
   */
  async requestHTTP(endpoint, options) {
    const { method = 'POST', body = {} } = options;
    
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': window.SANDRA_API_KEY || ''
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    };

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Retry logic con exponential backoff
   */
  async retryRequest(endpoint, options, lastError, attempt = 1) {
    if (attempt > this.retryConfig.maxRetries) {
      throw lastError;
    }

    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(2, attempt - 1),
      this.retryConfig.maxDelay
    );

    await new Promise(resolve => setTimeout(resolve, delay));

    console.warn(`[API Client] Retry attempt ${attempt}/${this.retryConfig.maxRetries} for ${endpoint}`);

    try {
      return await this.request(endpoint, { ...options, retry: false });
    } catch (error) {
      return await this.retryRequest(endpoint, options, error, attempt + 1);
    }
  }

  /**
   * Formatear errores de manera consistente
   */
  formatError(error) {
    return {
      success: false,
      error: error.message || 'Unknown error',
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: Date.now()
    };
  }

  /**
   * Registrar métricas
   */
  recordMetric(success, latency) {
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    // Actualizar latencia promedio
    const totalLatency = this.metrics.averageLatency * (this.metrics.totalRequests - 1) + latency;
    this.metrics.averageLatency = totalLatency / this.metrics.totalRequests;

    // Alerta si latencia alta
    if (latency > 5000) {
      console.warn(`[API Client] High latency: ${latency.toFixed(0)}ms`);
    }
  }

  /**
   * Métodos de conveniencia (Golden Paths)
   */
  async chat(message, options = {}) {
    return await this.request('/api/chat', {
      method: 'POST',
      body: { message, ...options }
    });
  }

  async getServiceStatus() {
    return await this.request('/api/health', {
      method: 'GET',
      retry: false
    });
  }

  async getMetrics() {
    return await this.request('/api/metrics', {
      method: 'GET'
    });
  }

  async voiceCommand(audio, options = {}) {
    return await this.request('/api/voice-command', {
      method: 'POST',
      body: { audio, ...options }
    });
  }

  /**
   * Obtener estadísticas del cliente
   */
  getStats() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0
        ? ((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(1) + '%'
        : '0%',
      config: this.config
    };
  }
}

// Exportar instancia singleton
if (typeof window !== 'undefined') {
  window.sandraAPIClient = new SandraAPIClient();
}

// También exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SandraAPIClient;
}

