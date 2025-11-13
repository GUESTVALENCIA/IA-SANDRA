# Script para iniciar Sandra IA 8.0 Pro en modo visual

Write-Host "🚀 Iniciando Sandra IA 8.0 Pro en modo visual..." -ForegroundColor Cyan

# Limpiar procesos previos
Get-Process -Name electron, node -ErrorAction SilentlyContinue | Stop-Process -Force

# Ir al directorio
Set-Location "C:\Sandra-IA-8.0-Pro"

# Instalar dependencias si falta
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install --legacy-peer-deps --force
}

# Establecer variables de entorno
$env:NODE_ENV = "development"
$env:ELECTRON_DISABLE_SANDBOX = "true"

# Crear archivo batch temporal para ejecutar
$batchContent = @"
@echo off
cd /d "C:\Sandra-IA-8.0-Pro"
title Sandra IA 8.0 Pro
cls
echo.
echo    🚀 SANDRA IA 8.0 PRO - INICIANDO...
echo.
echo    Modo: Offline - Sin Internet Requerida
echo    Versión: 8.0.0
echo    Estado: Inicializando Electron...
echo.
echo ===============================================
echo.

set NODE_ENV=development
set ELECTRON_DISABLE_SANDBOX=true

REM Ejecutar npm start
npx electron desktop-app/main.js --no-sandbox --disable-gpu

pause
"@

$batchContent | Out-File -FilePath "$env:TEMP\sandra_start.bat" -Encoding ASCII

# Ejecutar batch visible
Write-Host "⚡ Lanzando Electron..." -ForegroundColor Green
Start-Process cmd.exe -ArgumentList "/c `"$env:TEMP\sandra_start.bat`"" -NoNewWindow -Wait

Write-Host "✅ Completado" -ForegroundColor Green

