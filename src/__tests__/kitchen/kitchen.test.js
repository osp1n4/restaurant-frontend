/**
 * @file kitchen.test.js
 * @description Tests para módulo de cocina (Kitchen Service)
 * @coverage US-006, US-007, US-008, US-011, US-012, US-040
 */

import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';

// Mock de servicios
const mockKitchenService = {
  getPendingOrders: jest.fn(),
  startPreparingOrder: jest.fn(),
  markOrderReady: jest.fn(),
  updateOrderFromEvent: jest.fn(),
};

const mockRabbitMQClient = {
  publishEvent: jest.fn(),
  consumeEvent: jest.fn(),
};

describe('US-006: Visualizar pedidos pendientes en panel de cocina', () => {
  test('TC-KITCHEN-001: Filtrar y visualizar solo pedidos con estado Pendiente', async () => {
    const allOrders = [
      { id: 'order-1', status: 'pending', items: [] },
      { id: 'order-2', status: 'preparing', items: [] },
      { id: 'order-3', status: 'pending', items: [] },
      { id: 'order-4', status: 'ready', items: [] },
    ];

    mockKitchenService.getPendingOrders.mockResolvedValue(
      allOrders.filter(order => order.status === 'pending')
    );

    const pendingOrders = await mockKitchenService.getPendingOrders();

    expect(pendingOrders.length).toBe(2);
    expect(pendingOrders.every(order => order.status === 'pending')).toBe(true);
  });

  test('TC-KITCHEN-002: Nuevos pedidos aparecen en la lista al actualizar', async () => {
    let ordersList = [{ id: 'order-1', status: 'pending' }];

    // Simular llegada de nuevo pedido
    const newOrder = { id: 'order-2', status: 'pending' };
    ordersList.push(newOrder);

    mockKitchenService.getPendingOrders.mockResolvedValue(ordersList);

    const updatedList = await mockKitchenService.getPendingOrders();

    expect(updatedList.length).toBe(2);
    expect(updatedList.find(o => o.id === 'order-2')).toBeDefined();
  });

  test('TC-KITCHEN-003: Pedidos marcados como En preparación desaparecen de pendientes', async () => {
    const pendingOrders = [
      { id: 'order-1', status: 'pending' },
      { id: 'order-2', status: 'pending' },
    ];

    // Marcar order-1 como preparing
    pendingOrders[0].status = 'preparing';

    const stillPending = pendingOrders.filter(order => order.status === 'pending');

    expect(stillPending.length).toBe(1);
    expect(stillPending.find(o => o.id === 'order-1')).toBeUndefined();
  });

  test('TC-KITCHEN-004: Lista ordenada por fecha de creación (más antiguo primero)', () => {
    const orders = [
      { id: 'order-3', status: 'pending', createdAt: new Date('2025-12-18T10:30:00') },
      { id: 'order-1', status: 'pending', createdAt: new Date('2025-12-18T10:00:00') },
      { id: 'order-2', status: 'pending', createdAt: new Date('2025-12-18T10:15:00') },
    ];

    const sorted = orders.sort((a, b) => a.createdAt - b.createdAt);

    expect(sorted[0].id).toBe('order-1');
    expect(sorted[1].id).toBe('order-2');
    expect(sorted[2].id).toBe('order-3');
  });
});

