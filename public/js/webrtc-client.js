// SANDRA IA - WEBRTC CLIENT
// Real-time bidirectional audio streaming with peer-to-peer connection

class WebRTCClient {
  constructor(config = {}) {
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
      audioConstraints: {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        },
        video: false
      },
      signalingEndpoint: config.signalingEndpoint || '/api/webrtc',
      ...config
    };

    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
    this.sessionId = this.generateSessionId();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;

    // Event handlers
    this.onConnected = null;
    this.onDisconnected = null;
    this.onRemoteAudio = null;
    this.onError = null;
    this.onStateChange = null;
  }

  generateSessionId() {
    return `sandra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async initialize() {
    try {
      console.log('🔌 Initializing WebRTC client...');

      // Get user media (microphone)
      this.localStream = await navigator.mediaDevices.getUserMedia(
        this.config.audioConstraints
      );

      console.log('✅ Microphone access granted');
      this.emitStateChange('microphone_ready');

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers
      });

      // Set up event listeners
      this.setupPeerConnectionListeners();

      // Add local tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
        console.log(`📤 Added local ${track.kind} track`);
      });

      // Create data channel for metadata
      this.dataChannel = this.peerConnection.createDataChannel('sandra-metadata', {
        ordered: true
      });

      this.setupDataChannelListeners();

      console.log('✅ WebRTC client initialized');
      return true;

    } catch (error) {
      console.error('❌ WebRTC initialization failed:', error);
      this.emitError(error);
      return false;
    }
  }

  setupPeerConnectionListeners() {
    // ICE candidate event
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 New ICE candidate:', event.candidate.type);
        this.sendIceCandidate(event.candidate);
      }
    };

    // Connection state change
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log(`🔗 Connection state: ${state}`);

      switch (state) {
        case 'connected':
          this.connected = true;
          this.reconnectAttempts = 0;
          this.emitStateChange('connected');
          if (this.onConnected) this.onConnected();
          break;

        case 'disconnected':
        case 'failed':
          this.connected = false;
          this.emitStateChange('disconnected');
          if (this.onDisconnected) this.onDisconnected();
          this.handleReconnect();
          break;

        case 'closed':
          this.connected = false;
          this.emitStateChange('closed');
          break;
      }
    };

    // ICE connection state change
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log(`❄️ ICE connection state: ${this.peerConnection.iceConnectionState}`);
    };

    // Remote track received
    this.peerConnection.ontrack = (event) => {
      console.log('📥 Received remote track:', event.track.kind);

      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }

      this.remoteStream.addTrack(event.track);

      // Emit remote audio for playback
      if (this.onRemoteAudio && event.track.kind === 'audio') {
        this.onRemoteAudio(this.remoteStream);
      }
    };
  }

  setupDataChannelListeners() {
    this.dataChannel.onopen = () => {
      console.log('📡 Data channel opened');
      this.emitStateChange('datachannel_open');
    };

    this.dataChannel.onclose = () => {
      console.log('📡 Data channel closed');
      this.emitStateChange('datachannel_closed');
    };

    this.dataChannel.onmessage = (event) => {
      console.log('📨 Data channel message:', event.data);
      try {
        const data = JSON.parse(event.data);
        this.handleDataChannelMessage(data);
      } catch (e) {
        console.warn('Invalid data channel message:', e);
      }
    };
  }

  handleDataChannelMessage(data) {
    // Handle metadata messages (e.g., barge-in signals, state updates)
    switch (data.type) {
      case 'barge_in':
        console.log('🛑 Barge-in detected by remote peer');
        break;

      case 'state':
        console.log('📊 Remote state update:', data.state);
        break;

      default:
        console.log('❓ Unknown data channel message type:', data.type);
    }
  }

  async createOffer() {
    try {
      console.log('📝 Creating WebRTC offer...');

      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });

      await this.peerConnection.setLocalDescription(offer);

      console.log('✅ Local description set');

      // Send offer to signaling server
      const response = await fetch(`${this.config.signalingEndpoint}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer,
          sessionId: this.sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Signaling server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Offer sent to signaling server:', data);

      this.emitStateChange('offer_sent');
      return true;

    } catch (error) {
      console.error('❌ Create offer failed:', error);
      this.emitError(error);
      return false;
    }
  }

  async handleAnswer(answer) {
    try {
      console.log('📝 Setting remote description (answer)...');

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      console.log('✅ Remote description set');
      this.emitStateChange('answer_received');
      return true;

    } catch (error) {
      console.error('❌ Handle answer failed:', error);
      this.emitError(error);
      return false;
    }
  }

  async sendIceCandidate(candidate) {
    try {
      await fetch(`${this.config.signalingEndpoint}/ice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          candidate
        })
      });

      console.log('✅ ICE candidate sent');

    } catch (error) {
      console.warn('⚠️ Failed to send ICE candidate:', error);
    }
  }

  sendMetadata(type, data) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn('⚠️ Data channel not ready, cannot send metadata');
      return false;
    }

    try {
      this.dataChannel.send(JSON.stringify({ type, ...data }));
      return true;
    } catch (error) {
      console.error('❌ Failed to send metadata:', error);
      return false;
    }
  }

  signalBargeIn() {
    return this.sendMetadata('barge_in', { timestamp: Date.now() });
  }

  async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached');
      this.emitError(new Error('Connection failed after maximum retry attempts'));
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    await new Promise(resolve => setTimeout(resolve, 2000 * this.reconnectAttempts));

    try {
      await this.close();
      await this.initialize();
      await this.createOffer();
    } catch (error) {
      console.error('❌ Reconnect failed:', error);
      this.handleReconnect();
    }
  }

  async close() {
    console.log('🔌 Closing WebRTC connection...');

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
    this.connected = false;

    console.log('✅ WebRTC connection closed');
  }

  // Event emitters
  emitStateChange(state) {
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  emitError(error) {
    if (this.onError) {
      this.onError(error);
    }
  }

  // Getters
  isConnected() {
    return this.connected;
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  getSessionId() {
    return this.sessionId;
  }

  getConnectionState() {
    return this.peerConnection ? this.peerConnection.connectionState : 'closed';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebRTCClient;
}
