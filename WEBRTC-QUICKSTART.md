# Sandra IA - WebRTC Quick Start Guide

## Overview

This guide helps you quickly set up and test Sandra IA's WebRTC real-time audio system.

---

## Files Created

### Backend (Netlify Functions)
```
netlify/functions/webrtc/
├── offer.js       - Handles WebRTC offers
├── answer.js      - Generates WebRTC answers
└── ice.js         - Exchanges ICE candidates
```

### Frontend (JavaScript Modules)
```
public/js/
├── webrtc-client.js              - WebRTC peer connection manager
├── vad-handler.js                - Voice Activity Detection for barge-in
├── avatar-sync.js                - Lip sync animation system
└── sandra-webrtc-integration.js  - Integration with existing UI
```

### Documentation & Testing
```
WEBRTC-DOCUMENTATION.md    - Complete technical documentation
WEBRTC-QUICKSTART.md       - This file
public/webrtc-test.html    - Test interface
```

---

## Quick Start

### 1. Deploy to Netlify

```bash
# Deploy with WebRTC functions
npm run deploy

# Or deploy to staging first
npm run deploy:staging
```

### 2. Test WebRTC System

Visit: `https://sandra.guestsvalencia.es/webrtc-test.html`

**Test Steps:**
1. Click "Initialize WebRTC"
2. Allow microphone permission
3. Verify connection status shows "Connected"
4. Speak into microphone to test VAD
5. Check avatar mouth animation

### 3. Integrate with Existing App

Add to your HTML (before closing `</body>`):

```html
<!-- Load WebRTC modules -->
<script src="/js/webrtc-client.js"></script>
<script src="/js/vad-handler.js"></script>
<script src="/js/avatar-sync.js"></script>
<script src="/js/sandra-webrtc-integration.js"></script>

<!-- Initialize WebRTC -->
<script>
  // Option 1: Manual initialization
  document.getElementById('enableWebRTC').addEventListener('click', async () => {
    await SandraWebRTC.initialize();
  });

  // Option 2: Auto-initialize on user gesture
  document.addEventListener('click', async () => {
    if (!SandraWebRTC.isActive()) {
      await SandraWebRTC.initialize();
    }
  }, { once: true });
</script>
```

---

## Configuration

### Environment Variables

Add to `.env`:

```bash
# WebRTC Settings
WEBRTC_ENABLED=true
WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302

# Optional: TURN server for better connectivity
WEBRTC_TURN_SERVER=turn:your-turn-server.com:3478
WEBRTC_TURN_USERNAME=username
WEBRTC_TURN_CREDENTIAL=password
```

### JavaScript Configuration

Modify in `sandra-webrtc-integration.js`:

```javascript
const WEBRTC_CONFIG = {
  enabled: true,              // Enable/disable WebRTC
  signalingEndpoint: '/api/webrtc',
  fallbackToREST: true,      // Fallback to REST API if WebRTC fails
  autoStart: false,          // Auto-initialize on page load
  debug: true                // Enable debug logging
};
```

---

## Usage Examples

### Example 1: Check WebRTC Status

```javascript
const status = SandraWebRTC.getStatus();

console.log('WebRTC supported:', status.supported);
console.log('WebRTC connected:', status.connected);
console.log('VAD active:', status.vadActive);
console.log('Avatar animating:', status.avatarAnimating);
```

### Example 2: Manual Control

```javascript
// Initialize WebRTC
await SandraWebRTC.initialize();

// Check if should use WebRTC (vs REST API)
if (SandraWebRTC.shouldUse()) {
  console.log('Using WebRTC for communication');
} else {
  console.log('Using REST API fallback');
}

// Shutdown when done
await SandraWebRTC.shutdown();
```

### Example 3: Toggle WebRTC

```javascript
// Enable WebRTC
await SandraWebRTC.toggle(true);

// Disable WebRTC
await SandraWebRTC.toggle(false);
```

---

## Troubleshooting

### Issue: Microphone Permission Denied

**Solution:**
- Check browser permissions for microphone
- Ensure HTTPS is enabled (required for getUserMedia)
- Try in different browser

### Issue: Connection Failed

**Check:**
1. Network connectivity
2. Firewall allows WebRTC traffic (UDP ports)
3. STUN server accessible
4. Browser console for errors

