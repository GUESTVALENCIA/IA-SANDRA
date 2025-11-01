/**
 * Script URGENTE: Corregir URLs del frontend para Vercel
 * Cambia todas las referencias de Netlify a Vercel
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '../frontend');

const replacements = [
  // Netlify Functions → Vercel API
  {
    pattern: /\/\.netlify\/functions\//g,
    replacement: '/api/'
  },
  {
    pattern: /\.netlify\/functions\//g,
    replacement: 'api/'
  },
  {
    pattern: /netlifyFunctionsPath\s*=\s*['"]\/\.netlify\/functions['"]/g,
    replacement: 'netlifyFunctionsPath = \'/api\''
  },
  {
    pattern: /apiEndpoint:\s*['"]\/\.netlify\/functions['"]/g,
    replacement: 'apiEndpoint: \'/api\''
  },
  // Comentarios
  {
    pattern: /\/\/.*Netlify Functions/gi,
    replacement: '// Vercel API'
  },
  {
    pattern: /\/\*\*.*Netlify Function/gi,
    replacement: '/** Vercel Serverless Function'
  },
  // Hostname checks
  {
    pattern: /hostname\.includes\(['"]netlify\.app['"]\)/g,
    replacement: 'hostname.includes(\'vercel.app\') || hostname.includes(\'guestsvalencia.es\')'
  },
  {
    pattern: /includes\(['"]netlify['"]\)/g,
    replacement: 'includes(\'vercel\') || includes(\'guestsvalencia\')'
  }
];

function processFile(filePath) {
  console.log(`📄 Procesando: ${path.relative(FRONTEND_DIR, filePath)}`);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  const originalContent = content;

  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Corregido: ${path.relative(FRONTEND_DIR, filePath)}`);
    return true;
  }
  
  return false;
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let totalFixed = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Procesar subdirectorios
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        totalFixed += processDirectory(fullPath);
      }
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.html') || entry.name.endsWith('.json')) {
      // Procesar archivos JS, HTML, JSON
      if (processFile(fullPath)) {
        totalFixed++;
      }
    }
  }

  return totalFixed;
}

function main() {
  console.log('🚨 CORRIGIENDO FRONTEND PARA VERCEL...\n');

  const fixed = processDirectory(FRONTEND_DIR);

  console.log(`\n✅ CORRECCIÓN COMPLETA!`);
  console.log(`📊 Archivos corregidos: ${fixed}\n`);
}

if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory };

