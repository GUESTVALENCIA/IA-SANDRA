# ============================================
# SANDRA IA 8.0 PRO - OFFLINE MODE
# ============================================

Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SANDRA IA 8.0 PRO - MODO OFFLINE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Limpiar procesos
Write-Host "[1/5] 🧹 Limpiando procesos anteriores..." -ForegroundColor Yellow
$processes = @('electron', 'node', 'npm')
foreach ($proc in $processes) {
    Get-Process -Name $proc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

# Paso 2: Navegar al directorio
Write-Host "[2/5] 📂 Preparando directorio..." -ForegroundColor Yellow
$appDir = "C:\Sandra-IA-8.0-Pro"
Set-Location $appDir
Write-Host "Ubicación: $appDir" -ForegroundColor Green

# Paso 3: Verificar dependencias
Write-Host "[3/5] 📦 Verificando dependencias..." -ForegroundColor Yellow
if (-Not (Test-Path "node_modules")) {
    Write-Host "Instalando npm packages..." -ForegroundColor Cyan
    & npm install --silent --no-audit 2>&1 | Out-Null
    Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencias ya existen" -ForegroundColor Green
}

# Paso 4: Variables de entorno
Write-Host "[4/5] ⚙️  Configurando entorno..." -ForegroundColor Yellow
$env:NODE_ENV = "development"
$env:ELECTRON_DISABLE_SANDBOX = "true"
$env:ELECTRON_DISABLE_GPU = "true"
Write-Host "✅ Entorno configurado" -ForegroundColor Green

# Paso 5: Iniciar aplicación
Write-Host "[5/5] 🚀 Iniciando SANDRA IA 8.0 PRO..." -ForegroundColor Yellow
Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Intentar con npm start
try {
    & npm start -- --no-sandbox --disable-gpu
} catch {
    Write-Host "⚠️ Método npm falló, intentando electron directo..." -ForegroundColor Red
    & npx electron desktop-app/main.js --no-sandbox --disable-gpu --disable-web-security
}

# Si todo falla, mostrar error
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error al iniciar la aplicación" -ForegroundColor Red
    Write-Host ""
    Write-Host "Intenta esto:" -ForegroundColor Yellow
    Write-Host "1. Abre PowerShell como Administrador" -ForegroundColor White
    Write-Host "2. Ejecuta: npm install --force --legacy-peer-deps" -ForegroundColor White
    Write-Host "3. Luego: npm start" -ForegroundColor White
    pause
}

