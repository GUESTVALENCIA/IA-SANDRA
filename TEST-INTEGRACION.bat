@echo off
cls
echo.
echo =============================================
echo   SANDRA PROFESSIONAL - TEST INTEGRACIÓN
echo   Verificando todas las SDKs y APIs reales
echo =============================================
echo.
cd /d "%~dp0"
echo [INFO] Asegurate de que el servidor este corriendo
echo        Usa: INICIAR-BACKEND.bat en otra ventana
echo.
echo [INFO] Esperando 3 segundos...
timeout /t 3 /nobreak >nul
echo.
echo [%time%] Ejecutando tests...
echo.
node test-integration.js
echo.
echo =============================================
echo   Test completado
echo =============================================
echo.
pause
