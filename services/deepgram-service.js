const { createClient, LiveTranscriptionEvents } = (() => {
  try { return require('@deepgram/sdk'); } catch (e) { return {}; }
})();
const fs = require('fs');
const EventEmitter = require('events');

class DeepgramService extends EventEmitter {
  constructor() {
    super();
    this.apiKey = process.env.DEEPGRAM_API_KEY || null;
    this.client = null;
    this.liveConnection = null;
    this.isConnected = false;
    this.statusCallback = null;
    this._ka = null; // keep-alive timer
    this._opts = { autoReconnect: false, _retryDelayMs: 1000, _maxDelayMs: 8000 };

    if (this.apiKey && createClient) {
      try {
        this.client = createClient(this.apiKey);
        console.log('✅ Deepgram STT Service inicializado');
      } catch (e) {
        console.warn('⚠️ Deepgram client init error:', e.message);
      }
    } else {
      console.warn('⚠️ Deepgram API Key o SDK no disponible');
    }
  }

  async transcribeFile(audioFilePath) {
    try {
      if (!this.client) throw new Error('Deepgram client no inicializado');
      const audioBuffer = fs.readFileSync(audioFilePath);
      const { result, error } = await this.client.listen.prerecorded.transcribeFile(audioBuffer, {
        model: 'nova-2',
        language: 'es',
        smart_format: true,
        punctuate: true
      });
      if (error) throw error;
      const alt = result?.results?.channels?.[0]?.alternatives?.[0] || {};
      return { success: true, transcript: alt.transcript || '', confidence: alt.confidence || 0, metadata: { duration: result?.metadata?.duration } };
    } catch (error) {
      this.emit('api:error', error);
      return { success: false, error: String(error) };
    }
  }

  async transcribeBuffer(audioBuffer, mimeType = 'audio/wav') {
    try {
      if (!this.client) throw new Error('Deepgram client no inicializado');
      const { result, error } = await this.client.listen.prerecorded.transcribeFile(audioBuffer, {
        model: 'nova-2',
        language: 'es',
        smart_format: true,
        punctuate: true,
        mimetype: mimeType
      });
      if (error) throw error;
      const alt = result?.results?.channels?.[0]?.alternatives?.[0] || {};
      return { success: true, transcript: alt.transcript || '', confidence: alt.confidence || 0 };
    } catch (error) {
      this.emit('api:error', error);
      return { success: false, error: String(error) };
    }
  }

  async connectLive(options = {}) {
    this._opts = Object.assign({ autoReconnect: false, _retryDelayMs: 1000, _maxDelayMs: 8000 }, options);
    if (!this.client || !this.client.listen) {
      // Try to connect via SDK not available: emit warning and return
      console.warn('Deepgram SDK or listen.live not available, cannot start live transcription');
      return { success: false, error: 'SDK not available' };
    }
    try {
      this.liveConnection = this.client.listen.live(Object.assign({
        model: 'nova-2',
        language: 'es',
        smart_format: true,
        punctuate: true,
        encoding: 'linear16',
        sample_rate: 16000,
        channels: 1,
        interim_results: true,
        endpointing: 1200
      }, options));

      this.liveConnection.on(LiveTranscriptionEvents.Open, () => {
        console.log('✅ Conexión Deepgram Live abierta');
        this.isConnected = true;
        this.emit('stt:open');
        if (this._ka) clearInterval(this._ka);
        this._ka = setInterval(() => { try { this.liveConnection.keepAlive(); } catch {} }, 15000);
        this._opts._retryDelayMs = 1000;
        if (typeof this.statusCallback === 'function') try { this.statusCallback({ connected: true }); } catch {}
      });

      this.liveConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
        try {
          const transcript = data?.channel?.alternatives?.[0]?.transcript || '';
          const isFinal = !!data.is_final;
          this.emit('transcript', { transcript, isFinal, raw: data });
        } catch (e) {}
      });

      this.liveConnection.on(LiveTranscriptionEvents.Metadata, (data) => {
        try {
          if (!(data?.type === 'Metadata' && data?.duration === 0 && data?.transaction_key === 'deprecated')) {
            console.log('Deepgram metadata:', data);
          }
        } catch (e) {}
      });

      this.liveConnection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error('Deepgram Live error:', err);
        this.emit('api:error', err);
        if (typeof this.statusCallback === 'function') try { this.statusCallback({ connected: false, error: String(err) }); } catch {}
      });

      this.liveConnection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Conexión Deepgram Live cerrada');
        this.isConnected = false;
        this.emit('stt:close');
        if (this._ka) { clearInterval(this._ka); this._ka = null; }
        if (this._opts.autoReconnect) {
          const wait = Math.min(this._opts._retryDelayMs * 2, this._opts._maxDelayMs);
          this._opts._retryDelayMs = wait;
          setTimeout(() => { if (!this.isConnected) this.connectLive(this._opts); }, wait);
        }
        if (typeof this.statusCallback === 'function') try { this.statusCallback({ connected: false }); } catch {}
      });

      return { success: true, message: 'Transcripción en vivo iniciada' };
    } catch (error) {
      this.emit('api:error', error);
      return { success: false, error: String(error) };
    }
  }

  sendAudioToLive(audioData) {
    try {
      if (this.liveConnection && this.isConnected && typeof this.liveConnection.send === 'function') {
        this.liveConnection.send(audioData);
      } else {
        console.warn('Conexión Deepgram Live no disponible');
      }
    } catch (e) { console.warn('sendAudioToLive err', e && e.message); }
  }

  stopLiveTranscription() {
    try {
      if (this.liveConnection && typeof this.liveConnection.finish === 'function') {
        this.liveConnection.finish();
      }
      this.isConnected = false;
      if (this._ka) { clearInterval(this._ka); this._ka = null; }
      this.emit('stt:close');
      console.log('Transcripción en vivo detenida');
    } catch (e) { this.emit('api:error', e); }
  }

  isLiveConnected() { return this.isConnected; }
  setStatusCallback(cb) { this.statusCallback = typeof cb === 'function' ? cb : null; }
}

module.exports = DeepgramService;

