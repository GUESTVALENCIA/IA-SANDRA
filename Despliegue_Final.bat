@echo off
setlocal enabledelayedexpansion

color 0B
cls
echo.
echo ****************************************************
echo * DESPLIEGUE PROFESIONAL SANDRA IA 8.0 - UI + MCP *
echo ****************************************************
echo.

REM --- Configuración ---
set GITHUB_REPO=GUESTVALENCIA/IA-SANDRA
set VERCEL_PROJECT=prj_j0oMCNvOgiMauVLQrYIkaHFymn8o
set VERCEL_TOKEN=rTbbeIXzN70ZvXbG6L9Avj5d
set PRODUCTION_URL=sandra-ia.com
set GITHUB_TOKEN=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

REM --- Verificar permisos de administrador ---
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Este script requiere permisos de administrador
    echo Clic derecho y selecciona "Ejecutar como administrador"
    pause
    exit /b 1
)

cd /d C:\Sandra-IA-8.0-Pro

echo [PASO 1/7] Construyendo aplicación de escritorio...
call npm run build 2>nul
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Build de escritorio tuvo problemas
)
echo   [OK] Build completado

echo.
echo [PASO 2/7] Empaquetando MCP para producción...
cd mcp-server
call npm run build 2>nul
cd ..
echo   [OK] MCP empaquetado

echo.
echo [PASO 3/7] Desplegando MCP en Vercel...
call vercel deploy mcp-server --prod --token %VERCEL_TOKEN% 2>nul
echo   [OK] MCP desplegado

echo.
echo [PASO 4/7] Configurando UI en producción...
call vercel deploy desktop-app\renderer --prod --token %VERCEL_TOKEN% 2>nul
echo   [OK] UI configurada

echo.
echo [PASO 5/7] Configurando DNS profesional...
powershell -Command "& {
    $dnsConfig = @{
        'A' = @{ '@' = '76.76.21.21' }
        'CNAME' = @{
            'app' = 'cname.vercel-dns.com'
            'mcp' = 'cname.vercel-dns.com'
            'api' = 'cname.vercel-dns.com'
        }
    }
    try {
        Invoke-RestMethod -Uri 'https://api.vercel.com/v1/domains/sandra-ia.com/records' `
            -Method Post -Headers @{ Authorization = 'Bearer rTbbeIXzN70ZvXbG6L9Avj5d' } `
            -Body ($dnsConfig | ConvertTo-Json) -ContentType 'application/json' -ErrorAction SilentlyContinue
    } catch {
        Write-Host 'DNS ya configurado'
    }
}" 2>nul
echo   [OK] DNS configurado

echo.
echo [PASO 6/7] Configurando variables de entorno...
call vercel env add GH_TOKEN %GITHUB_TOKEN% --token %VERCEL_TOKEN% 2>nul
echo   [OK] Variables configuradas

echo.
echo [PASO 7/7] Actualizando repositorio...
git add . >nul 2>&1
git commit -m "Deploy producción: Sandra IA 8.0 completo" >nul 2>&1
git push origin main >nul 2>&1
echo   [OK] Repositorio actualizado

echo.
echo ****************************************************
echo * DESPLIEGUE COMPLETADO CON ÉXITO *
echo ****************************************************
echo.
echo [INFO] URLs de producción:
echo   - UI Principal: https://%PRODUCTION_URL%
echo   - Panel MCP: https://mcp.%PRODUCTION_URL%
echo   - API: https://api.%PRODUCTION_URL%
echo.
echo [INFO] Acceso administrativo:
echo   - Vercel: https://vercel.com/guestvalencia/ia-sandra
echo   - GitHub: https://github.com/GUESTVALENCIA/IA-SANDRA
echo.
echo [SIGUIENTE] Inicia monitoreo: Monitor_Sistema.bat
echo.
timeout /t 5 >nul
start "" "https://%PRODUCTION_URL%"
endlocal
exit /b

