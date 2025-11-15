/**
 * EMORE Lip-Sync Service
 * Sincronización avanzada de labios + expresiones + gestos para videos Sora
 * Mantiene movimiento corporal completo del avatar
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const ffmpeg = require('fluent-ffmpeg');

class EmoreLipSyncService {
  constructor() {
    this.emorePath = path.join(__dirname, '../emore-engine');
    this.checkpointPath = path.join(this.emorePath, 'checkpoints', 'emore.pth');
    this.tempDir = path.join(__dirname, '../temp-lipsync');
    this.isInitialized = false;
    this.isProcessing = false;
    
    console.log('✅ EMORE Lip-Sync Service inicializado');
  }

  /**
   * Verificar si EMORE está instalado y configurado
   */
  async checkInstallation() {
    try {
      const checkpointExists = await fs.access(this.checkpointPath).then(() => true).catch(() => false);
      const emoreExists = await fs.access(path.join(this.emorePath, 'inference.py')).then(() => true).catch(() => false);
      
      this.isInitialized = checkpointExists && emoreExists;
      
      if (!this.isInitialized) {
        console.warn('⚠️ EMORE no instalado. Usar pseudo-lipsync básico.');
        console.log('📝 Para instalar EMORE:');
        console.log('   cd C:\\Sandra-IA-8.0-Pro');
        console.log('   git clone https://github.com/Ramondr/EMORE.git emore-engine');
        console.log('   cd emore-engine && pip install -r requirements.txt');
        console.log('   Descargar emore.pth desde HuggingFace');
      }
      
      return this.isInitialized;
    } catch (error) {
      console.error('Error verificando EMORE:', error);
      return false;
    }
  }

  /**
   * Preparar video base (sin audio, fps=25, resolución optimizada)
   */
  async prepareVideoBase(inputVideoPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputVideoPath)
        .noAudio()
        .videoFilters('fps=25,scale=720:1280')
        .output(outputPath)
        .on('end', () => {
          console.log('✅ Video base preparado:', outputPath);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Error preparando video base:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Preparar audio (16kHz mono, formato WAV)
   */
  async prepareAudio(inputAudioBuffer, outputPath) {
    return new Promise(async (resolve, reject) => {
      try {
        // Guardar buffer temporal
        const tempInput = path.join(this.tempDir, `temp_audio_${Date.now()}.wav`);
        await fs.mkdir(this.tempDir, { recursive: true });
        await fs.writeFile(tempInput, inputAudioBuffer);

        // Convertir a 16kHz mono
        ffmpeg(tempInput)
          .audioFrequency(16000)
          .audioChannels(1)
          .audioCodec('pcm_s16le')
          .output(outputPath)
          .on('end', async () => {
            // Limpiar temporal
            await fs.unlink(tempInput).catch(() => {});
            console.log('✅ Audio preparado:', outputPath);
            resolve(outputPath);
          })
          .on('error', (err) => {
            console.error('Error preparando audio:', err);
            reject(err);
          })
          .run();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Sincronizar video con audio usando Wav2Lip
   */
  async syncLipSync(videoPath, audioPath, outputPath) {
    if (!this.isInitialized) {
      throw new Error('Wav2Lip no está instalado. Usar pseudo-lipsync básico.');
    }

    if (this.isProcessing) {
      throw new Error('Ya hay un proceso de lip-sync en curso');
    }

    this.isProcessing = true;

    return new Promise((resolve, reject) => {
      const pythonScript = path.join(this.emorePath, 'inference.py');
      
      const args = [
        pythonScript,
        '--checkpoint_path', path.join(this.emorePath, 'checkpoints', 'wav2lip_gan.pth'),
        '--face', videoPath,
        '--audio', audioPath,
        '--outfile', outputPath,
        '--fps', '25',
        '--pads', '0', '20', '0', '0',
        '--face_det_batch_size', '4',
        '--wav2lip_batch_size', '128',
        '--resize_factor', '1'
      ];

      console.log('🎬 Ejecutando Wav2Lip lip-sync...');
      const process = spawn('python', args, {
        cwd: this.emorePath,
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('[Wav2Lip]', data.toString().trim());
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
        console.warn('[Wav2Lip Error]', data.toString().trim());
      });

      process.on('close', (code) => {
        this.isProcessing = false;
        
        if (code === 0) {
          console.log('✅ Lip-sync completado:', outputPath);
          resolve(outputPath);
        } else {
          console.error('❌ Wav2Lip falló con código:', code);
          reject(new Error(`Wav2Lip process exited with code ${code}\n${stderr}`));
        }
      });

      process.on('error', (err) => {
        this.isProcessing = false;
        console.error('❌ Error ejecutando Wav2Lip:', err);
        reject(err);
      });
    });
  }

  /**
   * Pipeline completo: audio de Cartesia → video sincronizado
   */
  async generateSyncedVideo(soraVideoPath, cartesiaAudioBuffer) {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });

      const timestamp = Date.now();
      const videoBasePath = path.join(this.tempDir, `video_base_${timestamp}.mp4`);
      const audioPath = path.join(this.tempDir, `audio_${timestamp}.wav`);
      const outputPath = path.join(this.tempDir, `synced_output_${timestamp}.mp4`);

      console.log('🎬 Iniciando pipeline de sincronización...');

      // 1. Preparar video base (sin audio, optimizado)
      await this.prepareVideoBase(soraVideoPath, videoBasePath);

      // 2. Preparar audio (16kHz mono)
      await this.prepareAudio(cartesiaAudioBuffer, audioPath);

      // 3. Sincronizar con EMORE
      if (this.isInitialized) {
        await this.syncLipSync(videoBasePath, audioPath, outputPath);
      } else {
        // Fallback: combinar video + audio sin lip-sync avanzado
        console.warn('⚠️ Usando fallback: video + audio sin lip-sync EMORE');
        await this.simpleCombine(videoBasePath, audioPath, outputPath);
      }

      // 4. Leer video sincronizado
      const syncedVideoBuffer = await fs.readFile(outputPath);

      // 5. Limpiar archivos temporales (opcional, mantener para debug)
      // await this.cleanupTemp([videoBasePath, audioPath, outputPath]);

      console.log('✅ Video sincronizado generado:', outputPath);

      return {
        success: true,
        videoPath: outputPath,
        videoBuffer: syncedVideoBuffer,
        duration: await this.getVideoDuration(outputPath)
      };
    } catch (error) {
      console.error('❌ Error en pipeline de sincronización:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fallback: combinar video + audio sin lip-sync avanzado
   */
  async simpleCombine(videoPath, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v copy',
          '-c:a aac',
          '-shortest'
        ])
        .output(outputPath)
        .on('end', () => {
          console.log('✅ Video + audio combinados (sin lip-sync)');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Error combinando video + audio:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Obtener duración del video
   */
  async getVideoDuration(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration);
        }
      });
    });
  }

  /**
   * Limpiar archivos temporales
   */
  async cleanupTemp(files) {
    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        // Ignorar errores de limpieza
      }
    }
  }

  /**
   * Obtener estado del servicio
   */
  getStatus() {
    return {
      installed: this.isInitialized,
      processing: this.isProcessing,
      checkpointPath: this.checkpointPath,
      tempDir: this.tempDir
    };
  }
}

module.exports = EmoreLipSyncService;

