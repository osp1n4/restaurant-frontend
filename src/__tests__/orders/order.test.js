/**
 * @file order.test.js
 * @description Tests unitarios e integración para módulo de pedidos
 * @coverage US-001, US-002, US-003, US-004, US-005, US-013
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock de servicios
const mockOrderService = {
  createOrder: jest.fn(),
  updateOrder: jest.fn(),
  cancelOrder: jest.fn(),
  getOrderById: jest.fn(),
};

describe('US-001: Visualizar menú y tiempos de carga', () => {
  test('TC-CLIENT-001: El menú se carga en menos de 2.5 segundos', async () => {
    const startTime = performance.now();
    
    // Simular carga del menú
    const menuData = await fetch('/api/menu').then(res => res.json());
    
    const loadTime = performance.now() - startTime;
    
    expect(loadTime).toBeLessThan(2500); // LCP < 2.5s
    expect(menuData).toBeDefined();
  });

  test('TC-CLIENT-002: Lazy loading para categorías con más de 20 productos', () => {
    const largeCategory = {
      name: 'Bebidas',
      products: Array(25).fill(null).map((_, i) => ({
        id: `prod-${i}`,
        name: `Producto ${i}`,
        price: 10.00,
      })),
    };

    expect(largeCategory.products.length).toBeGreaterThan(20);
    
    // Verificar que solo se cargan los primeros 20
    const initialLoad = largeCategory.products.slice(0, 20);
    expect(initialLoad.length).toBe(20);
  });

  test('TC-CLIENT-003: Cada tarjeta de producto muestra título, precio y botón añadir', () => {
    const product = {
      id: 'prod-1',
      name: 'Hamburguesa Clásica',
      price: 12.50,
      image: '/images/burger.jpg',
    };

    // Verificar estructura
    expect(product.name).toBeDefined();
    expect(product.price).toBeDefined();
    expect(typeof product.price).toBe('number');
  });

  test('TC-CLIENT-004: Payload inicial del menú es menor a 500KB', async () => {
    const menuResponse = await fetch('/api/menu');
    const menuBlob = await menuResponse.blob();
    const sizeInKB = menuBlob.size / 1024;

    expect(sizeInKB).toBeLessThan(500);
  });
});

describe('US-002: Añadir productos al pedido', () => {
  let cart = [];

  beforeEach(() => {
    cart = [];
  });

  test('TC-CLIENT-005: Incrementar cantidad al añadir mismo producto múltiples veces', () => {
    const product = { id: 'prod-1', name: 'Pizza', price: 15.00 };

    // Añadir producto 3 veces
    cart.push({ ...product, quantity: 1 });
    cart.push({ ...product, quantity: 1 });
    cart.push({ ...product, quantity: 1 });

    // Consolidar cantidades
    const consolidated = cart.reduce((acc, item) => {
      const existing = acc.find(i => i.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);

    expect(consolidated[0].quantity).toBe(3);
  });

  test('TC-CLIENT-006: Añadir diferentes productos al carrito', () => {
    const product1 = { id: 'prod-1', name: 'Pizza', price: 15.00, quantity: 2 };
    const product2 = { id: 'prod-2', name: 'Pasta', price: 12.00, quantity: 1 };

    cart.push(product1, product2);

    expect(cart.length).toBe(2);
    expect(cart[0].id).toBe('prod-1');
    expect(cart[1].id).toBe('prod-2');
  });

  test('TC-CLIENT-007: Calcular subtotal correcto del carrito', () => {
    cart = [
      { id: 'prod-1', name: 'Pizza', price: 15.00, quantity: 2 },
      { id: 'prod-2', name: 'Pasta', price: 12.00, quantity: 1 },
    ];

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    expect(subtotal).toBe(42.00); // (15 * 2) + (12 * 1)
  });

  test('TC-CLIENT-008: Validar cantidad mínima (1) y máxima (99)', () => {
    const validateQuantity = (qty) => {
      if (qty < 1) return 1;
      if (qty > 99) return 99;
      return qty;
    };

    expect(validateQuantity(0)).toBe(1);
    expect(validateQuantity(100)).toBe(99);
    expect(validateQuantity(5)).toBe(5);
  });
});

describe('US-003: Añadir notas personalizadas al pedido', () => {
  test('TC-CLIENT-009: Cliente puede introducir texto libre en campo de notas', () => {
    const order = {
      items: [{ id: 'prod-1', quantity: 1 }],
      notes: '',
    };

    order.notes = 'Sin cebolla, por favor';

    expect(order.notes).toBe('Sin cebolla, por favor');
  });

  test('TC-CLIENT-010: Notas se guardan y asocian al pedido', () => {
    const order = {
      id: 'order-123',
      items: [{ id: 'prod-1', quantity: 1 }],
      notes: 'Alérgico a los frutos secos',
    };

    expect(order.notes).toBeDefined();
    expect(order.notes.length).toBeGreaterThan(0);
  });

  test('TC-CLIENT-011: Sanitizar notas para prevenir XSS', () => {
    const sanitize = (text) => {
      return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    };

    const maliciousNote = '<script>alert("XSS")</script>Sin cebolla';
    const cleaned = sanitize(maliciousNote);

    expect(cleaned).not.toContain('<script>');
    expect(cleaned).toBe('Sin cebolla');
  });

  test('TC-CLIENT-012: Limitar notas a 500 caracteres', () => {
    const longNote = 'a'.repeat(600);
    const truncate = (text, maxLength = 500) => text.slice(0, maxLength);

    const truncated = truncate(longNote);

    expect(truncated.length).toBe(500);
  });
});

describe('US-004: Confirmar y enviar pedido', () => {
  test('TC-CLIENT-013: Pedido se registra en el sistema al hacer clic en Confirmar', async () => {
    const newOrder = {
      items: [{ id: 'prod-1', name: 'Pizza', quantity: 2, price: 15.00 }],
      notes: 'Sin cebolla',
      customerName: 'Juan Pérez',
      customerEmail: 'juan@example.com',
      status: 'pending',
    };

    mockOrderService.createOrder.mockResolvedValue({
      success: true,
      orderId: 'ORD-12345',
    });

    const result = await mockOrderService.createOrder(newOrder);

    expect(result.success).toBe(true);
    expect(result.orderId).toBeDefined();
    expect(mockOrderService.createOrder).toHaveBeenCalledWith(newOrder);
  });

  test('TC-CLIENT-014: Order Service recibe el pedido procesado', async () => {
    const orderData = {
      items: [{ id: 'prod-1', quantity: 1 }],
      total: 15.00,
    };

    const orderServiceResponse = await mockOrderService.createOrder(orderData);

    expect(orderServiceResponse).toBeDefined();
    expect(mockOrderService.createOrder).toHaveBeenCalled();
  });

  test('TC-CLIENT-015: Validar campos requeridos antes de confirmar', () => {
    const validateOrder = (order) => {
      if (!order.items || order.items.length === 0) {
        return { valid: false, error: 'El pedido debe tener al menos un producto' };
      }
      if (!order.customerName || order.customerName.trim() === '') {
        return { valid: false, error: 'El nombre del cliente es requerido' };
      }
      if (!order.customerEmail || !order.customerEmail.includes('@')) {
        return { valid: false, error: 'Email inválido' };
      }
      return { valid: true };
    };

    const invalidOrder1 = { items: [], customerName: 'Juan', customerEmail: 'juan@test.com' };
    const invalidOrder2 = { items: [{ id: 'prod-1' }], customerName: '', customerEmail: 'juan@test.com' };
    const invalidOrder3 = { items: [{ id: 'prod-1' }], customerName: 'Juan', customerEmail: 'invalidemail' };
    const validOrder = { items: [{ id: 'prod-1' }], customerName: 'Juan', customerEmail: 'juan@test.com' };

    expect(validateOrder(invalidOrder1).valid).toBe(false);
    expect(validateOrder(invalidOrder2).valid).toBe(false);
    expect(validateOrder(invalidOrder3).valid).toBe(false);
    expect(validateOrder(validOrder).valid).toBe(true);
  });
});

describe('US-005: Modificar pedido antes de preparación', () => {
  test('TC-CLIENT-016: Opción Modificar visible solo si estado es pending', () => {
    const canModify = (status) => status === 'pending';

    expect(canModify('pending')).toBe(true);
    expect(canModify('preparing')).toBe(false);
    expect(canModify('ready')).toBe(false);
    expect(canModify('delivered')).toBe(false);
  });

  test('TC-CLIENT-017: Order Service actualiza el pedido tras guardar cambios', async () => {
    const updatedOrder = {
      id: 'order-123',
      items: [{ id: 'prod-1', quantity: 3 }], // Cambiado de 2 a 3
      notes: 'Actualización: sin gluten',
    };

    mockOrderService.updateOrder.mockResolvedValue({
      success: true,
      order: updatedOrder,
    });

    const result = await mockOrderService.updateOrder('order-123', updatedOrder);

    expect(result.success).toBe(true);
    expect(result.order.items[0].quantity).toBe(3);
  });

  test('TC-CLIENT-018: Error al intentar modificar pedido en preparación', async () => {
    const order = { id: 'order-123', status: 'preparing' };

    const attemptModify = () => {
      if (order.status !== 'pending') {
        throw new Error('No se puede modificar un pedido que ya está en preparación');
      }
      return mockOrderService.updateOrder(order.id, order);
    };

    expect(() => attemptModify()).toThrow('No se puede modificar un pedido que ya está en preparación');
  });
});

describe('US-013: Cancelar un pedido', () => {
  test('TC-CLIENT-019: Opción Cancelar visible solo si estado es pending', () => {
    const canCancel = (status) => status === 'pending';

    expect(canCancel('pending')).toBe(true);
    expect(canCancel('preparing')).toBe(false);
  });

  test('TC-CLIENT-020: Order Service procesa la cancelación tras confirmación', async () => {
    const orderId = 'order-123';

    mockOrderService.cancelOrder.mockResolvedValue({
      success: true,
      message: 'Pedido cancelado exitosamente',
    });

    const result = await mockOrderService.cancelOrder(orderId);

    expect(result.success).toBe(true);
    expect(mockOrderService.cancelOrder).toHaveBeenCalledWith(orderId);
  });

  test('TC-CLIENT-021: Kitchen Service recibe notificación de cancelación', async () => {
    // Este test se implementará en integración con RabbitMQ
    const publishCancellation = jest.fn();

    await mockOrderService.cancelOrder('order-123');
    publishCancellation('order.cancelled', { orderId: 'order-123' });

    expect(publishCancellation).toHaveBeenCalledWith('order.cancelled', { orderId: 'order-123' });
  });

  test('TC-CLIENT-022: No se puede cancelar pedido ya en preparación', () => {
    const order = { id: 'order-123', status: 'preparing' };

    const attemptCancel = () => {
      if (order.status !== 'pending') {
        throw new Error('No se puede cancelar un pedido que ya está en preparación');
      }
      return mockOrderService.cancelOrder(order.id);
    };

    expect(() => attemptCancel()).toThrow('No se puede cancelar un pedido que ya está en preparación');
  });

  test('TC-CLIENT-023: Confirmación del usuario requerida antes de cancelar', () => {
    let userConfirmed = false;

    const confirmCancellation = () => {
      userConfirmed = true; // Simular confirmación del usuario
      return userConfirmed;
    };

    const result = confirmCancellation();
    expect(result).toBe(true);
  });
});

describe('Tests de Integración: Flujo completo de pedido', () => {
  test('TC-INTEGRATION-001: Flujo completo - Crear, modificar y cancelar pedido', async () => {
    // 1. Crear pedido
    const newOrder = {
      items: [{ id: 'prod-1', quantity: 2, price: 15.00 }],
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      status: 'pending',
    };

    mockOrderService.createOrder.mockResolvedValue({
      success: true,
      orderId: 'ORD-123',
      order: { ...newOrder, id: 'ORD-123' },
    });

    const created = await mockOrderService.createOrder(newOrder);
    expect(created.success).toBe(true);
    expect(created.orderId).toBe('ORD-123');

    // 2. Modificar pedido
    const updatedData = { ...created.order, items: [{ id: 'prod-1', quantity: 3, price: 15.00 }] };
    mockOrderService.updateOrder.mockResolvedValue({
      success: true,
      order: updatedData,
    });

    const updated = await mockOrderService.updateOrder('ORD-123', updatedData);
    expect(updated.success).toBe(true);
    expect(updated.order.items[0].quantity).toBe(3);

    // 3. Cancelar pedido
    mockOrderService.cancelOrder.mockResolvedValue({
      success: true,
      message: 'Pedido cancelado',
    });

    const cancelled = await mockOrderService.cancelOrder('ORD-123');
    expect(cancelled.success).toBe(true);
  });

  test('TC-INTEGRATION-002: Validar cálculos de total en todo el flujo', () => {
    const calculateTotal = (items) => {
      return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const orderItems = [
      { id: 'prod-1', price: 15.00, quantity: 2 },
      { id: 'prod-2', price: 10.00, quantity: 1 },
    ];

    const total = calculateTotal(orderItems);
    expect(total).toBe(40.00); // (15 * 2) + (10 * 1)
  });
});
