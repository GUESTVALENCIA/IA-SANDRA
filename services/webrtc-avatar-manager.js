/**
 * WebRTC Avatar Manager
 * Gestiona la conexión WebRTC con HeyGen Avatar
 */

class WebRTCAvatarManager {
  constructor() {
    this.peerConnection = null;
    this.remoteStream = null;
    this.sessionId = null;
    this.isConnected = false;
    this.videoElement = null;
    
    console.log('✅ WebRTC Avatar Manager inicializado');
  }

  /**
   * Inicializar conexión WebRTC con HeyGen
   */
  async initializeConnection(sessionConfig, videoElementId) {
    try {
      this.sessionId = sessionConfig.sessionId;
      this.videoElement = document.getElementById(videoElementId);

      if (!this.videoElement) {
        throw new Error('Elemento de video no encontrado');
      }

      // Configuración de ICE servers
      const configuration = {
        iceServers: sessionConfig.iceServers || [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      // Crear peer connection
      this.peerConnection = new RTCPeerConnection(configuration);

      // Manejar tracks remotos
      this.peerConnection.ontrack = (event) => {
        console.log('✅ Track remoto recibido:', event.track.kind);
        
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          this.videoElement.srcObject = this.remoteStream;
          this.videoElement.play().catch(e => console.error('Error reproduciendo video:', e));
        }
      };

      // Manejar estado de conexión
      this.peerConnection.onconnectionstatechange = () => {
        console.log('Estado de conexión:', this.peerConnection.connectionState);
        
        if (this.peerConnection.connectionState === 'connected') {
          this.isConnected = true;
          console.log('✅ Avatar WebRTC conectado');
        } else if (this.peerConnection.connectionState === 'failed' || 
                   this.peerConnection.connectionState === 'disconnected') {
          this.isConnected = false;
          console.log('❌ Avatar WebRTC desconectado');
        }
      };

      // Manejar candidatos ICE
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Nuevo candidato ICE:', event.candidate);
        }
      };

      // Configurar SDP remoto si está disponible
      if (sessionConfig.sdp) {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription({
            type: 'offer',
            sdp: sessionConfig.sdp
          })
        );

        // Crear respuesta
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        console.log('✅ SDP configurado correctamente');
      }

      return {
        success: true,
        message: 'WebRTC inicializado correctamente',
        answer: this.peerConnection.localDescription
      };
    } catch (error) {
      console.error('Error inicializando WebRTC:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Agregar candidato ICE
   */
  async addIceCandidate(candidate) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('✅ Candidato ICE agregado');
      }
    } catch (error) {
      console.error('Error agregando candidato ICE:', error);
    }
  }

  /**
   * Obtener estadísticas de la conexión
   */
  async getStats() {
    if (!this.peerConnection) {
      return null;
    }

    try {
      const stats = await this.peerConnection.getStats();
      const statsReport = {};

      stats.forEach(report => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          statsReport.video = {
            bytesReceived: report.bytesReceived,
            packetsReceived: report.packetsReceived,
            packetsLost: report.packetsLost,
            framesDecoded: report.framesDecoded,
            frameRate: report.framesPerSecond
          };
        }
      });

      return statsReport;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  /**
   * Cerrar conexión
   */
  close() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.remoteStream = null;
    this.isConnected = false;
    this.sessionId = null;

    console.log('✅ Conexión WebRTC cerrada');
  }

  /**
   * Verificar si está conectado
   */
  getIsConnected() {
    return this.isConnected;
  }

  /**
   * Obtener ID de sesión
   */
  getSessionId() {
    return this.sessionId;
  }
}

// Exportar para uso en renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebRTCAvatarManager;
}

