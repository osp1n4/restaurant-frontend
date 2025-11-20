/**
 * Servicio API para comunicación con el backend
 * Base URL: http://localhost:3000 (API Gateway)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Obtiene el estado de un pedido específico
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} Datos del pedido
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
    return data;
  } catch (error) {
    console.error('Error en getOrderStatus:', error);
    throw error;
  }
}

/**
 * Obtiene los pedidos de cocina
 * @returns {Promise<Array>} Lista de pedidos en cocina
 */
export async function getKitchenOrders() {
  try {
    const response = await fetch(`${API_BASE_URL}/kitchen/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener los pedidos de cocina: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getKitchenOrders:', error);
    throw error;
  }
}

/**
 * Crea un nuevo pedido
 * @param {Object} orderData - Datos del pedido (items, customer, etc.)
 * @returns {Promise<Object>} Datos del pedido creado
 */
export async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Error al crear el pedido: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en createOrder:', error);
    throw error;
  }
}