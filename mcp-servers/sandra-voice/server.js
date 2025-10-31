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

class SandraVoice {
  constructor() {
    // Solo CARTESIA como proveedor de voz
    this.apiKey = process.env.CARTESIA_API_KEY;
    
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.warn('⚠ CARTESIA_API_KEY no está configurada. El servicio de voz estará deshabilitado.');
      this.apiKey = null;
      this.available = false;
      return;
    }
    
    this.provider = 'cartesia';
    this.baseURL = 'https://api.cartesia.ai/v1';
    this.voiceId = process.env.CARTESIA_VOICE_ID || 'default';
    this.model = 'sonic-english';
    this.available = true;
    
    console.log('✓ Sandra Voice initialized - Using CARTESIA as voice provider');
  }
  
  isAvailable() {
    return this.available === true && this.apiKey !== null;
  }

  async synthesizeSpeech(text, options = {}) {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'Cartesia API key not configured',
        fallbackMessage: "Voz no disponible. Por favor, configura CARTESIA_API_KEY en el archivo .env"
      };
    }

    try {
      const voiceId = options.voiceId || this.voiceId;
      
      // API de Cartesia
      const response = await axios.post(
        `${this.baseURL}/tts`,
        {
          text: text,
          model_id: this.model,
          voice_id: voiceId,
          output_format: 'mp3'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer',
          timeout: 30000
        }
      );

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const filename = `sandra_voice_${timestamp}.mp3`;
      const audioPath = path.join(__dirname, '../../frontend/assets/audio', filename);

      // Crear directorio si no existe
      const audioDir = path.dirname(audioPath);
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      // Guardar archivo de audio
      fs.writeFileSync(audioPath, response.data);

      return {
        success: true,
        audioPath: audioPath,
        filename: filename,
        relativePath: `assets/audio/${filename}`,
        duration: this.estimateAudioDuration(text),
        voiceId: voiceId,
        model: this.model,
        provider: 'cartesia'
      };
    } catch (error) {
      console.error('Sandra Voice Error:', error.message);

      return {
        success: false,
        error: error.message,
        fallbackMessage: "Audio no disponible temporalmente, pero aquí está mi respuesta escrita."
      };
    }
  }

  estimateAudioDuration(text) {
    // Estimación aproximada: ~150 palabras por minuto
    const words = text.split(' ').length;
    const durationSeconds = Math.ceil((words / 150) * 60);
    return durationSeconds;
  }

  async getAvailableVoices() {
    try {
      // Cartesia API para obtener voces disponibles
      const response = await axios.get(`${this.baseURL}/voices`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 10000
      });

      return {
        success: true,
        voices: response.data.voices || response.data.map(voice => ({
          id: voice.voice_id || voice.id,
          name: voice.name,
          description: voice.description
        }))
      };
    } catch (error) {
      console.error('Get Voices Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/voices`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 5000
      });

      return {
        status: 'healthy',
        apiConnected: true,
        voicesAvailable: (response.data.voices || response.data || []).length > 0,
        currentVoice: this.voiceId
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
      service: 'sandra-voice',
      capabilities: [
        'text-to-speech',
        'voice-synthesis',
        'audio-generation',
        'sandra-voice-personality',
        'multiple-voice-options'
      ],
      provider: 'Cartesia',
      voiceId: this.voiceId,
      model: this.model,
      supportedLanguages: ['en', 'es'],
      audioFormat: 'mp3'
    };
  }

  cleanup() {
    // Limpiar archivos de audio antiguos (más de 1 hora)
    const audioDir = path.join(__dirname, '../../frontend/assets/audio');
    if (fs.existsSync(audioDir)) {
      const files = fs.readdirSync(audioDir);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);

      files.forEach(file => {
        if (file.startsWith('sandra_voice_')) {
          const filePath = path.join(audioDir, file);
          const stats = fs.statSync(filePath);
          if (stats.mtimeMs < oneHourAgo) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up old audio file: ${file}`);
          }
        }
      });
    }
  }
}

module.exports = { SandraVoice };