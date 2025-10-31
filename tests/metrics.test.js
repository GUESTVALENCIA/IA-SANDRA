/**
 * Tests para Metrics Collector
 */

const { MetricsCollector } = require('../orchestrator/metrics');

describe('Metrics Collector', () => {
  let metrics;

  beforeEach(() => {
    metrics = new MetricsCollector();
  });

  test('should create metrics instance', () => {
    expect(metrics).toBeDefined();
    expect(metrics.metrics).toBeDefined();
    expect(metrics.metrics.system).toBeDefined();
  });

  test('should record request', () => {
    const startTime = Date.now();
    const endTime = startTime + 100;
    
    metrics.recordRequest('test-service', startTime, endTime, true);
    
    expect(metrics.metrics.system.totalRequests).toBeGreaterThan(0);
    expect(metrics.metrics.services['test-service']).toBeDefined();
  });

  test('should record error', () => {
    const error = new Error('Test error');
    metrics.recordError('test-service', error);
    
    expect(metrics.metrics.errors.total).toBeGreaterThan(0);
    expect(metrics.metrics.errors.byService['test-service']).toBeDefined();
  });

  test('should record conversation', () => {
    metrics.recordConversation('textOnly', 5000, 10);
    
    expect(metrics.metrics.conversations.total).toBeGreaterThan(0);
    expect(metrics.metrics.conversations.multimodalUsage.textOnly).toBeGreaterThan(0);
  });

  test('should get metrics', () => {
    const metricsData = metrics.getMetrics();
    
    expect(metricsData).toBeDefined();
    expect(metricsData.system).toBeDefined();
    expect(metricsData.services).toBeDefined();
    expect(metricsData.timestamp).toBeDefined();
  });

  test('should format uptime', () => {
    const formatted = metrics.formatUptime(3661000); // 1h 1m 1s
    
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  test('should generate health report', () => {
    const report = metrics.generateHealthReport();
    
    expect(report).toBeDefined();
    expect(report.system).toBeDefined();
    expect(report.services).toBeDefined();
    expect(report.recommendations).toBeDefined();
  });
});

