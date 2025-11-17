// core/roles-system.js
// Minimal roles system snippet that removes create_pr from developer tools per policy.
module.exports = {
  roles: [
    {
      id: 'developer',
      name: 'Sandra · Desarrolladora General, Operadora de Crisis y Guardiana del Código',
      tools: [
        // keep git_commit, but remove create_pr for this role
        { name: 'git_commit', type: 'git', operation: 'commit' },
        // other safe tools can be listed here
      ],
      policy: {
        mode: 'EXECUTE_ONLY',
      }
    }
  ]
};


