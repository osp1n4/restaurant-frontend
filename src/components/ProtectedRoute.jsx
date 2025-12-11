import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Usa tu contexto real de autenticación
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(AuthContext);

  // Normaliza roles permitidos a mayúsculas
  const normalizedAllowedRoles = allowedRoles ? allowedRoles.map(r => r.toUpperCase()) : null;
  const userRole = (user?.role || '').toUpperCase();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    } else if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
      navigate('/');
    }
  }, [isLoggedIn, userRole, normalizedAllowedRoles, navigate]);

  if (!isLoggedIn) return null;
  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) return null;
  return children;
}

export default ProtectedRoute;
