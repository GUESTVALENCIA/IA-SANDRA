// Script para probar el agente de código
require('dotenv').config();
const codeAgent = require('./agents/code-agent');

async function main() {
    try {
        // Intenta activar el agente
        await codeAgent.activate();
        
        // Realiza una tarea de prueba
        const resultado = await codeAgent.executeTask(
            "Escribe una función simple en JavaScript que sume dos números"
        );
        
        console.log('Resultado de la tarea de prueba:', resultado);
        
    } catch (error) {
        console.error('Error en la prueba del agente:', error);
        process.exit(1);
    }
}

main();