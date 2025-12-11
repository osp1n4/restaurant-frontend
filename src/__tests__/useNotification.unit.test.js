import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '../hooks/useNotification';

// Mock global EventSource
class MockEventSource {
  constructor(url) {
    this.url = url;
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    MockEventSource.instances.push(this);
  }
  close = jest.fn();
  // Simula recibir un mensaje SSE
  emitMessage(data) {
    if (this.onmessage) this.onmessage({ data: JSON.stringify(data) });
  }
  emitError(error) {
    if (this.onerror) this.onerror(error);
  }
}
MockEventSource.instances = [];
global.EventSource = MockEventSource;

jest.useFakeTimers();

describe('useNotifications', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    MockEventSource.instances = [];
    jest.clearAllTimers();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('llama al callback cuando llega una notificación', async () => {
    const cb = jest.fn();
    renderHook(() => useNotifications(cb));
    const es = MockEventSource.instances[0];
    await act(async () => {
      es.emitMessage({ orderId: '1', msg: 'hola' });
    });
    expect(cb).toHaveBeenCalledWith({ orderId: '1', msg: 'hola' });
  });

  it('filtra notificaciones por orderIds', async () => {
    const cb = jest.fn();
    renderHook(() => useNotifications(cb, ['abc']));
    const es = MockEventSource.instances[0];
    await act(async () => {
      es.emitMessage({ orderId: 'abc', msg: 'ok' });
    });
    expect(cb).toHaveBeenCalledWith({ orderId: 'abc', msg: 'ok' });
    await act(async () => {
      es.emitMessage({ orderId: 'zzz', msg: 'no' });
    });
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('no llama al callback si orderId no está en la lista', async () => {
    const cb = jest.fn();
    renderHook(() => useNotifications(cb, ['x']));
    const es = MockEventSource.instances[0];
    await act(async () => {
      es.emitMessage({ orderId: 'y', msg: 'no' });
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it('disconnect cierra la conexión', async () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useNotifications(cb));
    const es = MockEventSource.instances[0];
    await act(async () => {
      result.current.disconnect();
    });
    expect(es.close).toHaveBeenCalled();
  });

  it('reintenta la conexión si hay error', async () => {
    const cb = jest.fn();
    const spy = jest.spyOn(global, 'setTimeout');
    renderHook(() => useNotifications(cb));
    const es = MockEventSource.instances[0];
    await act(async () => {
      es.emitError(new Error('fail'));
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('limpia correctamente al desmontar', async () => {
    const cb = jest.fn();
    const { unmount } = renderHook(() => useNotifications(cb));
    const es = MockEventSource.instances[0];
    await act(async () => {
      unmount();
    });
    expect(es.close).toHaveBeenCalled();
  });

  it('no llama al callback si el mensaje no es JSON válido', async () => {
    const cb = jest.fn();
    renderHook(() => useNotifications(cb));
    const es = MockEventSource.instances[0];
    await act(async () => {
      if (es.onmessage) es.onmessage({ data: 'no es json' });
    });
    expect(cb).not.toHaveBeenCalled();
  });
});
