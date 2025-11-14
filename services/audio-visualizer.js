/**
 * Audio Visualizer
 * Visualización de forma de onda en tiempo real
 */

class AudioVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.canvasContext = this.canvas ? this.canvas.getContext('2d') : null;
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.bufferLength = 0;
    this.animationId = null;
    this.isVisualizing = false;
    
    if (this.canvas) {
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    console.log('✅ Audio Visualizer inicializado');
  }

  /**
   * Redimensionar canvas
   */
  resizeCanvas() {
    if (!this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.canvasContext.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  /**
   * Iniciar visualización desde MediaStream
   */
  async startVisualization(stream) {
    try {
      if (!this.canvas || !this.canvasContext) {
        throw new Error('Canvas no disponible');
      }

      // Crear contexto de audio
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Crear analizador
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      // Conectar stream al analizador
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      this.isVisualizing = true;
      this.draw();

      return { success: true };
    } catch (error) {
      console.error('Error iniciando visualización:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Dibujar forma de onda
   */
  draw() {
    if (!this.isVisualizing) return;

    this.animationId = requestAnimationFrame(() => this.draw());

    if (!this.analyser || !this.dataArray) return;

    this.analyser.getByteTimeDomainData(this.dataArray);

    const ctx = this.canvasContext;
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;

    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
    gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Configurar línea
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#667eea';
    ctx.beginPath();

    const sliceWidth = width / this.bufferLength;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Dibujar indicador de nivel
    this.drawVolumeIndicator();
  }

  /**
   * Dibujar indicador de volumen
   */
  drawVolumeIndicator() {
    if (!this.analyser) return;

    // Calcular nivel promedio
    let sum = 0;
    for (let i = 0; i < this.bufferLength; i++) {
      sum += Math.abs(this.dataArray[i] - 128);
    }
    const average = sum / this.bufferLength;
    const level = average / 128;

    const ctx = this.canvasContext;
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;

    // Barra de nivel en la parte inferior
    const barHeight = 4;
    const barY = height - barHeight - 5;
    const barWidth = width * level;

    // Gradiente para la barra
    const barGradient = ctx.createLinearGradient(0, 0, width, 0);
    barGradient.addColorStop(0, '#10b981');
    barGradient.addColorStop(0.5, '#f59e0b');
    barGradient.addColorStop(1, '#ef4444');

    ctx.fillStyle = barGradient;
    ctx.fillRect(5, barY, barWidth, barHeight);

    // Borde de la barra
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(5, barY, width - 10, barHeight);
  }

  /**
   * Detener visualización
   */
  stop() {
    this.isVisualizing = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Limpiar canvas
    if (this.canvas && this.canvasContext) {
      const width = this.canvas.width / window.devicePixelRatio;
      const height = this.canvas.height / window.devicePixelRatio;
      this.canvasContext.clearRect(0, 0, width, height);
    }

    this.analyser = null;
    this.dataArray = null;
  }

  /**
   * Verificar si está visualizando
   */
  getIsVisualizing() {
    return this.isVisualizing;
  }
}

// Exportar para uso en renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioVisualizer;
}

