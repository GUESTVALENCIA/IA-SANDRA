# SANDRA IA - AUDIO STREAMING IMPLEMENTATION GUIDE

## 🎵 Overview

Esta guía detalla la implementación completa del sistema de audio streaming bidireccional para Sandra IA, incluyendo captura, procesamiento, transmisión y reproducción de audio en tiempo real.

---

## 🏗️ Audio Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUDIO PIPELINE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER AUDIO (Capture → Send)                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Microphone → getUserMedia → AudioContext → Analyzer      │  │
│  │     ↓                                                     │  │
│  │ ScriptProcessor/AudioWorklet → Float32 → Int16 PCM       │  │
│  │     ↓                                                     │  │
│  │ Chunk (4096 bytes) → Socket.IO emit 'audio:chunk'        │  │
│  │     ↓                                                     │  │
│  │ Backend Buffer → [TODO] STT → Claude Processing          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  SANDRA AUDIO (Receive → Play)                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Claude Response → Cartesia TTS → PCM Audio Stream        │  │
│  │     ↓                                                     │  │
│  │ Chunk (4096 bytes) → Socket.IO emit 'sandra:audio:chunk' │  │
│  │     ↓                                                     │  │
│  │ Base64 decode → Int16 PCM → Float32                      │  │
│  │     ↓                                                     │  │
│  │ AudioBuffer → Queue → BufferSource → AudioContext dest   │  │
│  │     ↓                                                     │  │
│  │ Avatar Sync (RMS analysis → Mouth animation)             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 Audio Formats

### Browser Capture (Web Audio API)
- **Format:** Float32Array (normalized -1.0 to 1.0)
- **Sample Rate:** 44100 Hz
- **Channels:** 1 (mono)
- **Buffer Size:** 4096 samples

### Transmission (Socket.IO)
- **Format:** Int16 PCM (little-endian)
- **Encoding:** Base64 for JSON transmission
- **Chunk Size:** 4096 bytes
- **Sequence Numbers:** Incremental for ordering

### Backend Processing
- **Format:** Buffer (Node.js)
- **Storage:** In-memory array of chunks
- **Merging:** Concatenate by sequence number

### TTS Output (Cartesia)
- **Format:** PCM F32LE (Float32 Little-Endian)
- **Sample Rate:** 44100 Hz
- **Streaming:** Yes (chunked response)

---

## 🎤 Audio Capture Implementation

### 1. Initialize Audio Context

```javascript
const audioContext = new (window.AudioContext || window.webkitAudioContext)({
  sampleRate: 44100
});

// Resume if suspended (required by browsers)
if (audioContext.state === 'suspended') {
  await audioContext.resume();
}
```

### 2. Get User Media

```javascript
const mediaStream = await navigator.mediaDevices.getUserMedia({
  audio: {
    sampleRate: 44100,
    channelCount: 1,
    autoGainControl: true,
    echoCancellation: true,
    noiseSuppression: true
  }
});
```

### 3. Create Audio Source

```javascript
const audioSource = audioContext.createMediaStreamSource(mediaStream);
```

### 4. Process Audio Chunks

#### Option A: ScriptProcessorNode (Deprecated but widely supported)

```javascript
const processor = audioContext.createScriptProcessor(4096, 1, 1);

processor.onaudioprocess = (event) => {
  const inputData = event.inputBuffer.getChannelData(0); // Float32Array

  // Convert to Int16 PCM
  const pcmData = float32ToPCM16(inputData);

  // Send via Socket.IO
  socketClient.sendAudioChunk(Array.from(pcmData), sequenceNumber++);
};

audioSource.connect(processor);
processor.connect(audioContext.destination);
```

#### Option B: AudioWorklet (Modern, better performance)

```javascript
// Register worklet processor
await audioContext.audioWorklet.addModule('audio-processor-worklet.js');

// Create worklet node
const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');

workletNode.port.onmessage = (event) => {
  const pcmData = event.data.pcm; // Int16Array
  socketClient.sendAudioChunk(Array.from(pcmData), sequenceNumber++);
};

audioSource.connect(workletNode);
workletNode.connect(audioContext.destination);
```

### 5. Format Conversion

