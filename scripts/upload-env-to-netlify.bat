@echo off
REM Script para subir variables de entorno a Netlify (Windows)
REM Uso: upload-env-to-netlify.bat

cd /d "%~dp0\.."

echo.
echo ========================================
echo   SUBIR VARIABLES A NETLIFY
echo ========================================
echo.

REM Verificar que .env existe
if not exist ".env" (
    echo Error: Archivo .env no encontrado
    echo Crea .env con tus API keys antes de ejecutar este script
    pause
    exit /b 1
)

REM Verificar que Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js no encontrado
    echo Instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

REM Ejecutar script Node
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
pause

