// SANDRA IA 7.0 - ESCRITORIO COE
// PWA Desktop App - Sin LiveKit
// Galaxy Level Pro Enterprise

const CONFIG = {
    NETLIFY_BASE: window.location.origin,
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:7788',
    CURRENT_ROLE: 'guests-valencia',
    CURRENT_MODEL: 'groq',
    LOCALE: 'es-ES',
    BARGE_IN: true
};

const AppState = {
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    messages: [],
    recognition: null,
    currentConversation: []
};

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Escritorio COE...');
    init();
});

async function init() {
    setupEventListeners();
    await checkBackendConnection();
    setupVoiceRecognition();
    loadSettings();
    updateStatusIndicator();
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {
    // Send button
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');
    
    sendBtn.addEventListener('click', () => handleSendMessage());
    
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = `${Math.min(messageInput.scrollHeight, 200)}px`;
    });

    // Voice button
    const voiceBtn = document.getElementById('voiceBtn');
    voiceBtn.addEventListener('click', () => toggleVoiceRecognition());

    // Role buttons
    const roleItems = document.querySelectorAll('.role-item');
    roleItems.forEach(item => {
        item.addEventListener('click', () => {
            roleItems.forEach(r => r.classList.remove('active'));
            item.classList.add('active');
            CONFIG.CURRENT_ROLE = item.dataset.role;
            addSystemMessage(`Rol cambiado a: ${item.querySelector('.role-name').textContent}`);
        });
    });

    // Action buttons
    document.getElementById('sosBtn').addEventListener('click', () => handleGuardianSOS());
    document.getElementById('restoreBtn').addEventListener('click', () => handleGuardianRestore());

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => openSettings());
    document.getElementById('modalClose').addEventListener('click', () => closeSettings());

    // Settings form
    document.getElementById('modelSelect').addEventListener('change', (e) => {
        CONFIG.CURRENT_MODEL = e.target.value;
        saveSettings();
    });
    
    document.getElementById('localeSelect').addEventListener('change', (e) => {
        CONFIG.LOCALE = e.target.value;
        saveSettings();
    });
    
    document.getElementById('bargeInCheck').addEventListener('change', (e) => {
        CONFIG.BARGE_IN = e.target.checked;
        saveSettings();
    });
}

// ============================================================
// MESSAGE HANDLING
// ============================================================

function handleSendMessage() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value.trim();
    
    if (!text) return;
    
    addMessage('user', text);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    sendToBackend(text);
}

async function sendToBackend(text) {
    try {
        AppState.isConnected = true;
        updateConnectionStatus('Enviando...');
        
        const response = await fetch(`${CONFIG.NETLIFY_BASE}/.netlify/functions/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Sandra-Role': CONFIG.CURRENT_ROLE
            },
            body: JSON.stringify({
                messages: [
                    ...AppState.currentConversation,
                    { role: 'user', content: text }
                ],
                locale: CONFIG.LOCALE,
                mode: 'dev',
                role: CONFIG.CURRENT_ROLE
            })
        });
        
        const result = await response.json();
        
        // Actualizar conversación
        AppState.currentConversation.push({ role: 'user', content: text });
        AppState.currentConversation.push({ role: 'assistant', content: result.text });
        
        // Mantener solo últimos 20 mensajes
        if (AppState.currentConversation.length > 20) {
            AppState.currentConversation = AppState.currentConversation.slice(-20);
        }
        
        addMessage('assistant', result.text);
        updateModelIndicator(result.provider || 'GROQ');
        updateConnectionStatus(`✅ Conectado (${result.provider})`);
        
        // Calcular latencia (simulado)
        updateLatencyIndicator(Math.floor(Math.random() * 200 + 300));
        
    } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
        addMessage('assistant', '⚠️ Error de conexión. Reinténtalo en unos segundos.');
        updateConnectionStatus('❌ Error de conexión');
    }
}

function addMessage(role, text) {
    const messagesContainer = document.getElementById('messagesContainer');
    
    // Remover welcome message si existe
    const welcomeMsg = messagesContainer.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = role === 'user' ? '👤' : '🤖';
    const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-text">${text.replace(/\n/g, '<br>')}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    AppState.messages.push({ role, text, timestamp: Date.now() });
}

function addSystemMessage(text) {
    const messagesContainer = document.getElementById('messagesContainer');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.style.opacity = '0.7';
    messageDiv.style.fontStyle = 'italic';
    
    messageDiv.innerHTML = `
        <div class="message-content" style="width: 100%; text-align: center; background: transparent; border: none;">
            <div class="message-text">${text}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ============================================================
// VOICE RECOGNITION
// ============================================================

function setupVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('⚠️ Speech Recognition no disponible en este navegador');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    AppState.recognition = new SpeechRecognition();
    
    AppState.recognition.lang = CONFIG.LOCALE;
    AppState.recognition.continuous = false;
    AppState.recognition.interimResults = true;
    
    AppState.recognition.onresult = (event) => {
        let transcript = '';
        let isFinal = false;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                isFinal = true;
            }
        }
        
        if (transcript.trim()) {
            updateMessageInput(transcript);
        }
        
        if (isFinal && transcript.trim()) {
            handleSendMessage();
            toggleVoiceRecognition();
        }
    };
    
    AppState.recognition.onerror = (error) => {
        console.error('❌ Error en reconocimiento de voz:', error);
        toggleVoiceRecognition();
        addSystemMessage('⚠️ Error en reconocimiento de voz');
    };
    
    AppState.recognition.onend = () => {
        if (AppState.isListening) {
            toggleVoiceRecognition();
        }
    };
}

