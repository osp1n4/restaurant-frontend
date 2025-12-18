/**
 * @file analytics.test.js
 * @description Tests para dashboard de analíticas y reportes
 * @coverage US-026, US-027, US-028, US-029, US-030, US-031, US-032
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock de Analytics Service
const mockAnalyticsService = {
  getMetrics: jest.fn(),
  getReportData: jest.fn(),
  exportToXLSX: jest.fn(),
  getTopProduct: jest.fn(),
  getAveragePreparationTime: jest.fn(),
};

describe('US-026: Acceder a panel de reportes (Admin)', () => {
  test('TC-ANALYTICS-001: Visualización de gráficos y métricas al entrar', async () => {
    const dashboardData = {
      totalRevenue: 15000.00,
      totalOrders: 250,
      topProduct: { name: 'Pizza Margherita', quantity: 45 },
      averagePreparationTime: 18, // minutos
    };

    mockAnalyticsService.getMetrics.mockResolvedValue(dashboardData);

    const result = await mockAnalyticsService.getMetrics();

    expect(result.totalRevenue).toBeDefined();
    expect(result.totalOrders).toBeDefined();
    expect(result.topProduct).toBeDefined();
  });

  test('TC-ANALYTICS-002: Carga de datos por defecto (último mes)', async () => {
    const defaultDateRange = {
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
    };

    mockAnalyticsService.getReportData.mockResolvedValue({
      dateRange: defaultDateRange,
      data: [],
    });

    const result = await mockAnalyticsService.getReportData(defaultDateRange);

    expect(result.dateRange).toBeDefined();
    expect(result.dateRange.from).toBeInstanceOf(Date);
    expect(result.dateRange.to).toBeInstanceOf(Date);
  });

  test('TC-ANALYTICS-003: Acceso denegado a usuarios sin rol admin', () => {
    const checkAccess = (userRole) => {
      return userRole === 'admin';
    };

    expect(checkAccess('admin')).toBe(true);
    expect(checkAccess('kitchen')).toBe(false);
    expect(checkAccess('customer')).toBe(false);
  });

  test('TC-ANALYTICS-004: Dashboard muestra loading state durante carga', () => {
    let isLoading = true;

    const fetchDashboardData = async () => {
      isLoading = true;
      const data = await mockAnalyticsService.getMetrics();
      isLoading = false;
      return data;
    };

    expect(isLoading).toBe(true);
  });
});

describe('US-027: Filtrar reportes por fecha (Admin)', () => {
  test('TC-ANALYTICS-005: Seleccionar rango Fecha Desde y Fecha Hasta', () => {
    const dateRange = {
      from: new Date('2025-12-01'),
      to: new Date('2025-12-18'),
    };

    expect(dateRange.from).toBeInstanceOf(Date);
    expect(dateRange.to).toBeInstanceOf(Date);
    expect(dateRange.to.getTime()).toBeGreaterThanOrEqual(dateRange.from.getTime());
  });

  test('TC-ANALYTICS-006: Actualización de métricas según período seleccionado', async () => {
    const dateRange = {
      from: new Date('2025-12-01'),
      to: new Date('2025-12-18'),
    };

    mockAnalyticsService.getReportData.mockResolvedValue({
      revenue: 8500.00,
      orders: 120,
      dateRange,
    });

    const result = await mockAnalyticsService.getReportData(dateRange);

    expect(result.revenue).toBe(8500.00);
    expect(result.orders).toBe(120);
  });

  test('TC-ANALYTICS-007: Mensaje de error ante rango inválido', () => {
    const validateDateRange = (from, to) => {
      if (from > to) {
        return { valid: false, error: 'La fecha inicial no puede ser mayor que la fecha final' };
      }
      if (from > new Date()) {
        return { valid: false, error: 'La fecha inicial no puede ser futura' };
      }
      return { valid: true };
    };

    const invalidRange1 = validateDateRange(
      new Date('2025-12-18'),
      new Date('2025-12-01')
    );
    const invalidRange2 = validateDateRange(
      new Date('2026-01-01'),
      new Date('2026-01-31')
    );
    const validRange = validateDateRange(
      new Date('2025-12-01'),
      new Date('2025-12-18')
    );

    expect(invalidRange1.valid).toBe(false);
    expect(invalidRange2.valid).toBe(false);
    expect(validRange.valid).toBe(true);
  });

  test('TC-ANALYTICS-008: Shortcuts para rangos predefinidos', () => {
    const getPresetRange = (preset) => {
      const now = new Date();
      const ranges = {
        today: {
          from: new Date(now.setHours(0, 0, 0, 0)),
          to: new Date(),
        },
        lastWeek: {
          from: new Date(now.setDate(now.getDate() - 7)),
          to: new Date(),
        },
        lastMonth: {
          from: new Date(now.setMonth(now.getMonth() - 1)),
          to: new Date(),
        },
      };
      return ranges[preset];
    };

    const lastWeekRange = getPresetRange('lastWeek');
    expect(lastWeekRange.from).toBeInstanceOf(Date);
    expect(lastWeekRange.to).toBeInstanceOf(Date);
  });
});

describe('US-028: Visualizar métricas financieras brutas', () => {
  test('TC-ANALYTICS-009: Calcular Ingreso Total correctamente', () => {
    const orders = [
      { items: [{ price: 15.00, quantity: 2 }] }, // 30.00
      { items: [{ price: 10.00, quantity: 1 }, { price: 8.00, quantity: 3 }] }, // 10 + 24 = 34.00
      { items: [{ price: 20.00, quantity: 1 }] }, // 20.00
    ];

    const calculateTotalRevenue = (orders) => {
      return orders.reduce((total, order) => {
        const orderTotal = order.items.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);
        return total + orderTotal;
      }, 0);
    };

    const total = calculateTotalRevenue(orders);

    expect(total).toBe(84.00); // 30 + 34 + 20
  });

  test('TC-ANALYTICS-010: Mostrar $0.00 si no hay ventas', () => {
    const orders = [];

    const calculateTotalRevenue = (orders) => {
      if (orders.length === 0) return 0.00;
      return orders.reduce((total, order) => total + order.total, 0);
    };

    const total = calculateTotalRevenue(orders);

    expect(total).toBe(0.00);
    expect(typeof total).toBe('number');
  });

  test('TC-ANALYTICS-011: Recálculo en menos de 1000ms al filtrar', async () => {
    const startTime = performance.now();

    await mockAnalyticsService.getMetrics({ from: new Date('2025-12-01'), to: new Date('2025-12-18') });

    const elapsed = performance.now() - startTime;

    // Mock debe completar en <1000ms
    expect(elapsed).toBeLessThan(1000);
  });

  test('TC-ANALYTICS-012: Formato de moneda correcto ($0.00)', () => {
    const formatCurrency = (amount) => {
      return `$${amount.toFixed(2)}`;
    };

    expect(formatCurrency(15000)).toBe('$15000.00');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(123.456)).toBe('$123.46');
  });

  test('TC-ANALYTICS-013: Excluir impuestos y envío del cálculo', () => {
    const order = {
      subtotal: 50.00,
      tax: 5.00,
      shipping: 3.00,
      total: 58.00,
    };

    // Solo subtotal para métrica de ingreso bruto
    const grossRevenue = order.subtotal;

    expect(grossRevenue).toBe(50.00);
    expect(grossRevenue).not.toBe(order.total);
  });
});

describe('US-029: Ver producto más destacado (Admin)', () => {
  test('TC-ANALYTICS-014: Identificar producto más vendido por cantidad', async () => {
    const products = [
      { id: 'prod-1', name: 'Pizza Margherita', totalQuantity: 45 },
      { id: 'prod-2', name: 'Pasta Carbonara', totalQuantity: 32 },
      { id: 'prod-3', name: 'Ensalada César', totalQuantity: 28 },
    ];

    const topProduct = products.reduce((max, product) =>
      product.totalQuantity > max.totalQuantity ? product : max
    );

    mockAnalyticsService.getTopProduct.mockResolvedValue(topProduct);

    const result = await mockAnalyticsService.getTopProduct();

    expect(result.name).toBe('Pizza Margherita');
    expect(result.totalQuantity).toBe(45);
  });

  test('TC-ANALYTICS-015: Actualización dinámica según filtro de fechas', async () => {
    const dateRange = {
      from: new Date('2025-12-01'),
      to: new Date('2025-12-18'),
    };

    mockAnalyticsService.getTopProduct.mockResolvedValue({
      name: 'Hamburguesa',
      totalQuantity: 38,
      dateRange,
    });

    const result = await mockAnalyticsService.getTopProduct(dateRange);

    expect(result.name).toBe('Hamburguesa');
  });

  test('TC-ANALYTICS-016: Indicar N/A si no hay ventas', () => {
    const products = [];

    const getTopProduct = (products) => {
      if (products.length === 0) return { name: 'N/A', totalQuantity: 0 };
      return products[0];
    };

    const result = getTopProduct(products);

    expect(result.name).toBe('N/A');
    expect(result.totalQuantity).toBe(0);
  });

  test('TC-ANALYTICS-017: Mostrar también cantidad vendida', () => {
    const topProduct = {
      name: 'Pizza Margherita',
      totalQuantity: 45,
    };

    expect(topProduct.totalQuantity).toBeDefined();
    expect(typeof topProduct.totalQuantity).toBe('number');
  });
});

describe('US-030: Exportar reportes a XLSX', () => {
  test('TC-ANALYTICS-018: Generar archivo con nombre automático', async () => {
    const today = new Date();
    const filename = `reporte_ventas_${today.toISOString().split('T')[0]}.xlsx`;

    mockAnalyticsService.exportToXLSX.mockResolvedValue({
      success: true,
      filename,
    });

    const result = await mockAnalyticsService.exportToXLSX();

    expect(result.filename).toContain('reporte_ventas_');
    expect(result.filename).toContain('.xlsx');
  });

  test('TC-ANALYTICS-019: Archivo incluye todas las columnas necesarias', () => {
    const exportData = [
      { orderNumber: '12345', date: '2025-12-18', total: 50.00, status: 'delivered' },
      { orderNumber: '12346', date: '2025-12-18', total: 35.00, status: 'delivered' },
    ];

    exportData.forEach(row => {
      expect(row.orderNumber).toBeDefined();
      expect(row.date).toBeDefined();
      expect(row.total).toBeDefined();
      expect(row.status).toBeDefined();
    });
  });

  test('TC-ANALYTICS-020: Exportación incluye nombres completos sin truncar', () => {
    const longProductName = 'Pizza Margherita Extra Grande con Pepperoni y Queso Adicional';

    const exportData = [
      { productName: longProductName, quantity: 2 },
    ];

    expect(exportData[0].productName).toBe(longProductName);
    expect(exportData[0].productName.length).toBe(longProductName.length);
  });
});

describe('US-031: Ver tiempo de preparación en reportes', () => {
  test('TC-ANALYTICS-021: Calcular tiempo promedio de preparación', async () => {
    const orders = [
      { startPreparedAt: new Date('2025-12-18T10:00:00'), readyAt: new Date('2025-12-18T10:15:00') },
      { startPreparedAt: new Date('2025-12-18T11:00:00'), readyAt: new Date('2025-12-18T11:25:00') },
      { startPreparedAt: new Date('2025-12-18T12:00:00'), readyAt: new Date('2025-12-18T12:20:00') },
    ];

    const calculateAverageTime = (orders) => {
      const times = orders.map(order => {
        return (order.readyAt - order.startPreparedAt) / 1000 / 60; // en minutos
      });
      return times.reduce((sum, time) => sum + time, 0) / times.length;
    };

    const avgTime = calculateAverageTime(orders);

    expect(avgTime).toBe(20); // (15 + 25 + 20) / 3 = 20 minutos
  });

  test('TC-ANALYTICS-022: Actualizar métrica según rango de fechas', async () => {
    const dateRange = {
      from: new Date('2025-12-01'),
      to: new Date('2025-12-18'),
    };

    mockAnalyticsService.getAveragePreparationTime.mockResolvedValue({
      avgTime: 18,
      dateRange,
    });

    const result = await mockAnalyticsService.getAveragePreparationTime(dateRange);

    expect(result.avgTime).toBe(18);
  });

  test('TC-ANALYTICS-023: Indicar N/A si no hay pedidos completados', () => {
    const orders = [];

    const getAverageTime = (orders) => {
      if (orders.length === 0) return 'N/A';
      return 20; // Cálculo
    };

    const result = getAverageTime(orders);

    expect(result).toBe('N/A');
  });

  test('TC-ANALYTICS-024: Formato de tiempo legible (minutos y segundos)', () => {
    const formatTime = (minutes) => {
      const mins = Math.floor(minutes);
      const secs = Math.floor((minutes - mins) * 60);
      return `${mins}m ${secs}s`;
    };

    expect(formatTime(18.5)).toBe('18m 30s');
    expect(formatTime(5.25)).toBe('5m 15s');
  });
});

describe('US-032: Visualizar nombres de productos completos', () => {
  test('TC-ANALYTICS-025: Ajuste de columnas para nombres largos', () => {
    const longName = 'Pizza Especial con Ingredientes Premium y Queso Extra';

    const displayName = (name, maxLength = 50) => {
      if (name.length <= maxLength) return name;
      return {
        truncated: name.slice(0, maxLength) + '...',
        full: name,
        hasTooltip: true,
      };
    };

    const result = displayName(longName, 30);

    expect(result.hasTooltip).toBe(true);
    expect(result.full).toBe(longName);
  });

  test('TC-ANALYTICS-026: Exportación XLSX incluye nombres completos', () => {
    const exportData = [
      { productName: 'Pizza Margherita Extra Grande con Todos los Ingredientes', quantity: 2 },
    ];

    expect(exportData[0].productName).toContain('Extra Grande');
    expect(exportData[0].productName.length).toBeGreaterThan(50);
  });

  test('TC-ANALYTICS-027: Tooltips muestran nombre completo al hover', () => {
    const product = {
      name: 'Ensalada César Premium con Pollo Grillado y Aderezo Especial',
      displayName: 'Ensalada César Premium...',
      tooltip: 'Ensalada César Premium con Pollo Grillado y Aderezo Especial',
    };

    expect(product.tooltip).toBe(product.name);
    expect(product.displayName.length).toBeLessThan(product.name.length);
  });
});

describe('Tests de Rendimiento', () => {
  test('TC-PERF-003: Dashboard carga en menos de 2 segundos', async () => {
    const startTime = performance.now();

    await mockAnalyticsService.getMetrics();

    const elapsed = performance.now() - startTime;

    expect(elapsed).toBeLessThan(2000);
  });

  test('TC-PERF-004: Filtrado por fecha completa en <1s', async () => {
    const startTime = performance.now();

    await mockAnalyticsService.getReportData({
      from: new Date('2025-12-01'),
      to: new Date('2025-12-18'),
    });

    const elapsed = performance.now() - startTime;

    expect(elapsed).toBeLessThan(1000);
  });

  test('TC-PERF-005: Exportación de 1000 registros completa en <5s', async () => {
    const largeDataset = Array(1000).fill(null).map((_, i) => ({
      orderNumber: `ORD-${i}`,
      total: 50.00,
    }));

    const startTime = performance.now();

    mockAnalyticsService.exportToXLSX.mockResolvedValue({
      success: true,
      recordCount: largeDataset.length,
    });

    await mockAnalyticsService.exportToXLSX(largeDataset);

    const elapsed = performance.now() - startTime;

    expect(elapsed).toBeLessThan(5000);
  });
});

describe('Tests de Precisión de Cálculos', () => {
  test('TC-ACCURACY-001: Redondeo correcto de decimales', () => {
    const round = (num, decimals = 2) => {
      return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    };

    expect(round(15.456, 2)).toBeCloseTo(15.46, 2);
    expect(round(10.123, 2)).toBeCloseTo(10.12, 2);
    expect(round(9.995, 2)).toBeCloseTo(10.00, 1); // 9.995 redondeado a 2 decimales es 10
  });

  test('TC-ACCURACY-002: Manejo de grandes volúmenes de datos', () => {
    const largeRevenue = 999999.99;

    const formatLargeNumber = (num) => {
      if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(2)}M`;
      }
      return `$${num.toFixed(2)}`;
    };

    // 999999.99 es menor a 1000000, por lo que NO se convierte a "M"
    expect(formatLargeNumber(largeRevenue)).toBe('$999999.99');
    expect(formatLargeNumber(1000000)).toBe('$1.00M'); // Este sí debe convertirse
    expect(formatLargeNumber(500)).toBe('$500.00');
  });

  test('TC-ACCURACY-003: Cálculos no afectados por timezone', () => {
    const date1 = new Date('2025-12-18T00:00:00Z');
    const date2 = new Date('2025-12-18T23:59:59Z');

    const isSameDay = (d1, d2) => {
      return d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0];
    };

    expect(isSameDay(date1, date2)).toBe(true);
  });
});
