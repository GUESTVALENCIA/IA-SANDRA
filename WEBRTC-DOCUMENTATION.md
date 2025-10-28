# Sandra IA - WebRTC Real-Time Communication System
## Technical Documentation

**Version:** 1.0.0
**Date:** 2025-10-28
**Status:** Implementation Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Configuration](#configuration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Performance Optimization](#performance-optimization)
10. [Security Considerations](#security-considerations)

---

## System Overview

### Purpose

Sandra IA WebRTC system enables real-time bidirectional audio communication with:
- **Low latency audio streaming** (< 500ms target)
- **Barge-in capability** (interrupt Sandra when user speaks)
- **Avatar lip sync** (mouth animation synchronized with audio)
- **Voice Activity Detection** (automatic speech detection)

### Key Features

- ✅ Peer-to-peer WebRTC audio streaming
- ✅ ICE candidate exchange via signaling server
- ✅ Voice Activity Detection (VAD) for barge-in
- ✅ Real-time lip sync animation
- ✅ Automatic reconnection on failure
- ✅ Fallback to existing REST API system
- ✅ iOS Safari compatibility

### Technology Stack

**Frontend:**
- WebRTC API (native browser)
- Web Audio API (audio analysis)
- MediaStream API (microphone access)

**Backend:**
- Netlify Functions (signaling server)
- Node.js serverless architecture

**Optional Enhancement:**
- Media server (Janus, mediasoup, Kurento) for production scaling

---

## Architecture

### High-Level Architecture

```
┌─────────────┐                  ┌─────────────┐
│   Browser   │                  │   Browser   │
│  (Sandra)   │                  │   (User)    │
├─────────────┤                  ├─────────────┤
│ WebRTC      │◄────────────────►│ WebRTC      │
│ Client      │    Peer-to-Peer  │ Client      │
│             │     Audio/Data   │             │
└──────┬──────┘                  └──────┬──────┘
       │                                 │
       │         Signaling Only          │
       └────────►┌──────────────┐◄───────┘
                 │   Netlify    │
                 │  Functions   │
                 │  (Signaling) │
                 └──────────────┘
```

### Data Flow

#### 1. Connection Establishment
```
User                    Signaling Server              Remote Peer
 │                              │                          │
 │─── getUserMedia() ─────────►│                          │
 │                              │                          │
 │─── Create PeerConnection ───│                          │
 │                              │                          │
 │─── Create Offer ───────────►│                          │
 │                              │                          │
 │                              │───── Store Offer ───────►│
 │                              │                          │
 │                              │◄──── Generate Answer ────│
 │                              │                          │
 │◄─── Receive Answer ─────────│                          │
 │                              │                          │
 │─── Exchange ICE Candidates ►│◄─ Exchange ICE ──────────│
 │                              │                          │
 │◄─────────── Peer-to-Peer Audio Connection ────────────►│
```

#### 2. Barge-In Flow
```
User Speaking          VAD Handler          Audio Player
      │                      │                     │
      │──── Voice Input ────►│                     │
      │                      │                     │
      │                      │─── Detect Speech ──►│
      │                      │                     │
      │                      │                  [Sandra
      │                      │                   Speaking]
      │                      │                     │
      │                      │─── Barge-In! ──────►│
      │                      │                     │
      │                      │                  [Stop
      │                      │                   Audio]
      │                      │                     │
```

#### 3. Avatar Sync Flow
```
Audio Buffer     Analyser Node     Avatar Sync     Mouth Element
     │                  │                │               │
     │─── Audio Data ──►│                │               │
     │                  │                │               │
     │                  │─── RMS ───────►│               │
     │                  │   Analysis     │               │
     │                  │                │               │
     │                  │                │─── Scale ────►│
     │                  │                │   Update      │
     │                  │                │               │
     │                  │                │            [Animate
     │                  │                │             Mouth]
```

---

## Components

### 1. WebRTC Client (`webrtc-client.js`)

**Purpose:** Manages peer-to-peer connection setup and audio streaming.

**Key Methods:**

```javascript
// Initialize client with microphone access
await webrtcClient.initialize();

// Create and send offer to signaling server
await webrtcClient.createOffer();

// Handle answer from remote peer
await webrtcClient.handleAnswer(answer);

// Send metadata through data channel
webrtcClient.sendMetadata('barge_in', { timestamp: Date.now() });

// Close connection
await webrtcClient.close();
```

**Events:**

```javascript
webrtcClient.onConnected = () => {
  console.log('WebRTC connected');
};

webrtcClient.onDisconnected = () => {
  console.log('WebRTC disconnected');
};

webrtcClient.onRemoteAudio = (stream) => {
  // Play remote audio stream
  const audio = new Audio();
  audio.srcObject = stream;
  audio.play();
};

webrtcClient.onError = (error) => {
  console.error('WebRTC error:', error);
};

webrtcClient.onStateChange = (state) => {
  console.log('State changed:', state);
};
```

**Configuration:**

```javascript
const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ],
  audioConstraints: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100
    }
  },
  signalingEndpoint: '/api/webrtc'
};

const client = new WebRTCClient(config);
```

---

### 2. VAD Handler (`vad-handler.js`)

**Purpose:** Detects voice activity and triggers barge-in when user speaks.

**Key Methods:**

```javascript
// Initialize with media stream
await vadHandler.initialize(mediaStream);

// Start voice detection
vadHandler.start();

// Stop voice detection
vadHandler.stop();

// Update threshold dynamically
vadHandler.setThreshold(0.08);

// Enable/disable barge-in
vadHandler.setBargeInEnabled(true);

// Set remote audio state
vadHandler.setRemoteAudioPlaying(true);
```

**Events:**

```javascript
vadHandler.onSpeechStart = () => {
  console.log('User started speaking');
};

vadHandler.onSpeechEnd = () => {
  console.log('User stopped speaking');
};

vadHandler.onBargeIn = () => {
  console.log('BARGE-IN: Interrupt Sandra!');
  // Stop current audio playback
  if (currentAudio) {
    currentAudio.stop();
  }
};

vadHandler.onVolumeChange = (volume) => {
  // Update volume meter UI
  volumeMeter.value = volume;
};
```

**Configuration:**

```javascript
const config = {
  threshold: 0.05,              // Voice detection threshold
  minSpeechFrames: 3,           // Frames to confirm speech
  minSilenceFrames: 5,          // Frames to confirm silence
  smoothingFactor: 0.9,         // Exponential smoothing
  bargeInEnabled: true,         // Enable barge-in
  bargeInDelay: 100             // ms delay before trigger
};

const vad = new VADHandler(config);
```

---

### 3. Avatar Sync (`avatar-sync.js`)

**Purpose:** Synchronizes avatar mouth animation with audio playback.

**Key Methods:**

```javascript
// Initialize with audio context
await avatarSync.initialize(audioContext);

// Connect audio source
avatarSync.connectAudioSource(audioElement);

// Start animation
avatarSync.start();

// Stop animation
avatarSync.stop();

// Update amplification
avatarSync.setAmplificationFactor(2.0);
```

**Events:**

```javascript
avatarSync.onAnimationFrame = (data) => {
  console.log('Animation frame:', data.rms, data.scale);
};

avatarSync.onScaleChange = (scale) => {
  console.log('Mouth scale:', scale);
};
```

**Configuration:**

```javascript
const config = {
  minMouthScale: 0.08,          // Minimum mouth openness
  maxMouthScale: 1.0,           // Maximum mouth openness
  amplificationFactor: 1.8,     // Audio amplification
  smoothingFactor: 0.85,        // Smoothing
  mouthElement: '#mouth',       // CSS selector or element
  updateInterval: 16            // ~60fps
};

const sync = new AvatarSync(config);
```

---

### 4. Signaling Server

#### Endpoints

**POST /api/webrtc/offer**
- Receives WebRTC offer from client
- Stores session information
- Returns acknowledgment

Request:
```json
{
  "offer": {
    "type": "offer",
    "sdp": "v=0\r\no=- ..."
  },
  "sessionId": "sandra-1234567890-abc123"
}
```

Response:
```json
{
  "success": true,
  "sessionId": "sandra-1234567890-abc123",
  "status": "offer_received"
}
```

**POST /api/webrtc/answer**
- Generates WebRTC answer for client offer
- Returns SDP answer

**POST /api/webrtc/ice**
- Stores ICE candidate from client
- Enables ICE trickle

Request:
```json
{
  "sessionId": "sandra-1234567890-abc123",
  "candidate": {
    "candidate": "candidate:...",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

**GET /api/webrtc/ice?sessionId=xxx**
- Retrieves ICE candidates for session

Response:
```json
{
  "success": true,
  "sessionId": "sandra-1234567890-abc123",
  "candidates": [
    {
      "candidate": {...},
      "timestamp": 1635789012345
    }
  ]
}
```

---

## Integration Guide

### Step 1: Basic Setup

```javascript
// Import modules
const webrtcClient = new WebRTCClient({ signalingEndpoint: '/api/webrtc' });
const vadHandler = new VADHandler();
const avatarSync = new AvatarSync({ mouthElement: '#mouth' });

// Initialize
async function initWebRTC() {
  try {
    // 1. Initialize WebRTC client
    const success = await webrtcClient.initialize();
    if (!success) throw new Error('WebRTC init failed');

    // 2. Initialize VAD with microphone stream
    const stream = webrtcClient.getLocalStream();
    await vadHandler.initialize(stream);

    // 3. Initialize avatar sync
    await avatarSync.initialize();

    // 4. Create offer to establish connection
    await webrtcClient.createOffer();

    console.log('✅ WebRTC system ready');
  } catch (error) {
    console.error('❌ WebRTC setup failed:', error);
    // Fallback to REST API system
    useRestAPIFallback();
  }
}
```

### Step 2: Event Handlers

```javascript
// WebRTC connection events
webrtcClient.onConnected = () => {
  console.log('🔗 WebRTC connected');
  // Start VAD
  vadHandler.start();
};

webrtcClient.onRemoteAudio = (stream) => {
  console.log('📥 Receiving audio from Sandra');

  // Connect to avatar sync
  avatarSync.connectAudioSource(stream);
  avatarSync.start();

  // Notify VAD that remote audio is playing
  vadHandler.setRemoteAudioPlaying(true);

  // Play audio
  const audio = new Audio();
  audio.srcObject = stream;
  audio.play();

  audio.onended = () => {
    vadHandler.setRemoteAudioPlaying(false);
    avatarSync.stop();
  };
};

// VAD events
vadHandler.onBargeIn = () => {
  console.log('🛑 User interrupted Sandra');

  // Stop avatar animation
  avatarSync.stop();

  // Signal barge-in to remote peer
  webrtcClient.signalBargeIn();

  // Stop local audio playback
  // (handled by remote peer stopping transmission)
};

vadHandler.onSpeechStart = () => {
  console.log('🗣️ User speaking');
  // Update UI
  document.querySelector('#wave').classList.add('active');
};

vadHandler.onSpeechEnd = () => {
  console.log('🤐 User silent');
  // Update UI
  document.querySelector('#wave').classList.remove('active');
};
```

### Step 3: Fallback System

```javascript
// Maintain compatibility with existing REST API
let useWebRTC = false;

async function handleQuery(text) {
  if (useWebRTC && webrtcClient.isConnected()) {
    // Use WebRTC data channel
    webrtcClient.sendMetadata('user_query', { text });
  } else {
    // Fallback to REST API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content: text }]
      })
    });

    const data = await response.json();
    const answer = data.text;

    // Get TTS audio
    const ttsResponse = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: answer })
    });

    const ttsData = await ttsResponse.json();
    playBase64Audio(ttsData.audioBase64, ttsData.mime);
  }
}
```

---

## Configuration

### Environment Variables

Add to `.env`:

```bash
# WebRTC Configuration
WEBRTC_ENABLED=true
WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
WEBRTC_TURN_SERVER=turn:your-turn-server.com:3478
WEBRTC_TURN_USERNAME=username
WEBRTC_TURN_CREDENTIAL=password

