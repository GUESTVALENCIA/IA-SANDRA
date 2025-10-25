// ═══════════════════════════════════════════════════════════════════
// SANDRA IA MOBILE GALAXY - PWA Installation Handler
// Production PWA Installation and Service Worker Management
// ═══════════════════════════════════════════════════════════════════

class SandraPWAInstaller {
    constructor() {
        this.appName = "Sandra IA Galaxy";
        this.version = "98.0.0";
        this.domain = "sandra.guestsvalencia.es";
        this.manifestUrl = "/manifest.json";
        this.serviceWorkerUrl = "/sw.js";

        this.installPrompt = null;
        this.isInstalled = false;
        this.installationStatus = 'not-installed';

        this.init();
    }

    init() {
        console.log('🚀 Initializing Sandra IA PWA Installer...');

        // Check if PWA is already installed
        this.checkInstallationStatus();

        // Register service worker
        this.registerServiceWorker();

        // Setup install prompt handlers
        this.setupInstallPromptHandlers();

        // Setup installation detection
        this.setupInstallationDetection();

        // Update UI based on installation status
        this.updateInstallationUI();
    }

    // ═══════════════════════════════════════════════════════════════
    // SERVICE WORKER REGISTRATION
    // ═══════════════════════════════════════════════════════════════

    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Service Worker not supported');
            return false;
        }

        try {
            console.log('📝 Registering Sandra IA Service Worker...');

            const registration = await navigator.serviceWorker.register(this.serviceWorkerUrl, {
                scope: '/'
            });

            console.log('✅ Service Worker registered successfully:', registration.scope);

            // Handle service worker updates
            this.handleServiceWorkerUpdate(registration);

            return true;

        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
            return false;
        }
    }

    handleServiceWorkerUpdate(registration) {
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('🔄 New service worker available');
                    this.notifyUpdate();
                }
            });
        });
    }

    notifyUpdate() {
        if (window.sandra && window.sandra.showNotification) {
            window.sandra.showNotification({
                type: 'info',
                title: 'Actualización disponible',
                message: 'Nueva versión de Sandra IA disponible. Reinicia la app para actualizar.',
                actions: [{
                    text: 'Actualizar',
                    action: () => window.location.reload()
                }]
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PWA INSTALLATION DETECTION
    // ═══════════════════════════════════════════════════════════════

    checkInstallationStatus() {
        // Check if running in standalone mode (PWA installed)
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            this.installationStatus = 'installed';
            console.log('✅ Sandra IA PWA is installed and running in standalone mode');
            return;
        }

        // Check if running in iOS standalone mode
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            this.installationStatus = 'installed';
            console.log('✅ Sandra IA PWA is installed on iOS');
            return;
        }

        // Check for Android WebAPK
        if (window.matchMedia && window.matchMedia('(display-mode: minimal-ui)').matches) {
            this.isInstalled = true;
            this.installationStatus = 'installed';
            console.log('✅ Sandra IA PWA is installed as WebAPK');
            return;
        }

        console.log('ℹ️ Sandra IA PWA is not installed');
        this.installationStatus = 'not-installed';
    }

    setupInstallationDetection() {
        // Listen for app installation
        window.addEventListener('appinstalled', (event) => {
            console.log('✅ Sandra IA PWA installed successfully');
            this.isInstalled = true;
            this.installationStatus = 'installed';
            this.updateInstallationUI();

            // Track installation
            this.trackInstallation('success');

            // Show success message
            this.showInstallationSuccess();
        });

        // Listen for display mode changes
        if (window.matchMedia) {
            window.matchMedia('(display-mode: standalone)').addEventListener('change', (event) => {
                if (event.matches) {
                    console.log('✅ Sandra IA PWA is now running in standalone mode');
                    this.isInstalled = true;
                    this.installationStatus = 'installed';
                    this.updateInstallationUI();
                }
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // INSTALL PROMPT HANDLING
    // ═══════════════════════════════════════════════════════════════

    setupInstallPromptHandlers() {
        // Capture the install prompt
        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('📲 PWA install prompt available');

            // Prevent the default prompt
            event.preventDefault();

            // Store the prompt for later use
            this.installPrompt = event;

            // Update UI to show install option
            this.updateInstallationUI();

            // Track prompt availability
            this.trackInstallation('prompt-available');
        });
    }

    async promptInstallation() {
        if (!this.installPrompt) {
            console.warn('⚠️ Install prompt not available');
            this.showManualInstallInstructions();
            return false;
        }

        try {
            console.log('📲 Showing PWA install prompt...');

            // Show the install prompt
            const result = await this.installPrompt.prompt();

            console.log('📊 Install prompt result:', result.outcome);

            // Track user choice
            this.trackInstallation(result.outcome);

            if (result.outcome === 'accepted') {
                console.log('✅ User accepted PWA installation');
                this.installationStatus = 'installing';
                this.updateInstallationUI();
            } else {
                console.log('❌ User dismissed PWA installation');
                this.showManualInstallInstructions();
            }

            // Clear the prompt
            this.installPrompt = null;

            return result.outcome === 'accepted';

        } catch (error) {
            console.error('❌ Error showing install prompt:', error);
            this.showManualInstallInstructions();
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // MANUAL INSTALLATION INSTRUCTIONS
    // ═══════════════════════════════════════════════════════════════

    showManualInstallInstructions() {
        const device = this.detectDevice();
        const instructions = this.getInstallInstructions(device);

        if (window.sandra && window.sandra.showModal) {
            window.sandra.showModal({
                title: 'Instalar Sandra IA',
                content: instructions,
                type: 'info',
                size: 'large'
            });
        } else {
            // Fallback: show in console and alert
            console.log('📱 Manual installation instructions:', instructions);
            alert(instructions.text || instructions);
        }
    }

    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();

        if (/iphone|ipod/.test(userAgent)) return 'iphone';
        if (/ipad/.test(userAgent)) return 'ipad';
        if (/android/.test(userAgent)) return 'android';
        if (/chrome/.test(userAgent)) return 'chrome';
        if (/firefox/.test(userAgent)) return 'firefox';
        if (/safari/.test(userAgent)) return 'safari';
        if (/edge/.test(userAgent)) return 'edge';

        return 'desktop';
    }

    getInstallInstructions(device) {
        const baseUrl = `https://${this.domain}`;

        const instructions = {
            iphone: {
                title: 'Instalar en iPhone',
                html: `
                    <div class="install-instructions">
                        <h3>📱 Instalar Sandra IA en iPhone</h3>
                        <ol>
                            <li><strong>Abre Safari</strong> y ve a <code>${baseUrl}</code></li>
                            <li><strong>Toca el botón Compartir</strong> 📤 (abajo en el centro)</li>
                            <li><strong>Busca "Añadir a pantalla de inicio"</strong> ➕</li>
                            <li><strong>Toca "Añadir"</strong> para confirmar</li>
                            <li><strong>¡Listo!</strong> Sandra IA aparecerá en tu pantalla de inicio</li>
                        </ol>
                        <p class="note">📝 <strong>Nota:</strong> Debe usarse Safari para la instalación</p>
                    </div>
                `,
                text: 'Para instalar en iPhone: Abre Safari → Ir a sandra.guestsvalencia.es → Botón Compartir → Añadir a pantalla de inicio'
            },

            ipad: {
                title: 'Instalar en iPad',
                html: `
                    <div class="install-instructions">
                        <h3>📱 Instalar Sandra IA en iPad</h3>
                        <ol>
                            <li><strong>Abre Safari</strong> y ve a <code>${baseUrl}</code></li>
                            <li><strong>Toca el botón Compartir</strong> 📤 (esquina superior derecha)</li>
                            <li><strong>Busca "Añadir a pantalla de inicio"</strong> ➕</li>
                            <li><strong>Toca "Añadir"</strong> para confirmar</li>
                            <li><strong>¡Listo!</strong> Sandra IA aparecerá en tu pantalla de inicio</li>
                        </ol>
                        <p class="note">📝 <strong>Nota:</strong> Debe usarse Safari para la instalación</p>
                    </div>
                `,
                text: 'Para instalar en iPad: Abre Safari → Ir a sandra.guestsvalencia.es → Botón Compartir → Añadir a pantalla de inicio'
            },

            android: {
                title: 'Instalar en Android',
                html: `
                    <div class="install-instructions">
                        <h3>🤖 Instalar Sandra IA en Android</h3>
                        <ol>
                            <li><strong>Abre Chrome</strong> y ve a <code>${baseUrl}</code></li>
                            <li><strong>Busca el mensaje "Instalar app"</strong> en la parte inferior</li>
                            <li><strong>O toca los 3 puntos</strong> ⋮ → "Instalar app" o "Añadir a pantalla de inicio"</li>
                            <li><strong>Toca "Instalar"</strong> para confirmar</li>
                            <li><strong>¡Listo!</strong> Sandra IA aparecerá en tu cajón de aplicaciones</li>
                        </ol>
                        <p class="note">📝 <strong>Nota:</strong> Funciona mejor con Chrome o Edge</p>
                    </div>
                `,
                text: 'Para instalar en Android: Abre Chrome → Ir a sandra.guestsvalencia.es → Instalar app (mensaje inferior o menú 3 puntos)'
            },

            chrome: {
                title: 'Instalar en Chrome',
                html: `
                    <div class="install-instructions">
                        <h3>🌐 Instalar Sandra IA en Chrome</h3>
                        <ol>
                            <li><strong>Busca el icono de instalación</strong> ➕ en la barra de direcciones</li>
                            <li><strong>O haz clic en los 3 puntos</strong> ⋮ → "Instalar Sandra IA..."</li>
                            <li><strong>Haz clic en "Instalar"</strong> para confirmar</li>
                            <li><strong>¡Listo!</strong> Sandra IA se abrirá en una ventana independiente</li>
                        </ol>
                        <p class="note">📝 <strong>Nota:</strong> También aparecerá en tu menú de aplicaciones</p>
                    </div>
                `,
                text: 'Para instalar en Chrome: Busca el icono + en la barra de direcciones o menú 3 puntos → Instalar Sandra IA'
            },

            edge: {
                title: 'Instalar en Edge',
                html: `
                    <div class="install-instructions">
                        <h3>🌐 Instalar Sandra IA en Edge</h3>
                        <ol>
                            <li><strong>Busca el icono de instalación</strong> ➕ en la barra de direcciones</li>
                            <li><strong>O haz clic en los 3 puntos</strong> ⋯ → "Apps" → "Instalar este sitio como una app"</li>
                            <li><strong>Haz clic en "Instalar"</strong> para confirmar</li>
                            <li><strong>¡Listo!</strong> Sandra IA se abrirá en una ventana independiente</li>
                        </ol>
                        <p class="note">📝 <strong>Nota:</strong> También aparecerá en tu menú inicio</p>
                    </div>
                `,
                text: 'Para instalar en Edge: Busca el icono + en la barra de direcciones o menú 3 puntos → Apps → Instalar este sitio como una app'
            },

            default: {
                title: 'Instalar Sandra IA',
                html: `
                    <div class="install-instructions">
                        <h3>📱 Instalar Sandra IA como App</h3>
                        <p>Para la mejor experiencia, instala Sandra IA en tu dispositivo:</p>
                        <ul>
                            <li><strong>Móvil:</strong> Usa Safari (iOS) o Chrome (Android)</li>
                            <li><strong>Escritorio:</strong> Usa Chrome, Edge o Firefox</li>
                            <li><strong>Busca la opción "Instalar" o "Añadir a pantalla de inicio"</strong></li>
                        </ul>
                        <p class="note">📝 <strong>Beneficios:</strong> Acceso rápido, funciona sin internet, notificaciones</p>
                    </div>
                `,
                text: 'Para instalar Sandra IA: Busca la opción "Instalar app" o "Añadir a pantalla de inicio" en tu navegador'
            }
        };

        return instructions[device] || instructions.default;
    }

    // ═══════════════════════════════════════════════════════════════
    // UI UPDATES
    // ═══════════════════════════════════════════════════════════════

    updateInstallationUI() {
        // Update PWA install button
        const installBtn = document.querySelector('.download-btn[onclick="installPWA()"]');
        if (!installBtn) return;

        switch (this.installationStatus) {
            case 'not-installed':
                if (this.installPrompt) {
                    installBtn.innerHTML = '<span>💾</span> Instalar PWA';
                    installBtn.disabled = false;
                    installBtn.style.background = 'var(--gradient-luxury)';
                } else {
                    installBtn.innerHTML = '<span>📱</span> Ver instrucciones';
                    installBtn.disabled = false;
                    installBtn.style.background = 'var(--gradient-elegant)';
                }
                break;

            case 'installing':
                installBtn.innerHTML = '<span class="loading"></span> Instalando...';
                installBtn.disabled = true;
                break;

            case 'installed':
                installBtn.innerHTML = '<span>✅</span> App Instalada';
                installBtn.disabled = true;
                installBtn.style.background = '#4CAF50';
                break;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // SUCCESS AND TRACKING
    // ═══════════════════════════════════════════════════════════════

    showInstallationSuccess() {
        if (window.sandra && window.sandra.showNotification) {
            window.sandra.showNotification({
                type: 'success',
                title: '🎉 ¡Sandra IA Instalada!',
                message: 'Sandra IA se ha instalado correctamente en tu dispositivo. Ahora puedes acceder desde tu pantalla de inicio.',
                duration: 5000
            });
        }
    }

    trackInstallation(event) {
        console.log('📊 PWA Installation Event:', event);

        // Track with analytics if available
        if (window.gtag) {
            window.gtag('event', 'pwa_install', {
                event_category: 'PWA',
                event_label: event,
                value: 1
            });
        }

        // Custom tracking
        if (window.sandra && window.sandra.trackEvent) {
            window.sandra.trackEvent('pwa_installation', {
                event: event,
                device: this.detectDevice(),
                timestamp: new Date().toISOString()
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    async install() {
        if (this.isInstalled) {
            console.log('ℹ️ Sandra IA PWA is already installed');
            return true;
        }

        if (this.installPrompt) {
            return await this.promptInstallation();
        } else {
            this.showManualInstallInstructions();
            return false;
        }
    }

    getInstallationStatus() {
        return {
            isInstalled: this.isInstalled,
            status: this.installationStatus,
            hasPrompt: !!this.installPrompt,
            device: this.detectDevice()
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL PWA INSTALLER INSTANCE
// ═══════════════════════════════════════════════════════════════

// Create global instance
window.sandraPWAInstaller = new SandraPWAInstaller();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SandraPWAInstaller;
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL FUNCTIONS FOR HTML BUTTONS
// ═══════════════════════════════════════════════════════════════

window.installPWA = function() {
    return window.sandraPWAInstaller.install();
};

window.checkPWAStatus = function() {
    return window.sandraPWAInstaller.getInstallationStatus();
};

console.log('✅ Sandra IA PWA Installer loaded successfully');