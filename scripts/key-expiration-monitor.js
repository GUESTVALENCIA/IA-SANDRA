const fs = require('fs');
const path = require('path');

class KeyExpirationMonitor {
  constructor() {
    this.rotationInterval = 90; // days
    this.warningThreshold = 14; // days before expiration
    this.criticalThreshold = 7; // days for critical alert
    this.logPath = path.join(__dirname, '../security-logs');
  }

  async checkExpiration() {
    try {
      // Ensure log directory exists
      if (!fs.existsSync(this.logPath)) {
        fs.mkdirSync(this.logPath, { recursive: true });
      }

      const auditLogPath = path.join(this.logPath, 'rotation-audit.json');

      // If no audit log exists, create initial entry
      if (!fs.existsSync(auditLogPath)) {
        const initialLog = [{
          timestamp: new Date().toISOString(),
          action: 'initial',
          status: 'success',
          services: ['openai', 'anthropic', 'groq', 'cartesia', 'elevenlabs']
        }];
        fs.writeFileSync(auditLogPath, JSON.stringify(initialLog, null, 2));
      }

      const auditLog = JSON.parse(fs.readFileSync(auditLogPath, 'utf8'));
      const lastRotation = auditLog[auditLog.length - 1];
      const lastRotationDate = new Date(lastRotation.timestamp);

      const expirationDate = new Date(lastRotationDate.getTime() + this.rotationInterval * 24 * 60 * 60 * 1000);
      const daysUntilExpiration = Math.floor((expirationDate - new Date()) / (24 * 60 * 60 * 1000));

      // Determine alert level
      let alertLevel = 'ok';
      if (daysUntilExpiration <= 0) {
        alertLevel = 'expired';
        this.alertExpirationCritical();
      } else if (daysUntilExpiration <= this.criticalThreshold) {
        alertLevel = 'critical';
        this.alertExpirationCritical(daysUntilExpiration);
      } else if (daysUntilExpiration <= this.warningThreshold) {
        alertLevel = 'warning';
        this.alertExpirationWarning(daysUntilExpiration);
      }

      // Log the check
      this.logExpirationCheck({
        timestamp: new Date().toISOString(),
        lastRotation: lastRotationDate.toISOString(),
        expirationDate: expirationDate.toISOString(),
        daysUntilExpiration,
        alertLevel
      });

      return {
        expirationDate: expirationDate.toISOString(),
        daysUntilExpiration,
        alertLevel,
        lastRotation: lastRotationDate.toISOString()
      };
    } catch (error) {
      console.error('Error checking expiration:', error);
      throw error;
    }
  }

  alertExpirationCritical(days = 0) {
    const message = days === 0
      ? '🚨 CRITICAL: API keys have expired! Immediate rotation required!'
      : `🚨 CRITICAL: API keys expire in ${days} days! Urgent rotation needed!`;

    console.error(message);

    // Log critical alert
    this.logAlert({
      level: 'critical',
      message,
      timestamp: new Date().toISOString(),
      daysRemaining: days
    });

    // In production, this would trigger:
    // - Slack alerts
    // - PagerDuty incident
    // - Email to security team
    // - Automatic rotation workflow
  }

  alertExpirationWarning(days) {
    const message = `⚠️  WARNING: API keys expire in ${days} days. Schedule rotation soon.`;
    console.warn(message);

    // Log warning
    this.logAlert({
      level: 'warning',
      message,
      timestamp: new Date().toISOString(),
      daysRemaining: days
    });
  }

  logExpirationCheck(data) {
    const logFile = path.join(this.logPath, 'expiration-checks.json');
    let checks = [];

    if (fs.existsSync(logFile)) {
      checks = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }

    checks.push(data);

    // Keep only last 30 days of checks
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    checks = checks.filter(check => new Date(check.timestamp) > thirtyDaysAgo);

    fs.writeFileSync(logFile, JSON.stringify(checks, null, 2));
  }

  logAlert(alert) {
    const alertFile = path.join(this.logPath, 'expiration-alerts.json');
    let alerts = [];

    if (fs.existsSync(alertFile)) {
      alerts = JSON.parse(fs.readFileSync(alertFile, 'utf8'));
    }

    alerts.push(alert);
    fs.writeFileSync(alertFile, JSON.stringify(alerts, null, 2));
  }

  async getStatus() {
    const expiration = await this.checkExpiration();

    return {
      healthy: expiration.alertLevel === 'ok',
      daysUntilExpiration: expiration.daysUntilExpiration,
      expirationDate: expiration.expirationDate,
      lastRotation: expiration.lastRotation,
      alertLevel: expiration.alertLevel,
      rotationRecommended: expiration.daysUntilExpiration <= this.warningThreshold
    };
  }
}

// If running directly
if (require.main === module) {
  const monitor = new KeyExpirationMonitor();
  monitor.checkExpiration()
    .then(result => {
      console.log('Expiration Check Result:', JSON.stringify(result, null, 2));
      process.exit(result.alertLevel === 'expired' ? 1 : 0);
    })
    .catch(error => {
      console.error('Failed to check expiration:', error);
      process.exit(1);
    });
}

module.exports = KeyExpirationMonitor;