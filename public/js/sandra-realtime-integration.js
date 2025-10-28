// SANDRA IA - REAL-TIME INTEGRATION MODULE
// Unified integration of Socket.IO, WebRTC, VAD, Avatar Sync, and Audio Streaming
// Complete bidirectional communication system with barge-in support

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    socketServer: window.location.origin,
    socketNamespace: '/sandra',
    userId: 'sandrita',
    webrtcEnabled: true,
    vadEnabled: true,
    avatarSyncEnabled: true,
    audioStreamingEnabled: true,
    bargeInEnabled: true,
    debug: true
  };

  // Global instances
  let socketClient = null;
  let webrtcClient = null;
  let vadHandler = null;
  let avatarSync = null;
  let audioStreamHandler = null;
  let audioContext = null;

  // System state
  let systemReady = false;
  let callActive = false;

  // UI Elements
  const elements = {
    wave: null,
    mouth: null,
    state: null,
    micBtn: null,
    callBtn: null
  };

  // === INITIALIZATION ===

  async function initializeSystem() {
    try {
      console.log('🚀 Initializing Sandra real-time communication system...');

      // Get UI elements
      elements.wave = document.querySelector('#wave');
      elements.mouth = document.querySelector('#mouth');
      elements.state = document.querySelector('.state');
      elements.micBtn = document.querySelector('#micBtn');
      elements.callBtn = document.querySelector('#callBtn');

      // Create audio context
      audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Initialize Socket.IO client
      await initializeSocketClient();

      // Initialize WebRTC (if enabled)
      if (CONFIG.webrtcEnabled) {
        await initializeWebRTC();
      }

      // Initialize VAD (if enabled)
      if (CONFIG.vadEnabled) {
        await initializeVAD();
      }

      // Initialize Avatar Sync (if enabled)
      if (CONFIG.avatarSyncEnabled) {
        await initializeAvatarSync();
      }

      // Initialize Audio Streaming (if enabled)
      if (CONFIG.audioStreamingEnabled) {
        await initializeAudioStreaming();
      }

      // Setup UI event handlers
      setupUIHandlers();

      systemReady = true;
      updateState('🟢 System ready');

      console.log('✅ Sandra real-time system initialized');

      return true;

    } catch (error) {
      console.error('❌ System initialization failed:', error);
      updateState('❌ Initialization failed');
      return false;
    }
  }

  // === SOCKET.IO CLIENT ===

  async function initializeSocketClient() {
    console.log('🔌 Initializing Socket.IO client...');

    socketClient = new SocketClient({
      serverUrl: CONFIG.socketServer,
      namespace: CONFIG.socketNamespace,
      autoConnect: true
    });

    // Setup event handlers
    socketClient.onConnected = handleSocketConnected;
    socketClient.onDisconnected = handleSocketDisconnected;
    socketClient.onAuthenticated = handleSocketAuthenticated;
    socketClient.onError = handleSocketError;

    socketClient.onSandraResponse = handleSandraResponse;
    socketClient.onSandraTyping = handleSandraTyping;
    socketClient.onCallStarted = handleCallStarted;
    socketClient.onCallEnded = handleCallEnded;

    socketClient.onSandraAudioStart = handleSandraAudioStart;
    socketClient.onSandraAudioChunk = handleSandraAudioChunk;
    socketClient.onSandraAudioEnd = handleSandraAudioEnd;

    socketClient.onBargeInAck = handleBargeInAck;

    // Connect
    socketClient.connect();

    // Wait for connection
    await waitForSocketConnection();

    // Authenticate
    socketClient.authenticate(CONFIG.userId);

    console.log('✅ Socket.IO client initialized');
  }

  function waitForSocketConnection() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Socket connection timeout'));
      }, 10000);

      const checkConnection = () => {
        if (socketClient.isConnected()) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkConnection, 100);
        }
      };

      checkConnection();
    });
  }

  // === WEBRTC ===

  async function initializeWebRTC() {
    console.log('🔌 Initializing WebRTC...');

    webrtcClient = new WebRTCClient({
      signalingEndpoint: '/api/webrtc'
    });

    webrtcClient.onConnected = handleWebRTCConnected;
    webrtcClient.onDisconnected = handleWebRTCDisconnected;
    webrtcClient.onRemoteAudio = handleWebRTCRemoteAudio;
    webrtcClient.onError = handleWebRTCError;

    const initialized = await webrtcClient.initialize();

    if (initialized) {
      await webrtcClient.createOffer();
    }

    console.log('✅ WebRTC initialized');
  }

  // === VAD (Voice Activity Detection) ===

  async function initializeVAD() {
    console.log('🎤 Initializing VAD...');

    vadHandler = new VADHandler({
      threshold: 0.05,
      bargeInEnabled: CONFIG.bargeInEnabled,
      bargeInDelay: 100
    });

    const stream = webrtcClient ? webrtcClient.getLocalStream() : null;

    if (stream) {
      await vadHandler.initialize(stream);

      vadHandler.onSpeechStart = handleSpeechStart;
      vadHandler.onSpeechEnd = handleSpeechEnd;
      vadHandler.onBargeIn = handleBargeIn;
      vadHandler.onVolumeChange = handleVolumeChange;

      console.log('✅ VAD initialized');
    } else {
      console.warn('⚠️ VAD initialization skipped: no audio stream');
    }
  }

  // === AVATAR SYNC ===

  async function initializeAvatarSync() {
    console.log('👄 Initializing avatar sync...');

    avatarSync = new AvatarSync({
      mouthElement: elements.mouth,
      amplificationFactor: 1.8,
      smoothingFactor: 0.85
    });

    await avatarSync.initialize(audioContext);

    console.log('✅ Avatar sync initialized');
  }

  // === AUDIO STREAMING ===

  async function initializeAudioStreaming() {
    console.log('🔊 Initializing audio streaming...');

    audioStreamHandler = new AudioStreamHandler({
      sampleRate: 44100,
      channels: 1,
      chunkSize: 4096
    });

    await audioStreamHandler.initialize(socketClient);

    audioStreamHandler.onCaptureStart = handleAudioCaptureStart;
    audioStreamHandler.onCaptureEnd = handleAudioCaptureEnd;
    audioStreamHandler.onPlaybackStart = handleAudioPlaybackStart;
    audioStreamHandler.onPlaybackEnd = handleAudioPlaybackEnd;
    audioStreamHandler.onError = handleAudioStreamError;

    console.log('✅ Audio streaming initialized');
  }

  // === UI EVENT HANDLERS ===

  function setupUIHandlers() {
    // Call button
    if (elements.callBtn) {
      elements.callBtn.addEventListener('click', toggleCall);
    }

    // Mic button (for manual control)
    if (elements.micBtn) {
      elements.micBtn.addEventListener('click', toggleMicrophone);
    }

    // Resume audio context on user gesture (required by browsers)
    document.addEventListener('click', resumeAudioContext, { once: true });
  }

  async function toggleCall() {
    if (!systemReady || !socketClient.isAuthenticated()) {
      console.warn('⚠️ System not ready or not authenticated');
      return;
    }

    if (callActive) {
      endCall();
    } else {
      startCall();
    }
  }

  async function startCall() {
    console.log('📞 Starting call...');

    // Resume audio context
    await resumeAudioContext();

    // Start call via Socket.IO
    socketClient.startCall();

    // Start VAD
    if (vadHandler) {
      vadHandler.start();
    }

    callActive = true;
    updateState('📞 Call active');

    if (elements.callBtn) {
      elements.callBtn.textContent = 'End Call';
      elements.callBtn.classList.add('active');
    }
  }

  function endCall() {
    console.log('📞 Ending call...');

    // End call via Socket.IO
    socketClient.endCall();

    // Stop VAD
    if (vadHandler) {
      vadHandler.stop();
    }

    // Stop avatar
    if (avatarSync) {
      avatarSync.stop();
    }

    callActive = false;
    updateState('🟢 Call ended');

    if (elements.callBtn) {
      elements.callBtn.textContent = 'Start Call';
      elements.callBtn.classList.remove('active');
    }
  }

  function toggleMicrophone() {
    if (!callActive) {
      console.warn('⚠️ Cannot toggle mic: call not active');
      return;
    }

    // Toggle microphone mute
    if (webrtcClient) {
      const stream = webrtcClient.getLocalStream();

      if (stream) {
        const audioTrack = stream.getAudioTracks()[0];

        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;

          if (elements.micBtn) {
            elements.micBtn.classList.toggle('muted');
          }

          console.log(`🎤 Microphone ${audioTrack.enabled ? 'unmuted' : 'muted'}`);
        }
      }
    }
  }

  async function resumeAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume();
      console.log('✅ Audio context resumed');
    }
  }

  // === SOCKET.IO EVENT HANDLERS ===

  function handleSocketConnected() {
    console.log('✅ Socket connected');
    updateState('🔗 Connected');
  }

  function handleSocketDisconnected(reason) {
    console.log(`🔌 Socket disconnected: ${reason}`);
    updateState('⚠️ Disconnected');
  }

  function handleSocketAuthenticated(data) {
    console.log('✅ Socket authenticated:', data);
    updateState('✅ Authenticated');
  }

  function handleSocketError(error) {
    console.error('❌ Socket error:', error);
    updateState('❌ Error');
  }

  function handleSandraResponse(data) {
    console.log('💬 Sandra:', data.message);

    // Display message in UI
    displayMessage('Sandra', data.message);
  }

  function handleSandraTyping(data) {
    if (data.isTyping) {
      updateState('✍️ Sandra typing...');
    } else {
      updateState('🟢 Ready');
    }
  }

  function handleCallStarted(data) {
    console.log('📞 Call started:', data);
    callActive = true;
  }

  function handleCallEnded(data) {
    console.log('📞 Call ended:', data);
    callActive = false;
  }

  function handleSandraAudioStart(data) {
    console.log('🔊 Sandra audio starting...');

    if (audioStreamHandler) {
      audioStreamHandler.startPlayback();
    }

    // Connect to avatar sync
    if (avatarSync && !avatarSync.getIsAnimating()) {
      avatarSync.start();
    }

    // Notify VAD that remote audio is playing
    if (vadHandler) {
      vadHandler.setRemoteAudioPlaying(true);
    }
  }

  function handleSandraAudioChunk(data) {
    if (audioStreamHandler) {
      audioStreamHandler.queueAudioChunk(data.chunk);
    }
  }

  function handleSandraAudioEnd(data) {
    console.log('🔊 Sandra audio ended');

    if (audioStreamHandler) {
      setTimeout(() => {
        audioStreamHandler.stopPlayback();
      }, 500);
    }

    // Stop avatar
    if (avatarSync) {
      setTimeout(() => {
        avatarSync.stop();
      }, 500);
    }

    // Notify VAD that remote audio stopped
    if (vadHandler) {
      vadHandler.setRemoteAudioPlaying(false);
    }
  }

  function handleBargeInAck(data) {
    console.log('✅ Barge-in acknowledged');
  }

  // === WEBRTC EVENT HANDLERS ===

  function handleWebRTCConnected() {
    console.log('✅ WebRTC connected');
  }

  function handleWebRTCDisconnected() {
    console.log('🔌 WebRTC disconnected');
  }

  function handleWebRTCRemoteAudio(stream) {
    console.log('📥 WebRTC remote audio received');

    // Connect to avatar sync
    if (avatarSync) {
      avatarSync.connectAudioSource(stream);
      avatarSync.start();
    }
  }

  function handleWebRTCError(error) {
    console.error('❌ WebRTC error:', error);
  }

  // === VAD EVENT HANDLERS ===

  function handleSpeechStart() {
    console.log('🗣️ User started speaking');

    if (elements.wave) {
      elements.wave.classList.add('active');
    }

    updateState('🎙️ Listening...');
  }

  function handleSpeechEnd() {
    console.log('🤐 User stopped speaking');

    if (elements.wave) {
      elements.wave.classList.remove('active');
    }

    updateState('🟢 Ready');
  }

  function handleBargeIn() {
    console.log('🛑 BARGE-IN: User interrupted Sandra');

    // Stop avatar
    if (avatarSync) {
      avatarSync.stop();
    }

    // Stop audio playback
    if (audioStreamHandler) {
      audioStreamHandler.stopPlayback();
    }

    // Signal barge-in via Socket.IO
    if (socketClient) {
      socketClient.triggerBargeIn();
    }

    // Visual feedback
    updateState('🛑 Interrupted');

    setTimeout(() => {
      updateState('🎙️ Listening...');
    }, 500);
  }

  function handleVolumeChange(volume) {
    // Optional: Update volume meter UI
    if (CONFIG.debug && volume > 0.1) {
      console.log(`🔊 Volume: ${volume.toFixed(3)}`);
    }
  }

  // === AUDIO STREAM HANDLERS ===

  function handleAudioCaptureStart() {
    console.log('🎤 Audio capture started');
  }

  function handleAudioCaptureEnd() {
    console.log('🎤 Audio capture ended');
  }

  function handleAudioPlaybackStart() {
    console.log('🔊 Audio playback started');
  }

  function handleAudioPlaybackEnd() {
    console.log('🔊 Audio playback ended');
  }

  function handleAudioStreamError(error) {
    console.error('❌ Audio stream error:', error);
  }

  // === UI UTILITIES ===

  function updateState(text) {
    if (elements.state) {
      elements.state.textContent = text;
    }

    console.log(`📊 State: ${text}`);
  }

  function displayMessage(sender, message) {
    // TODO: Implement message display in chat UI
    console.log(`💬 ${sender}: ${message}`);
  }

  // === SYSTEM STATUS ===

  function getSystemStatus() {
    return {
      systemReady,
      callActive,
      socket: {
        connected: socketClient ? socketClient.isConnected() : false,
        authenticated: socketClient ? socketClient.isAuthenticated() : false,
        latency: socketClient ? socketClient.getLatency() : 0
      },
      webrtc: {
        enabled: CONFIG.webrtcEnabled,
        connected: webrtcClient ? webrtcClient.isConnected() : false
      },
      vad: {
        enabled: CONFIG.vadEnabled,
        analyzing: vadHandler ? vadHandler.getIsAnalyzing() : false,
        speaking: vadHandler ? vadHandler.getIsSpeaking() : false
      },
      avatar: {
        enabled: CONFIG.avatarSyncEnabled,
        animating: avatarSync ? avatarSync.getIsAnimating() : false
      },
      audio: {
        streamingEnabled: CONFIG.audioStreamingEnabled,
        capturing: audioStreamHandler ? audioStreamHandler.isAudioCapturing() : false,
        playing: audioStreamHandler ? audioStreamHandler.isAudioPlaying() : false
      }
    };
  }

  // === CLEANUP ===

  function shutdown() {
    console.log('🔌 Shutting down Sandra real-time system...');

    if (callActive) {
      endCall();
    }

    if (socketClient) {
      socketClient.disconnect();
    }

    if (webrtcClient) {
      webrtcClient.close();
    }

    if (vadHandler) {
      vadHandler.destroy();
    }

    if (avatarSync) {
      avatarSync.destroy();
    }

    if (audioStreamHandler) {
      audioStreamHandler.destroy();
    }

    if (audioContext) {
      audioContext.close();
    }

    systemReady = false;

    console.log('✅ Sandra real-time system shutdown complete');
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', shutdown);

  // === EXPORT TO GLOBAL SCOPE ===

  window.SandraRealtime = {
    initialize: initializeSystem,
    shutdown,
    startCall,
    endCall,
    toggleMicrophone,
    getStatus: getSystemStatus,
    sendMessage: (message) => socketClient ? socketClient.sendMessage(message) : false
  };

  console.log('📦 Sandra Real-time Integration module loaded');
  console.log('🔧 Use SandraRealtime.initialize() to start');

})();
