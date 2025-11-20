/**
 * Jest Setup File
 * Configuración global de mocks para todos los tests
 */

// Auto-mock de servicios externos (solo si existen)
try {
  require.resolve('../services/bright-data-service');
  jest.mock('../services/bright-data-service');
} catch (e) {
  // Servicio no existe, ignorar
}

try {
  require.resolve('../services/negotiation-service');
  jest.mock('../services/negotiation-service');
} catch (e) {
  // Servicio no existe, ignorar
}

// Configurar variables de entorno por defecto para tests
if (!process.env.BRIGHT_DATA_AUTH) {
  process.env.BRIGHT_DATA_AUTH = 'mock';
}

if (!process.env.NEON_DATABASE_URL) {
  process.env.NEON_DATABASE_URL = 'postgres://mock:mock@mock:5432/mock';
}

// Suprimir logs en tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

