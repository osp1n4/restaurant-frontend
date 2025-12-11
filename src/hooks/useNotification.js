import { useEffect, useRef } from 'react';

import { getEnvVar } from '../utils/getEnvVar';
const NOTIFICATION_URL = getEnvVar('VITE_NOTIFICATION_URL') || 'http://localhost:3003/notifications/stream';

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
        
        const eventSource = new EventSource(NOTIFICATION_URL);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          
          reconnectAttempts.current = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            

            // Filtrar por orderId si se especificó
            const currentOrderIds = orderIdsRef.current;
            

            if (currentOrderIds.length > 0) {
              
              if (currentOrderIds.includes(notification.orderId)) {
                
                onNotificationRef.current(notification);
              } else {
                
              }
            } else {
              // Si no hay filtro, pasar todas las notificaciones
              
              onNotificationRef.current(notification);
            }
          } catch (error) {
            
          }
        };

        eventSource.onerror = (error) => {
          
          eventSource.close();

          // Reintentar conexión con backoff exponencial
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
            

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              connect();
            }, delay);
          } else {
            
          }
        };
      } catch (error) {
        
      }
    };

    // ✅ Conectar solo una vez
    connect();

    return () => {
      // Limpiar al desmontar
      if (eventSourceRef.current) {
      
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