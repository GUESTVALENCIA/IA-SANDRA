@echo off
cls
echo ====================================================
echo   SANDRA IA 8.0 PRO - MODO OFFLINE
echo ====================================================
echo.

REM Matar procesos anteriores
echo [1/4] Limpiando procesos anteriores...
taskkill /f /im electron.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

REM Limpiar caché de Electron
echo [2/4] Limpiando caché...
if exist "%APPDATA%\electron\*" (
  rmdir /s /q "%APPDATA%\electron" >nul 2>&1
)

REM Ir al directorio de la aplicación
echo [3/4] Preparando entorno...
cd /d "C:\Sandra-IA-8.0-Pro"
echo Directorio: %cd%

REM Instalar/actualizar dependencias rápidamente
echo [4/4] Verificando dependencias...
if not exist "node_modules" (
  echo Instalando npm packages...
  call npm install --silent --no-audit 2>nul
)

REM Iniciar en modo offline
echo.
echo ====================================================
echo   INICIANDO SANDRA IA 8.0 PRO
echo ====================================================
echo.
echo 🚀 Iniciando aplicación...
echo.

REM Ejecutar con todas las opciones offline
call npm start -- --no-sandbox --disable-gpu --disable-web-security

REM Si falla npm, intentar directamente con electron
if %errorlevel% neq 0 (
  echo.
  echo ⚠️ Intentando método alternativo...
  call npx electron desktop-app/main.js --no-sandbox --disable-gpu
)

echo.
pause

