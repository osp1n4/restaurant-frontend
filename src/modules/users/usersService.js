// Servicio para gestión de usuarios usando Firebase Authentication directamente
import { auth } from '../../firebaseConfig';
import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser as firebaseDeleteUser
} from 'firebase/auth';

// Obtener todos los usuarios de Firebase Auth
// Nota: Firebase Auth no permite listar usuarios desde el cliente por seguridad
// Por ahora retornamos una lista simulada basada en el usuario actual
export async function getUsers(params) {
  try {
    // En un entorno real, necesitarías Firebase Admin SDK en el backend
    // Por ahora, retornamos el usuario actual si existe
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return { users: [], total: 0 };
    }

    // Obtener el token actual con customClaims frescos
    const tokenResult = await currentUser.getIdTokenResult(true); // true para forzar refresh
    const customClaims = tokenResult.claims;
    
    console.log('CustomClaims obtenidos:', customClaims);

    // Si el usuario tiene claim admin o role ADMIN, intentar obtener la lista completa desde el backend admin
    const isAdmin = (customClaims.admin || (customClaims.role && String(customClaims.role).toUpperCase() === 'ADMIN'));
    
    if (isAdmin) {
      try {
        const adminApiUrl = (import.meta && import.meta.env && import.meta.env.VITE_ADMIN_API_URL) ? import.meta.env.VITE_ADMIN_API_URL : 'http://localhost:4001';
        // API key opcional almacenada en localStorage bajo 'adminApiKey'
        const apiKey = localStorage.getItem('adminApiKey') || 'changeme';
        const res = await fetch(`${adminApiUrl.replace(/\/$/, '')}/list-users`, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          }
        });
        if (!res.ok) {
          console.warn('Admin API returned', res.status);
        } else {
          const body = await res.json();
          const data = body.users || [];
          return { users: Array.isArray(data) ? data : [], total: Array.isArray(data) ? data.length : 0 };
        }
      } catch (err) {
        console.error('Error fetching admin user list:', err);
        // continuar con fallback al usuario actual
      }
    }

    // Fallback: retornar únicamente el usuario actual (simulado)
    const users = [{
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || 'Sin nombre',
      photoURL: currentUser.photoURL,
      emailVerified: currentUser.emailVerified,
      disabled: false,
      status: 'Active', // Estado del usuario
      createdAt: currentUser.metadata.creationTime,
      lastLoginAt: currentUser.metadata.lastSignInTime,
      // Incluir customClaims frescos del token
      customClaims: customClaims,
      role: customClaims.admin ? 'ADMIN' : (customClaims.role ? String(customClaims.role).toUpperCase() : '')
    }];

    return { users, total: users.length };
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw new Error('Error al obtener usuarios de Firebase');
  }
}

