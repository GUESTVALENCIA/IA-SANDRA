@echo off
echo ========================================
echo  VERIFICACION DE EMORE
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando instalacion de EMORE...
echo.

if exist "emore-engine\inference.py" (
    echo [OK] EMORE clonado correctamente
) else (
    echo [ERROR] EMORE no esta clonado
    echo Ejecuta: INSTALAR_EMORE.bat
    pause
    exit /b 1
)

if exist "emore-engine\checkpoints\emore.pth" (
    echo [OK] Modelo emore.pth descargado
    for %%A in ("emore-engine\checkpoints\emore.pth") do echo      Tamano: %%~zA bytes
) else (
    echo [ERROR] Modelo emore.pth no encontrado
    echo Ejecuta: INSTALAR_EMORE.bat
    pause
    exit /b 1
)

echo.
echo ========================================
echo  EMORE INSTALADO CORRECTAMENTE
echo ========================================
echo.
echo Sandra IA usara lip-sync avanzado
echo.
pause