```javascript
function float32ToPCM16(float32Array) {
  const pcm16 = new Int16Array(float32Array.length);

  for (let i = 0; i < float32Array.length; i++) {
    // Clamp to [-1, 1]
    const clamped = Math.max(-1, Math.min(1, float32Array[i]));
    // Convert to 16-bit PCM
    pcm16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767;
  }

  return pcm16;
}
```

---

## 🔊 Audio Playback Implementation

### 1. Receive Audio Chunks

```javascript
socketClient.onSandraAudioChunk = (data) => {
  // data.chunk is base64 encoded Int16 PCM
  audioStreamHandler.queueAudioChunk(data.chunk);
};
```

### 2. Decode and Convert

```javascript
async queueAudioChunk(chunkData) {
  // Decode base64
  const binaryString = atob(chunkData);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert Int16 PCM to Float32
  const float32Data = pcm16ToFloat32(bytes);

  // Create audio buffer
  const audioBuffer = audioContext.createBuffer(
    1, // channels
    float32Data.length,
    44100 // sample rate
  );

  audioBuffer.getChannelData(0).set(float32Data);

  // Add to playback queue
  this.playbackQueue.push(audioBuffer);
}
```

### 3. Format Conversion

```javascript
function pcm16ToFloat32(pcm16Array) {
  const float32 = new Float32Array(pcm16Array.length / 2);
  const dataView = new DataView(pcm16Array.buffer);

  for (let i = 0; i < float32.length; i++) {
    const int16 = dataView.getInt16(i * 2, true); // little-endian
    float32[i] = int16 / (int16 < 0 ? 32768 : 32767);
  }

  return float32;
}
```

### 4. Process Playback Queue

```javascript
async processPlaybackQueue() {
  if (!this.isPlaying || this.playbackQueue.length === 0) {
    setTimeout(() => this.processPlaybackQueue(), 50);
    return;
  }

  // Get next buffer
  const audioBuffer = this.playbackQueue.shift();

  // Create buffer source
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);

  // Play audio
  source.start(0);

  // Wait for completion
  source.onended = () => {
    this.processPlaybackQueue();
  };
}
```

---

## 🎙️ Backend Audio Processing

### 1. Receive Audio Chunks

```javascript
socket.on('audio:chunk', (data) => {
  const session = sessions.get(socket.id);
  const { chunk, sequence } = data;

  session.audioBuffer.push({ chunk, sequence });
});
```

### 2. Process Complete Audio

```javascript
socket.on('audio:end', async (data) => {
  const session = sessions.get(socket.id);

  // Sort chunks by sequence
  const sortedChunks = session.audioBuffer
    .sort((a, b) => a.sequence - b.sequence)
    .map(item => item.chunk);

  // Concatenate audio data
  const audioData = Buffer.concat(
    sortedChunks.map(chunk => Buffer.from(chunk))
  );

  // TODO: Speech-to-Text conversion
  const transcription = await speechToText(audioData);

  // Process with Claude
  const response = await getClaudeResponse(transcription);

  // Generate TTS
  await generateAndStreamTTS(socket, response);

  // Clear buffer
  session.audioBuffer = [];
});
```

### 3. Generate TTS (Cartesia)

```javascript
async function generateAndStreamTTS(socket, text) {
  const response = await axios.post(
    'https://api.cartesia.ai/tts/bytes',
    {
      model_YOUR_ELEVENLABS_KEY_HERE: 'sonic-english',
      transcript: text,
      voice: {
        mode: 'id',
        id: process.env.CARTESIA_VOICE_ID
      },
      output_format: {
        container: 'raw',
        encoding: 'pcm_f32le',
        sample_rate: 44100
      },
      language: 'es'
    },
    {
      headers: {
        'X-API-Key': process.env.CARTESIA_API_KEY,
        'Cartesia-Version': '2024-06-10'
      },
      responseType: 'stream'
    }
  );

  // Emit start event
  socket.emit('sandra:audio:start', { timestamp: Date.now() });

  // Stream audio chunks
  const stream = response.data;
  let buffer = Buffer.alloc(0);
  const chunkSize = 4096;

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= chunkSize) {
      const outputChunk = buffer.slice(0, chunkSize);
      buffer = buffer.slice(chunkSize);

      // Send chunk to client (base64 encoded)
      socket.emit('sandra:audio:chunk', {
        chunk: outputChunk.toString('base64'),
        timestamp: Date.now()
      });
    }
  }

  // Send remaining buffer
  if (buffer.length > 0) {
    socket.emit('sandra:audio:chunk', {
      chunk: buffer.toString('base64'),
      timestamp: Date.now()
    });
  }

  // Emit end event
  socket.emit('sandra:audio:end', { timestamp: Date.now() });
}
```

