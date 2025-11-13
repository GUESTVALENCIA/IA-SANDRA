@echo off
setlocal enabledelayedexpansion

color 0A
cls
echo.
echo ****************************************************
echo *    MONITOR UNIFICADO - SANDRA IA 8.0 PRO       *
echo ****************************************************
echo.

set PRODUCTION_URL=sandra-ia.com
set LOG_FILE=C:\Sandra_Restore_Points\monitor_sistema.log
set CHECK_INTERVAL=30

if not exist "C:\Sandra_Restore_Points" mkdir "C:\Sandra_Restore_Points"

echo [%date% %time%] Monitor iniciado >> %LOG_FILE%

:monitor_loop

cls
echo ****************************************************
echo *    MONITOR UNIFICADO - SANDRA IA 8.0 PRO       *
echo ****************************************************
echo.
echo [VERIFICACIÓN A LAS %time%]
echo.

REM --- Verificar UI Principal ---
echo Verificando Sandra IA - UI...
curl -s -I "https://%PRODUCTION_URL%" | find "200" >nul
if %errorlevel% equ 0 (
    echo   [OK] UI Principal operativa
    echo [%time%] UI: OK >> %LOG_FILE%
) else (
    echo   [ERROR] UI Principal caída!
    echo [%time%] UI: CAÍDA - Iniciando recuperación >> %LOG_FILE%
    call :recover_ui
)

REM --- Verificar MCP ---
echo Verificando Sandra IA - MCP...
curl -s -I "https://mcp.%PRODUCTION_URL%" | find "200" >nul
if %errorlevel% equ 0 (
    echo   [OK] MCP operativo
    echo [%time%] MCP: OK >> %LOG_FILE%
) else (
    echo   [ERROR] MCP caído!
    echo [%time%] MCP: CAÍDA - Iniciando recuperación >> %LOG_FILE%
    call :recover_mcp
)

REM --- Verificar API ---
echo Verificando Sandra IA - API...
curl -s -I "https://api.%PRODUCTION_URL%/health" | find "200" >nul
if %errorlevel% equ 0 (
    echo   [OK] API operativa
    echo [%time%] API: OK >> %LOG_FILE%
) else (
    echo   [ERROR] API caída!
    echo [%time%] API: CAÍDA - Iniciando recuperación >> %LOG_FILE%
    call :recover_api
)

echo.
echo [Estado general guardado en: %LOG_FILE%]
echo.
echo [Próxima verificación en %CHECK_INTERVAL% segundos...]
echo.

timeout /t %CHECK_INTERVAL% >nul
goto monitor_loop

:recover_ui
echo   Recuperando UI...
cd /d C:\Sandra-IA-8.0-Pro
start "Recovery UI" npm start
timeout /t 10 >nul
exit /b

:recover_mcp
echo   Recuperando MCP...
cd /d C:\Sandra-IA-8.0-Pro
start "Recovery MCP" npm run start:mcp
timeout /t 10 >nul
exit /b

:recover_api
echo   Recuperando API...
cd /d C:\Sandra-IA-8.0-Pro
call vercel deploy mcp-server --prod
timeout /t 10 >nul
exit /b

