// core/roles-system.js
// Minimal roles system snippet that removes create_pr from developer tools per policy.
module.exports = {
  roles: [
    {
      id: 'developer',
      name: 'Sandra · Desarrolladora General, Operadora de Crisis y Guardiana del Código',
      systemPromptFile: 'core/prompts/role-developer-sandra.md',
      model: 'gpt-4o-mini',
      tools: [
        { name: 'execute_code', type: 'internal', operation: 'exec' },
        { name: 'filesystem', type: 'internal', operation: 'fs' },
        { name: 'git', type: 'git', operation: 'git' },
        { name: 'http', type: 'internal', operation: 'http' }
      ],
      policy: {
        mode: 'EXECUTE_ONLY',
      }
    }
  ]
};


