// SANDRA IA - AUDIO PROCESSOR
// Handles audio processing, TTS generation, and audio streaming

const axios = require('axios');

class AudioProcessor {
  constructor(config = {}) {
    this.config = {
      cartesiaApiKey: config.cartesiaApiKey || process.env.CARTESIA_API_KEY,
      cartesiaVoiceId: config.cartesiaVoiceId || process.env.CARTESIA_VOICE_ID,
      cartesiaBaseUrl: 'https://api.cartesia.ai',

      // Audio settings
      sampleRate: config.sampleRate || 44100,
      channels: config.channels || 1,
      bitDepth: config.bitDepth || 16,

      // Streaming settings
      chunkSize: config.chunkSize || 4096, // bytes
      streamingEnabled: config.streamingEnabled !== false,

      ...config
    };

    console.log('✅ Audio processor initialized');
  }

  // === TEXT-TO-SPEECH ===

  async textToSpeech(text, options = {}) {
    try {
      console.log(`🔊 Generating TTS for: "${text.substring(0, 50)}..."`);

      const response = await axios.post(
        `${this.config.cartesiaBaseUrl}/tts/bytes`,
        {
          model_id: 'sonic-english',
          transcript: text,
          voice: {
            mode: 'id',
            id: this.config.cartesiaVoiceId
          },
          output_format: {
            container: 'raw',
            encoding: 'pcm_f32le',
            sample_rate: this.config.sampleRate
          },
          language: options.language || 'es'
        },
        {
          headers: {
            'X-API-Key': this.config.cartesiaApiKey,
            'Cartesia-Version': '2024-06-10',
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        }
      );

      console.log('✅ TTS generated successfully');
      return Buffer.from(response.data);

    } catch (error) {
      console.error('❌ TTS generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate TTS');
    }
  }

  async *textToSpeechStream(text, options = {}) {
    try {
      console.log(`🔊 Streaming TTS for: "${text.substring(0, 50)}..."`);

      const response = await axios.post(
        `${this.config.cartesiaBaseUrl}/tts/bytes`,
        {
          model_id: 'sonic-english',
          transcript: text,
          voice: {
            mode: 'id',
            id: this.config.cartesiaVoiceId
          },
          output_format: {
            container: 'raw',
            encoding: 'pcm_f32le',
            sample_rate: this.config.sampleRate
          },
          language: options.language || 'es'
        },
        {
          headers: {
            'X-API-Key': this.config.cartesiaApiKey,
            'Cartesia-Version': '2024-06-10',
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );

      const stream = response.data;
      let buffer = Buffer.alloc(0);

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);

        // Yield chunks of configured size
        while (buffer.length >= this.config.chunkSize) {
          const outputChunk = buffer.slice(0, this.config.chunkSize);
          buffer = buffer.slice(this.config.chunkSize);
          yield outputChunk;
        }
      }

      // Yield remaining buffer
      if (buffer.length > 0) {
        yield buffer;
      }

      console.log('✅ TTS streaming completed');

    } catch (error) {
      console.error('❌ TTS streaming error:', error.response?.data || error.message);
      throw new Error('Failed to stream TTS');
    }
  }

  // === AUDIO FORMAT CONVERSION ===

  pcmToWav(pcmData, options = {}) {
    const sampleRate = options.sampleRate || this.config.sampleRate;
    const channels = options.channels || this.config.channels;
    const bitDepth = options.bitDepth || this.config.bitDepth;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = channels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;

    const wavHeader = Buffer.alloc(44);

    // RIFF header
    wavHeader.write('RIFF', 0);
    wavHeader.writeUInt32LE(36 + pcmData.length, 4);
    wavHeader.write('WAVE', 8);

    // fmt chunk
    wavHeader.write('fmt ', 12);
    wavHeader.writeUInt32LE(16, 16); // fmt chunk size
    wavHeader.writeUInt16LE(1, 20); // PCM format
    wavHeader.writeUInt16LE(channels, 22);
    wavHeader.writeUInt32LE(sampleRate, 24);
    wavHeader.writeUInt32LE(byteRate, 28);
    wavHeader.writeUInt16LE(blockAlign, 32);
    wavHeader.writeUInt16LE(bitDepth, 34);

    // data chunk
    wavHeader.write('data', 36);
    wavHeader.writeUInt32LE(pcmData.length, 40);

    return Buffer.concat([wavHeader, pcmData]);
  }

  webmToWav(webmData) {
    // TODO: Implement WebM to WAV conversion
    // For now, return as-is (may need ffmpeg or similar)
    console.warn('⚠️ WebM to WAV conversion not implemented yet');
    return webmData;
  }

  // === AUDIO ANALYSIS ===

  calculateRMS(audioBuffer) {
    let sum = 0;
    const samples = new Float32Array(audioBuffer);

    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }

    return Math.sqrt(sum / samples.length);
  }