**Fix:**
```javascript
// Add more STUN servers
const config = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};
```

### Issue: No Audio Received

**Check:**
- Audio context resumed (requires user gesture)
- Audio element connected correctly
- Remote tracks added to connection

**Fix:**
```javascript
// Ensure audio context is resumed
await audioContext.resume();

// Check ontrack handler is set up
webrtcClient.onRemoteAudio = (stream) => {
  const audio = new Audio();
  audio.srcObject = stream;
  audio.play();
};
```

### Issue: Barge-in Not Working

**Check:**
- VAD threshold (may need adjustment)
- Microphone working during Sandra speech
- Echo cancellation enabled

**Fix:**
```javascript
// Adjust VAD threshold
vadHandler.setThreshold(0.08); // Higher = less sensitive

// Enable barge-in explicitly
vadHandler.setBargeInEnabled(true);
```

### Issue: Avatar Not Syncing

**Check:**
- Audio source connected to avatar sync
- Mouth element exists in DOM
- Animation started

**Fix:**
```javascript
// Ensure mouth element is correct
const mouth = document.querySelector('#mouth');
if (!mouth) {
  console.error('Mouth element not found');
}

// Connect audio and start animation
avatarSync.connectAudioSource(stream);
avatarSync.start();
```

---

## Performance Tips

### 1. Reduce Latency

```javascript
const config = {
  audioConstraints: {
    audio: {
      latency: 0.01,        // 10ms target
      sampleRate: 48000,    // Higher quality
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  }
};
```

### 2. Optimize for Mobile

```javascript
// Detect mobile and adjust settings
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

const config = {
  audioConstraints: {
    audio: {
      sampleRate: isMobile ? 16000 : 44100,
      latency: isMobile ? 0.05 : 0.01
    }
  },
  vadConfig: {
    updateInterval: isMobile ? 200 : 100  // Less frequent on mobile
  }
};
```

### 3. Battery Saving Mode

```javascript
// Enable when on battery power
if ('getBattery' in navigator) {
  const battery = await navigator.getBattery();

  if (battery.level < 0.2) {
    vadHandler.setUpdateInterval(300);  // Check less frequently
    avatarSync.setUpdateInterval(50);   // 20fps instead of 60fps
  }
}
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebRTC | ✅ 88+ | ✅ 85+ | ✅ 14+ | ✅ 88+ |
| getUserMedia | ✅ | ✅ | ✅ | ✅ |
| Web Audio API | ✅ | ✅ | ✅ | ✅ |
| iOS Safari | - | - | ✅ 14+ | - |
| Android Chrome | ✅ 88+ | - | - | - |

**Notes:**
- HTTPS required for production
- Microphone permission required
- iOS Safari requires user gesture for audio

---

## Next Steps

1. **Test in production:** Deploy and test on actual devices
2. **Add TURN server:** For better connectivity in restrictive networks
3. **Implement media server:** Use Janus/mediasoup for scaling
4. **Add analytics:** Track connection quality and errors
5. **Optimize audio codec:** Test different codecs for quality/bandwidth

---

## API Endpoints

### POST /api/webrtc/offer
Store WebRTC offer from client

**Request:**
```json
{
  "offer": { "type": "offer", "sdp": "..." },
  "sessionId": "sandra-xxx"
}
```

### POST /api/webrtc/answer
Generate WebRTC answer

**Request:**
```json
{
  "sessionId": "sandra-xxx"
}
```

### POST /api/webrtc/ice
Store ICE candidate

**Request:**
```json
{
  "sessionId": "sandra-xxx",
  "candidate": { "candidate": "...", "sdpMid": "0" }
}
```

### GET /api/webrtc/ice?sessionId=xxx
Retrieve ICE candidates

---

## Resources

- **Full Documentation:** `WEBRTC-DOCUMENTATION.md`
- **Test Interface:** `https://sandra.guestsvalencia.es/webrtc-test.html`
- **WebRTC Specs:** https://webrtc.org/
- **MDN WebRTC API:** https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API

---

## Support

- **Issues:** Report in GitHub Issues
- **Email:** support@guestsvalencia.es
- **Docs:** https://sandra.guestsvalencia.es/docs

---

**Version:** 1.0.0
**Last Updated:** 2025-10-28
**Status:** Ready for Testing
