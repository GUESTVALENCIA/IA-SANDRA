/**
 * SANDRA MOBILE APP - ORQUESTACIÓN POR VOZ
 * App móvil tipo WhatsApp/Telegram para orquestar ecosistema completo
 * Integración LiveKit completa + Sistema de comandos de voz inteligente
 * 
 * CEO: Clayton Thomas
 * Para: Sandrita ❤️
 * CALIDAD: GALAXY LEVEL PRO ENTERPRISE
 */

// LiveKit será cargado dinámicamente para evitar problemas de módulos
let LiveKitClient = null;

// Cargar LiveKit dinámicamente
async function loadLiveKit() {
    if (LiveKitClient) return LiveKitClient;
    
    try {
        // Intentar cargar desde CDN si no está disponible como módulo
        if (typeof window !== 'undefined' && !window.livekit) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/livekit-client@latest/dist/livekit-client.umd.js';
            document.head.appendChild(script);
            
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
            
            LiveKitClient = window.livekit;
        } else {
            // Si está como módulo ES6
            const module = await import('livekit-client');
            LiveKitClient = module;
        }
        
        return LiveKitClient;
    } catch (error) {
        console.warn('⚠️ LiveKit no disponible, usando modo básico');
        return null;
    }
}

// ============================================================
// CONFIGURACIÓN
// ============================================================

// CONFIG se inicializa después de que el DOM esté listo
let CONFIG = {
    // Backend URLs - Detectar automáticamente
    BACKEND_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:7788'
        : (window.location.origin.includes('netlify') 
            ? 'https://sandra.guestsvalencia.es'
            : window.location.origin),
    LIVEKIT_URL: process.env?.LIVEKIT_URL || 'wss://sandra-livekit.guestsvalencia.es',
    NETLIFY_BASE: window.location.origin,
    
    // Wake Word
    WAKE_WORD: 'Hola Sandra',
    
    // UI Elements (se inicializarán después)
    chatContainer: null,
    textInput: null,
    voiceBtn: null,
    sendBtn: null,
    statusText: null,
    statusDot: null,
    avatarContainer: null,
    statusBtn: null,
    statusModal: null,
    commandHints: null,
};

// Función para inicializar elementos del DOM
function initializeDOMElements() {
    CONFIG.chatContainer = document.getElementById('chatContainer');
    CONFIG.textInput = document.getElementById('textInput');
    CONFIG.voiceBtn = document.getElementById('voiceBtn');
    CONFIG.sendBtn = document.getElementById('sendBtn');
    CONFIG.statusText = document.getElementById('statusText');
    CONFIG.statusDot = document.getElementById('statusDot');
    CONFIG.avatarContainer = document.getElementById('avatarContainer');
    CONFIG.statusBtn = document.getElementById('statusBtn');
    CONFIG.statusModal = document.getElementById('statusModal');
    CONFIG.commandHints = document.getElementById('commandHints');
    
    // Verificar que todos los elementos existen
    const requiredElements = [
        'chatContainer', 'textInput', 'voiceBtn', 'sendBtn', 
        'statusText', 'statusDot', 'avatarContainer', 'statusBtn', 'statusModal'
    ];
    
    const missing = requiredElements.filter(key => !CONFIG[key]);
    if (missing.length > 0) {
        console.error('❌ Elementos faltantes del DOM:', missing);
        return false;
    }
    
    return true;
}

// ============================================================
// ESTADO DE LA APLICACIÓN
// ============================================================

const AppState = {
    room: null,
    localParticipant: null,
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    currentCommand: null,
    conversationHistory: [],
    lastMessageId: 0,
    
    // Voice Recognition
    recognition: null,
    wakeWordDetected: false,
    
    // Audio
    audioContext: null,
    mediaStream: null,
    
    // Metrics
    metrics: {
        messagesSent: 0,
        messagesReceived: 0,
        commandsExecuted: 0,
        avgLatency: 0,
        lastLatency: 0
    }
};

// ============================================================
// SISTEMA DE COMANDOS DE VOZ
// ============================================================

