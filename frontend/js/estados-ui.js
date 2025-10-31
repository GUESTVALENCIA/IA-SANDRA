/**
 * Estados UI Manager
 * Loading, Error, y Offline States
 */

class EstadosUI {
    constructor() {
        this.isProcessing = false;
        this.chatContainer = null;
        this.connectionStatus = null;
        this.init();
    }

    init() {
        // Buscar contenedor de chat
        this.chatContainer = document.getElementById('chat-messages') || 
                            document.querySelector('.chat-messages') ||
                            document.querySelector('#messages');
        
        // Crear indicador de conexión si no existe
        this.createConnectionStatusIndicator();
        
        // Inicializar offline detector
        this.setupOfflineDetector();
        
        console.log('[Estados UI] Initialized');
    }

    /**
     * Crear indicador de estado de conexión
     */
    createConnectionStatusIndicator() {
        // Buscar header o crear uno
        const header = document.querySelector('header') || 
                      document.querySelector('.header') ||
                      document.querySelector('nav');
        
        if (header && !document.getElementById('connection-status')) {
            const statusIndicator = document.createElement('div');
            statusIndicator.id = 'connection-status';
            statusIndicator.className = 'connection-status';
            statusIndicator.innerHTML = `
                <span class="status-dot online"></span>
                <span class="status-text">En línea</span>
            `;
            
            // Insertar en header
            const headerRight = header.querySelector('.header-right') || 
                               header.querySelector('.header-controls');
            if (headerRight) {
                headerRight.insertBefore(statusIndicator, headerRight.firstChild);
            } else {
                header.appendChild(statusIndicator);
            }
            
            this.connectionStatus = statusIndicator;
        } else {
            this.connectionStatus = document.getElementById('connection-status');
        }
    }

    /**
     * Detector de conexión offline/online
     */
    setupOfflineDetector() {
        const isOnline = navigator.onLine;
        this.updateConnectionStatus(isOnline);

        window.addEventListener('online', () => {
            this.updateConnectionStatus(true);
            this.showToast('✅ Conexión restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.updateConnectionStatus(false);
            this.showToast('⚠️ Sin conexión a internet', 'warning');
        });
    }

    /**
     * Actualizar UI de estado de conexión
     */
    updateConnectionStatus(isOnline) {
        if (!this.connectionStatus) return;

        const dot = this.connectionStatus.querySelector('.status-dot');
        const text = this.connectionStatus.querySelector('.status-text');

        if (dot && text) {
            if (isOnline) {
                dot.className = 'status-dot online';
                text.textContent = 'En línea';
                this.connectionStatus.classList.remove('offline');
            } else {
                dot.className = 'status-dot offline';
                text.textContent = 'Sin conexión';
                this.connectionStatus.classList.add('offline');
            }
        }
    }

    /**
     * Mostrar estado de loading
     */
    showLoadingState(message = 'Sandra está escribiendo...') {
        if (!this.chatContainer) {
            console.warn('[Estados UI] Chat container not found');
            return;
        }

        // Remover loading anterior si existe
        this.hideLoadingState();

        const loadingHTML = `
            <div class="message sandra-message loading" id="loading-message">
                <div class="avatar">🤖</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                    <span class="loading-text">${message}</span>
                </div>
            </div>
        `;

        this.chatContainer.insertAdjacentHTML('beforeend', loadingHTML);
        this.scrollToBottom();
    }

    /**
     * Ocultar estado de loading
     */
    hideLoadingState() {
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) {
            loadingMsg.remove();
        }
    }

    /**
     * Mostrar estado de error
     */
    showErrorState(error, onRetry = null) {
        if (!this.chatContainer) return;

        this.hideLoadingState(); // Remover loading si existe

        const errorMessage = error?.message || error || 'Error desconocido';
        
        const errorHTML = `
            <div class="message error-message" id="error-message">
                <div class="error-icon">⚠️</div>
                <div class="error-content">
                    <p><strong>Ups, algo salió mal</strong></p>
                    <p class="error-text">${errorMessage}</p>
                    ${onRetry ? `
                        <button onclick="window.lastRetryFunction && window.lastRetryFunction()" class="retry-button">
                            🔄 Reintentar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        this.chatContainer.insertAdjacentHTML('beforeend', errorHTML);
        this.scrollToBottom();

        // Guardar función de retry si existe
        if (onRetry) {
            window.lastRetryFunction = onRetry;
        }

        // Auto-remover después de 10 segundos
        setTimeout(() => {
            const errorMsg = document.getElementById('error-message');
            if (errorMsg) errorMsg.remove();
        }, 10000);
    }

    /**
     * Mostrar toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto-remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Scroll al final del chat
     */
    scrollToBottom() {
        if (this.chatContainer) {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }
    }

    /**
     * Bloquear procesamiento (prevenir double-submit)
     */
    setProcessing(isProcessing) {
        this.isProcessing = isProcessing;
    }

    /**
     * Verificar si está procesando
     */
    getProcessing() {
        return this.isProcessing;
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.estadosUI = new EstadosUI();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EstadosUI;
}