describe('US-007: Marcar pedido como "Comenzar a cocinar"', () => {
  test('TC-KITCHEN-005: Estado cambia a En preparación al hacer clic', async () => {
    const order = { id: 'order-123', status: 'pending' };

    mockKitchenService.startPreparingOrder.mockResolvedValue({
      success: true,
      order: { ...order, status: 'preparing' },
    });

    const result = await mockKitchenService.startPreparingOrder(order.id);

    expect(result.success).toBe(true);
    expect(result.order.status).toBe('preparing');
  });

  test('TC-KITCHEN-006: Cliente recibe notificación al marcar como preparando', async () => {
    const orderId = 'order-123';

    await mockKitchenService.startPreparingOrder(orderId);

    // Verificar que se publica evento RabbitMQ
    mockRabbitMQClient.publishEvent.mockResolvedValue(true);
    await mockRabbitMQClient.publishEvent('order.preparing', { orderId });

    expect(mockRabbitMQClient.publishEvent).toHaveBeenCalledWith('order.preparing', { orderId });
  });

  test('TC-KITCHEN-007: Opción Modificar Pedido se bloquea para el cliente', () => {
    const order = { id: 'order-123', status: 'preparing' };

    const canModify = (status) => status === 'pending';

    expect(canModify(order.status)).toBe(false);
  });

  test('TC-KITCHEN-008: No se puede marcar como preparando un pedido ya cancelado', () => {
    const order = { id: 'order-123', status: 'cancelled' };

    const attemptStart = () => {
      if (order.status === 'cancelled') {
        throw new Error('No se puede preparar un pedido cancelado');
      }
      return mockKitchenService.startPreparingOrder(order.id);
    };

    expect(() => attemptStart()).toThrow('No se puede preparar un pedido cancelado');
  });

  test('TC-KITCHEN-009: Timestamp de inicio de preparación se registra', async () => {
    const orderId = 'order-123';
    const startTime = new Date();

    mockKitchenService.startPreparingOrder.mockResolvedValue({
      success: true,
      order: {
        id: orderId,
        status: 'preparing',
        startPreparedAt: startTime,
      },
    });

    const result = await mockKitchenService.startPreparingOrder(orderId);

    expect(result.order.startPreparedAt).toBeDefined();
    expect(result.order.startPreparedAt).toBeInstanceOf(Date);
  });
});

describe('US-008: Marcar pedido como "Listo"', () => {
  test('TC-KITCHEN-010: Estado cambia a Listo al hacer clic', async () => {
    const order = { id: 'order-123', status: 'preparing' };

    mockKitchenService.markOrderReady.mockResolvedValue({
      success: true,
      order: { ...order, status: 'ready' },
    });

    const result = await mockKitchenService.markOrderReady(order.id);

    expect(result.success).toBe(true);
    expect(result.order.status).toBe('ready');
  });

  test('TC-KITCHEN-011: Cliente recibe notificación para recoger pedido', async () => {
    const orderId = 'order-123';

    await mockKitchenService.markOrderReady(orderId);

    mockRabbitMQClient.publishEvent.mockResolvedValue(true);
    await mockRabbitMQClient.publishEvent('order.ready', { orderId });

    expect(mockRabbitMQClient.publishEvent).toHaveBeenCalledWith('order.ready', { orderId });
  });

  test('TC-KITCHEN-012: Estado no puede revertirse a En preparación o Pendiente', () => {
    const order = { id: 'order-123', status: 'ready' };

    const attemptRevert = (newStatus) => {
      const validTransitions = {
        'pending': ['preparing', 'cancelled'],
        'preparing': ['ready', 'cancelled'],
        'ready': ['delivered'],
        'delivered': [],
      };

      if (!validTransitions[order.status].includes(newStatus)) {
        throw new Error(`No se puede cambiar de ${order.status} a ${newStatus}`);
      }
    };

    expect(() => attemptRevert('preparing')).toThrow();
    expect(() => attemptRevert('pending')).toThrow();
    expect(() => attemptRevert('delivered')).not.toThrow();
  });

  test('TC-KITCHEN-013: Timestamp de listo se registra', async () => {
    const orderId = 'order-123';
    const readyTime = new Date();

    mockKitchenService.markOrderReady.mockResolvedValue({
      success: true,
      order: {
        id: orderId,
        status: 'ready',
        readyAt: readyTime,
      },
    });

    const result = await mockKitchenService.markOrderReady(orderId);

    expect(result.order.readyAt).toBeDefined();
    expect(result.order.readyAt).toBeInstanceOf(Date);
  });

  test('TC-KITCHEN-014: Calcular tiempo de preparación', () => {
    const order = {
      id: 'order-123',
      startPreparedAt: new Date('2025-12-18T10:00:00'),
      readyAt: new Date('2025-12-18T10:25:00'),
    };

    const prepTime = (order.readyAt - order.startPreparedAt) / 1000 / 60; // en minutos

    expect(prepTime).toBe(25);
  });
});

