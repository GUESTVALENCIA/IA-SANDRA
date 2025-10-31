@echo off
REM Script para subir variables de entorno a Netlify usando Netlify CLI (Windows)
REM Requiere: npm install -g netlify-cli
REM Uso: upload-env-to-netlify-cli.bat

cd /d "%~dp0\.."

echo.
echo ========================================
echo   SUBIR VARIABLES A NETLIFY (CLI)
echo ========================================
echo.

REM Verificar que netlify CLI está instalado
where netlify >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Netlify CLI no encontrado
    echo.
    echo Instalar con:
    echo   npm install -g netlify-cli
    echo.
    pause
    exit /b 1
)

REM Verificar que .env existe
if not exist ".env" (
    if not exist ".env.production" (
        echo Error: Archivo .env no encontrado
        echo Crea .env o .env.production con tus API keys
        pause
        exit /b 1
    )
)

REM Determinar archivo .env
set ENV_FILE=
if exist ".env.production" (
    set ENV_FILE=.env.production
) else if exist ".env" (
    set ENV_FILE=.env
)

echo [INFO] Usando archivo: %ENV_FILE%
echo.

REM Verificar autenticación
echo Verificando autenticacion...
netlify status >nul 2>&1
if %errorlevel% neq 0 (
    echo No autenticado en Netlify
    echo Ejecutando: netlify login
    netlify login
)

REM Verificar link del sitio
echo Verificando link del sitio...
netlify status >nul 2>&1
if %errorlevel% neq 0 (
    echo Sitio no linkeado
    echo Ejecutando: netlify link
    netlify link
)

echo.
echo Subiendo variables de entorno...
echo.

REM Subir variables desde .env
set SUCCESS=0
set ERRORS=0

for /f "tokens=1,* delims==" %%a in ('type "%ENV_FILE%"') do (
    set "line=%%a"
    set "key=%%a"
    set "value=%%b"
    
    REM Ignorar comentarios y líneas vacías
    echo !line! | findstr /b /c:"#" >nul
    if !errorlevel! equ 0 goto :next
    
    if "!key!"=="" goto :next
    
    REM Remover espacios
    set "key=!key: =!"
    set "value=!value: =!"
    
    REM Verificar que tiene valor
    if "!value!"=="" goto :next
    
    echo -n   Subiendo !key!... 
    
    REM Subir variable
    netlify env:set "!key!" "!value!" --production >nul 2>&1
    if !errorlevel! equ 0 (
        echo OK
        set /a SUCCESS+=1
    ) else (
        echo ERROR
        set /a ERRORS+=1
    )
    
    REM Pequeño delay
    timeout /t 1 /nobreak >nul
    
    :next
)

echo.
echo ========================================
echo   RESULTADO
echo ========================================
echo   OK: %SUCCESS%
echo   ERRORES: %ERRORS%
echo.
echo Verificar en Netlify Dashboard
echo.

if %ERRORS% equ 0 (
    echo Todas las variables subidas correctamente
    pause
    exit /b 0
) else (
    echo Algunas variables tuvieron errores
    pause
    exit /b 1
)

