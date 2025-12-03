import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';
import { useOrderFormValidation } from '../hooks/useOrderFormValidation';

// Menú de items disponibles (precios en pesos colombianos)
const MENU_ITEMS = [
  { id: 1, name: 'Classic Margherita Pizza', price: 28000, icon: 'local_pizza' },
  { id: 2, name: 'Cheeseburger', price: 20000, icon: 'lunch_dining' },
  { id: 3, name: 'Creamy Carbonara', price: 30000, icon: 'restaurant_menu' },
  { id: 4, name: 'Caesar Salad', price: 18000, icon: 'restaurant' },
  { id: 5, name: 'Soft Drink', price: 6000, icon: 'local_cafe' },
];

export default function OrderForm() {
  const navigate = useNavigate();

  // Hook de validación (SRP: separa lógica de validación del UI)
  const {
    touched,
    setTouched,
    getEmailValidationState,
    isFormValid
  } = useOrderFormValidation();

  // Estado del formulario
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [quantities, setQuantities] = useState(
    MENU_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
  );

  // Estados de UI
  const [showModal, setShowModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Incrementar cantidad de un item
  const increment = (itemId) => {
    setQuantities(prev => ({ ...prev, [itemId]: prev[itemId] + 1 }));
  };

  // Decrementar cantidad de un item
  const decrement = (itemId) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, prev[itemId] - 1)
    }));
  };

  // Calcular total del pedido
  const calculateTotal = () => {
    return MENU_ITEMS.reduce((total, item) => {
      return total + (item.price * quantities[item.id]);
    }, 0);
  };

  // Enviar pedido
  const handleSubmit = async () => {
    // Marcar campos como tocados al intentar enviar
    setTouched({ name: true, email: true });

    if (!isFormValid(customerName, customerEmail, quantities)) {
      setError('Please enter your name, email, and select at least one item');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Preparar items del pedido
      const items = MENU_ITEMS
        .filter(item => quantities[item.id] > 0)
        .map(item => ({
          name: item.name,
          quantity: quantities[item.id],
          price: item.price,
        }));

      // Crear pedido
      const orderData = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        items,
        notes: notes.trim() || undefined,
      };

      const response = await createOrder(orderData);

      // Guardar datos del pedido
      setOrderNumber(response.orderNumber);
      setOrderId(response.orderId);

      // Mostrar modal de éxito
      setShowModal(true);
    } catch (err) {
      setError('Error creating the order. Please try again.');
      console.error('Error creating order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar modal y redireccionar
  const handleModalClose = () => {
    setShowModal(false);
    // ✅ USAR orderNumber (ORD-xxx) en lugar de orderId (MongoDB _id)
    navigate(`/orders/${orderNumber}`);
  };

  const total = calculateTotal();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-background-dark rounded-2xl shadow-xl p-12 md:p-16 flex flex-col gap-10">
        {/* Header minimalista */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center rounded-full size-10 bg-primary">
            <span className="material-symbols-outlined text-2xl text-white">restaurant</span>
          </div>
          <h2 className="text-[#181311] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Delicious Kitchen</h2>
        </div>

        {/* Sección de detalles del cliente */}
        <div className="flex flex-col gap-4">
          <label className="flex flex-col">
            <span className="text-[#181311] dark:text-gray-300 text-base font-medium pb-2">Your Name *</span>
            <input
              type="text"
              className={`form-input w-full rounded-lg text-[#181311] dark:text-white border ${
                touched.name && customerName.trim().length === 0
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-[#e6dfdb] dark:border-gray-600'
              } bg-white dark:bg-gray-800 focus:border-primary h-12 px-4 text-base`}
              placeholder="Enter your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
            />
            {touched.name && customerName.trim().length === 0 && (
              <span className="text-red-500 text-sm mt-1">Name is required</span>
            )}
          </label>
          <label className="flex flex-col">
            <span className="text-[#181311] dark:text-gray-300 text-base font-medium pb-2">Your Email *</span>
            <input
              type="email"
              className={`form-input w-full rounded-lg text-[#181311] dark:text-white border ${
                getEmailValidationState(customerEmail) === 'error'
                  ? 'border-red-500 dark:border-red-500'
                  : getEmailValidationState(customerEmail) === 'invalid'
                  ? 'border-yellow-500 dark:border-yellow-500'
                  : getEmailValidationState(customerEmail) === 'valid'
                  ? 'border-green-500 dark:border-green-500'
                  : 'border-[#e6dfdb] dark:border-gray-600'
              } bg-white dark:bg-gray-800 focus:border-primary h-12 px-4 text-base`}
              placeholder="your@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            />
            {touched.email && customerEmail.trim().length === 0 && (
              <span className="text-red-500 text-sm mt-1">Email is required</span>
            )}
            {touched.email && customerEmail.trim().length > 0 && getEmailValidationState(customerEmail) === 'invalid' && (
              <span className="text-yellow-600 dark:text-yellow-500 text-sm mt-1">Please enter a valid email format</span>
            )}
            {touched.email && getEmailValidationState(customerEmail) === 'valid' && (
              <span className="text-green-600 dark:text-green-500 text-sm mt-1">✓ Email format is correct</span>
            )}
          </label>
          <label className="flex flex-col">
            <span className="text-[#181311] dark:text-gray-300 text-base font-medium pb-2">Special Notes (optional)</span>
            <textarea
              className="form-input w-full rounded-lg text-[#181311] dark:text-white border border-[#e6dfdb] dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary px-4 py-2 text-base"
              placeholder="Allergies, preferences, special instructions..."
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>

        {/* Sección del menú */}
        <div className="flex flex-col gap-3">
          <span className="text-[#181311] dark:text-white text-base font-bold pb-2">What are you craving?</span>
          {MENU_ITEMS.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 bg-background-light dark:bg-gray-900 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-primary bg-primary/20 rounded-lg p-2">{item.icon}</span>
                <span className="text-[#181311] dark:text-white text-base font-medium">{item.name}</span>
                <span className="text-[#896f61] dark:text-gray-400 text-sm font-normal">${item.price.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decrement(item.id)}
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-bold text-lg disabled:bg-gray-100 disabled:text-gray-400"
                  disabled={quantities[item.id] === 0}
                >-
                </button>
                <span className="w-6 text-center">{quantities[item.id]}</span>
                <button
                  onClick={() => increment(item.id)}
                  className="h-7 w-7 flex items-center justify-center rounded-full bg-primary text-white font-bold text-lg"
                >+
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer resumen y botón */}
        <div className="flex flex-col gap-2 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
            <span className="text-xl font-bold text-[#181311] dark:text-white">${total.toLocaleString('es-CO')}</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid(customerName, customerEmail, quantities) || isLoading}
            className="bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed w-full transition-colors"
          >
            {isLoading ? 'Processing...' : 'Place Order'}
          </button>
        </div>

        {/* Modal de éxito */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-background-dark w-full max-w-sm rounded-xl shadow-lg p-6 text-center flex flex-col items-center animate-fadeIn">
              <div className="flex items-center justify-center size-16 bg-green-100 rounded-full mb-4">
                <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-[#181311] dark:text-white mb-2">Order Placed Successfully!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Your order is being prepared.</p>
              <div className="bg-background-light dark:bg-gray-800 rounded-lg p-3 w-full">
                <span className="text-sm text-gray-500 dark:text-gray-400">Your Order Number</span>
                <p className="text-lg font-mono font-bold text-[#181311] dark:text-white tracking-wider">{orderNumber}</p>
              </div>
              <button
                onClick={handleModalClose}
                className="mt-6 bg-primary text-white font-bold py-3 px-6 rounded-lg w-full hover:bg-primary/90 transition-colors"
              >View Order Status</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}