/**
 * TOKEN MONITOR SYSTEM
 * Sistema de monitoreo de consumo de tokens para Cursor PRO
 * Rastrea consumo real para planificación de subagentes
 */

const fs = require('fs').promises;
const path = require('path');

class TokenMonitor {
  constructor(baseDir = null) {
    const monitorDir = baseDir || 
      path.join(process.env.APPDATA || process.env.HOME || __dirname, '.token-monitor');
    
    this.monitorDir = monitorDir;
    this.dailyLogFile = path.join(this.monitorDir, 'daily-consumption.json');
    this.monthlySummaryFile = path.join(this.monitorDir, 'monthly-summary.json');
    this.settingsFile = path.join(this.monitorDir, 'settings.json');
    
    this.currentDate = new Date().toISOString().split('T')[0];
    this.settings = {
      plan: 'PRO',
      planCost: 20,
      planLimit: 20,
      alertThreshold: 0.8, // 80% del límite
      warningThreshold: 0.6 // 60% del límite
    };
    
    this.ensureMonitorDirectory();
  }

  async ensureMonitorDirectory() {
    try {
      await fs.mkdir(this.monitorDir, { recursive: true });
      await this.loadSettings();
    } catch (error) {
      console.warn('[TOKEN-MONITOR] Failed to create directory:', error.message);
    }
  }

  async loadSettings() {
    try {
      if (await fs.access(this.settingsFile).then(() => true).catch(() => false)) {
        const data = await fs.readFile(this.settingsFile, 'utf8');
        this.settings = { ...this.settings, ...JSON.parse(data) };
      } else {
        await this.saveSettings();
      }
    } catch (error) {
      console.warn('[TOKEN-MONITOR] Failed to load settings:', error.message);
    }
  }

  async saveSettings() {
    try {
      await fs.writeFile(
        this.settingsFile,
        JSON.stringify(this.settings, null, 2),
        'utf8'
      );
    } catch (error) {
      console.warn('[TOKEN-MONITOR] Failed to save settings:', error.message);
    }
  }

  // Registrar consumo de tokens
  async recordConsumption(source, tokens, cost = null) {
    try {
      const dailyLog = await this.loadDailyLog();
      
      const entry = {
        timestamp: new Date().toISOString(),
        source: source, // 'orchestrator', 'subagent-1', 'subagent-2', etc.
        tokens: tokens,
        cost: cost || this.calculateCost(tokens),
        date: this.currentDate
      };

      if (!dailyLog[this.currentDate]) {
        dailyLog[this.currentDate] = [];
      }
      
      dailyLog[this.currentDate].push(entry);

      // Mantener solo últimos 90 días
      const dates = Object.keys(dailyLog).sort();
      if (dates.length > 90) {
        dates.slice(0, dates.length - 90).forEach(date => {
          delete dailyLog[date];
        });
      }

      await this.saveDailyLog(dailyLog);
      await this.updateMonthlySummary();

      return entry;
    } catch (error) {
      console.error('[TOKEN-MONITOR] Failed to record consumption:', error);
      return null;
    }
  }

