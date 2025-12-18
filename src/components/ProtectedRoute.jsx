import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Usa tu contexto real de autenticación
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles, requireAdmin }) {
  const navigate = useNavigate();
  const { isLoggedIn, user, loading } = useContext(AuthContext);

  // Si requireAdmin es true, solo permitir ADMIN
  const rolesPermitidos = requireAdmin ? ['ADMIN'] : allowedRoles;

  // Normaliza roles permitidos a mayúsculas
  const normalizedAllowedRoles = rolesPermitidos ? rolesPermitidos.map(r => r.toUpperCase()) : null;
  const userRole = (user?.role || '').toUpperCase();

  useEffect(() => {
    // No hacer nada mientras está cargando la sesión
    if (loading) return;

    if (!isLoggedIn) {
      navigate('/');
    } else if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
      // Redirigir al cocinero a /kitchen si intenta acceder a rutas de admin
      if (userRole === 'KITCHEN') {
        navigate('/kitchen');
      } else {
        navigate('/');
      }
    }
  }, [isLoggedIn, userRole, normalizedAllowedRoles, navigate, loading]);

  // Mostrar loading mientras verifica la sesión
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;
  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) return null;
  return children;
}

export default ProtectedRoute;
