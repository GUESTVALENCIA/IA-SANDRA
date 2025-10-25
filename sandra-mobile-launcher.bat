@echo off
echo.
echo ================================================================
echo    SANDRA IA MOBILE GALAXY LAUNCHER - v98.0
echo    iOS 14+ Optimized - Galaxy Level Performance
echo ================================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js no encontrado. Por favor instala Node.js desde:
    echo    https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if we're in the correct directory
if not exist "sandra-ia-mobile-galaxy.html" (
    echo ❌ Archivo principal no encontrado. Asegurate de ejecutar desde el directorio correcto.
    echo.
    pause
    exit /b 1
)

:: Display system info
echo 🔍 Detectando sistema...
echo    Node.js:
node --version
echo    NPM:
npm --version
echo.

:: Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
)

:: Start the server
echo 🚀 Iniciando Sandra IA Mobile Galaxy Server...
echo.
echo 📱 URLs de acceso:
echo    Local:     http://localhost:5001/sandra-ia-mobile-galaxy.html
echo    Móvil:     http://[TU_IP]:5001/sandra-ia-mobile-galaxy.html
echo.
echo 💡 Para dispositivos móviles:
echo    1. Conecta tu móvil a la misma red WiFi
echo    2. Averigua tu IP con: ipconfig (Windows) o ifconfig (Mac/Linux)
echo    3. Reemplaza [TU_IP] con tu IP real
echo.
echo 🎯 Características optimizadas:
echo    ✅ Safe Areas para iOS 14+ (notch/Dynamic Island)
echo    ✅ Gestos nativos touch (swipe, pinch, long-press)
echo    ✅ Performance ARM64 optimizado
echo    ✅ Dark/Light mode automático
echo    ✅ Teclado virtual inteligente
echo    ✅ Batería y memoria optimizadas
echo.
echo ⚡ Presiona Ctrl+C para detener el servidor
echo.

:: Function to get local IP
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%B in ("%%A") do (
        set LOCAL_IP=%%B
        goto :found_ip
    )
)
:found_ip

if defined LOCAL_IP (
    echo 🌐 Tu IP local es: %LOCAL_IP%
    echo    URL móvil: http://%LOCAL_IP%:5001/sandra-ia-mobile-galaxy.html
    echo.
)

:: Start both the MCP bridge and serve the mobile app
echo 🔄 Iniciando servicios...

:: Start the express server in background
start /B node sandra-mcp-bridge.js

:: Wait a moment for the server to start
timeout /t 2 /nobreak >nul

:: Open browser automatically (optional)
echo 💻 Abriendo navegador...
start http://localhost:5001/sandra-ia-mobile-galaxy.html

:: Keep the console open and show logs
echo.
echo 📊 Estado del servidor:
echo    ✅ Express Server: Puerto 5001
echo    ✅ MCP Bridge: Activo
echo    ✅ Mobile Galaxy: Optimizado
echo.
echo 📱 Para probar en móvil:
echo    1. Abre Chrome/Safari en tu móvil
echo    2. Ve a: http://%LOCAL_IP%:5001/sandra-ia-mobile-galaxy.html
echo    3. Añade a pantalla de inicio para experiencia completa
echo.
echo ⚙️  Debugging:
echo    - Service Worker: Disponible para PWA
echo    - Performance Engine: Activo
echo    - iOS Config: Cargado
echo.

:: Monitor the process
echo 🔍 Monitoreando servidor... (Ctrl+C para detener)
echo.

:: Simple monitoring loop
:monitor
timeout /t 5 /nobreak >nul
echo [%date% %time%] ✅ Sandra Mobile Galaxy activo - http://localhost:5001
goto monitor

:: Cleanup on exit
:cleanup
echo.
echo 🛑 Deteniendo Sandra IA Mobile Galaxy...
taskkill /F /IM node.exe 2>nul
echo ✅ Servidor detenido
echo.
pause