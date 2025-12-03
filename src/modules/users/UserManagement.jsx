// Componente principal para la gestión de usuarios


import React, { useEffect, useState } from "react";
import { deactivateUser } from "./usersService";

import DefaultUserAvatar from "./DefaultUserAvatar";
import Pagination from "./Pagination";
import { getUsers } from "./usersService";
import SideNav from "./SideNav";
import { useNavigate } from "react-router-dom";

const statusColors = {
  Active: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300",
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-500",
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  // TODO: agregar filtros y paginación real

  useEffect(() => {
    setLoading(true);
    getUsers()
      .then((res) => {
        // Ajustar según la estructura real de la respuesta
        const data = res.data || res.users || res;
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar usuarios");
        setLoading(false);
      });
  }, []);

  const navigate = useNavigate();
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8f6f4] dark:bg-background-dark group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-row">
        <SideNav />
        <main className="flex-1 p-8">
          <div className="layout-content-container flex flex-col w-full">
            {/* Header */}
            <header className="flex flex-wrap justify-between gap-4 items-center mb-6">
              <div className="flex flex-col gap-1">
                <p className="text-[#181210] dark:text-white text-3xl font-bold leading-tight tracking-tight">User Management</p>
                <p className="text-[#8d6a5e] dark:text-gray-400 text-base font-normal leading-normal">Manage all users, their roles, and system access.</p>
              </div>
              <button
                className="flex min-w-[84px] items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-orange-500 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-orange-600 transition-colors shadow-sm"
                onClick={() => navigate('/users/new')}
              >
                <span className="material-symbols-outlined mr-2">add</span>
                <span className="truncate">Add New User</span>
              </button>
            </header>
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {/* SearchBar */}
              <div className="flex-grow min-w-[20rem]">
                <label className="flex flex-col min-w-40 h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-[#f5f1f0] dark:bg-[#2A1C16] shadow-sm">
                    <div className="text-[#8d6a5e] dark:text-gray-400 flex items-center justify-center pl-4">
                      <span className="material-symbols-outlined">search</span>
                    </div>
                    <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#181210] dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-[#8d6a5e] dark:placeholder:text-gray-500 px-4 pl-2 text-sm font-normal leading-normal" placeholder="Search by name or email..." />
                  </div>
                </label>
              </div>
              {/* Dropdowns */}
              <div className="flex gap-3">
                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f5f1f0] dark:bg-[#2A1C16] px-4 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors">
                  <p className="text-[#181210] dark:text-gray-300 text-sm font-medium leading-normal">Role</p>
                  <span className="material-symbols-outlined text-[#181210] dark:text-gray-300 text-base">expand_more</span>
                </button>
                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#f5f1f0] dark:bg-[#2A1C16] px-4 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors">
                  <p className="text-[#181210] dark:text-gray-300 text-sm font-medium leading-normal">Status</p>
                  <span className="material-symbols-outlined text-[#181210] dark:text-gray-300 text-base">expand_more</span>
                </button>
              </div>
            </div>
            {/* Table */}
            <div className="w-full rounded-xl border border-[#e7deda] dark:border-gray-800 bg-white dark:bg-[#1C1411] shadow-md overflow-hidden min-h-[200px]">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#f5f1f0] dark:bg-[#2A1C16]">
                    <tr>
                      <th className="px-6 py-4 text-left text-[#181210] dark:text-gray-300 text-xs font-medium uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-[#181210] dark:text-gray-300 text-xs font-medium uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-[#181210] dark:text-gray-300 text-xs font-medium uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-[#181210] dark:text-gray-300 text-xs font-medium uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-[#181210] dark:text-gray-300 text-xs font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7deda] dark:divide-gray-800">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">No users found</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id || user.uid} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.displayName || user.name} className="rounded-full w-10 h-10 object-cover" />
                              ) : (
                                <DefaultUserAvatar />
                              )}
                              <span className="text-[#181210] dark:text-white text-sm font-medium">{user.displayName || user.name || user.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#8d6a5e] dark:text-gray-400 text-sm font-normal">{user.email}</td>
                          <td className="px-6 py-4 text-[#8d6a5e] dark:text-gray-400 text-sm font-normal">{user.role || user.customClaims?.role || "-"}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[user.status || "Active"]}`}>{user.status || "Active"}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {String(user.status || '').toLowerCase() !== 'desactivado' && (
                                <>
                                  <button
                                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                    onClick={() => navigate(`/users/${user.id || user.uid}`)}
                                    title="Editar usuario"
                                  >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                  </button>
                                  <button
                                    className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                                    onClick={() => {
                                      setUserToDeactivate(user);
                                      setShowDeactivateModal(true);
                                    }}
                                    title="Desactivar usuario"
                                  >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {/* Footer: paginación y resultados */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-[#8d6a5e] dark:text-gray-400">
                Showing <span className="font-medium text-[#181210] dark:text-white">1</span> to <span className="font-medium text-[#181210] dark:text-white">{users.length}</span> of <span className="font-medium text-[#181210] dark:text-white">{users.length}</span> results
              </p>
              <div className="flex gap-2">
                <button className="flex items-center justify-center h-10 px-4 rounded-lg bg-white dark:bg-[#1C1411] border border-[#e7deda] dark:border-gray-800 text-[#181210] dark:text-white text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Previous
                </button>
                <button className="flex items-center justify-center h-10 px-4 rounded-lg bg-white dark:bg-[#1C1411] border border-[#e7deda] dark:border-gray-800 text-[#181210] dark:text-white text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        {/* Modal de confirmación de desactivación */}
        {showDeactivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-[#1C1411] rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-[#181210] dark:text-white">¿Desactivar usuario?</h2>
              <p className="mb-6 text-[#8d6a5e] dark:text-gray-400">¿Estás seguro de que deseas desactivar a <span className="font-semibold">{userToDeactivate?.displayName || userToDeactivate?.name || userToDeactivate?.email}</span>? El usuario no podrá acceder al sistema.</p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-[#181210] dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={() => {
                    setShowDeactivateModal(false);
                    setUserToDeactivate(null);
                  }}
                  disabled={deactivating}
                >Cancelar</button>
                <button
                  className="px-4 py-2 rounded-md bg-red-600 text-white font-bold hover:bg-red-700"
                  onClick={async () => {
                    setDeactivating(true);
                    try {
                      await deactivateUser(userToDeactivate.id || userToDeactivate.uid);
                      setUsers(users => users.map(u => (u.id === userToDeactivate.id || u.uid === userToDeactivate.uid) ? { ...u, status: 'Inactive' } : u));
                      setShowDeactivateModal(false);
                      setUserToDeactivate(null);
                    } catch (err) {
                      alert('Error al desactivar usuario');
                    } finally {
                      setDeactivating(false);
                    }
                  }}
                  disabled={deactivating}
                >{deactivating ? 'Desactivando...' : 'Confirmar'}</button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

export default UserManagement;
