/**
 * LipSync Service (engine-wav2lip) con fallback seguro
 */
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');

class LipSyncService {
  constructor() {
    this.enabled = String(process.env.LIPSYNC_ENABLED || 'false') === 'true';
    this.engine = String(process.env.LIPSYNC_ENGINE || 'none').toLowerCase();
    this.engineRoot = path.join(__dirname, '../emore-engine'); // reusamos carpeta estándar
    this.tempDir = path.join(__dirname, '../temp-lipsync');
    this.isProcessing = false;
  }

  async ensureTemp() {
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  async isEngineReady() {
    if (!this.enabled) return false;
    if (this.engine !== 'wav2lip') return false;
    try {
      const modelPath = path.join(this.engineRoot, 'checkpoints', 'wav2lip_gan.pth');
      const inference = path.join(this.engineRoot, 'inference.py');
      await fs.access(modelPath);
      await fs.access(inference);
      return true;
    } catch {
      return false;
    }
  }

  async prepareVideoBase(inputVideoPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputVideoPath)
        .noAudio()
        .videoFilters('fps=25,scale=720:1280')
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  async prepareAudioPcm16k(inputBuffer, outputPath) {
    const tempIn = path.join(this.tempDir, `in_${Date.now()}.wav`);
    await fs.writeFile(tempIn, inputBuffer);
    return new Promise((resolve, reject) => {
      ffmpeg(tempIn)
        .audioFrequency(16000)
        .audioChannels(1)
        .audioCodec('pcm_s16le')
        .output(outputPath)
        .on('end', async () => {
          try { await fs.unlink(tempIn); } catch {}
          resolve(outputPath);
        })
        .on('error', reject)
        .run();
    });
  }

  async runWav2Lip(videoPath, audioPath, outputPath) {
    if (this.isProcessing) throw new Error('Lip-sync en curso');
    this.isProcessing = true;
    return new Promise((resolve, reject) => {
      const script = path.join(this.engineRoot, 'inference.py');
      const args = [
        script,
        '--checkpoint_path', path.join(this.engineRoot, 'checkpoints', 'wav2lip_gan.pth'),
        '--face', videoPath,
        '--audio', audioPath,
        '--outfile', outputPath,
      ];
      const proc = spawn('python', args, { cwd: this.engineRoot, env: { ...process.env, PYTHONUNBUFFERED: '1' } });
      let stderr = '';
      proc.stderr.on('data', d => { stderr += d.toString(); });
      proc.on('close', code => {
        this.isProcessing = false;
        if (code === 0) resolve(outputPath);
        else reject(new Error(`Wav2Lip failed (${code}): ${stderr}`));
      });
      proc.on('error', err => { this.isProcessing = false; reject(err); });
    });
  }

  async combineSimple(videoPath, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .input(audioPath)
        .outputOptions(['-c:v libx264', '-c:a aac', '-shortest'])
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .run();
    });
  }

  async generateSyncedVideo(sourceVideoPath, ttsAudioBuffer) {
    try {
      await this.ensureTemp();
      const ts = Date.now();
      const videoBase = path.join(this.tempDir, `base_${ts}.mp4`);
      const audioOut = path.join(this.tempDir, `audio_${ts}.wav`);
      const outFile = path.join(this.tempDir, `out_${ts}.mp4`);

      await this.prepareVideoBase(sourceVideoPath, videoBase);
      await this.prepareAudioPcm16k(ttsAudioBuffer, audioOut);

      const ready = await this.isEngineReady();
      if (ready) {
        await this.runWav2Lip(videoBase, audioOut, outFile);
      } else {
        await this.combineSimple(videoBase, audioOut, outFile);
      }

      const buf = await fs.readFile(outFile);
      return { success: true, videoPath: outFile, videoBuffer: buf };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

module.exports = LipSyncService;


