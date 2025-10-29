// SANDRA IA - MULTIMODAL INPUT BAR
// Galaxy Enterprise Pro Level Design
// Soporta: Texto, Voz (5min), Imagen, Video, PDF, Files

class MultimodalInputBar {
  constructor(config = {}) {
    this.config = {
      maxRecordingDuration: config.maxRecordingDuration || 300000, // 5 minutos
      chunkInterval: config.chunkInterval || 30000, // 30 segundos
      maxFileSize: config.maxFileSize || 50 * 1024 * 1024, // 50MB
      supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      supportedVideoTypes: ['video/mp4', 'video/webm'],
      supportedDocTypes: ['application/pdf', 'text/plain', 'application/msword'],
      ...config
    };

    // Estados
    this.modes = ['text', 'voice', 'image', 'video', 'pdf', 'file'];
    this.currentMode = 'text';
    this.isRecording = false;
    this.recordingStartTime = null;
    this.recordingDuration = 0;
    this.recordingTimer = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;

    // Referencias DOM
    this.container = null;
    this.textInput = null;
    this.voiceBtn = null;
    this.imageBtn = null;
    this.videoBtn = null;
    this.pdfBtn = null;
    this.fileBtn = null;
    this.sendBtn = null;
    this.recordingIndicator = null;
    this.waveform = null;

    // Callbacks
    this.onTextMessage = null;
    this.onVoiceMessage = null;
    this.onImageMessage = null;
    this.onVideoMessage = null;
    this.onPDFMessage = null;
    this.onFileMessage = null;

    console.log('✅ Multimodal Input Bar initialized');
  }

  /**
   * Inicializar barra multimodal
   */
  async initialize(containerId) {
    try {
      this.container = document.getElementById(containerId);
      if (!this.container) {
        throw new Error(`Container ${containerId} not found`);
      }

      // Crear HTML de la barra
      this.createMultimodalBar();

      // Configurar event listeners
      this.setupEventListeners();

      // Verificar permisos de micrófono
      await this.checkMicrophonePermission();

      console.log('✅ Multimodal bar initialized');
      return true;
    } catch (error) {
      console.error('Initialization error:', error);
      return false;
    }
  }

