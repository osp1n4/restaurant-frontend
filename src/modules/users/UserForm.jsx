import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { createUser, getUsers, updateUser, deleteUser } from "./usersService";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from '../../components/analytics/Sidebar';
import SelectListbox from '../../components/SelectListbox';
import RoleIcon from '../../components/RoleIcon';

// Las etiquetas se traducirán dentro del componente usando i18n

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "KITCHEN",
};


const UserForm = () => {
  const { t } = useTranslation();
    const roles = [
      { value: "ADMIN", key: "roleadmin", leftIcon: <RoleIcon role="ADMIN" /> },
      { value: "KITCHEN", key: "rolekitchen", leftIcon: <RoleIcon role="KITCHEN" /> },
      { value: "WAITER", key: "rolewaiter", leftIcon: <RoleIcon role="WAITER" /> },
    ];
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getUsers().then((res) => {
        const data = res.data || res.users || res;
        const user = (Array.isArray(data) ? data : []).find(u => (u.id || u.uid) === id);
        if (user) {
          setForm({
            name: user.displayName || user.name || "",
            email: user.email || "",
            password: "",
            confirmPassword: "",
            role: user.role || user.customClaims?.role || "EDITOR",
          });
        } else {
          setError(t('users.notFound', 'Usuario no encontrado'));
        }
        setLoading(false);
      }).catch(() => {
        setError(t('users.loadError', 'Error al cargar usuario'));
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleDelete = async () => {
    if (!window.confirm(t('users.deleteConfirm', '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.'))) return;
    setDeleteLoading(true);
    setError("");
    setSuccess("");
    try {
      await deleteUser(id);
      setSuccess(t('users.deleteSuccess', 'Usuario eliminado exitosamente.'));
      setTimeout(() => navigate("/users"), 1200);
    } catch (err) {
      setError(t('users.deleteError', 'Error al eliminar usuario. ') + (err.message || ""));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!form.name || !form.email || !form.role) {
      return t('users.requiredFields', 'Todos los campos son obligatorios.');
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      return t('users.invalidEmail', 'El correo no es válido.');
    }
    if (!isEdit) {
      if (!form.password || !form.confirmPassword) {
        return t('users.passwordRequired', 'La contraseña es obligatoria.');
      }
      if (form.password.length < 6) {
        return t('users.passwordMinLength', 'La contraseña debe tener al menos 6 caracteres.');
      }
      if (form.password !== form.confirmPassword) {
        return t('users.passwordsNoMatch', 'Las contraseñas no coinciden.');
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await updateUser(id, {
          displayName: form.name,
          role: form.role,
        });
        setSuccess(t('users.updateSuccess', 'Usuario actualizado exitosamente.'));
      } else {
        await createUser({
          displayName: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        setSuccess(t('users.createSuccess', 'Usuario creado exitosamente.'));
      }
      // Emitir evento para que la lista de usuarios se refresque inmediatamente
      window.dispatchEvent(new CustomEvent('users:changed'));
      setTimeout(() => navigate("/users"), 600);
    } catch (err) {
      setError((isEdit ? t('users.updateError', 'Error al actualizar usuario. ') : t('users.createError', 'Error al crear usuario. ')) + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(initialState);
    setError("");
    setSuccess("");
    navigate("/users");
  };

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-auto">
      <div className="layout-container flex h-full grow flex-row">
        <Sidebar />
        <main className="flex-1 p-8 ml-64 min-h-screen">
          <div className="layout-content-container flex flex-col w-full max-w-4xl mx-auto">
            <header className="flex flex-col gap-1 mb-8">
              <p className="text-white text-3xl font-bold leading-tight tracking-tight">{isEdit ? t('users.editTitle', 'Editar usuario') : t('users.addTitle', 'Agregar usuario')}</p>
              <p className="text-gray-400 text-base font-normal leading-normal">{isEdit ? t('users.editSubtitle', 'Edita los datos del usuario.') : t('users.addSubtitle', 'Completa los datos para agregar un nuevo usuario.')}</p>
            </header>
            <div className="bg-slate-900 p-8 rounded-xl shadow-xl border border-slate-700">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="name">{t('users.fullName', 'Nombre completo')}</label>
            <div>
              <input 
                className="block w-full rounded-lg border-0 py-3 px-4 text-white bg-slate-800 shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary transition-all" 
                id="name" 
                name="name" 
                placeholder={t('users.fullNamePlaceholder', 'Ej: Juan Pérez')} 
                type="text" 
                value={form.name} 
                onChange={handleChange} 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="email">{t('users.emailLabel', 'Correo electrónico')}</label>
            <div>
              <input
                className="block w-full rounded-lg border-0 py-3 px-4 text-white bg-slate-800 shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                id="email"
                name="email"
                placeholder={t('users.emailPlaceholder', 'correo@ejemplo.com')}
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={isEdit}
              />
            </div>
          </div>
          {!isEdit && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="password">{t('users.passwordLabel', 'Contraseña')}</label>
                <div>
                  <input 
                    className="block w-full rounded-lg border-0 py-3 px-4 text-white bg-slate-800 shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary transition-all" 
                    id="password" 
                    name="password" 
                    placeholder={t('users.passwordPlaceholder', 'Ingresa una contraseña segura')} 
                    type="password" 
                    value={form.password} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="confirmPassword">{t('users.confirmPasswordLabel', 'Confirmar contraseña')}</label>
                <div>
                  <input 
                    className="block w-full rounded-lg border-0 py-3 px-4 text-white bg-slate-800 shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary transition-all" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    placeholder={t('users.confirmPasswordPlaceholder', 'Repite la contraseña')} 
                    type="password" 
                    value={form.confirmPassword} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="role">{t('users.roleLabel', 'Rol')}</label>
            <div>
              <SelectListbox
                value={form.role}
                onChange={(v) => setForm(f => ({ ...f, role: v }))}
                options={roles.map(r => ({ value: r.value, label: t(`users.${r.key}`, r.key) }))}
              />
            </div>
          </div>
          {(error || success) && (
            <div className={`p-4 rounded-lg text-center text-sm font-medium ${error ? 'bg-red-900/50 text-red-300 border border-red-800' : 'bg-green-900/50 text-green-300 border border-green-800'}`}>
              {error || success}
            </div>
          )}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-700">
            <button 
              className="flex min-w-[100px] items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-slate-800 text-gray-300 text-sm font-medium leading-normal tracking-[0.015em] hover:bg-slate-700 transition-all shadow-sm border border-slate-700" 
              type="button" 
              onClick={handleCancel}
            >
              <span className="truncate">{t('users.cancel', 'Cancelar')}</span>
            </button>
            {isEdit && (
              <button
                className="flex min-w-[100px] items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-red-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                <span className="truncate">{deleteLoading ? t('users.deleting', 'Eliminando...') : t('users.delete', 'Eliminar')}</span>
              </button>
            )}
            <button 
              className="flex min-w-[100px] items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit" 
              disabled={loading}
            >
              <span className="truncate">{loading ? t('users.saving', 'Guardando...') : t('users.save', 'Guardar')}</span>
            </button>
          </div>
        </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserForm;
