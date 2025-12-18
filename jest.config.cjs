module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.(test|spec).{js,jsx}', '**/?(*.)+(test|spec).{js,jsx}'],
  // Permite transformar dependencias modernas de node_modules si es necesario
  transformIgnorePatterns: [
    '/node_modules/(?!(react|react-dom|@testing-library|@babel|lodash-es)/)'
  ],
  // Configuración de jsdom para simular mejor el entorno del navegador
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    customExportConditions: ['node', 'node-addons'],
  },
  // Timeout más largo para tests asíncronos
  testTimeout: 20000,
  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/**/*.test.{js,jsx}',
    '!src/__tests__/**',
    '!src/tests/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
