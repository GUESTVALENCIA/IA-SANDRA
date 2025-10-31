const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Intentar cargar .env desde varias ubicaciones posibles
const envPaths = [
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../../../.env'),
  path.join(process.cwd(), '.env'),
  path.join(process.resourcesPath || __dirname, '.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    envLoaded = true;
    break;
  }
}

// Si no se encuentra .env, usar variables de entorno del sistema
if (!envLoaded) {
  require('dotenv').config(); // Intenta cargar desde el directorio actual o variables de entorno
}

class SandraAvatar {
  constructor() {
    this.apiKey = process.env.HEYGEN_API_KEY;
    this.baseURL = 'https://api.heygen.com/v2';
    
    // Avatar interactivo de HeyGen - ID proporcionado directamente por el usuario
    // URL: https://app.heygen.com/interactive-avatar/306d1c6f1b014036b467ff70ea38d965
    this.avatarId = '306d1c6f1b014036b467ff70ea38d965';
    this.interactiveAvatarUrl = `https://app.heygen.com/interactive-avatar/${this.avatarId}`;
    
    this.voiceId = 'b7b8be91afbe4c77af9eb80a9fd52a9c'; // Voz femenina en inglés
    
    console.log(`[SANDRA AVATAR] Initialized - Interactive Avatar ID: ${this.avatarId}`);
    console.log(`[SANDRA AVATAR] Interactive Avatar URL: ${this.interactiveAvatarUrl}`);
  }

  async generateAvatarVideo(text, options = {}) {
    try {
      // Usar siempre el avatar ID proporcionado por el usuario
      const avatarId = this.avatarId;
      const interactiveUrl = this.interactiveAvatarUrl;
      
      console.log(`[SANDRA AVATAR] Generating avatar for text: "${text.substring(0, 50)}..."`);
      console.log(`[SANDRA AVATAR] Using avatar ID: ${avatarId}`);
      
      // Para avatar interactivo de HeyGen, devolvemos la URL completa y el texto
      // El frontend mostrará un iframe con el avatar interactivo
      return {
        success: true,
        interactiveAvatar: true,
        avatarId: avatarId,
        interactiveAvatarUrl: interactiveUrl,
        embedUrl: interactiveUrl,
        text: text || '',
        message: 'Avatar interactivo de HeyGen disponible',
        estimatedDuration: this.estimateVideoDuration(text || ''),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[SANDRA AVATAR] Error:', error.message);

      return {
        success: false,
        error: error.message,
        fallbackMessage: "Avatar no disponible temporalmente. Modo texto activo.",
        interactiveAvatar: false
      };
    }
  }

  async checkVideoStatus(videoId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/video/${videoId}`,
        {
          headers: {
            'X-API-Key': this.apiKey
          },
          timeout: 10000
        }
      );

      const video = response.data.data;

      if (video.status === 'completed') {
        // Descargar video si está completo
        const videoUrl = video.video_url;
        const filename = `sandra_avatar_${videoId}.mp4`;
        const videoPath = await this.downloadVideo(videoUrl, filename);

        return {
          success: true,
          status: 'completed',
          videoPath: videoPath,
          filename: filename,
          relativePath: `assets/videos/${filename}`,
          downloadUrl: videoUrl,
          duration: video.duration
        };
      }

      return {
        success: true,
        status: video.status,
        progress: video.progress || 0,
        message: `Procesando avatar... ${video.progress || 0}%`
      };
    } catch (error) {
      console.error('Check Video Status Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async downloadVideo(videoUrl, filename) {
    try {
      const response = await axios.get(videoUrl, {
        responseType: 'stream',
        timeout: 60000
      });

      const videoDir = path.join(__dirname, '../../frontend/assets/videos');
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
      }

      const videoPath = path.join(videoDir, filename);
      const writer = fs.createWriteStream(videoPath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(videoPath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Download Video Error:', error.message);
      throw error;
    }
  }

  estimateVideoDuration(text) {
    // Estimación: ~150 palabras por minuto
    const words = text.split(' ').length;
    const durationSeconds = Math.ceil((words / 150) * 60);
    return Math.max(durationSeconds, 5); // Mínimo 5 segundos
  }

  async getAvailableAvatars() {
    try {
      const response = await axios.get(`${this.baseURL}/avatars`, {
        headers: {
          'X-API-Key': this.apiKey
        },
        timeout: 10000
      });

      return {
        success: true,
        avatars: response.data.data.avatars.map(avatar => ({
          id: avatar.avatar_id,
          name: avatar.avatar_name,
          gender: avatar.gender,
          preview: avatar.preview_image_url
        }))
      };
    } catch (error) {
      console.error('Get Avatars Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/avatars`, {
        headers: {
          'X-API-Key': this.apiKey
        },
        timeout: 5000
      });

      return {
        status: 'healthy',
        apiConnected: true,
        avatarsAvailable: response.data.data.avatars.length > 0,
        currentAvatar: this.avatarId
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        apiConnected: false,
        error: error.message
      };
    }
  }

  getCapabilities() {
    return {
      service: 'sandra-avatar',
      capabilities: [
        'avatar-video-generation',
        'text-to-avatar',
        'real-time-avatar',
        'sandra-visual-representation',
        'hd-video-output'
      ],
      provider: 'HeyGen',
      avatarId: this.avatarId,
      voiceId: this.voiceId,
      supportedFormats: ['mp4'],
      maxDuration: '300s',
      resolution: '1280x720'
    };
  }

  cleanup() {
    // Limpiar videos antiguos (más de 2 horas)
    const videoDir = path.join(__dirname, '../../frontend/assets/videos');
    if (fs.existsSync(videoDir)) {
      const files = fs.readdirSync(videoDir);
      const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);

      files.forEach(file => {
        if (file.startsWith('sandra_avatar_')) {
          const filePath = path.join(videoDir, file);
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs < twoHoursAgo) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up old video file: ${file}`);
          }
        }
      });
    }
  }
}

module.exports = { SandraAvatar };