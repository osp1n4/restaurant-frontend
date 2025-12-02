// Menú lateral para el panel de administración
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

const SideNav = () => {
  const navigate = useNavigate();
  // Obtener el correo del usuario logueado desde localStorage (ajusta si usas otro método)
  let email = '';
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    email = user?.email || '';
  } catch {}

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {}
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="flex h-screen min-h-[700px] w-64 flex-col justify-between border-r border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-[#1C1411] p-4 sticky top-0">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-center">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuC3TJZho0q5BgghECIBfRlfPTKr2yPFLOm6ym-nDS0h8ofzroJZpEPT6mMDeJwtrz85xl1SFx0HoLezu4PZwoCeXn3utA3OOxCzDpQEhARRE4uoRT8vM1ounnujTDJXg_ZlePgzQIAY7fOJKEwb9Ivh6sqPqVaRSgouwd1dG3FmhHbUyvAAyhUtEhy0w9LCXW29x0qvFPUyVjyBpfP4Pz2TfjOGPzIcWdxVkKPJR1vEj0_nCbHrqMp8qaW94jzU2mjpXdD7mdoHgwR3')]" />
          <div className="flex flex-col">
            <h1 className="text-[#181210] dark:text-white text-base font-medium leading-normal">Admin Panel</h1>
            <p className="text-[#8d6a5e] dark:text-gray-400 text-sm font-normal leading-normal">Bienvenido{email ? `, ${email}` : ''}</p>
          </div>
        </div>
      <nav className="flex flex-col gap-2 mt-4">
        <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary" href="/users">
          <span className="material-symbols-outlined !font-bold">group</span>
          <p className="text-sm font-bold leading-normal">User Management</p>
        </a>
      </nav>
    </div>
    <div className="flex flex-col gap-4">
      <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" href="#">
        <span className="material-symbols-outlined text-gray-800 dark:text-gray-200">help</span>
        <p className="text-sm font-medium leading-normal">Support</p>
      </a>
      <button
        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
        onClick={handleLogout}
      >
        <span className="material-symbols-outlined mr-2">logout</span>
        <span className="truncate">Logout</span>
      </button>
    </div>
  </aside>

  );
};

export default SideNav;
