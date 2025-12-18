
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createOrder } from '../services/api';
import { useOrderFormValidation } from '../hooks/useOrderFormValidation';


// Menú de items disponibles (precios en pesos colombianos)
const RAW_MENU_ITEMS = [
  { id: 1, key: 'margherita', price: 28000, icon: 'local_pizza' },
  { id: 2, key: 'cheeseburger', price: 20000, icon: 'lunch_dining' },
  { id: 3, key: 'carbonara', price: 30000, icon: 'restaurant_menu' },
  { id: 4, key: 'caesar', price: 18000, icon: 'restaurant' },
  { id: 5, key: 'drink', price: 6000, icon: 'local_cafe' },
];

export default function OrderForm() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  // Navbar: cambio de idioma y atrás
  const handleLanguageChange = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  };
  const handleBack = () => {
    navigate(-1);
  };


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
    RAW_MENU_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
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
    return RAW_MENU_ITEMS.reduce((total, item) => {
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
      const items = RAW_MENU_ITEMS
        .filter(item => quantities[item.id] > 0)
        .map(item => ({
          name: t(`orderForm.menu.${item.key}`),
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


  // Validación básica de email
  function isValidEmail(email) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header superior con navegación */}
      <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-white hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h1 className="text-white text-xl font-bold">{t('home.title')}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLanguageChange}
            className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
          >
            {i18n.language === 'es' ? 'EN' : 'ES'}
          </button>
        </div>
      </nav>

      {/* Hero Section con imagen de comida */}
      <div className="relative w-full h-64 overflow-hidden">
        <img
          src="/smash-burger-que-es.jpg"
          alt="Delicious Food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-slate-900"></div>
        <div className="absolute bottom-8 left-6 right-6">
          <h2 className="text-4xl font-bold mb-2 text-white">Hungry?<br />We're Ready.</h2>
          <p className="text-sm text-white">Fresh ingredients, flame-grilled perfection, delivered hot to your door in under 30 minutes.</p>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="flex-1 px-4 pb-24 pt-6">
        {/* Sección de Menú con cards grandes */}
        <div className="mb-8" id="menu-section">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-2xl font-bold">Our Menu</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {RAW_MENU_ITEMS.map((item) => (
              <div key={item.id} className="relative bg-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={
                    item.id === 1 ? '/tomato-mozzarella-pizza.webp' : 
                    item.id === 2 ? '/smash-burger-que-es.jpg' : 
                    item.id === 3 ? '/pastas-carbonara.webp' :
                    item.id === 4 ? '/Ensalada-pollo-vinagreta-limon.webp' :
                    '/smash-burger-que-es.jpg'
                  }
                  alt={t(`orderForm.menu.${item.key}`)}
                  className="w-full h-48 object-cover"
                />
                {quantities[item.id] > 0 && (
                  <div className="absolute top-3 right-3 bg-primary text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {quantities[item.id]}
                  </div>
                )}
                <div className="p-4">
                  <h4 className="text-white font-bold text-lg mb-1">{t(`orderForm.menu.${item.key}`)}</h4>
                  <p className="text-gray-400 text-sm mb-3">Fresh ingredients and signature flavors</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold text-xl">${item.price.toLocaleString('es-CO')}</span>
                    <button
                      onClick={() => increment(item.id)}
                      className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-all"
                    >
                      <span className="material-symbols-outlined text-2xl">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario de cliente (expandible) */}
        <div className="bg-slate-800 rounded-2xl p-4 mb-6">
          <h3 className="text-white text-lg font-bold mb-4">Delivery Details</h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              className={`w-full rounded-lg bg-slate-700 border ${
                touched.name && customerName.trim().length === 0
                  ? 'border-red-500'
                  : 'border-slate-600'
              } text-white h-12 px-4 text-sm placeholder-gray-400 focus:border-primary focus:outline-none`}
              placeholder={t('orderForm.namePlaceholder')}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
            />
            {touched.name && customerName.trim().length === 0 && (
              <span className="text-red-400 text-xs">{t('orderForm.nameRequired')}</span>
            )}
            
            <input
              type="email"
              className={`w-full rounded-lg bg-slate-700 border ${
                getEmailValidationState(customerEmail) === 'error'
                  ? 'border-red-500'
                  : getEmailValidationState(customerEmail) === 'invalid'
                  ? 'border-yellow-500'
                  : getEmailValidationState(customerEmail) === 'valid'
                  ? 'border-green-500'
                  : 'border-slate-600'
              } text-white h-12 px-4 text-sm placeholder-gray-400 focus:border-primary focus:outline-none`}
              placeholder={t('orderForm.emailPlaceholder')}
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            />
            {touched.email && customerEmail.trim().length === 0 && (
              <span className="text-red-400 text-xs">{t('orderForm.emailRequired')}</span>
            )}
            {touched.email && customerEmail.trim().length > 0 && !isValidEmail(customerEmail) && (
              <span className="text-yellow-400 text-xs">{t('orderForm.emailInvalid')}</span>
            )}
            {touched.email && isValidEmail(customerEmail) && (
              <span className="text-green-400 text-xs">{t('orderForm.emailValid')}</span>
            )}
            
            <textarea
              className="w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-3 text-sm placeholder-gray-400 focus:border-primary focus:outline-none"
              placeholder={t('orderForm.notesPlaceholder')}
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Footer fijo con total y botón */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 px-4 py-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs">Total</span>
            <span className="text-white text-2xl font-bold">${(total / 1000).toFixed(1)}k</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid(customerName, customerEmail, quantities) || isLoading}
            className="flex-1 max-w-xs bg-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? t('orderForm.processing') : 'Start Order'}
          </button>
        </div>
      </div>

      {/* Modal de éxito */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center flex flex-col items-center border border-slate-700">
            <div className="flex items-center justify-center size-20 bg-green-500/20 rounded-full mb-4">
              <span className="material-symbols-outlined text-5xl text-green-400">check_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{t('orderForm.successTitle')}</h3>
            <p className="text-gray-300 mb-6">{t('orderForm.successText')}</p>
            <div className="bg-slate-700 rounded-xl p-4 w-full mb-6">
              <span className="text-sm text-gray-400 block mb-1">{t('orderForm.orderNumberLabel')}</span>
              <p className="text-2xl font-mono font-bold text-white tracking-wider">{orderNumber}</p>
            </div>
            <button
              onClick={handleModalClose}
              className="bg-primary text-white font-bold py-4 px-8 rounded-xl w-full hover:bg-primary/90 transition-all shadow-lg"
            >{t('orderForm.viewOrderStatus')}</button>
          </div>
        </div>
      )}
    </div>
  );
}