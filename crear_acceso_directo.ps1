# Crear acceso directo profesional en el Escritorio

Write-Host "Creando acceso directo en el Escritorio..." -ForegroundColor Cyan

$DesktopPath = [System.IO.Path]::Combine($env:USERPROFILE, "Desktop")
$ShortcutPath = [System.IO.Path]::Combine($DesktopPath, "Sandra IA 8.0 Pro.lnk")
$BatPath = "C:\Sandra-IA-8.0-Pro\ABRIR_SANDRA.bat"
$IconPath = "C:\Sandra-IA-8.0-Pro\desktop-app\assets\icon.ico"

# Crear objeto WshShell
$WshShell = New-Object -ComObject WScript.Shell

# Crear el atajo
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $BatPath
$Shortcut.WorkingDirectory = "C:\Sandra-IA-8.0-Pro"
$Shortcut.Description = "Sandra IA 8.0 Pro - Aplicación Offline"
$Shortcut.WindowStyle = 1  # Normal window

# Asignar icono si existe
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = $IconPath
}

# Guardar
$Shortcut.Save()

Write-Host "✅ Acceso directo creado en: $DesktopPath" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes hacer doble clic en 'Sandra IA 8.0 Pro' en el Escritorio" -ForegroundColor Yellow

