# Script para actualizar app.asar con el nuevo main.js
# Requiere: npm install -g asar

$asarPath = "$PSScriptRoot\..\resources\app.asar"
$extractedPath = "$PSScriptRoot\..\resources\app_extracted"
$backupPath = "$PSScriptRoot\..\resources\app.asar.backup"

Write-Host "`n=== ACTUALIZANDO app.asar ===" -ForegroundColor Cyan

# Verificar que asar esté instalado
try {
    $asarVersion = npm list -g asar 2>$null
    if (-not $asarVersion) {
        Write-Host "`n⚠️  Instalando asar globalmente..." -ForegroundColor Yellow
        npm install -g asar
    }
    Write-Host "✅ asar instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error instalando asar. Ejecuta manualmente: npm install -g asar" -ForegroundColor Red
    exit 1
}

# Verificar que app.asar existe
if (-not (Test-Path $asarPath)) {
    Write-Host "❌ app.asar no encontrado en: $asarPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Extrayendo app.asar..." -ForegroundColor Yellow
# Extraer app.asar
if (Test-Path $extractedPath) {
    Remove-Item $extractedPath -Recurse -Force
}
asar extract $asarPath $extractedPath

Write-Host "✅ app.asar extraído" -ForegroundColor Green

# Copiar el nuevo main.js
$sourceMain = "$PSScriptRoot\main.js"
$destMain = "$extractedPath\main.js"

if (Test-Path $sourceMain) {
    Write-Host "`n📝 Copiando nuevo main.js..." -ForegroundColor Yellow
    Copy-Item $sourceMain $destMain -Force
    Write-Host "✅ main.js actualizado" -ForegroundColor Green
} else {
    Write-Host "❌ main.js no encontrado en: $sourceMain" -ForegroundColor Red
    exit 1
}

# Hacer backup del original
Write-Host "`n💾 Creando backup de app.asar original..." -ForegroundColor Yellow
if (Test-Path $backupPath) {
    Remove-Item $backupPath -Force
}
Copy-Item $asarPath $backupPath
Write-Host "✅ Backup creado: app.asar.backup" -ForegroundColor Green

# Re-empaquetar
Write-Host "`n📦 Re-empaquetando app.asar..." -ForegroundColor Yellow
$newAsar = "$PSScriptRoot\..\resources\app.asar.new"
asar pack $extractedPath $newAsar

# Reemplazar el original
Write-Host "`n🔄 Reemplazando app.asar..." -ForegroundColor Yellow
Remove-Item $asarPath -Force
Move-Item $newAsar $asarPath

# Limpiar extracción temporal
Remove-Item $extractedPath -Recurse -Force

Write-Host "`n✅ app.asar actualizado exitosamente!" -ForegroundColor Green
Write-Host "`nReinicia la aplicación para que los cambios surtan efecto." -ForegroundColor Cyan

