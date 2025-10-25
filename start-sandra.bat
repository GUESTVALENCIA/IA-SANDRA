@echo off
echo ========================================
echo     SANDRA DEV INTERFACE - GALAXY 7.0
echo ========================================
echo.

echo Verificando Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit
)

echo OK - Node.js instalado
echo.

echo Instalando dependencias...
call npm install --silent

echo.
echo Iniciando Sandra MCP Bridge...
start /B node sandra-mcp-bridge.js

timeout /t 3 /nobreak >nul

echo.
echo Abriendo Sandra Interface...
start sandra-interface.html

echo.
echo ========================================
echo   Sandra Dev Interface esta activa!
echo   Puerto: http://localhost:7777
echo   Presiona Ctrl+C para detener
echo ========================================

pause