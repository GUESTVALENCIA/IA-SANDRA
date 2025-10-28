# SANDRA IA - WEBSOCKET & SOCKET.IO ARCHITECTURE

## 🏗️ System Overview

Sandra IA utiliza una arquitectura de comunicación en tiempo real basada en **Socket.IO** con soporte **WebRTC** para audio bidireccional, **VAD (Voice Activity Detection)** para detección de voz, y **Avatar Sync** para sincronización de labios en tiempo real.

```
┌─────────────────────────────────────────────────────────────────┐
│                    SANDRA IA ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   Frontend   │◄───────►│   Backend    │                     │
│  │  (Browser)   │  WS/WSS │  (Netlify)   │                     │
│  └──────┬───────┘         └──────┬───────┘                     │
│         │                        │                              │
│         ├─Socket.IO Client       ├─Socket.IO Server            │
│         ├─WebRTC Peer            ├─WebRTC Signaling            │
│         ├─VAD Handler            ├─Audio Processor             │
│         ├─Avatar Sync            ├─Session Manager             │
│         └─Audio Stream Handler   └─Socket Handlers             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 Communication Layers

### 1. Socket.IO Layer (Primary)
**Purpose:** Real-time bidirectional event-based communication
- **Protocol:** WebSocket (primary) + HTTP Long Polling (fallback)
- **Namespace:** `/sandra`
- **Rooms:** User-specific rooms (`user_{userId}`)
- **Transports:** `['websocket', 'polling']`

### 2. WebRTC Layer (Audio Peer-to-Peer)
**Purpose:** Low-latency audio streaming
- **Protocol:** WebRTC with STUN/TURN servers
- **Signaling:** HTTP endpoints (`/api/webrtc/offer`, `/api/webrtc/answer`, `/api/webrtc/ice`)
- **Audio:** Bidirectional PCM audio streams

### 3. HTTP REST API (Fallback)
**Purpose:** Non-real-time operations
- **Endpoints:** `/api/chat`, `/api/tts`, `/api/health`

---

## 🔌 Socket.IO Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticate` | `{ userId, token }` | Authenticate user and join room |
| `call:start` | `{ timestamp }` | Start conversation session |
| `call:end` | `{ timestamp }` | End conversation session |
| `user:message` | `{ message, type }` | Send text message to Sandra |
| `barge-in` | `{ timestamp }` | User interrupted Sandra (barge-in) |
| `audio:stream` | `{ timestamp }` | Start audio streaming |
| `audio:chunk` | `{ chunk, sequence }` | Send audio chunk (PCM) |
| `audio:end` | `{ timestamp }` | End audio streaming |
| `state:update` | `{ state }` | Sync client state |
| `ping` | `{}` | Measure latency |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `authenticated` | `{ userId, roomId }` | Authentication successful |
| `call:started` | `{ timestamp }` | Call started successfully |
| `call:ended` | `{ duration }` | Call ended |
| `sandra:response` | `{ message, timestamp }` | Sandra's text response |
| `sandra:typing` | `{ isTyping }` | Sandra typing indicator |
| `sandra:interrupted` | `{ timestamp }` | Barge-in acknowledged |
| `sandra:audio:start` | `{ timestamp }` | Sandra audio starting |
| `sandra:audio:chunk` | `{ chunk (base64) }` | Sandra audio chunk |
| `sandra:audio:end` | `{ timestamp }` | Sandra audio ended |
| `audio:transcription` | `{ text, confidence }` | Speech-to-text result |
| `barge-in:ack` | `{ timestamp }` | Barge-in acknowledged |
| `pong` | `{ timestamp }` | Latency measurement response |
| `metrics` | `{ connections, sessions }` | Server metrics |
| `error` | `{ message }` | Error notification |

---

## 🎤 Audio Streaming Flow

