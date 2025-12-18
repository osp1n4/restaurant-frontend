import { useState, useEffect, useCallback, useRef } from 'react';
import { getMenu } from '../services/menuService';

/**
 * Custom Hook para manejar menú con paginación infinita
 * Cumple con US-001: Lazy loading y rendimiento
 */
export const useInfiniteMenu = (category = null) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Ref para evitar llamadas duplicadas
  const fetchingRef = useRef(false);

  /**
   * Cargar más productos
   */
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await getMenu(page, 20, category);
      
      if (response.success) {
        const newItems = response.data.items;
        const pagination = response.data.pagination;

        setItems(prev => {
          // Evitar duplicados usando el _id
          const existingIds = new Set(prev.map(item => item._id));
          const uniqueNewItems = newItems.filter(item => !existingIds.has(item._id));
          return [...prev, ...uniqueNewItems];
        });

        setHasMore(pagination.hasMore);
        setTotalItems(pagination.total);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error loading menu:', err);
      setError('Error al cargar el menú. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [page, loading, hasMore, category]);

  /**
   * Reiniciar cuando cambia la categoría
   */
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    fetchingRef.current = false;
  }, [category]);

  /**
   * Cargar primera página automáticamente
   */
  useEffect(() => {
    if (items.length === 0 && !loading && hasMore) {
      loadMore();
    }
  }, [items.length, loading, hasMore, loadMore]);

  /**
   * Reintentar carga en caso de error
   */
  const retry = useCallback(() => {
    setError(null);
    loadMore();
  }, [loadMore]);

  return {
    items,
    loading,
    error,
    hasMore,
    totalItems,
    loadMore,
    retry
  };
};
