@echo off
echo.
echo ================================================
echo   ACTUALIZANDO app.asar CON NUEVO HANDLER
echo ================================================
echo.
echo IMPORTANTE: Cierra Sandra DevConsole antes de continuar
echo.
pause

cd /d "%~dp0\.."

echo.
echo Extrayendo app.asar...
npx --yes asar extract "resources\app.asar" "resources\app_extracted"
if errorlevel 1 (
    echo Error extrayendo app.asar
    pause
    exit /b 1
)

echo.
echo Copiando nuevo main.js...
copy /y "extracted_app\main.js" "resources\app_extracted\main.js" >nul
if errorlevel 1 (
    echo Error copiando main.js
    pause
    exit /b 1
)

echo.
echo Creando backup...
copy /y "resources\app.asar" "resources\app.asar.backup" >nul

echo.
echo Re-empaquetando...
npx --yes asar pack "resources\app_extracted" "resources\app.asar.new"
if errorlevel 1 (
    echo Error re-empaquetando
    pause
    exit /b 1
)

echo.
echo Reemplazando app.asar...
move /y "resources\app.asar.new" "resources\app.asar"
if errorlevel 1 (
    echo Error reemplazando app.asar
    pause
    exit /b 1
)

echo.
echo Limpiando archivos temporales...
rmdir /s /q "resources\app_extracted"

echo.
echo ================================================
echo   ✅✅✅ app.asar ACTUALIZADO EXITOSAMENTE!
echo ================================================
echo.
echo Reinicia la aplicacion para que los cambios surtan efecto.
echo.
pause

