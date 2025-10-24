/**
 * SANDRA NEON DATABASE INTEGRATION
 * Integración real con Neon PostgreSQL para almacenamiento de datos de Computer Vision
 *
 * Base de datos: PostgreSQL en Neon (Netlify Pro)
 * Funcionalidades:
 * - Almacenamiento de análisis de Computer Vision
 * - Historial de procesamiento de imágenes
 * - Métricas y estadísticas de uso
 * - Gestión de usuarios y sesiones
 *
 * @author: Sandra IA 7.0 Galaxy Level
 * @version: 1.0.0 Real Production
 */

const { neon } = require('@neondatabase/serverless');

class SandraNeonDatabase {
    constructor() {
        this.connectionString = process.env.NEON_DATABASE_URL ||
            'postgresql://username:password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require';
        this.sql = null;
        this.isConnected = false;

        this.init();
    }

    async init() {
        try {
            console.log('🐘 Inicializando conexión a Neon PostgreSQL...');

            // Crear conexión serverless a Neon
            this.sql = neon(this.connectionString);

            // Verificar conexión
            await this.testConnection();

            // Crear tablas si no existen
            await this.createTables();

            this.isConnected = true;
            console.log('✅ Conexión a Neon PostgreSQL establecida');

        } catch (error) {
            console.error('❌ Error conectando a Neon:', error);
            this.isConnected = false;
        }
    }

    async testConnection() {
        try {
            const result = await this.sql`SELECT version()`;
            console.log('🔗 Neon PostgreSQL conectado:', result[0].version.split(' ')[0]);
            return true;
        } catch (error) {
            console.error('❌ Error de conexión a Neon:', error);
            throw error;
        }
    }

