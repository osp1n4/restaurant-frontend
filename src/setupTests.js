import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Polyfill para TextEncoder / TextDecoder usado por algunas dependencias (react-router, etc.)
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Mock mínimo para EventSource en entorno de Node/Jest
if (typeof global.EventSource === 'undefined') {
  class MockEventSource {
    constructor(url) {
      this.url = url;
      this.onopen = null;
      this.onmessage = null;
      this.onerror = null;
      this.readyState = 0;
    }
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }
  global.EventSource = MockEventSource;
}

// ===============================================
// MOCK COMPLETO DE FIREBASE
// ===============================================
// Este mock previene que Firebase intente acceder al DOM real
// y evita errores de "Cannot read properties of undefined"

// Mock de Firebase Analytics
jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(),
  isSupported: jest.fn(() => Promise.resolve(true)),
}));

// Mock de Firebase Auth
const mockUser = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  getIdToken: jest.fn(() => Promise.resolve('mock-token')),
  getIdTokenResult: jest.fn(() => Promise.resolve({
    token: 'mock-token',
    claims: { role: 'admin' }
  })),
};

const mockAuth = {
  currentUser: mockUser,
  onAuthStateChanged: jest.fn((callback) => {
    callback(mockUser);
    return jest.fn(); // unsubscribe function
  }),
  signOut: jest.fn(() => Promise.resolve()),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: mockUser })),
};

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(mockUser);
    return jest.fn();
  }),
  signOut: jest.fn(() => Promise.resolve()),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: mockUser })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: mockUser })),
  updateProfile: jest.fn(() => Promise.resolve()),
}));

// Mock de Firebase App
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({
    name: 'test-app',
    options: {},
  })),
  getApp: jest.fn(() => ({
    name: 'test-app',
    options: {},
  })),
  getApps: jest.fn(() => []),
}));

// ===============================================
// MOCK DE I18N PARA TESTS
// ===============================================
// Mockear react-i18next para evitar warnings y simplificar tests
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key, // Retorna la key directamente
    i18n: {
      changeLanguage: jest.fn(() => Promise.resolve()),
      language: 'es',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
  Trans: ({ children }) => children,
}));

// Iniciar MSW server (handlers por defecto)
import { server } from './tests/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
  // Suprimir warnings de Firebase en tests
  const originalWarn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((message, ...args) => {
    if (typeof message === 'string' && message.includes('@firebase')) {
      return; // Ignorar warnings de Firebase
    }
    originalWarn(message, ...args); // Usar la función original
  });
});

afterEach(() => {
  server.resetHandlers();
  // Limpiar localStorage entre tests
  localStorage.clear();
});

afterAll(() => {
  server.close();
  jest.restoreAllMocks();
});
