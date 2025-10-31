/**
 * Error Monitoring Dashboard
 * TIER 2: Sistema de monitoreo y alertas
 */

class ErrorMonitoringDashboard {
  constructor() {
    this.errors = [];
    this.maxErrors = 1000;
    this.alertThresholds = {
      errorRate: 0.10,  // 10% error rate
      latency: 5000,    // 5s latency
      cascadeDetection: 3  // 3 related errors in 1 minute
    };

    this.initDashboard();
    this.startMonitoring();
  }

  logError(error) {
    const errorEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type: error.type || 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error',
      stack: error.stack,
      context: error.context || {},
      severity: this.calculateSeverity(error),
      cascade: this.detectCascade(error)
    };

    this.errors.unshift(errorEntry);
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    this.updateDashboard();
    this.checkAlerts(errorEntry);

    // Send to external monitoring
    this.sendToSentry(errorEntry);
  }

  calculateSeverity(error) {
    const message = (error.message || '').toLowerCase();
    
    if (message.includes('401') || message.includes('api key') || message.includes('unauthorized')) {
      return 'CRITICAL';
    }
    if (message.includes('timeout') || message.includes('cors') || message.includes('network')) {
      return 'HIGH';
    }
    if (message.includes('404') || message.includes('not found')) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  detectCascade(error) {
    // Check for related errors in last 60 seconds
    const now = Date.now();
    const recentErrors = this.errors.filter(e => 
      now - new Date(e.timestamp).getTime() < 60000
    );

    if (recentErrors.length >= this.alertThresholds.cascadeDetection) {
      return {
        detected: true,
        count: recentErrors.length,
        types: [...new Set(recentErrors.map(e => e.type))]
      };
    }

    return { detected: false };
  }

  checkAlerts(error) {
    // Error rate alert
    const recentErrors = this.errors.slice(0, 100);
    const errorRate = recentErrors.filter(e => e.severity !== 'LOW').length / 100;

    if (errorRate > this.alertThresholds.errorRate) {
      this.sendAlert({
        type: 'ERROR_RATE_CRITICAL',
        message: `Error rate at ${(errorRate * 100).toFixed(2)}% (threshold: ${(this.alertThresholds.errorRate * 100)}%)`,
        severity: 'CRITICAL',
        errors: recentErrors.slice(0, 5)
      });
    }

    // Cascade alert
    if (error.cascade.detected) {
      this.sendAlert({
        type: 'CASCADE_DETECTED',
        message: `Error cascade detected: ${error.cascade.count} related errors`,
        severity: 'HIGH',
        cascade: error.cascade
      });
    }
  }

  sendAlert(alert) {
    console.error('[ALERT]', alert);

    // Visual notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Sandra IA - Error Alert', {
        body: alert.message,
        icon: '/assets/images/sandra-avatar.svg',
        tag: alert.type
      });
    }

    // Could also send to Slack, PagerDuty, etc.
  }

  async sendToSentry(error) {
    // Integration with Sentry (if available)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(new Error(error.message), {
        level: error.severity.toLowerCase(),
        tags: {
          type: error.type,
          cascade: error.cascade.detected
        },
        extra: error.context
      });
    }
  }

  initDashboard() {
    // Create visual dashboard in DOM
    if (typeof document === 'undefined') return;

    const dashboard = document.createElement('div');
    dashboard.id = 'error-monitoring-dashboard';
    dashboard.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      max-height: 600px;
      background: rgba(20, 20, 30, 0.95);
      border: 2px solid #ff4444;
      border-radius: 10px;
      padding: 15px;
      color: white;
      font-family: monospace;
      font-size: 12px;
      overflow-y: auto;
      z-index: 10000;
      display: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;

    dashboard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="color: #ff4444; margin: 0;">🚨 Error Monitoring</h3>
        <button id="close-error-dashboard" style="background: #ff4444; border: none; color: white; padding: 5px 10px; border-radius: 5px; cursor: pointer;">×</button>
      </div>
      <div id="error-stats"></div>
      <div id="error-list"></div>
    `;

    document.body.appendChild(dashboard);

    // Close button
    const closeBtn = document.getElementById('close-error-dashboard');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        dashboard.style.display = 'none';
      });
    }

    // Toggle dashboard with Ctrl+Shift+E
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  updateDashboard() {
    if (typeof document === 'undefined') return;

    const stats = document.getElementById('error-stats');
    const list = document.getElementById('error-list');

    if (!stats || !list) return;

    // Calculate stats
    const last100 = this.errors.slice(0, 100);
    const criticalCount = last100.filter(e => e.severity === 'CRITICAL').length;
    const highCount = last100.filter(e => e.severity === 'HIGH').length;
    const cascades = last100.filter(e => e.cascade.detected).length;

    stats.innerHTML = `
      <div style="margin-bottom: 10px; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 5px;">
        <div>Total Errors: ${this.errors.length}</div>
        <div>Critical: <span style="color: #ff4444;">${criticalCount}</span></div>
        <div>High: <span style="color: #ffaa44;">${highCount}</span></div>
        <div>Cascades: <span style="color: #ff44ff;">${cascades}</span></div>
      </div>
    `;

    list.innerHTML = this.errors.slice(0, 10).map(e => `
      <div style="
        margin-bottom: 8px;
        padding: 8px;
        background: rgba(255, 68, 68, 0.1);
        border-left: 3px solid ${
          e.severity === 'CRITICAL' ? '#ff4444' :
          e.severity === 'HIGH' ? '#ffaa44' : '#ffff44'
        };
        border-radius: 3px;
      ">
        <div><strong>${e.type}</strong></div>
        <div style="font-size: 10px; color: #aaa;">${new Date(e.timestamp).toLocaleTimeString()}</div>
        <div style="margin-top: 4px; font-size: 11px;">${(e.message || '').substring(0, 100)}${e.message && e.message.length > 100 ? '...' : ''}</div>
        ${e.cascade.detected ? '<div style="color: #ff44ff; margin-top: 4px;">⚠️ Part of cascade</div>' : ''}
      </div>
    `).join('');
  }

  startMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor global errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'JAVASCRIPT_ERROR',
        message: event.message,
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'UNHANDLED_PROMISE_REJECTION',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        context: { promise: event.promise }
      });
    });

    // Monitor fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        if (!response.ok) {
          this.logError({
            type: 'HTTP_ERROR',
            message: `HTTP ${response.status}: ${response.statusText}`,
            context: {
              url: args[0],
              status: response.status,
              method: args[1]?.method || 'GET'
            }
          });
        }

        return response;
      } catch (error) {
        this.logError({
          type: 'FETCH_ERROR',
          message: error.message,
          stack: error.stack,
          context: { url: args[0] }
        });
        throw error;
      }
    };
  }
}

// Initialize global error monitoring
if (typeof window !== 'undefined') {
  window.errorMonitor = new ErrorMonitoringDashboard();
  console.log('[Error Monitoring] Dashboard initialized');
}

