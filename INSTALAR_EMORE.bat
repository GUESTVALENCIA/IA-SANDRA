@echo off
echo ========================================
echo  INSTALACION AUTOMATICA DE EMORE
echo  Para Sandra IA 8.0 Pro
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no esta instalado
    echo Descarga Python desde: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo Python OK

echo.
echo [2/5] Clonando EMORE desde GitHub...
if exist "emore-engine" (
    echo EMORE ya existe, actualizando...
    cd emore-engine
    git pull
    cd ..
) else (
    git clone https://github.com/Ramondr/EMORE.git emore-engine
    if errorlevel 1 (
        echo ERROR: No se pudo clonar EMORE
        pause
        exit /b 1
    )
)
echo EMORE clonado OK

echo.
echo [3/5] Instalando dependencias Python...
cd emore-engine
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install opencv-python numpy scipy librosa tqdm
if errorlevel 1 (
    echo ERROR: No se pudieron instalar las dependencias
    pause
    exit /b 1
)
cd ..
echo Dependencias instaladas OK

echo.
echo [4/5] Creando carpeta de checkpoints...
if not exist "emore-engine\checkpoints" mkdir "emore-engine\checkpoints"
echo Carpeta creada OK

echo.
echo [5/5] Descargando modelo emore.pth (280 MB)...
echo NOTA: Esta descarga puede tardar varios minutos
cd emore-engine\checkpoints
if exist "emore.pth" (
    echo Modelo ya existe, omitiendo descarga
) else (
    powershell -Command "& {Invoke-WebRequest -Uri 'https://huggingface.co/Ramondr/emore/resolve/main/emore.pth' -OutFile 'emore.pth'}"
    if errorlevel 1 (
        echo ERROR: No se pudo descargar el modelo
        echo Descarga manual desde: https://huggingface.co/Ramondr/emore
        pause
        exit /b 1
    )
)
cd ..\..
echo Modelo descargado OK

echo.
echo ========================================
echo  INSTALACION COMPLETADA
echo ========================================
echo.
echo EMORE esta listo para usar en Sandra IA
echo Reinicia la aplicacion para activar el lip-sync avanzado
echo.
pause

