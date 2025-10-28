require('dotenv').config();
const anthropic = require('../config/anthropic-client');
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';

class CodeAgent {
    constructor() {
        this.anthropic = anthropic;
    }

    async activate() {
        // DEBUG: imprimir modelo usado y si la clave está presente (no imprimir la clave)
        console.log(`DEBUG: usando modelo="${MODEL}", ANTHROPIC_API_KEY set=${!!process.env.ANTHROPIC_API_KEY}`);
        // Fin DEBUG
        try {
            const message = await this.anthropic.messages.create({
                model: MODEL,
                max_tokens: 1024,
                messages: [{
                    role: "user",
                    content: "Confirma que estás activo y listo para ayudar con tareas de programación."
                }]
            });

            console.log('Agente de código activado con Anthropic API');
            return true;
        } catch (error) {
            console.error('Error al activar el agente de código:', error.message);
            throw error;
        }
    }

    async executeTask(task) {
        try {
            const message = await this.anthropic.messages.create({
                model: MODEL,
                max_tokens: 4096,
                messages: [{
                    role: "user",
                    content: task
                }]
            });

            return message.content;
        } catch (error) {
            console.error('Error al ejecutar la tarea:', error.message);
            throw error;
        }
    }
}

module.exports = new CodeAgent();