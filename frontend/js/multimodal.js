// Sandra DevConsole - Multimodal Manager
class SandraMultimodal {
    constructor() {
        this.audioContext = null;
        this.currentAudio = null;
        this.currentVideo = null;
        this.voiceRecognition = null;
        this.isRecording = false;
        this.audioQueue = [];

        console.log('Sandra Multimodal initialized');
    }

    async init() {
        try {
            await this.initializeAudioContext();
            this.initializeVoiceRecognition();
            this.setupMediaElements();
            console.log('Multimodal manager ready');
        } catch (error) {
            console.warn('Some multimodal features may not be available:', error.message);
        }
    }

    async initializeAudioContext() {
        try {
            if (window.AudioContext || window.webkitAudioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        } catch (error) {
            console.warn('AudioContext not available:', error);
        }
    }

    initializeVoiceRecognition() {
        try {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.voiceRecognition = new SpeechRecognition();

                this.voiceRecognition.continuous = false;
                this.voiceRecognition.interimResults = true;
                this.voiceRecognition.lang = 'es-ES';

                this.voiceRecognition.onstart = () => {
                    console.log('Voice recognition started');
                    this.onVoiceRecognitionStart();
                };

                this.voiceRecognition.onresult = (event) => {
                    this.onVoiceRecognitionResult(event);
                };

                this.voiceRecognition.onerror = (event) => {
                    console.error('Voice recognition error:', event.error);
                    this.onVoiceRecognitionError(event.error);
                };

                this.voiceRecognition.onend = () => {
                    console.log('Voice recognition ended');
                    this.onVoiceRecognitionEnd();
                };

                console.log('Voice recognition initialized successfully');
            } else {
                console.warn('Speech recognition not supported in this browser');
                // Try to use Electron's API if available
                if (window.require) {
                    try {
                        const { ipcRenderer } = window.require('electron');
                        // Use IPC for voice recognition if Web Speech API not available
                        this.useIPCVoiceRecognition = true;
                        console.log('Using IPC for voice recognition');
                    } catch (error) {
                        console.warn('IPC not available for voice recognition');
                    }
                }
            }
        } catch (error) {
            console.error('Failed to initialize voice recognition:', error);
            this.voiceRecognition = null;
        }
    }

    setupMediaElements() {
        // Setup audio player
        this.audioPlayer = document.getElementById('audioPlayer');
        if (!this.audioPlayer) {
            this.audioPlayer = document.createElement('audio');
            this.audioPlayer.id = 'audioPlayer';
            this.audioPlayer.preload = 'none';
            document.body.appendChild(this.audioPlayer);
        }

        // Setup video player
        this.videoPlayer = document.getElementById('videoPlayer');
        if (!this.videoPlayer) {
            this.videoPlayer = document.createElement('video');
            this.videoPlayer.id = 'videoPlayer';
            this.videoPlayer.preload = 'none';
            this.videoPlayer.style.display = 'none';
            document.body.appendChild(this.videoPlayer);
        }

        // Setup event listeners
        this.audioPlayer.addEventListener('ended', () => {
            this.onAudioEnded();
        });

        this.videoPlayer.addEventListener('ended', () => {
            this.onVideoEnded();
        });
    }

    async playAudio(audioData) {
        try {
            if (!audioData || !audioData.audioPath) {
                console.warn('No audio data provided');
                return false;
            }

            // Stop current audio if playing
            if (this.currentAudio) {
                this.currentAudio.pause();
            }

            // Create new audio element for this message
            const audio = new Audio();
            audio.src = audioData.audioPath || audioData.relativePath;
            audio.preload = 'auto';

            this.currentAudio = audio;

            // Show audio indicator
            this.showAudioIndicator(true);

            // Play audio
            await audio.play();

            return true;

        } catch (error) {
            console.error('Failed to play audio:', error);
            this.showAudioError('Error reproduciendo audio');
            return false;
        }
    }

