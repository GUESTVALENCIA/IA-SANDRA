/**
 * AI Commands - Script opcional para comandos /ai en el chat
 * 
 * USO:
 * 1. En la consola DevTools, ejecuta: window.AI_COMMANDS = true;
 * 2. Recarga la página (Ctrl+R)
 * 3. Escribe en el chat: /ai openai gpt-4.0 Hola
 * 
 * Este script NO se carga automáticamente para no romper la app estable.
 */

(function() {
  'use strict';

  // Solo se ejecuta si window.AI_COMMANDS === true
  if (typeof window === 'undefined' || window.AI_COMMANDS !== true) {
    console.log('[AI Commands] No activado. Ejecuta: window.AI_COMMANDS = true;');
    return;
  }

  console.log('[AI Commands] ✅ Activado');

  // Esperar a que el DOM esté listo
  function init() {
    // Buscar el input del chat
    const messageInput = document.getElementById('message-input') || 
                         document.querySelector('input[type="text"]') ||
                         document.querySelector('textarea');
    
    const sendBtn = document.getElementById('send-btn') || 
                    document.querySelector('button[type="submit"]') ||
                    document.querySelector('button');

    if (!messageInput) {
      console.warn('[AI Commands] No se encontró el input del chat. Reintentando en 1s...');
      setTimeout(init, 1000);
      return;
    }

    console.log('[AI Commands] ✅ Input encontrado');

    // Función para añadir mensaje al chat (buscar función existente o crear una simple)
    function addMessage(text, sender = 'assistant') {
      const messagesContainer = document.getElementById('messages') || 
                                document.querySelector('.messages') ||
                                document.querySelector('main');
      
      if (!messagesContainer) {
        console.warn('[AI Commands] No se encontró contenedor de mensajes');
        return;
      }

      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${sender}`;
      messageDiv.style.cssText = `
        padding: 10px;
        margin: 8px 0;
        border-radius: 8px;
        background: ${sender === 'user' ? '#0ea5a4' : '#071120'};
        color: ${sender === 'user' ? '#042026' : '#e6eef6'};
        max-width: 80%;
        word-wrap: break-word;
      `;
      messageDiv.textContent = text;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Interceptar envío de mensajes
    const originalSend = messageInput.onkeypress || (() => {});
    
    function handleSend() {
      const message = messageInput.value.trim();
      if (!message) return;

      // Comando: /modelos
      if (message.toLowerCase() === '/modelos' || message.toLowerCase() === '/models') {
        messageInput.value = '';
        addMessage(message, 'user');
        
        if (window.sandraAPI && window.sandraAPI.aiListModels) {
          window.sandraAPI.aiListModels().then(result => {
            if (result.success) {
              let response = '🤖 **MODELOS DISPONIBLES**\n\n';
              
              if (result.models.openai && result.models.openai.length > 0) {
                response += '**OpenAI:**\n';
                result.models.openai.forEach(m => {
                  response += `  • ${m.alias} → ${m.apiModel}\n    ${m.description}\n\n`;
                });
              }
              
              if (result.models.anthropic && result.models.anthropic.length > 0) {
                response += '**Anthropic:**\n';
                result.models.anthropic.forEach(m => {
                  response += `  • ${m.alias} → ${m.apiModel}\n    ${m.description}\n\n`;
                });
              }
              
              response += '\n💡 **Uso:** `/ai <provider> <modelo> <mensaje>`\n';
              response += 'Ejemplo: `/ai openai gpt-4.0 Hola, necesito ayuda`\n';
              response += 'Ejemplo: `/ai anthropic claude-sonnet-4.5 Analiza este sistema`';
              
              addMessage(response, 'assistant');
            } else {
              addMessage('❌ Error: ' + (result.error || 'desconocido'), 'assistant');
            }
          }).catch(err => {
            addMessage('❌ Error obteniendo modelos: ' + err.message, 'assistant');
          });
        } else {
          addMessage('❌ API de modelos no disponible. Verifica que el MCP esté activo.', 'assistant');
        }
        return;
      }

      // Comando: /ai <provider> <model> <mensaje>
      const aiCommandMatch = message.match(/^\/ai\s+(openai|anthropic)\s+([\w\-\.]+)\s+(.+)$/i);
      if (aiCommandMatch) {
        const [, provider, model, userMessage] = aiCommandMatch;
        
        messageInput.value = '';
        addMessage(message, 'user');
        
        if (window.sandraAPI && window.sandraAPI.aiChat) {
          addMessage('⏳ Llamando a ' + provider.toUpperCase() + ' ' + model + '...', 'assistant');
          
          window.sandraAPI.aiChat(provider.toLowerCase(), model, [
            { role: 'user', content: userMessage }
          ]).then(result => {
            if (result.success) {
              addMessage(`🤖 **${provider.toUpperCase()} ${model}**\n\n${result.text}`, 'assistant');
            } else {
              addMessage(`❌ Error: ${result.error}`, 'assistant');
            }
          }).catch(error => {
            addMessage(`❌ Error llamando a ${provider} ${model}: ${error.message}`, 'assistant');
          });
        } else {
          addMessage('❌ API de IA no disponible. Verifica que el MCP esté activo.', 'assistant');
        }
        return;
      }

      // Si no es un comando /ai, dejar que el flujo normal continúe
      // (no interceptamos mensajes normales)
    }

    // Añadir listener al botón de envío
    if (sendBtn) {
      sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleSend();
      });
    }

    // Añadir listener al Enter
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    console.log('[AI Commands] ✅ Listeners instalados');
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

