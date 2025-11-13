@echo off
color 0A
cls
echo.
echo   ███████╗ █████╗ ███╗   ██╗██████╗ ██████╗  █████╗ 
echo   ██╔════╝██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔══██╗
echo   ███████╗███████║██╔██╗ ██║██║  ██║██████╔╝███████║
echo   ╚════██║██╔══██║██║╚██╗██║██║  ██║██╔══██╗██╔══██║
echo   ███████║██║  ██║██║ ╚████║██████╔╝██║  ██║██║  ██║
echo   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
echo.
echo   IA 8.0 PRO - INICIO RÁPIDO
echo.
echo ======================================================
echo.

REM --- Verificar Node.js ---
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado o no está en el PATH
    echo Descarga Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM --- Ir a directorio del proyecto ---
cd /d C:\Sandra-IA-8.0-Pro
if %errorlevel% neq 0 (
    echo [ERROR] No se encontró el directorio C:\Sandra-IA-8.0-Pro
    pause
    exit /b 1
)

REM --- Menu principal ---
:menu
cls
echo.
echo   SANDRA IA 8.0 PRO - MENU PRINCIPAL
echo.
echo ======================================================
echo.
echo   1. Iniciar aplicacion (Electron)
echo   2. Iniciar servidor MCP
echo   3. Iniciar ambos servicios
echo   4. Instalar dependencias
echo   5. Ver estado del sistema
echo   6. Limpiar archivos temporales
echo   7. Crear punto de restauracion
echo   8. Restaurar desde backup
echo   9. Validar instalacion
echo   0. Salir
echo.
echo ======================================================
echo.
set /p OPCION="Selecciona una opcion (0-9): "

if "%OPCION%"=="1" goto start_electron
if "%OPCION%"=="2" goto start_mcp
if "%OPCION%"=="3" goto start_both
if "%OPCION%"=="4" goto install_deps
if "%OPCION%"=="5" goto check_status
if "%OPCION%"=="6" goto clean_temp
if "%OPCION%"=="7" goto create_restore
if "%OPCION%"=="8" goto restore_backup
if "%OPCION%"=="9" goto validate
if "%OPCION%"=="0" goto exit_app
goto menu

:start_electron
echo.
echo Iniciando aplicacion Electron...
start "Sandra IA 8.0" npm start
goto menu

:start_mcp
echo.
echo Iniciando servidor MCP...
start "MCP Server" npm run start:mcp
goto menu

:start_both
echo.
echo Iniciando ambos servicios...
start "MCP Server" npm run start:mcp
timeout /t 2 >nul
start "Sandra IA 8.0" npm start
echo Servicios iniciados. Espera a que se abran las ventanas...
timeout /t 5 >nul
goto menu

:install_deps
echo.
echo Instalando dependencias...
call npm install
echo.
echo Dependencias instaladas exitosamente
pause
goto menu

:check_status
echo.
echo Verificando estado del sistema...
netstat -ano 2>nul | findstr ":9080\|:3000\|:8765" >nul
if %errorlevel% equ 0 (
    echo   [OK] Servicios activos detectados
) else (
    echo   [--] No se detectaron servicios activos
)
echo.
pause
goto menu

:clean_temp
echo.
echo Limpiando archivos temporales...
del /f /q *.log *.tmp *.bak 2>nul
echo Limpieza completada
pause
goto menu

:create_restore
echo.
echo Creando punto de restauracion...
set RESTORE_DIR=C:\Sandra_Restore_Points
if not exist "%RESTORE_DIR%" mkdir "%RESTORE_DIR%"
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set RESTORE_FILE="%RESTORE_DIR%\Sandra_!mydate!_!mytime!.zip"
powershell -Command "Compress-Archive -Path 'C:\Sandra-IA-8.0-Pro' -DestinationPath %RESTORE_FILE% -Force" 2>nul
echo Punto de restauracion creado: %RESTORE_FILE%
pause
goto menu

:restore_backup
echo.
call C:\Sandra-IA-8.0-Pro\Restore_System.bat
goto menu

:validate
echo.
echo Validando instalacion...
echo.
echo Verificando Node.js...
node -v
echo.
echo Verificando npm...
npm -v
echo.
echo Verificando dependencias criticas...
npm list electron @octokit/rest pg 2>nul | findstr "electron\|@octokit\|pg" >nul
if %errorlevel% equ 0 (
    echo   [OK] Dependencias criticas instaladas
) else (
    echo   [!] Algunas dependencias faltan
    echo   Ejecuta la opcion 4 para instalarlas
)
echo.
pause
goto menu

:exit_app
echo.
echo Saliendo...
exit /b 0

