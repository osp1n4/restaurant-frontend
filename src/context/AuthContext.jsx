import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Contexto de autenticación con persistencia
export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde Firebase Auth al cargar
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener el token con los custom claims
          const tokenResult = await firebaseUser.getIdTokenResult();
          const role = tokenResult.claims.role;
          
          // Verificar que tenga rol ADMIN o KITCHEN
          if (role === 'ADMIN' || role === 'KITCHEN') {
            const userData = {
              email: firebaseUser.email,
              role: role,
              uid: firebaseUser.uid,
              ...tokenResult.claims
            };
            
            setUser(userData);
            setIsLoggedIn(true);
            // Persistir en localStorage
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            // Usuario sin rol válido
            setUser(null);
            setIsLoggedIn(false);
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error obteniendo claims:', error);
          setUser(null);
          setIsLoggedIn(false);
          localStorage.removeItem('user');
        }
      } else {
        // No hay usuario autenticado
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Login - actualizar estado
  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout - limpiar estado y cerrar sesión en Firebase
  const logout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error durante logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
