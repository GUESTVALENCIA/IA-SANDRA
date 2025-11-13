@echo off
title Sandra IA 8.0 Pro
cd /d C:\Sandra-IA-8.0-Pro

cls
echo.
echo    ====================================================
echo    SANDRA IA 8.0 PRO - MODO DIRECTO
echo    ====================================================
echo.
echo    Limpiando procesos anteriores...
taskkill /f /im electron.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
timeout /t 1 >nul

echo    Iniciando Electron directamente...
echo.

npx electron desktop-app/main.js --no-sandbox --disable-gpu

if %errorlevel% neq 0 (
    echo.
    echo    ERROR: No se pudo iniciar Electron
    echo.
    echo    Soluciones:
    echo    1. npm install --force --legacy-peer-deps
    echo    2. Luego ejecuta este archivo de nuevo
    echo.
)

pause

