// Componente para mostrar alertas de sesión
import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';

const SessionAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState('info'); // 'info', 'warning', 'error'

  useEffect(() => {
    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/', '/order', '/orders', '/login'];
    
    // Listener para cambios en el estado de autenticación
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const currentPath = window.location.pathname;
      const isPublicRoute = publicRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      );
      
      // Solo mostrar alerta si no hay usuario Y estamos en una ruta protegida
      if (!user && !isPublicRoute) {
        setMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        setAlertType('error');
        setShowAlert(true);
        
        // Redirigir al home después de 3 segundos (no al login)
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    });

    // Listener personalizado para eventos de sesión
    const handleSessionExpired = (event) => {
      setMessage(event.detail?.message || 'Tu sesión ha expirado');
      setAlertType('error');
      setShowAlert(true);
    };

    const handleSessionWarning = (event) => {
      setMessage(event.detail?.message || 'Tu sesión está por expirar');
      setAlertType('warning');
      setShowAlert(true);
    };

    window.addEventListener('session:expired', handleSessionExpired);
    window.addEventListener('session:warning', handleSessionWarning);

    return () => {
      unsubscribe();
      window.removeEventListener('session:expired', handleSessionExpired);
      window.removeEventListener('session:warning', handleSessionWarning);
    };
  }, []);

  const handleClose = () => {
    setShowAlert(false);
  };

  if (!showAlert) return null;

  const alertStyles = {
    info: 'bg-blue-500/90 border-blue-600',
    warning: 'bg-yellow-500/90 border-yellow-600',
    error: 'bg-red-500/90 border-red-600'
  };

  const iconStyles = {
    info: 'info',
    warning: 'warning',
    error: 'error'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`${alertStyles[alertType]} text-white px-6 py-4 rounded-lg shadow-2xl border-2 max-w-md flex items-start gap-3`}>
        <span className="material-symbols-outlined text-2xl">
          {iconStyles[alertType]}
        </span>
        <div className="flex-1">
          <p className="font-semibold mb-1">
            {alertType === 'error' ? 'Sesión Expirada' : 
             alertType === 'warning' ? 'Advertencia de Sesión' : 
             'Información'}
          </p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
};

export default SessionAlert;

// Funciones auxiliares para disparar eventos de sesión
export const emitSessionExpired = (message) => {
  window.dispatchEvent(new CustomEvent('session:expired', { 
    detail: { message } 
  }));
};

export const emitSessionWarning = (message) => {
  window.dispatchEvent(new CustomEvent('session:warning', { 
    detail: { message } 
  }));
};
