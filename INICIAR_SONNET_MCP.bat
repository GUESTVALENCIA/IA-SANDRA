@echo off
echo ========================================
echo  INICIANDO MCP SERVER PARA SONNET 4.5+
echo ========================================
echo.
echo Configurando acceso completo...
echo.

cd /d "C:\Sandra-IA-8.0-Pro"

echo [1/3] Verificando servidor MCP...
node mcp-server/mcp-sonnet-full-access.js

pause

