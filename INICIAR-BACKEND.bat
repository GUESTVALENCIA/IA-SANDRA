@echo off
cls
echo.
echo ========================================
echo   SANDRA PROFESSIONAL - BACKEND
echo   Iniciando servidor con SDKs reales
echo ========================================
echo.
cd /d "%~dp0"
echo [%time%] Verificando Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    pause
    exit /b 1
)
echo [%time%] Node.js detectado
echo [%time%] Verificando dependencias...
if not exist "node_modules\" (
    echo [%time%] Instalando dependencias...
    call npm install
)
echo [%time%] Iniciando servidor en puerto 5000...
echo.
echo Servicios integrados:
echo   - Claude Sonnet 4.5 (Anthropic)
echo   - GPT-4o (OpenAI)
echo   - Groq (Llama)
echo   - ElevenLabs TTS
echo   - Deepgram STT
echo   - Cartesia TTS
echo   - HeyGen Video
echo   - Supabase
echo   - Airtable
echo   - PayPal
echo   - Twilio / WhatsApp
echo   - Meta WhatsApp Business
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
node backend/server.js
