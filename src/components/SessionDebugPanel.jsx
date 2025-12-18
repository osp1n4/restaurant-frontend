// Componente de prueba para verificar el sistema de sesión
import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { checkSessionValidity } from '../hooks/useSessionKeepAlive';

const SessionDebugPanel = () => {
  const { user, sessionActive, refreshSession, logout } = useSession();
  const [lastRefresh, setLastRefresh] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      checkSessionValidity().then(status => {
        setSessionStatus(status);
      });
    }, 5000); // Verificar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    const result = await refreshSession();
    setLastRefresh(new Date().toLocaleTimeString());
    console.log('Refresh manual:', result);
  };

  if (!sessionActive) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-slate-800 text-white p-4 rounded-lg shadow-xl border border-slate-600 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">🔒 Debug Sesión</h3>
        <span className={`h-2 w-2 rounded-full ${sessionStatus?.valid ? 'bg-green-500' : 'bg-red-500'}`}></span>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-gray-400">Usuario:</span>
          <span className="ml-2 font-mono">{user?.email || 'N/A'}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Rol:</span>
          <span className="ml-2 font-semibold text-blue-400">{user?.role || 'N/A'}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Estado:</span>
          <span className={`ml-2 font-semibold ${sessionStatus?.valid ? 'text-green-400' : 'text-red-400'}`}>
            {sessionStatus?.valid ? '✓ Activa' : '✗ Inactiva'}
          </span>
        </div>
        
        {user?.tokenExpiration && (
          <div>
            <span className="text-gray-400">Expira:</span>
            <span className="ml-2 font-mono text-xs">
              {new Date(user.tokenExpiration).toLocaleTimeString()}
            </span>
          </div>
        )}
        
        {lastRefresh && (
          <div>
            <span className="text-gray-400">Último refresh:</span>
            <span className="ml-2 font-mono text-xs">{lastRefresh}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleManualRefresh}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
        >
          Refrescar
        </button>
        <button
          onClick={logout}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded transition-colors"
        >
          Salir
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        <p>• Token refresca cada 9min</p>
        <p>• Inactividad max: 10min</p>
      </div>
    </div>
  );
};

export default SessionDebugPanel;