---

## 🎭 Avatar Sync Integration

### 1. Connect Audio Source

```javascript
avatarSync.onSandraAudioStart = () => {
  const audioElement = new Audio();
  audioElement.srcObject = remoteAudioStream;

  avatarSync.connectAudioSource(audioElement);
  avatarSync.start();
};
```

### 2. Analyze Audio

```javascript
animate() {
  if (!this.isAnimating || !this.analyser) return;

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
  this.smoothedRMS = (0.85 * this.smoothedRMS) + (0.15 * rms);

  // Calculate mouth scale
  const scale = this.calculateMouthScale(this.smoothedRMS);
  this.setMouthScale(scale);

  // Continue animation loop
  requestAnimationFrame(() => this.animate());
}
```

### 3. Update Mouth Animation

```javascript
setMouthScale(scale) {
  this.currentScale = scale;

  if (this.mouthElement) {
    this.mouthElement.style.transform = `translateX(-50%) scaleY(${scale})`;
  }
}

calculateMouthScale(rms) {
  const amplified = rms * 1.8; // Amplification factor
  return Math.max(0.08, Math.min(1.0, amplified)); // Clamp [0.08, 1.0]
}
```

---

## 🛑 Barge-In Implementation

### 1. VAD Monitoring

```javascript
analyze() {
  if (!this.analyser) return;

  const bufferLength = this.analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  this.analyser.getByteTimeDomainData(dataArray);

  // Calculate RMS
  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    const normalized = (dataArray[i] - 128) / 128;
    sum += normalized * normalized;
  }

  const rms = Math.sqrt(sum / bufferLength);

  // Apply smoothing
  this.smoothedVolume = (0.9 * this.smoothedVolume) + (0.1 * rms);

  // Detect speech
  if (this.smoothedVolume > 0.05) {
    this.speechFrameCount++;

    if (!this.isSpeaking && this.speechFrameCount >= 3) {
      this.handleSpeechStart();
    }
  } else {
    this.silenceFrameCount++;

    if (this.isSpeaking && this.silenceFrameCount >= 5) {
      this.handleSpeechEnd();
    }
  }
}
```

### 2. Trigger Barge-In

```javascript
handleSpeechStart() {
  this.isSpeaking = true;

  // Check if Sandra is speaking
  if (this.remoteAudioPlaying && this.bargeInEnabled) {
    this.triggerBargeIn();
  }
}

triggerBargeIn() {
  // Debounce to avoid false triggers
  clearTimeout(this.bargeInTimeout);

  this.bargeInTimeout = setTimeout(() => {
    console.log('🛑 BARGE-IN TRIGGERED');

    // Stop local playback
    avatarSync.stop();
    audioStreamHandler.stopPlayback();

    // Signal backend
    socketClient.triggerBargeIn();

    // Visual feedback
    updateState('🛑 Interrupted');
  }, 100); // 100ms delay
}
```

### 3. Backend Handling

```javascript
socket.on('barge-in', (data) => {
  const session = sessions.get(socket.id);

  console.log(`🛑 BARGE-IN from ${session.userId}`);

  // Stop TTS generation (if streaming)
  // Clear audio buffers
  session.audioBuffer = [];

  // Acknowledge
  socket.emit('barge-in:ack', { timestamp: Date.now() });

  // Signal client to stop playback
  socket.emit('sandra:interrupted', { timestamp: Date.now() });
});
```

---

## ⚡ Performance Optimization

### 1. Reduce Latency

```javascript
// Use smaller chunk sizes for faster transmission
const CHUNK_SIZE = 2048; // Instead of 4096

// Use WebSocket transport only (skip polling)
const socketClient = new SocketClient({
  transports: ['websocket']
});

// Preload Cartesia voice model
await audioProcessor.preloadVoiceModel();
```

### 2. Buffer Management

```javascript
// Limit audio buffer size to prevent memory issues
if (session.audioBuffer.length > 100) {
  console.warn('Audio buffer too large, clearing oldest chunks');
  session.audioBuffer = session.audioBuffer.slice(-100);
}

// Clear buffers after processing
session.audioBuffer = [];
```

