@echo off
echo.
echo ═══════════════════════════════════════════════════════
echo     SANDRA PROFESSIONAL - INICIO RAPIDO
echo     CEO: Claytis Miguel Tom Zuaznabar
echo ═══════════════════════════════════════════════════════
echo.
echo [1/3] Verificando instalacion...
if not exist "node_modules\" (
    echo.
    echo ❌ Dependencias no instaladas
    echo.
    echo Ejecutando: npm install
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencias instaladas
)

echo.
echo [2/3] Iniciando backend Express...
start "Sandra Backend" cmd /k "npm run backend"
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Iniciando aplicacion desktop...
echo.
echo ✅ Sandra Professional arrancando...
echo.
start "Sandra Desktop" npm start

echo.
echo ═══════════════════════════════════════════════════════
echo     SANDRA OPERATIVA
echo     Backend: http://localhost:5000
echo     Desktop: Ventana de aplicacion
echo ═══════════════════════════════════════════════════════
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
