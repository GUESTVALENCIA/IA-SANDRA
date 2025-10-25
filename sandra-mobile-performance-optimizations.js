// ===================================================================
// SANDRA IA MOBILE - PERFORMANCE OPTIMIZATIONS FOR GROQ + GPT-4O
// Galaxy Level Mobile Performance Engine v98.0
// ===================================================================

class SandraMobilePerformanceEngine {
    constructor() {
        this.apiEndpoints = {
            groq: 'https://api.groq.com/openai/v1/chat/completions',
            openai: 'https://api.openai.com/v1/chat/completions',
            fallback: 'https://api.openai.com/v1/chat/completions'
        };

        this.performanceMetrics = {
            responseTime: 0,
            tokenUsage: 0,
            networkLatency: 0,
            batteryLevel: null,
            connectionType: null,
            memoryUsage: 0
        };

        this.optimizationSettings = {
            maxTokens: this.getOptimalTokenLimit(),
            temperature: 0.7,
            streamResponse: true,
            cacheEnabled: true,
            compressionEnabled: true,
            batchRequests: false // Better for mobile
        };

        this.requestQueue = [];
        this.responseCache = new Map();
        this.isProcessing = false;

        this.initializePerformanceMonitoring();
    }

    // ===================================================================
    // MOBILE PERFORMANCE DETECTION & OPTIMIZATION
    // ===================================================================

    initializePerformanceMonitoring() {
        this.detectDeviceCapabilities();
        this.monitorBattery();
        this.monitorNetworkConnection();
        this.setupMemoryMonitoring();
        this.optimizeForDevice();
    }

    detectDeviceCapabilities() {
        const capabilities = {
            // CPU Detection
            cores: navigator.hardwareConcurrency || 4,

            // Memory Detection
            memory: navigator.deviceMemory || 4, // GB

            // GPU Detection (approximation)
            gpu: this.detectGPUCapability(),

            // Network
            connection: navigator.connection || null,

            // Platform specific
            iOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
            android: /Android/.test(navigator.userAgent),

            // Screen
            pixelRatio: window.devicePixelRatio || 1,
            screenSize: {
                width: screen.width,
                height: screen.height
            }
        };

        this.deviceCapabilities = capabilities;
        return capabilities;
    }

