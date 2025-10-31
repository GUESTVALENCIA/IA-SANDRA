// Sandra DevConsole - Settings Manager
class SandraSettings {
    constructor() {
        this.defaultSettings = {
            // Response settings
            responseMode: 'text',
            voiceSpeed: 1.0,
            voiceEnabled: false,
            avatarEnabled: false,

            // UI settings
            theme: 'dark',
            autoScroll: true,
            soundEnabled: true,
            notifications: true,

            // Performance settings
            maxMessages: 100,
            refreshInterval: 30000,
            autoSave: true,

            // Voice settings
            voiceLanguage: 'es-ES',
            voiceAutoSend: true,
            voiceTimeout: 5000,

            // Avatar settings
            avatarQuality: 'high',
            avatarAutoPlay: true,

            // Developer settings
            debugMode: false,
            detailedLogging: false,
            showTimestamps: true
        };

        this.currentSettings = { ...this.defaultSettings };
        this.settingsKey = 'sandra-devconsole-settings';
        this.callbacks = {};

        console.log('Sandra Settings initialized');
    }

    async init() {
        this.loadSettings();
        this.setupSettingsUI();
        this.applySettings();
        console.log('Settings manager ready');
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem(this.settingsKey);
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                this.currentSettings = { ...this.defaultSettings, ...parsedSettings };
                console.log('Settings loaded from localStorage');
            }
        } catch (error) {
            console.warn('Failed to load settings, using defaults:', error);
            this.currentSettings = { ...this.defaultSettings };
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(this.currentSettings));
            console.log('Settings saved to localStorage');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    setupSettingsUI() {
        // Response Mode
        const responseModeSelect = document.getElementById('responseMode');
        if (responseModeSelect) {
            responseModeSelect.value = this.currentSettings.responseMode;
            responseModeSelect.addEventListener('change', (e) => {
                this.updateSetting('responseMode', e.target.value);
            });
        }

        // Voice Speed
        const voiceSpeedRange = document.getElementById('voiceSpeed');
        if (voiceSpeedRange) {
            voiceSpeedRange.value = this.currentSettings.voiceSpeed;
            voiceSpeedRange.addEventListener('input', (e) => {
                this.updateSetting('voiceSpeed', parseFloat(e.target.value));
                this.updateVoiceSpeedDisplay(e.target.value);
            });
        }

        // Theme
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.currentSettings.theme;
            themeSelect.addEventListener('change', (e) => {
                this.updateSetting('theme', e.target.value);
            });
        }

        // Add advanced settings panel
        this.createAdvancedSettingsPanel();

        // Update displays
        this.updateSettingsDisplay();
    }

    createAdvancedSettingsPanel() {
        const settingsPanel = document.getElementById('settingsPanel');
        if (!settingsPanel) return;

        const advancedPanel = document.createElement('div');
        advancedPanel.className = 'advanced-settings';
        advancedPanel.innerHTML = `
            <div class="setting-group">
                <h5 style="color: var(--sandra-blue); margin-bottom: var(--spacing-md);">
                    <i class="fas fa-cogs"></i> Configuración Avanzada
                </h5>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input type="checkbox" id="autoScrollSetting" ${this.currentSettings.autoScroll ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Scroll automático en chat
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input type="checkbox" id="soundEnabledSetting" ${this.currentSettings.soundEnabled ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Sonidos del sistema
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input type="checkbox" id="notificationsSetting" ${this.currentSettings.notifications ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Notificaciones
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-label">Idioma de voz</label>
                    <select id="voiceLanguageSetting" class="setting-select">
                        <option value="es-ES">Español (España)</option>
                        <option value="es-MX">Español (México)</option>
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                    </select>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input type="checkbox" id="voiceAutoSendSetting" ${this.currentSettings.voiceAutoSend ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Envío automático por voz
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-label">Calidad de avatar</label>
                    <select id="avatarQualitySetting" class="setting-select">
                        <option value="low">Baja (rápido)</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta (lento)</option>
                    </select>
                </div>

                <div class="setting-group">
                    <label class="setting-label">Máximo de mensajes</label>
                    <input type="number" id="maxMessagesSetting" class="setting-input" min="50" max="500" step="50" value="${this.currentSettings.maxMessages}">
                </div>
            </div>

            <div class="setting-group">
                <h5 style="color: var(--warning-color); margin-bottom: var(--spacing-md);">
                    <i class="fas fa-code"></i> Desarrollador
                </h5>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input type="checkbox" id="debugModeSetting" ${this.currentSettings.debugMode ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Modo debug
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input type="checkbox" id="detailedLoggingSetting" ${this.currentSettings.detailedLogging ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        Logging detallado
                    </label>
                </div>
            </div>

            <div class="setting-group">
                <button id="exportSettingsBtn" class="setting-btn secondary">
                    <i class="fas fa-download"></i> Exportar Configuración
                </button>
                <button id="importSettingsBtn" class="setting-btn secondary">
                    <i class="fas fa-upload"></i> Importar Configuración
                </button>
                <button id="resetSettingsBtn" class="setting-btn secondary">
                    <i class="fas fa-undo"></i> Restablecer Defaults
                </button>
            </div>
        `;

        settingsPanel.appendChild(advancedPanel);

        // Setup event listeners for advanced settings
        this.setupAdvancedSettingsListeners();

        // Add custom CSS for checkboxes
        this.addCheckboxStyles();
    }

    setupAdvancedSettingsListeners() {
        // Checkboxes
        const checkboxSettings = [
            'autoScrollSetting',
            'soundEnabledSetting',
            'notificationsSetting',
            'voiceAutoSendSetting',
            'debugModeSetting',
            'detailedLoggingSetting'
        ];

        checkboxSettings.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    const settingName = id.replace('Setting', '');
                    this.updateSetting(settingName, e.target.checked);
                });
            }
        });

        // Selects
        const voiceLanguageSelect = document.getElementById('voiceLanguageSetting');
        if (voiceLanguageSelect) {
            voiceLanguageSelect.value = this.currentSettings.voiceLanguage;
            voiceLanguageSelect.addEventListener('change', (e) => {
                this.updateSetting('voiceLanguage', e.target.value);
            });
        }

        const avatarQualitySelect = document.getElementById('avatarQualitySetting');
        if (avatarQualitySelect) {
            avatarQualitySelect.value = this.currentSettings.avatarQuality;
            avatarQualitySelect.addEventListener('change', (e) => {
                this.updateSetting('avatarQuality', e.target.value);
            });
        }

        // Number inputs
        const maxMessagesInput = document.getElementById('maxMessagesSetting');
        if (maxMessagesInput) {
            maxMessagesInput.addEventListener('change', (e) => {
                this.updateSetting('maxMessages', parseInt(e.target.value));
            });
        }

        // Action buttons
        document.getElementById('exportSettingsBtn')?.addEventListener('click', () => {
            this.exportSettings();
        });

        document.getElementById('importSettingsBtn')?.addEventListener('click', () => {
            this.importSettings();
        });

        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => {
            this.resetToDefaults();
        });
    }

    addCheckboxStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .setting-checkbox {
                display: flex;
                align-items: center;
                cursor: pointer;
                font-size: 14px;
                color: var(--text-secondary);
                margin-bottom: var(--spacing-sm);
            }

            .setting-checkbox input[type="checkbox"] {
                display: none;
            }

            .checkmark {
                width: 18px;
                height: 18px;
                background: var(--secondary-color);
                border: 2px solid var(--accent-color);
                border-radius: var(--radius-sm);
                margin-right: var(--spacing-sm);
                position: relative;
                transition: var(--transition-fast);
            }

            .setting-checkbox:hover .checkmark {
                border-color: var(--sandra-blue);
            }

            .setting-checkbox input:checked + .checkmark {
                background: var(--sandra-blue);
                border-color: var(--sandra-blue);
            }

            .setting-checkbox input:checked + .checkmark::after {
                content: '';
                position: absolute;
                left: 5px;
                top: 2px;
                width: 4px;
                height: 8px;
                border: solid white;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }

            .setting-input {
                width: 100%;
                background: var(--secondary-color);
                border: 1px solid var(--accent-color);
                color: var(--text-primary);
                padding: var(--spacing-sm);
                border-radius: var(--radius-md);
                font-size: 14px;
            }

            .setting-input:focus {
                outline: none;
                border-color: var(--sandra-blue);
                box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
            }
        `;
        document.head.appendChild(style);
    }

    updateSetting(key, value) {
        const oldValue = this.currentSettings[key];
        this.currentSettings[key] = value;

        console.log(`Setting updated: ${key} = ${value}`);

        // Save to localStorage
        if (this.currentSettings.autoSave) {
            this.saveSettings();
        }

        // Apply setting immediately
        this.applySetting(key, value);

        // Call callbacks
        if (this.callbacks[key]) {
            this.callbacks[key].forEach(callback => {
                try {
                    callback(value, oldValue);
                } catch (error) {
                    console.error(`Error in settings callback for ${key}:`, error);
                }
            });
        }

        // Global callback
        if (this.callbacks['*']) {
            this.callbacks['*'].forEach(callback => {
                try {
                    callback(key, value, oldValue);
                } catch (error) {
                    console.error('Error in global settings callback:', error);
                }
            });
        }
    }

    applySetting(key, value) {
        switch (key) {
            case 'theme':
                this.applyTheme(value);
                break;
            case 'voiceSpeed':
                this.updateVoiceSpeedDisplay(value);
                break;
            case 'debugMode':
                this.toggleDebugMode(value);
                break;
            case 'detailedLogging':
                this.toggleDetailedLogging(value);
                break;
            case 'responseMode':
                this.applyResponseMode(value);
                break;
        }
    }

    applySettings() {
        Object.entries(this.currentSettings).forEach(([key, value]) => {
            this.applySetting(key, value);
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }

    applyResponseMode(mode) {
        // Update UI toggles based on response mode
        const voiceToggle = document.getElementById('voiceToggle');
        const avatarToggle = document.getElementById('avatarToggle');

        switch (mode) {
            case 'text':
                voiceToggle?.classList.remove('active');
                avatarToggle?.classList.remove('active');
                break;
            case 'text-voice':
                voiceToggle?.classList.add('active');
                avatarToggle?.classList.remove('active');
                break;
            case 'multimodal':
                voiceToggle?.classList.add('active');
                avatarToggle?.classList.add('active');
                break;
        }
    }

    updateVoiceSpeedDisplay(speed) {
        const rangeValue = document.querySelector('.range-value');
        if (rangeValue) {
            rangeValue.textContent = speed + 'x';
        }
    }

    toggleDebugMode(enabled) {
        if (enabled) {
            console.log('Debug mode enabled');
            window.sandraDebug = true;
        } else {
            console.log('Debug mode disabled');
            window.sandraDebug = false;
        }
    }

    toggleDetailedLogging(enabled) {
        if (enabled) {
            console.log('Detailed logging enabled');
            // Could enhance logging here
        } else {
            console.log('Detailed logging disabled');
        }
    }

    updateSettingsDisplay() {
        // Update all UI elements to reflect current settings
        const updates = {
            'responseMode': this.currentSettings.responseMode,
            'voiceSpeed': this.currentSettings.voiceSpeed,
            'themeSelect': this.currentSettings.theme,
            'voiceLanguageSetting': this.currentSettings.voiceLanguage,
            'avatarQualitySetting': this.currentSettings.avatarQuality,
            'maxMessagesSetting': this.currentSettings.maxMessages
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });

        // Update checkboxes
        const checkboxes = {
            'autoScrollSetting': this.currentSettings.autoScroll,
            'soundEnabledSetting': this.currentSettings.soundEnabled,
            'notificationsSetting': this.currentSettings.notifications,
            'voiceAutoSendSetting': this.currentSettings.voiceAutoSend,
            'debugModeSetting': this.currentSettings.debugMode,
            'detailedLoggingSetting': this.currentSettings.detailedLogging
        };

        Object.entries(checkboxes).forEach(([id, checked]) => {
            const element = document.getElementById(id);
            if (element) {
                element.checked = checked;
            }
        });

        this.updateVoiceSpeedDisplay(this.currentSettings.voiceSpeed);
    }

    // Callback system
    onSettingChange(key, callback) {
        if (!this.callbacks[key]) {
            this.callbacks[key] = [];
        }
        this.callbacks[key].push(callback);
    }

    offSettingChange(key, callback) {
        if (this.callbacks[key]) {
            const index = this.callbacks[key].indexOf(callback);
            if (index > -1) {
                this.callbacks[key].splice(index, 1);
            }
        }
    }

    // Get/Set methods
    get(key) {
        return this.currentSettings[key];
    }

    set(key, value) {
        this.updateSetting(key, value);
    }

    getAll() {
        return { ...this.currentSettings };
    }

    // Import/Export
    exportSettings() {
        const exportData = {
            settings: this.currentSettings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sandra-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);

                    if (importData.settings) {
                        // Merge with defaults to ensure all required settings exist
                        this.currentSettings = { ...this.defaultSettings, ...importData.settings };
                        this.saveSettings();
                        this.applySettings();
                        this.updateSettingsDisplay();

                        this.showNotification('Configuración importada correctamente', 'success');
                    } else {
                        throw new Error('Invalid settings file format');
                    }
                } catch (error) {
                    console.error('Failed to import settings:', error);
                    this.showNotification('Error importando configuración', 'error');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    }

    resetToDefaults() {
        if (confirm('¿Estás seguro de que quieres restablecer toda la configuración a los valores por defecto?')) {
            this.currentSettings = { ...this.defaultSettings };
            this.saveSettings();
            this.applySettings();
            this.updateSettingsDisplay();

            this.showNotification('Configuración restablecida', 'success');
        }
    }

    showNotification(message, type = 'info') {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? 'var(--error-color)' : 'var(--success-color)'};
            color: white;
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Validation
    validateSetting(key, value) {
        switch (key) {
            case 'voiceSpeed':
                return value >= 0.5 && value <= 2.0;
            case 'maxMessages':
                return value >= 50 && value <= 500;
            case 'refreshInterval':
                return value >= 5000 && value <= 300000;
            default:
                return true;
        }
    }

    cleanup() {
        // Save final state
        this.saveSettings();

        // Clear callbacks
        this.callbacks = {};

        console.log('Settings manager cleaned up');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SandraSettings };
}