# Optional: Media Server
MEDIA_SERVER_URL=https://your-media-server.com
MEDIA_SERVER_API_KEY=your_api_key
```

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebRTC | ✅ 88+ | ✅ 85+ | ✅ 14+ | ✅ 88+ |
| getUserMedia | ✅ | ✅ | ✅ | ✅ |
| Web Audio API | ✅ | ✅ | ✅ | ✅ |
| iOS Safari | - | - | ✅ 14+ | - |

### Performance Tuning

```javascript
// Low latency configuration
const lowLatencyConfig = {
  audioConstraints: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,      // Higher quality
      channelCount: 1,
      latency: 0.01           // 10ms latency target
    }
  }
};

// Battery saving configuration
const batterySavingConfig = {
  audioConstraints: {
    audio: {
      sampleRate: 16000,      // Lower quality
      channelCount: 1
    }
  },
  vadConfig: {
    updateInterval: 200       // Less frequent checks
  },
  avatarConfig: {
    updateInterval: 33        // 30fps instead of 60fps
  }
};
```

---

## Testing

### Manual Testing Checklist

#### Connection Establishment
- [ ] Microphone permission granted
- [ ] WebRTC peer connection established
- [ ] ICE candidates exchanged successfully
- [ ] Data channel opened
- [ ] Audio tracks transmitted bidirectionally

#### Voice Activity Detection
- [ ] VAD detects user speech
- [ ] VAD detects silence
- [ ] Threshold adjustable
- [ ] False positives minimal

#### Barge-In Functionality
- [ ] User speech detected during Sandra playback
- [ ] Sandra audio stops immediately
- [ ] Visual feedback shown
- [ ] No audio artifacts

#### Avatar Synchronization
- [ ] Mouth animates with audio
- [ ] Sync timing accurate (< 100ms lag)
- [ ] Animation smooth (no jitter)
- [ ] Scales correctly with volume

#### Error Handling
- [ ] Microphone denied → fallback to REST API
- [ ] Connection lost → automatic reconnection
- [ ] Signaling error → clear error message
- [ ] Browser not supported → fallback shown

### Automated Tests

```javascript
// Example: Test WebRTC initialization
describe('WebRTCClient', () => {
  it('should initialize successfully', async () => {
    const client = new WebRTCClient();
    const result = await client.initialize();
    expect(result).toBe(true);
    expect(client.getLocalStream()).toBeDefined();
  });

  it('should create offer', async () => {
    const client = new WebRTCClient();
    await client.initialize();
    const result = await client.createOffer();
    expect(result).toBe(true);
  });
});

