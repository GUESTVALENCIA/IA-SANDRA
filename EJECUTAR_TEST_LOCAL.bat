@echo off
echo ============================================
echo   TEST LOCAL - SANDRA COO DESKTOP
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando dependencias...
if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
) else (
    echo Dependencias OK
)

echo.
echo [2/3] Verificando .env...
if not exist ".env" (
    echo ERROR: .env no existe
    echo Crea un archivo .env con: OPENAI_API_KEY=sk-tu-api-key
    pause
    exit /b 1
) else (
    echo .env encontrado
)

echo.
echo [3/3] Iniciando aplicacion...
echo.
echo ============================================
echo   Si ves errores, copialos y enviamelos
echo ============================================
echo.

npm start -- --dev

pause

