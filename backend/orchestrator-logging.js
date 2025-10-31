// backend/orchestrator-logging.js
const logger = require('./logger');

function withLogging(name, fn) {
  return async function(...args) {
    const start = Date.now();
    try {
      logger.debug({ name, argsPreview: JSON.stringify(args).slice(0, 300) }, '↪︎ enter');
      const res = await fn.apply(this, args);
      const ms = Date.now() - start;
      logger.info({ name, ms }, '✓ ok');
      return res;
    } catch (err) {
      const ms = Date.now() - start;
      logger.error({ name, ms, err: err?.message, stack: err?.stack }, '✗ fail');
      throw err;
    }
  };
}

module.exports = { withLogging };
