@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo  SISTEMA DE RESTAURACION SANDRA IA 8.0 PRO
echo ===================================================
echo.

REM --- Verificar si es administrador ---
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Este script requiere ejecutarse como administrador
    pause
    exit /b 1
)

set RESTORE_DIR=C:\Sandra_Restore_Points

if not exist "%RESTORE_DIR%" (
    echo [ERROR] No se encontraron puntos de restauracion en %RESTORE_DIR%
    pause
    exit /b 1
)

REM --- Listar puntos de restauración disponibles ---
echo Ultimos puntos de restauracion disponibles:
echo.
set /a COUNT=0
for /f "delims=" %%f in ('dir /b /o-d "%RESTORE_DIR%\*.zip" 2^>nul') do (
    set /a COUNT+=1
    echo !COUNT!. %%f
    set "RESTORE_!COUNT!=%%f"
    if !COUNT! geq 10 goto done_listing
)

:done_listing
echo.
if !COUNT! equ 0 (
    echo [ERROR] No se encontraron puntos de restauracion
    pause
    exit /b 1
)

REM --- Seleccionar punto de restauración ---
set /p SELECTION="Seleccione punto de restauracion (1-%COUNT%, 0 para salir): "

if "%SELECTION%"=="0" exit /b
if %SELECTION% lss 1 (
    echo Seleccion invalida
    pause
    exit /b 1
)
if %SELECTION% gtr !COUNT! (
    echo Seleccion invalida
    pause
    exit /b 1
)

REM --- Obtener archivo seleccionado ---
call set RESTORE_FILE=%%RESTORE_%SELECTION%%%
set RESTORE_PATH="%RESTORE_DIR%\!RESTORE_FILE!"

echo.
echo [RESTAURANDO] Procesando: !RESTORE_FILE!
echo.

REM --- Descomprimir en carpeta temporal ---
set TEMP_RESTORE="%RESTORE_DIR%\Temp_Restore"
if exist !TEMP_RESTORE! rmdir /s /q !TEMP_RESTORE! 2>nul
mkdir !TEMP_RESTORE!

echo   Descomprimiendo archivo...
powershell -Command "Expand-Archive -Path '%RESTORE_PATH%' -DestinationPath !TEMP_RESTORE! -Force" 2>nul

REM --- Restaurar a ubicación original ---
echo   Restaurando sistema...
set REPO_DIR=C:\Sandra-IA-8.0-Pro

REM Hacer backup del sistema actual
set BACKUP_DIR="%RESTORE_DIR%\Backup_Pre_Restore_%date:~-4,4%%date:~-7,2%%date:~-10,2%"
if exist "%REPO_DIR%" (
    echo   Creando backup de sistema actual...
    mkdir !BACKUP_DIR!
    xcopy /E /I /Y "%REPO_DIR%" !BACKUP_DIR! >nul 2>&1
)

REM Copiar archivos restaurados
xcopy /E /I /Y !TEMP_RESTORE!\Sandra-IA-8.0-Pro "%REPO_DIR%" >nul 2>&1

REM Limpiar temporal
rmdir /s /q !TEMP_RESTORE! 2>nul

echo   [OK] Sistema restaurado exitosamente
echo.
echo ===================================================
echo  RESTAURACION COMPLETADA
echo ===================================================
echo.
echo [INFO] El sistema ha sido restaurado correctamente
echo [INFO] Backup de sistema actual guardado en: !BACKUP_DIR!
echo [INFO] Reinicie la aplicacion para aplicar cambios
echo.
pause
exit /b

