// SANDRA IA - AUDIO STREAM HANDLER
// Manages bidirectional audio streaming over Supabase Realtime
// Integrates with WebRTC, VAD, and Avatar Sync

class AudioStreamHandler {
  constructor(config = {}) {
    this.config = {
      // Audio capture settings
      sampleRate: config.sampleRate || 44100,
      channels: config.channels || 1,
      chunkDuration: config.chunkDuration || 100, // ms
      chunkSize: config.chunkSize || 4096, // bytes

      // Processing settings
      autoGainControl: config.autoGainControl !== false,
      echoCancellation: config.echoCancellation !== false,
      noiseSuppression: config.noiseSuppression !== false,

      // Playback settings
      playbackBufferSize: config.playbackBufferSize || 8192,

      ...config
    };

    this.audioContext = null;
    this.mediaStream = null;
    this.audioSource = null;
    this.processor = null;

    // Capture state
    this.isCapturing = false;
    this.captureSequence = 0;

    // Playback state
    this.isPlaying = false;
    this.playbackQueue = [];
    this.audioBuffers = [];

    // Supabase Realtime reference
    this.supabaseChannel = null;

    // Event handlers
    this.onCaptureStart = null;
    this.onCaptureEnd = null;
    this.onPlaybackStart = null;
    this.onPlaybackEnd = null;
    this.onError = null;

    console.log('✅ Audio stream handler initialized');
  }

  // === INITIALIZATION ===

