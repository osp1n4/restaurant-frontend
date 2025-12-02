import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock de react-router (useParams + useNavigate)
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ orderId: 'order-123' }),
    useNavigate: () => mockNavigate,
  };
});

// Mocks del servicio API
const mockGetOrderStatus = jest.fn();
const mockCancelOrder = jest.fn();
jest.mock('../services/api', () => ({
  getOrderStatus: (...args) => mockGetOrderStatus(...args),
  cancelOrder: (...args) => mockCancelOrder(...args),
}));

// Componente bajo prueba
import OrderStatus from '../components/OrderStatus';

describe('OrderStatus - unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza botón "Cancelar Pedido" solo cuando status === "pending"', async () => {
    mockGetOrderStatus.mockResolvedValueOnce({
      orderId: 'order-123',
      orderNumber: '0001',
      customerName: 'Test',
      status: 'pending',
      items: [],
      createdAt: new Date().toISOString()
    });

    render(<OrderStatus />);

    const cancelButton = await screen.findByRole('button', { name: /cancelar pedido/i });
    expect(cancelButton).toBeInTheDocument();
  });

  test('al confirmar, llama a cancelOrder con el id correcto y actualiza UI a cancelado', async () => {
    mockGetOrderStatus.mockResolvedValueOnce({
      orderId: 'order-123',
      orderNumber: '0001',
      customerName: 'Test',
      status: 'pending',
      items: [],
      createdAt: new Date().toISOString()
    });

    mockCancelOrder.mockResolvedValueOnce({
      orderId: 'order-123',
      orderNumber: '0001',
      customerName: 'Test',
      status: 'cancelled',
      items: [],
      createdAt: new Date().toISOString()
    });

    render(<OrderStatus />);

    const openCancelBtn = await screen.findByRole('button', { name: /cancelar pedido/i });
    await userEvent.click(openCancelBtn);

    const confirmBtn = await screen.findByRole('button', { name: /sí, cancelar/i });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockCancelOrder).toHaveBeenCalledWith('order-123');
    });

    const cancelledHeading = await screen.findByText(/pedido cancelado/i);
    expect(cancelledHeading).toBeInTheDocument();
  });

  test('muestra error cuando cancelOrder rechaza', async () => {
    mockGetOrderStatus.mockResolvedValueOnce({
      orderId: 'order-123',
      orderNumber: '0001',
      customerName: 'Test',
      status: 'pending',
      items: [],
      createdAt: new Date().toISOString()
    });

    mockCancelOrder.mockRejectedValueOnce(new Error('No se pudo cancelar'));

    render(<OrderStatus />);

    const openCancelBtn = await screen.findByRole('button', { name: /cancelar pedido/i });
    await userEvent.click(openCancelBtn);

    const confirmBtn = await screen.findByRole('button', { name: /sí, cancelar/i });
    await userEvent.click(confirmBtn);

    const errMessage = await screen.findByText(/no se pudo cancelar/i);
    expect(errMessage).toBeInTheDocument();
  });
});