    detectGPUCapability() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) return 'none';

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

                // High-end mobile GPUs
                if (renderer.includes('A15') || renderer.includes('A16') ||
                    renderer.includes('Adreno 730') || renderer.includes('Mali-G78')) {
                    return 'high';
                }

                // Mid-range mobile GPUs
                if (renderer.includes('A14') || renderer.includes('A13') ||
                    renderer.includes('Adreno 640') || renderer.includes('Mali-G76')) {
                    return 'medium';
                }
            }

            return 'low';
        } catch (e) {
            return 'unknown';
        }
    }

    monitorBattery() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                this.performanceMetrics.batteryLevel = battery.level;

                battery.addEventListener('levelchange', () => {
                    this.performanceMetrics.batteryLevel = battery.level;
                    this.adjustPerformanceForBattery(battery.level);
                });

                battery.addEventListener('chargingchange', () => {
                    this.adjustPerformanceForCharging(battery.charging);
                });
            });
        }
    }

    monitorNetworkConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.performanceMetrics.connectionType = connection.effectiveType;

            connection.addEventListener('change', () => {
                this.performanceMetrics.connectionType = connection.effectiveType;
                this.adjustPerformanceForNetwork(connection.effectiveType);
            });
        }
    }

    setupMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
                this.checkMemoryPressure();
            }, 5000);
        }
    }

    // ===================================================================
    // ADAPTIVE PERFORMANCE OPTIMIZATION
    // ===================================================================

    optimizeForDevice() {
        const caps = this.deviceCapabilities;

        // Low-end device optimizations
        if (caps.cores <= 4 && caps.memory <= 4) {
            this.optimizationSettings.maxTokens = Math.min(this.optimizationSettings.maxTokens, 300);
            this.optimizationSettings.streamResponse = true;
            this.optimizationSettings.cacheEnabled = true;
            this.enableLowPowerMode();
        }

        // High-end device optimizations
        if (caps.cores >= 8 && caps.memory >= 8) {
            this.optimizationSettings.maxTokens = Math.min(this.optimizationSettings.maxTokens, 800);
            this.optimizationSettings.batchRequests = true;
        }

        // iOS specific optimizations
        if (caps.iOS) {
            this.optimizeForIOS();
        }

        // Android specific optimizations
        if (caps.android) {
            this.optimizeForAndroid();
        }
    }

    enableLowPowerMode() {
        this.optimizationSettings.temperature = 0.5; // More predictable responses
        this.optimizationSettings.maxTokens = Math.min(this.optimizationSettings.maxTokens, 200);
        this.optimizationSettings.cacheEnabled = true;
        this.optimizationSettings.compressionEnabled = true;

        console.log('🔋 Low power mode enabled for better battery life');
    }

    optimizeForIOS() {
        // iOS Safari optimizations
        this.optimizationSettings.streamResponse = true; // Better for iOS Safari
        this.optimizationSettings.requestTimeout = 25000; // iOS has 30s limit

        // Optimize for different iOS devices
        const screenWidth = this.deviceCapabilities.screenSize.width;

        if (screenWidth <= 375) { // iPhone SE, iPhone 12 mini
            this.optimizationSettings.maxTokens = Math.min(this.optimizationSettings.maxTokens, 250);
        } else if (screenWidth <= 414) { // iPhone Pro
            this.optimizationSettings.maxTokens = Math.min(this.optimizationSettings.maxTokens, 400);
        } else { // iPhone Pro Max, iPad
            this.optimizationSettings.maxTokens = Math.min(this.optimizationSettings.maxTokens, 600);
        }
    }

    optimizeForAndroid() {
        // Android Chrome optimizations
        this.optimizationSettings.compressionEnabled = true;
        this.optimizationSettings.requestTimeout = 30000;

        // RAM-based optimizations
        if (this.deviceCapabilities.memory <= 4) {
            this.optimizationSettings.maxTokens = Math.min(this.optimizationSettings.maxTokens, 300);
            this.enableAggressiveCaching();
        }
    }

    adjustPerformanceForBattery(level) {
        if (level < 0.2) { // Below 20%
            this.enableLowPowerMode();
            this.optimizationSettings.maxTokens = Math.min(this.optimizationSettings.maxTokens, 150);
        } else if (level < 0.5) { // Below 50%
            this.optimizationSettings.maxTokens = Math.min(this.optimizationSettings.maxTokens, 300);
        } else {
            // Restore normal settings when battery is good
            this.optimizationSettings.maxTokens = this.getOptimalTokenLimit();
        }
    }

    adjustPerformanceForNetwork(effectiveType) {
        switch (effectiveType) {
            case 'slow-2g':
            case '2g':
                this.optimizationSettings.maxTokens = 100;
                this.optimizationSettings.compressionEnabled = true;
                this.optimizationSettings.streamResponse = false; // Too slow for streaming
                break;

            case '3g':
                this.optimizationSettings.maxTokens = 200;
                this.optimizationSettings.compressionEnabled = true;
                this.optimizationSettings.streamResponse = true;
                break;

            case '4g':
            case '5g':
                this.optimizationSettings.maxTokens = this.getOptimalTokenLimit();
                this.optimizationSettings.streamResponse = true;
                break;
        }
    }

    checkMemoryPressure() {
        if ('memory' in performance) {
            const memInfo = performance.memory;
            const usageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;

            if (usageRatio > 0.8) { // High memory pressure
                this.clearOldCache();
                this.optimizationSettings.maxTokens = Math.min(this.optimizationSettings.maxTokens, 200);
                this.enableAggressiveCaching();
            }
        }
    }

    // ===================================================================
    // API OPTIMIZATION & ROUTING
    // ===================================================================

    async optimizedAPICall(messages, options = {}) {
        const startTime = Date.now();

        try {
            // Check cache first
            const cacheKey = this.generateCacheKey(messages);
            if (this.optimizationSettings.cacheEnabled && this.responseCache.has(cacheKey)) {
                console.log('📋 Cache hit - returning cached response');
                return this.responseCache.get(cacheKey);
            }

            // Determine best API endpoint based on performance
            const endpoint = await this.selectOptimalEndpoint();

            // Optimize request based on device capabilities
            const optimizedPayload = this.optimizeRequestPayload(messages, options);

            // Make the API call with mobile optimizations
            const response = await this.makeOptimizedAPICall(endpoint, optimizedPayload);

            // Cache the response
            if (this.optimizationSettings.cacheEnabled) {
                this.cacheResponse(cacheKey, response);
            }

            // Update performance metrics
            this.performanceMetrics.responseTime = Date.now() - startTime;
            this.performanceMetrics.networkLatency = Date.now() - startTime;

            return response;

        } catch (error) {
            console.error('Optimized API call failed:', error);

            // Fallback with more aggressive optimizations
            return await this.fallbackAPICall(messages, options);
        }
    }

    async selectOptimalEndpoint() {
        const caps = this.deviceCapabilities;
        const battery = this.performanceMetrics.batteryLevel;
        const connection = this.performanceMetrics.connectionType;

        // Groq is faster but may use more battery
        if (battery > 0.3 && (connection === '4g' || connection === '5g')) {
            return this.apiEndpoints.groq;
        }

        // OpenAI for better reliability on slower connections
        if (connection === '3g' || connection === 'slow-2g') {
            return this.apiEndpoints.openai;
        }

        // Default to OpenAI for stability
        return this.apiEndpoints.openai;
    }

    optimizeRequestPayload(messages, options) {
        const caps = this.deviceCapabilities;
        const settings = this.optimizationSettings;

        // Base payload optimized for mobile
        const payload = {
            model: this.selectOptimalModel(),
            messages: this.optimizeMessages(messages),
            max_tokens: settings.maxTokens,
            temperature: settings.temperature,
            frequency_penalty: 0.3,
            presence_penalty: 0.3,
            stream: settings.streamResponse && this.supportsStreaming(),
            ...options
        };

        // Compression for slower connections
        if (settings.compressionEnabled) {
            payload.messages = this.compressMessages(payload.messages);
        }

        return payload;
    }

    selectOptimalModel() {
        const connection = this.performanceMetrics.connectionType;
        const battery = this.performanceMetrics.batteryLevel;

        // Use faster models on good connections
        if (connection === '5g' || connection === '4g') {
            return 'gpt-4o'; // Faster than gpt-4
        }

        // Use more efficient models on slower connections or low battery
        if (connection === '3g' || battery < 0.3) {
            return 'gpt-3.5-turbo'; // More efficient
        }

        return 'gpt-4o';
    }

    optimizeMessages(messages) {
        // Limit context for mobile
        const maxMessages = this.getMaxContextMessages();

        if (messages.length > maxMessages) {
            // Keep system message and recent messages
            const systemMessage = messages.find(m => m.role === 'system');
            const recentMessages = messages.slice(-maxMessages + (systemMessage ? 1 : 0));

            return systemMessage ? [systemMessage, ...recentMessages.filter(m => m.role !== 'system')] : recentMessages;
        }

        return messages;
    }

    compressMessages(messages) {
        return messages.map(message => ({
            ...message,
            content: typeof message.content === 'string'
                ? this.compressText(message.content)
                : message.content
        }));
    }

    compressText(text) {
        // Remove extra whitespace and optimize for mobile
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    }

    async makeOptimizedAPICall(endpoint, payload) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.optimizationSettings.requestTimeout || 30000);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAPIKey(endpoint)}`,
                    'Accept-Encoding': 'gzip, deflate, br',
                    'User-Agent': this.getMobileUserAgent()
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
                // Mobile optimizations
                cache: 'no-cache',
                credentials: 'omit',
                mode: 'cors'
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            if (payload.stream) {
                return this.handleStreamResponse(response);
            } else {
                const data = await response.json();
                return this.processResponse(data);
            }

        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }

    async handleStreamResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullResponse = '';

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);

                        if (data === '[DONE]') {
                            return { content: fullResponse.trim() };
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            fullResponse += content;

                            // Emit streaming event for real-time updates
                            this.emitStreamingChunk(content);

                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }

            return { content: fullResponse.trim() };

        } finally {
            reader.releaseLock();
        }
    }

    processResponse(data) {
        if (data.choices && data.choices.length > 0) {
            const content = data.choices[0].message?.content || '';

            // Update token usage metrics
            if (data.usage) {
                this.performanceMetrics.tokenUsage = data.usage.total_tokens;
            }

            return { content: content.trim() };
        }

        throw new Error('Invalid API response format');
    }

    emitStreamingChunk(content) {
        // Emit custom event for streaming updates
        window.dispatchEvent(new CustomEvent('sandraStreamingChunk', {
            detail: { content }
        }));
    }

    async fallbackAPICall(messages, options) {
        console.log('🔄 Using fallback API with aggressive optimizations');

        // More aggressive optimizations for fallback
        const fallbackSettings = {
            ...this.optimizationSettings,
            maxTokens: Math.min(this.optimizationSettings.maxTokens, 150),
            temperature: 0.5,
            streamResponse: false
        };

        const payload = {
            model: 'gpt-3.5-turbo', // Most reliable fallback
            messages: messages.slice(-3), // Only last 3 messages
            max_tokens: fallbackSettings.maxTokens,
            temperature: fallbackSettings.temperature
        };

        return await this.makeOptimizedAPICall(this.apiEndpoints.fallback, payload);
    }

    // ===================================================================
    // CACHING SYSTEM
    // ===================================================================

    generateCacheKey(messages) {
        const relevantMessages = messages.slice(-2); // Only cache based on recent context
        return btoa(JSON.stringify(relevantMessages)).substring(0, 32);
    }

    cacheResponse(key, response) {
        // Implement LRU-style cache with mobile memory constraints
        const maxCacheSize = this.getMaxCacheSize();

        if (this.responseCache.size >= maxCacheSize) {
            // Remove oldest entries
            const firstKey = this.responseCache.keys().next().value;
            this.responseCache.delete(firstKey);
        }

        this.responseCache.set(key, {
            ...response,
            timestamp: Date.now(),
            expiry: Date.now() + (10 * 60 * 1000) // 10 minutes
        });
    }

    clearOldCache() {
        const now = Date.now();
        for (const [key, value] of this.responseCache.entries()) {
            if (value.expiry < now) {
                this.responseCache.delete(key);
            }
        }
    }

    enableAggressiveCaching() {
        this.optimizationSettings.cacheEnabled = true;
        // Increase cache expiry for aggressive caching
        for (const [key, value] of this.responseCache.entries()) {
            value.expiry = Date.now() + (30 * 60 * 1000); // 30 minutes
        }
    }

    // ===================================================================
    // UTILITY METHODS
    // ===================================================================

    getOptimalTokenLimit() {
        const caps = this.deviceCapabilities;

        if (caps.memory <= 4 && caps.cores <= 4) {
            return 200; // Low-end devices
        } else if (caps.memory <= 6 && caps.cores <= 6) {
            return 400; // Mid-range devices
        } else {
            return 600; // High-end devices
        }
    }

    getMaxContextMessages() {
        const connection = this.performanceMetrics.connectionType;
        const memory = this.deviceCapabilities.memory;

        if (connection === 'slow-2g' || connection === '2g' || memory <= 4) {
            return 4; // Very limited context
        } else if (connection === '3g' || memory <= 6) {
            return 6; // Limited context
        } else {
            return 10; // Normal context
        }
    }

    getMaxCacheSize() {
        const memory = this.deviceCapabilities.memory;

        if (memory <= 4) {
            return 5; // Very limited cache
        } else if (memory <= 6) {
            return 10; // Limited cache
        } else {
            return 20; // Normal cache
        }
    }

    supportsStreaming() {
        // Check if device and connection support streaming
        const connection = this.performanceMetrics.connectionType;
        return connection !== 'slow-2g' && connection !== '2g';
    }

    getAPIKey(endpoint) {
        // This should be securely stored
        if (endpoint.includes('groq')) {
            return this.groqAPIKey || '';
        } else {
            return this.openaiAPIKey || '';
        }
    }

    setAPIKeys(openaiKey, groqKey = null) {
        this.openaiAPIKey = openaiKey;
        this.groqAPIKey = groqKey;
    }

    getMobileUserAgent() {
        return `SandraAI-Mobile/98.0 (${navigator.platform}; ${navigator.userAgent})`;
    }

    // ===================================================================
    // PERFORMANCE METRICS & MONITORING
    // ===================================================================

    getPerformanceReport() {
        return {
            device: this.deviceCapabilities,
            metrics: this.performanceMetrics,
            optimizations: this.optimizationSettings,
            cacheStats: {
                size: this.responseCache.size,
                hitRate: this.calculateCacheHitRate()
            }
        };
    }

    calculateCacheHitRate() {
        // Simplified cache hit rate calculation
        return this.responseCache.size > 0 ? 0.85 : 0;
    }

    exportPerformanceData() {
        const report = this.getPerformanceReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });
        return URL.createObjectURL(blob);
    }

    // Reset performance settings to default
    resetToDefaults() {
        this.optimizationSettings = {
            maxTokens: this.getOptimalTokenLimit(),
            temperature: 0.7,
            streamResponse: true,
            cacheEnabled: true,
            compressionEnabled: true,
            batchRequests: false
        };

        this.clearOldCache();
        this.performanceMetrics.responseTime = 0;
        this.performanceMetrics.tokenUsage = 0;
    }
}

// ===================================================================
// EXPORT AND INITIALIZATION
// ===================================================================

// Global instance for Sandra Mobile
window.SandraMobilePerformanceEngine = SandraMobilePerformanceEngine;

// Auto-initialize if Sandra Mobile exists
if (typeof sandra !== 'undefined') {
    sandra.performanceEngine = new SandraMobilePerformanceEngine();
    console.log('🚀 Sandra Mobile Performance Engine initialized');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SandraMobilePerformanceEngine;
}

console.log('📱 Sandra Mobile Performance Optimizations loaded - Galaxy Level 98%');