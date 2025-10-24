@echo off
title SANDRA MCP LAUNCHER
cd /d %~dp0mcp
start ORCHESTRATOR cmd /k node orchestrator.js
timeout /t 2 >nul
start DEV cmd /k node agents\dev-agent.js
start VOICE cmd /k node agents\voice-agent.js
start AI cmd /k node agents\ai-agent.js
start BUSINESS cmd /k node agents\business-agent.js
start COMMS cmd /k node agents\comms-agent.js
echo.
echo SISTEMA SANDRA ACTIVO
pause
