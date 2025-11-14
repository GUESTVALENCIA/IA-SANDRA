const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Voice Cache Service
 * Cachea respuestas de voz para evitar regeneración
 */

class VoiceCacheService {
  constructor() {
    this.cacheDir = path.join(__dirname, '..', '.voice-cache');
    this.maxCacheSize = 100 * 1024 * 1024; // 100MB
    this.maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 días
    this.cacheIndex = new Map();
    
    this.initializeCache();
    console.log('✅ Voice Cache Service inicializado');
  }

  /**
   * Inicializar directorio de caché
   */
  initializeCache() {
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }

      // Cargar índice de caché
      this.loadCacheIndex();

      // Limpiar caché antiguo
      this.cleanOldCache();
    } catch (error) {
      console.error('Error inicializando caché:', error);
    }
  }

  /**
   * Generar hash de texto
   */
  generateHash(text, voiceId = 'default') {
    const content = `${text}_${voiceId}`;
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Guardar audio en caché
   */
  async saveToCache(text, audioBuffer, voiceId = 'default', metadata = {}) {
    try {
      const hash = this.generateHash(text, voiceId);
      const filename = `${hash}.wav`;
      const filepath = path.join(this.cacheDir, filename);

      // Guardar archivo de audio
      fs.writeFileSync(filepath, audioBuffer);

      // Actualizar índice
      this.cacheIndex.set(hash, {
        text,
        voiceId,
        filename,
        filepath,
        size: audioBuffer.length,
        createdAt: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now(),
        metadata
      });

      // Guardar índice
      this.saveCacheIndex();

      // Verificar tamaño de caché
      await this.checkCacheSize();

      return {
        success: true,
        hash,
        filepath
      };
    } catch (error) {
      console.error('Error guardando en caché:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener audio de caché
   */
  async getFromCache(text, voiceId = 'default') {
    try {
      const hash = this.generateHash(text, voiceId);
      const cacheEntry = this.cacheIndex.get(hash);

      if (!cacheEntry) {
        return {
          success: false,
          cached: false,
          message: 'No encontrado en caché'
        };
      }

      // Verificar que el archivo existe
      if (!fs.existsSync(cacheEntry.filepath)) {
        this.cacheIndex.delete(hash);
        this.saveCacheIndex();
        return {
          success: false,
          cached: false,
          message: 'Archivo de caché no encontrado'
        };
      }

      // Leer archivo
      const audioBuffer = fs.readFileSync(cacheEntry.filepath);

      // Actualizar estadísticas
      cacheEntry.accessCount++;
      cacheEntry.lastAccessed = Date.now();
      this.saveCacheIndex();

      return {
        success: true,
        cached: true,
        audioBuffer,
        metadata: cacheEntry.metadata
      };
    } catch (error) {
      console.error('Error obteniendo de caché:', error);
      return {
        success: false,
        cached: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar si existe en caché
   */
  existsInCache(text, voiceId = 'default') {
    const hash = this.generateHash(text, voiceId);
    return this.cacheIndex.has(hash);
  }

  /**
   * Limpiar caché antiguo
   */
  cleanOldCache() {
    try {
      const now = Date.now();
      let deletedCount = 0;

      for (const [hash, entry] of this.cacheIndex.entries()) {
        const age = now - entry.createdAt;

        if (age > this.maxCacheAge) {
          // Eliminar archivo
          if (fs.existsSync(entry.filepath)) {
            fs.unlinkSync(entry.filepath);
          }

          // Eliminar del índice
          this.cacheIndex.delete(hash);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`🧹 Limpiados ${deletedCount} archivos antiguos de caché`);
        this.saveCacheIndex();
      }
    } catch (error) {
      console.error('Error limpiando caché:', error);
    }
  }

  /**
   * Verificar tamaño de caché
   */
  async checkCacheSize() {
    try {
      let totalSize = 0;

      for (const entry of this.cacheIndex.values()) {
        totalSize += entry.size;
      }

      // Si excede el límite, eliminar los menos usados
      if (totalSize > this.maxCacheSize) {
        await this.evictLeastUsed(totalSize - this.maxCacheSize);
      }
    } catch (error) {
      console.error('Error verificando tamaño de caché:', error);
    }
  }

  /**
   * Eliminar entradas menos usadas
   */
  async evictLeastUsed(bytesToFree) {
    try {
      // Ordenar por accessCount y lastAccessed
      const entries = Array.from(this.cacheIndex.entries())
        .sort((a, b) => {
          if (a[1].accessCount !== b[1].accessCount) {
            return a[1].accessCount - b[1].accessCount;
          }
          return a[1].lastAccessed - b[1].lastAccessed;
        });

      let freedBytes = 0;

      for (const [hash, entry] of entries) {
        if (freedBytes >= bytesToFree) break;

        // Eliminar archivo
        if (fs.existsSync(entry.filepath)) {
          fs.unlinkSync(entry.filepath);
          freedBytes += entry.size;
        }

        // Eliminar del índice
        this.cacheIndex.delete(hash);
      }

      console.log(`🧹 Liberados ${Math.round(freedBytes / 1024)}KB de caché`);
      this.saveCacheIndex();
    } catch (error) {
      console.error('Error eliminando caché:', error);
    }
  }

  /**
   * Cargar índice de caché
   */
  loadCacheIndex() {
    try {
      const indexPath = path.join(this.cacheDir, 'cache-index.json');

      if (fs.existsSync(indexPath)) {
        const data = fs.readFileSync(indexPath, 'utf8');
        const index = JSON.parse(data);

        this.cacheIndex = new Map(Object.entries(index));
        console.log(`📦 Cargadas ${this.cacheIndex.size} entradas de caché`);
      }
    } catch (error) {
      console.error('Error cargando índice de caché:', error);
      this.cacheIndex = new Map();
    }
  }

  /**
   * Guardar índice de caché
   */
  saveCacheIndex() {
    try {
      const indexPath = path.join(this.cacheDir, 'cache-index.json');
      const index = Object.fromEntries(this.cacheIndex);

      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    } catch (error) {
      console.error('Error guardando índice de caché:', error);
    }
  }

  /**
   * Limpiar todo el caché
   */
  clearCache() {
    try {
      for (const entry of this.cacheIndex.values()) {
        if (fs.existsSync(entry.filepath)) {
          fs.unlinkSync(entry.filepath);
        }
      }

      this.cacheIndex.clear();
      this.saveCacheIndex();

      console.log('🧹 Caché completamente limpiado');

      return {
        success: true,
        message: 'Caché limpiado'
      };
    } catch (error) {
      console.error('Error limpiando caché:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener estadísticas de caché
   */
  getStats() {
    let totalSize = 0;
    let totalAccesses = 0;

    for (const entry of this.cacheIndex.values()) {
      totalSize += entry.size;
      totalAccesses += entry.accessCount;
    }

    return {
      entries: this.cacheIndex.size,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      totalAccesses,
      maxCacheSizeMB: (this.maxCacheSize / (1024 * 1024)).toFixed(2),
      usagePercent: ((totalSize / this.maxCacheSize) * 100).toFixed(2)
    };
  }
}

module.exports = VoiceCacheService;

