@echo off
echo ========================================
echo  INSTALACION AUTOMATICA DE WAV2LIP
echo  Para Sandra IA 8.0 Pro
echo ========================================
echo.

cd /d "%~dp0"

echo [1/6] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no esta instalado
    echo Descarga Python desde: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo Python OK

echo.
echo [2/6] Clonando Wav2Lip desde GitHub...
if exist "emore-engine" (
    echo Wav2Lip ya existe, actualizando...
    cd emore-engine
    git pull
    cd ..
) else (
    git clone https://github.com/Rudrabha/Wav2Lip.git emore-engine
    if errorlevel 1 (
        echo ERROR: No se pudo clonar Wav2Lip
        pause
        exit /b 1
    )
)
echo Wav2Lip clonado OK

echo.
echo [3/6] Instalando dependencias Python...
cd emore-engine
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install opencv-python numpy scipy librosa tqdm
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: No se pudieron instalar las dependencias
    pause
    exit /b 1
)
cd ..
echo Dependencias instaladas OK

echo.
echo [4/6] Creando carpeta de checkpoints...
if not exist "emore-engine\checkpoints" mkdir "emore-engine\checkpoints"
echo Carpeta creada OK

echo.
echo [5/6] Descargando modelo Wav2Lip (290 MB)...
echo NOTA: Esta descarga puede tardar varios minutos
cd emore-engine\checkpoints
if exist "wav2lip_gan.pth" (
    echo Modelo ya existe, omitiendo descarga
) else (
    powershell -Command "& {Invoke-WebRequest -Uri 'https://iiitaphyd-my.sharepoint.com/:u:/g/personal/radrabha_m_research_iiit_ac_in/Eb3LEzbfuKlJiR600lQWRxgBIY27JZg80f7V9jtMfbNDaQ?download=1' -OutFile 'wav2lip_gan.pth'}"
    if errorlevel 1 (
        echo ERROR: No se pudo descargar el modelo
        echo Descarga manual desde: https://github.com/Rudrabha/Wav2Lip
        pause
        exit /b 1
    )
)
cd ..\..
echo Modelo descargado OK

echo.
echo [6/6] Descargando modelo de deteccion facial...
cd emore-engine\face_detection\detection\sfd
if exist "s3fd.pth" (
    echo Modelo facial ya existe
) else (
    powershell -Command "& {Invoke-WebRequest -Uri 'https://www.adrianbulat.com/downloads/python-fan/s3fd-619a316812.pth' -OutFile 's3fd.pth'}"
)
cd ..\..\..\..
echo Modelo facial OK

echo.
echo ========================================
echo  INSTALACION COMPLETADA
echo ========================================
echo.
echo Wav2Lip esta listo para usar en Sandra IA
echo Reinicia la aplicacion para activar el lip-sync avanzado
echo.
pause

