@echo off
echo ========================================
echo Sandra MCP Server - Cursor Configuration
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Installing MCP SDK...
call npm install @modelcontextprotocol/sdk --no-save
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [2/4] Configuring Cursor MCP...
powershell -ExecutionPolicy Bypass -File "%~dp0setup-cursor-mcp.ps1"
if errorlevel 1 (
    echo ERROR: Failed to configure Cursor
    pause
    exit /b 1
)

echo [3/4] Verifying configuration...
if exist "%APPDATA%\Cursor\User\globalStorage\mcp.json" (
    echo Configuration file created successfully!
) else (
    echo WARNING: Configuration file not found at expected location
)

echo [4/4] Setup complete!
echo.
echo IMPORTANT: Restart Cursor for changes to take effect
echo.
pause

