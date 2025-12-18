import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

/**
 * Modal para editar un pedido existente
 * Permite modificar cantidades de items y notas
 */
function EditOrderModal({ isOpen, order, onClose, onSave, isSaving }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && order) {
      setItems(order.items || []);
      setNotes(order.notes || '');
      setError('');
    }
  }, [isOpen, order]);

  /**
   * Actualizar cantidad de un item
   */
  const handleQuantityChange = (index, newQuantity) => {
    const quantity = parseInt(newQuantity) || 0;
    if (quantity < 1) return;

    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], quantity };
    setItems(updatedItems);
  };

  /**
   * Eliminar un item del pedido
   */
  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      setError(t('editOrder.errorLastItem', 'Debe haber al menos un producto en el pedido'));
      return;
    }
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    setError('');
  };

  /**
   * Guardar cambios
   */
  const handleSave = () => {
    if (items.length === 0) {
      setError(t('editOrder.errorNoItems', 'El pedido debe tener al menos un producto'));
      return;
    }

    const updateData = {
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      notes: notes.trim() || undefined
    };

    onSave(updateData);
  };

  /**
   * Calcular total
   */
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {t('editOrder.title', 'Modificar Pedido')}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>

        {/* Order Number */}
        <p className="text-gray-400 text-sm mb-4">
          {t('editOrder.orderNumber', 'Pedido')}: <span className="text-white font-semibold">{order?.orderNumber || 'N/A'}</span>
        </p>

        {/* Items List */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            {t('editOrder.items', 'Productos')}
          </h3>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="bg-slate-900 rounded-lg p-4 flex items-center gap-4">
                {/* Item Info */}
                <div className="flex-1">
                  <p className="text-white font-semibold">{item.name}</p>
                  <p className="text-gray-400 text-sm">
                    ${item.price?.toFixed(2)} c/u
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(index, item.quantity - 1)}
                    disabled={item.quantity <= 1 || isSaving}
                    className="w-8 h-8 rounded-full bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-lg">remove</span>
                  </button>
                  <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(index, item.quantity + 1)}
                    disabled={isSaving}
                    className="w-8 h-8 rounded-full bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>

                {/* Subtotal */}
                <div className="w-24 text-right">
                  <p className="text-white font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length === 1 || isSaving}
                  className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title={t('editOrder.removeItem', 'Eliminar producto')}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-white mb-2">
            {t('editOrder.notes', 'Notas especiales')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSaving}
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            placeholder={t('editOrder.notesPlaceholder', 'Ej: Sin cebolla, extra queso...')}
          />
          <p className="text-gray-500 text-xs mt-1">
            {notes.length}/500
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-900/20 border border-red-800 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Total */}
        <div className="border-t border-slate-700 pt-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-lg">
              {t('editOrder.total', 'Total')}:
            </span>
            <span className="text-white text-2xl font-bold">
              ${calculateTotal().toLocaleString('es-CO')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('editOrder.cancel', 'Cancelar')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || items.length === 0}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving 
              ? t('editOrder.saving', 'Guardando...') 
              : t('editOrder.save', 'Guardar Cambios')
            }
          </button>
        </div>
      </div>
    </div>
  );
}

EditOrderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  order: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool
};

export default EditOrderModal;
