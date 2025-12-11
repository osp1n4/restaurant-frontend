// Mock para import.meta.env en Jest
export const env = {
  VITE_API_URL: 'http://localhost:3000',
  VITE_NOTIFICATION_URL: 'http://localhost:4000',
  // Agrega aquí otras variables necesarias para los tests
};

export const meta = { env };

// Para usarlo en los tests:
// jest.mock('import.meta', () => require('../__mocks__/importMetaEnv'));
