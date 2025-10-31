// SANDRA IA - AVATAR SYNC MODULE
// Real-time lip sync for avatar mouth animation based on audio analysis

class AvatarSync {
  constructor(config = {}) {
    this.config = {
      // Animation settings
      minMouthScale: config.minMouthScale || 0.08,
      maxMouthScale: config.maxMouthScale || 1.0,
      amplificationFactor: config.amplificationFactor || 1.8,
      smoothingFactor: config.smoothingFactor || 0.85,

      // Audio analysis
      fftSize: config.fftSize || 2048,
      updateInterval: config.updateInterval || 16, // ~60fps

      // Visual elements
      mouthElement: config.mouthElement || null,
      avatarElement: config.avatarElement || null,

      ...config
    };

    this.audioContext = null;
    this.analyser = null;
    this.audioSource = null;
    this.isAnimating = false;
    this.animationFrameId = null;
    this.currentScale = this.config.minMouthScale;
    this.smoothedRMS = 0;

    // Event handlers
    this.onAnimationFrame = null;
    this.onScaleChange = null;
  }

  async initialize(audioContext) {
    try {
      console.log('👄 Initializing avatar sync...');

      this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();

      // Create analyser for audio visualization
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = 0.8;

      console.log('✅ Avatar sync initialized');
      return true;

    } catch (error) {
      console.error('❌ Avatar sync initialization failed:', error);
      return false;
    }
  }

  connectAudioSource(audioElement) {
    try {
      console.log('🔌 Connecting audio source to avatar sync...');

      // Disconnect previous source if exists
      if (this.audioSource) {
        this.audioSource.disconnect();
      }

      // Create new source from audio element
      if (audioElement instanceof HTMLAudioElement) {
        this.audioSource = this.audioContext.createMediaElementSource(audioElement);
      } else if (audioElement instanceof MediaStream) {
        this.audioSource = this.audioContext.createMediaStreamSource(audioElement);
      } else if (audioElement instanceof AudioBufferSourceNode) {
        this.audioSource = audioElement;
      } else {
        throw new Error('Unsupported audio source type');
      }

      // Connect to analyser and destination
      this.audioSource.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      console.log('✅ Audio source connected');
      return true;

    } catch (error) {
      console.error('❌ Failed to connect audio source:', error);
      return false;
    }
  }

  connectBufferSource(bufferSource) {
    try {
      if (this.audioSource) {
        this.audioSource.disconnect();
      }

      this.audioSource = bufferSource;
      bufferSource.connect(this.analyser);

      console.log('✅ Buffer source connected to avatar sync');
      return true;

    } catch (error) {
      console.error('❌ Failed to connect buffer source:', error);
      return false;
    }
  }

  start() {
    if (this.isAnimating) {
      console.warn('⚠️ Avatar sync already animating');
      return;
    }

    console.log('🎬 Starting avatar animation...');
    this.isAnimating = true;
    this.animate();
  }

  stop() {
    if (!this.isAnimating) {
      return;
    }

    console.log('🛑 Stopping avatar animation...');
    this.isAnimating = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Reset mouth to default
    this.setMouthScale(this.config.minMouthScale);
  }

  animate() {
    if (!this.isAnimating || !this.analyser) {
      return;
    }

    // Get audio data
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }

    const rms = Math.sqrt(sum / bufferLength);

    // Apply smoothing
    this.smoothedRMS = (this.config.smoothingFactor * this.smoothedRMS) +
                       ((1 - this.config.smoothingFactor) * rms);

    // Calculate mouth scale
    const scale = this.calculateMouthScale(this.smoothedRMS);
    this.setMouthScale(scale);

    // Emit animation frame event
    if (this.onAnimationFrame) {
      this.onAnimationFrame({
        rms: this.smoothedRMS,
        scale: scale,
        timestamp: Date.now()
      });
    }

    // Continue animation loop
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  calculateMouthScale(rms) {
    // Amplify and clamp
    const amplified = rms * this.config.amplificationFactor;
    const scale = Math.max(
      this.config.minMouthScale,
      Math.min(this.config.maxMouthScale, amplified)
    );

    return scale;
  }