  async loadDailyLog() {
    try {
      if (await fs.access(this.dailyLogFile).then(() => true).catch(() => false)) {
        const data = await fs.readFile(this.dailyLogFile, 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.warn('[TOKEN-MONITOR] Failed to load daily log:', error.message);
      return {};
    }
  }

  async saveDailyLog(log) {
    try {
      await fs.writeFile(
        this.dailyLogFile,
        JSON.stringify(log, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('[TOKEN-MONITOR] Failed to save daily log:', error);
    }
  }

  async updateMonthlySummary() {
    try {
      const dailyLog = await this.loadDailyLog();
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      let monthlyTotal = 0;
      let monthlyTokens = 0;
      let bySource = {};
      let byDay = {};

      Object.entries(dailyLog).forEach(([date, entries]) => {
        if (date.startsWith(currentMonth)) {
          entries.forEach(entry => {
            monthlyTotal += entry.cost || 0;
            monthlyTokens += entry.tokens || 0;
            
            bySource[entry.source] = (bySource[entry.source] || 0) + (entry.cost || 0);
            byDay[date] = (byDay[date] || 0) + (entry.cost || 0);
          });
        }
      });

      const summary = {
        month: currentMonth,
        totalCost: monthlyTotal,
        totalTokens: monthlyTokens,
        bySource: bySource,
        byDay: byDay,
        planLimit: this.settings.planLimit,
        percentageUsed: (monthlyTotal / this.settings.planLimit) * 100,
        remainingBudget: this.settings.planLimit - monthlyTotal,
        lastUpdated: new Date().toISOString()
      };

      await fs.writeFile(
        this.monthlySummaryFile,
        JSON.stringify(summary, null, 2),
        'utf8'
      );

      // Verificar alertas
      this.checkAlerts(summary);

      return summary;
    } catch (error) {
      console.error('[TOKEN-MONITOR] Failed to update monthly summary:', error);
      return null;
    }
  }

  calculateCost(tokens) {
    // Estimación conservadora basada en GPT-4o
    // Entrada: $5/million, Salida: $15/million
    // Promedio: ~70% entrada, 30% salida
    const inputCost = (tokens * 0.7) / 1_000_000 * 5;
    const outputCost = (tokens * 0.3) / 1_000_000 * 15;
    return inputCost + outputCost;
  }

  checkAlerts(summary) {
    const percentage = summary.percentageUsed / 100;
    
    if (percentage >= this.settings.alertThreshold) {
      console.warn(`⚠️ [TOKEN-ALERT] Usage at ${summary.percentageUsed.toFixed(2)}% of plan limit!`);
      console.warn(`   Current: $${summary.totalCost.toFixed(2)} / Limit: $${this.settings.planLimit}`);
      console.warn(`   Remaining: $${summary.remainingBudget.toFixed(2)}`);
    } else if (percentage >= this.settings.warningThreshold) {
      console.warn(`⚠️ [TOKEN-WARNING] Usage at ${summary.percentageUsed.toFixed(2)}% of plan limit`);
      console.warn(`   Current: $${summary.totalCost.toFixed(2)} / Limit: $${this.settings.planLimit}`);
    }
  }

  async getDailyStats(date = null) {
    const targetDate = date || this.currentDate;
    const dailyLog = await this.loadDailyLog();
    
    if (!dailyLog[targetDate]) {
      return {
        date: targetDate,
        totalCost: 0,
        totalTokens: 0,
        entries: 0,
        bySource: {}
      };
    }

    const entries = dailyLog[targetDate];
    let totalCost = 0;
    let totalTokens = 0;
    const bySource = {};

    entries.forEach(entry => {
      totalCost += entry.cost || 0;
      totalTokens += entry.tokens || 0;
      bySource[entry.source] = (bySource[entry.source] || 0) + (entry.cost || 0);
    });

    return {
      date: targetDate,
      totalCost,
      totalTokens,
      entries: entries.length,
      bySource
    };
  }

  async getMonthlyStats() {
    const summary = await this.updateMonthlySummary();
    return summary;
  }

  async getProjection() {
    const summary = await this.getMonthlyStats();
    const today = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - today;
    
    const averageDaily = summary.totalCost / today;
    const projectedMonthly = summary.totalCost + (averageDaily * daysRemaining);
    
    return {
      current: summary.totalCost,
      projected: projectedMonthly,
      averageDaily: averageDaily,
      daysRemaining: daysRemaining,
      willExceed: projectedMonthly > this.settings.planLimit,
      recommendedPlan: this.getRecommendedPlan(projectedMonthly)
    };
  }

  getRecommendedPlan(projectedCost) {
    if (projectedCost <= 20) return 'PRO ($20/mes)';
    if (projectedCost <= 60) return 'PRO Plus ($60/mes)';
    if (projectedCost <= 200) return 'Ultra ($200/mes)';
    return 'Enterprise (custom)';
  }

  async generateReport() {
    const dailyStats = await this.getDailyStats();
    const monthlyStats = await this.getMonthlyStats();
    const projection = await this.getProjection();

    return {
      daily: dailyStats,
      monthly: monthlyStats,
      projection: projection,
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton
let tokenMonitorInstance = null;

function getTokenMonitor(baseDir = null) {
  if (!tokenMonitorInstance) {
    tokenMonitorInstance = new TokenMonitor(baseDir);
  }
  return tokenMonitorInstance;
}

module.exports = {
  TokenMonitor,
  getTokenMonitor
};

