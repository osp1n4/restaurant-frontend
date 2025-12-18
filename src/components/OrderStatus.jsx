
import { useState, useEffect, useCallback, useMemo } from 'react';
import { getOrderStatus, cancelOrder, updateOrder } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../hooks/useNotification';
import NotificationModal from './NotificationModal';
import OrderCancelModal from './OrderCancelModal';
import EditOrderModal from './EditOrderModal';

/**
 * Componente para mostrar el estado de un pedido específico
 * @param {Function} onOrderLoad - Callback que se ejecuta cuando se carga el pedido
 * @param {Function} onRefreshRequest - Callback para pasar la función de refresh al padre
 * @param {Function} onOpenReviewModal - Callback para abrir el modal de review
 */
function OrderStatus({ onOrderLoad, onRefreshRequest, onOpenReviewModal }) {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  // Estados principales
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Estados de modales
  const [preparingModal, setPreparingModal] = useState(false);
  const [readyModal, setReadyModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  // Estados para editar pedido
  const [editModal, setEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Efectos de logging para debug ---
  useEffect(() => {
    console.log('🎯 preparingModal changed to:', preparingModal);
  }, [preparingModal]);
  useEffect(() => {
    console.log('🎯 readyModal changed to:', readyModal);
  }, [readyModal]);

  // --- Lógica de obtención de pedido ---
  const fetchOrderStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const orderData = await getOrderStatus(orderId);
      setOrder(orderData);
      onOrderLoad?.(orderData);
    } catch (err) {
      setError(err.message || t('orderStatus.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [orderId, onOrderLoad, t]);

  // Carga inicial y refresh
  useEffect(() => {
    if (orderId) fetchOrderStatus();
  }, [orderId, fetchOrderStatus]);
  useEffect(() => {
    onRefreshRequest?.(fetchOrderStatus);
  }, [onRefreshRequest, fetchOrderStatus]);

  // --- Lógica de notificaciones SSE ---
  const isNotificationForOrder = useCallback(
    (notification) => {
      // Normaliza coincidencia de IDs
      const ids = [orderId, order?._id, order?.orderNumber];
      return (
        ids.includes(notification.orderId) ||
        ids.includes(notification.orderNumber)
      );
    },
    [orderId, order]
  );

  const handleNotification = useCallback(
    (notification) => {
      console.log('📬 Notification received:', notification);
      console.log('🔍 Current orderId:', orderId);
      console.log('🔍 Current order:', order);
      
      if (!isNotificationForOrder(notification)) {
        console.log('⏭️ Notification not for this order, skipping...');
        return;
      }
      
      console.log('✅ Notification matches this order!', notification.eventType);
      
      switch (notification.eventType) {
        case 'order.preparing':
          console.log('🍳 Setting preparing modal to TRUE');
          setPreparingModal(true);
          fetchOrderStatus();
          break;
        case 'order.ready':
          console.log('✅ Setting ready modal to TRUE');
          setReadyModal(true);
          fetchOrderStatus();
          break;
        case 'order.updated':
          console.log('🔄 Order updated via SSE, refreshing...');
          fetchOrderStatus();
          break;
        case 'order.cancelled':
          console.log('❌ Order cancelled, refreshing...');
          fetchOrderStatus();
          break;
        default:
          console.log('❓ Unknown event type:', notification.eventType);
          break;
      }
    },
    [isNotificationForOrder, fetchOrderStatus, orderId, order]
  );
  useNotifications(handleNotification, []);

  // --- Acciones de UI ---
  const handleCancelOrder = useCallback(async () => {
    setCancelError('');
    setIsCancelling(true);
    try {
      const updatedOrder = await cancelOrder(orderId);
      setOrder(updatedOrder);
      setCancelModal(false);
      setPreparingModal(false);
      setReadyModal(false);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setCancelError(err.message || t('orderStatus.errorCancelling'));
    } finally {
      setIsCancelling(false);
    }
  }, [orderId, navigate, t]);

  const handleUpdateOrder = useCallback(async (updateData) => {
    setIsUpdating(true);
    try {
      const updatedOrder = await updateOrder(orderId, updateData);
      setOrder(updatedOrder);
      setEditModal(false);
      // Refrescar datos del pedido
      await fetchOrderStatus();
    } catch (err) {
      alert(err.message || t('orderStatus.errorUpdating', 'Error al actualizar el pedido'));
    } finally {
      setIsUpdating(false);
    }
  }, [orderId, fetchOrderStatus, t]);

  const handleAcceptPreparing = useCallback(() => setPreparingModal(false), []);
  const handlePickUpOrder = useCallback(() => setReadyModal(false), []);
  const handleAddReview = useCallback(() => {
    setReadyModal(false);
    onOpenReviewModal?.();
  }, [onOpenReviewModal]);

  // --- Utilidad para iconos de items ---
  const getItemIcon = useMemo(() => (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('burger') || name.includes('hamburguesa')) return 'lunch_dining';
    if (name.includes('fries') || name.includes('papas') || name.includes('patatas')) return 'bakery_dining';
    if (name.includes('drink') || name.includes('bebida') || name.includes('shake') || name.includes('milkshake')) return 'local_cafe';
    if (name.includes('pizza')) return 'local_pizza';
    if (name.includes('salad') || name.includes('ensalada')) return 'restaurant';
    return 'restaurant_menu';
  }, []);

  // --- Memoización de datos derivados ---
  const displayOrderId = useMemo(() => order?.orderNumber || order?.orderId || order?._id || 'N/A', [order]);
  const customerName = useMemo(() => order?.customerName || order?.customer || 'Customer', [order]);
  // Estados del timeline alineados con el proceso de cocina:
  // - Received: pedido creado (pending o posterior)
  // - Preparing: en preparación (preparing o posterior)
  // - Ready: listo para recoger (ready o delivered)
  const isReceived = useMemo(() => ['pending', 'preparing', 'ready', 'delivered'].includes(order?.status), [order]);
  const isBeingPrepared = useMemo(() => ['preparing', 'ready', 'delivered'].includes(order?.status), [order]);
  const isReadyForPickup = useMemo(() => ['ready', 'delivered'].includes(order?.status), [order]);
  const isCancelled = order?.status === 'cancelled';

  // --- Renderizado condicional ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">{t('orderStatus.loading')}</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
        <div className="text-red-400 mb-2">
          <span className="material-symbols-outlined text-5xl">error</span>
        </div>
        <h3 className="text-red-300 font-semibold text-lg mb-2">{t('orderStatus.error')}</h3>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
        <p className="text-gray-400">{t('orderStatus.notFound')}</p>
      </div>
    );
  }

  // --- Render principal ---
  return (
    <>
      {/* Headline Text */}
      <h1 className="text-center text-[32px] font-bold leading-tight tracking-tight text-white">
        {t('orderStatus.orderNumber', { id: displayOrderId })}
      </h1>
      <p className="pt-1 text-center text-base font-normal leading-normal text-gray-400">
        {t('orderStatus.for', { name: customerName })}
      </p>

      {/* Estado cancelado */}
      {isCancelled && (
        <div className="mt-4 bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
          <div className="text-red-400 mb-2">
            <span className="material-symbols-outlined text-5xl">cancel</span>
          </div>
          <h3 className="text-red-300 font-semibold text-lg">{t('orderStatus.cancelledTitle')}</h3>
          <p className="text-red-400 text-sm mt-1">
            {t('orderStatus.cancelledText')}
          </p>
        </div>
      )}

      {/* Timeline / Status Stepper */}
      {!isCancelled && (
        <div className="mt-8 rounded-xl bg-slate-800 p-6 shadow-xl">
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
            {/* Step 1: Order Received */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isReceived ? 'bg-primary text-white' : 'bg-slate-700 text-gray-400'}`}>
                <span className="material-symbols-outlined">
                  {isBeingPrepared ? 'check' : (order.status === 'pending' ? 'receipt_long' : 'receipt_long')}
                </span>
              </div>
              <p className={`text-xs font-medium ${isReceived ? 'text-white' : 'text-gray-400'}`}>
                {t('orderStatus.stepReceived')}
              </p>
            </div>
            {/* Connector 1 */}
            <div className={`h-1 flex-grow rounded-full ${isBeingPrepared ? 'bg-primary' : 'bg-slate-700'}`}></div>
            {/* Step 2: Being Prepared */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`relative flex h-10 w-10 items-center justify-center rounded-full ${isBeingPrepared ? 'bg-primary text-white' : 'bg-slate-700 text-gray-400'}`}>
                <span className="material-symbols-outlined">{isReadyForPickup ? 'check' : 'soup_kitchen'}</span>
                {order.status === 'preparing' && (
                  <div className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-50"></div>
                )}
              </div>
              <p className={`text-xs font-medium ${isBeingPrepared ? 'text-primary' : 'text-gray-400'}`}>
                {t('orderStatus.stepPreparing')}
              </p>
            </div>
            {/* Connector 2 */}
            <div className={`h-1 flex-grow rounded-full ${isReadyForPickup ? 'bg-primary' : 'bg-slate-700'}`}></div>
            {/* Step 3: Ready for Pickup */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isReadyForPickup ? 'bg-primary text-white' : 'bg-slate-700 text-gray-400'}`}>
                <span className="material-symbols-outlined">{isReadyForPickup ? 'check' : 'shopping_bag'}</span>
              </div>
              <p className={`text-xs font-medium ${isReadyForPickup ? 'text-primary' : 'text-gray-400'}`}>
                {t('orderStatus.stepReady')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <h3 className="px-0 pb-2 pt-8 text-lg font-bold leading-tight tracking-[-0.015em] text-white">
        {t('orderStatus.yourOrder')}
      </h3>

      {/* Order Items List */}
      {order.items && order.items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-lg bg-slate-800 p-4 shadow-xl"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-3xl">{getItemIcon(item.name)}</span>
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-white">
                  {item.quantity}x {item.name}
                </p>
                {item.notes && (
                  <p className="text-sm text-gray-400">{item.notes}</p>
                )}
              </div>
              {item.price && (
                <p className="font-bold text-white">
                  ${item.price.toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-slate-800 p-4 shadow-xl">
          <p className="text-gray-400 text-center">{t('orderStatus.noItems')}</p>
        </div>
      )}

      {/* Botones de acción - Solo si está pending */}
      {order.status === 'pending' && !isCancelled && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setEditModal(true)}
            disabled={isUpdating || isCancelling}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
            {t('orderStatus.modifyOrder')}
          </button>
          <button
            onClick={() => setCancelModal(true)}
            disabled={isCancelling || isUpdating}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isCancelling ? t('orderStatus.cancelling') : t('orderStatus.cancelOrder')}
          </button>
        </div>
      )}

      {/* Alerta cuando está en preparación - botones deshabilitados */}
      {(order.status === 'preparing' || order.status === 'cooking') && !isCancelled && (
        <div className="mt-6 bg-orange-900/20 border border-orange-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-orange-400 text-3xl">soup_kitchen</span>
            <div className="flex-1">
              <h4 className="text-orange-300 font-semibold text-lg mb-1">
                {t('orderStatus.preparingTitle')}
              </h4>
              <p className="text-orange-200 text-sm">
                {t('orderStatus.infoPreparing')}
              </p>
              <p className="text-orange-400 text-xs mt-2 italic">
                {t('orderStatus.cannotModifyPreparing')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje informativo para estado listo */}
      {order.status === 'ready' && !isCancelled && (
        <div className="mt-6 bg-green-900/20 border border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-green-400 text-3xl">shopping_bag</span>
            <div className="flex-1">
              <h4 className="text-green-300 font-semibold text-lg mb-1">
                {t('orderStatus.readyTitle')}
              </h4>
              <p className="text-green-200 text-sm">
                {t('orderStatus.infoReady')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de pedido */}
      <EditOrderModal
        isOpen={editModal}
        order={order}
        onClose={() => setEditModal(false)}
        onSave={handleUpdateOrder}
        isSaving={isUpdating}
      />

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
        title={t('orderStatus.preparingTitle')}
        message={t('orderStatus.preparingMessage')}
        onAccept={handleAcceptPreparing}
        acceptText={t('orderStatus.gotIt')}
      />

      {/* Modal: Order ready for pickup */}
      <NotificationModal
        isOpen={readyModal}
        type="success"
        title={t('orderStatus.readyTitle')}
        message={t('orderStatus.readyMessage')}
        onAccept={handlePickUpOrder}
        acceptText={t('orderStatus.pickUpOrder')}
        onCancel={handleAddReview}
        cancelText={t('orderStatus.addReview')}
      />
    </>
  );
}
export default OrderStatus;