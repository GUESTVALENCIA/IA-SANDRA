#!/usr/bin/env node
'use strict';

/**
 * Sincronización automática entre worktree y directorio de ejecución
 * 
 * Uso:
 *   node tools/sync-worktree.js
 * 
 * Sincroniza cambios del worktree → directorio de ejecución en tiempo real
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Configuración
const CONFIG = {
  // Directorio worktree (donde trabajas en Cursor)
  worktree: 'C:\\Users\\clayt\\.cursor\\worktrees\\Sandra-IA-8.0-Pro\\uTqbj',
  
  // Directorio de ejecución (donde se ejecuta la app)
  execution: 'C:\\Sandra-IA-8.0-Pro',
  
  // Archivos/carpetas a sincronizar
  syncPaths: [
    'desktop-app',
    'services',
    'experimental',
    'sandra-mcp-bridge.js',
    'config',
    'callcenter'
  ],
  
  // Archivos/carpetas a ignorar
  ignore: [
    'node_modules',
    '.git',
    '.voice-cache',
    'temp-lipsync',
    'src',
    'tools',
    '.env.pro',
    '*.log'
  ],
  
  // Intervalo de sincronización (ms) - 0 = inmediato
  debounceMs: 500
};

// Colores para logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function copyFile(src, dest) {
  try {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    return true;
  } catch (err) {
    log(`Error copiando ${src}: ${err.message}`, 'red');
    return false;
  }
}

function copyDirectory(src, dest) {
  try {
    if (!fs.existsSync(src)) return false;
    
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      // Ignorar según configuración
      if (CONFIG.ignore.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(entry.name);
        }
        return entry.name === pattern || srcPath.includes(pattern);
      })) {
        continue;
      }
      
      if (entry.isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        copyFile(srcPath, destPath);
      }
    }
    return true;
  } catch (err) {
    log(`Error copiando directorio ${src}: ${err.message}`, 'red');
    return false;
  }
}

function syncPath(relativePath) {
  const src = path.join(CONFIG.worktree, relativePath);
  const dest = path.join(CONFIG.execution, relativePath);
  
  if (!fs.existsSync(src)) {
    log(`⚠️  Origen no existe: ${relativePath}`, 'yellow');
    return false;
  }
  
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    log(`📁 Sincronizando directorio: ${relativePath}`, 'cyan');
    return copyDirectory(src, dest);
  } else {
    log(`📄 Sincronizando archivo: ${relativePath}`, 'cyan');
    return copyFile(src, dest);
  }
}

// Cola de sincronización con debounce
const syncQueue = new Map();
let syncTimeout = null;

function queueSync(relativePath) {
  syncQueue.set(relativePath, true);
  
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  
  syncTimeout = setTimeout(() => {
    const paths = Array.from(syncQueue.keys());
    syncQueue.clear();
    
    log(`🔄 Sincronizando ${paths.length} cambio(s)...`, 'blue');
    
    paths.forEach(p => {
      syncPath(p);
    });
    
    log(`✅ Sincronización completada`, 'green');
  }, CONFIG.debounceMs);
}

function getRelativePath(fullPath) {
  const normalized = path.normalize(fullPath);
  const worktreeNormalized = path.normalize(CONFIG.worktree);
  
  if (!normalized.startsWith(worktreeNormalized)) {
    return null;
  }
  
  return normalized.substring(worktreeNormalized.length + 1);
}

function shouldSync(filePath) {
  const relative = getRelativePath(filePath);
  if (!relative) return false;
  
  // Verificar si está en syncPaths
  const shouldSync = CONFIG.syncPaths.some(syncPath => {
    return relative.startsWith(syncPath) || relative === syncPath;
  });
  
  if (!shouldSync) return false;
  
  // Verificar que no esté en ignore
  const shouldIgnore = CONFIG.ignore.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(relative) || relative.includes(pattern);
    }
    return relative.includes(pattern);
  });
  
  return !shouldIgnore;
}

// Sincronización inicial
function initialSync() {
  log('🚀 Iniciando sincronización inicial...', 'blue');
  
  CONFIG.syncPaths.forEach(path => {
    syncPath(path);
  });
  
  log('✅ Sincronización inicial completada', 'green');
}

// Iniciar watcher
function startWatcher() {
  log(`👀 Observando cambios en: ${CONFIG.worktree}`, 'blue');
  log(`📦 Sincronizando a: ${CONFIG.execution}`, 'blue');
  log(`📋 Rutas a sincronizar: ${CONFIG.syncPaths.join(', ')}`, 'blue');
  
  const watcher = chokidar.watch(CONFIG.worktree, {
    ignored: (filePath) => {
      const relative = getRelativePath(filePath);
      if (!relative) return true;
      
      return CONFIG.ignore.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(relative) || filePath.includes(pattern);
        }
        return relative.includes(pattern) || filePath.includes(pattern);
      });
    },
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    }
  });
  
  watcher
    .on('add', filePath => {
      if (shouldSync(filePath)) {
        const relative = getRelativePath(filePath);
        log(`➕ Archivo añadido: ${relative}`, 'yellow');
        queueSync(relative);
      }
    })
    .on('change', filePath => {
      if (shouldSync(filePath)) {
        const relative = getRelativePath(filePath);
        log(`✏️  Archivo modificado: ${relative}`, 'yellow');
        queueSync(relative);
      }
    })
    .on('unlink', filePath => {
      if (shouldSync(filePath)) {
        const relative = getRelativePath(filePath);
        log(`🗑️  Archivo eliminado: ${relative}`, 'yellow');
        // No sincronizamos eliminaciones automáticamente por seguridad
      }
    })
    .on('error', error => {
      log(`❌ Error del watcher: ${error.message}`, 'red');
    })
    .on('ready', () => {
      log('✅ Watcher listo, observando cambios...', 'green');
    });
  
  return watcher;
}

// Manejo de señales
process.on('SIGINT', () => {
  log('\n🛑 Deteniendo sincronización...', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n🛑 Deteniendo sincronización...', 'yellow');
  process.exit(0);
});

// Verificar que chokidar esté instalado
try {
  require.resolve('chokidar');
} catch (e) {
  log('❌ chokidar no está instalado. Instalando...', 'red');
  const { execSync } = require('child_process');
  try {
    execSync('npm install chokidar --save-dev', { stdio: 'inherit', cwd: CONFIG.execution });
    log('✅ chokidar instalado', 'green');
  } catch (err) {
    log('❌ Error instalando chokidar. Ejecuta: npm install chokidar --save-dev', 'red');
    process.exit(1);
  }
}

// Iniciar
log('═══════════════════════════════════════════════════════', 'cyan');
log('🔄 Sincronizador Worktree → Ejecución', 'cyan');
log('═══════════════════════════════════════════════════════', 'cyan');

initialSync();
const watcher = startWatcher();

log('', 'reset');
log('💡 Presiona Ctrl+C para detener', 'yellow');
log('', 'reset');

