// ============================================
// HEYGEN STREAMING AVATAR INTEGRATION
// Professional video avatar with real-time lipsync
// CEO: Clayton Thomas - URGENT REQUIREMENT #5
// ============================================

// HeyGen State Management
let heygenSession = null;
let heygenPeerConnection = null;
let isHeygenActive = false;
let isVideoMode = false;

// Initialize HeyGen Streaming Avatar
async function initHeyGen() {
  try {
    console.log('[HeyGen] Initializing streaming avatar...');

    // Start HeyGen session
    const response = await fetch('/.netlify/functions/heygen-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HeyGen start failed: ${response.status} - ${error}`);
    }

    const { sessionId, sdp, iceServers } = await response.json();
    heygenSession = sessionId;

    console.log(`[HeyGen] Session created: ${sessionId}`);

    // Create WebRTC Peer Connection
    const config = {
      iceServers: iceServers && iceServers.length > 0 ? iceServers : [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    heygenPeerConnection = new RTCPeerConnection(config);

    // Handle ICE candidates
    heygenPeerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log('[HeyGen] ICE candidate:', event.candidate);
        // Send ICE candidate to backend
        try {
          await fetch('/.netlify/functions/heygen-avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'ice',
              sessionId: heygenSession,
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex
            })
          });
        } catch (err) {
          console.error('[HeyGen] ICE candidate submission failed:', err);
        }
      }
    };

    // Handle connection state changes
    heygenPeerConnection.onconnectionstatechange = () => {
      console.log('[HeyGen] Connection state:', heygenPeerConnection.connectionState);
      if (heygenPeerConnection.connectionState === 'failed') {
        console.error('[HeyGen] Connection failed, attempting restart...');
        stopHeyGen();
      }
    };

    // Handle video track
    heygenPeerConnection.ontrack = (event) => {
      console.log('[HeyGen] Video track received:', event.streams[0]);
      const videoElement = document.getElementById('videoAvatar');
      if (videoElement && event.streams[0]) {
        videoElement.srcObject = event.streams[0];
        videoElement.play().catch(err => {
          console.error('[HeyGen] Video play failed:', err);
        });
      }
    };

    // Set remote description from HeyGen
    if (sdp) {
      await heygenPeerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: 'offer', sdp })
      );

      // Create answer
      const answer = await heygenPeerConnection.createAnswer();
      await heygenPeerConnection.setLocalDescription(answer);

      console.log('[HeyGen] WebRTC negotiation complete');
    }

    isHeygenActive = true;
    return true;

  } catch (error) {
    console.error('[HeyGen] Initialization failed:', error);
    isHeygenActive = false;
    return false;
  }
}

// Make HeyGen avatar speak with lipsync
async function heygenSpeak(text) {
  if (!heygenSession) {
    console.warn('[HeyGen] Session not active, initializing...');
    const success = await initHeyGen();
    if (!success) {
      console.error('[HeyGen] Cannot speak - initialization failed');
      return false;
    }
  }

  try {
    console.log('[HeyGen] Speaking:', text.substring(0, 50) + '...');

    const response = await fetch('/.netlify/functions/heygen-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'speak',
        sessionId: heygenSession,
        text
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HeyGen speak failed: ${response.status} - ${error}`);
    }

    const { taskId } = await response.json();
    console.log('[HeyGen] Speak task submitted:', taskId);
    return true;

  } catch (error) {
    console.error('[HeyGen] Speak error:', error);
    return false;
  }
}

// Stop HeyGen session
async function stopHeyGen() {
  if (!heygenSession) return;

  try {
    console.log('[HeyGen] Stopping session...');

    await fetch('/.netlify/functions/heygen-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'stop',
        sessionId: heygenSession
      })
    });

    if (heygenPeerConnection) {
      heygenPeerConnection.close();
      heygenPeerConnection = null;
    }

    const videoElement = document.getElementById('videoAvatar');
    if (videoElement) {
      videoElement.srcObject = null;
    }

    heygenSession = null;
    isHeygenActive = false;
    console.log('[HeyGen] Session stopped');

  } catch (error) {
    console.error('[HeyGen] Stop error:', error);
  }
}

// Toggle video mode
async function toggleVideoMode() {
  const circleAvatar = document.getElementById('avatarCircle');
  const videoContainer = document.getElementById('videoAvatarContainer');
  const toggleBtn = document.getElementById('videoToggle');

  if (!isVideoMode) {
    // Switch to HeyGen video mode
    console.log('[HeyGen] Activating video mode...');
    const stateEl = document.querySelector('.state');
    if (stateEl) stateEl.textContent = '🎬 Activando avatar video HeyGen...';

    const success = await initHeyGen();

    if (success) {
      if (circleAvatar) circleAvatar.style.display = 'none';
      if (videoContainer) videoContainer.style.display = 'flex';
      if (toggleBtn) toggleBtn.textContent = '⭕';
      isVideoMode = true;
      if (stateEl) stateEl.textContent = '🎬 Avatar HeyGen activo';
      console.log('[HeyGen] Video mode activated');
    } else {
      if (stateEl) stateEl.textContent = '❌ Error activando HeyGen';
    }

  } else {
    // Switch back to circular mode
    await stopHeyGen();
    if (circleAvatar) circleAvatar.style.display = 'flex';
    if (videoContainer) videoContainer.style.display = 'none';
    if (toggleBtn) toggleBtn.textContent = '📹';
    isVideoMode = false;
    const stateEl = document.querySelector('.state');
    if (stateEl) stateEl.textContent = '🟢 Modo circular activo';
    console.log('[HeyGen] Circular mode activated');
  }
}

// Export functions for use in sandra-mobile.js
if (typeof window !== 'undefined') {
  window.heygenSpeak = heygenSpeak;
  window.toggleVideoMode = toggleVideoMode;
  window.isVideoMode = () => isVideoMode;
  window.isHeygenActive = () => isHeygenActive;
}

console.log('[HeyGen] Integration module loaded');
