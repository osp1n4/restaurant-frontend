import {
  formatTimeAgo,
  getStatusBadgeColor,
  getStatusText,
  getReferenceTime,
  calculateOrderTotal
} from '../../utils/kitchenUtils';
import { useTranslation } from 'react-i18next';

/**
 * Componente de Tarjeta de Pedido
 */
function OrderCard({ order, isProcessing, onStartPreparing, onMarkAsReady }) {
  const { t } = useTranslation();
  const referenceTime = getReferenceTime(order);
  const timeAgo = formatTimeAgo(referenceTime, t);
  const total = calculateOrderTotal(order.items);

  return (
    <div className="bg-slate-900 rounded-xl shadow-xl p-4 sm:p-6 hover:shadow-2xl transition-shadow flex flex-col min-h-[280px] sm:min-h-[300px] border border-slate-700">
      {/* Order Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-white truncate">
            {t('kitchen.orderNumber')} {order.orderNumber || order.orderId || 'N/A'}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 truncate">
            {order.customerName || 'N/A'}
          </p>
        </div>
        <div className="flex items-center text-gray-400 text-xs sm:text-sm ml-2 flex-shrink-0">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="whitespace-nowrap">{timeAgo}</span>
        </div>
      </div>

      {/* Items - Scrollable area with fixed height */}
      <div className="mb-3 sm:mb-4 flex-1 min-h-0 overflow-y-auto max-h-[120px] sm:max-h-[140px]">
        <ul className="space-y-1">
          {order.items?.map((item, idx) => {
            const itemTotal = item.price ? (item.price * item.quantity).toFixed(2) : null;
            return (
              <li key={idx} className="text-gray-300 text-xs sm:text-sm flex justify-between items-start">
                <span>
                  {item.quantity}x {item.name}
                </span>
                {item.price && (
                  <span className="text-gray-400 ml-2 whitespace-nowrap">
                    ${itemTotal}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Notas del pedido - US-003 Criterio 3 */}
      {order.notes && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex-shrink-0">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-yellow-500 text-xs font-semibold mb-1">
                {t('kitchen.orderNotes', 'Notas del pedido')}:
              </p>
              <p className="text-yellow-100 text-xs sm:text-sm break-words">
                {order.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Total Price */}
      {order.items && order.items.length > 0 && (
        <div className="mb-3 sm:mb-4 pt-2 border-t border-slate-700 flex-shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base font-semibold text-white">Total:</span>
            <span className="text-sm sm:text-base font-bold text-white">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Status and Action */}
      <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-slate-700 flex-shrink-0">
        <span
          className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
            order.status
          )}`}
        >
          {getStatusText(order.status, t)}
        </span>

        {order.status === 'RECEIVED' && (
          <button
            onClick={() => onStartPreparing(order.orderNumber || order.orderId)}
            disabled={isProcessing}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isProcessing ? t('kitchen.processing') : t('kitchen.startCooking')}
          </button>
        )}

        {order.status === 'PREPARING' && (
          <button
            onClick={() => onMarkAsReady(order.orderNumber || order.orderId)}
            disabled={isProcessing}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isProcessing ? t('kitchen.processing') : t('kitchen.markAsReady')}
          </button>
        )}

        {order.status === 'READY' && (
          <button
            disabled
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-700 text-gray-400 rounded-lg text-xs sm:text-sm font-medium cursor-not-allowed whitespace-nowrap"
          >
            {t('kitchen.completed')}
          </button>
        )}

        {order.status === 'CANCELLED' && (
          <button
            disabled
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-700 text-red-400 rounded-lg text-xs sm:text-sm font-medium cursor-not-allowed whitespace-nowrap"
          >
            {t('kitchen.statusCancelled')}
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderCard;
