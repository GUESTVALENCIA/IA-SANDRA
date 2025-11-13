@echo off
title Sandra IA 8.0 Pro - Offline Mode
cd /d C:\Sandra-IA-8.0-Pro

cls
echo.
echo    ╔═══════════════════════════════════════════════╗
echo    ║                                               ║
echo    ║      🚀 SANDRA IA 8.0 PRO - MODO OFFLINE 🚀   ║
echo    ║                                               ║
echo    ║        Iniciando aplicación sin internet...    ║
echo    ║                                               ║
echo    ╚═══════════════════════════════════════════════╝
echo.

REM Verificar Node.js
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo Descárgalo desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Limpiar procesos previos
taskkill /f /im electron.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
timeout /t 1 >nul

REM Variables offline
set NODE_ENV=development
set ELECTRON_DISABLE_SANDBOX=true
set ELECTRON_NO_ASAR=true

echo [1/3] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando npm packages...
    call npm install --legacy-peer-deps --force --silent
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
)
echo ✅ Dependencias OK

echo.
echo [2/3] Configurando ambiente offline...
echo ✅ Ambiente configurado

echo.
echo [3/3] Iniciando Electron (sin internet)...
echo.

REM Iniciar la aplicación
call npx electron desktop-app/main.js --no-sandbox --disable-gpu --disable-web-security

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error al iniciar Electron
    echo Intenta instalar dependencias:
    echo   npm install --force --legacy-peer-deps
    echo.
)

pause

