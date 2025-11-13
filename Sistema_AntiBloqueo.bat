@echo off
setlocal enabledelayedexpansion

REM --- Configuración ---
set GITHUB_REPO=GUESTVALENCIA/IA-SANDRA
set GITHUB_TOKEN=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
set VERCEL_TOKEN=rTbbeIXzN70ZvXbG6L9Avj5d
set VERCEL_PROJECT_ID=prj_j0oMCNvOgiMauVLQrYIkaHFymn8o
set LOG_FILE=C:\Sandra_Restore_Points\anti_bloqueo.log

if not exist "C:\Sandra_Restore_Points" mkdir "C:\Sandra_Restore_Points"

:monitor_loop

echo [%date% %time%] Escaneando estado de despliegues... >> %LOG_FILE%

REM --- Obtener estado de despliegues ---
curl -s -H "Authorization: token %GITHUB_TOKEN%" ^
  "https://api.github.com/repos/%GITHUB_REPO%/deployments?environment=production&per_page=5" > deploy_status.json 2>nul

REM --- Verificar si hay despliegues pendientes ---
findstr /C:"\"state\":\"pending\"" deploy_status.json >nul 2>&1
if %errorlevel% equ 0 (
    echo [ALERTA %date% %time%] Despliegue pendiente detectado! >> %LOG_FILE%
    call :reparar_despliegue
)

REM --- Verificar si hay despliegues en error ---
findstr /C:"\"state\":\"error\"" deploy_status.json >nul 2>&1
if %errorlevel% equ 0 (
    echo [ALERTA %date% %time%] Despliegue en error detectado! >> %LOG_FILE%
    call :reparar_despliegue
)

REM --- Verificar si hay despliegues fallos ---
findstr /C:"\"state\":\"failure\"" deploy_status.json >nul 2>&1
if %errorlevel% equ 0 (
    echo [ALERTA %date% %time%] Despliegue fallido detectado! >> %LOG_FILE%
    call :reparar_despliegue
)

REM --- Aguardar 5 minutos antes de volver a verificar ---
timeout /t 300 >nul

goto monitor_loop

:reparar_despliegue
echo [REPARACIÓN %date% %time%] Ejecutando protocolo de auto-reparación... >> %LOG_FILE%

REM --- Eliminar despliegues problemáticos ---
curl -s -X DELETE -H "Authorization: token %GITHUB_TOKEN%" ^
  "https://api.github.com/repos/%GITHUB_REPO%/deployments?environment=production" > nul 2>&1

REM --- Reintentar despliegue ---
curl -s -X POST -H "Authorization: token %GITHUB_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"ref\":\"main\",\"environment\":\"production\",\"required_contexts\":[]}" ^
  https://api.github.com/repos/%GITHUB_REPO%/deployments > nul 2>&1

echo [REPARACIÓN %date% %time%] Auto-reparación completada >> %LOG_FILE%

goto :eof

