import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Exportar el server para que setupTests.js lo inicie
export const server = setupServer(...handlers);