  /**
   * Crear HTML de la barra multimodal
   */
  createMultimodalBar() {
    this.container.innerHTML = `
      <div class="multimodal-bar-container galaxy-enterprise">
        <!-- Preview área para archivos adjuntos -->
        <div class="attachment-preview" id="attachmentPreview" style="display: none;">
          <div class="preview-content"></div>
          <button class="remove-attachment" aria-label="Eliminar adjunto">×</button>
        </div>

        <!-- Recording indicator -->
        <div class="recording-indicator" id="recordingIndicator" style="display: none;">
          <div class="recording-animation">
            <span class="pulse"></span>
            <span class="recording-icon">🎤</span>
          </div>
          <div class="recording-time">0:00</div>
          <div class="recording-waveform" id="waveform"></div>
        </div>

        <!-- Barra principal de input -->
        <div class="multimodal-input-container">
          <!-- Botones de modo multimodal -->
          <div class="mode-buttons">
            <button class="mode-btn" id="imageBtn" title="Imagen/Cámara" aria-label="Subir imagen">
              📷
            </button>
            <button class="mode-btn" id="videoBtn" title="Video" aria-label="Subir video">
              🎥
            </button>
            <button class="mode-btn" id="pdfBtn" title="PDF/Documento" aria-label="Subir PDF">
              📄
            </button>
            <button class="mode-btn" id="fileBtn" title="Archivo" aria-label="Subir archivo">
              📎
            </button>
          </div>

          <!-- Input de texto -->
          <div class="text-input-wrapper">
            <textarea
              class="multimodal-text-input"
              id="multimodalTextInput"
              placeholder="Escribe, habla o adjunta archivos..."
              rows="1"
              aria-label="Mensaje para Sandra"
            ></textarea>
          </div>

          <!-- Botón de voz -->
          <button class="voice-btn galaxy-btn" id="voiceBtn" title="Mantén presionado para hablar" aria-label="Grabar voz">
            🎤
          </button>

          <!-- Botón enviar -->
          <button class="send-btn galaxy-btn" id="sendBtn" aria-label="Enviar mensaje">
            ➤
          </button>
        </div>

        <!-- Inputs ocultos para file uploads -->
        <input type="file" id="imageInput" accept="image/*" capture="environment" style="display: none">
        <input type="file" id="videoInput" accept="video/*" capture="environment" style="display: none">
        <input type="file" id="pdfInput" accept=".pdf,.doc,.docx,.txt" style="display: none">
        <input type="file" id="fileInput" accept="*/*" style="display: none">
      </div>
    `;

    // Guardar referencias
    this.textInput = document.getElementById('multimodalTextInput');
    this.voiceBtn = document.getElementById('voiceBtn');
    this.imageBtn = document.getElementById('imageBtn');
    this.videoBtn = document.getElementById('videoBtn');
    this.pdfBtn = document.getElementById('pdfBtn');
    this.fileBtn = document.getElementById('fileBtn');
    this.sendBtn = document.getElementById('sendBtn');
    this.recordingIndicator = document.getElementById('recordingIndicator');
    this.waveform = document.getElementById('waveform');

    // Inputs ocultos
    this.imageInput = document.getElementById('imageInput');
    this.videoInput = document.getElementById('videoInput');
    this.pdfInput = document.getElementById('pdfInput');
    this.fileInputElement = document.getElementById('fileInput');
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Text input
    this.textInput.addEventListener('input', () => this.handleTextInput());
    this.textInput.addEventListener('keydown', (e) => this.handleKeyPress(e));

    // Send button
    this.sendBtn.addEventListener('click', () => this.sendMessage());

    // Voice button (hold to record)
    this.voiceBtn.addEventListener('mousedown', () => this.startRecording());
    this.voiceBtn.addEventListener('mouseup', () => this.stopRecording());
    this.voiceBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startRecording();
    });
    this.voiceBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.stopRecording();
    });

    // Mode buttons
    this.imageBtn.addEventListener('click', () => this.imageInput.click());
    this.videoBtn.addEventListener('click', () => this.videoInput.click());
    this.pdfBtn.addEventListener('click', () => this.pdfInput.click());
    this.fileBtn.addEventListener('click', () => this.fileInputElement.click());

    // File inputs
    this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    this.videoInput.addEventListener('change', (e) => this.handleVideoUpload(e));
    this.pdfInput.addEventListener('change', (e) => this.handlePDFUpload(e));
    this.fileInputElement.addEventListener('change', (e) => this.handleFileUpload(e));
  }

  /**
   * Verificar permiso de micrófono
   */
  async checkMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.warn('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Iniciar grabación de voz
   */
  async startRecording() {
    if (this.isRecording) return;

    try {
      console.log('🎤 Starting voice recording...');

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm'
      });

      this.audioChunks = [];
      this.recordingStartTime = Date.now();
      this.isRecording = true;

      // Mostrar indicador
      this.recordingIndicator.style.display = 'flex';
      this.voiceBtn.classList.add('recording');

      // Timer de grabación
      this.recordingTimer = setInterval(() => {
        this.recordingDuration = Date.now() - this.recordingStartTime;
        this.updateRecordingTime();

        // Auto-stop después de 5 minutos
        if (this.recordingDuration >= this.config.maxRecordingDuration) {
          this.stopRecording();
        }
      }, 100);

      // Eventos del MediaRecorder
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.processRecording();
      };

      // Iniciar grabación con chunks cada 30s
      this.mediaRecorder.start(this.config.chunkInterval);

      console.log('✅ Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      alert('Error al acceder al micrófono. Verifica los permisos.');
    }
  }

  /**
   * Detener grabación
   */
  stopRecording() {
    if (!this.isRecording) return;

    console.log('🛑 Stopping recording...');

    this.isRecording = false;

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    clearInterval(this.recordingTimer);

    this.recordingIndicator.style.display = 'none';
    this.voiceBtn.classList.remove('recording');
  }

  /**
   * Procesar grabación
   */
  async processRecording() {
    if (this.audioChunks.length === 0) {
      console.warn('No audio data recorded');
      return;
    }

    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

    // Convertir a base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result.split(',')[1];

      if (this.onVoiceMessage) {
        this.onVoiceMessage({
          audio: base64Audio,
          duration: this.recordingDuration,
          mimeType: 'audio/webm'
        });
      }
    };
    reader.readAsDataURL(audioBlob);

    this.audioChunks = [];
    this.recordingDuration = 0;
  }

  /**
   * Actualizar tiempo de grabación
   */
  updateRecordingTime() {
    const seconds = Math.floor(this.recordingDuration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const timeDisplay = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;

    const timeElement = this.recordingIndicator.querySelector('.recording-time');
    if (timeElement) {
      timeElement.textContent = timeDisplay;
    }
  }

  /**
   * Manejar input de texto
   */
  handleTextInput() {
    // Auto-resize textarea
    this.textInput.style.height = 'auto';
    this.textInput.style.height = Math.min(this.textInput.scrollHeight, 120) + 'px';

    // Habilitar/deshabilitar botón send
    this.sendBtn.disabled = this.textInput.value.trim() === '';
  }

  /**
   * Manejar tecla presionada
   */
  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Enviar mensaje
   */
  sendMessage() {
    const text = this.textInput.value.trim();
    if (!text) return;

    if (this.onTextMessage) {
      this.onTextMessage(text);
    }

    // Limpiar input
    this.textInput.value = '';
    this.textInput.style.height = 'auto';
    this.sendBtn.disabled = true;
  }

  /**
   * Manejar upload de imagen
   */
  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!this.config.supportedImageTypes.includes(file.type)) {
      alert('Formato de imagen no soportado');
      return;
    }

    if (file.size > this.config.maxFileSize) {
      alert('Archivo muy grande (máximo 50MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.onImageMessage) {
        this.onImageMessage({
          data: e.target.result,
          filename: file.name,
          mimeType: file.type,
          size: file.size
        });
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Manejar upload de video
   */
  async handleVideoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!this.config.supportedVideoTypes.includes(file.type)) {
      alert('Formato de video no soportado');
      return;
    }

    if (file.size > this.config.maxFileSize) {
      alert('Archivo muy grande (máximo 50MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.onVideoMessage) {
        this.onVideoMessage({
          data: e.target.result,
          filename: file.name,
          mimeType: file.type,
          size: file.size
        });
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Manejar upload de PDF
   */
  async handlePDFUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!this.config.supportedDocTypes.includes(file.type)) {
      alert('Formato de documento no soportado');
      return;
    }

    if (file.size > this.config.maxFileSize) {
      alert('Archivo muy grande (máximo 50MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.onPDFMessage) {
        this.onPDFMessage({
          data: e.target.result,
          filename: file.name,
          mimeType: file.type,
          size: file.size
        });
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Manejar upload de archivo genérico
   */
  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > this.config.maxFileSize) {
      alert('Archivo muy grande (máximo 50MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.onFileMessage) {
        this.onFileMessage({
          data: e.target.result,
          filename: file.name,
          mimeType: file.type,
          size: file.size
        });
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Destruir instancia
   */
  destroy() {
    if (this.isRecording) {
      this.stopRecording();
    }

    if (this.container) {
      this.container.innerHTML = '';
    }

    console.log('✅ Multimodal bar destroyed');
  }
}

// Export
if (typeof window !== 'undefined') {
  window.MultimodalInputBar = MultimodalInputBar;
}
