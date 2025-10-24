@echo off
echo.
echo ═══════════════════════════════════════════════════════
echo     ABRIENDO SANDRA PROFESSIONAL
echo ═══════════════════════════════════════════════════════
echo.

cd C:\Users\clayt\Desktop\sandra-professional

echo [1/2] Verificando backend...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend no activo. Iniciando...
    start "Sandra Backend" cmd /k "node backend/server.js"
    timeout /t 3 /nobreak >nul
) else (
    echo ✅ Backend ya activo
)

echo.
echo [2/2] Abriendo aplicacion...
start "" "C:\Users\clayt\Desktop\sandra-professional\frontend\index.html"

echo.
echo ✅ Sandra Professional abierta en navegador
echo.
pause
