
import { useState, useEffect, useCallback } from 'react';
import {
  getKitchenOrders,
  startPreparingOrder,
  markOrderAsReady
} from '../services/api';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../hooks/useNotification';
import NotificationModal from './NotificationModal';
import KitchenHeader from './kitchen/KitchenHeader';
import KitchenFilters from './kitchen/KitchenFilters';
import OrderCard from './kitchen/OrderCard';

/**
 * Componente principal para mostrar los pedidos en cocina
 */

function KitchenView() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [processing, setProcessing] = useState(new Set());

  // Estado para modal de nuevo pedido
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [newOrderNumber, setNewOrderNumber] = useState('');

  // Cargar pedidos
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKitchenOrders(filter || undefined);
      console.log('📦 Datos recibidos de getKitchenOrders:', data);
      console.log('📦 Tipo de datos:', typeof data);
      console.log('📦 Es array?:', Array.isArray(data));
      
      // Asegurarse de que siempre sea un array
      const ordersArray = Array.isArray(data) ? data : [];
      console.log('📦 Orders array final:', ordersArray);
      setOrders(ordersArray);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);

      let errorMessage = err.message || t('kitchen.errorLoadingOrders');

      if (err.status === 404 || errorMessage.includes('404')) {
        errorMessage = t('kitchen.endpointNotFound');
      } else if (errorMessage.includes('conexión') || errorMessage.includes('fetch')) {
        errorMessage = t('kitchen.serverConnectionError');
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Cargar pedidos al montar y cuando cambia el filtro
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Manejar notificaciones SSE
  const handleNotification = useCallback((notification) => {
    console.log('📬 Notificación en cocina:', notification);

    // order.received o order.created - Nuevo pedido
    if (notification.eventType === 'order.received' || notification.eventType === 'order.created') {
      // ✅ USAR orderNumber (ORD-xxx) en lugar de orderId (MongoDB _id)
      const orderNum = notification.orderNumber || notification.orderId || 'N/A';
      setNewOrderNumber(orderNum);
      setNewOrderModal(true);
    }
  }, []);

  // Conectar a notificaciones (sin filtro de orderId, todas las notificaciones)
  useNotifications(handleNotification, []);

  // Manejar aceptar modal de nuevo pedido
  const handleAcceptNewOrder = async () => {
    setNewOrderModal(false);
    // Refrescar lista de pedidos
    await loadOrders();
  };

  // Manejar inicio de preparación
  const handleStartPreparing = async (orderIdentifier) => {
    if (processing.has(orderIdentifier)) return;

    try {
      setProcessing(prev => new Set(prev).add(orderIdentifier));
      await startPreparingOrder(orderIdentifier);
      await loadOrders();
    } catch (err) {
      alert(err.message || t('kitchen.errorStartPreparing'));
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderIdentifier);
        return newSet;
      });
    }
  };

  // Manejar marcar como listo
  const handleMarkAsReady = async (orderIdentifier) => {
    if (processing.has(orderIdentifier)) return;

    try {
      setProcessing(prev => new Set(prev).add(orderIdentifier));
      await markOrderAsReady(orderIdentifier);
      await loadOrders();
    } catch (err) {
      alert(err.message || t('kitchen.errorMarkReady'));
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderIdentifier);
        return newSet;
      });
    }
  };

  const { i18n } = useTranslation();
  return (
    <>
      <div
        key={i18n.language}
        className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6"
      >
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-4 sm:mb-6 md:mb-8">
          <KitchenHeader onRefresh={loadOrders} loading={loading} />
          <KitchenFilters filter={filter} onFilterChange={setFilter} />
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading && orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600">{t('kitchen.loadingOrders')}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">{t('kitchen.noOrdersFound')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {orders.map((order) => (
                <OrderCard
                  key={order._id || order.orderId}
                  order={order}
                  isProcessing={processing.has(order.orderNumber || order.orderId)}
                  onStartPreparing={handleStartPreparing}
                  onMarkAsReady={handleMarkAsReady}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Nuevo pedido recibido */}
      <NotificationModal
        isOpen={newOrderModal}
        type="info"
        title={t('kitchen.newOrderTitle')}
        message={t('kitchen.newOrderMessage', { order: newOrderNumber })}
        onAccept={handleAcceptNewOrder}
        acceptText={t('kitchen.viewOrder')}
      />
    </>
  );
}

export default KitchenView;