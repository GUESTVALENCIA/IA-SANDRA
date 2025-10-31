/*
 * Orchestrator Bridge for Sandra IA Mobile
 *
 * Este módulo proporciona una función unificada para enviar mensajes de chat desde el cliente móvil
 * al backend orquestador de Sandra IA. Gestiona autenticación, reintentos y manejo de errores.
 * Para usarlo, importa la función y llama a sendMessage(mensaje, contexto).
 */

const API_BASE = 'https://sandra.guestsvalencia.es/api'; // Sustituye con la URL de tu backend

export async function sendMessage(message, context = {}) {
  // Construye el payload siguiendo el formato esperado por tu orquestador
  const payload = {
    prompt: message,
    context: {
      sessionId: context.sessionId || null,
      userId: context.userId || null,
      locale: 'es-ES',
      device: 'mobile'
    }
  };

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    // Esperamos que el resultado tenga { response: string, actions?: [] }
    return result;
  } catch (error) {
    console.error('Error al llamar al orquestador:', error);
    return { error: error.message };
  }
}
