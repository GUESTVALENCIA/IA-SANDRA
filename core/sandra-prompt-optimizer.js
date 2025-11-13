/**
 * Sandra Prompt Optimizer
 * Optimización de prompts por rol
 */

class SandraPromptOptimizer {
  constructor() {
    console.log('✅ Sandra Prompt Optimizer inicializado');
  }

  async optimizePromptForRole(rawPrompt, role, context = '') {
    const roleContexts = {
      youtuber: 'Responde como experto en contenido de YouTube y crecimiento de canales.',
      community: 'Responde como experto en gestión de comunidades y engagement.',
      sales: 'Responde como experto en negociación y ventas.',
      developer: 'Responde como experto en desarrollo de software.',
      default: 'Responde de forma útil y clara.'
    };

    const roleContext = roleContexts[role] || roleContexts.default;

    return {
      original: rawPrompt,
      optimized: `${roleContext} ${context ? 'Contexto: ' + context + '. ' : ''}Pregunta: ${rawPrompt}`,
      role,
      optimizationApplied: true
    };
  }
}

module.exports = SandraPromptOptimizer;
