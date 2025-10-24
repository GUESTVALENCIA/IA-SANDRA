@echo off
echo.
echo ═══════════════════════════════════════════════════════
echo  🗄️ SANDRA IA - CONFIGURACIÓN NEON POSTGRESQL
echo ═══════════════════════════════════════════════════════
echo.

echo ✅ Configurando Neon como storage central único...
echo.

echo 🔧 Variables de entorno necesarias:
echo    NEON_DATABASE_URL=postgresql://username:password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require
echo    NODE_ENV=production
echo.

echo 🚀 Endpoints de Neon disponibles:
echo    GET  /api/neon/status
echo    GET  /api/neon/global-stats
echo    GET  /api/neon/daily-stats?days=7
echo    GET  /api/neon/metrics/processing_time?hours=24
echo    GET  /api/neon/export?format=csv
echo    POST /api/neon/save-analysis
echo.

echo 📊 Base de datos unificada incluye:
echo    ├─ cv_analyses (Computer Vision)
echo    ├─ cv_users (Usuarios y sesiones)
echo    ├─ cv_metrics (Métricas de performance)
echo    └─ cv_feedback (Feedback de usuarios)
echo.

echo 🔍 Para verificar funcionamiento:
echo    curl http://localhost:5000/api/neon/status
echo.

echo ✨ Sandra IA ahora usa Neon como storage central único
echo    ¡Sin fragmentación, todo unificado! 🎯
echo.
pause