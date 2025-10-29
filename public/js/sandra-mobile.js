(() => {
  const $ = sel => document.querySelector(sel);
  const chatEl = document.createElement('div');
  chatEl.className = 'chat';
  const stateEl = document.createElement('div'); stateEl.className = 'state';
  const sosEl = document.createElement('div'); sosEl.className = 'alert'; sosEl.style.display='none';

  document.body.innerHTML = `
    <div class="container">
      <div class="header">
        <div class="avatar">
          <img id="avatar-img" src="/img/avatar-sandra.png" alt="Sandra avatar"/>
          <div class="pulse"></div>
          <div class="mouth" id="mouth"></div>
        </div>
        <div>
          <div class="title">Sandra IA · Conversación</div>
          <div class="badge">Voz · Barge-in · Multimodal</div>
        </div>
      </div>
      <div class="panel" id="panelChat"></div>

      <!-- MULTIMODAL INPUT BAR - Galaxy Enterprise (ChatGPT/Claude Style) -->
      <div class="multimodal-input-bar">
        <button class="clip-btn" id="clipBtn" aria-label="Adjuntar archivos">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- Menú desplegable discreto -->
        <div class="clip-menu" id="clipMenu">
          <button class="clip-menu-item" id="cameraBtn" aria-label="Subir imagen">
            📷 Imagen
          </button>
          <button class="clip-menu-item" id="videoBtn" aria-label="Subir video">
            🎥 Video
          </button>
          <button class="clip-menu-item" id="pdfBtn" aria-label="Subir PDF">
            📄 PDF
          </button>
          <button class="clip-menu-item" id="fileBtn" aria-label="Adjuntar archivo">
            📎 Archivo
          </button>
        </div>

        <div class="input-wrapper">
          <textarea id="input" placeholder="Escribe tu mensaje..." autocomplete="off" rows="1"></textarea>
        </div>

        <button class="voice-btn" id="micBtn" aria-label="Click para dictar (ChatGPT style)">
          🎤
        </button>

        <button class="send-btn" id="sendBtn" aria-label="Enviar mensaje">
          ➤
        </button>
      </div>

      <!-- Hidden file inputs -->
      <input type="file" id="cameraInput" accept="image/*" capture="environment" style="display:none" multiple/>
      <input type="file" id="videoInput" accept="video/*" capture="user" style="display:none"/>
      <input type="file" id="pdfInput" accept="application/pdf,.pdf" style="display:none" multiple/>
      <input type="file" id="fileInput" accept="*/*" style="display:none" multiple/>

      <div class="wave" id="wave"><span></span><span></span><span></span><span></span><span></span></div>
      <div class="install" id="installBox">
        <b>Instalar</b> — iPhone: Compartir → <i>Añadir a pantalla de inicio</i>.
        <button class="btn small" id="installHelp">¿Cómo?</button>
      </div>
    </div>
    <div class="modal" id="modal">
      <div class="card">
        <h3>Instalar en iPhone (Safari)</h3>
        <ol>
          <li>Pulsa <b>Compartir</b> (cuadrado con flecha ↑).</li>
          <li>Elige <b>Añadir a pantalla de inicio</b>.</li>
          <li>Confirma y abre la app desde el icono.</li>
        </ol>
        <div style="text-align:right;margin-top:8px;">
          <button class="btn" id="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  `;
  $("#panelChat").appendChild(chatEl);
  $("#panelChat").appendChild(sosEl);
  $("#panelChat").appendChild(stateEl);
  $("#installHelp").onclick = () => $("#modal").classList.add('show');
  $("#closeModal").onclick = () => $("#modal").classList.remove('show');

  const mouth = $("#mouth");
  const wave = $("#wave");
  const input = $("#input");
  const sendBtn = $("#sendBtn");
  const micBtn = $("#micBtn");
  const clipBtn = $("#clipBtn");
  const clipMenu = $("#clipMenu");

  const messages = [];
  let isProcessing = false;  // ENTERPRISE: Lock de concurrencia
  let requestId = 0;         // ENTERPRISE: Tracking de requests
  let isSandraPlaying = false; // Barge-in: Sandra hablando flag
  let currentProcessingId = null; // ID del request actual

  // ENTERPRISE: Logging estructurado
  const log = {
    info: (msg, data) => console.log(`[Sandra] ${msg}`, data || ''),
    warn: (msg, data) => console.warn(`[Sandra] ⚠️ ${msg}`, data || ''),
    error: (msg, data) => console.error(`[Sandra] ❌ ${msg}`, data || '')
  };

  // ENTERPRISE: Métricas de performance
  const metrics = {
    chatLatency: [],
    ttsLatency: [],
    errors: { chat: 0, tts: 0, voice: 0 }
  };

  function trackMetric(type, duration) {
    if (type === 'chat') metrics.chatLatency.push(duration);
    if (type === 'tts') metrics.ttsLatency.push(duration);
    log.info(`${type} latency: ${duration}ms`);
  }

  function pushMsg(role, content) {
    const div = document.createElement('div');
    div.className = 'msg ' + (role === 'user' ? 'user' : 'ai');
    div.textContent = content;
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
    messages.push({ role, content });
  }

  // Audio infra
  let audioCtx, analyser, gain, source, currentAudio;

  // AVATAR SYNC - INSTALADO PERO DESACTIVADO
  // Para activar: descomentar las líneas marcadas con "// AVATAR:"
  let avatarSync = null;
  const AVATAR_ENABLED = false; // CEO: Cambiar a true para activar

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      gain = audioCtx.createGain();
      gain.connect(audioCtx.destination);
      analyser.connect(gain);

      // AVATAR: Inicializar avatar sync (desactivado)
      if (AVATAR_ENABLED && typeof AvatarSync !== 'undefined') {
        avatarSync = new AvatarSync({
          mouthElement: mouth,
          avatarElement: $("#avatar-img")
        });
        avatarSync.initialize(audioCtx);
        log.info('Avatar sync inicializado');
      }
    }
  }
  function playBase64(mime, b64) {
    ensureAudio();
    const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return audioCtx.decodeAudioData(buf.buffer.slice(0)).then(buffer => {
      if (currentAudio) { try { currentAudio.stop(); } catch{} }
      const src = audioCtx.createBufferSource();
      src.buffer = buffer;
      src.connect(analyser);
      source = src;
      currentAudio = src;
      isSandraPlaying = true; // BARGE-IN: Marcar que Sandra está hablando

      // AVATAR: Conectar avatar sync al audio (desactivado)
      if (AVATAR_ENABLED && avatarSync) {
        avatarSync.connectBufferSource(src);
        avatarSync.startAnimation();
      }

      src.start();
      animateMouth();
      src.onended = () => {
        currentAudio = null;
        isSandraPlaying = false; // BARGE-IN: Sandra terminó de hablar
        wave.classList.remove('active');
        setMouth(0.1);

        // AVATAR: Detener animación del avatar (desactivado)
        if (AVATAR_ENABLED && avatarSync) {
          avatarSync.stopAnimation();
        }
      };
    });
  }
  function setMouth(level){
    const scale = Math.max(.08, Math.min(1, level*1.8));
    mouth.style.transform = `translateX(-50%) scaleY(${scale})`;
  }
  function animateMouth(){
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const loop = () => {
      if (!currentAudio) { setMouth(.1); return; }
      analyser.getByteTimeDomainData(data);
      let sum=0; for (let i=0;i<data.length;i++){ const v=(data[i]-128)/128; sum+=v*v; }
      const rms = Math.sqrt(sum/data.length);
      setMouth(rms*2);
      requestAnimationFrame(loop);
    };
    loop();
  }

  // Speech Recognition - CHATGPT STYLE: Click to start/stop, transcribe to input
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec, recognizing=false;
  let isDictating = false; // Estado de dictado (toggle)
  let interimTranscript = ''; // Transcripción temporal
  let locale = (localStorage.getItem('sandra_locale') || (navigator.language || 'es-ES'));

  function initRec(){
    if (!SpeechRecognition) { state('⚠️ Este navegador no soporta reconocimiento de voz.'); return; }
    rec = new SpeechRecognition();
    rec.lang = locale;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
      recognizing = true;
      wave.classList.add('active');
      micBtn.classList.add('recording');
      state('🎙️ Dictando... (click para parar)');
    };

    rec.onend = () => {
      recognizing = false;
      wave.classList.remove('active');
      micBtn.classList.remove('recording');

      // Si estábamos dictando y termina inesperadamente, reiniciar
      if (isDictating) {
        try { rec.start(); } catch {}
      } else {
        state('🟢 Listo');
      }
    };

    rec.onerror = (e) => {
      state('⚠️ Voz: '+e.error);
      isDictating = false;
      micBtn.classList.remove('recording');
    };

    rec.onresult = (evt) => {
      let interim = '';
      let final = '';

      // Procesar todos los resultados
      for (let i = evt.resultIndex; i < evt.results.length; i++) {
        const transcript = evt.results[i][0].transcript;
        if (evt.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      // CHATGPT STYLE: Actualizar textarea con transcripción
      if (final) {
        // Agregar al input existente (permite edición acumulativa)
        const currentValue = input.value.trim();
        input.value = currentValue + (currentValue ? ' ' : '') + final.trim();

        // Ajustar altura del textarea
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 200) + 'px';

        interimTranscript = '';
      }

      // Mostrar transcripción temporal (opcional - comentar si no se desea)
      if (interim && isDictating) {
        const currentFinal = input.value.trim();
        // state(`🎙️ "${interim}..."`);
      }
    };
  }

  function startDictation(){
    if (!rec) initRec();
    isDictating = true;
    interimTranscript = '';
    try { rec.start(); } catch{}
  }

  function stopDictation(){
    isDictating = false;
    if (rec && recognizing) {
      try { rec.stop(); } catch{}
    }
    state('🟢 Listo - Revisa y envía');
  }

  function state(t){ stateEl.textContent = t; }

  // Backends
  const MODE = (window.SANDRA_MODE || null);
  async function chatLLM(text){
    const body = { messages: messages.slice(-12).concat([{ role:'user', content: text }]), locale, mode: MODE || null };

    // ENTERPRISE: Timeout controller (15s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const r = await fetch('/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!r.ok) {
        const errorData = await r.json().catch(() => ({}));
        throw new Error(`Chat error ${r.status}: ${errorData.error || 'API error'}`);
      }

      const data = await r.json();
      return { text: data.text || 'Sin respuesta' };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        metrics.errors.chat++;
        throw new Error('Timeout: La consulta tardó demasiado (>15s)');
      }
      metrics.errors.chat++;
      log.error('chatLLM error:', error);
      throw error;
    }
  }
  async function ttsSpeak(text){
    // ENTERPRISE: Timeout controller (10s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const r = await fetch('/api/tts', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!r.ok) {
        const errorData = await r.json().catch(() => ({}));
        throw new Error(`TTS error ${r.status}: ${errorData.error || 'TTS failed'}`);
      }

      const data = await r.json();
      const { mime, audioBase64 } = data;

      if (!audioBase64) throw new Error('No audio data received from TTS');

      await audioCtx.resume();
      await playBase64(mime || 'audio/mpeg', audioBase64);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        metrics.errors.tts++;
        throw new Error('Timeout: TTS tardó demasiado (>10s)');
      }
      metrics.errors.tts++;
      log.error('ttsSpeak error:', error);
      throw error;
    }
  }
  async function handleQuery(text, isBargeIn = false){
    // BARGE-IN FIX: Permitir interrupción
    if (isProcessing && !isBargeIn) {
      log.warn('Query already in progress, ignoring duplicate');
      state('⚠️ Ya procesando consulta anterior...');
      return;
    }

    // BARGE-IN: Si es interrupción, cancelar request anterior
    if (isBargeIn && currentProcessingId) {
      log.info('BARGE-IN: Cancelando request anterior', currentProcessingId);
      // El request anterior se descartará en la validación
    }

    const currentRequestId = ++requestId;
    currentProcessingId = currentRequestId;
    isProcessing = true;
    sendBtn.disabled = true;
    micBtn.disabled = true;

    try {
      state('🤖 Pensando...');

      // Chat con métricas
      const chatStart = Date.now();
      const { text:answer } = await chatLLM(text);
      trackMetric('chat', Date.now() - chatStart);

      // BARGE-IN: Validar que no fue cancelado
      if (currentRequestId !== requestId) {
        log.info('Request cancelado por barge-in, descartando respuesta');
        return;
      }

      if (!answer) throw new Error('Empty response from LLM');
      pushMsg('assistant', answer);

      state('📢 Hablando...');

      // TTS con métricas
      const ttsStart = Date.now();
      await ttsSpeak(answer);
      trackMetric('tts', Date.now() - ttsStart);

      state('🟢 Listo');
    }
    catch(e){
      log.error('handleQuery error:', e);

      const userMsg = e.message.includes('Timeout')
        ? '⏱️ La consulta tardó demasiado. Reinténtalo.'
        : e.message.includes('Network')
        ? '📡 Error de conexión. Verifica tu internet.'
        : '❌ Disculpa, hubo un error. Reinténtalo.';

      state('❌ Error: ' + (e.message || 'Unknown'));
      pushMsg('assistant', userMsg);
    }
    finally {
      // BARGE-IN: Solo liberar si es el request actual
      if (currentRequestId === requestId) {
        isProcessing = false;
        currentProcessingId = null;
      }
      sendBtn.disabled = false;
      micBtn.disabled = false;
    }
  }
  sendBtn.onclick = () => {
    const v = input.value.trim();
    if (!v) return;

    // ENTERPRISE: Protección contra múltiples clicks
    if (isProcessing) {
      state('⚠️ Espera a que termine la consulta anterior');
      return;
    }

    pushMsg('user', v);
    input.value='';
    handleQuery(v);
  };
  // CHATGPT STYLE: Click to start/stop dictation (simple toggle)
  micBtn.onclick = async (e) => {
    e.preventDefault();

    // Toggle: Si está dictando, parar. Si no, iniciar.
    if (isDictating) {
      // PARAR DICTADO
      stopDictation();
    } else {
      // INICIAR DICTADO
      if (!rec) initRec();
      if (audioCtx) await audioCtx.resume();
      startDictation();
    }
  };

  // CHATGPT/CLAUDE STYLE: Clip menu toggle
  clipBtn.onclick = (e) => {
    e.stopPropagation();
    clipMenu.classList.toggle('show');
  };

  // Cerrar menú al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!clipMenu.contains(e.target) && e.target !== clipBtn) {
      clipMenu.classList.remove('show');
    }
  });

  // TEXTAREA AUTOEXPANDIBLE (ChatGPT/Claude style)
  input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
  });

  // Enter para enviar, Shift+Enter para nueva línea
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // MULTIMODAL: File handlers
  const cameraBtn = $('#cameraBtn');
  const videoBtn = $('#videoBtn');
  const pdfBtn = $('#pdfBtn');
  const fileBtn = $('#fileBtn');

  const cameraInput = $('#cameraInput');
  const videoInput = $('#videoInput');
  const pdfInput = $('#pdfInput');
  const fileInput = $('#fileInput');

  cameraBtn.onclick = () => {
    clipMenu.classList.remove('show');
    cameraInput.click();
  };
  videoBtn.onclick = () => {
    clipMenu.classList.remove('show');
    videoInput.click();
  };
  pdfBtn.onclick = () => {
    clipMenu.classList.remove('show');
    pdfInput.click();
  };
  fileBtn.onclick = () => {
    clipMenu.classList.remove('show');
    fileInput.click();
  };

  // MULTIMODAL: Camera/Image handler
  cameraInput.onchange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    state('📸 Procesando imágenes...');

    for (const file of files) {
      try {
        const base64 = await fileToBase64(file);

        // Enviar imagen al backend para análisis
        const r = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            mimeType: file.type,
            prompt: 'Describe esta imagen en detalle.'
          })
        });

        if (!r.ok) throw new Error('Vision API failed');

        const { description } = await r.json();

        pushMsg('user', `📷 [Imagen adjunta: ${file.name}]`);
        pushMsg('assistant', description);

      } catch (err) {
        log.error('Image processing error:', err);
        pushMsg('assistant', '⚠️ No pude procesar la imagen. Reinténtalo.');
      }
    }

    cameraInput.value = '';
    state('🟢 Listo');
  };

  // MULTIMODAL: Video handler
  videoInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    state('🎥 Procesando video...');

    try {
      // Extraer frame para análisis
      const videoFrame = await extractVideoFrame(file);

      const r = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: videoFrame,
          mimeType: 'image/jpeg',
          prompt: 'Describe el contenido de este video.'
        })
      });

      if (!r.ok) throw new Error('Video analysis failed');

      const { description } = await r.json();

      pushMsg('user', `🎥 [Video adjunto: ${file.name}]`);
      pushMsg('assistant', `Análisis del video: ${description}`);

    } catch (err) {
      log.error('Video processing error:', err);
      pushMsg('assistant', '⚠️ No pude procesar el video. Reinténtalo.');
    }

    videoInput.value = '';
    state('🟢 Listo');
  };

  // MULTIMODAL: PDF handler
  pdfInput.onchange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    state('📄 Procesando PDFs...');

    for (const file of files) {
      try {
        const base64 = await fileToBase64(file);

        const r = await fetch('/api/pdf-extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdf: base64,
            filename: file.name
          })
        });

        if (!r.ok) throw new Error('PDF extraction failed');

        const { text, summary } = await r.json();

        pushMsg('user', `📄 [PDF adjunto: ${file.name}]`);
        pushMsg('assistant', `Resumen del documento: ${summary || text.substring(0, 500)}...`);

      } catch (err) {
        log.error('PDF processing error:', err);
        pushMsg('assistant', '⚠️ No pude procesar el PDF. Reinténtalo.');
      }
    }

    pdfInput.value = '';
    state('🟢 Listo');
  };

  // MULTIMODAL: Generic file handler
  fileInput.onchange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    state('📎 Procesando archivos...');

    for (const file of files) {
      try {
        const base64 = await fileToBase64(file);

        const r = await fetch('/api/file-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64,
            filename: file.name,
            mimeType: file.type
          })
        });

        if (!r.ok) throw new Error('File analysis failed');

        const { analysis } = await r.json();

        pushMsg('user', `📎 [Archivo adjunto: ${file.name}]`);
        pushMsg('assistant', analysis);

      } catch (err) {
        log.error('File processing error:', err);
        pushMsg('assistant', `⚠️ No pude procesar ${file.name}. Reinténtalo.`);
      }
    }

    fileInput.value = '';
    state('🟢 Listo');
  };

  // MULTIMODAL: Helper functions
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function extractVideoFrame(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;

      video.onloadeddata = () => {
        video.currentTime = 1; // Extraer frame en segundo 1
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        URL.revokeObjectURL(video.src);
        resolve(base64);
      };

      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  }

  function showSOS(){ sosEl.textContent = '🚨 SOS detectado (placeholder). Integra aquí tu rutina de emergencia/restauración.';
    sosEl.style.display='block'; setTimeout(()=> sosEl.style.display='none', 5000); }

  pushMsg('assistant', 'Hola, soy Sandra. Escribe, habla o adjunta archivos para comenzar.');
  state('🟢 Listo');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (!isIOS) document.querySelector('#installBox').style.display='none';
})();
