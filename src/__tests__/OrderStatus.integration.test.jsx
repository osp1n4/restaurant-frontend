import { rest } from 'msw';
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Usar el server MSW global (iniciado por src/setupTests.js)
import { server } from '../tests/server';

import OrderStatus from '../components/OrderStatus';

describe('OrderStatus - integración con MSW (global server)', () => {
    test('flujo: cancelar pedido actualiza UI a "Pedido Cancelado"', async () => {
      await act(async () => {
        render(
          <MemoryRouter initialEntries={['/orders/order-321']}>
            <AuthProvider>
              <Routes>
                <Route path="/orders/:orderId" element={<OrderStatus />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        );
      });

      // Esperar a que cargue y se muestre el nombre del producto (indicador de carga completa)
      await waitFor(() => expect(screen.getByText('Cheeseburger')).toBeInTheDocument(), { timeout: 3000 });
      
      // Esperar a que el botón cancelar esté disponible
      const cancelBtn = await screen.findByRole('button', { name: 'orderStatus.cancelOrder' });
      expect(cancelBtn).toBeInTheDocument();

      // Abrir modal y confirmar
      await userEvent.click(cancelBtn);
      const confirmBtn = await screen.findByRole('button', { name: 'orderCancelModal.cancelOrder' });
      await userEvent.click(confirmBtn);

      // Esperar a que la UI muestre estado cancelado
      await waitFor(() => expect(screen.getByText('orderStatus.cancelledTitle')).toBeInTheDocument(), { timeout: 3000 });
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

      await act(async () => {
        render(
          <MemoryRouter initialEntries={['/orders/order-321']}>
            <AuthProvider>
              <Routes>
                <Route path="/orders/:orderId" element={<OrderStatus />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        );
      });

      // Esperar a que cargue completamente
      await waitFor(() => expect(screen.getByText('Cheeseburger')).toBeInTheDocument(), { timeout: 3000 });

      const cancelBtn = await screen.findByRole('button', { name: 'orderStatus.cancelOrder' });
      await userEvent.click(cancelBtn);
      const confirmBtn = await screen.findByRole('button', { name: 'orderCancelModal.cancelOrder' });
      await userEvent.click(confirmBtn);

      // El error debe aparecer en algún lugar del componente (puede ser en el modal o como mensaje)
      await waitFor(() => {
        const errorText = screen.queryByText(/No se puede cancelar/i) || screen.queryByText(/estado no es pending/i);
        expect(errorText).toBeInTheDocument();
      }, { timeout: 3000 });
    });
});