// Example: Test VAD
describe('VADHandler', () => {
  it('should detect speech', async () => {
    const vad = new VADHandler({ threshold: 0.05 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    await vad.initialize(stream);

    let speechDetected = false;
    vad.onSpeechStart = () => { speechDetected = true; };

    vad.start();
    // Simulate speaking...
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(speechDetected).toBe(true);
  });
});
```

### Performance Benchmarks

**Target Metrics:**
- Connection establishment: < 2 seconds
- Audio latency: < 500ms
- VAD reaction time: < 200ms
- Avatar sync lag: < 100ms
- CPU usage: < 15%
- Memory usage: < 50MB

---

## Troubleshooting

### Common Issues

#### 1. Microphone Access Denied

**Symptom:** getUserMedia() fails with NotAllowedError

**Solution:**
```javascript
try {
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    alert('Please allow microphone access to use voice features');
    // Fallback to text-only mode
    useTextOnlyMode();
  }
}
```

#### 2. Connection Failed

**Symptom:** ICE connection state remains 'checking' or goes to 'failed'

**Solutions:**
- Check STUN/TURN server configuration
- Verify firewall allows WebRTC traffic
- Test with different ICE servers
- Enable verbose logging: `RTCPeerConnection.trace = true`

#### 3. No Audio Received

**Symptom:** ontrack event not firing

**Solutions:**
- Verify tracks added to peer connection
- Check audio element connected correctly
- Ensure audio context resumed (user gesture required)
- Test with different codecs

#### 4. High Latency

**Symptom:** Delay > 1 second

**Solutions:**
- Reduce audio buffer size
- Use lower sample rate
- Check network quality
- Consider using TURN server instead of STUN

#### 5. Barge-In Not Working

**Symptom:** VAD not detecting speech during playback

**Solutions:**
- Adjust VAD threshold
- Verify microphone not muted
- Check echo cancellation settings
- Increase minSpeechFrames

---

## Performance Optimization

### 1. Connection Optimization

```javascript
// Use multiple STUN servers for faster ICE gathering
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.services.mozilla.com' }
];

