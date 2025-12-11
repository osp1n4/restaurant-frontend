import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';

/**
 * Custom Hook para gestionar el estado y lógica de analíticas de ventas
 * Maneja: queries, loading states, error handling y transformación de datos
 */
export const useSalesAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    from: getDefaultFromDate(),
    to: getDefaultToDate(),
    groupBy: 'month',
    top: 5
  });

  /**
   * Función para obtener analíticas con los filtros actuales
   */
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await analyticsService.getAnalytics(filters);
      setData(response);
    } catch (err) {
      setError(err.message || 'Error al cargar analíticas');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Función para exportar datos a CSV
   */
  const exportToCSV = useCallback(async () => {
    try {
      await analyticsService.exportCSV({
        ...filters,
        columns: ['period', 'totalOrders', 'totalRevenue', 'productId', 'productName', 'quantity', 'avgPrepTime']
      });
    } catch (err) {
      throw new Error(err.message || 'Error al exportar CSV');
    }
  }, [filters]);

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Cargar datos cuando cambian los filtros
   */
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchAnalytics,
    exportToCSV
  };
};

/**
 * Helpers para fechas por defecto
 */
function getDefaultFromDate() {
  const date = new Date();
  date.setDate(date.getDate() - 30); // 30 días atrás
  return date.toISOString().split('T')[0];
}

function getDefaultToDate() {
  return new Date().toISOString().split('T')[0];
}
