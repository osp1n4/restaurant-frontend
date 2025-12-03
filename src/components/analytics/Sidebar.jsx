import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';

/**
 * Componente de navegación lateral (Sidebar)
 * Muestra menú de navegación principal de la aplicación
 */
function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  // Define allowed menu items by role
  const role = (user?.role || '').toUpperCase();
  let menuItems = [
    { path: '/users', icon: 'person', label: 'User Management', filled: false, roles: ['ADMIN'] },
    { path: '/kitchen', icon: 'soup_kitchen', label: 'Kitchen', filled: false, roles: ['ADMIN', 'KITCHEN'] },
    { path: '/dashboard/analytics', icon: 'analytics', label: 'Reports', filled: true, roles: ['ADMIN'] },
    { path: '/admin/reviews', icon: 'reviews', label: 'Review Management', filled: false, roles: ['ADMIN'] }
  ];

  // Only show items allowed for the current role
  menuItems = menuItems.filter(item => item.roles.includes(role));

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sticky top-0 h-screen w-64 flex-shrink-0 bg-white dark:bg-background-dark/50 p-4 border-r border-gray-200 dark:border-gray-800">
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-white">restaurant</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-[#111813] dark:text-white text-base font-medium leading-normal">
                Restaurant Admin
              </h1>
              <p className="text-[#63886f] dark:text-gray-400 text-sm font-normal leading-normal">
                Management Panel
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
                    ? 'bg-primary/20 dark:bg-primary/30 text-primary'
                    : 'text-[#111813] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: item.filled && isActive(item.path) ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <p className={`text-sm font-medium leading-normal ${isActive(item.path) ? 'text-[#111813] dark:text-white' : ''}`}>
                  {item.label}
                </p>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-1">
          <button className="flex items-center gap-3 px-3 py-2 text-[#111813] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all">
            <span className="material-symbols-outlined text-2xl">settings</span>
            <p className="text-sm font-medium leading-normal">Settings</p>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-3 py-2 text-[#111813] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-2xl">logout</span>
            <p className="text-sm font-medium leading-normal">Logout</p>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
