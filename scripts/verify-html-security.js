/**
 * Script para verificar seguridad de archivos HTML
 * Busca API keys expuestas en archivos HTML
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO ARCHIVOS HTML EXTERNOS...\n');

// Patrones de API keys
const keyPatterns = [
  /sk-[a-zA-Z0-9]{32,}/g,  // OpenAI
  /sk_live_[a-zA-Z0-9]{32,}/g,  // Stripe
  /OPENAI_API_KEY\s*=\s*['"]([^'"]+)['"]/gi,
  /CARTESIA_API_KEY\s*=\s*['"]([^'"]+)['"]/gi,
  /DEEPGRAM_API_KEY\s*=\s*['"]([^'"]+)['"]/gi,
  /HEYGEN_API_KEY\s*=\s*['"]([^'"]+)['"]/gi,
];

// Directorios a excluir
const excludeDirs = ['node_modules', '.git', 'coverage', 'dist', 'build'];

/**
 * Buscar keys en archivo HTML
 */
function checkHtmlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    const issues = [];
    
    keyPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        // Filtrar falsos positivos
        const realKeys = matches.filter(match => {
          if (match.length < 32) return false;
          if (match.includes('example')) return false;
          if (match.includes('your-')) return false;
          if (match.includes('sk-your-')) return false;
          if (match.toLowerCase().includes('placeholder')) return false;
          return true;
        });
        
        if (realKeys.length > 0) {
          issues.push({
            file: relativePath,
            matches: realKeys,
            count: realKeys.length
          });
        }
      }
    });
    
    return issues;
  } catch (error) {
    return [];
  }
}

/**
 * Buscar archivos HTML en directorio
 */
function findHtmlFiles(dir, found = []) {
  if (!fs.existsSync(dir)) return found;
  
  try {
    const entries = fs.readDirSync(dir);
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry);
      
      // Excluir directorios
      if (excludeDirs.some(exclude => fullPath.includes(exclude))) {
        return;
      }
      
      try {
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          findHtmlFiles(fullPath, found);
        } else if (stat.isFile() && entry.endsWith('.html')) {
          found.push(fullPath);
        }
      } catch (e) {
        // Ignorar errores de acceso
      }
    });
  } catch (error) {
    // Ignorar errores
  }
  
  return found;
}

// Buscar archivos HTML
const rootDir = path.dirname(process.cwd());
const htmlFiles = findHtmlFiles(rootDir).filter(f => 
  !f.includes('node_modules') && 
  !f.includes('coverage') &&
  !f.includes('LICENSES.chromium.html') // Excluir licencias
);

console.log(`📋 Archivos HTML encontrados: ${htmlFiles.length}\n`);

// Verificar cada archivo
let totalIssues = 0;
htmlFiles.forEach(file => {
  const issues = checkHtmlFile(file);
  if (issues.length > 0) {
    totalIssues += issues.length;
    console.error(`❌ PROBLEMAS ENCONTRADOS EN: ${file}`);
    issues.forEach(issue => {
      console.error(`   - ${issue.count} posible(s) API key(s) encontrada(s)`);
      if (issue.matches.length > 0) {
        console.error(`   - Primer match: ${issue.matches[0].substring(0, 20)}...`);
      }
    });
    console.error('');
  }
});

// Resultados
console.log('\n📊 RESULTADOS:');
console.log(`   Archivos verificados: ${htmlFiles.length}`);
console.log(`   Archivos con problemas: ${totalIssues}\n`);

if (totalIssues === 0) {
  console.log('✅ No se encontraron API keys expuestas en archivos HTML\n');
  console.log('✅ Archivos HTML verificados:\n');
  htmlFiles.forEach(f => {
    const relPath = path.relative(rootDir, f);
    console.log(`   ✓ ${relPath}`);
  });
  process.exit(0);
} else {
  console.error('🚨 ACCIÓN REQUERIDA:');
  console.error('   1. Eliminar o editar los archivos HTML con keys expuestas');
  console.error('   2. Mover las keys a variables de entorno');
  console.error('   3. Revocar las keys expuestas en los dashboards\n');
  process.exit(1);
}

