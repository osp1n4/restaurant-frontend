/**
 * Servicio API para comunicación con el backend
 * Base URL: http://localhost:3000 (API Gateway)
 */

import { getEnvVar } from '../utils/getEnvVar';
const API_BASE_URL = getEnvVar('VITE_API_URL') || 'http://localhost:3000';

/**
 * Mapea los estados del backend a los estados del frontend
 * @param {string} status - Estado del backend (PENDING, PREPARING, READY, DELIVERED, CANCELLED)
 * @returns {string} Estado del frontend (pending, cooking, ready, delivered, cancelled)
 */
function mapOrderStatus(status) {
  const statusMap = {
    'PENDING': 'pending',
    'PREPARING': 'cooking',
    'READY': 'ready',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled',
    // También aceptar estados en minúsculas por si acaso
    'pending': 'pending',
    'preparing': 'cooking',
    'cooking': 'cooking',
    'ready': 'ready',
    'delivered': 'delivered',
    'cancelled': 'cancelled'
  };
  return statusMap[status?.toUpperCase()] || status || 'pending';
}

/**
 * Normaliza los datos del pedido del backend al formato esperado por el frontend
 * @param {Object} orderData - Datos del pedido del backend
 * @returns {Object} Datos del pedido normalizados
 */
function normalizeOrderData(orderData) {
  // El backend puede devolver { success, message, data: { order: {...} } } o directamente el objeto
  const order = orderData.data?.order || orderData.order || orderData;

  return {
    ...order,
    // Mapear campos del backend al formato del frontend
    orderId: order._id || order.id || order.orderId,
    orderNumber: order.orderNumber,
    customer: order.customerName || order.customer,
    customerName: order.customerName || order.customer,
    customerEmail: order.customerEmail,
    status: mapOrderStatus(order.status),
    items: order.items || [],
    total: order.total || 0,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}

/**
 * Obtiene el estado de un pedido específico
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} Datos del pedido normalizados
 */
export async function getOrderStatus(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener el estado del pedido: ${response.statusText}`);
    }

    const data = await response.json();
    return normalizeOrderData(data);
  } catch (error) {
    console.error('Error en getOrderStatus:', error);
    throw error;
  }
}

/**
 * Obtiene los pedidos de cocina
 * @param {string} status - Estado opcional para filtrar (RECEIVED, PREPARING, READY)
 * @returns {Promise<Array>} Lista de pedidos en cocina
 */
export async function getKitchenOrders(status) {
  try {
    const url = status
      ? `${API_BASE_URL}/kitchen/orders?status=${status}`
      : `${API_BASE_URL}/kitchen/orders`;



    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Intentar obtener el mensaje de error del backend
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Si no se puede parsear JSON, usar el statusText
      }

      // Mensaje más específico para 404
      if (response.status === 404) {
        errorMessage = `Endpoint no encontrado. Verifica que el API Gateway esté corriendo en ${API_BASE_URL} y que el endpoint /kitchen/orders esté disponible.`;
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.url = url;
      throw error;
    }

    const data = await response.json();
   

    // El backend puede devolver estructuras anidadas
    // Caso 1: { success: true, data: { success: true, data: { data: [...] } } }
    if (data.success && data.data?.success && data.data?.data?.data) {
      return Array.isArray(data.data.data.data) ? data.data.data.data : [];
    }

    // Caso 2: { success: true, data: { data: [...] } }
    if (data.success && data.data?.data) {
      return Array.isArray(data.data.data) ? data.data.data : [];
    }

    // Caso 3: { success: true, data: [...] }
    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data : [];
    }

    // Caso 4: Array directo
    if (Array.isArray(data)) {
      return data;
    }

    console.warn('⚠️ Estructura de datos no reconocida, retornando array vacío');
    // Si data no es un array, retornar array vacío
    return [];
  } catch (error) {
    // Si es un error de red (fetch falló completamente)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error(
        `Error de conexión. Verifica que el API Gateway esté corriendo en ${API_BASE_URL}`
      );
      networkError.originalError = error;
      throw networkError;
    }

    console.error('Error en getKitchenOrders:', error);
    throw error;
  }
}

/**
 * Obtiene un pedido específico de cocina
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} Datos del pedido
 */
export async function getKitchenOrder(orderId) {
  try {
    const url = `${API_BASE_URL}/kitchen/orders/${orderId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Si no se puede parsear JSON, usar el statusText
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error(
        `Error de conexión. Verifica que el API Gateway esté corriendo en ${API_BASE_URL}`
      );
      networkError.originalError = error;
      throw networkError;
    }

    console.error('Error en getKitchenOrder:', error);
    throw error;
  }
}

