/**
 * Log Ingestor to Neon PostgreSQL
 * Lee archivos JSONL de costes y los inserta en Neon cada minuto
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const glob = require('glob');

const DATABASE_URL = process.env.NEON_DATABASE_URL;
const LOGS_DIR = path.join(__dirname, '../../logs');
const OFFSET_FILE = path.join(LOGS_DIR, '.offset');

let pool = null;
let processedFiles = new Set();
let lastOffset = 0;

// Inicializar conexión a Neon
function initDatabase() {
  if (!DATABASE_URL) {
    console.warn('[log-ingestor] NEON_DATABASE_URL no configurada, modo mock');
    return null;
  }
  
  try {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Crear tabla si no existe
    pool.query(`
      CREATE TABLE IF NOT EXISTS cost_logs (
        id SERIAL PRIMARY KEY,
        ts TIMESTAMP NOT NULL,
        session_id VARCHAR(255),
        model VARCHAR(100),
        latency INTEGER,
        tokens_in INTEGER,
        tokens_out INTEGER,
        cost NUMERIC(10, 6),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(ts, session_id, model, latency, tokens_in, tokens_out)
      )
    `).then(() => {
      console.log('[log-ingestor] Tabla cost_logs verificada/creada');
    }).catch(err => {
      console.error('[log-ingestor] Error creando tabla:', err.message);
    });
    
    console.log('[log-ingestor] Conectado a Neon PostgreSQL');
    return pool;
  } catch (e) {
    console.error('[log-ingestor] Error inicializando DB:', e.message);
    return null;
  }
}

// Cargar offset procesado
function loadOffset() {
  try {
    if (fs.existsSync(OFFSET_FILE)) {
      const content = fs.readFileSync(OFFSET_FILE, 'utf8').trim();
      lastOffset = parseInt(content, 10) || 0;
      console.log(`[log-ingestor] Offset cargado: ${lastOffset}`);
    }
  } catch (e) {
    console.warn('[log-ingestor] No se pudo cargar offset:', e.message);
    lastOffset = 0;
  }
}

// Guardar offset procesado
function saveOffset(offset) {
  try {
    fs.writeFileSync(OFFSET_FILE, offset.toString(), 'utf8');
    lastOffset = offset;
  } catch (e) {
    console.error('[log-ingestor] Error guardando offset:', e.message);
  }
}

// Procesar archivo JSONL
async function processFile(filePath) {
  if (processedFiles.has(filePath)) {
    return; // Ya procesado en esta sesión
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n').filter(l => l.trim());
    
    if (lines.length === 0) {
      return;
    }
    
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < lines.length; i++) {
      try {
        const entry = JSON.parse(lines[i]);
        
        // Verificar que tenga los campos necesarios
        if (!entry.ts || !entry.model) {
          continue;
        }
        
        // Insertar en Neon
        if (pool) {
          try {
            const result = await pool.query(
              `INSERT INTO cost_logs (ts, session_id, model, latency, tokens_in, tokens_out, cost)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT DO NOTHING`,
              [
                new Date(entry.ts),
                entry.sessionId || null,
                entry.model,
                entry.latency_ms || null,
                entry.tokens_in || null,
                entry.tokens_out || null,
                entry.cost_usd || null
              ]
            );
            
            if (result.rowCount > 0) {
              inserted++;
            } else {
              skipped++;
            }
          } catch (dbErr) {
            console.error(`[log-ingestor] Error insertando línea ${i}:`, dbErr.message);
            skipped++;
          }
        } else {
          // Modo mock
          console.log(`[log-ingestor] Mock insert: ${entry.ts} - ${entry.model} - $${entry.cost_usd || 0}`);
          inserted++;
        }
      } catch (parseErr) {
        console.warn(`[log-ingestor] Error parseando línea ${i}:`, parseErr.message);
        continue;
      }
    }
    
    if (inserted > 0 || skipped > 0) {
      console.log(`[log-ingestor] ${filePath}: ${inserted} insertados, ${skipped} duplicados`);
    }
    
    processedFiles.add(filePath);
    
    // Actualizar offset (usar timestamp del archivo o número de línea)
    const stats = fs.statSync(filePath);
    const fileOffset = stats.mtime.getTime();
    if (fileOffset > lastOffset) {
      saveOffset(fileOffset);
    }
    
  } catch (e) {
    console.error(`[log-ingestor] Error procesando ${filePath}:`, e.message);
  }
}

// Procesar todos los archivos nuevos
async function processLogs() {
  try {
    const files = glob.sync(path.join(LOGS_DIR, 'costs-*.jsonl'));
    
    if (files.length === 0) {
      console.log('[log-ingestor] No hay archivos de logs para procesar');
      return;
    }
    
    // Ordenar por fecha de modificación
    const sortedFiles = files
      .map(f => ({ path: f, mtime: fs.statSync(f).mtime.getTime() }))
      .filter(f => f.mtime > lastOffset)
      .sort((a, b) => a.mtime - b.mtime);
    
    for (const file of sortedFiles) {
      await processFile(file.path);
    }
    
    console.log(`[log-ingestor] Procesamiento completado. ${sortedFiles.length} archivos nuevos`);
    
  } catch (e) {
    console.error('[log-ingestor] Error en processLogs:', e.message);
  }
}

// Inicializar
async function start() {
  console.log('[log-ingestor] Iniciando...');
  
  // Crear directorio de logs si no existe
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
  
  // Cargar offset
  loadOffset();
  
  // Inicializar base de datos
  initDatabase();
  
  // Procesar inmediatamente
  await processLogs();
  
  // Procesar cada minuto
  setInterval(async () => {
    await processLogs();
  }, 60000); // 60 segundos
  
  console.log('[log-ingestor] Ejecutándose. Procesando logs cada 60 segundos...');
}

// Manejar cierre limpio
process.on('SIGINT', async () => {
  console.log('[log-ingestor] Cerrando...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

// Iniciar
start().catch(console.error);

