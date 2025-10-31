// Sandra DevConsole - Main Application
class SandraApp {
    constructor() {
        this.isInitialized = false;
        this.conversationId = null;
        this.settings = {
            responseMode: 'text',
            voiceSpeed: 1.0,
            theme: 'dark',
            autoScroll: true,
            soundEnabled: true
        };

        // Initialize components
        this.api = new SandraAPI();
        this.chat = new SandraChat();
        this.multimodal = new SandraMultimodal();
        this.metrics = new SandraMetrics();
        this.settingsManager = new SandraSettings();

        console.log('Sandra DevConsole App initialized');
    }

    async init() {
        try {
            this.showLoadingOverlay('Iniciando Sandra DevConsole...');

            // Initialize components
            await this.initializeComponents();

            // Setup event listeners
            this.setupEventListeners();

            // Load user settings
            this.loadSettings();

            // Connect to orchestrator
            await this.connectToOrchestrator();

            // Setup UI
            this.initializeUI();

            this.isInitialized = true;
            this.hideLoadingOverlay();

            // Welcome message
            this.showWelcomeMessage();

            console.log('Sandra DevConsole ready!');

        } catch (error) {
            console.error('Failed to initialize Sandra DevConsole:', error);
            this.showError('Error de inicialización', error.message);
            this.hideLoadingOverlay();
        }
    }

    async initializeComponents() {
        try {
            await this.api.init();
            await this.chat.init();
            await this.multimodal.init();
            await this.metrics.init();
            await this.settingsManager.init();
        } catch (error) {
            throw new Error(`Component initialization failed: ${error.message}`);
        }
    }

