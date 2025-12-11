/**
 * Servicio de Analíticas
 * Maneja la comunicación con el backend para endpoints de analytics
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Servicio para operaciones de analíticas de ventas
 */
export const analyticsService = {
  /**
   * Obtiene las analíticas de ventas según filtros
   * @param {Object} filters - Filtros de consulta
   * @param {string} filters.from - Fecha inicio (YYYY-MM-DD)
   * @param {string} filters.to - Fecha fin (YYYY-MM-DD)
   * @param {string} filters.groupBy - Agrupación: day|week|month|year
   * @param {number} [filters.top] - Top N productos
   * @returns {Promise<Object>} Datos de analíticas
   */
  async getAnalytics(filters) {
    try {
      const params = new URLSearchParams({
        from: filters.from,
        to: filters.to,
        groupBy: filters.groupBy
      });

      if (filters.top) {
        params.append('top', filters.top.toString());
      }

      const url = `${API_BASE_URL}/admin/analytics?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Manejo de respuesta 204 (sin datos)
      if (response.status === 204) {
        return {
          message: 'No hay datos disponibles para el período seleccionado',
          range: { from: filters.from, to: filters.to, groupBy: filters.groupBy },
          summary: { totalOrders: 0, totalRevenue: 0, avgPrepTime: null },
          series: [],
          productsSold: [],
          topNProducts: []
        };
      }

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Si no se puede parsear, usar statusText
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          `Error de conexión. Verifica que el API Gateway esté corriendo en ${API_BASE_URL}`
        );
      }
      
      throw error;
    }
  },

  /**
   * Exporta analíticas a CSV
   * @param {Object} params - Parámetros de exportación
   * @param {string} params.from - Fecha inicio
   * @param {string} params.to - Fecha fin
   * @param {string} params.groupBy - Agrupación
   * @param {number} [params.top] - Top N
   * @param {Array<string>} [params.columns] - Columnas a incluir
   * @returns {Promise<void>} Descarga el archivo
   */
  async exportCSV(params) {
    try {
      const body = {
        from: params.from,
        to: params.to,
        groupBy: params.groupBy
      };

      if (params.top) {
        body.top = params.top;
      }

      if (params.columns && params.columns.length > 0) {
        body.columns = params.columns;
      }

      const response = await fetch(`${API_BASE_URL}/admin/analytics/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Ignorar error de parsing
        }
        
        throw new Error(errorMessage);
      }

      // Crear blob y descargar archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Extraer nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `analytics-${params.from}-${params.to}.csv`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match && match[1]) {
          filename = match[1].replace(/"/g, '');
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          `Error de conexión. Verifica que el API Gateway esté corriendo en ${API_BASE_URL}`
        );
      }
      
      throw error;
    }
  }
};
