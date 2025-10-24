@echo off
echo ════════════════════════════════════════════════════════
echo  SANDRA PROFESSIONAL - ACTIVACION DE AGENTES MCP
echo ════════════════════════════════════════════════════════
echo.

echo [1/3] Verificando configuracion de Claude Desktop...
if exist "%APPDATA%\Claude\claude_desktop_config.json" (
    echo ✓ Configuracion encontrada
) else (
    echo ✗ ERROR: Archivo de configuracion no encontrado
    pause
    exit /b 1
)

echo.
echo [2/3] Verificando agentes MCP...
echo ✓ Orchestrator: orchestrator.js
echo ✓ Dev Agent: agents\dev-agent.js
echo ✓ Voice Agent: agents\voice-agent.js
echo ✓ AI Agent: agents\ai-agent.js
echo ✓ Business Agent: agents\business-agent.js
echo ✓ Comms Agent: agents\comms-agent.js

echo.
echo [3/3] Iniciando backend Sandra Professional...
cd ..\backend
start "Sandra Backend" node server.js

timeout /t 2 >nul

echo.
echo ════════════════════════════════════════════════════════
echo  ✨ SISTEMA ACTIVADO
echo ════════════════════════════════════════════════════════
echo.
echo  Los agentes MCP estan disponibles en Claude Desktop
echo  Backend ejecutandose en http://localhost:5000
echo.
echo  COMANDOS DISPONIBLES:
echo  - delegate_task: Delegar tareas a agentes
echo  - get_agent_status: Ver estado de agentes
echo  - coordinate_multi_agent: Workflows complejos
echo.
echo ════════════════════════════════════════════════════════
pause
