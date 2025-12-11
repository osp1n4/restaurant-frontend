// Eliminar usuario
export async function deleteUser(id) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Error al eliminar usuario');
  return await res.json();
}
// Servicio para consumir la API de usuarios

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export async function getUsers(params) {
  const url = new URL(`${API_BASE_URL}/users`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return await res.json();
}


export async function createUser(data) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear usuario');
  return await res.json();
}


export async function updateUser(id, data) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar usuario');
  return await res.json();
}


export async function deactivateUser(id) {
  const res = await fetch(`${API_BASE_URL}/users/${id}/disable`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Error al desactivar usuario');
  return await res.json();
}


export async function resetPassword(id) {
  const res = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Error al resetear contraseña');
  return await res.json();
}
