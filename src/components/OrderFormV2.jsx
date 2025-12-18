import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createOrder } from '../services/api';
import { useOrderFormValidation } from '../hooks/useOrderFormValidation';
import { useInfiniteMenu } from '../hooks/useInfiniteMenu';
import MenuItemCard from './MenuItemCard';

/**
 * OrderForm con lazy loading y paginación infinita
 * Cumple con US-001: Visualizar menú con tiempos de carga optimizados
 */
export default function OrderFormV2() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  // Estado para categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Hooks personalizados
  const {
    touched,
    setTouched,
    getEmailValidationState,
    isFormValid: validateForm
  } = useOrderFormValidation();

  const {
    items: menuItems,
    loading: loadingMenu,
    error: menuError,
    hasMore,
    loadMore,
    retry
  } = useInfiniteMenu(selectedCategory);

  // Estado del formulario
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [quantities, setQuantities] = useState({});

  // Estados de UI
  const [showModal, setShowModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCart, setShowCart] = useState(false); // Toggle para mostrar/ocultar carrito

  // Ref para Intersection Observer (scroll infinito)
  const observerTarget = useRef(null);

  /**
   * Scroll infinito: Cargar más items cuando llega al final
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMenu) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMenu, loadMore]);

  /**
   * Incrementar cantidad de un item
   */
  const handleAddItem = useCallback((itemId) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  }, []);

  /**
   * Decrementar cantidad de un item
   */
  const handleRemoveItem = useCallback((itemId) => {
    setQuantities(prev => {
      const currentQty = prev[itemId] || 0;
      if (currentQty <= 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [itemId]: currentQty - 1
      };
    });
  }, []);

  /**
   * Calcular total del pedido
   */
  const calculateTotal = useCallback(() => {
    return menuItems.reduce((total, item) => {
      const qty = quantities[item._id] || 0;
      return total + (item.price * qty);
    }, 0);
  }, [menuItems, quantities]);

  /**
   * Validar si hay items seleccionados
   */
  const hasSelectedItems = useCallback(() => {
    return Object.values(quantities).some(qty => qty > 0);
  }, [quantities]);

  /**
   * Obtener items del carrito con información completa
   */
  const getCartItems = useCallback(() => {
    return menuItems
      .filter(item => quantities[item._id] > 0)
      .map(item => ({
        ...item,
        quantity: quantities[item._id],
        subtotal: item.price * quantities[item._id]
      }));
  }, [menuItems, quantities]);

  /**
   * Enviar pedido
   */
  const handleSubmit = async () => {
    setTouched({ name: true, email: true });

    if (!customerName.trim() || !customerEmail.trim() || !hasSelectedItems()) {
      setError(t('orderForm.errorRequired', 'Por favor completa todos los campos y selecciona al menos un producto'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Preparar items del pedido
      const items = menuItems
        .filter(item => quantities[item._id] > 0)
        .map(item => ({
          name: item.name,
          quantity: quantities[item._id],
          price: item.price,
        }));

      const orderData = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        items,
        notes: notes.trim() || undefined,
      };

      const response = await createOrder(orderData);
      console.log('Order created:', response);
      setOrderNumber(response.orderNumber || response.orderId);
      setShowModal(true);
    } catch (err) {
      setError(t('orderForm.errorCreating', 'Error al crear el pedido. Por favor, intenta de nuevo.'));
      console.error('Error creating order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar modal y redireccionar
   */
  const handleModalClose = () => {
    setShowModal(false);
    console.log('Navigating to order:', orderNumber);
    if (orderNumber) {
      navigate(`/orders/${orderNumber}`);
    } else {
      console.error('No order number available');
    }
  };

  const total = calculateTotal();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header superior con navegación */}
      <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-white hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h1 className="text-white text-xl font-bold">{t('home.title')}</h1>
        </div>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
          className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
        >
          {i18n.language === 'es' ? 'EN' : 'ES'}
        </button>
      </nav>

      {/* Hero Section */}
      <div className="relative w-full h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=400&fit=crop&q=70&auto=format"
          alt="Delicious Food"
          className="w-full h-full object-cover"
          fetchpriority="high"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-slate-900"></div>
        <div className="absolute bottom-8 left-6 right-6">
          <h2 className="text-4xl font-bold mb-2 text-white">
            {t('orderForm.heroTitle', 'Hungry?')}<br/>{t('orderForm.heroSubtitle', "We're Ready.")}
          </h2>
          <p className="text-sm text-white">
            {t('orderForm.heroDescription', 'Fresh ingredients, flame-grilled perfection, delivered hot to your door in under 30 minutes.')}
          </p>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="flex-1 px-4 pb-24 pt-6">
        {/* Sección de Menú */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-2xl font-bold">
              {t('orderForm.menuTitle', 'Our Menu')}
            </h3>
            {menuItems.length > 0 && (
              <span className="text-gray-400 text-sm">
                {menuItems.length} {t('orderForm.products', 'productos')}
              </span>
            )}
          </div>

          {/* Menú de categorías horizontal */}
          <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === null
                    ? 'bg-primary text-white shadow-lg shadow-primary/50'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                {t('orderForm.allCategories', 'Todos')}
              </button>
              <button
                onClick={() => setSelectedCategory('pizza')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'pizza'
                    ? 'bg-primary text-white shadow-lg shadow-primary/50'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                🍕 {t('orderForm.pizza', 'Pizzas')}
              </button>
              <button
                onClick={() => setSelectedCategory('burger')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'burger'
                    ? 'bg-primary text-white shadow-lg shadow-primary/50'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                🍔 {t('orderForm.burger', 'Hamburguesas')}
              </button>
              <button
                onClick={() => setSelectedCategory('pasta')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'pasta'
                    ? 'bg-primary text-white shadow-lg shadow-primary/50'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                🍝 {t('orderForm.pasta', 'Pastas')}
              </button>
              <button
                onClick={() => setSelectedCategory('salad')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'salad'
                    ? 'bg-primary text-white shadow-lg shadow-primary/50'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                🥗 {t('orderForm.salad', 'Ensaladas')}
              </button>
              <button
                onClick={() => setSelectedCategory('beverage')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'beverage'
                    ? 'bg-primary text-white shadow-lg shadow-primary/50'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                🥤 {t('orderForm.beverage', 'Bebidas')}
              </button>
              <button
                onClick={() => setSelectedCategory('dessert')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'dessert'
                    ? 'bg-primary text-white shadow-lg shadow-primary/50'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                🍰 {t('orderForm.dessert', 'Postres')}
              </button>
            </div>
          </div>

          {/* Error al cargar menú */}
          {menuError && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-4">
              <p className="text-red-300 text-sm">{menuError}</p>
              <button
                onClick={retry}
                className="mt-2 text-red-300 hover:text-red-200 underline text-sm"
              >
                {t('orderForm.retry', 'Reintentar')}
              </button>
            </div>
          )}

          {/* Grid de productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                quantity={quantities[item._id] || 0}
                onAdd={handleAddItem}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Loading indicator */}
          {loadingMenu && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Scroll trigger para infinite loading */}
          {hasMore && !loadingMenu && (
            <div ref={observerTarget} className="h-10"></div>
          )}

          {/* No more items */}
          {!hasMore && menuItems.length > 0 && (
            <p className="text-center text-gray-500 py-4">
              {t('orderForm.noMoreItems', 'No hay más productos')}
            </p>
          )}
        </div>

        {/* Resumen del Carrito (US-002 Criterio 3) */}
        {hasSelectedItems() && (
          <div className="bg-slate-800 rounded-2xl p-4 mb-6">
            <button
              onClick={() => setShowCart(!showCart)}
              className="w-full flex items-center justify-between text-white font-bold text-lg mb-2"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white">shopping_cart</span>
                <span className="text-white">{t('orderForm.cartSummary', 'Resumen del Pedido')} ({getCartItems().length} productos)</span>
              </div>
              <span className="material-symbols-outlined transition-transform" style={{ transform: showCart ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                expand_more
              </span>
            </button>

            {/* Lista de productos en el carrito */}
            {showCart && (
              <div className="mt-4 space-y-3">
                {getCartItems().map((item) => (
                  <div key={item._id} className="flex items-center justify-between bg-slate-700 rounded-lg p-3">
                    <div className="flex items-center gap-3 flex-1">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{item.name}</p>
                        <p className="text-gray-400 text-xs">
                          ${item.price.toLocaleString('es-CO')} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold">
                        ${item.subtotal.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Total del carrito */}
                <div className="border-t border-slate-600 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-semibold">
                      {t('orderForm.subtotal', 'Subtotal')}:
                    </span>
                    <span className="text-white text-xl font-bold">
                      ${total.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Formulario de cliente */}
        <div className="bg-slate-800 rounded-2xl p-4 mb-6">
          <h3 className="text-white text-lg font-bold mb-4">
            {t('orderForm.deliveryDetails', 'Delivery Details')}
          </h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              className={`w-full rounded-lg bg-slate-700 border ${
                touched.name && !customerName.trim()
                  ? 'border-red-500'
                  : 'border-slate-600'
              } text-white h-12 px-4 text-sm placeholder-gray-400 focus:border-primary focus:outline-none`}
              placeholder={t('orderForm.namePlaceholder')}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
            />
            <input
              type="email"
              className={`w-full rounded-lg bg-slate-700 border ${
                touched.email && !customerEmail.trim()
                  ? 'border-red-500'
                  : getEmailValidationState(customerEmail, touched.email) === 'valid'
                  ? 'border-green-500'
                  : 'border-slate-600'
              } text-white h-12 px-4 text-sm placeholder-gray-400 focus:border-primary focus:outline-none`}
              placeholder={t('orderForm.emailPlaceholder')}
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            />
            <textarea
              className="w-full rounded-lg bg-slate-700 border border-slate-600 text-white px-4 py-3 text-sm placeholder-gray-400 focus:border-primary focus:outline-none"
              placeholder={t('orderForm.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Footer fijo con total y botón */}
      {hasSelectedItems() && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <p className="text-gray-400 text-sm">{t('orderForm.totalLabel')}</p>
              <p className="text-white text-2xl font-bold">${total.toLocaleString('es-CO')}</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('orderForm.processing') : t('orderForm.placeOrder')}
            </button>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">
                {t('orderForm.successTitle')}
              </h3>
              <p className="text-gray-400 mb-4">
                {t('orderForm.successText')}
              </p>
              <p className="text-white text-lg mb-6">
                {t('orderForm.orderNumberLabel')}: <span className="font-bold text-primary">{orderNumber}</span>
              </p>
              <button
                onClick={handleModalClose}
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                {t('orderForm.viewOrderStatus')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
