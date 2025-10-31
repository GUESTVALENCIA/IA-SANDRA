// Sandra Chat Intelligence v2.0
// Procesamiento inteligente de comandos y conversación

class SandraChatAI {
    constructor() {
        this.responses = {
            greetings: [
                '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
                '¡Hey! Estoy lista para desarrollar contigo 🚀',
                '¡Hola! ¿Qué proyecto trabajamos hoy? 💻',
                '¡Saludos! Sandra Dev al servicio 🌟'
            ],
            thanks: [
                '¡De nada! Es un placer ayudarte 💚',
                'Para eso estoy aquí 😊',
                '¡Siempre a tu servicio! 🚀'
            ],
            status: [
                '¡Funcionando al 100% en modo Galaxy! 🌌',
                'Todos los sistemas operativos y listos 🟢',
                'En perfecto estado, ¡vamos a programar! 💪'
            ]
        };
    }

    processMessage(message) {
        const lower = message.toLowerCase().trim();
        
        // Saludos
        if (lower.match(/^(hola|hi|hey|buenas|saludos|que tal)/)) {
            return {
                type: 'chat',
                response: this.getRandomResponse('greetings')
            };
        }
        
        // Agradecimientos
        if (lower.includes('gracias') || lower.includes('thanks')) {
            return {
                type: 'chat',
                response: this.getRandomResponse('thanks')
            };
        }
        
        // Estado
        if (lower.includes('cómo estás') || lower.includes('como estas')) {
            return {
                type: 'chat',
                response: this.getRandomResponse('status')
            };
        }
        
        // Crear archivo
        if (lower.includes('crear archivo') || lower.includes('create file')) {
            const fileName = this.extractFileName(message) || `archivo-${Date.now()}.js`;
            return {
                type: 'command',
                command: 'create-file',
                params: { fileName }
            };
        }
        
        // Listar
        if (lower === 'ls' || lower === 'dir' || lower.includes('listar')) {
            return {
                type: 'command',
                command: 'list-files'
            };
        }
        
        // Git
        if (lower.startsWith('git')) {
            return {
                type: 'command',
                command: 'git',
                params: { cmd: message }
            };
        }
        
        // NPM
        if (lower.includes('npm install') || lower.includes('instalar')) {
            const packageName = message.split(' ').pop();
            return {
                type: 'command',
                command: 'npm-install',
                params: { package: packageName }
            };
        }
        
        // Ayuda
        if (lower === 'ayuda' || lower === 'help' || lower === '?') {
            return {
                type: 'help'
            };
        }
        
        // Comando genérico
        return {
            type: 'terminal',
            command: message
        };
    }

    getRandomResponse(type) {
        const responses = this.responses[type];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    extractFileName(message) {
        const words = message.split(' ');
        for (let word of words) {
            if (word.includes('.')) {
                return word;
            }
        }
        return null;
    }
}

// Exportar para uso en HTML
if (typeof module !== 'undefined') {
    module.exports = SandraChatAI;
}