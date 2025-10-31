@echo off
echo.
echo === ACTUALIZANDO app.asar ===
echo.

REM Verificar que estemos en el directorio correcto
if not exist "main.js" (
    echo Error: main.js no encontrado. Ejecuta este script desde extracted_app/
    pause
    exit /b 1
)

REM Verificar que app.asar existe
if not exist "..\resources\app.asar" (
    echo Error: app.asar no encontrado en ..\resources\
    pause
    exit /b 1
)

REM Verificar/instalar asar
where asar >nul 2>&1
if errorlevel 1 (
    echo Instalando asar globalmente...
    call npm install -g asar
    if errorlevel 1 (
        echo Error instalando asar. Ejecuta manualmente: npm install -g asar
        pause
        exit /b 1
    )
)

echo.
echo Extrayendo app.asar...
if exist "..\resources\app_extracted" (
    rmdir /s /q "..\resources\app_extracted"
)
call asar extract "..\resources\app.asar" "..\resources\app_extracted"

echo.
echo Copiando nuevo main.js...
copy /y "main.js" "..\resources\app_extracted\main.js" >nul

echo.
echo Creando backup...
if exist "..\resources\app.asar.backup" (
    del /q "..\resources\app.asar.backup"
)
copy /y "..\resources\app.asar" "..\resources\app.asar.backup" >nul

echo.
echo Re-empaquetando...
call asar pack "..\resources\app_extracted" "..\resources\app.asar.new"

echo.
echo Reemplazando app.asar...
del /q "..\resources\app.asar"
ren "..\resources\app.asar.new" "app.asar"

echo.
echo Limpiando archivos temporales...
rmdir /s /q "..\resources\app_extracted"

echo.
echo ========================================
echo app.asar actualizado exitosamente!
echo ========================================
echo.
echo Reinicia la aplicacion para que los cambios surtan efecto.
echo.
pause

