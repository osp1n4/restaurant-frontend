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
      // Validar rango de fechas
      const fromDate = new Date(filters.from);
      const toDate = new Date(filters.to);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      // Validación 1: Fecha "desde" no puede ser posterior a "hasta"
      if (fromDate > toDate) {
        setError('La fecha "Desde" no puede ser posterior a la fecha "Hasta"');
        setData(null);
        setLoading(false);
        return;
      }

      // Validación 2: No permitir fechas futuras
      if (fromDate > today || toDate > today) {
        setError('No se pueden seleccionar fechas futuras');
        setData(null);
        setLoading(false);
        return;
      }

      // Validación 3: Rango máximo de 2 años (730 días)
      const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 730) {
        setError('El rango de fechas no puede exceder los 2 años (730 días)');
        setData(null);
        setLoading(false);
        return;
      }

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
   * Función para exportar datos a XLSX (Excel)
   * Cumple con US-030: Exportar reportes a XLSX estandarizado
   */
  const exportToXLSX = useCallback(async () => {
    try {
      await analyticsService.exportXLSX({
        ...filters,
        columns: ['period', 'totalOrders', 'totalRevenue', 'productId', 'productName', 'quantity', 'avgPrepTime']
      });
    } catch (err) {
      throw new Error(err.message || 'Error al exportar XLSX');
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
    exportToXLSX
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
