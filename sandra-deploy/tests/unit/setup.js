// Sandra IA Galaxy PWA - Unit Test Setup
// Jest testing environment configuration

import '@testing-library/jest-dom';

// Mock global objects and APIs for testing environment
global.fetch = jest.fn();
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1
}));

// Mock Web Speech API
global.SpeechRecognition = jest.fn(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  continuous: true,
  interimResults: true,
  lang: 'es-ES'
}));

global.webkitSpeechRecognition = global.SpeechRecognition;

global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => [
    { name: 'Spanish Voice', lang: 'es-ES' },
    { name: 'English Voice', lang: 'en-US' }
  ]),
  addEventListener: jest.fn()
};

global.SpeechSynthesisUtterance = jest.fn(() => ({
  text: '',
  voice: null,
  rate: 1,
  pitch: 1,
  volume: 1,
  addEventListener: jest.fn()
}));

// Mock Audio Context for barge-in detection
global.AudioContext = jest.fn(() => ({
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn()
  })),
  createAnalyser: jest.fn(() => ({
    fftSize: 256,
    frequencyBinCount: 128,
    getByteFrequencyData: jest.fn(),
    connect: jest.fn()
  })),
  close: jest.fn(),
  state: 'running'
}));

global.webkitAudioContext = global.AudioContext;

// Mock MediaDevices for microphone access
global.navigator.mediaDevices = {
  getUserMedia: jest.fn(() => Promise.resolve({
    getTracks: () => [{ stop: jest.fn() }]
  })),
  enumerateDevices: jest.fn(() => Promise.resolve([])),
  getDisplayMedia: jest.fn(() => Promise.resolve({
    getTracks: () => [{ stop: jest.fn() }]
  }))
};

// Mock navigator.vibrate for haptic feedback
global.navigator.vibrate = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
global.sessionStorage = localStorageMock;

// Mock performance API
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 20, // 20MB
    totalJSHeapSize: 1024 * 1024 * 50, // 50MB
    jsHeapSizeLimit: 1024 * 1024 * 100 // 100MB
  },
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => [])
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock MutationObserver
global.MutationObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn()
}));

// Mock URL for dynamic imports
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Console error handler for cleaner test output
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to trigger DOM events
  triggerEvent: (element, eventType, options = {}) => {
    const event = new Event(eventType, { bubbles: true, ...options });
    element.dispatchEvent(event);
    return event;
  },

  // Helper to create mock DOM elements
  createElement: (tag, attributes = {}, content = '') => {
    const element = document.createElement(tag);
    Object.assign(element, attributes);
    if (content) element.innerHTML = content;
    return element;
  },

  // Helper to mock network responses
  mockFetch: (response, status = 200) => {
    global.fetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => response,
      text: async () => JSON.stringify(response)
    });
  },

  // Helper to mock WebSocket messages
  mockWebSocketMessage: (ws, data) => {
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(data)
    });
    ws.onmessage?.(messageEvent);
  }
};

// Set up DOM environment
document.body.innerHTML = `
  <div class="header">
    <div class="logo">🤖 Sandra IA</div>
    <div class="status">Galaxy Level Online</div>
  </div>
  <div class="main-app">
    <div class="features-panel">
      <div class="features-grid">
        <div class="feature-btn" onclick="startFeature('dev')">💻<br>Dev</div>
        <div class="feature-btn" onclick="startFeature('marketing')">📈<br>Marketing</div>
        <div class="feature-btn" onclick="startFeature('design')">🎨<br>Design</div>
        <div class="feature-btn" onclick="startFeature('finance')">💰<br>Finance</div>
        <div class="feature-btn" onclick="startFeature('voice')">🎤<br>Voice</div>
        <div class="feature-btn" onclick="startFeature('vision')">👁️<br>Vision</div>
      </div>
      <div class="agents-counter">252 Agentes IA Activos • 95.4% Eficiencia</div>
    </div>
    <div class="chat-container">
      <div class="chat-messages" id="chatMessages">
        <div class="message sandra">
          ¡Hola! 👋 Soy Sandra IA Galaxy Level. Tengo 252 agentes especializados listos para ayudarte. ¿En qué puedo asistirte hoy?
        </div>
      </div>
      <div class="input-area">
        <input type="text" class="chat-input" id="chatInput" placeholder="Escribe tu mensaje...">
        <button class="voice-btn" id="voiceBtn" onclick="toggleVoice()">🎤</button>
        <button class="send-btn" onclick="sendMessage()">➤</button>
      </div>
    </div>
  </div>
`;

// Jest configuration
jest.setTimeout(10000);

// Suppress specific warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('Warning:') &&
      args[0]?.includes?.('componentWillReceiveProps')) {
    return;
  }
  originalWarn.apply(console, args);
};