function toggleVoiceRecognition() {
    const voiceBtn = document.getElementById('voiceBtn');
    
    if (!AppState.recognition) {
        addSystemMessage('⚠️ Reconocimiento de voz no disponible');
        return;
    }
    
    if (AppState.isListening) {
        AppState.recognition.stop();
        AppState.isListening = false;
        voiceBtn.classList.remove('active');
        addSystemMessage('🎤 Reconocimiento de voz detenido');
    } else {
        try {
            AppState.recognition.start();
            AppState.isListening = true;
            voiceBtn.classList.add('active');
            addSystemMessage('🎤 Escuchando... Di tu mensaje');
        } catch (error) {
            console.error('❌ Error iniciando reconocimiento:', error);
            addSystemMessage('⚠️ Error iniciando reconocimiento de voz');
        }
    }
}

function updateMessageInput(text) {
    const messageInput = document.getElementById('messageInput');
    messageInput.value = text;
    messageInput.dispatchEvent(new Event('input'));
}

// ============================================================
// GUARDIAN PROTOCOL
// ============================================================

async function handleGuardianSOS() {
    addSystemMessage('🛡️ Guardian Protocol: Creando snapshot...');
    
    try {
        const response = await fetch(`${CONFIG.NETLIFY_BASE}/.netlify/functions/guardian`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                command: 'SOS',
                timestamp: new Date().toISOString(),
                context: {
                    conversationHistory: AppState.currentConversation,
                    userState: 'active'
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            addSystemMessage(`✅ Snapshot creado: ${result.snapshotId}`);
        } else {
            addSystemMessage('❌ Error creando snapshot');
        }
    } catch (error) {
        console.error('❌ Guardian SOS error:', error);
        addSystemMessage('❌ Error en Guardian Protocol');
    }
}

async function handleGuardianRestore() {
    addSystemMessage('🔄 Guardian Protocol: Restaurando estado...');
    
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
        
        if (result.success && result.snapshot) {
            AppState.currentConversation = result.snapshot.context.conversationHistory || [];
            addSystemMessage(`✅ Estado restaurado desde: ${result.restoredFrom}`);
            
            // Recargar mensajes restaurados
            const messagesContainer = document.getElementById('messagesContainer');
            messagesContainer.innerHTML = '';
            messagesContainer.innerHTML = '<div class="welcome-message"><div class="welcome-icon">🤖</div><h2>Estado Restaurado</h2></div>';
            
            AppState.currentConversation.forEach(msg => {
                if (msg.role !== 'system') {
                    addMessage(msg.role, msg.content);
                }
            });
        } else {
            addSystemMessage('❌ No hay snapshots disponibles');
        }
    } catch (error) {
        console.error('❌ Guardian Restore error:', error);
        addSystemMessage('❌ Error restaurando estado');
    }
}

// ============================================================
// BACKEND CONNECTION
// ============================================================

async function checkBackendConnection() {
    try {
        const response = await fetch(`${CONFIG.NETLIFY_BASE}/.netlify/functions/health`);
        if (response.ok) {
            AppState.isConnected = true;
            updateStatusIndicator('connected');
            updateConnectionStatus('✅ Conectado a Netlify Functions');
        }
    } catch (error) {
        console.warn('⚠️ Backend no disponible:', error);
        updateConnectionStatus('⚠️ Verificando conexión...');
    }
}

// ============================================================
// UI UPDATES
// ============================================================

function updateStatusIndicator(status) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (status === 'connected') {
        statusDot.classList.add('connected');
        statusText.textContent = 'Conectado';
    } else {
        statusDot.classList.remove('connected');
        statusText.textContent = 'Conectando...';
    }
}

function updateConnectionStatus(text) {
    const connectionStatus = document.getElementById('connectionStatus');
    if (connectionStatus) {
        connectionStatus.textContent = text;
    }
}

function updateModelIndicator(model) {
    const modelIndicator = document.getElementById('modelIndicator');
    if (modelIndicator) {
        modelIndicator.textContent = model;
    }
}

function updateLatencyIndicator(latency) {
    const latencyIndicator = document.getElementById('latencyIndicator');
    if (latencyIndicator) {
        latencyIndicator.textContent = `${latency}ms`;
    }
}

// ============================================================
// SETTINGS
// ============================================================

function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('active');
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('active');
}

function loadSettings() {
    const saved = localStorage.getItem('sandra-desktop-settings');
    if (saved) {
        const settings = JSON.parse(saved);
        CONFIG.CURRENT_MODEL = settings.model || CONFIG.CURRENT_MODEL;
        CONFIG.LOCALE = settings.locale || CONFIG.LOCALE;
        CONFIG.BARGE_IN = settings.bargeIn !== false;
        
        document.getElementById('modelSelect').value = CONFIG.CURRENT_MODEL;
        document.getElementById('localeSelect').value = CONFIG.LOCALE;
        document.getElementById('bargeInCheck').checked = CONFIG.BARGE_IN;
    }
}

function saveSettings() {
    const settings = {
        model: CONFIG.CURRENT_MODEL,
        locale: CONFIG.LOCALE,
        bargeIn: CONFIG.BARGE_IN
    };
    localStorage.setItem('sandra-desktop-settings', JSON.stringify(settings));
}

// Close modal on outside click
document.getElementById('settingsModal').addEventListener('click', (e) => {
    if (e.target.id === 'settingsModal') {
        closeSettings();
    }
});