### 3. Audio Compression (Future)

```javascript
// Use Opus codec for smaller payload
// Requires opus-encoder library
const encoder = new OpusEncoder(44100, 1);
const compressedChunk = encoder.encode(pcmData);

// 50-70% size reduction vs raw PCM
```

---

## 📊 Monitoring & Debugging

### Client-Side Metrics

```javascript
const metrics = audioStreamHandler.getMetrics();
console.log({
  captureSequence: audioStreamHandler.getCaptureSequence(),
  playbackQueueSize: audioStreamHandler.getPlaybackQueueSize(),
  isCapturing: audioStreamHandler.isAudioCapturing(),
  isPlaying: audioStreamHandler.isAudioPlaying()
});
```

### Backend Metrics

```javascript
console.log({
  audioBufferSize: session.audioBuffer.length,
  totalChunks: session.audioBuffer.reduce((sum, c) => sum + c.chunk.length, 0),
  sessionDuration: Date.now() - session.createdAt
});
```

### Latency Measurement

```javascript
// Client: Send timestamp with audio chunk
socketClient.sendAudioChunk(pcmData, sequence, Date.now());

// Backend: Calculate latency
const latency = Date.now() - chunk.timestamp;
console.log(`Audio chunk latency: ${latency}ms`);
```

---

## 🐛 Troubleshooting

### No Audio Capture

**Problem:** getUserMedia fails
- **Solution:** Check microphone permissions in browser
- **Solution:** Ensure HTTPS (required for getUserMedia)
- **Solution:** Check if microphone is in use by another app

### No Audio Playback

**Problem:** AudioContext suspended
- **Solution:** Resume AudioContext on user gesture (click)
- **Solution:** Call `audioContext.resume()` before playback

**Problem:** Audio chunks not queuing
- **Solution:** Verify `onSandraAudioChunk` handler is set
- **Solution:** Check base64 decoding
- **Solution:** Verify Socket.IO events are received

### Choppy Audio

**Problem:** Playback stutters
- **Solution:** Increase playback buffer size
- **Solution:** Reduce chunk size for faster processing
- **Solution:** Check network latency

### Barge-In Not Working

**Problem:** Doesn't detect interruption
- **Solution:** Lower VAD threshold (e.g., 0.03 instead of 0.05)
- **Solution:** Verify `remoteAudioPlaying` flag is set correctly
- **Solution:** Increase barge-in delay if too sensitive

---

## 🔮 Future Enhancements

1. **Speech-to-Text Integration**
   - Whisper API for accurate transcription
   - Real-time streaming STT

2. **Audio Effects**
   - Noise reduction
   - Echo cancellation improvements
   - Voice enhancement

3. **Compression**
   - Opus codec integration
   - Reduce bandwidth by 50-70%

4. **Recording**
   - Save conversations to WAV/MP3
   - Download feature

5. **Multi-Language Support**
   - Auto-detect language
   - Switch TTS voices

---

## 📚 API Reference

### AudioStreamHandler

```javascript
class AudioStreamHandler {
  constructor(config)
  async initialize(socketClient)

  // Capture
  async startCapture()
  stopCapture()

  // Playback
  async startPlayback()
  stopPlayback()
  async queueAudioChunk(chunkData)

  // Utilities
  getAudioContext()
  getMediaStream()
  isAudioCapturing()
  isAudioPlaying()

  // Cleanup
  destroy()
}
```

### AudioProcessor (Backend)

```javascript
class AudioProcessor {
  constructor(config)

  // TTS
  async textToSpeech(text, options)
  async *textToSpeechStream(text, options)

  // Format Conversion
  pcmToWav(pcmData, options)
  webmToWav(webmData)

  // Analysis
  calculateRMS(audioBuffer)
  detectSilence(audioBuffer, threshold)
  trimSilence(audioBuffer, threshold)

  // Effects
  normalizeVolume(audioBuffer, targetRMS)
  applyFadeIn(audioBuffer, durationMs)
  applyFadeOut(audioBuffer, durationMs)

  // Utilities
  getDuration(audioBuffer)
  getSizeInKB(audioBuffer)
  getMetrics()
}
```

---

**Last Updated:** 2025-10-28
**Version:** 1.0.0
**Author:** ClayTom Systems - Backend Architect
