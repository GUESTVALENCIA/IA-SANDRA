/**
 * Tests para Logger
 */

const { Logger } = require('../orchestrator/logger');

describe('Logger', () => {
  let logger;

  beforeEach(() => {
    logger = new Logger({ level: 'debug' });
  });

  test('should create logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger.level).toBe('debug');
  });

  test('should log error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    logger.error('Test error');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should log info', () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    logger.info('Test info');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should respect log level', () => {
    const errorLogger = new Logger({ level: 'error' });
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    
    errorLogger.info('This should not log');
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('should format message with metadata', () => {
    const message = logger.formatMessage('info', 'Test', { key: 'value' });
    expect(message).toContain('Test');
    expect(message).toContain('value');
  });
});