  detectSilence(audioBuffer, threshold = 0.01) {
    const rms = this.calculateRMS(audioBuffer);
    return rms < threshold;
  }

  trimSilence(audioBuffer, threshold = 0.01) {
    const samples = new Float32Array(audioBuffer);
    let start = 0;
    let end = samples.length - 1;

    // Find start of non-silence
    while (start < samples.length && Math.abs(samples[start]) < threshold) {
      start++;
    }

    // Find end of non-silence
    while (end > start && Math.abs(samples[end]) < threshold) {
      end--;
    }

    return samples.slice(start, end + 1).buffer;
  }

  // === AUDIO EFFECTS ===

  normalizeVolume(audioBuffer, targetRMS = 0.1) {
    const samples = new Float32Array(audioBuffer);
    const currentRMS = this.calculateRMS(audioBuffer);

    if (currentRMS === 0) return audioBuffer;

    const gain = targetRMS / currentRMS;

    for (let i = 0; i < samples.length; i++) {
      samples[i] *= gain;
      // Prevent clipping
      samples[i] = Math.max(-1, Math.min(1, samples[i]));
    }

    return samples.buffer;
  }

  applyFadeIn(audioBuffer, durationMs = 50) {
    const samples = new Float32Array(audioBuffer);
    const sampleRate = this.config.sampleRate;
    const fadeSamples = Math.floor((durationMs / 1000) * sampleRate);

    for (let i = 0; i < Math.min(fadeSamples, samples.length); i++) {
      const gain = i / fadeSamples;
      samples[i] *= gain;
    }

    return samples.buffer;
  }

  applyFadeOut(audioBuffer, durationMs = 50) {
    const samples = new Float32Array(audioBuffer);
    const sampleRate = this.config.sampleRate;
    const fadeSamples = Math.floor((durationMs / 1000) * sampleRate);
    const startFade = samples.length - fadeSamples;

    for (let i = startFade; i < samples.length; i++) {
      const gain = (samples.length - i) / fadeSamples;
      samples[i] *= gain;
    }

    return samples.buffer;
  }

  // === CHUNKING UTILITIES ===

  *chunkAudioBuffer(audioBuffer, chunkSizeBytes = null) {
    const chunkSize = chunkSizeBytes || this.config.chunkSize;
    const buffer = Buffer.from(audioBuffer);

    for (let i = 0; i < buffer.length; i += chunkSize) {
      yield buffer.slice(i, Math.min(i + chunkSize, buffer.length));
    }
  }

  mergeAudioChunks(chunks) {
    return Buffer.concat(chunks);
  }

  // === LATENCY OPTIMIZATION ===

  async preloadVoiceModel() {
    try {
      console.log('🔄 Preloading voice model...');

      // Make a small request to "warm up" the TTS service
      await this.textToSpeech('Hola', { language: 'es' });

      console.log('✅ Voice model preloaded');
      return true;

    } catch (error) {
      console.warn('⚠️ Voice model preload failed:', error.message);
      return false;
    }
  }

  // === SPEECH-TO-TEXT (Placeholder) ===

  async speechToText(audioBuffer, options = {}) {
    try {
      console.log('🎤 Converting speech to text...');

      // TODO: Implement actual STT with Whisper API or similar
      // For now, return placeholder

      console.warn('⚠️ STT not implemented yet');

      return {
        text: '[Speech recognition placeholder]',
        confidence: 0.0,
        language: 'es',
        duration: 0
      };

    } catch (error) {
      console.error('❌ STT error:', error);
      throw new Error('Failed to convert speech to text');
    }
  }

  // === UTILITIES ===

  getDuration(audioBuffer) {
    const samples = audioBuffer.byteLength / (this.config.bitDepth / 8);
    return (samples / this.config.sampleRate) * 1000; // ms
  }

  getSizeInKB(audioBuffer) {
    return (audioBuffer.byteLength / 1024).toFixed(2);
  }

  // === MONITORING ===

  getMetrics() {
    return {
      config: {
        sampleRate: this.config.sampleRate,
        channels: this.config.channels,
        bitDepth: this.config.bitDepth,
        chunkSize: this.config.chunkSize
      },
      streaming: this.config.streamingEnabled,
      cartesiaConfigured: !!this.config.cartesiaApiKey
    };
  }
}

module.exports = AudioProcessor;