/**
 * Inicia la preparación de un pedido (RECEIVED → PREPARING)
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} Datos del pedido actualizado
 */
export async function startPreparingOrder(orderId) {
  try {
    const url = `${API_BASE_URL}/kitchen/orders/${orderId}/start-preparing`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Si no se puede parsear JSON, usar el statusText
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error(
        `Error de conexión. Verifica que el API Gateway esté corriendo en ${API_BASE_URL}`
      );
      networkError.originalError = error;
      throw networkError;
    }

    console.error('Error en startPreparingOrder:', error);
    throw error;
  }
}

/**
 * Marca un pedido como listo (PREPARING → READY)
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} Datos del pedido actualizado
 */
export async function markOrderAsReady(orderId) {
  try {
    const url = `${API_BASE_URL}/kitchen/orders/${orderId}/ready`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Si no se puede parsear JSON, usar el statusText
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();

    if (data.success && data.data) {
      return data.data;
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error(
        `Error de conexión. Verifica que el API Gateway esté corriendo en ${API_BASE_URL}`
      );
      networkError.originalError = error;
      throw networkError;
    }

    console.error('Error en markOrderAsReady:', error);
    throw error;
  }
}

/**
 * Crea un nuevo pedido
 * @param {Object} orderData - Datos del pedido
 * @param {string} orderData.customerName - Nombre del cliente (requerido)
 * @param {string} orderData.customerEmail - Email del cliente (requerido)
 * @param {Array} orderData.items - Items del pedido (requerido)
 * @param {string} [orderData.notes] - Notas especiales (opcional)
 * @returns {Promise<Object>} Datos del pedido creado normalizados
 */
export async function createOrder(orderData) {
  try {
    // Normalizar los datos para el backend
    const backendData = {
      customerName: orderData.customerName || orderData.customer,
      customerEmail: orderData.customerEmail,
      items: orderData.items || []
    };

    // Agregar notas solo si existen
    if (orderData.notes) {
      backendData.notes = orderData.notes;
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      throw new Error(`Error al crear el pedido: ${response.statusText}`);
    }

    const data = await response.json();
    // El backend devuelve { success, message, data: { order: {...} } }
    return normalizeOrderData(data);
  } catch (error) {
    console.error('Error en createOrder:', error);
    throw error;
  }
}

/**
 * Cancela un pedido específico
 * @param {string} orderId - ID del pedido a cancelar
 * @returns {Promise<Object>} Datos del pedido actualizado
 */
export async function cancelOrder(orderId) {
  try {
    const url = `${API_BASE_URL}/orders/${orderId}/cancel`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Si no se puede parsear JSON, usar el statusText
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return normalizeOrderData(data.data);
    }
    
    return normalizeOrderData(data);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error(
        `Error de conexión. Verifica que el API Gateway esté corriendo en ${API_BASE_URL}`
      );
      networkError.originalError = error;
      throw networkError;
    }
    
    console.error('Error en cancelOrder:', error);
    throw error;
  }
}

// ==================== REVIEW API FUNCTIONS ====================

/**
 * Crea una nueva reseña para un pedido
 * @param {Object} reviewData - Datos de la reseña
 * @param {string} reviewData.orderId - ID del pedido (requerido)
 * @param {string} reviewData.customerName - Nombre del cliente (requerido)
 * @param {number} reviewData.overallRating - Calificación general 1-5 (requerido)
 * @param {number} reviewData.foodRating - Calificación de comida 1-5 (requerido)
 * @param {string} [reviewData.comment] - Comentario opcional (max 500 chars)
 * @returns {Promise<Object>} Datos de la reseña creada
 */
