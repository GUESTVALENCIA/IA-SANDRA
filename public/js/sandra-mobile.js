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
          <div class="badge">Voz · Barge-in · Español</div>
        </div>
      </div>
      <div class="panel" id="panelChat"></div>
      <div class="controls">
        <input id="input" type="text" placeholder="Escribe o pulsa 🎤 para hablar..." autocomplete="off"/>
        <button class="btn" id="sendBtn">▶️</button>
        <button class="btn voice-btn" id="micBtn">🎤</button>
      </div>
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
  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      gain = audioCtx.createGain();
      gain.connect(audioCtx.destination);
      analyser.connect(gain);
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
      src.start();
      animateMouth();
      src.onended = () => {
        currentAudio = null;
        isSandraPlaying = false; // BARGE-IN: Sandra terminó de hablar
        wave.classList.remove('active');
        setMouth(0.1);
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

  // Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec, recognizing=false, wakeMode=true;
  let locale = (localStorage.getItem('sandra_locale') || (navigator.language || 'es-ES'));
  function initRec(){
    if (!SpeechRecognition) { state('⚠️ Este navegador no soporta reconocimiento de voz.'); return; }
    rec = new SpeechRecognition();
    rec.lang = locale;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onstart = () => { recognizing = true; wave.classList.add('active'); state('🎙️ Escuchando...'); };
    rec.onend = () => { recognizing = false; wave.classList.remove('active'); state('🟢 Listo'); };
    rec.onerror = (e) => { state('⚠️ Voz: '+e.error); };
    rec.onresult = (evt) => {
      const last = evt.results[evt.results.length-1];
      const text = last[0].transcript.trim();

      if (wakeMode && /^(hola\s*sandra|ok\s*sandra)/i.test(text)) {
        wakeMode = false;
        state('🔓 Activada. Te escucho.');
        return;
      }

      if (/^(sos|emergencia|ayuda)/i.test(text)) {
        showSOS();
        return;
      }

      // BARGE-IN FIX: Detección de interrupción
      if (last.isFinal && !wakeMode) {
        stopRec();  // Detener reconocimiento primero

        // BARGE-IN: Si Sandra está hablando, es una interrupción
        const isBargeIn = isSandraPlaying;

        // BARGE-IN: Cancelar audio de Sandra si está hablando
        if (currentAudio) {
          try {
            currentAudio.stop();
            currentAudio.disconnect();
          } catch(e) {
            log.warn('Audio stop error:', e);
          }
          currentAudio = null;
          isSandraPlaying = false;
        }

        // BARGE-IN: Cancelar procesamiento anterior si existe
        if (isBargeIn && isProcessing) {
          log.info('BARGE-IN DETECTED: Cancelando procesamiento anterior');
          isProcessing = false; // Liberar el lock
          currentProcessingId = null; // Reset ID
        }

        pushMsg('user', text);
        handleQuery(text, isBargeIn);
      }
    };
  }
  function startRec(){ if (!rec) initRec(); try { rec.start(); } catch{} }
  function stopRec(){ if (rec && recognizing) try { rec.stop(); } catch{} }
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
  micBtn.onclick = async () => { if (!audioCtx) ensureAudio(); await audioCtx.resume(); if (!recognizing){ wakeMode=false; startRec(); } else { stopRec(); } };
  function showSOS(){ sosEl.textContent = '🚨 SOS detectado (placeholder). Integra aquí tu rutina de emergencia/restauración.';
    sosEl.style.display='block'; setTimeout(()=> sosEl.style.display='none', 5000); }

  pushMsg('assistant', 'Hola, soy Sandra. Toca 🎤 o di “Hola Sandra” (tras permitir el micrófono).');
  state('🟢 Listo');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (!isIOS) document.querySelector('#installBox').style.display='none';
})();
