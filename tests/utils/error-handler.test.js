/**
 * Tests para Error Handler
 */

const { errorHandler } = require('../../orchestrator/utils/error-handler');

describe('ErrorHandler', () => {
  test('should handle errors and return structured response', () => {
    const error = new Error('Test error');
    const result = errorHandler.handle(error);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error.message).toBeDefined();
    expect(result.error.id).toBeDefined();
  });

  test('should categorize network errors', () => {
    const error = new Error('ENOTFOUND');
    error.code = 'ENOTFOUND';
    const result = errorHandler.handle(error);
    
    expect(result.error.category).toBe('NETWORK_ERROR');
  });

  test('should categorize authentication errors', () => {
    const error = new Error('API Key invalid');
    const result = errorHandler.handle(error);
    
    expect(result.error.category).toBe('AUTHENTICATION_ERROR');
  });

  test('should generate unique error IDs', () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');
    
    const result1 = errorHandler.handle(error1);
    const result2 = errorHandler.handle(error2);
    
    expect(result1.error.id).not.toBe(result2.error.id);
  });

  test('should track error counts', () => {
    const error = new Error('Repeated error');
    
    errorHandler.handle(error);
    errorHandler.handle(error);
    
    const stats = errorHandler.getErrorStats();
    expect(stats.errorCounts['Error']).toBeGreaterThanOrEqual(2);
  });
});

