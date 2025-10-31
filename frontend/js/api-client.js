/**
 * API Client Abstraction Layer
 * Golden Path para todas las llamadas a Netlify Functions
 * Reemplaza llamadas directas a OpenAI/APIs externas
 */

class SandraAPIClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.netlifyFunctionsPath = '/.netlify/functions';
        this.defaultTimeout = 15000; // 15s default timeout
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageLatency: 0
        };
        
        console.log('[API Client] Initialized', {
            baseURL: this.baseURL,
            functionsPath: this.netlifyFunctionsPath
        });
    }

    /**
     * Chat method - Método principal para chat
     */
    async chat(message, context = {}) {
        try {
            const response = await fetch(`${this.netlifyFunctionsPath}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    context: {
                        ...context,
                        mobileOptimized: true,
                        maxTokens: 600,
                        temperature: 0.7
                    }
                }),
                signal: AbortSignal.timeout(this.defaultTimeout)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Chat API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Formato consistente de respuesta
            return {
                success: true,
                response: data.response || data.text || data.choices?.[0]?.message?.content || 'Sin respuesta',
                metadata: data.metadata || {}
            };

        } catch (error) {
            console.error('[API Client] Chat error:', error);
            
            // Formato de error consistente
            return {
                success: false,
                response: 'Lo siento, estoy experimentando dificultades técnicas. Por favor intenta de nuevo.',
                error: error.message || 'Unknown error',
                metadata: {}
            };
        }
    }

    /**
     * Voice Conversation - Audio completo (STT + LLM + TTS)
     */
    async voiceConversation(audioBlob, options = {}) {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.wav');
            formData.append('options', JSON.stringify(options));

            const response = await fetch(`${this.netlifyFunctionsPath}/voice-conversation`, {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(30000) // 30s timeout for voice
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Voice API error: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('[API Client] Voice error:', error);
            throw error;
        }
    }

    /**
     * Health check
     */
    async health() {
        try {
            const response = await fetch(`${this.netlifyFunctionsPath}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) {
                throw new Error(`Health check failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[API Client] Health check error:', error);
            return { status: 'error', error: error.message };
        }
    }

    /**
     * Avatar HeyGen integration
     */
    async generateAvatar(message, options = {}) {
        try {
            const response = await fetch(`${this.netlifyFunctionsPath}/avatar-heygen`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    ...options
                }),
                signal: AbortSignal.timeout(20000)
            });

            if (!response.ok) {
                throw new Error(`Avatar API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[API Client] Avatar error:', error);
            throw error;
        }
    }

    /**
     * Get metrics
     */
    getStats() {
        return {
            ...this.metrics,
            successRate: this.metrics.totalRequests > 0
                ? ((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(1) + '%'
                : '0%'
        };
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.sandraAPI = new SandraAPIClient();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SandraAPIClient;
}

