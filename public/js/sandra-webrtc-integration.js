// SANDRA IA - WEBRTC INTEGRATION MODULE
// Integrates WebRTC, VAD, and Avatar Sync with existing Sandra mobile interface

(function() {
  'use strict';

  // Check if WebRTC is supported
  const isWebRTCSupported = () => {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.RTCPeerConnection
    );
  };

  // Configuration
  const WEBRTC_CONFIG = {
    enabled: true,
    signalingEndpoint: '/api/webrtc',
    fallbackToREST: true,
    autoStart: false,
    debug: true
  };

  // Global state
  let webrtcClient = null;
  let vadHandler = null;
  let avatarSync = null;
  let audioContext = null;
  let isWebRTCActive = false;

  // UI Elements
  const elements = {
    wave: null,
    mouth: null,
    state: null,
    micBtn: null
  };

  // Initialize WebRTC system
  async function initializeWebRTC() {
    if (!isWebRTCSupported()) {
      console.warn('⚠️ WebRTC not supported in this browser');
      return false;
    }

    if (!WEBRTC_CONFIG.enabled) {
      console.log('ℹ️ WebRTC disabled in config');
      return false;
    }

    try {
      console.log('🚀 Initializing WebRTC system...');

      // Get UI elements
      elements.wave = document.querySelector('#wave');
      elements.mouth = document.querySelector('#mouth');
      elements.state = document.querySelector('.state');
      elements.micBtn = document.querySelector('#micBtn');

      // Create audio context if not exists
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      // Initialize WebRTC client
      webrtcClient = new WebRTCClient({
        signalingEndpoint: WEBRTC_CONFIG.signalingEndpoint
      });

      // Set up event handlers
      setupWebRTCHandlers();

      // Initialize client
      const initSuccess = await webrtcClient.initialize();
      if (!initSuccess) {
        throw new Error('WebRTC client initialization failed');
      }

      // Initialize VAD handler
      vadHandler = new VADHandler({
        threshold: 0.05,
        bargeInEnabled: true,
        bargeInDelay: 100
      });

      const localStream = webrtcClient.getLocalStream();
      await vadHandler.initialize(localStream);

      setupVADHandlers();

      // Initialize Avatar Sync
      avatarSync = new AvatarSync({
        mouthElement: elements.mouth,
        amplificationFactor: 1.8,
        smoothingFactor: 0.85
      });

      await avatarSync.initialize(audioContext);

      setupAvatarHandlers();

      // Create WebRTC offer
      await webrtcClient.createOffer();

      console.log('✅ WebRTC system initialized successfully');
      updateState('🔗 WebRTC ready');
      isWebRTCActive = true;

      return true;

    } catch (error) {
      console.error('❌ WebRTC initialization failed:', error);
      updateState('⚠️ WebRTC failed, using REST API');

      if (WEBRTC_CONFIG.fallbackToREST) {
        console.log('↩️ Falling back to REST API mode');
        isWebRTCActive = false;
      }

      return false;
    }
  }

  // WebRTC event handlers
  function setupWebRTCHandlers() {
    webrtcClient.onConnected = () => {
      console.log('🔗 WebRTC connected');
      updateState('✅ Connected');

      // Start VAD
      if (vadHandler) {
        vadHandler.start();
      }
    };

    webrtcClient.onDisconnected = () => {
      console.log('❌ WebRTC disconnected');
      updateState('⚠️ Disconnected');

      // Stop VAD and avatar
      if (vadHandler) vadHandler.stop();
      if (avatarSync) avatarSync.stop();
    };

    webrtcClient.onRemoteAudio = (stream) => {
      console.log('📥 Receiving remote audio');

      // Connect to avatar sync
      if (avatarSync) {
        avatarSync.connectAudioSource(stream);
        avatarSync.start();
      }

      // Notify VAD that remote audio is playing
      if (vadHandler) {
        vadHandler.setRemoteAudioPlaying(true);
      }

      // Play audio through browser
      const audio = new Audio();
      audio.srcObject = stream;
      audio.play().catch(err => {
        console.error('Audio play failed:', err);
      });

      audio.onended = () => {
        console.log('📭 Remote audio ended');
        if (vadHandler) vadHandler.setRemoteAudioPlaying(false);
        if (avatarSync) avatarSync.stop();
      };
    };

    webrtcClient.onError = (error) => {
      console.error('❌ WebRTC error:', error);
      updateState('❌ Error: ' + error.message);

      // Fallback to REST API
      if (WEBRTC_CONFIG.fallbackToREST) {
        isWebRTCActive = false;
        updateState('↩️ Using REST API');
      }
    };

    webrtcClient.onStateChange = (state) => {
      if (WEBRTC_CONFIG.debug) {
        console.log('📊 WebRTC state:', state);
      }
    };
  }

  // VAD event handlers
  function setupVADHandlers() {
    vadHandler.onSpeechStart = () => {
      console.log('🗣️ User started speaking');

      if (elements.wave) {
        elements.wave.classList.add('active');
      }

      updateState('🎙️ Listening...');
    };

    vadHandler.onSpeechEnd = () => {
      console.log('🤐 User stopped speaking');

      if (elements.wave) {
        elements.wave.classList.remove('active');
      }

      updateState('🟢 Ready');
    };

    vadHandler.onBargeIn = () => {
      console.log('🛑 BARGE-IN: User interrupted Sandra');

      // Stop avatar animation
      if (avatarSync) {
        avatarSync.stop();
      }

      // Signal barge-in to remote peer via data channel
      if (webrtcClient && webrtcClient.isConnected()) {
        webrtcClient.signalBargeIn();
      }

      // Visual feedback
      updateState('🛑 Interrupted');

      // Reset UI after short delay
      setTimeout(() => {
        updateState('🎙️ Listening...');
      }, 500);
    };

    vadHandler.onVolumeChange = (volume) => {
      // Optional: Update volume meter UI
      if (WEBRTC_CONFIG.debug && volume > 0.1) {
        console.log('🔊 Volume:', volume.toFixed(3));
      }
    };
  }

  // Avatar sync handlers
  function setupAvatarHandlers() {
    avatarSync.onAnimationFrame = (data) => {
      // Optional: Log animation data
      if (WEBRTC_CONFIG.debug && data.rms > 0.2) {
        console.log('👄 Mouth scale:', data.scale.toFixed(3));
      }
    };

    avatarSync.onScaleChange = (scale) => {
      // Optional: Additional visual effects based on mouth scale
      if (scale > 0.5) {
        // High energy speaking
      }
    };
  }

  // Update state display
  function updateState(text) {
    if (elements.state) {
      elements.state.textContent = text;
    }
  }

  // Check if WebRTC should be used
  function shouldUseWebRTC() {
    return isWebRTCActive && webrtcClient && webrtcClient.isConnected();
  }

  // Get WebRTC status
  function getWebRTCStatus() {
    return {
      supported: isWebRTCSupported(),
      enabled: WEBRTC_CONFIG.enabled,
      active: isWebRTCActive,
      connected: webrtcClient ? webrtcClient.isConnected() : false,
      vadActive: vadHandler ? vadHandler.getIsAnalyzing() : false,
      avatarAnimating: avatarSync ? avatarSync.getIsAnimating() : false
    };
  }

  // Toggle WebRTC on/off
  async function toggleWebRTC(enable) {
    if (enable && !isWebRTCActive) {
      return await initializeWebRTC();
    } else if (!enable && isWebRTCActive) {
      await shutdownWebRTC();
      return true;
    }
    return false;
  }

  // Shutdown WebRTC system
  async function shutdownWebRTC() {
    console.log('🔌 Shutting down WebRTC system...');

    try {
      if (vadHandler) {
        vadHandler.destroy();
        vadHandler = null;
      }

      if (avatarSync) {
        avatarSync.destroy();
        avatarSync = null;
      }

      if (webrtcClient) {
        await webrtcClient.close();
        webrtcClient = null;
      }

      isWebRTCActive = false;
      updateState('🟢 WebRTC closed');

      console.log('✅ WebRTC shutdown complete');

    } catch (error) {
      console.error('❌ WebRTC shutdown error:', error);
    }
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (isWebRTCActive) {
      shutdownWebRTC();
    }
  });

  // Auto-initialize if configured
  if (WEBRTC_CONFIG.autoStart) {
    // Wait for user gesture (required for audio context)
    document.addEventListener('click', () => {
      if (!isWebRTCActive) {
        initializeWebRTC().catch(err => {
          console.error('Auto-init failed:', err);
        });
      }
    }, { once: true });
  }

  // Export to global scope
  window.SandraWebRTC = {
    initialize: initializeWebRTC,
    shutdown: shutdownWebRTC,
    toggle: toggleWebRTC,
    getStatus: getWebRTCStatus,
    isActive: () => isWebRTCActive,
    shouldUse: shouldUseWebRTC
  };

  console.log('📦 Sandra WebRTC Integration module loaded');
  console.log('🔧 Use SandraWebRTC.initialize() to start');
  console.log('ℹ️ WebRTC support:', isWebRTCSupported());

})();
