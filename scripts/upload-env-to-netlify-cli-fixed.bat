@echo off
REM Script mejorado para subir variables de entorno a Netlify usando Netlify CLI
REM Requiere: npm install -g netlify-cli
REM Uso: upload-env-to-netlify-cli-fixed.bat

cd /d "%~dp0\.."

echo.
echo ========================================
echo   SUBIR VARIABLES A NETLIFY (CLI)
echo ========================================
echo.

REM Verificar que netlify CLI está instalado
where netlify >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Netlify CLI no encontrado
    echo.
    echo Instalar con:
    echo   npm install -g netlify-cli
    echo.
    pause
    exit /b 1
)

REM Verificar que .env existe
if not exist ".env" (
    if not exist ".env.production" (
        echo Error: Archivo .env no encontrado
        echo Crea .env o .env.production con tus API keys
        pause
        exit /b 1
    )
)

REM Determinar archivo .env
set ENV_FILE=
if exist ".env.production" (
    set ENV_FILE=.env.production
) else if exist ".env" (
    set ENV_FILE=.env
)

echo [INFO] Usando archivo: %ENV_FILE%
echo.

REM Verificar autenticación (sin pausar si falla)
echo Verificando autenticacion en Netlify...
netlify status >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo No estas autenticado en Netlify.
    echo Abriendo navegador para autenticacion...
    echo.
    netlify login
    if %errorlevel% neq 0 (
        echo.
        echo Error: No se pudo autenticar
        pause
        exit /b 1
    )
) else (
    echo Autenticacion OK
)

REM Verificar link del sitio
echo.
echo Verificando link del sitio...
netlify status >nul 2>&1
set LINKED=0
for /f "tokens=*" %%i in ('netlify status --json 2^>nul') do (
    echo %%i | findstr /C:"site_id" >nul 2>&1
    if !errorlevel! equ 0 set LINKED=1
)

if %LINKED% equ 0 (
    echo Sitio no linkeado. Vinculando sitio...
    echo.
    netlify link
    if %errorlevel% neq 0 (
        echo.
        echo Error: No se pudo linkear el sitio
        pause
        exit /b 1
    )
) else (
    echo Sitio linkeado OK
)

echo.
echo ========================================
echo   SUBIENDO VARIABLES DE ENTORNO
echo ========================================
echo.

REM Leer .env y subir variables usando Node.js script más robusto
node scripts/upload-env-to-netlify.js

if %errorlevel% neq 0 (
    echo.
    echo Error al subir variables
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo   COMPLETADO
echo ========================================
echo.
echo Verificar en:
echo   https://app.netlify.com/sites/grand-pasca-a584d5/settings/env
echo.
pause

