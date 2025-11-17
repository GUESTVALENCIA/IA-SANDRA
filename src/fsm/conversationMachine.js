const { createMachine, assign } = require('xstate');

// Máquina de estados única para todas las conversaciones de Sandra IA.
const conversationMachine = createMachine({
  id: 'sandraConversation',
  initial: 'IDLE',
  context: {
    greeted: false,
    utteranceCount: 0
  },
  states: {
    IDLE: {
      on: {
        WAKE: {
          target: 'GREETING',
          cond: (ctx) => !ctx.greeted,
          actions: assign({ greeted: () => true })
        }
      }
    },
    GREETING: {
      on: {
        GREETING_DONE: 'LISTENING'
      }
    },
    LISTENING: {
      on: {
        VOICE_IN: {
          target: 'THINKING',
          actions: assign({ utteranceCount: (ctx) => ctx.utteranceCount + 1 })
        },
        TIMEOUT: 'IDLE'
      }
    },
    THINKING: {
      on: {
        ANSWER_READY: 'SPEAKING'
      }
    },
    SPEAKING: {
      on: {
        SPEECH_END: 'LISTENING',
        BARGE_IN: 'LISTENING'
      }
    }
  }
});

module.exports = { conversationMachine };

