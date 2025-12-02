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

// Iniciar MSW server (handlers por defecto)
import { server } from './tests/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