// Crear nuevo usuario
export async function createUser(data) {
  try {
    const { email, password, role } = data;
    const displayName = data.displayName || data.name || '';
    
    // Usar Firebase Admin API para crear usuario con rol
    const adminApiUrl = (import.meta && import.meta.env && import.meta.env.VITE_ADMIN_API_URL) 
      ? import.meta.env.VITE_ADMIN_API_URL 
      : 'http://localhost:4001';
    const apiKey = localStorage.getItem('adminApiKey') || 'changeme';
    
    try {
      const response = await fetch(`${adminApiUrl.replace(/\/$/, '')}/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          email,
          password,
          displayName,
          role: role || 'KITCHEN' // Rol por defecto según US-015
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear usuario en el servidor');
      }

      const result = await response.json();
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || displayName || '',
        role: result.user.role,
        createdAt: new Date().toISOString()
      };
    } catch (adminError) {
      console.error('Error usando Admin API, intentando método alternativo:', adminError);
      
      // Fallback: crear usuario directamente (sin asignar rol)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Actualizar perfil con nombre
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      console.warn('Usuario creado sin rol asignado. Se requiere Admin API para asignar roles.');
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: displayName || '',
        role: role || 'KITCHEN',
        createdAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Error al crear usuario:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('El correo electrónico ya está en uso');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña es muy débil');
    }
    if (error.message) {
      throw error;
    }
    throw new Error('Error al crear usuario');
  }
}

// Actualizar usuario
export async function updateUser(uid, data) {
  try {
    const { displayName, photoURL, role } = data;
    
    // Usar Firebase Admin API para actualizar usuario y rol
    const adminApiUrl = (import.meta && import.meta.env && import.meta.env.VITE_ADMIN_API_URL) 
      ? import.meta.env.VITE_ADMIN_API_URL 
      : 'http://localhost:4001';
    const apiKey = localStorage.getItem('adminApiKey') || 'changeme';
    
    try {
      const response = await fetch(`${adminApiUrl.replace(/\/$/, '')}/update-user/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          displayName,
          role
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar usuario en el servidor');
      }

      const result = await response.json();
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        role: result.user.role
      };
    } catch (adminError) {
      console.error('Error usando Admin API:', adminError);
      
      // Fallback: actualizar solo el perfil local (sin cambiar rol)
      const currentUser = auth.currentUser;
      
      if (!currentUser || currentUser.uid !== uid) {
        throw new Error('No tienes permisos para actualizar este usuario. Se requiere Admin API.');
      }

      // Actualizar el perfil del usuario localmente
      const updateData = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (photoURL !== undefined) updateData.photoURL = photoURL;
      
      if (Object.keys(updateData).length > 0) {
        await updateProfile(currentUser, updateData);
      }

      // Forzar refresh del token
      await currentUser.reload();
      const tokenResult = await currentUser.getIdTokenResult(true);
      const customClaims = tokenResult.claims;

      console.warn('Usuario actualizado parcialmente. El rol NO fue actualizado. Se requiere Admin API.');

      return {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        customClaims: customClaims,
        role: customClaims.admin ? 'ADMIN' : (customClaims.role ? String(customClaims.role).toUpperCase() : '')
      };
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Error al actualizar usuario');
  }
}

// Desactivar usuario (US-019)
export async function deactivateUser(uid) {
  try {
    const adminApiUrl = (import.meta && import.meta.env && import.meta.env.VITE_ADMIN_API_URL) 
      ? import.meta.env.VITE_ADMIN_API_URL 
      : 'http://localhost:4001';
    const apiKey = localStorage.getItem('adminApiKey') || 'changeme';
    
    const response = await fetch(`${adminApiUrl.replace(/\/$/, '')}/disable-user/${uid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al desactivar usuario en el servidor');
    }

    const result = await response.json();
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      disabled: result.user.disabled,
      message: result.message
    };
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Error al desactivar usuario. Se requiere permisos de administrador.');
  }
}

// Activar usuario (US-019)
export async function activateUser(uid) {
  try {
    const adminApiUrl = (import.meta && import.meta.env && import.meta.env.VITE_ADMIN_API_URL) 
      ? import.meta.env.VITE_ADMIN_API_URL 
      : 'http://localhost:4001';
    const apiKey = localStorage.getItem('adminApiKey') || 'changeme';
    
    const response = await fetch(`${adminApiUrl.replace(/\/$/, '')}/enable-user/${uid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al activar usuario en el servidor');
    }

    const result = await response.json();
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      disabled: result.user.disabled,
      message: result.message
    };
  } catch (error) {
    console.error('Error al activar usuario:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Error al activar usuario. Se requiere permisos de administrador.');
  }
}

// Resetear contraseña
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { message: 'Correo de recuperación enviado exitosamente' };
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error('Usuario no encontrado');
    }
    throw new Error('Error al enviar correo de recuperación');
  }
}

// Eliminar usuario
export async function deleteUser(uid) {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser || currentUser.uid !== uid) {
      throw new Error('No tienes permisos para eliminar este usuario');
    }

    await firebaseDeleteUser(currentUser);
    return { message: 'Usuario eliminado exitosamente' };
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw new Error('Error al eliminar usuario');
  }
}
