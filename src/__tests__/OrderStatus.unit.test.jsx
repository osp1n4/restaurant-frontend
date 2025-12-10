

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import OrderStatus from '../components/OrderStatus';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Mock de useParams para devolver siempre orderId
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ orderId: '123' }),
}));

// Mocks básicos para API y hooks
jest.mock('../services/api', () => ({
  getOrderStatus: jest.fn(),
  cancelOrder: jest.fn(),
}));
jest.mock('../hooks/useNotification', () => ({
  useNotifications: jest.fn(),
}));

// Mock para i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key, opts) => key }),
}));

// Plantilla de casos unitarios TDD

describe('OrderStatus - unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../services/api').getOrderStatus.mockResolvedValue({
      id: '123',
      status: 'pending',
      orderNumber: '007',
      customerName: 'Test',
      items: [{ name: 'Pizza', quantity: 1 }],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      user: { displayName: 'Test User' },
    });
  });

  it('muestra mensaje de error si falla la carga del pedido', async () => {
    require('../services/api').getOrderStatus.mockRejectedValueOnce(new Error('Error de red'));
    render(
      <MemoryRouter initialEntries={['/order/123']}>
        <OrderStatus />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/orderStatus.error/i)).toBeInTheDocument());
    expect(screen.getByText(/Error de red/i)).toBeInTheDocument();
  });

  it('muestra mensaje de no encontrado si el pedido es null', async () => {
    require('../services/api').getOrderStatus.mockResolvedValueOnce(null);
    render(
      <MemoryRouter initialEntries={['/order/123']}>
        <OrderStatus />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/orderStatus.notFound/i)).toBeInTheDocument());
  });
  it('abre y cierra todos los modales correctamente', async () => {
    require('../services/api').getOrderStatus.mockResolvedValueOnce({
      id: '123',
      status: 'pending',
      orderNumber: '007',
      customerName: 'Test',
      items: [{ name: 'Pizza', quantity: 1 }],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      user: { displayName: 'Test User' },
    });
    render(
      <MemoryRouter initialEntries={[`/order/123`]}>
        <AuthProvider>
          <OrderStatus />
        </AuthProvider>
      </MemoryRouter>
    );
    // Espera a que el botón principal esté en el DOM y haz clic
    const cancelBtn = await screen.findByRole('button', { name: 'orderStatus.cancelOrder' });
    fireEvent.click(cancelBtn);
    // Espera a que el botón de confirmación esté en el modal (usa la key i18n)
    expect(await screen.findByRole('button', { name: /orderCancelModal.cancelOrder/i })).toBeInTheDocument();
    // Cierra el modal usando el botón de mantener pedido (usa la key i18n)
    const closeBtn = await screen.findByRole('button', { name: /orderCancelModal.keepOrder/i });
    fireEvent.click(closeBtn);
    // El modal debe cerrarse
    expect(screen.queryByText('orderCancelModal.title')).not.toBeInTheDocument();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza estado de carga', () => {
    render(
      <MemoryRouter initialEntries={['/order/123']}>
        <OrderStatus />
      </MemoryRouter>
    );
    expect(screen.getByText(/orderStatus.loading/i)).toBeInTheDocument();
  });


  it('renderiza estado pending y botón cancelar', async () => {
    const order = {
      status: 'pending',
      customerName: 'Test',
      items: [],
    };
    require('../services/api').getOrderStatus.mockResolvedValueOnce(order);
    render(
      <MemoryRouter initialEntries={['/order/123']}>
        <OrderStatus />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/orderStatus.stepPreparing/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /orderStatus.cancelOrder/i })).toBeInTheDocument();
  });

  it('renderiza estado ready y muestra mensaje', async () => {
    const order = {
      status: 'ready',
      orderNumber: '003',
      customerName: 'Test',
      items: [],
    };
    require('../services/api').getOrderStatus.mockResolvedValueOnce(order);
    render(
      <MemoryRouter initialEntries={['/order/123']}>
        <OrderStatus />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/orderStatus.infoReady/i)).toBeInTheDocument());
  });

  it('renderiza estado delivered y muestra mensaje', async () => {
    const order = {
      status: 'delivered',
      orderNumber: '004',
      customerName: 'Test',
      items: [],
    };
    require('../services/api').getOrderStatus.mockResolvedValueOnce(order);
    render(
      <MemoryRouter initialEntries={['/order/123']}>
        <OrderStatus />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/orderStatus.infoDelivered/i)).toBeInTheDocument());
  });

  it('renderiza estado cancelled y mensaje', async () => {
    const order = {
      status: 'cancelled',
      orderNumber: '005',
      customerName: 'Test',
      items: [],
    };
    require('../services/api').getOrderStatus.mockResolvedValueOnce(order);
    render(
      <MemoryRouter initialEntries={['/order/123']}>
        <OrderStatus />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/orderStatus.cancelledTitle/i)).toBeInTheDocument());
  });

  it('cubre getItemIcon mostrando los iconos en el DOM', async () => {
    const items = [
      { name: 'Hamburguesa', quantity: 1, price: 10 },
      { name: 'Papas fritas', quantity: 1, price: 5 },
      { name: 'Bebida', quantity: 1, price: 3 },
      { name: 'Pizza', quantity: 1, price: 8 },
      { name: 'Ensalada', quantity: 1, price: 6 },
      { name: 'Otro', quantity: 1, price: 2 },
    ];
    const order = {
      status: 'ready',
      orderNumber: '006',
      customerName: 'Test',
      items,
    };
    require('../services/api').getOrderStatus.mockResolvedValueOnce(order);
    render(
      <MemoryRouter initialEntries={['/order/123']}>
        <OrderStatus />
      </MemoryRouter>
    );
    // Espera a que desaparezca el loading
    await waitFor(() => expect(screen.queryByText(/orderStatus.loading/i)).not.toBeInTheDocument());
    // Espera a que se rendericen los items
    for (const item of items) {
      expect(screen.getAllByText(new RegExp(item.name, 'i')).length).toBeGreaterThan(0);
    }
    // Espera a que se rendericen los iconos de material-icons
    const expectedIcons = [
      'lunch_dining',
      'bakery_dining',
      'local_cafe',
      'local_pizza',
      'restaurant',
      'restaurant_menu',
    ];
    for (const icon of expectedIcons) {
      expect(screen.getAllByText(icon).length).toBeGreaterThan(0);
    }
  });
});

