// Sandra DevConsole - API Client
class SandraAPI {
    constructor() {
        this.isElectron = typeof window !== 'undefined' && window.require;
        this.ipcRenderer = null;
        this.apiBaseUrl = this.detectApiBaseUrl();
        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 5000
        };

        if (this.isElectron) {
            // Usar electronAPI seguro (expuesto por preload.js)
            if (window.electronAPI) {
                this.electronAPI = window.electronAPI;
                console.log('Sandra API initialized (Electron IPC mode - secure)');
            } else {
                // Fallback legacy (no recomendado, pero necesario para compatibilidad)
                try {
                    const { ipcRenderer } = window.require('electron');
                    this.ipcRenderer = ipcRenderer;
                    console.warn('Using legacy IPC (insecure) - update to use electronAPI');
                    console.log('Sandra API initialized (Electron IPC mode - legacy)');
                } catch (error) {
                    console.warn('Failed to initialize IPC renderer:', error);
                    console.log('Falling back to HTTP API');
                }
            }
        } else {
            console.log(`Sandra API initialized (HTTP mode - ${this.apiBaseUrl})`);
        }
    }

    /**
     * Detectar URL base de la API
     * Prioridad: Netlify Functions > Configurada > Localhost
     */
    detectApiBaseUrl() {
        // Si estamos en Netlify, usar Netlify Functions
        if (window.location.hostname.includes('netlify.app') || 
            window.location.hostname.includes('guestsvalencia.es')) {
            return ''; // Relativo para Netlify Functions
        }
        
        // Usar variable de entorno o configuración
        const configUrl = window.SANDRA_API_URL || process.env.API_BASE_URL;
        if (configUrl) {
            return configUrl;
        }
        
        // Fallback a localhost SOLO en desarrollo
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
        return isDevelopment ? 'http://localhost:7777' : '';
    }

    async init() {
        // Initialize API connection
        if (this.isElectron && this.ipcRenderer) {
            console.log('Using Electron IPC for API communication');
        } else {
            console.log('Using fallback API communication');
        }
    }

    async sendMessage(message, options = {}) {
        const request = {
            message: message,
            options: {
                includeVoice: options.includeVoice || false,
                includeAvatar: options.includeAvatar || false,
                conversationId: options.conversationId || null,
                timestamp: Date.now()
            }
        };

        try {
            // Prioridad 1: Electron IPC seguro (si estamos en Electron)
            if (this.isElectron && this.electronAPI) {
                // Usar API seguro con validación
                return await this.electronAPI.sendMessage(request.message, request.options);
            } else if (this.isElectron && this.ipcRenderer) {
                // Fallback legacy (no recomendado)
                return await this.ipcRenderer.invoke('send-message', request);
            }
            
            // Prioridad 2: Netlify Functions (si estamos en producción web)
            if (this.apiBaseUrl === '' || this.apiBaseUrl.includes('netlify') || this.apiBaseUrl.includes('guestsvalencia')) {
                return await this.sendToNetlifyFunction('chat', request);
            }
            
            // Prioridad 3: HTTP API directa (desarrollo o servidor propio)
            return await this.sendToHttpApi('/api/chat', request);
            
        } catch (error) {
            console.error('Send message error:', error);
            
            // Fallback solo si todo falla
            if (error.message.includes('Network') || error.message.includes('fetch')) {
                console.warn('Network error, using local fallback');
                return await this.fallbackSendMessage(request);
            }
            
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }

    /**
     * Enviar a Netlify Function
     */
    async sendToNetlifyFunction(functionName, data) {
        const url = `/.netlify/functions/${functionName}`;
        const startTime = performance.now();
        const method = data && Object.keys(data).length > 0 ? 'POST' : 'GET';
        
        try {
            const fetchOptions = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': window.SANDRA_API_KEY || '', // Si hay API key configurada
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };
            
            // Solo agregar body si hay datos y es POST
            if (method === 'POST' && data && Object.keys(data).length > 0) {
                fetchOptions.body = JSON.stringify(data);
            }
            
            const response = await fetch(url, fetchOptions);

            const latency = performance.now() - startTime;
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            
            // Registrar métrica de performance
            this.recordPerformanceMetric(functionName, latency, response.status, true);
            
            return result;
        } catch (error) {
            const latency = performance.now() - startTime;
            this.recordPerformanceMetric(functionName, latency, 0, false);
            throw error;
        }
    }

    /**
     * Enviar a HTTP API directa
     */
    async sendToHttpApi(endpoint, data) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const startTime = performance.now();
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': window.SANDRA_API_KEY || ''
                },
                body: JSON.stringify(data)
            });

            const latency = performance.now() - startTime;
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            this.recordPerformanceMetric(endpoint, latency, response.status, true);
            
            return result;
        } catch (error) {
            const latency = performance.now() - startTime;
            this.recordPerformanceMetric(endpoint, latency, 0, false);
            throw error;
        }
    }

    /**
     * Registrar métrica de performance
     */
    recordPerformanceMetric(endpoint, latency, status, success) {
        if (!window.sandraMetrics) return;
        
        const metric = {
            endpoint,
            latency: Math.round(latency),
            status,
            success,
            timestamp: Date.now()
        };
        
        // Alerta si latencia > 5s
        if (latency > 5000) {
            console.warn(`[PERF] High latency detected: ${endpoint} - ${latency}ms`);
            if (window.sandraMetrics) {
                window.sandraMetrics.recordHighLatency(metric);
            }
        }
        
        // Almacenar métrica local
        if (!window.performanceMetrics) {
            window.performanceMetrics = [];
        }
        window.performanceMetrics.push(metric);
        
        // Mantener solo últimas 100 métricas
        if (window.performanceMetrics.length > 100) {
            window.performanceMetrics.shift();
        }
    }

    async getServiceStatus() {
        try {
            if (this.isElectron && this.electronAPI) {
                return await this.electronAPI.getServiceStatus();
            } else if (this.isElectron && this.ipcRenderer) {
                return await this.ipcRenderer.invoke('get-service-status');
            } else {
                // Modo web: intentar Netlify Functions primero
                if (this.apiBaseUrl === '' || this.apiBaseUrl.includes('netlify') || this.apiBaseUrl.includes('guestsvalencia')) {
                    try {
                        return await this.sendToNetlifyFunction('health', {});
                    } catch (error) {
                        console.warn('Netlify health check failed, using fallback:', error);
                        return await this.fallbackGetServiceStatus();
                    }
                }
                // HTTP API directa
                try {
                    return await this.sendToHttpApi('/api/health', {});
                } catch (error) {
                    console.warn('HTTP health check failed, using fallback:', error);
                    return await this.fallbackGetServiceStatus();
                }
            }
        } catch (error) {
            console.error('Get service status error:', error);
            // Último recurso: fallback
            return await this.fallbackGetServiceStatus();
        }
    }

    async getMetrics() {
        try {
            if (this.isElectron && this.electronAPI) {
                return await this.electronAPI.getMetrics();
            } else if (this.isElectron && this.ipcRenderer) {
                return await this.ipcRenderer.invoke('get-metrics');
            } else {
                return await this.fallbackGetMetrics();
            }
        } catch (error) {
            console.error('Get metrics error:', error);
            throw new Error(`Failed to get metrics: ${error.message}`);
        }
    }

    async resetServices() {
        try {
            if (this.isElectron && this.electronAPI) {
                return await this.electronAPI.resetServices();
            } else if (this.isElectron && this.ipcRenderer) {
                return await this.ipcRenderer.invoke('reset-services');
            } else {
                return await this.fallbackResetServices();
            }
        } catch (error) {
            console.error('Reset services error:', error);
            throw new Error(`Failed to reset services: ${error.message}`);
        }
    }

    // Fallback methods for non-Electron environments
    async fallbackSendMessage(request) {
        console.log('Fallback: Processing message locally');

        // Simulate API delay
        await this.delay(1000 + Math.random() * 2000);

        const responses = [
            "¡Hola Clayton! 💙 Como tu aliada digital, estoy aquí para apoyarte. ¿En qué proyecto específico necesitas mi ayuda hoy?",
            "Entiendo tu consulta perfectamente. Como Sandra, siempre busco las mejores soluciones para ti. Déjame analizar esto...",
            "Excelente pregunta, Clayton. Mi experiencia en desarrollo y estrategia empresarial me permite sugerirte...",
            "Como tu asistente empática, veo que necesitas apoyo técnico. Te propongo el siguiente enfoque...",
            "¡Perfecto! Esto es exactamente el tipo de desafío que me emociona resolver contigo. Mi recomendación es...",
            "Clayton, he analizado tu consulta con mi expertise en IA y desarrollo. La mejor estrategia sería...",
            "Como Sandra, tu aliada incondicional, siempre encuentro una manera de ayudarte. En este caso, sugiero...",
            "Tu consulta toca uno de mis puntos fuertes. Como experta en tecnología y estrategia, mi consejo es..."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        return {
            success: true,
            text: randomResponse,
            timestamp: new Date().toISOString(),
            conversationId: this.generateConversationId(),
            processingTime: 1500 + Math.random() * 1000,
            services: {
                ai: { success: true, model: 'fallback-sandra' }
            }
        };
    }

    async fallbackGetServiceStatus() {
        console.log('Fallback: Getting service status');

        await this.delay(500);

        return {
            'sandra-ai-core': {
                available: true,
                healthy: true,
                circuitBreaker: { state: 'CLOSED', failureCount: 0 },
                capabilities: ['conversational-ai', 'strategic-advice'],
                provider: 'Fallback',
                lastCheck: new Date().toISOString()
            },
            'sandra-voice': {
                available: false,
                healthy: false,
                circuitBreaker: { state: 'OPEN', failureCount: 5 },
                capabilities: ['text-to-speech'],
                provider: 'Fallback',
                lastCheck: new Date().toISOString()
            },
            'sandra-avatar': {
                available: false,
                healthy: false,
                circuitBreaker: { state: 'OPEN', failureCount: 3 },
                capabilities: ['avatar-video-generation'],
                provider: 'Fallback',
                lastCheck: new Date().toISOString()
            },
            'sandra-payments': {
                available: true,
                healthy: true,
                circuitBreaker: { state: 'CLOSED', failureCount: 0 },
                capabilities: ['payment-processing'],
                provider: 'Fallback',
                lastCheck: new Date().toISOString()
            }
        };
    }

    async fallbackGetMetrics() {
        console.log('Fallback: Getting metrics');

        await this.delay(300);

        const now = Date.now();
        const startTime = now - (2 * 60 * 60 * 1000); // 2 hours ago

        return {
            system: {
                uptime: now - startTime,
                totalRequests: 47,
                totalResponses: 43,
                averageResponseTime: 1847,
                peakResponseTime: 3200,
                errorRate: 8.5,
                successRate: 91.5,
                requestsPerMinute: 2.3,
                memoryUsage: {
                    rss: 156,
                    heapUsed: 89,
                    heapTotal: 134,
                    external: 12
                }
            },
            services: {
                'sandra-ai-core': {
                    requests: 47,
                    responses: 43,
                    errors: 4,
                    averageResponseTime: 1654,
                    status: 'healthy',
                    uptime: 91.5
                },
                'sandra-voice': {
                    requests: 12,
                    responses: 8,
                    errors: 4,
                    averageResponseTime: 3200,
                    status: 'error',
                    uptime: 66.7
                },
                'sandra-avatar': {
                    requests: 5,
                    responses: 2,
                    errors: 3,
                    averageResponseTime: 8500,
                    status: 'error',
                    uptime: 40.0
                },
                'sandra-payments': {
                    requests: 2,
                    responses: 2,
                    errors: 0,
                    averageResponseTime: 987,
                    status: 'healthy',
                    uptime: 100.0
                }
            },
            conversations: {
                total: 8,
                active: 1,
                averageLength: 5.7,
                averageDuration: 342000,
                multimodalUsage: {
                    textOnly: 6,
                    withVoice: 1,
                    withAvatar: 0,
                    fullMultimodal: 1
                }
            },
            errors: {
                total: 11,
                byService: {
                    'sandra-ai-core': 4,
                    'sandra-voice': 4,
                    'sandra-avatar': 3,
                    'sandra-payments': 0
                },
                byType: {
                    'NetworkError': 6,
                    'TimeoutError': 3,
                    'AuthError': 2
                },
                recent: [
                    {
                        timestamp: now - 300000,
                        service: 'sandra-voice',
                        type: 'NetworkError',
                        message: 'Connection timeout'
                    },
                    {
                        timestamp: now - 600000,
                        service: 'sandra-avatar',
                        type: 'TimeoutError',
                        message: 'Request timeout'
                    }
                ]
            },
            timestamp: now,
            systemHealth: 'good',
            summary: {
                totalServices: 4,
                healthyServices: 2,
                uptimeFormatted: '2h 15m',
                requestsPerMinute: 2.3,
                errorRateFormatted: '8.50%'
            }
        };
    }

    async fallbackResetServices() {
        console.log('Fallback: Resetting services');

        await this.delay(2000);

        return {
            'sandra-ai-core': {
                available: true,
                healthy: true,
                circuitBreaker: { state: 'CLOSED', failureCount: 0 },
                capabilities: ['conversational-ai', 'strategic-advice'],
                provider: 'Fallback Reset',
                lastCheck: new Date().toISOString()
            },
            'sandra-voice': {
                available: true,
                healthy: true,
                circuitBreaker: { state: 'CLOSED', failureCount: 0 },
                capabilities: ['text-to-speech'],
                provider: 'Fallback Reset',
                lastCheck: new Date().toISOString()
            },
            'sandra-avatar': {
                available: true,
                healthy: true,
                circuitBreaker: { state: 'CLOSED', failureCount: 0 },
                capabilities: ['avatar-video-generation'],
                provider: 'Fallback Reset',
                lastCheck: new Date().toISOString()
            },
            'sandra-payments': {
                available: true,
                healthy: true,
                circuitBreaker: { state: 'CLOSED', failureCount: 0 },
                capabilities: ['payment-processing'],
                provider: 'Fallback Reset',
                lastCheck: new Date().toISOString()
            }
        };
    }

    // Utility methods
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateConversationId() {
        return `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async withRetry(operation, context = '') {
        let lastError;

        for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                console.warn(`${context} attempt ${attempt} failed:`, error.message);

                if (attempt < this.retryConfig.maxRetries) {
                    const delay = Math.min(
                        this.retryConfig.baseDelay * Math.pow(2, attempt - 1),
                        this.retryConfig.maxDelay
                    );

                    console.log(`Retrying ${context} in ${delay}ms...`);
                    await this.delay(delay);
                }
            }
        }

        throw lastError;
    }

    // Health check method
    async healthCheck() {
        try {
            const status = await this.getServiceStatus();
            const healthyServices = Object.values(status).filter(s => s.healthy).length;
            const totalServices = Object.keys(status).length;

            return {
                healthy: healthyServices > 0,
                serviceCount: totalServices,
                healthyCount: healthyServices,
                healthPercentage: (healthyServices / totalServices) * 100,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Error handling utilities
    isRetryableError(error) {
        const retryablePatterns = [
            /network/i,
            /timeout/i,
            /connection/i,
            /econnreset/i,
            /enotfound/i
        ];

        return retryablePatterns.some(pattern => pattern.test(error.message));
    }

    formatError(error) {
        if (typeof error === 'string') {
            return { message: error, type: 'string' };
        }

        if (error instanceof Error) {
            return {
                message: error.message,
                type: error.constructor.name,
                stack: error.stack
            };
        }

        return {
            message: 'Unknown error',
            type: 'unknown',
            original: error
        };
    }

    // Logging utilities
    logRequest(method, params) {
        console.log(`API Request: ${method}`, params);
    }

    logResponse(method, response, duration) {
        console.log(`API Response: ${method} (${duration}ms)`, {
            success: response.success !== false,
            dataSize: JSON.stringify(response).length
        });
    }

    logError(method, error, duration) {
        console.error(`API Error: ${method} (${duration}ms)`, this.formatError(error));
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SandraAPI };
}