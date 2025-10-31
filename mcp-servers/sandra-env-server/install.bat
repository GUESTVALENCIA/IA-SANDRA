@echo off
echo ========================================
echo Sandra Environment MCP Server Installer
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo Node.js found!

echo [2/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed!

echo [3/3] Creating configuration...
echo.
echo Please add this to your Cursor MCP configuration:
echo.
echo {
echo   "mcpServers": {
echo     "sandra-env": {
echo       "command": "node",
echo       "args": [
echo         "%CD%\index.js"
echo       ]
echo     }
echo   }
echo }
echo.
echo Configuration file location:
echo %APPDATA%\Cursor\User\globalStorage\mcp.json
echo.

echo Installation complete!
pause

