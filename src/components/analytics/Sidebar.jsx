

import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext.jsx';
import SelectListbox from '../SelectListbox';

/**
 * Componente de navegación lateral (Sidebar)
 * Muestra menú de navegación principal de la aplicación
 */
function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
    // Forzar re-render de la página actual para que el contenido cambie de idioma inmediatamente
    // Esto se logra actualizando una key en el layout principal (ver nota abajo)
    // Si usas React Router v6, puedes forzar un re-render usando navigate(0) o navigate(location.pathname, {replace: true})
    // Aquí usamos navigate(location.pathname, {replace: true}) para recargar la ruta actual
    navigate(location.pathname, { replace: true });
  };

  // Define allowed menu items by role
  const role = (user?.role || '').toUpperCase();
  let menuItems = [
    { path: '/users', icon: 'person', label: t('sidebar.userManagement'), filled: false, roles: ['ADMIN'] },
    { path: '/kitchen', icon: 'soup_kitchen', label: t('sidebar.kitchen'), filled: false, roles: ['ADMIN', 'KITCHEN'] },
    { path: '/dashboard/analytics', icon: 'analytics', label: t('sidebar.reports'), filled: true, roles: ['ADMIN'] },
    { path: '/admin/reviews', icon: 'reviews', label: t('sidebar.reviewManagement'), filled: false, roles: ['ADMIN'] }
  ];

  // Only show items allowed for the current role
  menuItems = menuItems.filter(item => item.roles.includes(role));

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex-shrink-0 bg-slate-900 p-4 border-r border-slate-700 z-40">
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-white">restaurant</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-medium leading-normal">
                {t('sidebar.userManagement')}
              </h1>
              <p className="text-white text-sm font-normal leading-normal">
                {t('sidebar.reports')}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 mt-4">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-primary/30'
                    : 'hover:bg-slate-800'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${isActive(item.path) ? 'text-primary' : 'text-white'}`}
                  style={{ fontVariationSettings: item.filled && isActive(item.path) ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <p className={`text-sm font-medium leading-normal ${isActive(item.path) ? 'text-primary' : 'text-white'}`}>
                  {item.label}
                </p>
              </button>
            ))}
          </nav>
        </div>
        

        {/* Bottom Actions */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center ">
         
          </div>
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg transition-all">
               <span className="material-symbols-outlined text-2xl text-white">language</span>
            <div className="w-20">
              <SelectListbox
                value={i18n.language}
                onChange={(v) => handleLanguageChange({ target: { value: v } })}
                options={[{ value: 'en', label: 'EN' }, { value: 'es', label: 'ES' }]}
              />
            </div>
          </button>
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-2xl text-white">logout</span>
            <p className="text-sm font-medium leading-normal text-white">Logout</p>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
