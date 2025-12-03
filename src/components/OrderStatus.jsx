import { useState, useEffect, useCallback } from 'react';
import { getOrderStatus, cancelOrder } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotification';
import NotificationModal from './NotificationModal';
import OrderCancelModal from './OrderCancelModal';

/**
 * Componente para mostrar el estado de un pedido específico
 * @param {Function} onOrderLoad - Callback que se ejecuta cuando se carga el pedido
 * @param {Function} onRefreshRequest - Callback para pasar la función de refresh al padre
 * @param {Function} onOpenReviewModal - Callback para abrir el modal de review
 */
function OrderStatus({ onOrderLoad, onRefreshRequest, onOpenReviewModal }) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para modales de notificación
  const [preparingModal, setPreparingModal] = useState(false);
  const [readyModal, setReadyModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Log cambios en estados de modales
  useEffect(() => {
    console.log('🎭 Estado preparingModal cambió a:', preparingModal);
  }, [preparingModal]);

  useEffect(() => {
    console.log('🎭 Estado readyModal cambió a:', readyModal);
  }, [readyModal]);

  // Función para obtener el estado del pedido
  const fetchOrderStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await getOrderStatus(orderId);
      setOrder(orderData);
      if (onOrderLoad) {
        onOrderLoad(orderData);
      }
    } catch (err) {
      setError(err.message || 'Error loading order status');
    } finally {
      setLoading(false);
    }
  }, [orderId, onOrderLoad]);

  // Carga inicial
  useEffect(() => {
    if (orderId) {
      fetchOrderStatus();
    }
  }, [orderId, fetchOrderStatus]);

  // Pasar la función de refresh al padre
  useEffect(() => {
    if (onRefreshRequest) {
      onRefreshRequest(fetchOrderStatus);
    }
  }, [onRefreshRequest, fetchOrderStatus]);

  // Manejar notificaciones SSE
  const handleNotification = useCallback((notification) => {
    console.log('🔔 ============ NOTIFICACIÓN RECIBIDA ============');
    console.log('📦 Notificación completa:', JSON.stringify(notification, null, 2));
    console.log('🔍 notification.orderId:', notification.orderId);
    console.log('🔍 notification.orderNumber:', notification.orderNumber);
    console.log('🔍 notification.eventType:', notification.eventType);
    console.log('📍 orderId del URL:', orderId);
    console.log('📍 order state:', order);

    // SIMPLIFICADO: Solo comparar con el orderId del URL (que puede ser _id o orderNumber)
    const match1 = notification.orderId === orderId;
    const match2 = notification.orderNumber === orderId;
    const match3 = order && notification.orderId === order._id;
    const match4 = order && notification.orderNumber === order.orderNumber;
    const match5 = order && notification.orderId === order.orderNumber;

    console.log('🔎 Comparaciones:');
    console.log('  match1 (notification.orderId === orderId):', match1, `(${notification.orderId} === ${orderId})`);
    console.log('  match2 (notification.orderNumber === orderId):', match2, `(${notification.orderNumber} === ${orderId})`);
    console.log('  match3 (notification.orderId === order._id):', match3, `(${notification.orderId} === ${order?._id})`);
    console.log('  match4 (notification.orderNumber === order.orderNumber):', match4, `(${notification.orderNumber} === ${order?.orderNumber})`);
    console.log('  match5 (notification.orderId === order.orderNumber):', match5, `(${notification.orderId} === ${order?.orderNumber})`);

    const isMyOrder = match1 || match2 || match3 || match4 || match5;

    console.log('🎯 Resultado final isMyOrder:', isMyOrder);

    if (!isMyOrder) {
      console.log('⏭️ ❌ Notificación NO es para mi orden, ignorando');
      console.log('=========================================\n');
      return;
    }

    console.log('✅ ✅ ✅ Notificación ES para mi orden!');
    console.log('📢 Tipo de evento:', notification.eventType);

    // order.preparing - Tu pedido está siendo preparado
    if (notification.eventType === 'order.preparing') {
      console.log('👨‍🍳 🔥 MOSTRANDO MODAL PREPARING 🔥');
      setPreparingModal(true);
      fetchOrderStatus();
    }

    // order.ready - Tu pedido está listo
    if (notification.eventType === 'order.ready') {
      console.log('🎉 🔥 MOSTRANDO MODAL READY 🔥');
      setReadyModal(true);
      fetchOrderStatus();
    }

    // Notificación de cancelación
    if (notification.eventType === 'order.cancelled') {
      fetchOrderStatus();
    }

    console.log('=========================================\n');
  }, [orderId, order, fetchOrderStatus]);

  // Conectar a notificaciones - RECIBIR TODAS (sin filtro)
  useNotifications(handleNotification, []);

  // Manejar cancelación de pedido
  const handleCancelOrder = async () => {
    setCancelError('');
    setIsCancelling(true);

    try {
      const updatedOrder = await cancelOrder(orderId);
      setOrder(updatedOrder);
      setCancelModal(false);
      
      // Mostrar modal de éxito
      setPreparingModal(false);
      setReadyModal(false);
      
      // Opcional: redireccionar después de 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setCancelError(err.message || 'Error al cancelar el pedido');
      console.error('Error cancelando pedido:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  // Manejar aceptar modal de "preparing"
  const handleAcceptPreparing = () => {
    setPreparingModal(false);
  };

  // Manejar "Pick Up Order" - solo cerrar modal, NO navegar
  const handlePickUpOrder = () => {
    setReadyModal(false);
  };

  // Manejar "Add Review" - cerrar modal y abrir ReviewModal
  const handleAddReview = () => {
    setReadyModal(false);
    if (onOpenReviewModal) {
      onOpenReviewModal();
    }
  };

  // Función para obtener el icono según el nombre del item
  const getItemIcon = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('burger') || name.includes('hamburguesa')) {
      return 'lunch_dining';
    } else if (name.includes('fries') || name.includes('papas') || name.includes('patatas')) {
      return 'bakery_dining';
    } else if (name.includes('drink') || name.includes('bebida') || name.includes('shake') || name.includes('milkshake')) {
      return 'local_cafe';
    } else if (name.includes('pizza')) {
      return 'local_pizza';
    } else if (name.includes('salad') || name.includes('ensalada')) {
      return 'restaurant';
    } else {
      return 'restaurant_menu';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-subtext-light dark:text-subtext-dark">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <div className="text-red-600 dark:text-red-400 mb-2">
          <span className="material-symbols-outlined text-5xl">error</span>
        </div>
        <h3 className="text-red-800 dark:text-red-300 font-semibold text-lg mb-2">Error</h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg p-6 text-center">
        <p className="text-subtext-light dark:text-subtext-dark">Order not found</p>
      </div>
    );
  }

  // Get order number or ID to display
  const displayOrderId = order.orderNumber || order.orderId || order._id || 'N/A';
  const customerName = order.customerName || order.customer || 'Customer';

  // Determine timeline states based on normalized status
  const isBeingPrepared = order.status === 'cooking' || order.status === 'ready' || order.status === 'delivered';
  const isReadyForPickup = order.status === 'ready' || order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <>
      {/* Headline Text */}
      <h1 className="text-center text-[32px] font-bold leading-tight tracking-tight text-text-light dark:text-text-dark">
        Order #{displayOrderId}
      </h1>
      <p className="pt-1 text-center text-base font-normal leading-normal text-subtext-light dark:text-subtext-dark">
        For: {customerName}
      </p>

      {/* Estado cancelado */}
      {isCancelled && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <div className="text-red-600 dark:text-red-400 mb-2">
            <span className="material-symbols-outlined text-5xl">cancel</span>
          </div>
          <h3 className="text-red-800 dark:text-red-300 font-semibold text-lg">Pedido Cancelado</h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            Este pedido ha sido cancelado exitosamente.
          </p>
        </div>
      )}

      {/* Timeline / Status Stepper */}
      {!isCancelled && (
        <div className="mt-8 rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-sm">
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
            {/* Step 1: Order Received */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                <span className="material-symbols-outlined">check</span>
              </div>
              <p className="text-xs font-medium text-text-light dark:text-text-dark">Order Received</p>
            </div>
            {/* Connector 1 */}
            <div className={`h-1 flex-grow rounded-full ${isBeingPrepared ? 'bg-primary' : 'bg-border-light dark:bg-border-dark'}`}></div>
            {/* Step 2: Being Prepared */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`relative flex h-10 w-10 items-center justify-center rounded-full ${isBeingPrepared ? 'bg-primary text-white' : 'bg-border-light dark:bg-border-dark text-subtext-light dark:text-subtext-dark'}`}>
                <span className="material-symbols-outlined">{isReadyForPickup ? 'check' : 'soup_kitchen'}</span>
                {(order.status === 'cooking' || order.status === 'preparing') && (
                  <div className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-50"></div>
                )}
              </div>
              <p className={`text-xs font-medium ${isBeingPrepared ? 'text-primary' : 'text-subtext-light dark:text-subtext-dark'}`}>
                Being Prepared
              </p>
            </div>
            {/* Connector 2 */}
            <div className={`h-1 flex-grow rounded-full ${isReadyForPickup ? 'bg-primary' : 'bg-border-light dark:bg-border-dark'}`}></div>
            {/* Step 3: Ready for Pickup */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isReadyForPickup ? 'bg-primary text-white' : 'bg-border-light dark:bg-border-dark text-subtext-light dark:text-subtext-dark'}`}>
                <span className="material-symbols-outlined">{isReadyForPickup ? 'check' : 'shopping_bag'}</span>
              </div>
              <p className={`text-xs font-medium ${isReadyForPickup ? 'text-primary' : 'text-subtext-light dark:text-subtext-dark'}`}>
                Ready for Pickup
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <h3 className="px-0 pb-2 pt-8 text-lg font-bold leading-tight tracking-[-0.015em] text-text-light dark:text-text-dark">
        Your Order
      </h3>

      {/* Order Items List */}
      {order.items && order.items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-lg bg-card-light dark:bg-card-dark p-4 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-3xl">{getItemIcon(item.name)}</span>
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-text-light dark:text-text-dark">
                  {item.quantity}x {item.name}
                </p>
                {item.notes && (
                  <p className="text-sm text-subtext-light dark:text-subtext-dark">{item.notes}</p>
                )}
              </div>
              {item.price && (
                <p className="font-bold text-text-light dark:text-text-dark">
                  ${item.price.toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-card-light dark:bg-card-dark p-4 shadow-sm">
          <p className="text-subtext-light dark:text-subtext-dark text-center">No hay items en este pedido</p>
        </div>
      )}

      {/* Botón Cancelar Pedido - Solo si está pending */}
      {order.status === 'pending' && !isCancelled && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setCancelModal(true)}
            disabled={isCancelling}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isCancelling ? 'Cancelando...' : 'Cancelar Pedido'}
          </button>
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      <OrderCancelModal
        isOpen={cancelModal}
        isCancelling={isCancelling}
        error={cancelError}
        onConfirm={handleCancelOrder}
        onClose={() => {
          setCancelModal(false);
          setCancelError('');
        }}
      />

      {/* Modal: Pedido siendo preparado */}
      <NotificationModal
        isOpen={preparingModal}
        type="info"
        title="Your order is being prepared!"
        message="Your order is being prepared by our team. We'll let you know when it's ready."
        onAccept={handleAcceptPreparing}
        acceptText="Got it"
      />

      {/* Modal: Order ready for pickup */}
      <NotificationModal
        isOpen={readyModal}
        type="success"
        title="Your order is ready!"
        message="Your order is ready for pickup. Enjoy your meal!"
        onAccept={handlePickUpOrder}
        acceptText="Pick Up Order"
        onCancel={handleAddReview}
        cancelText="Add Review"
      />
    </>
  );
}

export default OrderStatus;