    async showAvatar(avatarData) {
        try {
            if (!avatarData) {
                console.warn('No avatar data provided');
                return false;
            }

            // Avatar interactivo de HeyGen
            if (avatarData.interactiveAvatar || avatarData.interactiveAvatarUrl || avatarData.embedUrl) {
                return this.showInteractiveAvatar(avatarData);
            }

            if (avatarData.status === 'processing') {
                this.showAvatarProcessing(avatarData);
                return true;
            }

            if (avatarData.videoPath || avatarData.relativePath) {
                return await this.playAvatarVideo(avatarData);
            }

            return false;

        } catch (error) {
            console.error('Failed to show avatar:', error);
            this.showAvatarError('Error mostrando avatar');
            return false;
        }
    }

    showInteractiveAvatar(avatarData) {
        try {
            // URL del avatar interactivo de HeyGen proporcionado por el usuario
            // ID: 306d1c6f1b014036b467ff70ea38d965
            const avatarUrl = avatarData.interactiveAvatarUrl || avatarData.embedUrl || 
                `https://app.heygen.com/interactive-avatar/${avatarData.avatarId || '306d1c6f1b014036b467ff70ea38d965'}`;

            console.log('[MULTIMODAL] Showing HeyGen interactive avatar:', avatarUrl);

            // Crear contenedor para el iframe del avatar
            const avatarContainer = document.createElement('div');
            avatarContainer.className = 'interactive-avatar-container';
            avatarContainer.style.cssText = `
                width: 100%;
                max-width: 800px;
                margin: var(--spacing-md) auto;
                border-radius: var(--radius-md);
                overflow: hidden;
                background: var(--primary-color);
                box-shadow: var(--shadow-lg);
            `;

            // Crear iframe para el avatar interactivo de HeyGen
            const iframe = document.createElement('iframe');
            iframe.src = avatarUrl;
            iframe.style.cssText = `
                width: 100%;
                height: 600px;
                border: none;
                display: block;
            `;
            iframe.allow = 'microphone; camera';
            iframe.allowFullscreen = true;
            iframe.title = 'Sandra Interactive Avatar - HeyGen';
            iframe.loading = 'lazy';

            avatarContainer.appendChild(iframe);

            // Agregar al último mensaje de Sandra
            const messages = document.querySelectorAll('.sandra-message');
            if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                const content = lastMessage.querySelector('.message-content');
                if (content) {
                    // Remover cualquier avatar previo en este mensaje
                    const existingAvatar = content.querySelector('.interactive-avatar-container');
                    if (existingAvatar) {
                        existingAvatar.remove();
                    }
                    content.appendChild(avatarContainer);
                } else {
                    // Si no hay content, agregarlo directamente al mensaje
                    lastMessage.appendChild(avatarContainer);
                }
            }

            this.showAvatarIndicator(true);
            console.log('[MULTIMODAL] Interactive Avatar displayed successfully');

            return true;

        } catch (error) {
            console.error('[MULTIMODAL] Failed to show interactive avatar:', error);
            this.showAvatarError('Error mostrando avatar interactivo');
            return false;
        }
    }

    async playAvatarVideo(avatarData) {
        try {
            // Stop current video if playing
            if (this.currentVideo) {
                this.currentVideo.pause();
            }

            // Create new video element
            const video = document.createElement('video');
            video.src = avatarData.videoPath || avatarData.relativePath;
            video.controls = true;
            video.preload = 'auto';
            video.style.cssText = `
                max-width: 100%;
                border-radius: var(--radius-md);
                background: var(--primary-color);
            `;

            this.currentVideo = video;

            // Show avatar indicator
            this.showAvatarIndicator(true);

            // Auto-play if settings allow
            try {
                await video.play();
            } catch (playError) {
                console.warn('Auto-play blocked, user interaction required');
            }

            return true;

        } catch (error) {
            console.error('Failed to play avatar video:', error);
            throw error;
        }
    }

    showAvatarProcessing(avatarData) {
        const processingDiv = document.createElement('div');
        processingDiv.className = 'avatar-processing';
        processingDiv.style.cssText = `
            background: rgba(33, 150, 243, 0.1);
            border: 1px solid var(--sandra-blue);
            border-radius: var(--radius-md);
            padding: var(--spacing-md);
            margin-top: var(--spacing-sm);
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
        `;

        processingDiv.innerHTML = `
            <div class="spinner"></div>
            <span>${avatarData.message || 'Generando avatar...'}</span>
        `;

        // Add to latest Sandra message
        const messages = document.querySelectorAll('.sandra-message');
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const content = lastMessage.querySelector('.message-content');
            content.appendChild(processingDiv);
        }

        // Check status periodically if videoId provided
        if (avatarData.videoId) {
            this.checkAvatarStatus(avatarData.videoId, processingDiv);
        }
    }

    async checkAvatarStatus(videoId, processingElement) {
        const maxAttempts = 30; // 5 minutes max
        const interval = 10000; // Check every 10 seconds

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                await this.delay(interval);

                // Check status via API
                const status = await this.checkVideoStatus(videoId);

                if (status.success && status.status === 'completed') {
                    // Replace processing indicator with video
                    const video = document.createElement('video');
                    video.src = status.downloadUrl || status.videoPath;
                    video.controls = true;
                    video.style.cssText = `
                        width: 100%;
                        border-radius: var(--radius-md);
                        margin-top: var(--spacing-sm);
                    `;

                    processingElement.parentNode.replaceChild(video, processingElement);
                    return;

                } else if (status.success && status.progress) {
                    // Update progress
                    const progressText = processingElement.querySelector('span');
                    progressText.textContent = `Generando avatar... ${status.progress}%`;
                }

            } catch (error) {
                console.error('Error checking avatar status:', error);
            }
        }

        // Timeout - show error
        processingElement.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: var(--warning-color);"></i>
            <span>Avatar tardando más de lo esperado. Intenta más tarde.</span>
        `;
    }

    async checkVideoStatus(videoId) {
        // This would call the actual API
        // For now, simulate completion after delay
        await this.delay(5000);

        return {
            success: true,
            status: 'completed',
            downloadUrl: 'assets/videos/sample-avatar.mp4'
        };
    }

    startVoiceRecognition() {
        if (this.useIPCVoiceRecognition && window.require) {
            try {
                const { ipcRenderer } = window.require('electron');
                // Request microphone access via Electron
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        stream.getTracks().forEach(track => track.stop());
                        // Start recording via IPC
                        ipcRenderer.send('start-voice-recognition');
                        this.isRecording = true;
                        this.onVoiceRecognitionStart();
                        return true;
                    })
                    .catch(error => {
                        console.error('Microphone access denied:', error);
                        this.showVoiceError('Permisos de micrófono denegados');
                        return false;
                    });
            } catch (error) {
                console.error('IPC voice recognition error:', error);
                this.showVoiceError('Error accediendo al micrófono');
                return false;
            }
        }

        if (!this.voiceRecognition) {
            this.showVoiceError('Reconocimiento de voz no disponible');
            return false;
        }

        if (this.isRecording) {
            this.stopVoiceRecognition();
            return false;
        }

        try {
            this.voiceRecognition.start();
            return true;
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            this.showVoiceError('Error iniciando reconocimiento de voz');
            return false;
        }
    }

    stopVoiceRecognition() {
        if (this.voiceRecognition && this.isRecording) {
            this.voiceRecognition.stop();
        }
    }

    onVoiceRecognitionStart() {
        this.isRecording = true;
        this.showVoiceIndicator(true);

        // Update UI
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (voiceBtn) {
            voiceBtn.classList.add('active');
            voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        }
    }

    onVoiceRecognitionResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Update message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            if (finalTranscript) {
                messageInput.value = finalTranscript;
                messageInput.dispatchEvent(new Event('input'));
            } else if (interimTranscript) {
                // Show interim results as placeholder
                messageInput.placeholder = interimTranscript;
            }
        }

        // Auto-send if final transcript and complete sentence
        if (finalTranscript && this.isCompleteSentence(finalTranscript)) {
            setTimeout(() => {
                if (window.sandraApp) {
                    window.sandraApp.sendMessage();
                }
            }, 500);
        }
    }

    onVoiceRecognitionError(error) {
        this.isRecording = false;
        this.showVoiceIndicator(false);

        let errorMessage = 'Error en reconocimiento de voz';

        switch (error) {
            case 'no-speech':
                errorMessage = 'No se detectó voz';
                break;
            case 'audio-capture':
                errorMessage = 'Error accediendo al micrófono';
                break;
            case 'not-allowed':
                errorMessage = 'Permisos de micrófono denegados';
                break;
            case 'network':
                errorMessage = 'Error de conexión';
                break;
        }

        this.showVoiceError(errorMessage);
        this.resetVoiceButton();
    }

    onVoiceRecognitionEnd() {
        this.isRecording = false;
        this.showVoiceIndicator(false);
        this.resetVoiceButton();

        // Reset placeholder
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.placeholder = 'Escribe tu mensaje para Sandra...';
        }
    }

    resetVoiceButton() {
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (voiceBtn) {
            voiceBtn.classList.remove('active');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        }
    }

    isCompleteSentence(text) {
        // Check if text ends with sentence-ending punctuation
        const trimmed = text.trim();
        return /[.!?]$/.test(trimmed) && trimmed.length > 5;
    }

    showAudioIndicator(show) {
        let indicator = document.getElementById('audioIndicator');

        if (show && !indicator) {
            indicator = document.createElement('div');
            indicator.id = 'audioIndicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--sandra-blue);
                color: white;
                padding: var(--spacing-sm) var(--spacing-md);
                border-radius: var(--radius-md);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;
            indicator.innerHTML = '<i class="fas fa-volume-up"></i> Sandra hablando...';
            document.body.appendChild(indicator);
        } else if (!show && indicator) {
            indicator.remove();
        }
    }

    showAvatarIndicator(show) {
        let indicator = document.getElementById('avatarIndicator');

        if (show && !indicator) {
            indicator = document.createElement('div');
            indicator.id = 'avatarIndicator';
            indicator.style.cssText = `
                position: fixed;
                top: 70px;
                right: 20px;
                background: var(--sandra-blue);
                color: white;
                padding: var(--spacing-sm) var(--spacing-md);
                border-radius: var(--radius-md);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;
            indicator.innerHTML = '<i class="fas fa-video"></i> Avatar activo';
            document.body.appendChild(indicator);
        } else if (!show && indicator) {
            indicator.remove();
        }
    }

    showVoiceIndicator(show) {
        let indicator = document.getElementById('voiceIndicator');

        if (show && !indicator) {
            indicator = document.createElement('div');
            indicator.id = 'voiceIndicator';
            indicator.style.cssText = `
                position: fixed;
                top: 120px;
                right: 20px;
                background: var(--error-color);
                color: white;
                padding: var(--spacing-sm) var(--spacing-md);
                border-radius: var(--radius-md);
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;
            indicator.innerHTML = '<i class="fas fa-microphone"></i> Escuchando...';
            document.body.appendChild(indicator);
        } else if (!show && indicator) {
            indicator.remove();
        }
    }

    showAudioError(message) {
        this.showTemporaryNotification(message, 'error');
    }

    showAvatarError(message) {
        this.showTemporaryNotification(message, 'error');
    }

    showVoiceError(message) {
        this.showTemporaryNotification(message, 'error');
    }

    showTemporaryNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? 'var(--error-color)' : 'var(--sandra-blue)'};
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

    onAudioEnded() {
        this.showAudioIndicator(false);
        this.currentAudio = null;

        // Process audio queue if any
        if (this.audioQueue.length > 0) {
            const nextAudio = this.audioQueue.shift();
            this.playAudio(nextAudio);
        }
    }

    onVideoEnded() {
        this.showAvatarIndicator(false);
        this.currentVideo = null;
    }

    stopAllMedia() {
        // Stop audio
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        // Stop video
        if (this.currentVideo) {
            this.currentVideo.pause();
            this.currentVideo = null;
        }

        // Stop voice recognition
        this.stopVoiceRecognition();

        // Clear indicators
        this.showAudioIndicator(false);
        this.showAvatarIndicator(false);
        this.showVoiceIndicator(false);

        // Clear queue
        this.audioQueue = [];
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    cleanup() {
        this.stopAllMedia();

        // Clean up audio context
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }

        console.log('Multimodal manager cleaned up');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SandraMultimodal };
}