// Mock de Firebase Auth para tests
export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    // Simular que no hay usuario autenticado por defecto
    callback(null);
    return jest.fn(); // unsubscribe function
  }),
};