// Enable ICE trickle for faster connection
const config = {
  iceServers,
  iceCandidatePoolSize: 10  // Pre-gather candidates
};
```

### 2. Audio Quality vs Bandwidth

```javascript
// High quality (more bandwidth)
audio: {
  sampleRate: 48000,
  bitrate: 128000
}

// Low bandwidth (acceptable quality)
audio: {
  sampleRate: 16000,
  bitrate: 24000
}
```

### 3. CPU Optimization

```javascript
// Reduce analyser FFT size for better performance
analyser.fftSize = 1024;  // Instead of 2048

// Reduce animation frame rate on low-end devices
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
const updateInterval = isMobile ? 33 : 16;  // 30fps vs 60fps
```

### 4. Memory Management

```javascript
// Clean up resources when not needed
function cleanup() {
  vadHandler.destroy();
  avatarSync.destroy();
  webrtcClient.close();

  // Release audio context
  if (audioContext.state !== 'closed') {
    audioContext.close();
  }
}

// Listen for page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cleanup();
  }
});
```

---

## Security Considerations

### 1. HTTPS Required

WebRTC requires HTTPS in production. Ensure:
- SSL certificate valid
- No mixed content warnings
- Secure WebSocket (wss://) if using WebSocket signaling

### 2. Permissions

- Request microphone only when needed
- Explain why permission needed
- Handle denials gracefully
- Respect user privacy

### 3. Data Validation

```javascript
// Validate signaling messages
function validateOffer(offer) {
  if (!offer || typeof offer !== 'object') return false;
  if (offer.type !== 'offer') return false;
  if (!offer.sdp || typeof offer.sdp !== 'string') return false;
  return true;
}

