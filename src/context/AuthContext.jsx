import { createContext, useState } from 'react';

// Contexto de autenticación básico
export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  // Estado simulado, reemplaza con tu lógica real
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Simulación de login
  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  // Simulación de logout
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