    async createTables() {
        try {
            console.log('📋 Creando tablas de Computer Vision...');

            // Tabla para usuarios/sesiones
            await this.sql`
                CREATE TABLE IF NOT EXISTS cv_users (
                    id SERIAL PRIMARY KEY,
                    session_id VARCHAR(255) UNIQUE NOT NULL,
                    ip_address INET,
                    user_agent TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            `;

            // Tabla para análisis de Computer Vision
            await this.sql`
                CREATE TABLE IF NOT EXISTS cv_analyses (
                    id SERIAL PRIMARY KEY,
                    session_id VARCHAR(255) REFERENCES cv_users(session_id),
                    analysis_type VARCHAR(50) NOT NULL,
                    image_name VARCHAR(255),
                    image_size INTEGER,
                    image_type VARCHAR(50),
                    processing_time_ms INTEGER,
                    results JSONB,
                    confidence_score DECIMAL(5,4),
                    objects_detected INTEGER DEFAULT 0,
                    faces_detected INTEGER DEFAULT 0,
                    text_extracted TEXT,
                    classifications JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            `;

            // Tabla para métricas del sistema
            await this.sql`
                CREATE TABLE IF NOT EXISTS cv_metrics (
                    id SERIAL PRIMARY KEY,
                    metric_type VARCHAR(50) NOT NULL,
                    metric_value DECIMAL,
                    metadata JSONB,
                    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            `;

            // Tabla para feedback de usuarios
            await this.sql`
                CREATE TABLE IF NOT EXISTS cv_feedback (
                    id SERIAL PRIMARY KEY,
                    analysis_id INTEGER REFERENCES cv_analyses(id),
                    session_id VARCHAR(255),
                    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                    feedback_text TEXT,
                    is_accurate BOOLEAN,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            `;

            // Tabla para estadísticas diarias
            await this.sql`
                CREATE TABLE IF NOT EXISTS cv_daily_stats (
                    id SERIAL PRIMARY KEY,
                    date DATE UNIQUE NOT NULL,
                    total_analyses INTEGER DEFAULT 0,
                    object_detections INTEGER DEFAULT 0,
                    face_detections INTEGER DEFAULT 0,
                    ocr_analyses INTEGER DEFAULT 0,
                    classifications INTEGER DEFAULT 0,
                    avg_processing_time DECIMAL,
                    avg_confidence DECIMAL(5,4),
                    unique_users INTEGER DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            `;

            // Crear índices para optimizar consultas
            await this.sql`CREATE INDEX IF NOT EXISTS idx_cv_analyses_session ON cv_analyses(session_id)`;
            await this.sql`CREATE INDEX IF NOT EXISTS idx_cv_analyses_type ON cv_analyses(analysis_type)`;
            await this.sql`CREATE INDEX IF NOT EXISTS idx_cv_analyses_created ON cv_analyses(created_at)`;
            await this.sql`CREATE INDEX IF NOT EXISTS idx_cv_metrics_type ON cv_metrics(metric_type)`;
            await this.sql`CREATE INDEX IF NOT EXISTS idx_cv_daily_stats_date ON cv_daily_stats(date)`;

            console.log('✅ Tablas de Computer Vision creadas correctamente');

        } catch (error) {
            console.error('❌ Error creando tablas:', error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════
    // MÉTODOS DE USUARIOS
    // ═══════════════════════════════════════════════════════

    async createOrUpdateUser(sessionId, ipAddress = null, userAgent = null) {
        try {
            const result = await this.sql`
                INSERT INTO cv_users (session_id, ip_address, user_agent)
                VALUES (${sessionId}, ${ipAddress}, ${userAgent})
                ON CONFLICT (session_id)
                DO UPDATE SET
                    last_activity = NOW(),
                    ip_address = COALESCE(EXCLUDED.ip_address, cv_users.ip_address),
                    user_agent = COALESCE(EXCLUDED.user_agent, cv_users.user_agent)
                RETURNING *
            `;

            return result[0];
        } catch (error) {
            console.error('❌ Error creando/actualizando usuario:', error);
            throw error;
        }
    }

    async getUserStats(sessionId) {
        try {
            const result = await this.sql`
                SELECT
                    u.session_id,
                    u.created_at as user_since,
                    u.last_activity,
                    COUNT(a.id) as total_analyses,
                    COUNT(CASE WHEN a.analysis_type = 'object-detection' THEN 1 END) as object_analyses,
                    COUNT(CASE WHEN a.analysis_type = 'face-detection' THEN 1 END) as face_analyses,
                    COUNT(CASE WHEN a.analysis_type = 'ocr' THEN 1 END) as ocr_analyses,
                    COUNT(CASE WHEN a.analysis_type = 'classification' THEN 1 END) as classification_analyses,
                    AVG(a.processing_time_ms) as avg_processing_time,
                    AVG(a.confidence_score) as avg_confidence
                FROM cv_users u
                LEFT JOIN cv_analyses a ON u.session_id = a.session_id
                WHERE u.session_id = ${sessionId}
                GROUP BY u.session_id, u.created_at, u.last_activity
            `;

            return result[0] || null;
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de usuario:', error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════
    // MÉTODOS DE ANÁLISIS CV
    // ═══════════════════════════════════════════════════════

    async saveAnalysis(analysisData) {
        try {
            const {
                sessionId,
                analysisType,
                imageName,
                imageSize,
                imageType,
                processingTime,
                results,
                confidenceScore,
                objectsDetected = 0,
                facesDetected = 0,
                textExtracted = null,
                classifications = null
            } = analysisData;

            const result = await this.sql`
                INSERT INTO cv_analyses (
                    session_id, analysis_type, image_name, image_size, image_type,
                    processing_time_ms, results, confidence_score, objects_detected,
                    faces_detected, text_extracted, classifications
                )
                VALUES (
                    ${sessionId}, ${analysisType}, ${imageName}, ${imageSize}, ${imageType},
                    ${processingTime}, ${JSON.stringify(results)}, ${confidenceScore},
                    ${objectsDetected}, ${facesDetected}, ${textExtracted},
                    ${classifications ? JSON.stringify(classifications) : null}
                )
                RETURNING *
            `;

            // Actualizar estadísticas diarias
            await this.updateDailyStats(analysisType, processingTime, confidenceScore);

            return result[0];
        } catch (error) {
            console.error('❌ Error guardando análisis:', error);
            throw error;
        }
    }

    async getAnalysisHistory(sessionId, limit = 50) {
        try {
            const result = await this.sql`
                SELECT
                    id,
                    analysis_type,
                    image_name,
                    image_size,
                    processing_time_ms,
                    confidence_score,
                    objects_detected,
                    faces_detected,
                    text_extracted,
                    created_at
                FROM cv_analyses
                WHERE session_id = ${sessionId}
                ORDER BY created_at DESC
                LIMIT ${limit}
            `;

            return result;
        } catch (error) {
            console.error('❌ Error obteniendo historial:', error);
            throw error;
        }
    }

    async getAnalysisDetails(analysisId) {
        try {
            const result = await this.sql`
                SELECT * FROM cv_analyses
                WHERE id = ${analysisId}
            `;

            return result[0] || null;
        } catch (error) {
            console.error('❌ Error obteniendo detalles de análisis:', error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════
    // MÉTODOS DE MÉTRICAS
    // ═══════════════════════════════════════════════════════

    async recordMetric(metricType, value, metadata = {}) {
        try {
            const result = await this.sql`
                INSERT INTO cv_metrics (metric_type, metric_value, metadata)
                VALUES (${metricType}, ${value}, ${JSON.stringify(metadata)})
                RETURNING *
            `;

            return result[0];
        } catch (error) {
            console.error('❌ Error registrando métrica:', error);
            throw error;
        }
    }

    async getMetrics(metricType, hours = 24) {
        try {
            const result = await this.sql`
                SELECT
                    metric_type,
                    AVG(metric_value) as avg_value,
                    MIN(metric_value) as min_value,
                    MAX(metric_value) as max_value,
                    COUNT(*) as count,
                    DATE_TRUNC('hour', timestamp) as hour
                FROM cv_metrics
                WHERE metric_type = ${metricType}
                AND timestamp >= NOW() - INTERVAL '${hours} hours'
                GROUP BY metric_type, hour
                ORDER BY hour DESC
            `;

            return result;
        } catch (error) {
            console.error('❌ Error obteniendo métricas:', error);
            throw error;
        }
    }

    async updateDailyStats(analysisType, processingTime, confidence) {
        try {
            const today = new Date().toISOString().split('T')[0];

            await this.sql`
                INSERT INTO cv_daily_stats (
                    date, total_analyses,
                    object_detections, face_detections, ocr_analyses, classifications,
                    avg_processing_time, avg_confidence
                )
                VALUES (
                    ${today}, 1,
                    ${analysisType === 'object-detection' ? 1 : 0},
                    ${analysisType === 'face-detection' ? 1 : 0},
                    ${analysisType === 'ocr' ? 1 : 0},
                    ${analysisType === 'classification' ? 1 : 0},
                    ${processingTime}, ${confidence}
                )
                ON CONFLICT (date) DO UPDATE SET
                    total_analyses = cv_daily_stats.total_analyses + 1,
                    object_detections = cv_daily_stats.object_detections + ${analysisType === 'object-detection' ? 1 : 0},
                    face_detections = cv_daily_stats.face_detections + ${analysisType === 'face-detection' ? 1 : 0},
                    ocr_analyses = cv_daily_stats.ocr_analyses + ${analysisType === 'ocr' ? 1 : 0},
                    classifications = cv_daily_stats.classifications + ${analysisType === 'classification' ? 1 : 0},
                    avg_processing_time = (cv_daily_stats.avg_processing_time * cv_daily_stats.total_analyses + ${processingTime}) / (cv_daily_stats.total_analyses + 1),
                    avg_confidence = (cv_daily_stats.avg_confidence * cv_daily_stats.total_analyses + ${confidence}) / (cv_daily_stats.total_analyses + 1)
            `;
        } catch (error) {
            console.error('❌ Error actualizando estadísticas diarias:', error);
        }
    }

    async getDailyStats(days = 7) {
        try {
            const result = await this.sql`
                SELECT * FROM cv_daily_stats
                WHERE date >= CURRENT_DATE - INTERVAL '${days} days'
                ORDER BY date DESC
            `;

            return result;
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas diarias:', error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════
    // MÉTODOS DE FEEDBACK
    // ═══════════════════════════════════════════════════════

    async saveFeedback(analysisId, sessionId, rating, feedbackText = null, isAccurate = null) {
        try {
            const result = await this.sql`
                INSERT INTO cv_feedback (analysis_id, session_id, rating, feedback_text, is_accurate)
                VALUES (${analysisId}, ${sessionId}, ${rating}, ${feedbackText}, ${isAccurate})
                RETURNING *
            `;

            return result[0];
        } catch (error) {
            console.error('❌ Error guardando feedback:', error);
            throw error;
        }
    }

    async getFeedbackStats() {
        try {
            const result = await this.sql`
                SELECT
                    AVG(rating) as avg_rating,
                    COUNT(*) as total_feedback,
                    COUNT(CASE WHEN is_accurate = true THEN 1 END) as accurate_count,
                    COUNT(CASE WHEN is_accurate = false THEN 1 END) as inaccurate_count,
                    COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_count,
                    COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_count
                FROM cv_feedback
                WHERE created_at >= NOW() - INTERVAL '30 days'
            `;

            return result[0];
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas de feedback:', error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════
    // MÉTODOS DE ESTADÍSTICAS GLOBALES
    // ═══════════════════════════════════════════════════════

    async getGlobalStats() {
        try {
            const [totalStats, recentStats, topAnalyses] = await Promise.all([
                // Estadísticas totales
                this.sql`
                    SELECT
                        COUNT(DISTINCT session_id) as total_users,
                        COUNT(*) as total_analyses,
                        AVG(processing_time_ms) as avg_processing_time,
                        AVG(confidence_score) as avg_confidence
                    FROM cv_analyses
                `,

                // Estadísticas de las últimas 24 horas
                this.sql`
                    SELECT
                        COUNT(DISTINCT session_id) as users_24h,
                        COUNT(*) as analyses_24h,
                        AVG(processing_time_ms) as avg_processing_time_24h
                    FROM cv_analyses
                    WHERE created_at >= NOW() - INTERVAL '24 hours'
                `,

                // Análisis más populares
                this.sql`
                    SELECT
                        analysis_type,
                        COUNT(*) as count,
                        AVG(confidence_score) as avg_confidence
                    FROM cv_analyses
                    GROUP BY analysis_type
                    ORDER BY count DESC
                `
            ]);

            return {
                total: totalStats[0],
                recent: recentStats[0],
                popular: topAnalyses
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas globales:', error);
            throw error;
        }
    }

    // ═══════════════════════════════════════════════════════
    // MÉTODOS DE UTILIDAD
    // ═══════════════════════════════════════════════════════

    getStatus() {
        return {
            connected: this.isConnected,
            connectionString: this.connectionString ? 'Configured' : 'Not configured',
            timestamp: new Date().toISOString()
        };
    }

    async cleanup() {
        try {
            // Limpiar datos antiguos (más de 30 días)
            const deleted = await this.sql`
                DELETE FROM cv_analyses
                WHERE created_at < NOW() - INTERVAL '30 days'
            `;

            console.log(`🧹 Limpieza: ${deleted.length} análisis antiguos eliminados`);
            return deleted.length;
        } catch (error) {
            console.error('❌ Error en limpieza:', error);
            throw error;
        }
    }

    async exportData(sessionId = null, format = 'json') {
        try {
            let query = this.sql`
                SELECT a.*, u.created_at as user_created
                FROM cv_analyses a
                JOIN cv_users u ON a.session_id = u.session_id
            `;

            if (sessionId) {
                query = this.sql`
                    SELECT a.*, u.created_at as user_created
                    FROM cv_analyses a
                    JOIN cv_users u ON a.session_id = u.session_id
                    WHERE a.session_id = ${sessionId}
                `;
            }

            const data = await query;

            if (format === 'csv') {
                // Convertir a CSV
                const headers = Object.keys(data[0] || {});
                const csv = [
                    headers.join(','),
                    ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
                ].join('\n');
                return csv;
            }

            return data;
        } catch (error) {
            console.error('❌ Error exportando datos:', error);
            throw error;
        }
    }
}

module.exports = SandraNeonDatabase;