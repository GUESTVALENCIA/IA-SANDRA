/**
 * Tests para Error Handler
 */

const { ErrorHandler } = require('../orchestrator/error-handler');

describe('Error Handler', () => {
  let errorHandler;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    errorHandler = new ErrorHandler();
  });

  test('should create error handler instance', () => {
    expect(errorHandler).toBeDefined();
  });

  test('should format error', () => {
    const error = new Error('Test error');
    const formatted = errorHandler.formatError(error);
    
    expect(formatted).toHaveProperty('error', true);
    expect(formatted).toHaveProperty('message');
    expect(formatted).toHaveProperty('timestamp');
  });

  test('should create validation error', () => {
    const error = errorHandler.validationError('field', 'Invalid value');
    
    expect(error.message).toContain('Validation error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.field).toBe('field');
  });

  test('should create authentication error', () => {
    const error = errorHandler.authenticationError();
    
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('AUTHENTICATION_ERROR');
  });

  test('should create not found error', () => {
    const error = errorHandler.notFoundError('User');
    
    expect(error.message).toContain('not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  test('should create external service error', () => {
    const error = errorHandler.externalServiceError('OpenAI', 'Connection failed');
    
    expect(error.message).toContain('External service error');
    expect(error.statusCode).toBe(502);
    expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
    expect(error.service).toBe('OpenAI');
  });

  test('asyncHandler should catch async errors', async () => {
    const asyncFn = async () => {
      throw new Error('Async error');
    };
    
    const handler = errorHandler.asyncHandler(asyncFn);
    const req = {};
    const res = {};
    const next = jest.fn();
    
    await handler(req, res, next);
    
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

