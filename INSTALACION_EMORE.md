# 🎬 Instalación de EMORE para Lip-Sync Avanzado

## ¿Qué es EMORE?

**EMORE** es un sistema de sincronización labial avanzado que:
- ✅ Mantiene el **movimiento corporal completo** del avatar
- ✅ Sincroniza **labios + expresiones + gestos naturales**
- ✅ Funciona con **videos Sora** (cuerpo entero en movimiento)
- ✅ Más ligero y preciso que Wav2Lip/GeneFace++
- ✅ Tiempo de procesamiento: ~1.8s en RTX 3060

## 📋 Requisitos

- **Python 3.8+**
- **CUDA** (GPU NVIDIA recomendada)
- **FFmpeg** instalado
- **~500MB** de espacio para el modelo

## 🔧 Instalación Paso a Paso

### 1. Clonar EMORE

```bash
cd C:\Sandra-IA-8.0-Pro
git clone https://github.com/Ramondr/EMORE.git emore-engine
cd emore-engine
```

### 2. Instalar dependencias Python

```bash
pip install -r requirements.txt
```

**Dependencias principales:**
- torch
- torchvision
- opencv-python
- numpy
- scipy
- librosa
- tqdm

### 3. Descargar modelo pre-entrenado

```bash
mkdir checkpoints
```

**Opción A: Descarga automática (recomendada)**
```bash
wget https://huggingface.co/Ramondr/emore/resolve/main/emore.pth -P checkpoints/
```

**Opción B: Descarga manual**
1. Ir a: https://huggingface.co/Ramondr/emore
2. Descargar `emore.pth` (280 MB)
3. Colocar en: `C:\Sandra-IA-8.0-Pro\emore-engine\checkpoints\emore.pth`

### 4. Verificar instalación

```bash
python inference.py --help
```

Si aparece la ayuda del comando, ¡EMORE está instalado correctamente! ✅

## 🎯 Uso en Sandra IA

Una vez instalado, Sandra IA **automáticamente** usará EMORE para sincronizar:

1. **Videos de Sora** (avatar en movimiento)
2. **Audio de Cartesia** (voz de Sandra)
3. **Resultado**: Video sincronizado con labios, expresiones y gestos naturales

### Flujo automático:

```
Usuario habla → Deepgram STT → GPT-4o responde → Cartesia TTS → EMORE sincroniza → Video Sora + Audio
```

## 📊 Rendimiento

- **RTX 3060**: ~1.8 segundos por video
- **RTX 3080**: ~1.2 segundos por video
- **RTX 4090**: ~0.8 segundos por video

**Sin GPU**: Fallback a sincronización básica (solo combina video + audio)

## 🔍 Verificar estado en Sandra

En la consola de Sandra IA, verás:

```
✅ EMORE Lip-Sync Service inicializado
```

Si EMORE **NO** está instalado:
```
⚠️ EMORE no instalado. Usar pseudo-lipsync básico.
📝 Para instalar EMORE:
   cd C:\Sandra-IA-8.0-Pro
   git clone https://github.com/Ramondr/EMORE.git emore-engine
   ...
```

## 🛠️ Troubleshooting

### Error: "CUDA not available"
- Instalar CUDA Toolkit: https://developer.nvidia.com/cuda-downloads
- Instalar PyTorch con CUDA: `pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118`

### Error: "emore.pth not found"
- Verificar que el archivo esté en: `C:\Sandra-IA-8.0-Pro\emore-engine\checkpoints\emore.pth`
- Descargar manualmente desde HuggingFace

### Error: "FFmpeg not found"
- Instalar FFmpeg: https://ffmpeg.org/download.html
- Añadir FFmpeg al PATH de Windows

## 📁 Estructura de archivos

```
C:\Sandra-IA-8.0-Pro\
├── emore-engine/              # Motor EMORE
│   ├── inference.py           # Script principal
│   ├── checkpoints/
│   │   └── emore.pth         # Modelo (280 MB)
│   └── requirements.txt
├── services/
│   └── emore-lipsync-service.js  # Servicio integrado
└── temp-lipsync/              # Videos temporales (se crea automáticamente)
```

## ✅ Checklist de instalación

- [ ] Python 3.8+ instalado
- [ ] CUDA instalado (opcional pero recomendado)
- [ ] FFmpeg instalado y en PATH
- [ ] EMORE clonado en `emore-engine/`
- [ ] Dependencias instaladas (`pip install -r requirements.txt`)
- [ ] Modelo `emore.pth` descargado en `checkpoints/`
- [ ] Sandra IA reiniciada

## 🎬 ¡Listo para usar!

Una vez completada la instalación, Sandra IA usará automáticamente EMORE para sincronizar los videos de Sora con la voz de Cartesia durante las llamadas conversacionales.

**No se requiere configuración adicional** - todo funciona automáticamente. 🚀