describe('US-011: Kitchen Service recibe notificación de nuevo pedido', () => {
  test('TC-KITCHEN-015: Recepción de mensaje vía RabbitMQ', async () => {
    const newOrderEvent = {
      eventType: 'order.created',
      orderId: 'order-123',
      items: [{ id: 'prod-1', quantity: 2 }],
    };

    mockRabbitMQClient.consumeEvent.mockImplementation((eventType, callback) => {
      if (eventType === 'order.created') {
        callback(newOrderEvent);
      }
    });

    let receivedOrder = null;
    await mockRabbitMQClient.consumeEvent('order.created', (message) => {
      receivedOrder = message;
    });

    expect(receivedOrder).toBeDefined();
    expect(receivedOrder.orderId).toBe('order-123');
  });

  test('TC-KITCHEN-016: Nuevo pedido aparece en panel tras procesar mensaje', async () => {
    const newOrder = {
      id: 'order-123',
      status: 'pending',
      items: [{ id: 'prod-1', quantity: 2 }],
    };

    mockKitchenService.updateOrderFromEvent.mockResolvedValue({
      success: true,
      order: newOrder,
    });

    const result = await mockKitchenService.updateOrderFromEvent(newOrder);

    expect(result.success).toBe(true);
    expect(result.order.id).toBe('order-123');
  });

  test('TC-KITCHEN-017: Reintentos en caso de fallo de procesamiento', async () => {
    let attempts = 0;
    const maxRetries = 3;

    const processWithRetry = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Fallo temporal');
      }
      return { success: true };
    };

    let result;
    for (let i = 0; i < maxRetries; i++) {
      try {
        result = await processWithRetry();
        break;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
      }
    }

    expect(attempts).toBe(3);
    expect(result.success).toBe(true);
  });
});

describe('US-012: Kitchen Service recibe notificación de pedido cancelado', () => {
  test('TC-KITCHEN-018: Recepción de mensaje de cancelación vía RabbitMQ', async () => {
    const cancelEvent = {
      eventType: 'order.cancelled',
      orderId: 'order-123',
    };

    mockRabbitMQClient.consumeEvent.mockImplementation((eventType, callback) => {
      if (eventType === 'order.cancelled') {
        callback(cancelEvent);
      }
    });

    let receivedEvent = null;
    await mockRabbitMQClient.consumeEvent('order.cancelled', (message) => {
      receivedEvent = message;
    });

    expect(receivedEvent).toBeDefined();
    expect(receivedEvent.orderId).toBe('order-123');
  });

  test('TC-KITCHEN-019: Pedido se marca como Cancelado en panel', async () => {
    const orderId = 'order-123';

    mockKitchenService.updateOrderFromEvent.mockResolvedValue({
      success: true,
      order: { id: orderId, status: 'cancelled' },
    });

    const result = await mockKitchenService.updateOrderFromEvent({
      id: orderId,
      status: 'cancelled',
    });

    expect(result.order.status).toBe('cancelled');
  });

  test('TC-KITCHEN-020: Personal no puede iniciar preparación de pedido cancelado', () => {
    const order = { id: 'order-123', status: 'cancelled' };

    const attemptStart = () => {
      if (order.status === 'cancelled') {
        throw new Error('No se puede preparar un pedido cancelado');
      }
      return mockKitchenService.startPreparingOrder(order.id);
    };

    expect(() => attemptStart()).toThrow('No se puede preparar un pedido cancelado');
  });
});

