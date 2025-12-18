// Hook para mantener la sesión activa
import { useEffect, useRef } from 'react';
import { auth } from '../firebaseConfig';

/**
 * Hook personalizado para mantener la sesión activa
 * Refresca el token de Firebase automáticamente cada 9 minutos
 * Firebase tokens expiran en 1 hora, pero refrescamos frecuentemente para mantener sesión activa
 */
export function useSessionKeepAlive() {
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    // Tiempo de inactividad máximo: 10 minutos (600000 ms)
    const MAX_INACTIVE_TIME = 10 * 60 * 1000;
    // Intervalo de refresh del token: 9 minutos (540000 ms)
    const REFRESH_INTERVAL = 9 * 60 * 1000;

    // Función para actualizar el tiempo de última actividad
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Eventos que indican actividad del usuario
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'focus'
    ];

    // Registrar eventos de actividad
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Función para refrescar el token
    const refreshToken = async () => {
      try {
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          console.log('No hay usuario autenticado');
          return;
        }

        // Verificar tiempo de inactividad
        const inactiveTime = Date.now() - lastActivityRef.current;
        
        if (inactiveTime > MAX_INACTIVE_TIME) {
          console.log('Usuario inactivo por más de 10 minutos');
          // No refrescamos el token si el usuario está inactivo
          return;
        }

        // Forzar refresh del token
        const token = await currentUser.getIdToken(true);
        console.log('Token refrescado exitosamente');
        
        // Opcional: verificar customClaims actualizados
        const tokenResult = await currentUser.getIdTokenResult();
        console.log('Token válido hasta:', new Date(tokenResult.expirationTime));
        
      } catch (error) {
        console.error('Error al refrescar token:', error);
        
        // Si hay error de autenticación, redirigir al login
        if (error.code === 'auth/user-token-expired' || 
            error.code === 'auth/network-request-failed') {
          console.log('Token expirado, redirigiendo al login');
          window.location.href = '/login';
        }
      }
    };

    // Refrescar token inmediatamente al montar
    refreshToken();

    // Configurar intervalo para refrescar el token
    intervalRef.current = setInterval(refreshToken, REFRESH_INTERVAL);

    // Cleanup al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  return null;
}

/**
 * Función para verificar manualmente si la sesión está activa
 */
export async function checkSessionValidity() {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return { valid: false, message: 'No hay usuario autenticado' };
    }

    // Intentar obtener un nuevo token
    await currentUser.getIdToken(true);
    
    return { valid: true, message: 'Sesión válida' };
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    return { 
      valid: false, 
      message: error.code === 'auth/user-token-expired' 
        ? 'Tu sesión ha expirado' 
        : 'Error al verificar la sesión' 
    };
  }
}