### Capture Flow (User → Sandra)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User speaks                                                   │
│    └─> Microphone captures audio (getUserMedia)                │
│                                                                  │
│ 2. Audio Processing                                             │
│    └─> ScriptProcessor/AudioWorklet processes chunks           │
│    └─> Convert Float32 → Int16 PCM                            │
│    └─> Chunk size: 4096 bytes                                 │
│                                                                  │
│ 3. VAD Detection                                                │
│    └─> Analyze volume level (RMS)                             │
│    └─> Detect speech start/end                                │
│    └─> Trigger barge-in if Sandra speaking                    │
│                                                                  │
│ 4. Socket.IO Transmission                                       │
│    └─> Emit 'audio:chunk' with sequence number                │
│    └─> Latency target: < 50ms per chunk                       │
│                                                                  │
│ 5. Backend Processing                                           │
│    └─> Buffer audio chunks                                     │
│    └─> Merge chunks when stream ends                          │
│    └─> [TODO] Speech-to-Text (Whisper API)                    │
│    └─> Send to Claude Haiku                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Playback Flow (Sandra → User)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Sandra generates response                                     │
│    └─> Claude Haiku processes conversation                     │
│    └─> Generate text response                                  │
│                                                                  │
│ 2. Text-to-Speech                                               │
│    └─> Cartesia Sonic API (streaming)                         │
│    └─> Generate PCM audio chunks                              │
│    └─> Voice: Sandrita personalizada                          │
│                                                                  │
│ 3. Socket.IO Transmission                                       │
│    └─> Emit 'sandra:audio:start'                              │
│    └─> Stream 'sandra:audio:chunk' (base64 encoded)           │
│    └─> Emit 'sandra:audio:end' when complete                  │
│                                                                  │
│ 4. Client Playback                                              │
│    └─> Decode base64 → PCM bytes                              │
│    └─> Convert Int16 PCM → Float32                            │
│    └─> Queue in AudioBuffer                                    │
│    └─> Play via Web Audio API                                 │
│                                                                  │
│ 5. Avatar Sync                                                  │
│    └─> Analyze audio RMS                                       │
│    └─> Calculate mouth scale                                   │
│    └─> Animate mouth element (scaleY)                         │
│    └─> 60 FPS smooth animation                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛑 Barge-In System

### Detection Algorithm

```javascript
// VAD monitors user speech while Sandra is speaking

if (user_is_speaking && sandra_is_playing_audio) {
  // Wait for debounce period (100ms)
  if (speech_sustained_for > 100ms) {
    // TRIGGER BARGE-IN
    1. Stop Sandra's audio playback
    2. Stop avatar mouth animation
    3. Signal backend via Socket.IO
    4. Backend stops TTS generation
    5. Clear audio buffers
    6. Ready for new user input
  }
}
```

### Flow Diagram

```
User speaking? ──No──> Continue listening
     │
    Yes
     │
Sandra playing? ──No──> Normal VAD (no barge-in)
     │
    Yes
     │
Sustained > 100ms? ──No──> Wait
     │
    Yes
     │
  BARGE-IN TRIGGERED
     │
     ├─> Frontend: Stop audio + avatar
     ├─> Socket.IO: Emit 'barge-in'
     ├─> Backend: Stop TTS + clear buffers
     └─> UI: Visual feedback (🛑)
```

---

## 🔧 Backend Architecture

### Directory Structure

```
IA-SANDRA/
├── netlify/functions/
│   ├── socket-server.js         # Socket.IO server (main entry)
│   └── webrtc/
│       ├── offer.js             # WebRTC offer endpoint
│       ├── answer.js            # WebRTC answer endpoint
│       └── ice.js               # ICE candidate endpoint
│
├── lib/
│   ├── socket-handlers.js       # Socket.IO event handlers
│   ├── audio-processor.js       # Audio processing & TTS
│   └── session-manager.js       # Session storage (Redis/Memory)
│
└── public/js/
    ├── socket-client.js         # Socket.IO client
    ├── webrtc-client.js         # WebRTC peer connection
    ├── vad-handler.js           # Voice Activity Detection
    ├── avatar-sync.js           # Lip sync animation
    ├── audio-stream-handler.js  # Audio streaming manager
    └── sandra-realtime-integration.js  # Unified integration
```

### Component Responsibilities

#### 1. `socket-server.js` (Netlify Function)
- Initialize Socket.IO server
- Handle WebSocket upgrades
- Manage namespaces and rooms
- Health check endpoints

#### 2. `socket-handlers.js`
- Register all Socket.IO event listeners
- Handle authentication
- Process user messages
- Generate Sandra responses (Claude Haiku)
- Coordinate TTS generation
- Manage barge-in logic

#### 3. `audio-processor.js`
- Text-to-Speech via Cartesia API
- Audio format conversion (PCM ↔ WAV)
- Audio analysis (RMS, silence detection)
- Audio effects (normalization, fade in/out)
- Chunk management

#### 4. `session-manager.js`
- Session CRUD operations
- Conversation history storage
- Audio buffer management
- Redis integration (optional)
- Automatic cleanup of expired sessions

---

## 🌐 Frontend Architecture

### Component Responsibilities

#### 1. `socket-client.js`
- Socket.IO connection management
- Event emission and listening
- Authentication handling
- Latency measurement (ping/pong)
- Metrics tracking

#### 2. `webrtc-client.js`
- Peer connection setup
- Media stream management
- ICE candidate handling
- Data channel for metadata
- Reconnection logic

#### 3. `vad-handler.js`
- Real-time voice activity detection
- RMS calculation from audio stream
- Speech start/end detection
- Barge-in trigger logic
- Configurable thresholds

