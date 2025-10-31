// SANDRA IA - VOICE ACTIVITY DETECTION (VAD) HANDLER
// Detects when user speaks to enable barge-in functionality

class VADHandler {
  constructor(config = {}) {
    this.config = {
      // VAD thresholds
      threshold: config.threshold || 0.05,        // Voice detection threshold
      minSpeechFrames: config.minSpeechFrames || 3,  // Frames to confirm speech
      minSilenceFrames: config.minSilenceFrames || 5, // Frames to confirm silence
      smoothingFactor: config.smoothingFactor || 0.9, // Exponential smoothing

      // Audio analysis
      fftSize: config.fftSize || 2048,
      sampleRate: config.sampleRate || 44100,
      updateInterval: config.updateInterval || 100, // ms

      // Barge-in settings
      bargeInEnabled: config.bargeInEnabled !== false,
      bargeInDelay: config.bargeInDelay || 100, // ms delay before triggering

      ...config
    };

    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.source = null;

    this.isSpeaking = false;
    this.speechFrameCount = 0;
    this.silenceFrameCount = 0;
    this.smoothedVolume = 0;

    this.isAnalyzing = false;
    this.analyzerInterval = null;

    // Event handlers
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    this.onBargeIn = null;
    this.onVolumeChange = null;

    // State tracking
    this.remoteAudioPlaying = false;
    this.bargeInTimeout = null;
  }

  async initialize(mediaStream) {
    try {
      console.log('🎤 Initializing VAD handler...');

      this.mediaStream = mediaStream;

      // Create or resume audio context
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect media stream to analyser
      this.source = this.audioContext.createMediaStreamSource(mediaStream);
      this.source.connect(this.analyser);

      console.log('✅ VAD handler initialized');
      return true;

    } catch (error) {
      console.error('❌ VAD initialization failed:', error);
      return false;
    }
  }

  start() {
    if (this.isAnalyzing) {
      console.warn('⚠️ VAD already analyzing');
      return;
    }

    console.log('🎙️ Starting voice activity detection...');
    this.isAnalyzing = true;

    this.analyzerInterval = setInterval(() => {
      this.analyze();
    }, this.config.updateInterval);
  }

  stop() {
    if (!this.isAnalyzing) {
      return;
    }

    console.log('🛑 Stopping voice activity detection...');
    this.isAnalyzing = false;

    if (this.analyzerInterval) {
      clearInterval(this.analyzerInterval);
      this.analyzerInterval = null;
    }

    if (this.bargeInTimeout) {
      clearTimeout(this.bargeInTimeout);
      this.bargeInTimeout = null;
    }
  }

  analyze() {
    if (!this.analyser) return;

    // Get time domain data
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS (Root Mean Square) volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }

    const rms = Math.sqrt(sum / bufferLength);

    // Apply exponential smoothing
    this.smoothedVolume = (this.config.smoothingFactor * this.smoothedVolume) +
                          ((1 - this.config.smoothingFactor) * rms);

    // Emit volume change event
    if (this.onVolumeChange) {
      this.onVolumeChange(this.smoothedVolume);
    }

    // Detect speech vs silence
    if (this.smoothedVolume > this.config.threshold) {
      // Voice detected
      this.speechFrameCount++;
      this.silenceFrameCount = 0;

      // Confirm speech after minimum frames
      if (!this.isSpeaking && this.speechFrameCount >= this.config.minSpeechFrames) {
        this.handleSpeechStart();
      }

    } else {
      // Silence detected
      this.silenceFrameCount++;
      this.speechFrameCount = 0;

      // Confirm silence after minimum frames
      if (this.isSpeaking && this.silenceFrameCount >= this.config.minSilenceFrames) {
        this.handleSpeechEnd();
      }
    }
  }

  handleSpeechStart() {
    this.isSpeaking = true;
    console.log('🗣️ Speech started');

    if (this.onSpeechStart) {
      this.onSpeechStart();
    }

    // Check for barge-in condition
    if (this.config.bargeInEnabled && this.remoteAudioPlaying) {
      this.triggerBargeIn();
    }
  }

  handleSpeechEnd() {
    this.isSpeaking = false;
    console.log('🤐 Speech ended');

    if (this.onSpeechEnd) {
      this.onSpeechEnd();
    }
  }

  triggerBargeIn() {
    // Debounce barge-in to avoid false triggers
    if (this.bargeInTimeout) {
      clearTimeout(this.bargeInTimeout);
    }

    this.bargeInTimeout = setTimeout(() => {
      console.log('🛑 BARGE-IN TRIGGERED');

      if (this.onBargeIn) {
        this.onBargeIn();
      }

      this.bargeInTimeout = null;
    }, this.config.bargeInDelay);
  }

  setRemoteAudioPlaying(isPlaying) {
    this.remoteAudioPlaying = isPlaying;

    if (!isPlaying && this.bargeInTimeout) {
      clearTimeout(this.bargeInTimeout);
      this.bargeInTimeout = null;
    }
  }

  // Getters
  getIsSpeaking() {
    return this.isSpeaking;
  }

  getVolume() {
    return this.smoothedVolume;
  }

  getIsAnalyzing() {
    return this.isAnalyzing;
  }

  // Configuration updates
  setThreshold(threshold) {
    this.config.threshold = threshold;
    console.log(`🎚️ VAD threshold updated: ${threshold}`);
  }

  setBargeInEnabled(enabled) {
    this.config.bargeInEnabled = enabled;
    console.log(`🔀 Barge-in ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Cleanup
  destroy() {
    this.stop();

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    this.mediaStream = null;

    console.log('✅ VAD handler destroyed');
  }
}

// Alternative: Simple VAD using Web Audio API only (no external library)
class SimpleVAD {
  constructor(audioContext, stream, options = {}) {
    this.audioContext = audioContext;
    this.stream = stream;
    this.threshold = options.threshold || 0.01;
    this.smoothing = options.smoothing || 0.8;

    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = this.smoothing;

    this.source = audioContext.createMediaStreamSource(stream);
    this.source.connect(this.analyser);

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.isSpeaking = false;
    this.callbacks = {
      onSpeechStart: null,
      onSpeechEnd: null
    };
  }

  checkAudioLevel() {
    this.analyser.getByteTimeDomainData(this.dataArray);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = (this.dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }

    const rms = Math.sqrt(sum / this.dataArray.length);

    const speaking = rms > this.threshold;

    if (speaking && !this.isSpeaking) {
      this.isSpeaking = true;
      if (this.callbacks.onSpeechStart) this.callbacks.onSpeechStart();
    } else if (!speaking && this.isSpeaking) {
      this.isSpeaking = false;
      if (this.callbacks.onSpeechEnd) this.callbacks.onSpeechEnd();
    }

    return rms;
  }

  on(event, callback) {
    if (event in this.callbacks) {
      this.callbacks[event] = callback;
    }
  }

  destroy() {
    this.source.disconnect();
    this.analyser.disconnect();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VADHandler, SimpleVAD };
}
