/**
 * Modal para confirmar la cancelación de un pedido
 */
import { useTranslation } from 'react-i18next';

export default function OrderCancelModal({
  isOpen,
  isCancelling,
  error,
  onConfirm,
  onClose
}) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-background-dark w-full max-w-sm rounded-xl shadow-lg p-6 text-center flex flex-col items-center animate-fadeIn">
        {/* Icono de advertencia */}
        <div className="flex items-center justify-center size-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
          <span className="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">
            warning
          </span>
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-[#181311] dark:text-white mb-2">
          {t('orderCancelModal.title')}
        </h3>

        {/* Mensaje */}
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('orderCancelModal.confirmMessage')}
        </p>

        {/* Mensaje de error si existe */}
        {error && (
          <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="w-full flex gap-3">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="flex-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('orderCancelModal.keepOrder')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex-1 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCancelling ? t('orderStatus.cancelling') : t('orderCancelModal.cancelOrder')}
          </button>
        </div>
      </div>
    </div>
  );
}