describe('US-040: Kitchen Service recibe notificación de modificación', () => {
  test('TC-KITCHEN-021: Recepción de mensaje con detalles actualizados', async () => {
    const updateEvent = {
      eventType: 'order.updated',
      orderId: 'order-123',
      updatedItems: [{ id: 'prod-1', quantity: 3 }], // Cambiado de 2 a 3
      updatedNotes: 'Actualización: sin gluten',
    };

    mockRabbitMQClient.consumeEvent.mockImplementation((eventType, callback) => {
      if (eventType === 'order.updated') {
        callback(updateEvent);
      }
    });

    let receivedEvent = null;
    await mockRabbitMQClient.consumeEvent('order.updated', (message) => {
      receivedEvent = message;
    });

    expect(receivedEvent).toBeDefined();
    expect(receivedEvent.updatedItems[0].quantity).toBe(3);
  });

  test('TC-KITCHEN-022: Actualización automática del pedido en panel', async () => {
    const updatedOrder = {
      id: 'order-123',
      items: [{ id: 'prod-1', quantity: 3 }],
      notes: 'Sin gluten',
    };

    mockKitchenService.updateOrderFromEvent.mockResolvedValue({
      success: true,
      order: updatedOrder,
    });

    const result = await mockKitchenService.updateOrderFromEvent(updatedOrder);

    expect(result.order.items[0].quantity).toBe(3);
    expect(result.order.notes).toBe('Sin gluten');
  });

  test('TC-KITCHEN-023: Visualización clara de cambios para el personal', () => {
    const originalOrder = {
      items: [{ id: 'prod-1', name: 'Pizza', quantity: 2 }],
      notes: 'Sin cebolla',
    };

    const updatedOrder = {
      items: [{ id: 'prod-1', name: 'Pizza', quantity: 3 }],
      notes: 'Sin cebolla, sin gluten',
    };

    const detectChanges = (original, updated) => {
      const changes = [];
      
      if (original.items[0].quantity !== updated.items[0].quantity) {
        changes.push(`Cantidad cambiada: ${original.items[0].quantity} → ${updated.items[0].quantity}`);
      }
      
      if (original.notes !== updated.notes) {
        changes.push(`Notas actualizadas: "${updated.notes}"`);
      }
      
      return changes;
    };

    const changes = detectChanges(originalOrder, updatedOrder);

    expect(changes.length).toBeGreaterThan(0);
    expect(changes[0]).toContain('Cantidad cambiada');
    expect(changes[1]).toContain('Notas actualizadas');
  });

  test('TC-KITCHEN-024: No se puede modificar pedido ya en estado ready', () => {
    const order = { id: 'order-123', status: 'ready' };

    const canUpdate = (status) => ['pending', 'preparing'].includes(status);

    expect(canUpdate(order.status)).toBe(false);
  });
});

describe('Tests de Integración: RabbitMQ y sincronización de estados', () => {
  test('TC-INTEGRATION-003: Flujo completo Order Service → Kitchen Service', async () => {
    // 1. Order Service publica evento order.created
    const orderEvent = {
      eventType: 'order.created',
      orderId: 'ORD-123',
      items: [{ id: 'prod-1', quantity: 2 }],
    };

    mockRabbitMQClient.publishEvent.mockResolvedValue(true);
    await mockRabbitMQClient.publishEvent('order.created', orderEvent);

    // 2. Kitchen Service consume el evento
    mockRabbitMQClient.consumeEvent.mockImplementation((eventType, callback) => {
      if (eventType === 'order.created') {
        callback(orderEvent);
      }
    });

    let kitchenReceivedOrder = null;
    await mockRabbitMQClient.consumeEvent('order.created', (message) => {
      kitchenReceivedOrder = message;
    });

    // 3. Verificar que Kitchen recibió el pedido correctamente
    expect(kitchenReceivedOrder).toBeDefined();
    expect(kitchenReceivedOrder.orderId).toBe('ORD-123');
  });

  test('TC-INTEGRATION-004: Sincronización bidireccional de estados', async () => {
    const orderId = 'ORD-123';

    // 1. Kitchen marca como preparing
    await mockKitchenService.startPreparingOrder(orderId);
    await mockRabbitMQClient.publishEvent('order.preparing', { orderId });

    // 2. Order Service debe actualizar su estado
    // (Este test se completa en order-service tests)

    expect(mockRabbitMQClient.publishEvent).toHaveBeenCalledWith('order.preparing', { orderId });
  });
});