// Sanitize data channel messages
function sanitizeMessage(data) {
  try {
    const parsed = JSON.parse(data);
    // Validate structure
    if (!parsed.type || typeof parsed.type !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}
```

### 4. Rate Limiting

```javascript
// Limit signaling requests
const rateLimiter = {
  requests: 0,
  maxRequests: 10,
  window: 60000, // 1 minute

  check() {
    if (this.requests >= this.maxRequests) {
      throw new Error('Rate limit exceeded');
    }
    this.requests++;
    setTimeout(() => this.requests--, this.window);
  }
};
```

---

## Future Enhancements

### 1. Media Server Integration

For production scale, integrate media server:

**Options:**
- **Janus Gateway** (C, WebRTC gateway)
- **mediasoup** (Node.js, SFU)
- **Kurento** (Java, media server)
- **Jitsi** (full video conferencing stack)

**Benefits:**
- Better scalability
- Recording capabilities
- Mixing multiple streams
- Transcoding support

### 2. Advanced Features

- **Voice cloning:** Use Cartesia voice cloning API
- **Emotion detection:** Analyze audio for emotional state
- **Multi-language:** Real-time translation
- **Screen sharing:** Share screen during conversation
- **Video avatar:** 3D avatar with full facial animation

### 3. Analytics

```javascript
// Track WebRTC metrics
const metrics = {
  connectionTime: 0,
  audioLatency: 0,
  packetsLost: 0,
  bitrate: 0
};

setInterval(() => {
  peerConnection.getStats().then(stats => {
    stats.forEach(stat => {
      if (stat.type === 'inbound-rtp' && stat.kind === 'audio') {
        metrics.packetsLost = stat.packetsLost;
        metrics.bitrate = stat.bytesReceived * 8 / 1000; // kbps
      }
    });

    // Send to analytics service
    sendMetrics(metrics);
  });
}, 5000);
```

---

## Support

For issues or questions:
- **GitHub Issues:** https://github.com/your-repo/issues
- **Documentation:** https://sandra.guestsvalencia.es/docs
- **Email:** support@guestsvalencia.es

---

**Last Updated:** 2025-10-28
**Version:** 1.0.0
**License:** Proprietary - GuestsValencia
