import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Servicio para gestionar el menú
 * Cumple con US-001: Lazy loading y paginación
 */

/**
 * Obtener menú con paginación
 * @param {number} page - Número de página (default: 1)
 * @param {number} limit - Items por página (default: 20)
 * @param {string} category - Filtrar por categoría (opcional)
 * @returns {Promise} Lista de productos con paginación
 */
export const getMenu = async (page = 1, limit = 20, category = null) => {
  try {
    const params = { page, limit };
    if (category) {
      params.category = category;
    }

    const response = await axios.get(`${API_URL}/menu`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw error;
  }
};

/**
 * Obtener un producto específico por ID
 * @param {string} id - ID del producto
 * @returns {Promise} Datos del producto
 */
export const getMenuItem = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/menu/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching menu item:', error);
    throw error;
  }
};

/**
 * Obtener categorías disponibles
 * @returns {Promise} Lista de categorías
 */
export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/menu/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
