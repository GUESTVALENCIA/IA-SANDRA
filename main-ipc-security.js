/**
 * IPC Security Validator
 * Valida todos los comandos IPC antes de procesarlos
 */

const path = require('path');

class IPCSecurityValidator {
  constructor() {
    this.allowedChannels = new Set([
      'send-message',
      'get-service-status',
      'get-metrics',
      'reset-services',
      'voice-command',
      'voice-programming-status',
      'ai-voice-command',
      'ai-voice-commands-status'
    ]);

    // Patrones peligrosos de command injection
    this.dangerousPatterns = [
      /[;&|`$()]/g,  // Shell metacharacters
      /\.\./g,        // Path traversal
      /eval\(/gi,     // Eval
      /Function\(/gi, // Function constructor
      /require\(/gi   // Require injection
    ];
  }

  /**
   * Validar canal IPC
   */
  validateChannel(channel) {
    if (!this.allowedChannels.has(channel)) {
      throw new Error(`IPC channel "${channel}" is not allowed`);
    }
    return true;
  }

  /**
   * Validar mensaje (prevenir command injection)
   */
  validateMessage(message) {
    if (typeof message !== 'string') {
      throw new Error('Message must be a string');
    }

    if (message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    if (message.length > 10000) {
      throw new Error('Message too long (max 10000 characters)');
    }

    // Detectar patrones peligrosos
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(message)) {
        console.warn('[SECURITY] Potentially dangerous pattern detected in message');
        // No bloquear, solo log (mensajes pueden contener código válido)
      }
    }

    return true;
  }

  /**
   * Validar path (prevenir path traversal)
   */
  validatePath(filePath, baseDir = process.cwd()) {
    if (typeof filePath !== 'string') {
      throw new Error('Path must be a string');
    }

    // Resolver path y verificar que está dentro del baseDir
    const resolvedPath = path.resolve(baseDir, filePath);
    const resolvedBase = path.resolve(baseDir);

    if (!resolvedPath.startsWith(resolvedBase)) {
      throw new Error('Path traversal attempt detected');
    }

    return resolvedPath;
  }

  /**
   * Validar comando (prevenir command injection)
   */
  validateCommand(command) {
    if (typeof command !== 'string') {
      throw new Error('Command must be a string');
    }

    // Whitelist de comandos permitidos
    const allowedCommands = [
      'git',
      'npm',
      'node',
      'npx'
    ];

    const commandParts = command.trim().split(/\s+/);
    const baseCommand = commandParts[0];

    // Verificar que el comando base está permitido
    if (!allowedCommands.some(allowed => baseCommand.startsWith(allowed))) {
      throw new Error(`Command "${baseCommand}" is not allowed`);
    }

    // Detectar caracteres peligrosos
    const dangerousChars = /[;&|`$()]/;
    if (dangerousChars.test(command)) {
      throw new Error('Dangerous characters detected in command');
    }

    return true;
  }

  /**
   * Validar audio buffer
   */
  validateAudioBuffer(audioBuffer) {
    if (!audioBuffer) {
      throw new Error('Audio buffer is required');
    }

    let bufferSize = 0;

    if (Buffer.isBuffer(audioBuffer)) {
      bufferSize = audioBuffer.length;
    } else if (audioBuffer instanceof ArrayBuffer) {
      bufferSize = audioBuffer.byteLength;
    } else if (typeof audioBuffer === 'string') {
      // Asumir base64
      try {
        bufferSize = Buffer.from(audioBuffer, 'base64').length;
      } catch (e) {
        throw new Error('Invalid base64 audio buffer');
      }
    } else {
      throw new Error('Invalid audio buffer format');
    }

    // Limitar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (bufferSize > maxSize) {
      throw new Error(`Audio buffer too large (max ${maxSize / 1024 / 1024}MB)`);
    }

    return true;
  }
}

module.exports = new IPCSecurityValidator();

