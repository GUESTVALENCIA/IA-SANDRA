# Script de configuración automática de MCP para Cursor
# Ejecutar como administrador si es necesario

$cursorConfigPath = "$env:APPDATA\Cursor\User\globalStorage"
$mcpConfigFile = "$cursorConfigPath\mcp.json"

# Crear directorio si no existe
if (-not (Test-Path $cursorConfigPath)) {
    New-Item -ItemType Directory -Path $cursorConfigPath -Force | Out-Null
}

# Ruta al servidor MCP
$serverPath = Join-Path $PSScriptRoot "index.js"
$serverPath = $serverPath -replace '\\', '/'

# Configuración MCP
$mcpConfig = @{
    mcpServers = @{
        "sandra-env" = @{
            command = "node"
            args = @($serverPath)
        }
    }
} | ConvertTo-Json -Depth 10

# Leer configuración existente si existe
$existingConfig = @{}
if (Test-Path $mcpConfigFile) {
    try {
        $existingContent = Get-Content $mcpConfigFile -Raw | ConvertFrom-Json
        if ($existingContent.mcpServers) {
            $existingConfig = $existingContent.mcpServers
        }
    } catch {
        Write-Host "Warning: Could not read existing config, creating new one" -ForegroundColor Yellow
    }
}

# Agregar servidor Sandra sin sobrescribir otros
$newConfig = @{
    mcpServers = $existingConfig
}
$newConfig.mcpServers["sandra-env"] = @{
    command = "node"
    args = @($serverPath)
}

# Guardar configuración
$newConfig | ConvertTo-Json -Depth 10 | Set-Content $mcpConfigFile -Encoding UTF8

Write-Host "========================================" -ForegroundColor Green
Write-Host "MCP Configuration Created Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration file: $mcpConfigFile" -ForegroundColor Cyan
Write-Host "Server path: $serverPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Install dependencies: npm install" -ForegroundColor White
Write-Host "2. Restart Cursor" -ForegroundColor White
Write-Host "3. Verify MCP server is loaded" -ForegroundColor White
Write-Host ""
Write-Host "Ready to work outside Cursor environment!" -ForegroundColor Green

