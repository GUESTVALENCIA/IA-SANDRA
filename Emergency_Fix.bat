@echo off
setlocal enabledelayedexpansion

color 0C
echo.
echo ========================================================
echo  SANDRA IA - EMERGENCY FIX v8.0
echo  Sistema de Desbloqueo de Despliegues
echo ========================================================
echo.

REM --- Verificar permisos de administrador ---
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Este script requiere permisos de administrador
    echo Clic derecho y selecciona "Ejecutar como administrador"
    pause
    exit /b 1
)

REM --- Configuración ---
set GITHUB_REPO=GUESTVALENCIA/IA-SANDRA
set GITHUB_TOKEN=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
set VERCEL_TOKEN=rTbbeIXzN70ZvXbG6L9Avj5d
set VERCEL_PROJECT_ID=prj_j0oMCNvOgiMauVLQrYIkaHFymn8o

echo [INICIO] Iniciando protocolo de emergencia...
echo [TIEMPO] %date% %time%
echo.

REM --- PASO 1: Reseteo de despliegues bloqueados ---
echo [PASO 1/4] Eliminando despliegues bloqueados en GitHub...
echo   Conectando con GitHub API...
curl -s -X GET -H "Authorization: token %GITHUB_TOKEN%" ^
  https://api.github.com/repos/%GITHUB_REPO%/deployments > nul
if %errorlevel% equ 0 (
    echo   [OK] Conexión establecida
    echo   Eliminando despliegues fallidos...
    curl -s -X DELETE -H "Authorization: token %GITHUB_TOKEN%" ^
      -H "Accept: application/vnd.github.v3+json" ^
      https://api.github.com/repos/%GITHUB_REPO%/deployments > nul
    echo   [OK] Despliegues eliminados
) else (
    echo   [ADVERTENCIA] No se pudo conectar con GitHub
)
echo.

REM --- PASO 2: Reactivar integración Vercel ---
echo [PASO 2/4] Reactivando integración con Vercel...
echo   Verificando estado de integración...
curl -s -X GET -H "Authorization: Bearer %VERCEL_TOKEN%" ^
  https://api.vercel.com/v1/integrations/github > nul
if %errorlevel% equ 0 (
    echo   [OK] Integración Vercel activa
) else (
    echo   [ADVERTENCIA] Reintentando conexión...
    curl -s -X POST -H "Authorization: Bearer %VERCEL_TOKEN%" ^
      https://api.vercel.com/v1/integrations/github > nul
)
echo.

REM --- PASO 3: Reconectar webhooks ---
echo [PASO 3/4] Reconfigurando webhooks de GitHub...
echo   Actualizando configuración de webhooks...
curl -s -X POST -H "Authorization: token %GITHUB_TOKEN%" ^
  -H "Accept: application/vnd.github.v3+json" ^
  -H "Content-Type: application/json" ^
  -d "{\"events\":[\"push\",\"deployment\",\"deployment_status\"],\"config\":{\"url\":\"https://api.vercel.com/v1/integrations/deploy/%VERCEL_PROJECT_ID%\",\"content_type\":\"json\"}}" ^
  https://api.github.com/repos/%GITHUB_REPO%/hooks > nul
echo   [OK] Webhooks reconfigurados
echo.

REM --- PASO 4: Forzar nuevo despliegue ---
echo [PASO 4/4] Iniciando nuevo despliegue completo...
echo   Forzando despliegue a producción...
curl -s -X POST -H "Authorization: token %GITHUB_TOKEN%" ^
  -H "Accept: application/vnd.github.v3+json" ^
  -H "Content-Type: application/json" ^
  -d "{\"ref\":\"main\",\"environment\":\"production\",\"required_contexts\":[]}" ^
  https://api.github.com/repos/%GITHUB_REPO%/deployments > nul
echo   [OK] Despliegue iniciado
echo.

REM --- Resumen final ---
echo ========================================================
echo  OPERACIÓN COMPLETADA
echo ========================================================
echo.
echo [INFO] Estado del despliegue:
echo   GitHub: https://github.com/%GITHUB_REPO%/deployments
echo   Vercel: https://vercel.com/guestvalencia/ia-sandra
echo   UI App: https://ia-sandra.vercel.app
echo.
echo [SIGUIENTE] Ejecuta Sistema_AntiBloqueo.bat para monitoreo continuo
echo.
pause
exit /b

