/*
 * Ejemplo de integración del puente al orquestador en la PWA móvil de Sandra IA.
 * Este script muestra cómo enviar mensajes del usuario al orquestador y actualizar la interfaz.
 */

import { sendMessage } from './orchestrator-bridge.js';

const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const messagesContainer = document.getElementById('messages');

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  // Muestra el mensaje del usuario en la interfaz
  appendMessage('user', text);
  chatInput.value = '';

  // Envía al orquestador
  const result = await sendMessage(text);
  if (result.error) {
    appendMessage('system', `Error: ${result.error}`);
  } else {
    appendMessage('assistant', result.response);
    // Si hay acciones, maneja las acciones aquí...
  }
});

function appendMessage(role, text) {
  const msgEl = document.createElement('div');
  msgEl.className = `msg ${role}`;
  msgEl.textContent = text;
  messagesContainer.appendChild(msgEl);
}
