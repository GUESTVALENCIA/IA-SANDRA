@echo off
REM Script para preparar deploy a GitHub (GRATIS) - Windows

echo.
echo ========================================
echo   PREPARAR DEPLOY GRATIS A GITHUB
echo ========================================
echo.

REM Verificar que estamos en repo git
if not exist ".git" (
    echo Error: No es un repositorio git
    echo Ejecutar: git init
    pause
    exit /b 1
)

REM Verificar si hay remote
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo Remote configurado:
    git remote get-url origin
    echo.
    echo Hacer push ahora? (s/n)
    set /p answer=
    if /i "%answer%"=="s" (
        echo.
        echo Haciendo push a GitHub...
        git push origin main 2>nul || git push origin master 2>nul
        if %errorlevel% equ 0 (
            echo.
            echo Push completado
            echo Netlify hara deploy automatico GRATIS
        ) else (
            echo.
            echo Error al hacer push
        )
    )
) else (
    echo No hay remote configurado
    echo.
    echo Para configurar:
    echo   git remote add origin https://github.com/USUARIO/REPO.git
    echo.
    echo Luego ejecutar este script de nuevo
)

echo.
pause

