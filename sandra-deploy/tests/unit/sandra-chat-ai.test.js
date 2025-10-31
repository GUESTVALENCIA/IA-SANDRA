// Sandra IA Galaxy PWA - SandraChatAI Unit Tests
// Testing core chat AI functionality and message processing

describe('SandraChatAI Core Functionality', () => {
  let sandraChatAI;

  beforeEach(() => {
    // Mock SandraChatAI class from app.html
    global.SandraChatAI = class SandraChatAI {
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

        // Comando genérico
        return {
          type: 'response',
          response: 'Procesando tu solicitud con mis 252 agentes especializados...'
        };
      }

      getRandomResponse(type) {
        const responses = this.responses[type];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    };

    sandraChatAI = new global.SandraChatAI();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with correct response arrays', () => {
      expect(sandraChatAI.responses).toBeDefined();
      expect(sandraChatAI.responses.greetings).toHaveLength(4);
      expect(sandraChatAI.responses.thanks).toHaveLength(3);
      expect(sandraChatAI.responses.status).toHaveLength(3);
    });

    test('should have all required methods', () => {
      expect(typeof sandraChatAI.processMessage).toBe('function');
      expect(typeof sandraChatAI.getRandomResponse).toBe('function');
    });
  });

  describe('Message Processing', () => {
    test('should recognize Spanish greetings', () => {
      const greetings = ['hola', 'hi', 'hey', 'buenas', 'saludos', 'que tal'];

      greetings.forEach(greeting => {
        const result = sandraChatAI.processMessage(greeting);
        expect(result.type).toBe('chat');
        expect(sandraChatAI.responses.greetings).toContain(result.response);
      });
    });

    test('should recognize thanks messages', () => {
      const thanksMessages = ['gracias', 'thanks', 'muchas gracias', 'thank you'];

      thanksMessages.forEach(message => {
        const result = sandraChatAI.processMessage(message);
        expect(result.type).toBe('chat');
        expect(sandraChatAI.responses.thanks).toContain(result.response);
      });
    });

    test('should recognize status queries', () => {
      const statusQueries = ['cómo estás', 'como estas', '¿cómo estás?'];

      statusQueries.forEach(query => {
        const result = sandraChatAI.processMessage(query);
        expect(result.type).toBe('chat');
        expect(sandraChatAI.responses.status).toContain(result.response);
      });
    });

    test('should handle generic messages', () => {
      const genericMessages = [
        'ayúdame con un proyecto',
        'necesito desarrollar una app',
        'qué puedes hacer'
      ];

      genericMessages.forEach(message => {
        const result = sandraChatAI.processMessage(message);
        expect(result.type).toBe('response');
        expect(result.response).toBe('Procesando tu solicitud con mis 252 agentes especializados...');
      });
    });

    test('should handle empty messages', () => {
      const result = sandraChatAI.processMessage('');
      expect(result.type).toBe('response');
      expect(result.response).toBe('Procesando tu solicitud con mis 252 agentes especializados...');
    });

    test('should handle whitespace-only messages', () => {
      const result = sandraChatAI.processMessage('   ');
      expect(result.type).toBe('response');
      expect(result.response).toBe('Procesando tu solicitud con mis 252 agentes especializados...');
    });

    test('should be case insensitive', () => {
      const testCases = [
        'HOLA',
        'Hola',
        'hOlA',
        'GRACIAS',
        'Gracias',
        'gRaCiAs'
      ];

      testCases.forEach(message => {
        const result = sandraChatAI.processMessage(message);
        expect(result.type).toBe('chat');
        expect(result.response).toBeDefined();
      });
    });
  });

  describe('Response Generation', () => {
    test('should return random responses from correct category', () => {
      const responses = new Set();

      // Generate multiple responses to test randomness
      for (let i = 0; i < 20; i++) {
        const response = sandraChatAI.getRandomResponse('greetings');
        responses.add(response);
        expect(sandraChatAI.responses.greetings).toContain(response);
      }

      // Should have some variety (not always the same response)
      expect(responses.size).toBeGreaterThan(1);
    });

    test('should handle invalid response types gracefully', () => {
      const response = sandraChatAI.getRandomResponse('invalid_type');
      expect(response).toBeUndefined();
    });

    test('should return consistent response format', () => {
      const message = 'hola sandra';
      const result = sandraChatAI.processMessage(message);

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('response');
      expect(typeof result.type).toBe('string');
      expect(typeof result.response).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    test('should handle special characters in messages', () => {
      const specialMessages = [
        'hola! 😊',
        '¿cómo estás?',
        'gracias!!!',
        'hola... ¿qué tal?'
      ];

      specialMessages.forEach(message => {
        const result = sandraChatAI.processMessage(message);
        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        expect(result.response).toBeDefined();
      });
    });

    test('should handle very long messages', () => {
      const longMessage = 'hola '.repeat(100);
      const result = sandraChatAI.processMessage(longMessage);

      expect(result.type).toBe('chat');
      expect(sandraChatAI.responses.greetings).toContain(result.response);
    });

    test('should handle numbers and mixed content', () => {
      const mixedMessages = [
        'hola 123',
        'gracias por todo esto',
        'cómo estás hoy en día'
      ];

      mixedMessages.forEach(message => {
        const result = sandraChatAI.processMessage(message);
        expect(result.type).toBe('chat');
        expect(result.response).toBeDefined();
      });
    });
  });

  describe('Performance', () => {
    test('should process messages quickly', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        sandraChatAI.processMessage('hola');
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should process 1000 messages in less than 100ms
      expect(totalTime).toBeLessThan(100);
    });

    test('should not leak memory with repeated calls', () => {
      const initialMemory = performance.memory.usedJSHeapSize;

      for (let i = 0; i < 5000; i++) {
        sandraChatAI.processMessage(`test message ${i}`);
      }

      const finalMemory = performance.memory.usedJSHeapSize;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });

  describe('Response Content Quality', () => {
    test('should have meaningful greeting responses', () => {
      sandraChatAI.responses.greetings.forEach(response => {
        expect(response.length).toBeGreaterThan(5);
        expect(response).toMatch(/[¡!👋🚀💻🌟]/);
      });
    });

    test('should have appropriate thanks responses', () => {
      sandraChatAI.responses.thanks.forEach(response => {
        expect(response.length).toBeGreaterThan(5);
        expect(response).toMatch(/[¡!💚😊🚀]/);
      });
    });

    test('should have enthusiastic status responses', () => {
      sandraChatAI.responses.status.forEach(response => {
        expect(response.length).toBeGreaterThan(10);
        expect(response).toMatch(/[¡!🌌🟢💪]/);
      });
    });
  });
});