`(() => {
`  const $ = sel => document.querySelector(sel);
`  const chatEl = document.createElement('div');
`  chatEl.className = 'chat';
`  const stateEl = document.createElement('div'); stateEl.className = 'state';
`  const sosEl = document.createElement('div'); sosEl.className = 'alert'; sosEl.style.display='none';
`
`  document.body.innerHTML = `
`    <div class="container">
`      <div class="header">
`        <!-- AVATAR CONTAINER - Circle mode -->
`        <div class="avatar" id="avatarCircle">
`          <img id="avatar-img" src="/img/avatar-sandra.png" alt="Sandra avatar"/>
`          <div class="pulse"></div>
`          <div class="mouth" id="mouth"></div>
`        </div>
`
`        <!-- HEYGEN VIDEO AVATAR CONTAINER - Video mode -->
`        <div id="videoAvatarContainer" style="display: none;">
`          <video id="videoAvatar" autoplay playsinline muted></video>
`        </div>
`
`        <!-- VIDEO TOGGLE BUTTON - Switch between modes -->
`        <button id="videoToggle" title="Activar avatar video HeyGen" onclick="toggleVideoMode()">📹</button>
`        <div>
`          <div class="title">Sandra IA · Conversación</div>
`
`          <!-- LANGUAGE SELECTOR - MULTI-LANGUAGE HOT-SWAP ES/EN/FR -->
`          <div class="language-selector">
`            <button class="lang-btn active" data-lang="es" title="Español">
`              🇪🇸 ES
`            </button>
`            <button class="lang-btn" data-lang="en" title="English">
`              🇬🇧 EN
`            </button>
`            <button class="lang-btn" data-lang="fr" title="Français">
`              🇫🇷 FR
`            </button>
`          </div>
`        </div>
`      </div>
`
`      <!-- PANEL DE CHAT CON MULTIMODAL BAR INTEGRADA (ChatGPT/WhatsApp Style) -->
`      <div class="panel" id="panelChat">
`        <!-- Chat messages will be inserted here -->
`
`        <!-- MULTIMODAL INPUT BAR - INTEGRADA DENTRO DEL PANEL -->
`        <div class="multimodal-input-bar">
`          <button class="clip-btn" id="clipBtn" aria-label="Adjuntar archivos">
`            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
`              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
`            </svg>
`          </button>
`
`          <!-- Menú desplegable discreto -->
`          <div class="clip-menu" id="clipMenu">
`            <button class="clip-menu-item" id="captureBtn" aria-label="Capturar imagen">
`              📷 Capturar imagen
`            </button>
`            <button class="clip-menu-item" id="cameraBtn" aria-label="Subir imagen">
`              🖼️ Subir imagen
`            </button>
`            <button class="clip-menu-item" id="videoBtn" aria-label="Subir video">
`              🎥 Video
`            </button>
`            <button class="clip-menu-item" id="pdfBtn" aria-label="Subir PDF">
`              📄 PDF
`            </button>
`            <button class="clip-menu-item" id="fileBtn" aria-label="Adjuntar archivo">
`              📎 Archivo
`            </button>
`          </div>
`
`          <div class="input-wrapper">
`            <textarea id="input" placeholder="Escribe tu mensaje..." autocomplete="off" rows="1"></textarea>
`          </div>
`
`          <button class="voice-btn" id="micBtn" aria-label="Dictado por voz">
`            🎤
`          </button>
`
`          <button class="wake-btn" id="wakeBtn" aria-label="Activar 'Hola Sandra'">
`            <span class="wake-icon">👂</span>
`          </button>
`
`          <button class="send-btn" id="sendBtn" aria-label="Enviar mensaje">
`            ➤
`          </button>
`        </div>
`      </div>
`
`      <!-- Hidden file inputs -->
`      <input type="file" id="cameraInput" accept="image/*" style="display:none" multiple/>
`      <input type="file" id="videoInput" accept="video/*" style="display:none"/>
`      <input type="file" id="pdfInput" accept="application/pdf,.pdf" style="display:none" multiple/>
`      <input type="file" id="fileInput" accept="*/*" style="display:none" multiple/>
`
`      <!-- Camera capture elements (hidden by default) -->
`      <div id="cameraModal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.95); z-index:9999; flex-direction:column; align-items:center; justify-content:center;">
`        <video id="cameraPreview" autoplay playsinline style="max-width:90%; max-height:70vh; border-radius:12px;"></video>
`        <canvas id="cameraCanvas" style="display:none;"></canvas>
`        <div style="margin-top:20px; display:flex; gap:15px;">
`          <button id="capturePhotoBtn" class="btn" style="background:#4CAF50; color:white; padding:12px 30px; border-radius:8px; border:none; font-size:16px;">📸 Capturar</button>
`          <button id="closeCameraBtn" class="btn" style="background:#f44336; color:white; padding:12px 30px; border-radius:8px; border:none; font-size:16px;">✖ Cancelar</button>
`        </div>
`      </div>
`
`      <div class="wave" id="wave"><span></span><span></span><span></span><span></span><span></span></div>
`      <div class="install" id="installBox">
`        <b>Instalar</b> — iPhone: Compartir → <i>Añadir a pantalla de inicio</i>.
`        <button class="btn small" id="installHelp">¿Cómo?</button>
`      </div>
`    </div>
`    <div class="modal" id="modal">
`      <div class="card">
`        <h3>Instalar en iPhone (Safari)</h3>
`        <ol>
`          <li>Pulsa <b>Compartir</b> (cuadrado con flecha ↑).</li>
`          <li>Elige <b>Añadir a pantalla de inicio</b>.</li>
`          <li>Confirma y abre la app desde el icono.</li>
`        </ol>
`        <div style="text-align:right;margin-top:8px;">
`          <button class="btn" id="closeModal">Cerrar</button>
`        </div>
`      </div>
`    </div>
`  `;
`  $("#panelChat").appendChild(chatEl);
`  $("#panelChat").appendChild(sosEl);
`  $("#panelChat").appendChild(stateEl);
`  $("#installHelp").onclick = () => $("#modal").classList.add('show');
`  $("#closeModal").onclick = () => $("#modal").classList.remove('show');
`
`  const mouth = $("#mouth");
`  const wave = $("#wave");
`  const input = $("#input");
`  const sendBtn = $("#sendBtn");
`  const micBtn = $("#micBtn");
`  const wakeBtn = $("#wakeBtn");
`  const clipBtn = $("#clipBtn");
`  const clipMenu = $("#clipMenu");
`
`  // ============================================
`  // MULTI-LANGUAGE SYSTEM - ES/EN/FR HOT-SWAP
`  // Instant language switching without reload
`  // CEO URGENT REQUIREMENT
`  // ============================================
`
`  let currentLanguage = 'es'; // Default Spanish
`
`  const LANGUAGE_CONFIG = {
`    es: {
`      code: 'es-ES',
`      name: 'Español',
`      flag: '🇪🇸',
`      voiceRecognition: 'es-ES',
`      ttsLocale: 'es-ES',
`      greetings: ['Hola', 'Buenos días', 'Buenas tardes'],
`      placeholders: {
`        input: 'Escribe tu mensaje...',
`        listening: '🎤 Escuchando...',
`        ready: '🟢 Listo',
`        processing: '⏳ Procesando...',
`        thinking: '🤖 Pensando...',
`        speaking: '📢 Hablando...'
`      },
`      wakeWord: 'hola sandra',
`      wakeWordTitle: "Activar 'Hola Sandra'",
`      wakeWordListening: '🎤 Escuchando "Hola Sandra"...',
`      wakeWordDeactivate: 'Desactivar wake word'
`    },
`    en: {
`      code: 'en-US',
`      name: 'English',
`      flag: '🇬🇧',
`      voiceRecognition: 'en-US',
`      ttsLocale: 'en-US',
`      greetings: ['Hello', 'Good morning', 'Good afternoon'],
`      placeholders: {
`        input: 'Type your message...',
`        listening: '🎤 Listening...',
`        ready: '🟢 Ready',
`        processing: '⏳ Processing...',
`        thinking: '🤖 Thinking...',
`        speaking: '📢 Speaking...'
`      },
`      wakeWord: 'hey sandra',
`      wakeWordTitle: "Activate 'Hey Sandra'",
`      wakeWordListening: '🎤 Listening for "Hey Sandra"...',
`      wakeWordDeactivate: 'Deactivate wake word'
`    },
`    fr: {
`      code: 'fr-FR',
`      name: 'Français',
`      flag: '🇫🇷',
`      voiceRecognition: 'fr-FR',
`      ttsLocale: 'fr-FR',
`      greetings: ['Bonjour', 'Bonsoir'],
`      placeholders: {
`        input: 'Tapez votre message...',
`        listening: '🎤 Écoute...',
`        ready: '🟢 Prêt',
`        processing: '⏳ Traitement...',
`        thinking: '🤖 Réflexion...',
`        speaking: '📢 Parole...'
`      },
`      wakeWord: 'salut sandra',
`      wakeWordTitle: "Activer 'Salut Sandra'",
`      wakeWordListening: '🎤 Écoute "Salut Sandra"...',
`      wakeWordDeactivate: 'Désactiver wake word'
`    }
`  };
`
`  // Switch language instantly (hot-swap without reload)
`  function switchLanguage(langCode) {
`    if (!LANGUAGE_CONFIG[langCode]) {
`      log.error(`Invalid language code: ${langCode}`);
`      return;
`    }
`
`    const prevLang = currentLanguage;
`    currentLanguage = langCode;
`    const config = LANGUAGE_CONFIG[langCode];
`
`    log.info(`🌍 Language switch: ${prevLang} → ${langCode}`);
`
`    // Update UI immediately
`    updateLanguageUI(langCode);
`
`    // Update voice recognition language
`    if (recognition) {
`      recognition.lang = config.voiceRecognition;
`      log.info(`🎤 Voice recognition updated: ${config.voiceRecognition}`);
`    }
`
`    // Update wake word recognition language
`    if (wakeWordRecognition) {
`      wakeWordRecognition.lang = config.voiceRecognition;
`      log.info(`👂 Wake word language updated: ${config.voiceRecognition}`);
`    }
`
`    // Update input placeholder
`    if (input) {
`      input.placeholder = config.placeholders.input;
`    }
`
`    // Update wake button title
`    if (wakeBtn) {
`      wakeBtn.title = isWakeWordListening
`        ? config.wakeWordDeactivate
`        : config.wakeWordTitle;
`    }
`
`    // Update state message
`    state(config.placeholders.ready);
`
`    // Send system message about language change
`    const messages = {
`      es: `${config.flag} Idioma cambiado a ${config.name}`,
`      en: `${config.flag} Language changed to ${config.name}`,
`      fr: `${config.flag} Langue changée en ${config.name}`
`    };
`
`    pushMsg('system', messages[langCode]);
`
`    log.info(`✅ Language switched to ${config.name}`);
`  }
`
`  // Update language button states
`  function updateLanguageUI(langCode) {
`    const buttons = document.querySelectorAll('.lang-btn');
`    buttons.forEach(btn => {
`      if (btn.dataset.lang === langCode) {
`        btn.classList.add('active');
`      } else {
`        btn.classList.remove('active');
`      }
`    });
`  }
`
`  // Initialize language selector
`  function initLanguageSelector() {
`    const langButtons = document.querySelectorAll('.lang-btn');
`    langButtons.forEach(btn => {
`      btn.onclick = () => {
`        const lang = btn.dataset.lang;
`        switchLanguage(lang);
`      };
`    });
`
`    log.info('🌍 Multi-language selector initialized (ES/EN/FR)');
`  }
`
`  // Get current language config
`  function getCurrentLanguageConfig() {
`    return LANGUAGE_CONFIG[currentLanguage];
`  }
`
`  const messages = [];
`  let isProcessing = false;  // ENTERPRISE: Lock de concurrencia
`  let requestId = 0;         // ENTERPRISE: Tracking de requests
`  let isSandraPlaying = false; // Barge-in: Sandra hablando flag
`  let currentProcessingId = null; // ID del request actual
`
`  // WAKE WORD DETECTION - Multi-language
`  let isWakeWordListening = false;
`  let wakeWordRecognition = null;
`
`  // ENTERPRISE: Logging estructurado
`  const log = {
`    info: (msg, data) => console.log(`[Sandra] ${msg}`, data || ''),
`    warn: (msg, data) => console.warn(`[Sandra] ⚠️ ${msg}`, data || ''),
`    error: (msg, data) => console.error(`[Sandra] ❌ ${msg}`, data || '')
`  };
`
`  // ENTERPRISE: Métricas de performance
`  const metrics = {
`    chatLatency: [],
`    ttsLatency: [],
`    errors: { chat: 0, tts: 0, voice: 0 }
`  };
`
`  function trackMetric(type, duration) {
`    if (type === 'chat') metrics.chatLatency.push(duration);
`    if (type === 'tts') metrics.ttsLatency.push(duration);
`    log.info(`${type} latency: ${duration}ms`);
`  }
`
`  function pushMsg(role, content) {
`    const div = document.createElement('div');
`    div.className = 'msg ' + (role === 'user' ? 'user' : role === 'system' ? 'system' : 'ai');
`    div.textContent = content;
`    chatEl.appendChild(div);
`    chatEl.scrollTop = chatEl.scrollHeight;
`    messages.push({ role, content });
`  }
`
`  // Audio infra
`  let audioCtx, analyser, gain, source, currentAudio;
`
`  // AVATAR SYNC - ACTIVADO
`  let avatarSync = null;
`  const AVATAR_ENABLED = true; // CEO: ACTIVADO
`
`  function ensureAudio() {
`    if (!audioCtx) {
`      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
`      analyser = audioCtx.createAnalyser();
`      analyser.fftSize = 2048;
`      gain = audioCtx.createGain();
`      gain.connect(audioCtx.destination);
`      analyser.connect(gain);
`
`      // AVATAR: Inicializar avatar sync
`      if (AVATAR_ENABLED && typeof AvatarSync !== 'undefined') {
`        avatarSync = new AvatarSync({
`          mouthElement: mouth,
`          avatarElement: $("#avatar-img")
`        });
`        avatarSync.initialize(audioCtx);
`        log.info('✅ Avatar sync ACTIVADO');
`      }
`    }
`  }
`  function playBase64(mime, b64) {
`    ensureAudio();
`    const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
`    return audioCtx.decodeAudioData(buf.buffer.slice(0)).then(buffer => {
`      if (currentAudio) { try { currentAudio.stop(); } catch{} }
`      const src = audioCtx.createBufferSource();
`      src.buffer = buffer;
`      src.connect(analyser);
`      source = src;
`      currentAudio = src;
`      isSandraPlaying = true; // BARGE-IN: Marcar que Sandra está hablando
`
`      // AVATAR: Conectar avatar sync al audio
`      if (AVATAR_ENABLED && avatarSync) {
`        avatarSync.connectBufferSource(src);
`        avatarSync.startAnimation();
`      }
`
`      src.start();
`      animateMouth();
`      src.onended = () => {
`        currentAudio = null;
`        isSandraPlaying = false; // BARGE-IN: Sandra terminó de hablar
`        wave.classList.remove('active');
`        setMouth(0.1);
`
`        // AVATAR: Detener animación del avatar
`        if (AVATAR_ENABLED && avatarSync) {
`          avatarSync.stopAnimation();
`        }
`      };
`    });
`  }
`  function setMouth(level){
`    const scale = Math.max(.08, Math.min(1, level*1.8));
`    mouth.style.transform = `translateX(-50%) scaleY(${scale})`;
`  }
`  function animateMouth(){
`    if (!analyser) return;
`    const data = new Uint8Array(analyser.frequencyBinCount);
`    const loop = () => {
`      if (!currentAudio) { setMouth(.1); return; }
`      analyser.getByteTimeDomainData(data);
`      let sum=0; for (let i=0;i<data.length;i++){ const v=(data[i]-128)/128; sum+=v*v; }
`      const rms = Math.sqrt(sum/data.length);
`      setMouth(rms*2);
`      requestAnimationFrame(loop);
`    };
`    loop();
`  }
`
`  // ====================================================================
`  // CHATGPT-STYLE VOICE DICTATION (Exact Clone)
`  // Pattern: Click mic → record continuously → click mic again → stop
`  // Transcription goes directly to input field (editable)
`  // MULTI-LANGUAGE: Uses current language config
`  // ====================================================================
`  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
`  let recognition = null;
`  let isRecording = false;
`
`  function initRecognition() {
`    if (!SpeechRecognition) {
`      log.warn('Speech Recognition no disponible');
`      state('⚠️ Dictado no soportado');
`      return null;
`    }
`
`    const rec = new SpeechRecognition();
`    const langConfig = getCurrentLanguageConfig();
`    rec.lang = langConfig.voiceRecognition;
`    rec.continuous = true;        // ChatGPT: continuous recording
`    rec.interimResults = true;    // ChatGPT: show partial results
`
`    rec.onstart = () => {
`      isRecording = true;
`      micBtn.classList.add('recording');
`      wave.classList.add('active');
`      const config = getCurrentLanguageConfig();
`      state(config.placeholders.listening);
`      log.info('Recording started');
`    };
`
`    rec.onend = () => {
`      // ChatGPT pattern: only update UI if we're intentionally recording
`      if (isRecording) {
`        // Stopped unexpectedly, auto-restart
`        try {
`          rec.start();
`          log.info('Auto-restarted recognition');
`        } catch (err) {
`          // Restart failed, clean up state
`          isRecording = false;
`          micBtn.classList.remove('recording');
`          wave.classList.remove('active');
`          const config = getCurrentLanguageConfig();
`          state(config.placeholders.ready);
`          log.error('Auto-restart failed:', err);
`        }
`      } else {
`        // Stopped intentionally
`        micBtn.classList.remove('recording');
`        wave.classList.remove('active');
`        const config = getCurrentLanguageConfig();
`        state(config.placeholders.ready);
`        log.info('Recording stopped');
`      }
`    };
`
`    rec.onerror = (event) => {
`      log.error('Recognition error:', event.error);
`
`      // ChatGPT pattern: silent errors for expected cases
`      if (event.error === 'no-speech' || event.error === 'aborted') {
`        return; // Don't show error to user
`      }
`
`      // Real error, clean up
`      isRecording = false;
`      micBtn.classList.remove('recording');
`      wave.classList.remove('active');
`      state('⚠️ Error de micrófono');
`    };
`
`    rec.onresult = (event) => {
`      let finalTranscript = '';
`
`      // ChatGPT pattern: only process final results
`      for (let i = event.resultIndex; i < event.results.length; i++) {
`        if (event.results[i].isFinal) {
`          finalTranscript += event.results[i][0].transcript + ' ';
`        }
`      }
`
`      // ChatGPT behavior: add transcription to input field
`      // GUARDIAN PROTOCOL: Check for emergency commands FIRST
`      if (finalTranscript) {
`        const guardianCmd = detectGuardianCommand(finalTranscript);
`        if (guardianCmd) {
`          log.info(`[Guardian] Command detected: ${guardianCmd.type}`);
`          executeGuardianCommand(guardianCmd.type);
`          return; // Don't add to input field
`        }
`      }
`
`      if (finalTranscript) {
`        const currentText = input.value.trim();
`        input.value = currentText + (currentText ? ' ' : '') + finalTranscript.trim();
`
`        // Auto-expand textarea
`        input.style.height = 'auto';
`        input.style.height = Math.min(input.scrollHeight, 200) + 'px';
`
`        log.info('Transcribed:', finalTranscript.trim());
`      }
`    };
`
`    return rec;
`  }
`
`  function startRecording() {
`    if (!recognition) {
`      recognition = initRecognition();
`      if (!recognition) return; // Browser doesn't support it
`    }
`
`    // Update language before starting
`    const langConfig = getCurrentLanguageConfig();
`    recognition.lang = langConfig.voiceRecognition;
`
`    isRecording = true;
`
`    try {
`      recognition.start();
`      log.info('Starting recognition');
`    } catch (err) {
`      // If already started, ignore error
`      if (err.message && err.message.includes('already started')) {
`        log.info('Recognition already active');
`      } else {
`        log.error('Start error:', err);
`        isRecording = false;
`      }
`    }
`  }
`
`  function stopRecording() {
`    isRecording = false;
`
`    if (recognition) {
`      try {
`        recognition.stop();
`        log.info('Stopping recognition');
`      } catch (err) {
`        log.error('Stop error:', err);
`      }
`    }
`  }
`
`  // ====================================================================
`  // WAKE WORD DETECTION - Multi-language support
`  // GALAXY LEVEL FEATURE - Continuous listening for activation phrase
`  // LANGUAGES: "hola sandra" (ES) / "hey sandra" (EN) / "salut sandra" (FR)
`  // ====================================================================
`
`  // Initialize wake word recognition (continuous listening)
`  function initWakeWord() {
`    if (!SpeechRecognition) {
`      log.warn('⚠️ Wake word not supported in this browser');
`      return;
`    }
`
`    wakeWordRecognition = new SpeechRecognition();
`
`    const langConfig = getCurrentLanguageConfig();
`    wakeWordRecognition.lang = langConfig.voiceRecognition;
`    wakeWordRecognition.continuous = true;
`    wakeWordRecognition.interimResults = false;
`    wakeWordRecognition.maxAlternatives = 1;
`
`    wakeWordRecognition.onresult = (event) => {
`      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
`      log.info('🎤 Wake word heard:', transcript);
`
`      const config = getCurrentLanguageConfig();
`      const wakeWord = config.wakeWord;
`
`      // Check if wake word detected (with variations)
`      if (transcript.includes(wakeWord) ||
`          transcript.includes(wakeWord.replace('hola ', 'ola ')) || // Spanish variation
`          transcript === 'sandra') {
`        log.info('✅ Wake word detected! Activating Sandra...');
`        stopWakeWord();
`        activateSandra();
`      }
`    };
`
`    wakeWordRecognition.onerror = (event) => {
`      if (event.error !== 'no-speech' && event.error !== 'aborted') {
`        log.error('Wake word error:', event.error);
`        // Auto-restart on error
`        setTimeout(() => {
`          if (isWakeWordListening) {
`            try {
`              wakeWordRecognition.start();
`            } catch (e) {
`              log.error('Wake word restart failed:', e);
`            }
`          }
`        }, 1000);
`      }
`    };
`
`    wakeWordRecognition.onend = () => {
`      // Auto-restart if still listening mode
`      if (isWakeWordListening) {
`        setTimeout(() => {
`          try {
`            wakeWordRecognition.start();
`          } catch (e) {
`            log.error('Wake word auto-restart failed:', e);
`          }
`        }, 500);
`      }
`    };
`  }
`
`  // Start wake word listening
`  function startWakeWord() {
`    if (!wakeWordRecognition) initWakeWord();
`    if (!wakeWordRecognition) return;
`
`    // Update language before starting
`    const langConfig = getCurrentLanguageConfig();
`    wakeWordRecognition.lang = langConfig.voiceRecognition;
`
`    isWakeWordListening = true;
`    try {
`      wakeWordRecognition.start();
`      state(langConfig.wakeWordListening);
`      log.info(`🎧 Wake word listening started: "${langConfig.wakeWord}"`);
`    } catch (e) {
`      log.error('Wake word start failed:', e);
`    }
`  }
`
`  // Stop wake word listening
`  function stopWakeWord() {
`    if (wakeWordRecognition && isWakeWordListening) {
`      isWakeWordListening = false;
`      try {
`        wakeWordRecognition.stop();
`        log.info('🛑 Wake word listening stopped');
`      } catch (e) {
`        log.error('Wake word stop failed:', e);
`      }
`    }
`  }
`
`  // Activate Sandra when wake word detected
`  function activateSandra() {
`    const config = getCurrentLanguageConfig();
`    state(`👂 Sandra activada - ${config.placeholders.listening}`);
`    // Start regular voice recording
`    if (!isRecording) {
`      startRecording();
`    }
`  }
`
`  // ============================================
`  // GUARDIAN PROTOCOL - SOS/RESTAURAR COMMANDS
`  // Emergency snapshot and restoration system
`  // CEO Requirement: Voice-activated emergency commands
`  // ============================================
`
`  const GUARDIAN_COMMANDS = {
`    SOS: ['sos', 'emergencia', 'guardar estado', 'punto de restauración', 'snapshot'],
`    RESTAURAR: ['restaurar', 'volver atrás', 'restauración', 'recovery', 'recuperar']
`  };
`
`  // Check if transcript contains Guardian command
`  function detectGuardianCommand(transcript) {
`    const text = transcript.toLowerCase().trim();
`
`    // Check SOS commands
`    for (const cmd of GUARDIAN_COMMANDS.SOS) {
`      if (text.includes(cmd)) {
`        return { type: 'SOS', command: cmd };
`      }
`    }
`
`    // Check RESTAURAR commands
`    for (const cmd of GUARDIAN_COMMANDS.RESTAURAR) {
`      if (text.includes(cmd)) {
`        return { type: 'RESTAURAR', command: cmd };
`      }
`    }
`
`    return null;
`  }
`
`  // Execute Guardian Protocol command
`  async function executeGuardianCommand(type) {
`    try {
`      state(`[Guardian] Protocol: ${type}...`);
`      log.info(`Guardian Protocol activated: ${type}`);
`
`      // Show visual indicator
`      $("#panelChat").classList.add('guardian-active');
`
`      const response = await fetch('/api/guardian', {
`        method: 'POST',
`        headers: { 'Content-Type': 'application/json' },
`        body: JSON.stringify({
`          command: type,
`          timestamp: new Date().toISOString(),
`          context: {
`            conversationHistory: messages.slice(-5), // Last 5 messages
`            userState: 'active'
`          }
`        })
`      });
`
`      if (!response.ok) {
`        throw new Error(\`Guardian API error: \${response.status}\`);
`      }
`
`      const data = await response.json();
`
`      // Remove visual indicator
`      $("#panelChat").classList.remove('guardian-active');
`
`      if (type === 'SOS') {
`        pushMsg('assistant', \`✅ Punto de restauración creado: \${data.snapshotId}\n\n\` +
`                \`🛡️ Estado guardado de forma segura. Puedes continuar con confianza.\`);
`        state('🟢 Listo - Snapshot guardado');
`      } else {
`        pushMsg('assistant', \`✅ Sistema restaurado al punto: \${data.restoredFrom}\n\n\` +
`                \`🛡️ Estado recuperado exitosamente.\`);
`        state('🟢 Listo - Estado restaurado');
`      }
`
`      log.info(\`Guardian Protocol \${type} completed:\`, data);
`
`    } catch (error) {
`      log.error(\`Guardian Protocol \${type} failed:\`, error);
`      $("#panelChat").classList.remove('guardian-active');
`      pushMsg('assistant', \`⚠️ Error en Guardian Protocol: \${error.message}\n\n\` +
`              \`Por favor, intenta nuevamente.\`);
`      state('🔴 Error Guardian');
`    }
`  }
`
`
`  // CHATGPT PATTERN: Simple toggle (click = start/stop)
`  micBtn.onclick = async (e) => {
`    e.preventDefault();
`
`    // Resume AudioContext if suspended (iOS requirement)
`    if (audioCtx && audioCtx.state === 'suspended') {
`      await audioCtx.resume();
`    }
`
`    // ChatGPT pattern: simple toggle
`    if (isRecording) {
`      stopRecording();
`    } else {
`      startRecording();
`    }
`  };
`
`  // Wake word button toggle
`  wakeBtn.onclick = () => {
`    const config = getCurrentLanguageConfig();
`
`    if (!isWakeWordListening) {
`      startWakeWord();
`      wakeBtn.classList.add('active');
`      wakeBtn.title = config.wakeWordDeactivate;
`    } else {
`      stopWakeWord();
`      wakeBtn.classList.remove('active');
`      state(config.placeholders.ready);
`      wakeBtn.title = config.wakeWordTitle;
`    }
`  };
`
`  function state(t){ stateEl.textContent = t; }
`
`  // Backends with multi-language support
`  const MODE = (window.SANDRA_MODE || null);
`  async function chatLLM(text){
`    const langConfig = getCurrentLanguageConfig();
`    const body = {
`      messages: messages.slice(-12).concat([{ role:'user', content: text }]),
`      locale: langConfig.code,
`      language: currentLanguage, // NEW: Send current language
`      mode: MODE || null
`    };
`
`    // ENTERPRISE: Timeout controller (15s)
`    const controller = new AbortController();
`    const timeoutId = setTimeout(() => controller.abort(), 15000);
`
`    try {
`      const r = await fetch('/api/chat', {
`        method:'POST',
`        headers:{'Content-Type':'application/json'},
`        body: JSON.stringify(body),
`        signal: controller.signal
`      });
`
`      clearTimeout(timeoutId);
`
`      if (!r.ok) {
`        const errorData = await r.json().catch(() => ({}));
`        throw new Error(`Chat error ${r.status}: ${errorData.error || 'API error'}`);
`      }
`
`      const data = await r.json();
`      return { text: data.text || 'Sin respuesta' };
`    } catch (error) {
`      clearTimeout(timeoutId);
`      if (error.name === 'AbortError') {
`        metrics.errors.chat++;
`        throw new Error('Timeout: La consulta tardó demasiado (>15s)');
`      }
`      metrics.errors.chat++;
`      log.error('chatLLM error:', error);
`      throw error;
`    }
`  }
`  async function ttsSpeak(text){
`    // HEYGEN INTEGRATION: Use HeyGen video avatar when active
`    if (typeof window.isVideoMode === 'function' && window.isVideoMode()) {
`      console.log('[Sandra] Using HeyGen video avatar for speech');
`
`      // Use HeyGen speak with lipsync
`      if (typeof window.heygenSpeak === 'function') {
`        try {
`          await window.heygenSpeak(text);
`          return; // Skip regular TTS
`        } catch (error) {
`          console.error('[Sandra] HeyGen speak failed, falling back to TTS:', error);
`          // Continue with regular TTS below
`        }
`      }
`    }
`
`    // REGULAR TTS (ElevenLabs/Cartesia)
`    const langConfig = getCurrentLanguageConfig();
`
`    // ENTERPRISE: Timeout controller (10s)
`    const controller = new AbortController();
`    const timeoutId = setTimeout(() => controller.abort(), 10000);
`
`    try {
`      const r = await fetch('/api/tts', {
`        method:'POST',
`        headers:{'Content-Type':'application/json'},
`        body: JSON.stringify({
`          text,
`          locale: langConfig.ttsLocale, // NEW: Send language-specific locale
`          language: currentLanguage // NEW: Send current language
`        }),
`        signal: controller.signal
`      });
`
`      clearTimeout(timeoutId);
`
`      if (!r.ok) {
`        const errorData = await r.json().catch(() => ({}));
`        throw new Error(`TTS error ${r.status}: ${errorData.error || 'TTS failed'}`);
`      }
`
`      const data = await r.json();
`      const { mime, audioBase64 } = data;
`
`      if (!audioBase64) throw new Error('No audio data received from TTS');
`
`      await audioCtx.resume();
`      await playBase64(mime || 'audio/mpeg', audioBase64);
`    } catch (error) {
`      clearTimeout(timeoutId);
`      if (error.name === 'AbortError') {
`        metrics.errors.tts++;
`        throw new Error('Timeout: TTS tardó demasiado (>10s)');
`      }
`      metrics.errors.tts++;
`      log.error('ttsSpeak error:', error);
`      throw error;
`    }
`  }
`  async function handleQuery(text, isBargeIn = false){
`    // BARGE-IN FIX: Permitir interrupción
`    if (isProcessing && !isBargeIn) {
`      log.warn('Query already in progress, ignoring duplicate');
`      const config = getCurrentLanguageConfig();
`      state('⚠️ Ya procesando consulta anterior...');
`      return;
`    }
`
`    // BARGE-IN: Si es interrupción, cancelar request anterior
`    if (isBargeIn && currentProcessingId) {
`      log.info('BARGE-IN: Cancelando request anterior', currentProcessingId);
`      // El request anterior se descartará en la validación
`    }
`
`    const currentRequestId = ++requestId;
`    currentProcessingId = currentRequestId;
`    isProcessing = true;
`    sendBtn.disabled = true;
`    micBtn.disabled = true;
`
`    const config = getCurrentLanguageConfig();
`
`    try {
`      state(config.placeholders.thinking);
`
`      // Chat con métricas
`      const chatStart = Date.now();
`      const { text:answer } = await chatLLM(text);
`      trackMetric('chat', Date.now() - chatStart);
`
`      // BARGE-IN: Validar que no fue cancelado
`      if (currentRequestId !== requestId) {
`        log.info('Request cancelado por barge-in, descartando respuesta');
`        return;
`      }
`
`      if (!answer) throw new Error('Empty response from LLM');
`      pushMsg('assistant', answer);
`
`      state(config.placeholders.speaking);
`
`      // TTS con métricas
`      const ttsStart = Date.now();
`      await ttsSpeak(answer);
`      trackMetric('tts', Date.now() - ttsStart);
`
`      state(config.placeholders.ready);
`    }
`    catch(e){
`      log.error('handleQuery error:', e);
`
`      const userMsg = e.message.includes('Timeout')
`        ? '⏱️ La consulta tardó demasiado. Reinténtalo.'
`        : e.message.includes('Network')
`        ? '📡 Error de conexión. Verifica tu internet.'
`        : '❌ Disculpa, hubo un error. Reinténtalo.';
`
`      state('❌ Error: ' + (e.message || 'Unknown'));
`      pushMsg('assistant', userMsg);
`    }
`    finally {
`      // BARGE-IN: Solo liberar si es el request actual
`      if (currentRequestId === requestId) {
`        isProcessing = false;
`        currentProcessingId = null;
`      }
`      sendBtn.disabled = false;
`      micBtn.disabled = false;
`    }
`  }
`  sendBtn.onclick = () => {
`    const v = input.value.trim();
`    if (!v) return;
`
`    // ENTERPRISE: Protección contra múltiples clicks
`    if (isProcessing) {
`      state('⚠️ Espera a que termine la consulta anterior');
`      return;
`    }
`
`    pushMsg('user', v);
`    input.value='';
`    input.style.height = 'auto'; // Reset height
`    handleQuery(v);
`  };
`
`  // CHATGPT/CLAUDE STYLE: Clip menu toggle
`  clipBtn.onclick = (e) => {
`    e.stopPropagation();
`    clipMenu.classList.toggle('show');
`  };
`
`  // Cerrar menú al hacer click fuera
`  document.addEventListener('click', (e) => {
`    if (!clipMenu.contains(e.target) && e.target !== clipBtn) {
`      clipMenu.classList.remove('show');
`    }
`  });
`
`  // TEXTAREA AUTOEXPANDIBLE (ChatGPT/Claude style)
`  input.addEventListener('input', function() {
`    this.style.height = 'auto';
`    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
`  });
`
`  // Enter para enviar, Shift+Enter para nueva línea
`  input.addEventListener('keydown', function(e) {
`    if (e.key === 'Enter' && !e.shiftKey) {
`      e.preventDefault();
`      sendBtn.click();
`    }
`  });
`
`  // MULTIMODAL: File handlers
`  const captureBtn = $('#captureBtn');
`  const cameraBtn = $('#cameraBtn');
`  const videoBtn = $('#videoBtn');
`  const pdfBtn = $('#pdfBtn');
`  const fileBtn = $('#fileBtn');
`
`  const cameraInput = $('#cameraInput');
`  const videoInput = $('#videoInput');
`  const pdfInput = $('#pdfInput');
`  const fileInput = $('#fileInput');
`
`  // Camera capture elements
`  const cameraModal = $('#cameraModal');
`  const cameraPreview = $('#cameraPreview');
`  const cameraCanvas = $('#cameraCanvas');
`  const capturePhotoBtn = $('#capturePhotoBtn');
`  const closeCameraBtn = $('#closeCameraBtn');
`
`  let currentStream = null;
`
`  // NUEVA FUNCIONALIDAD: Captura directa de cámara
`  captureBtn.onclick = async () => {
`    clipMenu.classList.remove('show');
`
`    try {
`      state('📷 Solicitando acceso a cámara...');
`
`      // Solicitar acceso a cámara
`      currentStream = await navigator.mediaDevices.getUserMedia({
`        video: {
`          facingMode: 'user', // Cámara frontal
`          width: { ideal: 1280 },
`          height: { ideal: 720 }
`        }
`      });
`
`      // Mostrar preview
`      cameraPreview.srcObject = currentStream;
`      cameraModal.style.display = 'flex';
`      state('📸 Posiciona la cámara y captura');
`
`    } catch (err) {
`      log.error('Camera access error:', err);
`      state('⚠️ No se pudo acceder a la cámara');
`      pushMsg('assistant', '⚠️ No pude acceder a la cámara. Verifica los permisos del navegador.');
`    }
`  };
`
`  // Capturar foto
`  capturePhotoBtn.onclick = async () => {
`    try {
`      state('📸 Capturando imagen...');
`
`      // Obtener dimensiones del video
`      const videoWidth = cameraPreview.videoWidth;
`      const videoHeight = cameraPreview.videoHeight;
`
`      // Configurar canvas
`      cameraCanvas.width = videoWidth;
`      cameraCanvas.height = videoHeight;
`
`      // Capturar frame
`      const ctx = cameraCanvas.getContext('2d');
`      ctx.drawImage(cameraPreview, 0, 0, videoWidth, videoHeight);
`
`      // Convertir a base64
`      const imageBase64 = cameraCanvas.toDataURL('image/jpeg', 0.85).split(',')[1];
`
`      // Cerrar cámara
`      if (currentStream) {
`        currentStream.getTracks().forEach(track => track.stop());
`        currentStream = null;
`      }
`      cameraModal.style.display = 'none';
`
`      state('🤖 Sandra analizando imagen...');
`
`      // Enviar a vision API
`      const r = await fetch('/api/vision', {
`        method: 'POST',
`        headers: { 'Content-Type': 'application/json' },
`        body: JSON.stringify({
`          imageBase64: imageBase64,
`          mode: 'analyze',
`          prompt: '¿Qué ves en esta imagen? Describe en detalle lo que observas.'
`        })
`      });
`
`      if (!r.ok) {
`        const errorData = await r.json().catch(() => ({}));
`        throw new Error(errorData.error || 'Vision API failed');
`      }
`
`      const data = await r.json();
`      const analysis = data.data?.analysis || data.analysis || 'No pude analizar la imagen';
`
`      pushMsg('user', '📷 [Imagen capturada desde cámara]');
`      pushMsg('assistant', `Veo: ${analysis}`);
`
`      const config = getCurrentLanguageConfig();
`      state(config.placeholders.ready);
`
`    } catch (err) {
`      log.error('Image capture error:', err);
`      state('⚠️ Error al capturar imagen');
`      pushMsg('assistant', '⚠️ No pude capturar o analizar la imagen. Reinténtalo.');
`
`      // Cerrar cámara en caso de error
`      if (currentStream) {
`        currentStream.getTracks().forEach(track => track.stop());
`        currentStream = null;
`      }
`      cameraModal.style.display = 'none';
`    }
`  };
`
`  // Cerrar cámara sin capturar
`  closeCameraBtn.onclick = () => {
`    if (currentStream) {
`      currentStream.getTracks().forEach(track => track.stop());
`      currentStream = null;
`    }
`    cameraModal.style.display = 'none';
`    const config = getCurrentLanguageConfig();
`    state(config.placeholders.ready);
`  };
`
`  // Upload de imagen desde archivo
`  cameraBtn.onclick = () => {
`    clipMenu.classList.remove('show');
`    cameraInput.click();
`  };
`  videoBtn.onclick = () => {
`    clipMenu.classList.remove('show');
`    videoInput.click();
`  };
`  pdfBtn.onclick = () => {
`    clipMenu.classList.remove('show');
`    pdfInput.click();
`  };
`  fileBtn.onclick = () => {
`    clipMenu.classList.remove('show');
`    fileInput.click();
`  };
`
`  // MULTIMODAL: Camera/Image handler
`  cameraInput.onchange = async (e) => {
`    const files = Array.from(e.target.files);
`    if (files.length === 0) return;
`
`    state('📸 Procesando imágenes...');
`
`    for (const file of files) {
`      try {
`        const base64 = await fileToBase64(file);
`
`        // Enviar imagen al backend para análisis
`        const r = await fetch('/api/vision', {
`          method: 'POST',
`          headers: { 'Content-Type': 'application/json' },
`          body: JSON.stringify({
`            imageBase64: base64,
`            mode: 'analyze',
`            prompt: 'Describe esta imagen en detalle.'
`          })
`        });
`
`        if (!r.ok) throw new Error('Vision API failed');
`
`        const data = await r.json();
`        const analysis = data.data?.analysis || data.analysis || 'No pude analizar la imagen';
`
`        pushMsg('user', `🖼️ [Imagen adjunta: ${file.name}]`);
`        pushMsg('assistant', analysis);
`
`      } catch (err) {
`        log.error('Image processing error:', err);
`        pushMsg('assistant', '⚠️ No pude procesar la imagen. Reinténtalo.');
`      }
`    }
`
`    cameraInput.value = '';
`    const config = getCurrentLanguageConfig();
`    state(config.placeholders.ready);
`  };
`
`  // MULTIMODAL: Video handler
`  videoInput.onchange = async (e) => {
`    const file = e.target.files[0];
`    if (!file) return;
`
`    state('🎥 Procesando video...');
`
`    try {
`      // Extraer frame para análisis
`      const videoFrame = await extractVideoFrame(file);
`
`      const r = await fetch('/api/vision', {
`        method: 'POST',
`        headers: { 'Content-Type': 'application/json' },
`        body: JSON.stringify({
`          imageBase64: videoFrame,
`          mode: 'analyze',
`          prompt: 'Describe el contenido de este video.'
`        })
`      });
`
`      if (!r.ok) throw new Error('Video analysis failed');
`
`      const data = await r.json();
`      const analysis = data.data?.analysis || data.analysis || 'No pude analizar el video';
`
`      pushMsg('user', `🎥 [Video adjunto: ${file.name}]`);
`      pushMsg('assistant', `Análisis del video: ${analysis}`);
`
`    } catch (err) {
`      log.error('Video processing error:', err);
`      pushMsg('assistant', '⚠️ No pude procesar el video. Reinténtalo.');
`    }
`
`    videoInput.value = '';
`    const config = getCurrentLanguageConfig();
`    state(config.placeholders.ready);
`  };
`
`  // MULTIMODAL: PDF handler
`  pdfInput.onchange = async (e) => {
`    const files = Array.from(e.target.files);
`    if (files.length === 0) return;
`
`    state('📄 Procesando PDFs...');
`
`    for (const file of files) {
`      try {
`        const base64 = await fileToBase64(file);
`
`        const r = await fetch('/api/pdf-extract', {
`          method: 'POST',
`          headers: { 'Content-Type': 'application/json' },
`          body: JSON.stringify({
`            pdf: base64,
`            filename: file.name
`          })
`        });
`
`        if (!r.ok) throw new Error('PDF extraction failed');
`
`        const { text, summary } = await r.json();
`
`        pushMsg('user', `📄 [PDF adjunto: ${file.name}]`);
`        pushMsg('assistant', `Resumen del documento: ${summary || text.substring(0, 500)}...`);
`
`      } catch (err) {
`        log.error('PDF processing error:', err);
`        pushMsg('assistant', '⚠️ No pude procesar el PDF. Reinténtalo.');
`      }
`    }
`
`    pdfInput.value = '';
`    const config = getCurrentLanguageConfig();
`    state(config.placeholders.ready);
`  };
`
`  // MULTIMODAL: Generic file handler
`  fileInput.onchange = async (e) => {
`    const files = Array.from(e.target.files);
`    if (files.length === 0) return;
`
`    state('📎 Procesando archivos...');
`
`    for (const file of files) {
`      try {
`        const base64 = await fileToBase64(file);
`
`        const r = await fetch('/api/file-analyze', {
`          method: 'POST',
`          headers: { 'Content-Type': 'application/json' },
`          body: JSON.stringify({
`            file: base64,
`            filename: file.name,
`            mimeType: file.type
`          })
`        });
`
`        if (!r.ok) throw new Error('File analysis failed');
`
`        const { analysis } = await r.json();
`
`        pushMsg('user', `📎 [Archivo adjunto: ${file.name}]`);
`        pushMsg('assistant', analysis);
`
`      } catch (err) {
`        log.error('File processing error:', err);
`        pushMsg('assistant', `⚠️ No pude procesar ${file.name}. Reinténtalo.`);
`      }
`    }
`
`    fileInput.value = '';
`    const config = getCurrentLanguageConfig();
`    state(config.placeholders.ready);
`  };
`
`  // MULTIMODAL: Helper functions
`  function fileToBase64(file) {
`    return new Promise((resolve, reject) => {
`      const reader = new FileReader();
`      reader.onload = () => resolve(reader.result.split(',')[1]);
`      reader.onerror = reject;
`      reader.readAsDataURL(file);
`    });
`  }
`
`  async function extractVideoFrame(file) {
`    return new Promise((resolve, reject) => {
`      const video = document.createElement('video');
`      video.preload = 'metadata';
`      video.muted = true;
`
`      video.onloadeddata = () => {
`        video.currentTime = 1; // Extraer frame en segundo 1
`      };
`
`      video.onseeked = () => {
`        const canvas = document.createElement('canvas');
`        canvas.width = video.videoWidth;
`        canvas.height = video.videoHeight;
`
`        const ctx = canvas.getContext('2d');
`        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
`
`        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
`        URL.revokeObjectURL(video.src);
`        resolve(base64);
`      };
`
`      video.onerror = reject;
`      video.src = URL.createObjectURL(file);
`    });
`  }
`
`  function showSOS(){ sosEl.textContent = '🚨 SOS detectado (placeholder). Integra aquí tu rutina de emergencia/restauración.';
`    sosEl.style.display='block'; setTimeout(()=> sosEl.style.display='none', 5000); }
`
`  // Welcome message in current language
`  const welcomeMessages = {
`    es: 'Hola, soy Sandra. Escribe, habla o adjunta archivos para comenzar. Di "Hola Sandra" para activarme por voz.',
`    en: 'Hello, I\'m Sandra. Type, speak or attach files to get started. Say "Hey Sandra" to activate me by voice.',
`    fr: 'Bonjour, je suis Sandra. Tapez, parlez ou joignez des fichiers pour commencer. Dites "Salut Sandra" pour m\'activer par la voix.'
`  };
`
`  pushMsg('assistant', welcomeMessages[currentLanguage]);
`  const config = getCurrentLanguageConfig();
`  state(config.placeholders.ready);
`
`  // CLEANUP: Manage install prompt visibility
`  const installBox = document.querySelector('#installBox');
`  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
`  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
`                       window.navigator.standalone === true;
`
`  // Hide if: not iOS, OR already installed in standalone mode
`  if (!isIOS || isStandalone) {
`    if (installBox) installBox.style.display = 'none';
`  }
`
`  // ============================================
`  // NATIVE APP BEHAVIOR - DISABLE WEB GESTURES
`  // CEO Requirement: Fixed app like WhatsApp/Telegram
`  // ============================================
`
`  // Disable pinch-to-zoom gestures (iOS Safari)
`  document.addEventListener('gesturestart', function(e) {
`    e.preventDefault();
`    e.stopPropagation();
`  }, { passive: false });
`
`  document.addEventListener('gesturechange', function(e) {
`    e.preventDefault();
`    e.stopPropagation();
`  }, { passive: false });
`
`  document.addEventListener('gestureend', function(e) {
`    e.preventDefault();
`    e.stopPropagation();
`  }, { passive: false });
`
`  // Disable double-tap to zoom (300ms threshold)
`  let lastTouchEnd = 0;
`  document.addEventListener('touchend', function(event) {
`    const now = Date.now();
`    if (now - lastTouchEnd <= 300) {
`      event.preventDefault();
`    }
`    lastTouchEnd = now;
`  }, { passive: false });
`
`  // Prevent pull-to-refresh and multi-finger zoom
`  document.body.addEventListener('touchmove', function(e) {
`    // More than one finger = prevent (stops pinch zoom)
`    if (e.touches.length > 1) {
`      e.preventDefault();
`    }
`  }, { passive: false });
`
`  // Disable zoom with keyboard (Ctrl/Cmd + scroll)
`  document.addEventListener('wheel', function(e) {
`    if (e.ctrlKey || e.metaKey) {
`      e.preventDefault();
`    }
`  }, { passive: false });
`
`  // Disable zoom with keyboard (Ctrl/Cmd + +/-)
`  document.addEventListener('keydown', function(e) {
`    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
`      e.preventDefault();
`    }
`  }, { passive: false });
`
`  // ============================================
`  // INITIALIZE MULTI-LANGUAGE SYSTEM
`  // ============================================
`  initLanguageSelector();
`
`  log.info('✅ Native app behavior enabled - web gestures disabled');
`  log.info('📱 App behaves like WhatsApp/Telegram: fixed, serious, professional');
`  log.info('🎧 Wake word ready - click 👂 button to activate');
`  log.info('🌍 Multi-language system initialized: ES/EN/FR hot-swap ready');
`})();
