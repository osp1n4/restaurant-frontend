import * as api from '../services/api';

// Mock global fetch
beforeEach(() => {
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.clearAllMocks();
});

describe('api.js', () => {
  describe('getOrderStatus', () => {
    it('devuelve datos normalizados en éxito', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ order: { _id: '1', status: 'PENDING', orderNumber: 'A1' } })
      });
      const data = await api.getOrderStatus('1');
      expect(data.orderId).toBe('1');
      expect(data.status).toBe('pending');
      expect(data.orderNumber).toBe('A1');
    });
    it('lanza error si la respuesta no es ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });
      await expect(api.getOrderStatus('x')).rejects.toThrow('Error al obtener el estado del pedido: Not Found');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.getOrderStatus('x')).rejects.toThrow('fetch failed');
    });
  });

  describe('getKitchenOrders', () => {
    it('devuelve array de pedidos (caso 1)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { success: true, data: { data: [{ id: 1 }] } } })
      });
      const res = await api.getKitchenOrders();
      expect(Array.isArray(res)).toBe(true);
      expect(res[0].id).toBe(1);
    });
    it('devuelve array de pedidos (caso 2)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { data: [{ id: 2 }] } })
      });
      const res = await api.getKitchenOrders();
      expect(res[0].id).toBe(2);
    });
    it('devuelve array de pedidos (caso 3)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [{ id: 3 }] })
      });
      const res = await api.getKitchenOrders();
      expect(res[0].id).toBe(3);
    });
    it('devuelve array de pedidos (caso 4)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ id: 4 }])
      });
      const res = await api.getKitchenOrders();
      expect(res[0].id).toBe(4);
    });
    it('devuelve array vacío si estructura no reconocida', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ foo: 'bar' }) });
      const res = await api.getKitchenOrders();
      expect(res).toEqual([]);
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.getKitchenOrders()).rejects.toThrow('Error de conexión');
    });
    it('lanza error si status 404', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({})
      });
      await expect(api.getKitchenOrders()).rejects.toThrow('Endpoint no encontrado');
    });
  });

  describe('getKitchenOrder', () => {
    it('devuelve datos en éxito', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { id: 1 } }) });
      const res = await api.getKitchenOrder('1');
      expect(res.id).toBe(1);
    });
    it('lanza error si no ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad', json: async () => ({}) });
      await expect(api.getKitchenOrder('x')).rejects.toThrow('Error 400: Bad');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.getKitchenOrder('x')).rejects.toThrow('Error de conexión');
    });
  });

  describe('startPreparingOrder', () => {
    it('devuelve datos en éxito', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { id: 1 } }) });
      const res = await api.startPreparingOrder('1');
      expect(res.id).toBe(1);
    });
    it('lanza error si no ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad', json: async () => ({}) });
      await expect(api.startPreparingOrder('x')).rejects.toThrow('Error 400: Bad');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.startPreparingOrder('x')).rejects.toThrow('Error de conexión');
    });
  });

  describe('markOrderAsReady', () => {
    it('devuelve datos en éxito', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { id: 1 } }) });
      const res = await api.markOrderAsReady('1');
      expect(res.id).toBe(1);
    });
    it('lanza error si no ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad', json: async () => ({}) });
      await expect(api.markOrderAsReady('x')).rejects.toThrow('Error 400: Bad');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.markOrderAsReady('x')).rejects.toThrow('Error de conexión');
    });
  });

  describe('createOrder', () => {
    it('devuelve datos normalizados en éxito', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ order: { _id: '1', status: 'PENDING' } }) });
      const res = await api.createOrder({ customerName: 'A', customerEmail: 'B', items: [] });
      expect(res.orderId).toBe('1');
    });
    it('lanza error si no ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, statusText: 'Bad' });
      await expect(api.createOrder({})).rejects.toThrow('Error al crear el pedido: Bad');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.createOrder({})).rejects.toThrow('fetch failed');
    });
  });

  describe('cancelOrder', () => {
    it('devuelve datos normalizados en éxito', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ order: { _id: '1', status: 'CANCELLED' } }) });
      const res = await api.cancelOrder('1');
      expect(res.status).toBe('cancelled');
    });
    it('lanza error si no ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad', json: async () => ({}) });
      await expect(api.cancelOrder('x')).rejects.toThrow('Error 400: Bad');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.cancelOrder('x')).rejects.toThrow('Error de conexión');
    });
  });

  describe('createReview', () => {
    it('devuelve datos en éxito', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) });
      const res = await api.createReview({});
      expect(res.id).toBe(1);
    });
    it('lanza error si no ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'fail' }), statusText: 'Bad' });
      await expect(api.createReview({})).rejects.toThrow('fail');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.createReview({})).rejects.toThrow('fetch failed');
    });
  });

  describe('getPublicReviews', () => {
    it('devuelve datos en éxito', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [1, 2] }) });
      const res = await api.getPublicReviews();
      expect(res.reviews).toEqual([1, 2]);
    });
    it('lanza error si no ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, statusText: 'Bad' });
      await expect(api.getPublicReviews()).rejects.toThrow('Error al obtener reseñas: Bad');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.getPublicReviews()).rejects.toThrow('fetch failed');
    });
  });

  describe('getAllReviews', () => {
    it('devuelve datos en éxito', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ reviews: [1, 2] }) });
      const res = await api.getAllReviews();
      expect(res.reviews).toEqual([1, 2]);
    });
    it('lanza error si no ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, statusText: 'Bad' });
      await expect(api.getAllReviews()).rejects.toThrow('Error al obtener todas las reseñas: Bad');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.getAllReviews()).rejects.toThrow('fetch failed');
    });
  });

  describe('getReviewById', () => {
    it('devuelve datos en éxito', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) });
      const res = await api.getReviewById('1');
      expect(res.id).toBe(1);
    });
    it('lanza error si no ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, statusText: 'Bad' });
      await expect(api.getReviewById('x')).rejects.toThrow('Error al obtener la reseña: Bad');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.getReviewById('x')).rejects.toThrow('fetch failed');
    });
  });

  describe('updateReviewStatus', () => {
    it('devuelve datos en éxito', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) });
      const res = await api.updateReviewStatus('1', 'approved');
      expect(res.id).toBe(1);
    });
    it('lanza error si no ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'fail' }), statusText: 'Bad' });
      await expect(api.updateReviewStatus('x', 'approved')).rejects.toThrow('fail');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.updateReviewStatus('x', 'approved')).rejects.toThrow('fetch failed');
    });
  });

  describe('getAnalytics', () => {
    it('devuelve datos en éxito', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ summary: { totalOrders: 1 } }) });
      const res = await api.getAnalytics({ from: '2023-01-01', to: '2023-01-02', groupBy: 'day' });
      expect(res.summary.totalOrders).toBe(1);
    });
    it('devuelve datos vacíos si status 204', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 204, statusText: 'No Content', json: async () => ({}) });
      const res = await api.getAnalytics({ from: '2023-01-01', to: '2023-01-02', groupBy: 'day' });
      expect(res.message).toMatch(/No hay datos/);
    });
    it('lanza error si no ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad', json: async () => ({}) });
      await expect(api.getAnalytics({ from: '', to: '', groupBy: '' })).rejects.toThrow('Error 400: Bad');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.getAnalytics({ from: '', to: '', groupBy: '' })).rejects.toThrow('Error de conexión');
    });
  });

  describe('exportAnalyticsCSV', () => {
    beforeEach(() => {
      // Mock window.URL y document para simular descarga
      global.URL.createObjectURL = jest.fn(() => 'blob:url');
      document.createElement = jest.fn(() => ({
        style: {},
        click: jest.fn(),
        setAttribute: jest.fn(),
        remove: jest.fn(),
      }));
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
      window.URL.revokeObjectURL = jest.fn();
    });
    it('descarga el archivo CSV en éxito', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(['csvdata'], { type: 'text/csv' }),
        headers: { get: () => 'attachment; filename="test.csv"' }
      });
      await api.exportAnalyticsCSV({ from: '2023-01-01', to: '2023-01-02', groupBy: 'day' });
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    });
    it('lanza error si no ok', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad', json: async () => ({}) });
      await expect(api.exportAnalyticsCSV({ from: '', to: '', groupBy: '' })).rejects.toThrow('Error 400: Bad');
    });
    it('lanza error de red', async () => {
      fetch.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(api.exportAnalyticsCSV({ from: '', to: '', groupBy: '' })).rejects.toThrow('Error de conexión');
    });
  });
});
