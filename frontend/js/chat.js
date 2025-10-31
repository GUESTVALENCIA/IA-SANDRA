// Sandra DevConsole - Chat Manager
class SandraChat {
    constructor() {
        this.messages = [];
        this.maxMessages = 100;
        this.messageContainer = null;
        this.autoScroll = true;
        this.isTyping = false;

        console.log('Sandra Chat initialized');
    }

    async init() {
        this.messageContainer = document.getElementById('chatMessages');
        if (!this.messageContainer) {
            throw new Error('Chat messages container not found');
        }

        this.setupScrollHandling();
        console.log('Chat manager ready');
    }

    addUserMessage(text) {
        const message = {
            id: this.generateMessageId(),
            type: 'user',
            text: text,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        this.addMessage(message);
        return message;
    }

    async addSandraMessage(responseData) {
        const message = {
            id: this.generateMessageId(),
            type: 'sandra',
            text: responseData.text,
            timestamp: responseData.timestamp || new Date().toISOString(),
            status: 'received',
            services: responseData.services || {},
            processingTime: responseData.processingTime || 0,
            audio: responseData.audio || null,
            avatar: responseData.avatar || null
        };

        // Show typing indicator first
        this.showTypingIndicator();

        // Simulate typing delay based on message length
        const typingDelay = Math.min(message.text.length * 30, 3000);
        await this.delay(typingDelay);

        this.hideTypingIndicator();
        this.addMessage(message);

        return message;
    }

    addMessage(message) {
        this.messages.push(message);

        // Limit message history
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }

        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageElement = this.createMessageElement(message);
        this.messageContainer.appendChild(messageElement);

        // Animate message appearance
        setTimeout(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        }, 10);
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}-message`;
        messageDiv.style.cssText = 'opacity: 0; transform: translateY(20px); transition: all 0.3s ease;';
        messageDiv.setAttribute('data-message-id', message.id);

        const avatarDiv = this.createMessageAvatar(message);
        const contentDiv = this.createMessageContent(message);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        return messageDiv;
    }

    createMessageAvatar(message) {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';

        const img = document.createElement('img');
        if (message.type === 'sandra') {
            img.src = 'assets/images/sandra-avatar.svg';
            img.alt = 'Sandra';
        } else {
            img.src = 'assets/images/user-avatar.svg';
            img.alt = 'Clayton';
        }

        // Fallback avatar using initials
        img.onerror = () => {
            img.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.style.cssText = `
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: ${message.type === 'sandra' ? 'var(--sandra-blue)' : 'var(--accent-color)'};
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 16px;
            `;
            fallback.textContent = message.type === 'sandra' ? 'S' : 'C';
            avatarDiv.appendChild(fallback);
        };

        avatarDiv.appendChild(img);
        return avatarDiv;
    }

    createMessageContent(message) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        // Message text
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.innerHTML = this.formatMessageText(message.text);
        contentDiv.appendChild(textDiv);

        // Add media elements if present
        if (message.audio) {
            const audioElement = this.createAudioElement(message.audio);
            contentDiv.appendChild(audioElement);
        }

        if (message.avatar && message.avatar.videoPath) {
            const videoElement = this.createVideoElement(message.avatar);
            contentDiv.appendChild(videoElement);
        }

        // Message metadata
        const metaDiv = this.createMessageMeta(message);
        contentDiv.appendChild(metaDiv);

        // Message actions
        if (message.type === 'sandra') {
            const actionsDiv = this.createMessageActions(message);
            contentDiv.appendChild(actionsDiv);
        }

        return contentDiv;
    }

    createMessageMeta(message) {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'message-timestamp';

        const timestamp = new Date(message.timestamp);
        const timeString = timestamp.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let metaText = timeString;

        if (message.processingTime) {
            metaText += ` • ${message.processingTime}ms`;
        }

        if (message.services && Object.keys(message.services).length > 0) {
            const serviceCount = Object.keys(message.services).length;
            metaText += ` • ${serviceCount} servicio${serviceCount > 1 ? 's' : ''}`;
        }

        metaDiv.textContent = metaText;
        return metaDiv;
    }

    createMessageActions(message) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'message-action';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
        copyBtn.onclick = () => this.copyMessage(message);
        actionsDiv.appendChild(copyBtn);

        // Regenerate button
        const regenBtn = document.createElement('button');
        regenBtn.className = 'message-action';
        regenBtn.innerHTML = '<i class="fas fa-sync"></i> Regenerar';
        regenBtn.onclick = () => this.regenerateMessage(message);
        actionsDiv.appendChild(regenBtn);

        // Voice button (if audio available)
        if (message.audio) {
            const voiceBtn = document.createElement('button');
            voiceBtn.className = 'message-action';
            voiceBtn.innerHTML = '<i class="fas fa-volume-up"></i> Reproducir';
            voiceBtn.onclick = () => this.playMessageAudio(message);
            actionsDiv.appendChild(voiceBtn);
        }

        return actionsDiv;
    }

    createAudioElement(audioData) {
        const audioContainer = document.createElement('div');
        audioContainer.className = 'audio-player';

        const audio = document.createElement('audio');
        audio.controls = true;
        audio.preload = 'metadata';

        if (audioData.audioPath) {
            audio.src = audioData.audioPath;
        } else if (audioData.relativePath) {
            audio.src = audioData.relativePath;
        }

        audioContainer.appendChild(audio);

        // Add audio info
        if (audioData.duration) {
            const info = document.createElement('div');
            info.className = 'audio-info';
            info.innerHTML = `<i class="fas fa-headphones"></i> Audio (${audioData.duration}s)`;
            audioContainer.insertBefore(info, audio);
        }

        return audioContainer;
    }

    createVideoElement(avatarData) {
        // Si es avatar interactivo de HeyGen, crear iframe
        // ID del avatar proporcionado por el usuario: 306d1c6f1b014036b467ff70ea38d965
        if (avatarData.interactiveAvatar || avatarData.interactiveAvatarUrl || avatarData.embedUrl) {
            const container = document.createElement('div');
            container.className = 'interactive-avatar-container';
            container.style.cssText = `
                width: 100%;
                max-width: 800px;
                margin: var(--spacing-md) 0;
                border-radius: var(--radius-md);
                overflow: hidden;
                background: var(--primary-color);
                box-shadow: var(--shadow-md);
            `;

            // Usar siempre el avatar ID proporcionado directamente por el usuario
            const avatarUrl = avatarData.interactiveAvatarUrl || avatarData.embedUrl || 
                `https://app.heygen.com/interactive-avatar/306d1c6f1b014036b467ff70ea38d965`;

            console.log('[CHAT] Creating HeyGen interactive avatar iframe:', avatarUrl);

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

            container.appendChild(iframe);
            return container;
        }

        // Video normal (fallback)
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-player';

        const video = document.createElement('video');
        video.controls = true;
        video.preload = 'metadata';
        video.style.maxWidth = '100%';
        video.style.borderRadius = 'var(--radius-md)';

        if (avatarData.videoPath) {
            video.src = avatarData.videoPath;
        } else if (avatarData.relativePath) {
            video.src = avatarData.relativePath;
        }

        videoContainer.appendChild(video);

        // Add video info
        const info = document.createElement('div');
        info.className = 'video-info';
        info.innerHTML = `<i class="fas fa-video"></i> Sandra Avatar`;
        videoContainer.insertBefore(info, video);

        return videoContainer;
    }

    formatMessageText(text) {
        // Basic markdown-like formatting
        let formatted = text;

        // Bold text
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Italic text
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Code blocks
        formatted = formatted.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');

        // Inline code
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');

        // Links
        formatted = formatted.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener">$1</a>'
        );

        return formatted;
    }

    showTypingIndicator() {
        if (this.isTyping) return;

        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';

        typingDiv.innerHTML = `
            <div class="message sandra-message">
                <div class="message-avatar">
                    <img src="assets/images/sandra-avatar.svg" alt="Sandra" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;width:40px;height:40px;border-radius:50%;background:var(--sandra-blue);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;&quot;>S</div>'">
                </div>
                <div class="message-content">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;

        this.messageContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }

    addErrorMessage(errorText) {
        const message = {
            id: this.generateMessageId(),
            type: 'error',
            text: errorText,
            timestamp: new Date().toISOString(),
            status: 'error'
        };

        const messageElement = document.createElement('div');
        messageElement.className = 'message error-message';
        messageElement.style.cssText = `
            background: rgba(244, 67, 54, 0.1);
            border: 1px solid var(--error-color);
            color: var(--error-color);
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
            margin: var(--spacing-md) 0;
            text-align: center;
        `;

        messageElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            ${errorText}
        `;

        this.messageContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    clearMessages() {
        this.messages = [];
        this.messageContainer.innerHTML = '';
        this.hideTypingIndicator();
    }

    copyMessage(message) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(message.text).then(() => {
                this.showTemporaryTooltip('Mensaje copiado');
            }).catch(err => {
                console.error('Failed to copy message:', err);
            });
        }
    }

    async regenerateMessage(message) {
        // Find the previous user message to regenerate response
        const messageIndex = this.messages.findIndex(m => m.id === message.id);
        if (messageIndex > 0) {
            const previousMessage = this.messages[messageIndex - 1];
            if (previousMessage.type === 'user') {
                // Trigger regeneration via app
                if (window.sandraApp) {
                    window.sandraApp.sendMessage(previousMessage.text);
                }
            }
        }
    }

    playMessageAudio(message) {
        if (message.audio && message.audio.audioPath) {
            const audio = new Audio(message.audio.audioPath);
            audio.play().catch(err => {
                console.error('Failed to play audio:', err);
                this.showTemporaryTooltip('Error reproduciendo audio');
            });
        }
    }

    showTemporaryTooltip(text) {
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--sandra-blue);
            color: white;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius-md);
            z-index: 1000;
            font-size: 14px;
            animation: fadeIn 0.3s ease;
        `;
        tooltip.textContent = text;

        document.body.appendChild(tooltip);

        setTimeout(() => {
            tooltip.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(tooltip);
            }, 300);
        }, 2000);
    }

    scrollToBottom() {
        if (this.autoScroll) {
            setTimeout(() => {
                this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
            }, 100);
        }
    }

    setupScrollHandling() {
        let isUserScrolling = false;
        let scrollTimeout;

        this.messageContainer.addEventListener('scroll', () => {
            isUserScrolling = true;
            clearTimeout(scrollTimeout);

            // Check if user scrolled to bottom
            const isAtBottom = this.messageContainer.scrollHeight - this.messageContainer.scrollTop <= this.messageContainer.clientHeight + 50;

            this.autoScroll = isAtBottom;

            scrollTimeout = setTimeout(() => {
                isUserScrolling = false;
            }, 1000);
        });
    }

    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getMessageHistory() {
        return this.messages.map(msg => ({
            type: msg.type,
            text: msg.text,
            timestamp: msg.timestamp
        }));
    }

    exportChat() {
        const chatData = {
            messages: this.messages,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sandra-chat-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    cleanup() {
        this.hideTypingIndicator();
        console.log('Chat manager cleaned up');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SandraChat };
}