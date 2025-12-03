import { useEffect, useRef } from 'react';

// Usar process.env para que Jest no falle al parsear import.meta
const NOTIFICATION_URL = process.env.VITE_NOTIFICATION_URL || 'http://localhost:3003/notifications/stream';

/**
 * Hook para conectar con el servicio de notificaciones SSE
 */
export function useNotifications(onNotification, orderIds = []) {
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // ✅ Usar ref para evitar cambios en cada render
  const onNotificationRef = useRef(onNotification);
  const orderIdsRef = useRef(orderIds);

  // ✅ Actualizar refs cuando cambien
  useEffect(() => {
    onNotificationRef.current = onNotification;
    orderIdsRef.current = orderIds;
  }, [onNotification, orderIds]);

  useEffect(() => {
    const connect = () => {
      // Limpiar conexión anterior si existe
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      try {
        console.log('🔌 Conectando a notificaciones SSE...');
        const eventSource = new EventSource(NOTIFICATION_URL);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('✅ Conectado a notificaciones SSE');
          reconnectAttempts.current = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            console.log('📩 SSE: Notificación recibida en hook:', notification);

            // Filtrar por orderId si se especificó
            const currentOrderIds = orderIdsRef.current;
            console.log('🔍 SSE: Filtro de orderIds:', currentOrderIds);

            if (currentOrderIds.length > 0) {
              console.log('🔍 SSE: Buscando orderId:', notification.orderId, 'en:', currentOrderIds);
              if (currentOrderIds.includes(notification.orderId)) {
                console.log('✅ SSE: Notificación coincide con filtro, pasando al handler');
                onNotificationRef.current(notification);
              } else {
                console.log('⏭️ SSE: Notificación NO coincide con filtro, ignorando');
              }
            } else {
              // Si no hay filtro, pasar todas las notificaciones
              console.log('✅ SSE: Sin filtro, pasando notificación al handler');
              onNotificationRef.current(notification);
            }
          } catch (error) {
            console.error('❌ SSE: Error al parsear notificación:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('❌ Error en SSE:', error);
          eventSource.close();

          // Reintentar conexión con backoff exponencial
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
            console.log(`⏳ Reintentando conexión en ${delay}ms...`);

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              connect();
            }, delay);
          } else {
            console.error('❌ Máximo de reintentos alcanzado');
          }
        };
      } catch (error) {
        console.error('Error al crear EventSource:', error);
      }
    };

    // ✅ Conectar solo una vez
    connect();

    return () => {
      // Limpiar al desmontar
      if (eventSourceRef.current) {
        console.log('🔌 Cerrando conexión SSE...');
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []); // ✅ Array vacío - solo se ejecuta al montar

  return {
    disconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    }
  };
}