  setMouthScale(scale) {
    this.currentScale = scale;

    // Update mouth element if provided
    if (this.config.mouthElement) {
      const element = typeof this.config.mouthElement === 'string'
        ? document.querySelector(this.config.mouthElement)
        : this.config.mouthElement;

      if (element) {
        element.style.transform = `translateX(-50%) scaleY(${scale})`;
      }
    }

    // Emit scale change event
    if (this.onScaleChange) {
      this.onScaleChange(scale);
    }
  }

  // Alternative: Direct mouth control from audio buffer
  syncMouthToAudioBuffer(audioBuffer, startTime = 0) {
    if (!audioBuffer) return;

    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const frameDuration = this.config.updateInterval / 1000; // seconds
    const samplesPerFrame = Math.floor(sampleRate * frameDuration);

    let frameIndex = Math.floor((startTime * sampleRate) / samplesPerFrame);

    const updateMouth = () => {
      if (!this.isAnimating) return;

      const startSample = frameIndex * samplesPerFrame;
      const endSample = Math.min(startSample + samplesPerFrame, channelData.length);

      if (startSample >= channelData.length) {
        this.stop();
        return;
      }

      // Calculate RMS for this frame
      let sum = 0;
      for (let i = startSample; i < endSample; i++) {
        sum += channelData[i] * channelData[i];
      }

      const rms = Math.sqrt(sum / (endSample - startSample));
      const scale = this.calculateMouthScale(rms);
      this.setMouthScale(scale);

      frameIndex++;
      setTimeout(updateMouth, this.config.updateInterval);
    };

    updateMouth();
  }

  // Advanced: Phoneme-based lip sync (requires phoneme data)
  syncToPhonemes(phonemeData, startTime = 0) {
    // Phoneme data format: [{phoneme: 'AH', start: 0.0, end: 0.1, intensity: 0.8}, ...]
    const currentTime = () => (Date.now() - startTime) / 1000;

    const updateFromPhonemes = () => {
      if (!this.isAnimating) return;

      const time = currentTime();
      const currentPhoneme = phonemeData.find(p => time >= p.start && time < p.end);

      if (currentPhoneme) {
        const scale = this.phonemeToMouthScale(currentPhoneme);
        this.setMouthScale(scale);
      } else {
        this.setMouthScale(this.config.minMouthScale);
      }

      this.animationFrameId = requestAnimationFrame(updateFromPhonemes);
    };

    updateFromPhonemes();
  }

  phonemeToMouthScale(phoneme) {
    // Map phonemes to mouth openness
    const phonemeScales = {
      'AH': 0.9, 'AA': 0.9, 'AE': 0.8, 'AO': 0.85,
      'EH': 0.6, 'ER': 0.5, 'EY': 0.6,
      'IH': 0.4, 'IY': 0.4,
      'OW': 0.7, 'OY': 0.7,
      'UH': 0.5, 'UW': 0.6,
      'M': 0.1, 'N': 0.1, 'NG': 0.1,
      'P': 0.1, 'B': 0.1,
      'F': 0.3, 'V': 0.3,
      'TH': 0.3, 'DH': 0.3,
      'S': 0.2, 'Z': 0.2,
      'SH': 0.3, 'ZH': 0.3,
      'T': 0.2, 'D': 0.2, 'K': 0.3, 'G': 0.3
    };

    const baseScale = phonemeScales[phoneme.phoneme] || 0.5;
    const intensity = phoneme.intensity || 1.0;

    return baseScale * intensity;
  }

  // Utility methods
  getCurrentScale() {
    return this.currentScale;
  }

  getSmoothedRMS() {
    return this.smoothedRMS;
  }

  getIsAnimating() {
    return this.isAnimating;
  }

  // Configuration updates
  setAmplificationFactor(factor) {
    this.config.amplificationFactor = factor;
    console.log(`🔊 Amplification factor updated: ${factor}`);
  }

  setSmoothingFactor(factor) {
    this.config.smoothingFactor = factor;
    console.log(`📊 Smoothing factor updated: ${factor}`);
  }

  setMouthElement(element) {
    this.config.mouthElement = element;
    console.log('👄 Mouth element updated');
  }

  // Cleanup
  destroy() {
    this.stop();

    if (this.audioSource) {
      try {
        this.audioSource.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      this.audioSource = null;
    }

    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      this.analyser = null;
    }

    this.audioContext = null;

    console.log('✅ Avatar sync destroyed');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AvatarSync;
}
