import { useState, useEffect } from 'react';
import { getOrderStatus } from '../services/api';
import { useParams } from 'react-router-dom';

/**
 * Componente para mostrar el estado de un pedido específico
 */
function OrderStatus() {
  

  return (
   <h2>Estado de la orden</h2>
  );
}

export default OrderStatus;