// Tests unitarios para handleNotification y useNotifications

describe('OrderStatus - notificaciones SSE (FIRST)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    let notified = false;
    require('../hooks/useNotification').useNotifications.mockImplementation((cb) => {
      if (notified) return;
      notified = true;
      const testName = expect.getState().currentTestName || '';
      if (testName.includes('preparación')) {
        cb({ eventType: 'order.preparing', orderId: '123' });
      } else if (testName.includes('listo')) {
        cb({ eventType: 'order.ready', orderId: '123' });
      } else if (testName.includes('cancelled')) {
        cb({ eventType: 'order.cancelled', orderId: '123' });
      } else if (testName.includes('desconocido')) {
        cb({ eventType: 'otro.evento', orderId: '123' });
      }
    });
  });

  function setupOrderStatusWithMockedOrder(status, nextStatus) {
    const order = {
      status,
      orderNumber: '001',
      customerName: 'Test',
      items: [{ name: 'Hamburguesa', quantity: 1, price: 10 }],
      _id: '123',
      orderId: '123',
    };
    let call = 0;
    require('../services/api').getOrderStatus.mockImplementation(() => {
      call++;
      if (call === 1) return Promise.resolve(order);
      if (call === 2 && nextStatus) return Promise.resolve({ ...order, status: nextStatus });
      return Promise.resolve(order);
    });
    act(() => {
      render(
        <AuthProvider>
          <MemoryRouter initialEntries={['/order/123']}>
            <OrderStatus />
          </MemoryRouter>
        </AuthProvider>
      );
    });
    return order;
  }

  it('muestra modal de preparación al recibir order.preparing', async () => {
    setupOrderStatusWithMockedOrder('pending', 'cooking');
    expect(await screen.findByText(/orderStatus.preparingTitle/i)).toBeInTheDocument();
  });

  it('muestra modal de listo al recibir order.ready', async () => {
    setupOrderStatusWithMockedOrder('cooking', 'ready');
    expect(await screen.findByText(/orderStatus.readyTitle/i)).toBeInTheDocument();
  });

  it('actualiza estado al recibir order.cancelled (sin modal)', async () => {
    setupOrderStatusWithMockedOrder('ready', 'cancelled');
    expect(screen.queryByText(/orderStatus.preparingTitle/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/orderStatus.readyTitle/i)).not.toBeInTheDocument();
  });

  it('ignora notificaciones de tipo desconocido', async () => {
    setupOrderStatusWithMockedOrder('pending');
    expect(screen.queryByText(/orderStatus.preparingTitle/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/orderStatus.readyTitle/i)).not.toBeInTheDocument();
  });
});

// Agrega los mocks y casos específicos según la lógica de OrderStatus.jsx
// Completa cada test para cubrir todos los flujos y ramas
// FIRST: Fast, Independent, Repeatable, Self-validating, Timely
