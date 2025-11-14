const axios = require('axios');

class HeyGenService {
  constructor() {
    this.apiKey = process.env.HEYGEN_API_KEY;
    this.avatarId = process.env.HEYGEN_AVATAR_ID || 'a7a7e63f00a74ff984d4b43f984c438c';
    this.baseUrl = 'https://api.heygen.com/v2';
    this.currentSession = null;
    this.isStreaming = false;
    
    if (this.apiKey) {
      console.log('✅ HeyGen Avatar Service inicializado');
    } else {
      console.warn('⚠️ HeyGen API Key no encontrada');
    }
  }

  /**
   * Crear sesión de streaming de avatar
   */
  async createStreamingSession() {
    try {
      if (!this.apiKey) {
        throw new Error('HeyGen API Key no configurada');
      }

      const response = await axios.post(
        `${this.baseUrl}/streaming.new`,
        {
          quality: 'high',
          avatar_name: this.avatarId,
          voice: {
            voice_id: 'es-ES-Standard-A',
            rate: 1.0,
            emotion: 'friendly'
          }
        },
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      this.currentSession = {
        sessionId: response.data.data.session_id,
        sdp: response.data.data.sdp,
        iceServers: response.data.data.ice_servers
      };

      this.isStreaming = true;

      return {
        success: true,
        session: this.currentSession
      };
    } catch (error) {
      console.error('Error creando sesión HeyGen:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar texto para que el avatar hable
   */
  async speak(text, taskType = 'talk') {
    try {
      if (!this.apiKey || !this.currentSession) {
        throw new Error('Sesión HeyGen no iniciada');
      }

      const response = await axios.post(
        `${this.baseUrl}/streaming.task`,
        {
          session_id: this.currentSession.sessionId,
          text: text,
          task_type: taskType
        },
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        taskId: response.data.data.task_id,
        duration: response.data.data.duration
      };
    } catch (error) {
      console.error('Error en HeyGen speak:', error.response?.data || error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Detener el avatar
   */
  async stop() {
    try {
      if (!this.apiKey || !this.currentSession) {
        return { success: true, message: 'No hay sesión activa' };
      }

      await axios.post(
        `${this.baseUrl}/streaming.stop`,
        {
          session_id: this.currentSession.sessionId
        },
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      this.currentSession = null;
      this.isStreaming = false;

      return {
        success: true,
        message: 'Sesión detenida correctamente'
      };
    } catch (error) {
      console.error('Error deteniendo HeyGen:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener estado de la sesión
   */
  async getSessionStatus() {
    try {
      if (!this.apiKey || !this.currentSession) {
        return { success: false, error: 'No hay sesión activa' };
      }

      const response = await axios.get(
        `${this.baseUrl}/streaming.status?session_id=${this.currentSession.sessionId}`,
        {
          headers: {
            'X-Api-Key': this.apiKey
          }
        }
      );

      return {
        success: true,
        status: response.data.data
      };
    } catch (error) {
      console.error('Error obteniendo estado HeyGen:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Inicializar avatar con WebRTC
   */
  getWebRTCConfig() {
    if (!this.currentSession) {
      return null;
    }

    return {
      sdp: this.currentSession.sdp,
      iceServers: this.currentSession.iceServers,
      sessionId: this.currentSession.sessionId
    };
  }

  /**
   * Verificar si está en streaming
   */
  getIsStreaming() {
    return this.isStreaming;
  }

  /**
   * Cambiar avatar
   */
  setAvatar(avatarId) {
    this.avatarId = avatarId;
    console.log(`Avatar cambiado a: ${avatarId}`);
  }

  /**
   * Obtener lista de avatares disponibles
   */
  async getAvatars() {
    try {
      if (!this.apiKey) {
        throw new Error('HeyGen API Key no configurada');
      }

      const response = await axios.get(`${this.baseUrl}/avatars`, {
        headers: {
          'X-Api-Key': this.apiKey
        }
      });

      return {
        success: true,
        avatars: response.data.data.avatars
      };
    } catch (error) {
      console.error('Error obteniendo avatares:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = HeyGenService;