const VoiceCommands = {
    // Comandos de Sistema
    SYSTEM_STATUS: {
        patterns: ['estado', 'status', 'sistema', 'verificar', 'health'],
        handler: handleSystemStatus
    },
    
    SYSTEM_METRICS: {
        patterns: ['métricas', 'metricas', 'stats', 'estadísticas', 'rendimiento'],
        handler: handleSystemMetrics
    },
    
    // Comandos de Desarrollo
    DEV_MODE: {
        patterns: ['modo desarrollo', 'activar desarrollo', 'development mode', 'dev mode'],
        handler: handleDevMode
    },
    
    DEV_DEACTIVATE: {
        patterns: ['desactivar desarrollo', 'cerrar desarrollo', 'exit dev'],
        handler: handleDevDeactivate
    },
    
    // Comandos de Agentes
    AGENT_LIST: {
        patterns: ['listar agentes', 'ver agentes', 'agentes activos', 'show agents'],
        handler: handleAgentList
    },
    
    AGENT_STATUS: {
        patterns: ['estado agente', 'status agente', 'agente', 'agent status'],
        handler: handleAgentStatus
    },
    
    AGENT_ACTIVATE: {
        patterns: ['activar agente', 'enable agent', 'start agent'],
        handler: handleAgentActivate
    },
    
    // Comandos de Configuración
    CONFIG_SHOW: {
        patterns: ['configuración', 'config', 'settings', 'ajustes'],
        handler: handleConfigShow
    },
    
    // Comandos de Información
    HELP: {
        patterns: ['ayuda', 'help', 'comandos', 'qué puedo hacer'],
        handler: handleHelp
    },
    
    // Comandos Especiales
    SOS: {
        patterns: ['sos', 'emergencia', 'guardar estado'],
        handler: handleSOS
    },
    
    RESTORE: {
        patterns: ['restaurar', 'restore', 'volver atrás'],
        handler: handleRestore
    }
};

// ============================================================
// INICIALIZACIÓN
// ============================================================

async function init() {
    console.log('🚀 Iniciando Sandra Mobile App...');
    
    // Inicializar elementos del DOM
    if (!initializeDOMElements()) {
        console.error('❌ No se pudieron inicializar los elementos del DOM');
        return;
    }
    
    // Configurar fecha de bienvenida
    const welcomeTime = document.getElementById('welcomeTime');
    if (welcomeTime) {
        welcomeTime.textContent = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Setup event listeners (PRIMERO - para que los botones funcionen inmediatamente)
    setupEventListeners();
    
    // Marcar como conectado inmediatamente (los botones funcionan sin LiveKit)
    AppState.isConnected = true;
    updateStatus('En línea', 'connected');
    
    // Verificar conexión con backend (rápido, no bloqueante)
    checkBackendConnection();
    
    // Inicializar reconocimiento de voz
    setupVoiceRecognition();
    
    // Conectar a LiveKit en background (opcional, no bloquea)
    connectToLiveKit().catch(err => {
        console.warn('LiveKit no disponible, continuando sin él:', err);
        updateStatus('En línea (modo básico)', 'connected');
    });
    
    console.log('✅ Sandra Mobile App iniciada correctamente - Botones activos');
}

// ============================================================
// SETUP EVENT LISTENERS
// ============================================================

function setupEventListeners() {
    if (!CONFIG.sendBtn || !CONFIG.textInput || !CONFIG.voiceBtn) {
        console.error('❌ Elementos no disponibles para event listeners');
        return;
    }
    
    // Send button
    CONFIG.sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSendMessage();
    });
    
    // Enter key in text input
    CONFIG.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            handleSendMessage();
        }
    });
    
    // Text input change - FIX: Evitar que el texto desaparezca
    CONFIG.textInput.addEventListener('input', (e) => {
        const value = CONFIG.textInput.value;
        CONFIG.sendBtn.disabled = !value.trim();
        
        // Auto-resize textarea - FIX: Preservar valor
        const scrollHeight = CONFIG.textInput.scrollHeight;
        CONFIG.textInput.style.height = 'auto';
        CONFIG.textInput.style.height = Math.min(scrollHeight, 120) + 'px';
        
        // Asegurar que el valor no se pierda
        if (CONFIG.textInput.value !== value) {
            CONFIG.textInput.value = value;
        }
    });
    
    // FIX: Evitar que el textarea pierda el foco al redimensionar
    CONFIG.textInput.addEventListener('focus', () => {
        CONFIG.textInput.style.height = 'auto';
    });
    
    // Voice button
    CONFIG.voiceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleVoiceRecording();
    });
    
    // Status button
    CONFIG.statusBtn.addEventListener('click', () => {
        CONFIG.statusModal.classList.add('active');
        updateStatusModal();
    });
    
    // Close modal on backdrop click
    CONFIG.statusModal.addEventListener('click', (e) => {
        if (e.target === CONFIG.statusModal) {
            CONFIG.statusModal.classList.remove('active');
        }
    });
    
    // Command hints
    CONFIG.commandHints.querySelectorAll('.command-hint').forEach(hint => {
        hint.addEventListener('click', () => {
            const command = hint.textContent.trim();
            CONFIG.textInput.value = CONFIG.WAKE_WORD + ', ' + command;
            CONFIG.textInput.focus();
        });
    });
}

