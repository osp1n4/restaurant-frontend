import Sidebar from './analytics/Sidebar';
import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
