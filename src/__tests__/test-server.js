import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const handlers = [
  // Handlers por defecto (se pueden sobrescribir en tests con server.use)
  rest.get('http://localhost:3000/orders/:orderId', (req, res, ctx) => {
    const { orderId } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        orderId,
        orderNumber: '0001',
        customerName: 'MSW',
        status: 'pending',
        items: [],
        createdAt: new Date().toISOString()
      })
    );
  }),

  rest.post('http://localhost:3000/orders/:orderId/cancel', (req, res, ctx) => {
    const { orderId } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        orderId,
        orderNumber: '0001',
        customerName: 'MSW',
        status: 'cancelled',
        items: [],
        createdAt: new Date().toISOString()
      })
    );
  })
];

export const server = setupServer(...handlers);
