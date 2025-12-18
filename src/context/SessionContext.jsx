// Context para manejar la sesión globalmente
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { useSessionKeepAlive } from '../hooks/useSessionKeepAlive';

const SessionContext = createContext(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe usarse dentro de SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);

  // Activar el hook de keep-alive
  useSessionKeepAlive();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener token y customClaims
          const tokenResult = await firebaseUser.getIdTokenResult();
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            customClaims: tokenResult.claims,
            role: tokenResult.claims.admin ? 'ADMIN' : 
                  (tokenResult.claims.role ? String(tokenResult.claims.role).toUpperCase() : 'USER'),
            tokenExpiration: tokenResult.expirationTime
          };
          
          setUser(userData);
          setSessionActive(true);
          
          console.log('Usuario autenticado:', userData.email);
          console.log('Rol:', userData.role);
          console.log('Token expira:', new Date(tokenResult.expirationTime));
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          setUser(null);
          setSessionActive(false);
        }
      } else {
        setUser(null);
        setSessionActive(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setSessionActive(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const refreshSession = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.getIdToken(true);
        const tokenResult = await currentUser.getIdTokenResult();
        
        setUser(prev => ({
          ...prev,
          customClaims: tokenResult.claims,
          tokenExpiration: tokenResult.expirationTime
        }));
        
        console.log('Sesión refrescada exitosamente');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al refrescar sesión:', error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    sessionActive,
    logout,
    refreshSession,
    isAdmin: user?.role === 'ADMIN' || user?.customClaims?.admin === true,
    isKitchen: user?.role === 'KITCHEN',
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
