/**
 * Security Check Script
 * Verifica que no haya API keys expuestas en el código
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 SECURITY CHECK - Verificando API keys expuestas...\n');

const issues = [];
const checkedFiles = [];

// Patrones de API keys
const keyPatterns = [
  /sk-[a-zA-Z0-9]{32,}/g,  // OpenAI
  /sk_live_[a-zA-Z0-9]{32,}/g,  // Stripe
  /AIza[0-9A-Za-z\\-_]{35}/g,  // Google
  /[0-9a-f]{32}/g,  // Generic keys (mas general, puede dar falsos positivos)
];

// Extensiones a verificar
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.json', '.md'];

// Directorios a excluir
const excludeDirs = [
  'node_modules',
  '.git',
  'coverage',
  'dist',
  'build',
  '.next'
];

/**
 * Verificar si un archivo debe ser excluido
 */
function shouldExclude(filePath) {
  return excludeDirs.some(dir => filePath.includes(dir));
}

/**
 * Buscar keys en un archivo
 */
function checkFile(filePath) {
  if (shouldExclude(filePath)) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    keyPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        // Filtrar falsos positivos comunes
        const filteredMatches = matches.filter(match => {
          // Excluir hashes de ejemplo, UUIDs comunes, etc.
          if (match.length < 40) return false;
          if (match.includes('example')) return false;
          if (match.includes('your-')) return false;
          if (match.includes('sk-your-')) return false;
          return true;
        });
        
        if (filteredMatches.length > 0) {
          issues.push({
            file: relativePath,
            matches: filteredMatches,
            line: content.substring(0, content.indexOf(filteredMatches[0])).split('\n').length
          });
        }
      }
    });
    
    checkedFiles.push(relativePath);
  } catch (error) {
    // Ignorar errores de lectura (permisos, etc.)
  }
}

/**
 * Recorrer directorio recursivamente
 */
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !shouldExclude(filePath)) {
      walkDir(filePath);
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        checkFile(filePath);
      }
    }
  });
}

// Verificar archivos .env en git
console.log('📋 Verificando archivos .env en git...\n');
try {
  const gitFiles = execSync('git ls-files', { encoding: 'utf8', cwd: process.cwd() });
  const envFiles = gitFiles.split('\n').filter(f => f.includes('.env') && !f.includes('.example'));
  
  if (envFiles.length > 0) {
    console.error('❌ ARCHIVOS .env EN GIT DETECTADOS:');
    envFiles.forEach(f => console.error(`   - ${f}`));
    console.error('\n⚠️  ACCIÓN REQUERIDA: git rm --cached ' + envFiles.join(' '));
    issues.push({
      type: 'env_in_git',
      files: envFiles
    });
  } else {
    console.log('✅ No hay archivos .env en git\n');
  }
} catch (error) {
  console.warn('⚠️  No se pudo verificar git (puede no ser un repo git)');
}

// Verificar .gitignore
console.log('📋 Verificando .gitignore...\n');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (!gitignore.includes('.env') || !gitignore.includes('.env.production')) {
    console.warn('⚠️  .gitignore puede estar incompleto');
    issues.push({
      type: 'gitignore_incomplete',
      message: '.gitignore debe incluir .env y .env.production'
    });
  } else {
    console.log('✅ .gitignore está configurado correctamente\n');
  }
} else {
  console.error('❌ .gitignore no existe\n');
  issues.push({
    type: 'no_gitignore',
    message: '.gitignore debe crearse'
  });
}

// Buscar keys en código
console.log('🔍 Buscando API keys en código fuente...\n');
walkDir(process.cwd());

// Resultados
console.log(`\n📊 RESULTADOS:`);
console.log(`   Archivos verificados: ${checkedFiles.length}`);
console.log(`   Problemas encontrados: ${issues.length}\n`);

if (issues.length > 0) {
  console.error('❌ PROBLEMAS DE SEGURIDAD ENCONTRADOS:\n');
  
  issues.forEach((issue, index) => {
    if (issue.file) {
      console.error(`${index + 1}. Archivo: ${issue.file}`);
      console.error(`   Posibles API keys encontradas: ${issue.matches.length}`);
      console.error(`   Línea aproximada: ${issue.line || 'N/A'}`);
      if (issue.matches.length > 0) {
        console.error(`   Primer match: ${issue.matches[0].substring(0, 20)}...`);
      }
      console.error('');
    } else if (issue.type === 'env_in_git') {
      console.error(`${index + 1}. ARCHIVOS .env EN GIT`);
      issue.files.forEach(f => console.error(`   - ${f}`));
      console.error('');
    }
  });
  
  console.error('🚨 ACCIÓN REQUERIDA:');
  console.error('   1. Revocar las API keys expuestas');
  console.error('   2. Eliminar keys del código');
  console.error('   3. Usar variables de entorno');
  console.error('   4. Verificar .gitignore');
  console.error('\n');
  
  process.exit(1);
} else {
  console.log('✅ No se encontraron API keys expuestas en el código\n');
  console.log('✅ Verificación de seguridad completada\n');
  process.exit(0);
}

