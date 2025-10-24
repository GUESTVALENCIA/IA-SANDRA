# 🔍 Sandra Computer Vision REAL - Deployment Guide

## Galaxy Level Production Deployment con Neon PostgreSQL

### 📋 Resumen del Sistema

Sandra Computer Vision REAL es una implementación completa de visión artificial que incluye:

- **Object Detection real** con COCO-SSD
- **Face Recognition real** con BlazeFace
- **OCR real** con Tesseract.js
- **Image Classification real** con MobileNet
- **Base de datos PostgreSQL** en Neon (Netlify Pro)
- **Almacenamiento de análisis** y métricas en tiempo real
- **API completa** para análisis y estadísticas

---

## 🚀 Despliegue en Netlify Pro

### 1. Preparación del Repositorio

```bash
# Clonar o subir el proyecto a GitHub
git init
git add .
git commit -m "🔍 Sandra Computer Vision REAL - Production Ready"
git branch -M main
git remote add origin https://github.com/tu-usuario/sandra-cv-real.git
git push -u origin main
```

### 2. Configuración en Netlify

1. **Conectar repositorio**: Link GitHub repo en Netlify Dashboard
2. **Build settings**:
   - **Build command**: `echo 'Frontend ready'`
   - **Publish directory**: `frontend`
   - **Functions directory**: `backend`

### 3. Variables de Entorno en Netlify

Ir a **Site settings > Environment variables** y configurar:

```env
# Base de datos Neon
NEON_DATABASE_URL=postgresql://username:password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require

# APIs de IA (opcional para frontend-only)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
OPENAI_API_KEY=sk-xxxxx

# Configuración
NODE_ENV=production
```

### 4. Configuración de Neon Database

1. **Crear proyecto en Neon**: https://neon.tech/
2. **Obtener connection string**: Desde Neon Dashboard
3. **Configurar en Netlify**: Agregar `NEON_DATABASE_URL`

---

## 🔥 Despliegue en Vercel Pro

### 1. Configuración Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar proyecto
vercel

# Configurar dominio personalizado
vercel --prod
```

### 2. Variables de Entorno en Vercel

```bash
# Configurar variables de entorno
vercel env add NEON_DATABASE_URL
vercel env add NODE_ENV production
```

---

## 🗄️ Configuración de Neon PostgreSQL

### 1. Crear Base de Datos

```sql
-- Las tablas se crean automáticamente al iniciar el servidor
-- Ver: backend/sandra-neon-database.js para el schema completo

-- Verificar tablas creadas
\dt

-- Ver estructura de tabla principal
\d cv_analyses
```

### 2. Schema Principal

```sql
-- Usuarios y sesiones
CREATE TABLE cv_users (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Análisis de Computer Vision
CREATE TABLE cv_analyses (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    analysis_type VARCHAR(50) NOT NULL,
    results JSONB,
    confidence_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ver backend/sandra-neon-database.js para schema completo
```

---

## 🧪 Testing del Deployment

### 1. Verificar Health Check

```bash
# Local testing
curl http://localhost:5000/health

# Production testing
curl https://tu-dominio.netlify.app/health
```

### 2. Verificar Computer Vision

```bash
# Verificar modelos CV
curl https://tu-dominio.netlify.app/api/cv/status

# Verificar base de datos
curl https://tu-dominio.netlify.app/api/neon/status
```

### 3. Test Complete Workflow

1. **Cargar imagen** en la interfaz
2. **Ejecutar análisis** (Object Detection, Face Recognition, OCR, Classification)
3. **Verificar almacenamiento** en Neon
4. **Ver estadísticas** y métricas

---

## 📊 Monitoreo y Métricas

### Endpoints de Monitoreo

```bash
# Estadísticas globales
GET /api/neon/global-stats

# Estadísticas diarias
GET /api/neon/daily-stats?days=7

# Métricas específicas
GET /api/neon/metrics/processing_time?hours=24

# Export de datos
GET /api/neon/export?format=csv
```

### Dashboard de Métricas

La aplicación incluye métricas en tiempo real:
- **Total de análisis realizados**
- **Tiempo promedio de procesamiento**
- **Confianza promedio de detecciones**
- **Usuarios únicos**
- **Tipos de análisis más populares**

---

## 🔐 Seguridad y Performance

### Headers de Seguridad

```
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net
```

### Rate Limiting

- **100 requests** por 15 minutos por IP
- **Imágenes máximo**: 10MB
- **Batch processing**: Máximo 10 imágenes

### Performance

- **TensorFlow.js**: Modelos optimizados desde CDN
- **PostgreSQL**: Conexiones pooling con Neon
- **Caching**: Headers de cache para recursos estáticos
- **Compression**: Gzip automático en Netlify/Vercel

---

## 🎯 Features Principales

### Computer Vision Real

✅ **Object Detection** - COCO-SSD con 80 clases de objetos
✅ **Face Detection** - BlazeFace con landmarks
✅ **OCR** - Tesseract.js multi-idioma
✅ **Image Classification** - MobileNet con 1000 clases
✅ **Real-time Processing** - Resultados en segundos
✅ **Visual Annotations** - Bounding boxes y landmarks

### Base de Datos Real

✅ **PostgreSQL en Neon** - Database serverless
✅ **Análisis Storage** - Todos los resultados guardados
✅ **User Tracking** - Sesiones y estadísticas
✅ **Metrics Collection** - Performance y usage
✅ **Data Export** - JSON y CSV export
✅ **Real-time Stats** - Dashboard en vivo

### Production Ready

✅ **Netlify Pro** - Deploy automático
✅ **Vercel Pro** - Alternative deployment
✅ **Domain Custom** - Tu dominio personalizado
✅ **SSL/HTTPS** - Seguridad completa
✅ **CDN Global** - Performance mundial
✅ **Environment Vars** - Configuración segura

---

## 🔧 Troubleshooting

### Problemas Comunes

**1. Error de conexión a Neon**
```bash
# Verificar variable de entorno
echo $NEON_DATABASE_URL

# Test de conexión
psql $NEON_DATABASE_URL -c "SELECT version();"
```

**2. Modelos CV no cargan**
```javascript
// Verificar en browser console
console.log('TensorFlow.js:', tf.version);
console.log('Models loaded:', window.sandraCV.models);
```

**3. CORS errors**
```bash
# Verificar headers en netlify.toml o vercel.json
# Asegurar que Access-Control-Allow-Origin está configurado
```

### Logs y Debug

```bash
# Netlify logs
netlify logs

# Vercel logs
vercel logs

# Browser DevTools
# Network tab para verificar requests
# Console para errors de JavaScript
```

---

## 📞 Soporte

Para soporte técnico:
- **GitHub Issues**: Crear issue en el repositorio
- **Documentación**: Ver comentarios en código
- **Logs**: Verificar browser console y network tab

---

## 🎉 Deployment Checklist

- [ ] ✅ Repositorio en GitHub
- [ ] 🗄️ Base de datos Neon configurada
- [ ] 🔐 Variables de entorno configuradas
- [ ] 🚀 Deploy en Netlify/Vercel
- [ ] 🌐 Dominio personalizado (opcional)
- [ ] 🧪 Tests de functionality
- [ ] 📊 Verificar métricas
- [ ] 🔍 Computer Vision funcionando
- [ ] 💾 Data storage funcionando

**Sandra Computer Vision REAL está listo para producción! 🎯**