#### 4. `avatar-sync.js`
- Audio analysis for lip sync
- Mouth scale calculation
- Smooth animation (60 FPS)
- Phoneme-based sync (advanced)
- Configurable amplification

#### 5. `audio-stream-handler.js`
- Microphone capture
- PCM audio chunking
- Audio buffer management
- Playback queue
- Format conversion

#### 6. `sandra-realtime-integration.js`
- Unified system initialization
- Coordinate all components
- Handle UI events
- System state management
- Cleanup and shutdown

---

## 📊 Performance Metrics

### Latency Targets

| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| Socket.IO ping | < 50ms | < 100ms | > 200ms |
| Audio chunk send | < 50ms | < 100ms | > 150ms |
| TTS generation | < 300ms | < 500ms | > 1000ms |
| End-to-end latency | < 500ms | < 800ms | > 1500ms |
| Barge-in detection | < 100ms | < 200ms | > 300ms |
| Avatar sync FPS | 60 FPS | 30 FPS | < 20 FPS |

### Monitoring

```javascript
// Client-side metrics
const metrics = socketClient.getMetrics();
console.log({
  messagesSent: metrics.messagesSent,
  messagesReceived: metrics.messagesReceived,
  audioChunksSent: metrics.audioChunksSent,
  audioChunksReceived: metrics.audioChunksReceived,
  latency: metrics.latency
});

// Server-side metrics
GET /api/socket-server/metrics
{
  "connections": 42,
  "sessions": 38,
  "activeCalls": 15,
  "uptime": 3600
}
```

---

## 🔒 Security

### Authentication
- JWT tokens (TODO: implement)
- User ID validation
- Room isolation

### Data Protection
- WSS (WebSocket Secure) in production
- CORS configuration
- Rate limiting (TODO: implement)
- Input sanitization

---

## 🚀 Deployment

### Netlify Configuration

```toml
# netlify.toml
[build]
  publish = "public"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/socket.io/*"
  to = "/.netlify/functions/socket-server"
  status = 200
```

### Environment Variables

```bash
# LLM (Chat)
ANTHROPIC_API_KEY=sk-ant-YOUR_ANTHROPIC_API_KEY_HERE...

# TTS (Voice)
CARTESIA_API_KEY=sk_car_YOUR_CARTESIA_API_KEY_HERE...
CARTESIA_VOICE_ID=a34aec03-...

# Optional: Redis (for scaling)
REDIS_URL=redis://...
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Socket.IO connection establishes
- [ ] Authentication succeeds
- [ ] Call start/end works
- [ ] Text messages send/receive
- [ ] Audio streaming bidirectional
- [ ] VAD detects speech correctly
- [ ] Barge-in interrupts Sandra
- [ ] Avatar syncs with audio
- [ ] Latency < 500ms
- [ ] Mobile iOS works
- [ ] Mobile Android works
- [ ] Reconnection after disconnect

### Test Commands

```javascript
// Initialize system
await SandraRealtime.initialize();

// Start call
SandraRealtime.startCall();

// Send message
SandraRealtime.sendMessage('Hola Sandra, ¿cómo estás?');

// Check status
const status = SandraRealtime.getStatus();
console.log(status);

// End call
SandraRealtime.endCall();
```

---

## 🐛 Troubleshooting

### Connection Issues

**Problem:** Socket.IO won't connect
- Check browser console for errors
- Verify server is running: `GET /api/socket-server/health`
- Check CORS configuration
- Try polling transport first

**Problem:** WebRTC fails
- Check microphone permissions
- Verify STUN servers are accessible
- Check browser WebRTC support
- Fallback to Socket.IO audio streaming

### Audio Issues

**Problem:** No audio playback
- Check AudioContext state (may be suspended)
- Click page to resume AudioContext (browser requirement)
- Verify audio chunks are received
- Check browser console for errors

**Problem:** Barge-in not working
- Verify VAD threshold is appropriate
- Check if `remoteAudioPlaying` flag is set correctly
- Increase barge-in delay if too sensitive

---

## 📚 API Documentation

Complete API reference available in:
- `AUDIO-STREAMING-GUIDE.md` - Detailed audio implementation
- Source code comments in all modules
- JSDoc in function definitions

---

## 🔮 Future Enhancements

1. **Redis Adapter** - Horizontal scaling across multiple Netlify instances
2. **Speech-to-Text** - Whisper API integration for voice input
3. **End-to-End Encryption** - Encrypt audio before transmission
4. **Recording** - Save conversation audio for playback
5. **Multi-Device Sync** - Same conversation across devices
6. **Analytics** - Track usage, latency, errors

---

**Last Updated:** 2025-10-28
**Version:** 1.0.0
**Author:** ClayTom Systems - Backend Architect
