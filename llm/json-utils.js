const logger = require('../backend/logger');

/**
 * Safe JSON parsing with try/catch
 * @param {string} jsonString - String to parse as JSON
 * @returns {Object|null} - Parsed JSON object or null if parsing fails
 */
function parseJsonSafe(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

/**
 * Attempt to repair common JSON formatting errors
 * @param {string} jsonString - Potentially malformed JSON string
 * @returns {string} - Repaired JSON string
 */
function repairJsonString(jsonString) {
  let repaired = jsonString;

  // Trim whitespace
  repaired = repaired.trim();

  // Extract JSON block (remove text outside first { ... last } or [ ... ])
  const objectMatch = repaired.match(/\{.*\}/s);
  const arrayMatch = repaired.match(/\[.*\]/s);

  if (objectMatch) {
    repaired = objectMatch[0];
  } else if (arrayMatch) {
    repaired = arrayMatch[0];
  }

  // Remove trailing commas before closing braces/brackets
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

  // Balance brackets - add missing closing braces/brackets
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;

  // Add missing closing braces
  for (let i = 0; i < openBraces - closeBraces; i++) {
    repaired += '}';
  }

  // Add missing closing brackets
  for (let i = 0; i < openBrackets - closeBrackets; i++) {
    repaired += ']';
  }

  // Fix single quotes to double quotes for keys and string values
  repaired = repaired.replace(/'([^']*)':/g, '"$1":');
  repaired = repaired.replace(/:(\s*)'([^']*)'/g, ': "$2"');

  // Fix unquoted keys
  repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

  if (repaired !== jsonString) {
    logger.warn({ original: jsonString.substring(0, 100), repaired: repaired.substring(0, 100) }, 'JSON auto-repaired');
  }

  return repaired;
}

module.exports = {
  parseJsonSafe,
  repairJsonString
};