  async initialize(supabaseChannel) {
    try {
      console.log('🎤 Initializing audio stream handler...');

      this.supabaseChannel = supabaseChannel;

      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.config.sampleRate
      });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      console.log('✅ Audio stream handler initialized');
      return true;

    } catch (error) {
      console.error('❌ Audio stream handler initialization failed:', error);
      this.emitError(error);
      return false;
    }
  }

  // === AUDIO CAPTURE ===

  async startCapture() {
    try {
      if (this.isCapturing) {
        console.warn('⚠️ Already capturing audio');
        return false;
      }

      console.log('🎤 Starting audio capture...');

      // Get user media
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          autoGainControl: this.config.autoGainControl,
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseSuppression
        }
      });

      // Create audio source
      this.audioSource = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create audio processor (ScriptProcessorNode or AudioWorklet)
      if (this.audioContext.audioWorklet) {
        // Use AudioWorklet (modern, better performance)
        await this.setupAudioWorklet();
      } else {
        // Fallback to ScriptProcessorNode (deprecated but widely supported)
        this.setupScriptProcessor();
      }

      this.isCapturing = true;
      this.captureSequence = 0;

      // Notify Socket.IO server
      if (this.socketClient) {
        this.socketClient.startAudioStream();
      }

      if (this.onCaptureStart) {
        this.onCaptureStart();
      }

      console.log('✅ Audio capture started');
      return true;

    } catch (error) {
      console.error('❌ Failed to start audio capture:', error);
      this.emitError(error);
      return false;
    }
  }

  async setupAudioWorklet() {
    // TODO: Implement AudioWorklet processor
    // For now, fallback to ScriptProcessor
    console.warn('⚠️ AudioWorklet not implemented, using ScriptProcessor');
    this.setupScriptProcessor();
  }

  setupScriptProcessor() {
    const bufferSize = 4096;

    this.processor = this.audioContext.createScriptProcessor(
      bufferSize,
      this.config.channels,
      this.config.channels
    );

    this.processor.onaudioprocess = (event) => {
      if (!this.isCapturing) return;

      const inputData = event.inputBuffer.getChannelData(0);

      // Convert Float32Array to Int16Array (PCM)
      const pcmData = this.float32ToPCM16(inputData);

      // Send chunk via Socket.IO
      if (this.socketClient) {
        this.socketClient.sendAudioChunk(
          Array.from(pcmData), // Convert to regular array for JSON
          this.captureSequence++
        );
      }
    };

    // Connect nodes
    this.audioSource.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  stopCapture() {
    if (!this.isCapturing) {
      return;
    }

    console.log('🛑 Stopping audio capture...');

    this.isCapturing = false;

    // Disconnect and cleanup
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.audioSource) {
      this.audioSource.disconnect();
      this.audioSource = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Notify Socket.IO server
    if (this.socketClient) {
      this.socketClient.endAudioStream();
    }

    if (this.onCaptureEnd) {
      this.onCaptureEnd();
    }

    console.log('✅ Audio capture stopped');
  }

  // === AUDIO PLAYBACK ===

  async startPlayback() {
    if (this.isPlaying) {
      console.warn('⚠️ Already playing audio');
      return false;
    }

    console.log('🔊 Starting audio playback...');

    this.isPlaying = true;
    this.playbackQueue = [];

    if (this.onPlaybackStart) {
      this.onPlaybackStart();
    }

    // Start processing playback queue
    this.processPlaybackQueue();

    return true;
  }

  stopPlayback() {
    if (!this.isPlaying) {
      return;
    }

    console.log('🛑 Stopping audio playback...');

    this.isPlaying = false;
    this.playbackQueue = [];

    if (this.onPlaybackEnd) {
      this.onPlaybackEnd();
    }

    console.log('✅ Audio playback stopped');
  }

  async queueAudioChunk(chunkData) {
    if (!this.isPlaying) {
      console.warn('⚠️ Cannot queue audio: playback not started');
      return;
    }

    // Decode base64 to binary
    const binaryString = atob(chunkData);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert PCM to Float32
    const float32Data = this.pcm16ToFloat32(bytes);

    // Create audio buffer
    const audioBuffer = this.audioContext.createBuffer(
      this.config.channels,
      float32Data.length,
      this.config.sampleRate
    );

    audioBuffer.getChannelData(0).set(float32Data);

    // Add to playback queue
    this.playbackQueue.push(audioBuffer);
  }

  async processPlaybackQueue() {
    if (!this.isPlaying) {
      return;
    }

    if (this.playbackQueue.length === 0) {
      // Check again in 50ms
      setTimeout(() => this.processPlaybackQueue(), 50);
      return;
    }

    // Get next buffer
    const audioBuffer = this.playbackQueue.shift();

    // Create buffer source
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    // Play audio
    source.start(0);

    // Wait for audio to finish
    const duration = audioBuffer.duration * 1000;

    source.onended = () => {
      if (this.isPlaying) {
        this.processPlaybackQueue();
      }
    };
  }

  // === AUDIO FORMAT CONVERSION ===

  float32ToPCM16(float32Array) {
    const pcm16 = new Int16Array(float32Array.length);

    for (let i = 0; i < float32Array.length; i++) {
      // Clamp to [-1, 1]
      const clamped = Math.max(-1, Math.min(1, float32Array[i]));
      // Convert to 16-bit PCM
      pcm16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767;
    }

    return pcm16;
  }

  pcm16ToFloat32(pcm16Array) {
    const float32 = new Float32Array(pcm16Array.length / 2);
    const dataView = new DataView(pcm16Array.buffer);

    for (let i = 0; i < float32.length; i++) {
      const int16 = dataView.getInt16(i * 2, true); // little-endian
      float32[i] = int16 / (int16 < 0 ? 32768 : 32767);
    }

    return float32;
  }

  // === UTILITIES ===

  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('✅ Audio context resumed');
    }
  }

  getAudioContext() {
    return this.audioContext;
  }

  getMediaStream() {
    return this.mediaStream;
  }

  isAudioCapturing() {
    return this.isCapturing;
  }

  isAudioPlaying() {
    return this.isPlaying;
  }

  getCaptureSequence() {
    return this.captureSequence;
  }

  getPlaybackQueueSize() {
    return this.playbackQueue.length;
  }

  // === EVENT EMITTERS ===

  emitError(error) {
    if (this.onError) {
      this.onError(error);
    }
  }

  // === CLEANUP ===

  destroy() {
    console.log('🗑️ Destroying audio stream handler...');

    this.stopCapture();
    this.stopPlayback();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.socketClient = null;

    console.log('✅ Audio stream handler destroyed');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioStreamHandler;
}