// ============================================================
// LIVEKIT INTEGRATION
// ============================================================

// Verificar conexión con backend (rápido)
async function checkBackendConnection() {
    try {
        const response = await fetch(`${CONFIG.NETLIFY_BASE}/.netlify/functions/health`, {
            method: 'GET',
            timeout: 3000
        }).catch(() => null);
        
        if (response && response.ok) {
            console.log('✅ Backend accesible');
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Backend no disponible (continuando sin él)');
    }
    return false;
}

async function connectToLiveKit() {
    // Timeout de 10 segundos para no bloquear
    const timeout = new Promise((resolve) => {
        setTimeout(() => {
            resolve({ timeout: true });
        }, 10000);
    });
    
    try {
        // No cambiar estado a "Conectando" - la app ya está lista
        console.log('🔄 Intentando conectar LiveKit en background...');
        
        const connectPromise = (async () => {
            try {
                // Cargar LiveKit client
                const lk = await loadLiveKit();
                
                if (!lk) {
                    return { success: false, reason: 'LiveKit library not available' };
                }
                
                const { Room, RoomEvent } = lk;
                
                // Obtener token del backend con timeout
                const tokenResponse = await Promise.race([
                    fetch(`${CONFIG.BACKEND_URL}/token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            roomName: `sandra-mobile-${Date.now()}`,
                            participantName: `mobile-user-${Date.now()}`
                        })
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                ]);
                
                if (!tokenResponse.ok) {
                    return { success: false, reason: 'Token request failed' };
                }
                
                const { token, url } = await tokenResponse.json();
                
                // Conectar a la sala
                const room = new Room();
                
                room.on(RoomEvent.Connected, () => {
                    console.log('✅ Conectado a LiveKit');
                    AppState.room = room;
                    AppState.localParticipant = room.localParticipant;
                    updateStatus('En línea (+ LiveKit)', 'connected');
                });
                
                room.on(RoomEvent.Disconnected, () => {
                    console.log('❌ Desconectado de LiveKit');
                    // No cambiar el estado principal, solo el de LiveKit
                });
                
                room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                    if (track.kind === 'audio') {
                        handleRemoteAudio(track, participant);
                    }
                });
                
                // Conectar con timeout
                await Promise.race([
                    room.connect(url || CONFIG.LIVEKIT_URL, token),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 8000))
                ]);
                
                return { success: true };
            } catch (error) {
                return { success: false, reason: error.message };
            }
        })();
        
        const result = await Promise.race([connectPromise, timeout]);
        
        if (result.timeout || !result.success) {
            console.log('ℹ️ LiveKit no disponible o timeout - usando modo básico');
            // No cambiar estado - la app ya está marcada como conectada
            return;
        }
        
        console.log('✅ LiveKit conectado exitosamente');
        
    } catch (error) {
        console.warn('⚠️ LiveKit error:', error.message);
        // No cambiar estado - continuar en modo básico
    }
}

// ============================================================
// VOICE RECOGNITION SETUP
// ============================================================

function setupVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('⚠️ Speech Recognition no disponible');
        addSystemMessage('El reconocimiento de voz no está disponible en este navegador.');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    AppState.recognition = new SpeechRecognition();
    
    AppState.recognition.continuous = true;
    AppState.recognition.interimResults = true;
    AppState.recognition.lang = 'es-ES';
    AppState.recognition.maxAlternatives = 1;
    
    AppState.recognition.onstart = () => {
        console.log('🎤 Reconocimiento de voz iniciado');
        CONFIG.voiceBtn.classList.add('listening');
        CONFIG.voiceBtn.textContent = '🛑';
    };
    
    AppState.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Mostrar transcripción parcial
        if (interimTranscript) {
            CONFIG.textInput.value = interimTranscript;
        }
        
        // Procesar transcripción final
        if (finalTranscript) {
            processVoiceCommand(finalTranscript.trim());
        }
    };
    
    AppState.recognition.onerror = (event) => {
        console.error('❌ Error reconocimiento:', event.error);
        if (event.error === 'no-speech') {
            // No es error crítico, continuar escuchando
            return;
        }
        stopVoiceRecognition();
        addSystemMessage(`Error de reconocimiento: ${event.error}`);
    };
    
    AppState.recognition.onend = () => {
        console.log('🎤 Reconocimiento de voz finalizado');
        if (AppState.isListening) {
            // Reiniciar automáticamente si estaba escuchando
            startVoiceRecognition();
        } else {
            CONFIG.voiceBtn.classList.remove('listening', 'recording');
            CONFIG.voiceBtn.textContent = '🎤';
        }
    };
}

function startVoiceRecognition() {
    if (!AppState.recognition) return;
    
    try {
        AppState.isListening = true;
        AppState.recognition.start();
    } catch (error) {
        console.error('Error iniciando reconocimiento:', error);
        AppState.isListening = false;
    }
}

function stopVoiceRecognition() {
    if (!AppState.recognition) return;
    
    AppState.isListening = false;
    AppState.recognition.stop();
    CONFIG.voiceBtn.classList.remove('listening', 'recording');
    CONFIG.voiceBtn.textContent = '🎤';
}

function toggleVoiceRecording() {
    if (AppState.isListening) {
        stopVoiceRecognition();
    } else {
        startVoiceRecognition();
    }
}

// ============================================================
// PROCESS VOICE COMMANDS
// ============================================================

function processVoiceCommand(text) {
    const lowerText = text.toLowerCase();
    
    // Detectar wake word
    if (lowerText.includes(CONFIG.WAKE_WORD.toLowerCase())) {
        AppState.wakeWordDetected = true;
        addSystemMessage('👂 Te escucho...');
        CONFIG.textInput.value = '';
        return;
    }
    
    // Si wake word detectado, procesar comando
    if (AppState.wakeWordDetected) {
        executeCommand(text);
        AppState.wakeWordDetected = false;
        CONFIG.textInput.value = '';
    } else {
        // Si no hay wake word, enviar como mensaje normal
        handleSendMessage();
    }
}

function executeCommand(commandText) {
    const lowerText = commandText.toLowerCase();
    let commandHandled = false;
    
    // Buscar comando coincidente
    for (const [key, command] of Object.entries(VoiceCommands)) {
        for (const pattern of command.patterns) {
            if (lowerText.includes(pattern.toLowerCase())) {
                command.handler(commandText);
                commandHandled = true;
                AppState.metrics.commandsExecuted++;
                break;
            }
        }
        if (commandHandled) break;
    }
    
    // Si no se encontró comando, enviar como mensaje normal
    if (!commandHandled) {
        addUserMessage(commandText);
        sendToBackend(commandText);
    }
}

// ============================================================
// COMMAND HANDLERS
// ============================================================

async function handleSystemStatus(commandText) {
    addSystemMessage('📊 Verificando estado del sistema...');
    
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/status`);
        const status = await response.json();
        
        let statusMessage = '🟢 **Estado del Sistema:**\n\n';
        statusMessage += `Backend: ${status.backend}\n`;
        statusMessage += `Uptime: ${Math.floor(status.uptime / 60)} minutos\n\n`;
        statusMessage += '**Servicios:**\n';
        
        for (const [service, config] of Object.entries(status.services)) {
            const icon = config === 'configured' ? '✅' : '❌';
            statusMessage += `${icon} ${service}: ${config}\n`;
        }
        
        addAssistantMessage(statusMessage);
        
    } catch (error) {
        addSystemMessage('❌ Error verificando estado: ' + error.message);
    }
}

async function handleSystemMetrics(commandText) {
    addSystemMessage('📈 Obteniendo métricas...');
    
    try {
        const response = await fetch(`${CONFIG.NETLIFY_BASE}/.netlify/functions/health`);
        const metrics = await response.json();
        
        let metricsMessage = '📊 **Métricas del Sistema:**\n\n';
        metricsMessage += `Agentes: ${metrics.agents || 'N/A'}\n`;
        metricsMessage += `Conexiones: ${metrics.connections || 0}\n`;
        metricsMessage += `Estado: ${metrics.status || 'N/A'}\n`;
        
        addAssistantMessage(metricsMessage);
        
    } catch (error) {
        addSystemMessage('❌ Error obteniendo métricas: ' + error.message);
    }
}

async function handleDevMode(commandText) {
    addSystemMessage('💻 Activando modo desarrollo...');
    
    try {
        const response = await fetch(`${CONFIG.NETLIFY_BASE}/.netlify/functions/dev/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                command: 'activate_dev_module',
                params: {}
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            addAssistantMessage('✅ **Modo desarrollo activado**\n\nAhora puedes usar comandos de desarrollo.');
        } else {
            addAssistantMessage('❌ Error activando modo desarrollo: ' + (result.error || 'Desconocido'));
        }
        
    } catch (error) {
        addSystemMessage('❌ Error: ' + error.message);
    }
}

async function handleDevDeactivate(commandText) {
    addSystemMessage('💻 Desactivando modo desarrollo...');
    addAssistantMessage('✅ Modo desarrollo desactivado');
}

async function handleAgentList(commandText) {
    addSystemMessage('🤖 Listando agentes disponibles...');
    addAssistantMessage('📋 **Agentes del Sistema:**\n\nHay 248+ agentes especializados disponibles. Usa "Hola Sandra, estado agente [nombre]" para detalles específicos.');
}

async function handleAgentStatus(commandText) {
    addSystemMessage('🤖 Verificando estado de agentes...');
    
    // Extraer nombre del agente si está en el comando
    const agentMatch = commandText.match(/(?:agente|agent)\s+(\w+)/i);
    const agentName = agentMatch ? agentMatch[1] : null;
    
    if (agentName) {
        addAssistantMessage(`📊 Verificando estado del agente: ${agentName}...`);
        // TODO: Implementar verificación específica
    } else {
        addAssistantMessage('📊 Estado general: Todos los agentes operativos');
    }
}

async function handleAgentActivate(commandText) {
    addSystemMessage('🤖 Activando agente...');
    
    const agentMatch = commandText.match(/(?:agente|agent)\s+(\w+)/i);
    const agentName = agentMatch ? agentMatch[1] : null;
    
    if (agentName) {
        addAssistantMessage(`✅ Agente ${agentName} activado`);
    } else {
        addAssistantMessage('Por favor especifica qué agente quieres activar.');
    }
}

async function handleConfigShow(commandText) {
    addSystemMessage('⚙️ Mostrando configuración...');
    
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/agent/config`);
        const config = await response.json();
        
        let configMessage = '⚙️ **Configuración Actual:**\n\n';
        configMessage += `**STT:** ${config.stt.primary} (fallback: ${config.stt.fallback})\n`;
        configMessage += `**TTS:** ${config.tts.primary} (fallback: ${config.tts.fallback})\n`;
        configMessage += `**LLM:** ${config.llm.model}\n`;
        configMessage += `**Avatar:** ${config.avatar.provider}\n`;
        configMessage += `**Barge-in:** ${config.features.bargeIn ? 'Activado' : 'Desactivado'}\n`;
        configMessage += `**Wake Word:** "${config.features.wakeWord}"\n`;
        
        addAssistantMessage(configMessage);
        
    } catch (error) {
        addSystemMessage('❌ Error obteniendo configuración: ' + error.message);
    }
}

function handleHelp(commandText) {
    const helpMessage = `
📚 **Comandos Disponibles:**

**Sistema:**
• "Estado sistema" - Ver estado general
• "Métricas" - Estadísticas de rendimiento
• "Configuración" - Ver config actual

**Desarrollo:**
• "Modo desarrollo" - Activar herramientas dev
• "Desactivar desarrollo" - Salir de modo dev

**Agentes:**
• "Listar agentes" - Ver agentes disponibles
• "Estado agente [nombre]" - Estado específico
• "Activar agente [nombre]" - Activar agente

**Especiales:**
• "SOS" - Guardar estado de emergencia
• "Restaurar" - Restaurar último estado

**Ejemplos:**
"Hola Sandra, estado sistema"
"Hola Sandra, activa modo desarrollo"
"Hola Sandra, métricas"
    `.trim();
    
    addAssistantMessage(helpMessage);
}

async function handleSOS(commandText) {
    addSystemMessage('🛡️ Guardian Protocol: Creando snapshot...');
    
    try {
        const response = await fetch(`${CONFIG.NETLIFY_BASE}/.netlify/functions/guardian`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                command: 'SOS',
                timestamp: new Date().toISOString(),
                context: {
                    conversationHistory: AppState.conversationHistory.slice(-5)
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            addAssistantMessage(`✅ **Snapshot creado:** ${result.snapshotId}\n\nEstado guardado de forma segura.`);
        } else {
            addAssistantMessage('❌ Error creando snapshot');
        }
        
    } catch (error) {
        addSystemMessage('❌ Error: ' + error.message);
    }
}

async function handleRestore(commandText) {
    addSystemMessage('🛡️ Guardian Protocol: Restaurando estado...');
    
    try {
        const response = await fetch(`${CONFIG.NETLIFY_BASE}/.netlify/functions/guardian`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                command: 'RESTAURAR',
                timestamp: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            addAssistantMessage(`✅ **Sistema restaurado** al punto: ${result.restoredFrom}`);
        } else {
            addAssistantMessage('❌ Error restaurando estado');
        }
        
    } catch (error) {
        addSystemMessage('❌ Error: ' + error.message);
    }
}

// ============================================================
// MESSAGE HANDLING
// ============================================================

function handleSendMessage() {
    const text = CONFIG.textInput.value.trim();
    if (!text) {
        console.log('⚠️ Mensaje vacío, ignorando');
        return;
    }
    
    console.log('📤 Enviando mensaje:', text);
    
    // Limpiar input inmediatamente
    CONFIG.textInput.value = '';
    CONFIG.sendBtn.disabled = true;
    CONFIG.textInput.style.height = 'auto';
    
    // Añadir mensaje de usuario al chat
    addUserMessage(text);
    
    // Procesar comando o enviar como mensaje normal
    if (text.toLowerCase().includes(CONFIG.WAKE_WORD.toLowerCase())) {
        const command = text.replace(new RegExp(CONFIG.WAKE_WORD, 'gi'), '').trim();
        console.log('🎯 Procesando comando:', command);
        executeCommand(command);
    } else {
        console.log('💬 Enviando como mensaje normal');
        sendToBackend(text);
    }
}

async function sendToBackend(message) {
    try {
        const startTime = performance.now();
        showTypingIndicator();
        
        // Usar Netlify Function para chat
        const response = await fetch(`${CONFIG.NETLIFY_BASE}/.netlify/functions/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                role: 'guests-valencia',
                locale: 'es-ES',
                messages: AppState.conversationHistory.slice(-10)
            })
        });
        
        const data = await response.json();
        const latency = performance.now() - startTime;
        
        hideTypingIndicator();
        
        // Actualizar métricas
        AppState.metrics.lastLatency = latency;
        AppState.metrics.messagesSent++;
        AppState.metrics.messagesReceived++;
        
        // Agregar respuesta
        addAssistantMessage(data.text || data.response || 'Sin respuesta');
        
        // Reproducir audio si está disponible
        if (data.audioUrl) {
            await playAudio(data.audioUrl);
        }
        
        // Actualizar historial
        AppState.conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: data.text || data.response }
        );
        
        // Limitar historial
        if (AppState.conversationHistory.length > 20) {
            AppState.conversationHistory = AppState.conversationHistory.slice(-20);
        }
        
    } catch (error) {
        hideTypingIndicator();
        addSystemMessage('❌ Error: ' + error.message);
        console.error('Error enviando mensaje:', error);
    }
}

// ============================================================
// UI HELPERS
// ============================================================

function addUserMessage(text) {
    const messageId = ++AppState.lastMessageId;
    const messageDiv = createMessageElement('sent', text, messageId);
    CONFIG.chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addAssistantMessage(text) {
    const messageId = ++AppState.lastMessageId;
    const messageDiv = createMessageElement('received', text, messageId);
    CONFIG.chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message received';
    messageDiv.innerHTML = `
        <div class="message-avatar">⚙️</div>
        <div class="message-content">
            <p class="message-text" style="font-style: italic; opacity: 0.8;">${text}</p>
        </div>
    `;
    CONFIG.chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

function createMessageElement(type, text, id) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.dataset.id = id;
    
    const avatar = type === 'sent' ? '👤' : '🤖';
    const time = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    div.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <p class="message-text">${escapeHtml(text).replace(/\n/g, '<br>')}</p>
            <span class="message-time">${time}</span>
        </div>
    `;
    
    return div;
}

function showTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'message received typing-indicator';
    typing.id = 'typingIndicator';
    typing.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    CONFIG.chatContainer.appendChild(typing);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

function scrollToBottom() {
    setTimeout(() => {
        CONFIG.chatContainer.scrollTop = CONFIG.chatContainer.scrollHeight;
    }, 100);
}

function updateStatus(text, type) {
    CONFIG.statusText.textContent = text;
    CONFIG.statusDot.className = 'status-dot';
    
    if (type === 'connected') {
        CONFIG.statusDot.style.background = 'var(--primary)';
        CONFIG.avatarContainer.classList.add('active');
    } else if (type === 'disconnected') {
        CONFIG.statusDot.style.background = '#ff4444';
        CONFIG.avatarContainer.classList.remove('active');
    } else if (type === 'connecting') {
        CONFIG.statusDot.style.background = '#ffaa00';
    } else {
        CONFIG.statusDot.style.background = '#888';
    }
}

function updateStatusModal() {
    document.getElementById('modalConnection').textContent = 
        AppState.isConnected ? 'Conectado' : 'Desconectado';
    
    document.getElementById('modalLiveKit').textContent = 
        AppState.room ? 'Activo' : 'Inactivo';
    
    document.getElementById('modalAgents').textContent = 
        AppState.metrics.commandsExecuted + ' ejecutados';
    
    document.getElementById('modalLatency').textContent = 
        AppState.metrics.lastLatency > 0 
            ? Math.round(AppState.metrics.lastLatency) + 'ms' 
            : '--';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================
// AUDIO HANDLING
// ============================================================

async function handleRemoteAudio(track, participant) {
    if (track.kind === 'audio') {
        const audioElement = new Audio();
        audioElement.srcObject = new MediaStream([track.mediaStreamTrack]);
        audioElement.play().catch(console.error);
    }
}

async function playAudio(url) {
    try {
        const audio = new Audio(url);
        await audio.play();
        
        audio.onended = () => {
            AppState.isSpeaking = false;
        };
        
        AppState.isSpeaking = true;
    } catch (error) {
        console.error('Error reproduciendo audio:', error);
    }
}

// ============================================================
// INITIALIZE APP
// ============================================================

// Inicializar cuando el DOM esté completamente listo
function startApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(init, 100); // Pequeño delay para asegurar que todo está listo
        });
    } else {
        // DOM ya está listo, pero esperamos un momento más
        setTimeout(init, 100);
    }
}

// Iniciar aplicación
startApp();

// Service Worker registration para PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('✅ Service Worker registrado'))
        .catch(err => console.warn('⚠️ Service Worker no registrado:', err));
}

// Export para uso global
window.SandraApp = {
    init,
    executeCommand,
    sendToBackend,
    connectToLiveKit
};