export async function createReview(reviewData) {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al crear la reseña: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en createReview:', error);
    throw error;
  }
}

/**
 * Obtiene las reseñas públicas aprobadas con paginación
 * @param {number} [page=1] - Número de página
 * @param {number} [limit=10] - Cantidad de reseñas por página
 * @returns {Promise<Object>} { reviews: [...], total: number, page: number, hasMore: boolean }
 */
export async function getPublicReviews(page = 1, limit = 10) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reviews?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener reseñas: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getPublicReviews:', error);
    throw error;
  }
}

/**
 * Obtiene todas las reseñas (admin) con paginación
 * @param {number} [page=1] - Número de página
 * @param {number} [limit=50] - Cantidad de reseñas por página
 * @returns {Promise<Object>} { reviews: [...], total: number, page: number }
 */
export async function getAllReviews(page = 1, limit = 50) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reviews/admin/reviews?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener todas las reseñas: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getAllReviews:', error);
    throw error;
  }
}

/**
 * Obtiene una reseña específica por ID
 * @param {string} reviewId - ID de la reseña
 * @returns {Promise<Object>} Datos de la reseña
 */
export async function getReviewById(reviewId) {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener la reseña: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getReviewById:', error);
    throw error;
  }
}

/**
 * Actualiza el estado de una reseña (admin)
 * @param {string} reviewId - ID de la reseña
 * @param {string} status - Nuevo estado: 'approved', 'hidden', 'pending'
 * @returns {Promise<Object>} Datos de la reseña actualizada
 */
export async function updateReviewStatus(reviewId, status) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reviews/${reviewId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error al actualizar la reseña: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en updateReviewStatus:', error);
    throw error;
  }
}

/**
 * Obtiene las analíticas de ventas
 * @param {Object} filters - Filtros para las analíticas
 * @param {string} filters.from - Fecha inicial (YYYY-MM-DD)
 * @param {string} filters.to - Fecha final (YYYY-MM-DD)
 * @param {string} filters.groupBy - Agrupación (day|week|month|year)
 * @param {number} [filters.top] - Top N productos (opcional)
 * @returns {Promise<Object>} Datos de analíticas
 */
export async function getAnalytics(filters) {
  try {
    const params = new URLSearchParams({
      from: filters.from,
      to: filters.to,
      groupBy: filters.groupBy
    });

    if (filters.top) {
      params.append('top', filters.top);
    }

    const url = `${API_BASE_URL}/admin/analytics?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Manejo especial para 204 (No Content)
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

      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Si no se puede parsear JSON, usar el statusText
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error(
        `Error de conexión. Verifica que el API Gateway esté corriendo en ${API_BASE_URL}`
      );
      networkError.originalError = error;
      throw networkError;
    }
    
    console.error('Error en getAnalytics:', error);
    throw error;
  }
}

/**
 * Exporta las analíticas a CSV
 * @param {Object} params - Parámetros para exportación
 * @param {string} params.from - Fecha inicial (YYYY-MM-DD)
 * @param {string} params.to - Fecha final (YYYY-MM-DD)
 * @param {string} params.groupBy - Agrupación (day|week|month|year)
 * @param {number} [params.top] - Top N productos (opcional)
 * @param {Array<string>} [params.columns] - Columnas a exportar (opcional)
 * @returns {Promise<void>} Descarga el archivo CSV
 */
export async function exportAnalyticsCSV(params) {
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
        // Si no se puede parsear JSON, usar el statusText
      }
      
      throw new Error(errorMessage);
    }

    // Crear blob y descargar
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // Extraer filename del header Content-Disposition si existe
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'analytics-export.csv';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error(
        `Error de conexión. Verifica que el API Gateway esté corriendo en ${API_BASE_URL}`
      );
      networkError.originalError = error;
      throw networkError;
    }
    
    console.error('Error en exportAnalyticsCSV:', error);
    throw error;
  }
}