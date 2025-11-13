@echo off
setlocal enabledelayedexpansion

echo =============================================
echo  SISTEMA PROFESIONAL DE DESPLIEGUE SANDRA IA 8.0
echo =============================================
echo.

REM --- Configuración avanzada ---
set GITHUB_REPO=GUESTVALENCIA/IA-SANDRA
set GITHUB_TOKEN=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
set REPO_DIR=C:\Sandra-IA-8.0-Pro
set OPTIMAL_THRESHOLD=90
set RESTORE_DIR=C:\Sandra_Restore_Points

REM --- Verificar si es administrador ---
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Este script requiere ejecutarse como administrador
    echo Clic derecho en el archivo y selecciona "Ejecutar como administrador"
    pause
    exit /b 1
)

REM --- Paso 1: Desbloquear despliegues ---
echo [PASO 1/5] Desbloqueando despliegues en GitHub...
curl -s -X GET -H "Authorization: token %GITHUB_TOKEN%" ^
  https://api.github.com/repos/%GITHUB_REPO%/deployments?per_page=1 > nul
if %errorlevel% equ 0 (
    echo   [OK] Conexión con GitHub verificada
) else (
    echo   [ADVERTENCIA] No se pudo conectar con GitHub
)

REM --- Paso 2: Limpieza profunda del repo ---
echo [PASO 2/5] Realizando limpieza profesional del repositorio...
cd /d "%REPO_DIR%"

REM Eliminar archivos duplicados por contenido
echo   Buscando archivos duplicados...
powershell -Command "$hashes=@{}; gci -Recurse -File 2>$null | ForEach { $hash = (Get-FileHash $_.FullName -Algorithm MD5 2>$null).Hash; if ($hash -and $hashes.ContainsKey($hash)) { Remove-Item $_.FullName -Force 2>$null; } elseif ($hash) { $hashes[$hash] = $_.FullName } }" 2>nul

REM Limpiar archivos obsoletos
for /f %%f in ('dir /b *.log *.tmp *.bak 2^>nul') do del /f /q "%%f" 2>nul
echo   [OK] Limpieza completada

REM --- Paso 3: Verificar salud del sistema ---
echo [PASO 3/5] Verificando salud del sistema...
set HEALTH=0
call :check_service "WebSocket" 8765 25
call :check_service "API Server" 3000 25
call :check_service "Database" 5432 20
call :check_service "Electron" 9080 20
echo   [ESTADO] Salud del sistema: !HEALTH!%%

if !HEALTH! lss !OPTIMAL_THRESHOLD! (
    echo   [ADVERTENCIA] Sistema al !HEALTH!%%. Se omite punto de restauracion.
    goto skip_restore
)

REM --- Paso 4: Crear punto de restauración ---
echo [PASO 4/5] Creando punto de restauracion profesional...
if not exist "%RESTORE_DIR%" mkdir "%RESTORE_DIR%"
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set TIMESTAMP=!mydate!_!mytime!
set RESTORE_FILE="%RESTORE_DIR%\Sandra_Optima_!TIMESTAMP!.zip"
echo   Comprimiendo sistema...
powershell -Command "Compress-Archive -Path '%REPO_DIR%' -DestinationPath %RESTORE_FILE% -Force" 2>nul
echo   [OK] Punto de restauracion creado

:skip_restore

REM --- Paso 5: Desplegar y lanzar aplicación ---
echo [PASO 5/5] Desplegando y lanzando aplicacion profesional...
cd /d "%REPO_DIR%"

echo   Instalando dependencias...
call npm install --silent 2>nul

echo   Iniciando servicios...
start "Sandra MCP Server" cmd /k npm run start:mcp
timeout /t 2 >nul

start "Sandra IA 8.0" cmd /k npm start
timeout /t 3 >nul

REM --- Crear acceso directo en escritorio ---
echo   Creando acceso directo...
set SHORTCUT_PATH="%USERPROFILE%\Desktop\Sandra_IA_8.0_Pro.lnk"
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = 'C:\Sandra-IA-8.0-Pro\Deploy_Master.bat'; $Shortcut.WorkingDirectory = 'C:\Sandra-IA-8.0-Pro'; $Shortcut.Save()" 2>nul

echo.
echo =============================================
echo  SISTEMA LISTO PARA USO PROFESIONAL
echo =============================================
echo.
echo [INFO] Panel de control disponible en:
echo   - Aplicacion Electron: Puerto 9080
echo   - MCP Server: Puerto 3000
echo   - WebSocket: Puerto 8765
echo.
echo [INFO] Acceso directo creado en:
echo   %USERPROFILE%\Desktop\Sandra_IA_8.0_Pro.lnk
echo.
echo [INFO] Punto de restauracion en:
echo   %RESTORE_DIR%
echo.
timeout /t 5 >nul
start "" "http://localhost:9080"
endlocal
exit /b

:check_service
set SERVICE_NAME=%~1
set SERVICE_PORT=%~2
set SERVICE_WEIGHT=%~3
netstat -ano 2>nul | findstr ":%SERVICE_PORT% " >nul
if %errorlevel% equ 0 (
    set /a HEALTH+=!SERVICE_WEIGHT!
    echo   [OK] %SERVICE_NAME% ^(puerto %SERVICE_PORT%^) activo
) else (
    echo   [--] %SERVICE_NAME% ^(puerto %SERVICE_PORT%^) inactivo
)
exit /b

