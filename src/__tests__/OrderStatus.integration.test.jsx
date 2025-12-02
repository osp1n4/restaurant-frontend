import React from 'react';
import { rest } from 'msw';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Usar el server MSW global (iniciado por src/setupTests.js)
import { server } from '../tests/server';

import OrderStatus from '../components/OrderStatus';

describe('OrderStatus - integración con MSW (global server)', () => {
  test('flujo: cancelar pedido actualiza UI a "Pedido Cancelado"', async () => {
    render(
      <MemoryRouter initialEntries={['/orders/order-321']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderStatus />} />
        </Routes>
      </MemoryRouter>
    );

    // Esperar a que cargue y muestre botón cancelar
    const cancelBtn = await screen.findByRole('button', { name: /cancelar pedido/i });
    expect(cancelBtn).toBeInTheDocument();

    // Abrir modal y confirmar
    await userEvent.click(cancelBtn);
    const confirmBtn = await screen.findByRole('button', { name: /sí, cancelar/i });
    await userEvent.click(confirmBtn);

    // Esperar a que la UI muestre estado cancelado
    const cancelledHeading = await screen.findByText(/pedido cancelado/i);
    expect(cancelledHeading).toBeInTheDocument();
  });

  test('maneja error 400 del servidor al cancelar', async () => {
    // Sobrescribir handler POST /cancel para devolver 400 con mensaje
    server.use(
      rest.post('http://localhost:3000/orders/:orderId/cancel', (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ message: 'No se puede cancelar: estado no es pending' })
        );
      })
    );

    render(
      <MemoryRouter initialEntries={['/orders/order-321']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderStatus />} />
        </Routes>
      </MemoryRouter>
    );

    const cancelBtn = await screen.findByRole('button', { name: /cancelar pedido/i });
    await userEvent.click(cancelBtn);
    const confirmBtn = await screen.findByRole('button', { name: /sí, cancelar/i });
    await userEvent.click(confirmBtn);

    // Ahora debe aparecer el mensaje de error dentro del modal
    const errNode = await screen.findByText(/no se puede cancelar/i);
    expect(errNode).toBeInTheDocument();
  });
});
