import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PropTypes from 'prop-types';
import OrderStatus from '../components/OrderStatus';
import ReviewModal from '../components/ReviewModal';

/**
 * Página para ver el estado de un pedido específico
 * Ruta: /orders/:orderId
 */
function OrderStatusPage() {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [refreshFunction, setRefreshFunction] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background-light/80 dark:bg-background-dark/80 p-4 pb-2 backdrop-blur-sm">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-text-light dark:text-text-dark text-2xl">arrow_back</span>
          </button>
        </div>
        <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-text-light dark:text-text-dark">
          Track Order
        </h2>
        <div className="flex w-12 items-center justify-end">
          {/* Placeholder for another icon if needed */}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow px-4 pb-28 pt-4">
        <OrderStatus
          onOrderLoad={setOrderData}
          onRefreshRequest={setRefreshFunction}
          onOpenReviewModal={() => setShowReviewModal(true)}
        />
      </main>

      {/* Bottom Bar / Footer */}
      <OrderStatusFooter
        order={orderData}
        onRefresh={refreshFunction}
      />

      {/* Review Modal */}
      {showReviewModal && orderData && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          orderData={{
            orderId: orderData.orderId || orderData._id,
            orderNumber: orderData.orderNumber,
            customerName: orderData.customerName || orderData.customer,
            customerEmail: orderData.customerEmail || ''
          }}
          onSubmit={() => {
            setShowReviewModal(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * Componente del footer con tiempo estimado y botón de refresh
 * @param {Object} order - Datos del pedido
 * @param {Function} onRefresh - Función para refrescar el estado del pedido
 */
function OrderStatusFooter({ order, onRefresh }) {
  // Calcular tiempo estimado basado en el estado del pedido
  const calculateEstimatedTime = () => {
    if (!order) {
      return "Calculando...";
    }

    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const elapsedMinutes = Math.floor((now - createdAt) / (1000 * 60));

    // Tiempo estimado según el estado (ya normalizado por el servicio API)
    let estimatedMinutes;
    switch (order.status) {
      case 'pending':
        // Estado PENDING: tiempo estimado inicial de 15 minutos
        estimatedMinutes = Math.max(0, 15 - elapsedMinutes);
        break;
      case 'cooking':
      case 'preparing':
        // Estado PREPARING: tiempo estimado de 10 minutos restantes
        estimatedMinutes = Math.max(0, 10 - elapsedMinutes);
        break;
      case 'ready':
        // Estado READY: listo para recoger
        return "Ready for Pickup";
      case 'delivered':
        // Estado DELIVERED: ya entregado
        return "Delivered";
      case 'cancelled':
        // Estado CANCELLED: cancelado
        return "Cancelled";
      default:
        estimatedMinutes = 12;
    }

    if (estimatedMinutes <= 0) {
      return "Soon";
    }

    return `${estimatedMinutes} ${estimatedMinutes === 1 ? 'minute' : 'minutes'}`;
  };

  const estimatedTime = calculateEstimatedTime();

  const handleRefresh = () => {
    // Si hay una función de refresh disponible, usarla; sino, recargar la página
    if (onRefresh && typeof onRefresh === 'function') {
      onRefresh();
    } else {
      // Fallback: recargar la página si no hay función de refresh
      globalThis.location.reload();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border-light dark:border-border-dark bg-background-light/80 dark:bg-background-dark/80 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-subtext-light dark:text-subtext-dark">Estimated time remaining</p>
            <p className="text-2xl font-bold text-primary">{estimatedTime}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-5 py-3 text-base font-bold leading-normal text-white hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined">refresh</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

OrderStatusFooter.propTypes = {
  order: PropTypes.shape({
    status: PropTypes.string,
    createdAt: PropTypes.string,
  }),
  onRefresh: PropTypes.func,
};

export default OrderStatusPage;
