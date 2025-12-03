import React, { useState, useEffect } from "react";
import { createUser, getUsers, updateUser, deleteUser } from "./usersService";
import { useNavigate, useParams } from "react-router-dom";

const roles = [
  { label: "Admin", value: "ADMIN" },
  { label: "Kitchen", value: "KITCHEN" },
  { label: "Waiter", value: "WAITER" },
];

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "ADMIN",
};


const UserForm = () => {
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
          setError("Usuario no encontrado");
        }
        setLoading(false);
      }).catch(() => {
        setError("Error al cargar usuario");
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) return;
    setDeleteLoading(true);
    setError("");
    setSuccess("");
    try {
      await deleteUser(id);
      setSuccess("Usuario eliminado exitosamente.");
      setTimeout(() => navigate("/users"), 1200);
    } catch (err) {
      setError("Error al eliminar usuario. " + (err.message || ""));
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
      return "Todos los campos son obligatorios.";
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      return "El correo no es válido.";
    }
    if (!isEdit) {
      if (!form.password || !form.confirmPassword) {
        return "La contraseña es obligatoria.";
      }
      if (form.password.length < 6) {
        return "La contraseña debe tener al menos 6 caracteres.";
      }
      if (form.password !== form.confirmPassword) {
        return "Las contraseñas no coinciden.";
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
          name: form.name,
          role: form.role,
        });
        setSuccess("Usuario actualizado exitosamente.");
      } else {
        await createUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        setSuccess("Usuario creado exitosamente.");
      }
      setTimeout(() => navigate("/users"), 1200);
    } catch (err) {
      setError((isEdit ? "Error al actualizar usuario. " : "Error al crear usuario. ") + (err.message || ""));
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
    <div className="layout-content-container flex flex-col w-full max-w-4xl mx-auto">
      <header className="flex flex-col gap-1 mb-8">
        <p className="text-[#222222] dark:text-white text-3xl font-bold leading-tight tracking-tight">{isEdit ? 'Edit User' : 'Add User'}</p>
        <p className="text-[#666666] dark:text-gray-400 text-base font-normal leading-normal">{isEdit ? 'Edit the details of the user.' : 'Fill in the details to add a new user.'}</p>
      </header>
      <div className="bg-white dark:bg-[#1C1411] p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-[#222222] dark:text-gray-300" htmlFor="name">Full Name</label>
            <div className="mt-2">
              <input className="block w-full rounded-md border-0 py-2 px-3 text-[#222222] dark:text-white bg-[#F5F5F5] dark:bg-gray-800/50 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-[#666666] focus:ring-2 focus:ring-inset focus:ring-primary" id="name" name="name" placeholder="e.g., John Doe" type="text" value={form.name} onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#222222] dark:text-gray-300" htmlFor="email">Email Address</label>
            <div className="mt-2">
              <input
                className="block w-full rounded-md border-0 py-2 px-3 text-[#222222] dark:text-white bg-[#F5F5F5] dark:bg-gray-800/50 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-[#666666] focus:ring-2 focus:ring-inset focus:ring-primary"
                id="email"
                name="email"
                placeholder="you@example.com"
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
                <label className="block text-sm font-medium text-[#222222] dark:text-gray-300" htmlFor="password">Password</label>
                <div className="mt-2">
                  <input className="block w-full rounded-md border-0 py-2 px-3 text-[#222222] dark:text-white bg-[#F5F5F5] dark:bg-gray-800/50 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-[#666666] focus:ring-2 focus:ring-inset focus:ring-primary" id="password" name="password" placeholder="Enter a strong password" type="password" value={form.password} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#222222] dark:text-gray-300" htmlFor="confirmPassword">Confirm Password</label>
                <div className="mt-2">
                  <input className="block w-full rounded-md border-0 py-2 px-3 text-[#222222] dark:text-white bg-[#F5F5F5] dark:bg-gray-800/50 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-[#666666] focus:ring-2 focus:ring-inset focus:ring-primary" id="confirmPassword" name="confirmPassword" placeholder="Re-enter password" type="password" value={form.confirmPassword} onChange={handleChange} />
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-[#222222] dark:text-gray-300" htmlFor="role">Role</label>
            <div className="mt-2">
              <select className="block w-full rounded-md border-0 py-2 px-3 text-[#222222] dark:text-white bg-[#F5F5F5] dark:bg-gray-800/50 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary" id="role" name="role" value={form.role} onChange={handleChange}>
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          {(error || success) && (
            <div className={`text-center text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>{error || success}</div>
          )}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button className="flex min-w-[84px] items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-[#F5F5F5] dark:bg-gray-700 text-[#222222] dark:text-gray-200 text-sm font-medium leading-normal tracking-[0.015em] hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm" type="button" onClick={handleCancel}>
              <span className="truncate">Cancel</span>
            </button>
            {isEdit && (
              <button
                className="flex min-w-[84px] items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-red-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-colors shadow-sm"
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                <span className="truncate">{deleteLoading ? 'Eliminando...' : 'Eliminar'}</span>
              </button>
            )}
            <button className="flex min-w-[84px] items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors shadow-sm" type="submit" disabled={loading}>
              <span className="truncate">{loading ? 'Guardando...' : 'Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