    async connectToOrchestrator() {
        this.updateLoadingStatus('Conectando con Sandra...');

        // Retry logic with timeout
        const maxRetries = 3;
        const timeout = 10000; // 10 seconds

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await Promise.race([
                    this.api.getServiceStatus(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Connection timeout')), timeout)
                    )
                ]);

                this.updateServiceStatus(response);
                this.updateConnectionStatus('online');
                return; // Success

            } catch (error) {
                console.warn(`Orchestrator connection attempt ${attempt}/${maxRetries} failed:`, error);
                
                if (attempt === maxRetries) {
                    this.updateConnectionStatus('offline');
                    this.showError('Error de Conexión', 'No se pudo conectar con Sandra. Revisa que el orquestador esté funcionando.');
                    throw new Error('No se pudo conectar con Sandra después de varios intentos');
                }

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            }
        }
    }

    setupEventListeners() {
        // Window events
        window.addEventListener('beforeunload', () => this.cleanup());
        window.addEventListener('resize', () => this.handleResize());

        // IPC events (Electron)
        if (window.require) {
            try {
                const { ipcRenderer } = window.require('electron');

                ipcRenderer.on('orchestrator-ready', (event, data) => {
                    console.log('Orchestrator ready:', data);
                    this.updateServiceStatus(data.services);
                    this.updateConnectionStatus('online');
                });

                ipcRenderer.on('orchestrator-error', (event, data) => {
                    console.error('Orchestrator error:', data);
                    this.showError('Error del Orquestador', data.error);
                    this.updateConnectionStatus('offline');
                });
            } catch (error) {
                console.warn('IPC not available:', error);
            }
        }

        // Helper function to safely add event listeners
        const safeAddListener = (elementId, event, handler) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener(event, handler);
            } else {
                console.warn(`Element ${elementId} not found for event listener`);
            }
        };

        // Header controls
        safeAddListener('settingsBtn', 'click', () => {
            this.toggleSidebar();
            this.showSettingsPanel();
        });

        safeAddListener('metricsBtn', 'click', () => {
            this.toggleSidebar();
            this.showMetricsPanel();
        });

        // Sidebar controls
        safeAddListener('closeSidebar', 'click', () => {
            this.closeSidebar();
        });

        // Settings controls
        safeAddListener('resetServices', 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[APP] Reset services button clicked');
            this.resetAllServices();
        });

        // Chat controls
        safeAddListener('clearChat', 'click', () => {
            this.clearChat();
        });

        // Mode toggles
        safeAddListener('voiceToggle', 'click', () => {
            this.toggleVoiceMode();
        });

        safeAddListener('avatarToggle', 'click', () => {
            this.toggleAvatarMode();
        });

        // Message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            messageInput.addEventListener('input', () => {
                this.handleInputChange();
            });
        }

        // Send button
        safeAddListener('sendBtn', 'click', () => {
            this.sendMessage();
        });

        // Voice input
        safeAddListener('voiceInputBtn', 'click', () => {
            this.toggleVoiceInput();
        });

        // Attach button
        safeAddListener('attachBtn', 'click', () => {
            this.handleAttach();
        });

        // Settings changes
        safeAddListener('responseMode', 'change', (e) => {
            this.updateResponseMode(e.target.value);
        });

        safeAddListener('voiceSpeed', 'input', (e) => {
            this.updateVoiceSpeed(e.target.value);
        });

        safeAddListener('themeSelect', 'change', (e) => {
            this.updateTheme(e.target.value);
        });

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Click outside to close modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    initializeUI() {
        // Set initial states
        this.updateModeIndicators();
        this.updateSettingsUI();
        this.focusMessageInput();

        // Start metrics collection
        this.metrics.startCollection();

        // Auto-resize textarea
        this.setupAutoResize();
    }

    showWelcomeMessage() {
        // Welcome message is already in HTML, just animate it
        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.style.animation = 'slideIn 0.5s ease';
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message || !this.isInitialized) {
            return;
        }

        try {
            // Clear input and show processing
            messageInput.value = '';
            this.showProcessingIndicator();
            this.updateSendButton(false);

            // Add user message to chat
            this.chat.addUserMessage(message);

            // Determine options based on current mode
            const options = {
                includeVoice: this.isVoiceModeActive(),
                includeAvatar: this.isAvatarModeActive(),
                conversationId: this.conversationId
            };

            // Usar API Client Wrapper (Golden Path) - PRIORIDAD
            let response;
            if (window.sandraAPIClient) {
                // Usar el API client wrapper que detecta automáticamente Netlify Functions
                response = await window.sandraAPIClient.chat(message, options);
            } else if (window.sandraAPI) {
                // Fallback al API client legacy
                response = await window.sandraAPI.sendMessage(message, options);
            } else {
                throw new Error('API client not initialized');
            }

            if (response.success) {
                // Add Sandra's response
                await this.chat.addSandraMessage(response);

                // Update conversation ID
                this.conversationId = response.conversationId;

                // Handle multimodal responses
                if (response.audio) {
                    await this.multimodal.playAudio(response.audio);
                }

                // Mostrar avatar de HeyGen si está disponible y el toggle está activo
                if (response.avatar && this.isAvatarModeActive()) {
                    console.log('[APP] Displaying HeyGen avatar:', response.avatar);
                    await this.multimodal.showAvatar(response.avatar);
                } else if (response.avatar && response.avatar.success) {
                    // Si el avatar está en la respuesta pero el toggle no está activo, mostrarlo de todas formas
                    console.log('[APP] Avatar in response, displaying...');
                    await this.multimodal.showAvatar(response.avatar);
                }

            } else {
                // Show fallback response
                this.chat.addSandraMessage({
                    text: response.fallbackResponse || 'Lo siento, no pude procesar tu mensaje.',
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error('Send message error:', error);
            this.chat.addErrorMessage('Error enviando mensaje: ' + error.message);
            this.showError('Error de Comunicación', error.message);

        } finally {
            this.hideProcessingIndicator();
            this.updateSendButton(true);
            this.focusMessageInput();
        }
    }

    toggleVoiceMode() {
        const btn = document.getElementById('voiceToggle');
        const indicator = document.getElementById('voiceIndicator');

        btn.classList.toggle('active');
        indicator.classList.toggle('active');

        this.settings.voiceEnabled = btn.classList.contains('active');
        this.saveSettings();
        this.updateModeIndicators();
    }

    toggleAvatarMode() {
        const btn = document.getElementById('avatarToggle');
        const indicator = document.getElementById('avatarIndicator');

        btn.classList.toggle('active');
        indicator.classList.toggle('active');

        this.settings.avatarEnabled = btn.classList.contains('active');
        this.saveSettings();
        this.updateModeIndicators();
    }

    toggleVoiceInput() {
        if (!this.multimodal) {
            console.error('Multimodal not initialized');
            return;
        }

        if (this.multimodal.isRecording) {
            this.multimodal.stopVoiceRecognition();
        } else {
            // Request microphone permissions first
            this.requestMicrophonePermission().then((granted) => {
                if (granted) {
                    this.multimodal.startVoiceRecognition();
                } else {
                    this.showError('Permisos de Micrófono', 'Se necesitan permisos de micrófono para usar esta función');
                }
            }).catch((error) => {
                console.error('Microphone permission error:', error);
                this.showError('Error de Permisos', 'No se pudieron solicitar permisos de micrófono');
            });
        }
    }

    async requestMicrophonePermission() {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop()); // Stop immediately, just check permission
                return true;
            } else {
                console.warn('getUserMedia not supported');
                return false;
            }
        } catch (error) {
            console.error('Microphone permission denied:', error);
            return false;
        }
    }

    handleAttach() {
        // Create file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileAttachment(file);
            }
        };
        input.click();
    }

    handleFileAttachment(file) {
        console.log('File attached:', file.name);
        // TODO: Implement file attachment handling
        this.showTemporaryNotification(`Archivo seleccionado: ${file.name}`, 'info');
    }

    isVoiceModeActive() {
        const btn = document.getElementById('voiceToggle');
        return btn ? btn.classList.contains('active') : false;
    }

    isAvatarModeActive() {
        const btn = document.getElementById('avatarToggle');
        return btn ? btn.classList.contains('active') : false;
    }

    updateModeIndicators() {
        const modes = document.querySelectorAll('.mode-indicator');
        modes.forEach(mode => mode.classList.remove('active'));

        if (this.isAvatarModeActive()) {
            document.querySelector('[data-mode="avatar"]').classList.add('active');
        } else if (this.isVoiceModeActive()) {
            document.querySelector('[data-mode="voice"]').classList.add('active');
        } else {
            document.querySelector('[data-mode="text"]').classList.add('active');
        }
    }

    showProcessingIndicator() {
        const indicator = document.getElementById('processingIndicator');
        indicator.classList.add('active');

        const messages = [
            'Sandra está pensando...',
            'Procesando tu consulta...',
            'Buscando la mejor respuesta...',
            'Analizando tu mensaje...'
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        document.getElementById('processingText').textContent = randomMessage;
    }

    hideProcessingIndicator() {
        document.getElementById('processingIndicator').classList.remove('active');
    }

    updateSendButton(enabled) {
        const btn = document.getElementById('sendBtn');
        btn.disabled = !enabled;
    }

    focusMessageInput() {
        setTimeout(() => {
            document.getElementById('messageInput').focus();
        }, 100);
    }

    handleInputChange() {
        const input = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');

        sendBtn.disabled = !input.value.trim();

        // Auto-resize
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }

    setupAutoResize() {
        const input = document.getElementById('messageInput');
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }

    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
    }

    showSettingsPanel() {
        document.getElementById('settingsPanel').style.display = 'block';
        document.getElementById('metricsPanel').style.display = 'none';
        document.getElementById('historyPanel').style.display = 'block';
    }

    showMetricsPanel() {
        document.getElementById('metricsPanel').style.display = 'block';
        document.getElementById('settingsPanel').style.display = 'none';
        document.getElementById('historyPanel').style.display = 'block';

        // Refresh metrics
        this.metrics.refreshMetrics();
    }

    clearChat() {
        if (confirm('¿Estás seguro de que quieres limpiar el chat?')) {
            this.chat.clearMessages();
            this.conversationId = null;
            this.showWelcomeMessage();
        }
    }

    async resetAllServices() {
        const resetBtn = document.getElementById('resetServices');
        if (resetBtn) {
            resetBtn.disabled = true;
            resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reiniciando...';
        }

        try {
            this.showLoadingOverlay('Reiniciando servicios...');
            console.log('[APP] Calling resetServices API...');

            const response = await this.api.resetServices();
            console.log('[APP] Reset services response:', response);
            
            this.updateServiceStatus(response);

            this.hideLoadingOverlay();
            this.showSuccessMessage('Servicios reiniciados correctamente');

        } catch (error) {
            console.error('[APP] Reset services error:', error);
            this.hideLoadingOverlay();
            this.showError('Error al reiniciar servicios', error.message || 'Error desconocido');
        } finally {
            if (resetBtn) {
                resetBtn.disabled = false;
                resetBtn.innerHTML = '<i class="fas fa-sync"></i> Reiniciar Servicios';
            }
        }
    }

    updateServiceStatus(services) {
        const indicators = document.querySelectorAll('.service-status');

        indicators.forEach(indicator => {
            const serviceName = indicator.getAttribute('data-service');
            const statusDot = indicator.querySelector('.status-dot');

            if (services[serviceName]) {
                const service = services[serviceName];
                statusDot.className = 'status-dot';

                if (service.healthy) {
                    statusDot.classList.add('online');
                } else if (service.available) {
                    statusDot.classList.add('warning');
                } else {
                    statusDot.classList.add('offline');
                }
            } else {
                statusDot.className = 'status-dot offline';
            }
        });
    }

    updateConnectionStatus(status) {
        const statusIndicator = document.getElementById('connectionStatus');
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('span');

        statusDot.className = 'status-dot';

        switch (status) {
            case 'online':
                statusDot.classList.add('online');
                statusText.textContent = 'Conectado';
                break;
            case 'offline':
                statusDot.classList.add('offline');
                statusText.textContent = 'Desconectado';
                break;
            case 'warning':
                statusDot.classList.add('warning');
                statusText.textContent = 'Conexión limitada';
                break;
            default:
                statusDot.classList.add('offline');
                statusText.textContent = 'Conectando...';
        }
    }

    updateResponseMode(mode) {
        this.settings.responseMode = mode;
        this.saveSettings();

        // Update UI based on mode
        switch (mode) {
            case 'text':
                document.getElementById('voiceToggle').classList.remove('active');
                document.getElementById('avatarToggle').classList.remove('active');
                break;
            case 'text-voice':
                document.getElementById('voiceToggle').classList.add('active');
                document.getElementById('avatarToggle').classList.remove('active');
                break;
            case 'multimodal':
                document.getElementById('voiceToggle').classList.add('active');
                document.getElementById('avatarToggle').classList.add('active');
                break;
        }

        this.updateModeIndicators();
    }

    updateVoiceSpeed(speed) {
        this.settings.voiceSpeed = parseFloat(speed);
        this.saveSettings();

        // Update display
        const rangeValue = document.querySelector('.range-value');
        if (rangeValue) {
            rangeValue.textContent = speed + 'x';
        }
    }

    updateTheme(theme) {
        this.settings.theme = theme;
        this.saveSettings();

        // Apply theme (could be extended)
        document.documentElement.setAttribute('data-theme', theme);
    }

    updateSettingsUI() {
        document.getElementById('responseMode').value = this.settings.responseMode;
        document.getElementById('voiceSpeed').value = this.settings.voiceSpeed;
        document.getElementById('themeSelect').value = this.settings.theme;

        const rangeValue = document.querySelector('.range-value');
        if (rangeValue) {
            rangeValue.textContent = this.settings.voiceSpeed + 'x';
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('sandra-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('sandra-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    showLoadingOverlay(message) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('hidden');

        if (message) {
            this.updateLoadingStatus(message);
        }
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('hidden');
    }

    updateLoadingStatus(status) {
        const statusElement = document.getElementById('loadingStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    showError(title, message) {
        document.getElementById('errorMessage').textContent = message;
        this.showModal('errorModal');
    }

    showSuccessMessage(message) {
        // Could create a success modal or use toast notifications
        console.log('Success:', message);

        // For now, just log to console and could show a temporary notification
        this.showTemporaryNotification(message, 'success');
    }

    showTemporaryNotification(message, type = 'info') {
        // Create a temporary notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--sandra-blue);
            color: white;
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }

    handleResize() {
        // Handle responsive behavior
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            if (window.innerWidth <= 768) {
                sidebar.style.width = '100%';
            } else {
                sidebar.style.width = '350px';
            }
        }
    }

    cleanup() {
        console.log('Cleaning up Sandra DevConsole...');

        // Save current state
        this.saveSettings();

        // Clean up components
        if (this.metrics) this.metrics.cleanup();
        if (this.multimodal) this.multimodal.cleanup();
        if (this.chat) this.chat.cleanup();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.sandraApp = new SandraApp();
    await window.sandraApp.init();
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.sandraApp && window.sandraApp.isInitialized) {
        window.sandraApp.showError('Error Inesperado', event.error.message);
    }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.sandraApp && window.sandraApp.isInitialized) {
        window.sandraApp.showError('Error de Promesa', event.reason.message || 'Error desconocido');
    }
});