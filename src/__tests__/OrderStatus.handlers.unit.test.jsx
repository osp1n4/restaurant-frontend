import React from 'react';
import { renderHook, act } from '@testing-library/react';

// Simulación de los handlers y utilidades
function useHandlers(onOpenReviewModal) {
  const [preparingModal, setPreparingModal] = React.useState(true);
  const [readyModal, setReadyModal] = React.useState(true);

  const handleAcceptPreparing = React.useCallback(() => setPreparingModal(false), []);
  const handlePickUpOrder = React.useCallback(() => setReadyModal(false), []);
  const handleAddReview = React.useCallback(() => {
    setReadyModal(false);
    onOpenReviewModal?.();
  }, [onOpenReviewModal]);

  const getItemIcon = React.useMemo(() => (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('burger') || name.includes('hamburguesa')) return 'lunch_dining';
    if (name.includes('fries') || name.includes('papas') || name.includes('patatas')) return 'bakery_dining';
    if (name.includes('drink') || name.includes('bebida') || name.includes('shake') || name.includes('milkshake')) return 'local_cafe';
    if (name.includes('pizza')) return 'local_pizza';
    if (name.includes('salad') || name.includes('ensalada')) return 'restaurant';
    return 'restaurant_menu';
  }, []);

  return {
    preparingModal,
    readyModal,
    handleAcceptPreparing,
    handlePickUpOrder,
    handleAddReview,
    getItemIcon,
  };
}

describe('Handlers y utilidades de OrderStatus', () => {
  it('handleAcceptPreparing cierra el modal de preparación', () => {
    const { result } = renderHook(() => useHandlers());
    expect(result.current.preparingModal).toBe(true);
    act(() => {
      result.current.handleAcceptPreparing();
    });
    expect(result.current.preparingModal).toBe(false);
  });

  it('handlePickUpOrder cierra el modal de listo', () => {
    const { result } = renderHook(() => useHandlers());
    expect(result.current.readyModal).toBe(true);
    act(() => {
      result.current.handlePickUpOrder();
    });
    expect(result.current.readyModal).toBe(false);
  });

  it('handleAddReview cierra el modal y llama onOpenReviewModal', () => {
    const onOpenReviewModal = jest.fn();
    const { result } = renderHook(() => useHandlers(onOpenReviewModal));
    expect(result.current.readyModal).toBe(true);
    act(() => {
      result.current.handleAddReview();
    });
    expect(result.current.readyModal).toBe(false);
    expect(onOpenReviewModal).toHaveBeenCalled();
  });

  it('getItemIcon retorna el icono correcto para cada tipo de item', () => {
    const { result } = renderHook(() => useHandlers());
    expect(result.current.getItemIcon('Hamburguesa')).toBe('lunch_dining');
    expect(result.current.getItemIcon('Papas fritas')).toBe('bakery_dining');
    expect(result.current.getItemIcon('Bebida')).toBe('local_cafe');
    expect(result.current.getItemIcon('Pizza')).toBe('local_pizza');
    expect(result.current.getItemIcon('Ensalada')).toBe('restaurant');
    expect(result.current.getItemIcon('Otro')).toBe('restaurant_menu');
  });
});
