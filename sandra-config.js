// Sandra DevConsole - Configuración Principal
window.SANDRA_CONFIG = {
    // API Endpoints
    API_BASE: 'https://sandra-ia-galaxy.vercel.app',
    CHAT_ENDPOINT: '/api/chat',
    VOICE_ENDPOINT: '/api/voice',
    
    // OpenAI Config
    OPENAI_API_KEY: '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',
    
    // 18 ROLES ACTIVOS
    ROLES: {
        ADMIN: { name: 'Administrador', icon: '👔', prompt: 'Eres el administrador del sistema...' },
        DEVELOPER: { name: 'Desarrollador', icon: '💻', prompt: 'Eres un desarrollador experto...' },
        DOCTOR: { name: 'Médico', icon: '👨‍⚕️', prompt: 'Eres un médico profesional...' },
        LAWYER: { name: 'Abogado', icon: '⚖️', prompt: 'Eres un abogado experimentado...' },
        TEACHER: { name: 'Profesor', icon: '👨‍🏫', prompt: 'Eres un profesor dedicado...' },
        CHEF: { name: 'Chef', icon: '👨‍🍳', prompt: 'Eres un chef profesional...' },
        PSYCHOLOGIST: { name: 'Psicólogo', icon: '🧠', prompt: 'Eres un psicólogo clínico...' },
        FITNESS: { name: 'Entrenador', icon: '💪', prompt: 'Eres un entrenador personal...' },
        FINANCIAL: { name: 'Financiero', icon: '💰', prompt: 'Eres un asesor financiero...' },
        MARKETING: { name: 'Marketing', icon: '📈', prompt: 'Eres un experto en marketing...' },
        ARTIST: { name: 'Artista', icon: '🎨', prompt: 'Eres un artista creativo...' },
        WRITER: { name: 'Escritor', icon: '✍️', prompt: 'Eres un escritor profesional...' },
        MUSICIAN: { name: 'Músico', icon: '🎵', prompt: 'Eres un músico talentoso...' },
        ENGINEER: { name: 'Ingeniero', icon: '🔧', prompt: 'Eres un ingeniero experto...' },
        SCIENTIST: { name: 'Científico', icon: '🔬', prompt: 'Eres un científico investigador...' },
        DESIGNER: { name: 'Diseñador', icon: '🎨', prompt: 'Eres un diseñador profesional...' },
        CONSULTANT: { name: 'Consultor', icon: '💼', prompt: 'Eres un consultor estratégico...' },
        CEO: { name: 'CEO', icon: '🏢', prompt: 'Eres el CEO de la empresa...' }
    },
    
    // Estado inicial
    currentRole: 'ADMIN',
    
    // Función para cambiar de rol
    changeRole: function(roleKey) {
        this.currentRole = roleKey;
        console.log('Sandra cambió a rol:', this.ROLES[roleKey].name);
        return this.ROLES[roleKey];
    },
    
    // Función para obtener el prompt del rol actual
    getCurrentPrompt: function() {
        return this.ROLES[this.currentRole].prompt;
    },
    
    // Función principal de chat
    sendMessage: async function(message) {
        const role = this.ROLES[this.currentRole];
        
        try {
            const response = await fetch(this.API_BASE + this.CHAT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    message: message,
                    role: this.currentRole,
                    systemPrompt: role.prompt,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) {
                // Fallback local si falla el servidor
                return this.localResponse(message);
            }
            
            const data = await response.json();
            return data.response || data.message || 'Sandra está procesando...';
            
        } catch (error) {
            console.error('Error:', error);
            // Respuesta local si hay error
            return this.localResponse(message);
        }
    },
    
    // Respuesta local (cuando no hay conexión)
    localResponse: function(message) {
        const role = this.ROLES[this.currentRole];
        const responses = {
            ADMIN: 'Como administrador, puedo ayudarte con la gestión del sistema.',
            DEVELOPER: 'Como desarrollador, puedo asistirte con código y programación.',
            DOCTOR: 'Como médico, te recomiendo consultar a un profesional de la salud.',
            LAWYER: 'Como abogado, te sugiero buscar asesoría legal profesional.',
            TEACHER: 'Como profesor, estoy aquí para ayudarte a aprender.',
            CEO: 'Como CEO, mi enfoque está en la estrategia y visión empresarial.'
        };
        
        return responses[this.currentRole] || `[${role.name}] ${message}`;
    },
    
    // Inicialización
    init: function() {
        console.log('🚀 Sandra DevConsole iniciada con 18 roles');
        console.log('Rol actual:', this.ROLES[this.currentRole].name);
        
        // Conectar con la UI
        if (window.initSandraUI) {
            window.initSandraUI(this);
        }
        
        return true;
    }
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.SANDRA_CONFIG.init();
    });
} else {
    window.SANDRA_CONFIG.init();
}
