// Sandra DevConsole - Metrics Manager
class SandraMetrics {
    constructor() {
        this.isCollecting = false;
        this.collectionInterval = null;
        this.refreshInterval = 30000; // 30 seconds
        this.lastMetrics = null;
        this.chartInstances = {};

        console.log('Sandra Metrics initialized');
    }

    async init() {
        this.setupMetricsDisplay();
        console.log('Metrics manager ready');
    }

    startCollection() {
        if (this.isCollecting) return;

        this.isCollecting = true;
        this.collectionInterval = setInterval(() => {
            this.refreshMetrics();
        }, this.refreshInterval);

        // Initial load
        this.refreshMetrics();
        console.log('Metrics collection started');
    }

    stopCollection() {
        if (!this.isCollecting) return;

        this.isCollecting = false;
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
        }

        console.log('Metrics collection stopped');
    }

    async refreshMetrics() {
        try {
            const metrics = await window.sandraApp.api.getMetrics();
            this.lastMetrics = metrics;
            this.updateMetricsDisplay(metrics);
            
            // También mostrar métricas de performance del frontend
            if (window.performanceMetrics) {
                this.updatePerformanceMetrics(window.performanceMetrics);
            }
        } catch (error) {
            console.error('Failed to refresh metrics:', error);
            this.showMetricsError();
        }
    }

    /**
     * Actualizar métricas de performance del frontend
     */
    updatePerformanceMetrics(metrics) {
        if (!metrics || metrics.length === 0) return;
        
        // Calcular estadísticas
        const recent = metrics.slice(-20); // Últimas 20
        const avgLatency = recent.reduce((sum, m) => sum + m.latency, 0) / recent.length;
        const successRate = (recent.filter(m => m.success).length / recent.length) * 100;
        
        // Mostrar en consola si hay problemas
        if (avgLatency > 5000) {
            console.warn(`[PERF] Average latency high: ${avgLatency.toFixed(0)}ms`);
        }
        
        if (successRate < 90) {
            console.warn(`[PERF] Success rate low: ${successRate.toFixed(1)}%`);
        }
        
        // Almacenar para visualización
        this.performanceStats = {
            avgLatency: Math.round(avgLatency),
            successRate: successRate.toFixed(1) + '%',
            totalRequests: metrics.length
        };
    }

    /**
     * Registrar alta latencia
     */
    recordHighLatency(metric) {
        if (!this.highLatencyEvents) {
            this.highLatencyEvents = [];
        }
        
        this.highLatencyEvents.push({
            ...metric,
            timestamp: Date.now()
        });
        
        // Mantener solo últimas 10
        if (this.highLatencyEvents.length > 10) {
            this.highLatencyEvents.shift();
        }
        
        console.warn(`[PERF ALERT] High latency: ${metric.endpoint} - ${metric.latency}ms`);
    }

    updateMetricsDisplay(metrics) {
        this.updateSystemMetrics(metrics.system);
        this.updateServiceMetrics(metrics.services);
        this.updateConversationMetrics(metrics.conversations);
        this.updateErrorMetrics(metrics.errors);
        this.updateSummaryMetrics(metrics.summary);
    }

    updateSystemMetrics(systemMetrics) {
        // Uptime
        const uptimeElement = document.getElementById('uptimeMetric');
        if (uptimeElement) {
            uptimeElement.textContent = this.formatUptime(systemMetrics.uptime);
        }

        // Requests per minute
        const requestsElement = document.getElementById('requestsMetric');
        if (requestsElement) {
            requestsElement.textContent = systemMetrics.requestsPerMinute.toFixed(1);
        }

        // Average response time
        const responseTimeElement = document.getElementById('responseTimeMetric');
        if (responseTimeElement) {
            responseTimeElement.textContent = systemMetrics.averageResponseTime.toFixed(0) + 'ms';
        }

        // Success rate
        const successRateElement = document.getElementById('successRateMetric');
        if (successRateElement) {
            successRateElement.textContent = systemMetrics.successRate.toFixed(1) + '%';

            // Color coding
            if (systemMetrics.successRate >= 95) {
                successRateElement.style.color = 'var(--success-color)';
            } else if (systemMetrics.successRate >= 85) {
                successRateElement.style.color = 'var(--warning-color)';
            } else {
                successRateElement.style.color = 'var(--error-color)';
            }
        }
    }

    updateServiceMetrics(servicesMetrics) {
        // Update service status indicators
        Object.keys(servicesMetrics).forEach(serviceName => {
            const service = servicesMetrics[serviceName];
            const statusElement = document.querySelector(`[data-service="${serviceName}"] .status-dot`);

            if (statusElement) {
                statusElement.className = 'status-dot';

                if (service.status === 'healthy') {
                    statusElement.classList.add('online');
                } else if (service.status === 'error') {
                    statusElement.classList.add('offline');
                } else {
                    statusElement.classList.add('warning');
                }
            }
        });

        // Create detailed service metrics if panel is open
        this.updateDetailedServiceMetrics(servicesMetrics);
    }

    updateDetailedServiceMetrics(servicesMetrics) {
        const container = document.getElementById('detailedServiceMetrics');
        if (!container) return;

        container.innerHTML = '';

        Object.keys(servicesMetrics).forEach(serviceName => {
            const service = servicesMetrics[serviceName];
            const serviceDiv = this.createServiceMetricCard(serviceName, service);
            container.appendChild(serviceDiv);
        });
    }

    createServiceMetricCard(serviceName, service) {
        const div = document.createElement('div');
        div.className = 'service-metric-card';
        div.style.cssText = `
            background: var(--secondary-color);
            border-radius: var(--radius-md);
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-md);
            border: 1px solid var(--accent-color);
        `;

        const statusColor = service.status === 'healthy' ? 'var(--success-color)' :
                           service.status === 'error' ? 'var(--error-color)' : 'var(--warning-color)';

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                <h5 style="color: var(--sandra-blue); margin: 0;">${this.formatServiceName(serviceName)}</h5>
                <span style="color: ${statusColor}; font-weight: bold;">${service.status}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-sm); font-size: 12px;">
                <div>
                    <span style="color: var(--text-muted);">Requests:</span>
                    <span style="color: var(--text-primary); font-weight: bold;">${service.requests}</span>
                </div>
                <div>
                    <span style="color: var(--text-muted);">Responses:</span>
                    <span style="color: var(--text-primary); font-weight: bold;">${service.responses}</span>
                </div>
                <div>
                    <span style="color: var(--text-muted);">Errors:</span>
                    <span style="color: ${service.errors > 0 ? 'var(--error-color)' : 'var(--success-color)'}; font-weight: bold;">${service.errors}</span>
                </div>
                <div>
                    <span style="color: var(--text-muted);">Avg Time:</span>
                    <span style="color: var(--text-primary); font-weight: bold;">${service.averageResponseTime.toFixed(0)}ms</span>
                </div>
                <div style="grid-column: 1 / -1;">
                    <span style="color: var(--text-muted);">Uptime:</span>
                    <span style="color: ${service.uptime >= 95 ? 'var(--success-color)' : service.uptime >= 85 ? 'var(--warning-color)' : 'var(--error-color)'}; font-weight: bold;">${service.uptime.toFixed(1)}%</span>
                </div>
            </div>
        `;

        return div;
    }

    updateConversationMetrics(conversationMetrics) {
        const container = document.getElementById('conversationMetrics');
        if (!container) return;

        container.innerHTML = `
            <div class="metric">
                <span class="metric-label">Total</span>
                <span class="metric-value">${conversationMetrics.total}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Activas</span>
                <span class="metric-value">${conversationMetrics.active}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Promedio Mensajes</span>
                <span class="metric-value">${conversationMetrics.averageLength.toFixed(1)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Duración Promedio</span>
                <span class="metric-value">${this.formatDuration(conversationMetrics.averageDuration)}</span>
            </div>
        `;

        // Multimodal usage chart
        this.updateMultimodalChart(conversationMetrics.multimodalUsage);
    }

    updateMultimodalChart(multimodalUsage) {
        const chartContainer = document.getElementById('multimodalChart');
        if (!chartContainer) return;

        // Simple text-based chart for now
        const total = Object.values(multimodalUsage).reduce((a, b) => a + b, 0);

        chartContainer.innerHTML = `
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: var(--spacing-sm);">
                Distribución de Modos
            </div>
            ${Object.entries(multimodalUsage).map(([mode, count]) => {
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xs);">
                        <span style="font-size: 12px;">${this.formatModeName(mode)}</span>
                        <div style="display: flex; align-items: center; gap: var(--spacing-xs);">
                            <div style="width: 50px; height: 4px; background: var(--accent-color); border-radius: 2px;">
                                <div style="width: ${percentage}%; height: 100%; background: var(--sandra-blue); border-radius: 2px;"></div>
                            </div>
                            <span style="font-size: 10px; color: var(--text-muted); min-width: 25px;">${count}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    updateErrorMetrics(errorMetrics) {
        const container = document.getElementById('errorMetrics');
        if (!container) return;

        container.innerHTML = `
            <div class="metric">
                <span class="metric-label">Total Errores</span>
                <span class="metric-value" style="color: ${errorMetrics.total > 0 ? 'var(--error-color)' : 'var(--success-color)'}">${errorMetrics.total}</span>
            </div>
        `;

        // Recent errors list
        this.updateRecentErrors(errorMetrics.recent);
    }

    updateRecentErrors(recentErrors) {
        const container = document.getElementById('recentErrors');
        if (!container) return;

        if (recentErrors.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--success-color); font-size: 12px;">Sin errores recientes 🎉</div>';
            return;
        }

        container.innerHTML = recentErrors.slice(0, 5).map(error => {
            const timeAgo = this.timeAgo(error.timestamp);
            return `
                <div style="background: rgba(244, 67, 54, 0.1); border-radius: var(--radius-sm); padding: var(--spacing-sm); margin-bottom: var(--spacing-xs); border-left: 3px solid var(--error-color);">
                    <div style="font-size: 11px; color: var(--error-color); font-weight: bold;">${error.service} - ${error.type}</div>
                    <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${error.message}</div>
                    <div style="font-size: 9px; color: var(--text-muted); margin-top: 2px;">${timeAgo}</div>
                </div>
            `;
        }).join('');
    }

    updateSummaryMetrics(summary) {
        // Update header indicators
        const summaryContainer = document.getElementById('metricsSummary');
        if (!summaryContainer) return;

        summaryContainer.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-sm); font-size: 12px;">
                <div>
                    <span style="color: var(--text-muted);">Servicios Saludables:</span>
                    <span style="color: var(--sandra-blue); font-weight: bold;">${summary.healthyServices}/${summary.totalServices}</span>
                </div>
                <div>
                    <span style="color: var(--text-muted);">Uptime:</span>
                    <span style="color: var(--sandra-blue); font-weight: bold;">${summary.uptimeFormatted}</span>
                </div>
                <div>
                    <span style="color: var(--text-muted);">Req/min:</span>
                    <span style="color: var(--sandra-blue); font-weight: bold;">${summary.requestsPerMinute}</span>
                </div>
                <div>
                    <span style="color: var(--text-muted);">Error Rate:</span>
                    <span style="color: ${parseFloat(summary.errorRateFormatted) < 10 ? 'var(--success-color)' : 'var(--error-color)'}; font-weight: bold;">${summary.errorRateFormatted}</span>
                </div>
            </div>
        `;
    }

    setupMetricsDisplay() {
        // Add detailed metrics containers if not present
        if (!document.getElementById('detailedServiceMetrics')) {
            const metricsPanel = document.getElementById('metricsPanel');
            if (metricsPanel) {
                metricsPanel.innerHTML += `
                    <div id="metricsSummary" class="mb-md"></div>
                    <div id="detailedServiceMetrics" class="mb-md"></div>
                    <div id="conversationMetrics" class="metrics-grid mb-md"></div>
                    <div id="multimodalChart" class="mb-md"></div>
                    <div id="errorMetrics" class="mb-md"></div>
                    <div id="recentErrors"></div>
                `;
            }
        }
    }

    showMetricsError() {
        const elements = ['uptimeMetric', 'requestsMetric', 'responseTimeMetric', 'successRateMetric'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '--';
                element.style.color = 'var(--error-color)';
            }
        });
    }

    // Utility methods
    formatUptime(uptimeMs) {
        const seconds = Math.floor(uptimeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m`;
        return `${seconds}s`;
    }

    formatDuration(durationMs) {
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);

        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    }

    formatServiceName(serviceName) {
        const names = {
            'sandra-ai-core': 'AI Core',
            'sandra-voice': 'Voice',
            'sandra-avatar': 'Avatar',
            'sandra-payments': 'Payments'
        };
        return names[serviceName] || serviceName;
    }

    formatModeName(mode) {
        const names = {
            'textOnly': 'Solo Texto',
            'withVoice': 'Con Voz',
            'withAvatar': 'Con Avatar',
            'fullMultimodal': 'Multimodal'
        };
        return names[mode] || mode;
    }

    timeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        if (minutes > 0) return `${minutes}m`;
        return 'ahora';
    }

    // Export metrics
    exportMetrics() {
        if (!this.lastMetrics) {
            console.warn('No metrics data to export');
            return;
        }

        const exportData = {
            metrics: this.lastMetrics,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sandra-metrics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    // Performance monitoring
    addPerformanceMetric(name, value, unit = 'ms') {
        if (!this.performanceMetrics) {
            this.performanceMetrics = {};
        }

        if (!this.performanceMetrics[name]) {
            this.performanceMetrics[name] = [];
        }

        this.performanceMetrics[name].push({
            value,
            timestamp: Date.now(),
            unit
        });

        // Keep only last 100 measurements
        if (this.performanceMetrics[name].length > 100) {
            this.performanceMetrics[name].shift();
        }
    }

    getPerformanceMetrics() {
        return this.performanceMetrics || {};
    }

    // Health status calculation
    calculateHealthStatus() {
        if (!this.lastMetrics) return 'unknown';

        const system = this.lastMetrics.system;
        const services = this.lastMetrics.services;

        // Calculate service health
        const serviceValues = Object.values(services);
        const healthyServices = serviceValues.filter(s => s.status === 'healthy').length;
        const serviceHealthRatio = healthyServices / serviceValues.length;

        // Calculate overall health
        if (system.errorRate > 20 || serviceHealthRatio < 0.5) return 'critical';
        if (system.errorRate > 10 || serviceHealthRatio < 0.75) return 'warning';
        if (system.averageResponseTime > 5000) return 'degraded';
        return 'healthy';
    }

    cleanup() {
        this.stopCollection();

        // Cleanup chart instances
        Object.values(this.chartInstances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.chartInstances = {};

        console.log('Metrics manager cleaned up');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SandraMetrics };
}