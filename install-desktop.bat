@echo off
echo =========================================
echo   SANDRA DESKTOP APP - INSTALADOR
echo =========================================
echo.

echo [1/4] Instalando Electron...
call npm install electron@27.0.0 --save-dev --silent

echo.
echo [2/4] Instalando Electron Builder...
call npm install electron-builder@24.0.0 --save-dev --silent

echo.
echo [3/4] Preparando aplicacion desktop...
copy package-desktop.json package.json >nul 2>&1

echo.
echo [4/4] Iniciando Sandra Desktop App...
echo.

echo =========================================
echo   SANDRA DESKTOP LISTA!
echo   Iniciando aplicacion...
echo =========================================

timeout /t 2 /nobreak >nul

call npm start

pause