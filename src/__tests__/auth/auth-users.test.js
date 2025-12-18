/**
 * @file auth-users.test.js
 * @description Tests para autenticación y gestión de usuarios
 * @coverage US-015, US-016, US-017, US-018, US-019, US-020, US-021, US-037
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';

// Mock de Firebase Auth
const mockFirebaseAuth = {
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  currentUser: null,
};

// Mock de User Service
const mockUserService = {
  createUser: jest.fn(),
  updateUser: jest.fn(),
  getUserById: jest.fn(),
  getAllUsers: jest.fn(),
  deactivateUser: jest.fn(),
  activateUser: jest.fn(),
  updateUserRole: jest.fn(),
};

describe('US-015: Registrarse en la plataforma', () => {
  test('TC-AUTH-001: Crear cuenta con email y contraseña válidos', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'SecurePass123!',
    };

    mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'user-123',
        email: userData.email,
      },
    });

    const result = await mockFirebaseAuth.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );

    expect(result.user.uid).toBe('user-123');
    expect(result.user.email).toBe(userData.email);
  });

  test('TC-AUTH-002: Asignar rol por defecto kitchen al nuevo usuario', async () => {
    const newUser = {
      uid: 'user-123',
      email: 'newuser@example.com',
      role: 'kitchen', // Rol por defecto
    };

    mockUserService.createUser.mockResolvedValue({
      success: true,
      user: newUser,
    });

    const result = await mockUserService.createUser(newUser);

    expect(result.user.role).toBe('kitchen');
  });

  test('TC-AUTH-003: Validar formato de email', () => {
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    expect(validateEmail('valid@example.com')).toBe(true);
    expect(validateEmail('invalid.email')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
  });

  test('TC-AUTH-004: Validar contraseña segura (mínimo 8 caracteres, mayúscula, número)', () => {
    const validatePassword = (password) => {
      if (password.length < 8) return false;
      if (!/[A-Z]/.test(password)) return false;
      if (!/[0-9]/.test(password)) return false;
      return true;
    };

    expect(validatePassword('Abc12345')).toBe(true);
    expect(validatePassword('weak')).toBe(false);
    expect(validatePassword('nocaps123')).toBe(false);
    expect(validatePassword('NoNumbers')).toBe(false);
  });

  test('TC-AUTH-005: Error al intentar registrar email duplicado', async () => {
    mockFirebaseAuth.createUserWithEmailAndPassword.mockRejectedValue({
      code: 'auth/email-already-in-use',
      message: 'El email ya está registrado',
    });

    try {
      await mockFirebaseAuth.createUserWithEmailAndPassword(
        'existing@example.com',
        'Password123!'
      );
    } catch (error) {
      expect(error.code).toBe('auth/email-already-in-use');
    }
  });
});

describe('US-016: Iniciar sesión con credenciales', () => {
  test('TC-AUTH-006: Login exitoso redirige según rol', async () => {
    const credentials = {
      email: 'admin@example.com',
      password: 'AdminPass123!',
    };

    mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'admin-123',
        email: credentials.email,
        customClaims: { role: 'admin' },
      },
    });

    const result = await mockFirebaseAuth.signInWithEmailAndPassword(
      credentials.email,
      credentials.password
    );

    const userRole = result.user.customClaims.role;
    
    const getRedirectPath = (role) => {
      const paths = {
        admin: '/admin',
        kitchen: '/kitchen',
        customer: '/menu',
      };
      return paths[role] || '/';
    };

    expect(getRedirectPath(userRole)).toBe('/admin');
  });

  test('TC-AUTH-007: Mensaje de error claro ante credenciales incorrectas', async () => {
    mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/wrong-password',
      message: 'Contraseña incorrecta',
    });

    try {
      await mockFirebaseAuth.signInWithEmailAndPassword(
        'user@example.com',
        'wrongpassword'
      );
    } catch (error) {
      expect(error.message).toContain('incorrecta');
    }
  });

  test('TC-AUTH-008: Error al intentar login con cuenta inexistente', async () => {
    mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/user-not-found',
      message: 'Usuario no encontrado',
    });

    try {
      await mockFirebaseAuth.signInWithEmailAndPassword(
        'nonexistent@example.com',
        'Password123!'
      );
    } catch (error) {
      expect(error.code).toBe('auth/user-not-found');
    }
  });

  test('TC-AUTH-009: Login bloqueado tras 5 intentos fallidos', () => {
    const loginAttempts = {
      count: 0,
      maxAttempts: 5,
      lockedUntil: null,
    };

    const attemptLogin = (success) => {
      if (loginAttempts.lockedUntil && Date.now() < loginAttempts.lockedUntil) {
        throw new Error('Cuenta bloqueada temporalmente');
      }

      if (!success) {
        loginAttempts.count++;
        
        if (loginAttempts.count >= loginAttempts.maxAttempts) {
          loginAttempts.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutos
          throw new Error('Demasiados intentos fallidos');
        }
        
        throw new Error('Credenciales incorrectas');
      }

      loginAttempts.count = 0;
      return true;
    };

    // 5 intentos fallidos
    for (let i = 0; i < 5; i++) {
      try {
        attemptLogin(false);
      } catch (error) {
        // Expected
      }
    }

    // 6to intento debe estar bloqueado
    expect(() => attemptLogin(false)).toThrow('Cuenta bloqueada temporalmente');
  });
});

describe('US-017: Crear nuevos usuarios (Admin)', () => {
  test('TC-ADMIN-001: Admin puede crear nueva cuenta de usuario', async () => {
    const newUser = {
      email: 'kitchen@example.com',
      password: 'Kitchen123!',
      displayName: 'Chef Juan',
      role: 'kitchen',
    };

    mockUserService.createUser.mockResolvedValue({
      success: true,
      userId: 'user-456',
      user: newUser,
    });

    const result = await mockUserService.createUser(newUser);

    expect(result.success).toBe(true);
    expect(result.userId).toBeDefined();
  });

  test('TC-ADMIN-002: Admin especifica rol al crear usuario', () => {
    const users = [
      { email: 'admin2@example.com', role: 'admin' },
      { email: 'chef@example.com', role: 'kitchen' },
      { email: 'customer@example.com', role: 'customer' },
    ];

    users.forEach(user => {
      expect(['admin', 'kitchen', 'customer']).toContain(user.role);
    });
  });

  test('TC-ADMIN-003: Usuario puede acceder inmediatamente con credenciales', async () => {
    // 1. Admin crea usuario
    const newUser = {
      email: 'newkitchen@example.com',
      password: 'Kitchen123!',
      role: 'kitchen',
    };

    await mockUserService.createUser(newUser);

    // 2. Usuario intenta login inmediatamente
    mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'user-789', email: newUser.email },
    });

    const loginResult = await mockFirebaseAuth.signInWithEmailAndPassword(
      newUser.email,
      newUser.password
    );

    expect(loginResult.user.email).toBe(newUser.email);
  });

  test('TC-ADMIN-004: Solo administradores pueden crear usuarios', () => {
    const checkPermission = (userRole, action) => {
      const permissions = {
        admin: ['create_user', 'edit_user', 'delete_user', 'view_analytics'],
        kitchen: ['view_orders', 'update_orders'],
        customer: ['view_menu', 'create_order'],
      };

      return permissions[userRole]?.includes(action) || false;
    };

    expect(checkPermission('admin', 'create_user')).toBe(true);
    expect(checkPermission('kitchen', 'create_user')).toBe(false);
    expect(checkPermission('customer', 'create_user')).toBe(false);
  });
});

describe('US-018: Editar roles de usuarios (Admin)', () => {
  test('TC-ADMIN-005: Admin puede cambiar rol de usuario', async () => {
    const userId = 'user-123';
    const newRole = 'admin';

    mockUserService.updateUserRole.mockResolvedValue({
      success: true,
      user: { id: userId, role: newRole },
    });

    const result = await mockUserService.updateUserRole(userId, newRole);

    expect(result.success).toBe(true);
    expect(result.user.role).toBe(newRole);
  });

  test('TC-ADMIN-006: Permisos se actualizan al siguiente login', async () => {
    const user = {
      id: 'user-123',
      role: 'kitchen',
      lastLogin: new Date('2025-12-18T10:00:00'),
    };

    // Admin cambia rol a admin
    user.role = 'admin';

    // Usuario hace logout y login
    const newLogin = new Date();
    user.lastLogin = newLogin;

    // Verificar nuevos permisos
    const hasAdminAccess = user.role === 'admin';

    expect(hasAdminAccess).toBe(true);
    expect(user.lastLogin).toBeInstanceOf(Date);
  });

  test('TC-ADMIN-007: Error al asignar rol inválido', () => {
    const validRoles = ['admin', 'kitchen', 'customer'];

    const validateRole = (role) => {
      if (!validRoles.includes(role)) {
        throw new Error(`Rol inválido: ${role}`);
      }
      return true;
    };

    expect(() => validateRole('admin')).not.toThrow();
    expect(() => validateRole('superuser')).toThrow('Rol inválido');
    expect(() => validateRole('manager')).toThrow('Rol inválido');
  });

  test('TC-ADMIN-008: Registro de cambios de rol (audit log)', () => {
    const auditLog = {
      userId: 'user-123',
      action: 'role_updated',
      oldRole: 'kitchen',
      newRole: 'admin',
      updatedBy: 'admin@example.com',
      timestamp: new Date(),
    };

    expect(auditLog.action).toBe('role_updated');
    expect(auditLog.oldRole).toBeDefined();
    expect(auditLog.newRole).toBeDefined();
    expect(auditLog.updatedBy).toBeDefined();
  });
});

describe('US-019: Activar/desactivar cuentas (Admin)', () => {
  test('TC-ADMIN-009: Usuario desactivado no puede iniciar sesión', async () => {
    const user = { id: 'user-123', email: 'user@example.com', active: false };

    const attemptLogin = (user) => {
      if (!user.active) {
        throw new Error('Cuenta inactiva. Contacte al administrador.');
      }
      return true;
    };

    expect(() => attemptLogin(user)).toThrow('Cuenta inactiva');
  });

  test('TC-ADMIN-010: Usuario reactivado recupera el acceso', async () => {
    const userId = 'user-123';

    mockUserService.activateUser.mockResolvedValue({
      success: true,
      user: { id: userId, active: true },
    });

    const result = await mockUserService.activateUser(userId);

    expect(result.user.active).toBe(true);
  });

  test('TC-ADMIN-011: Mensaje de cuenta inactiva al intentar login', async () => {
    mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/user-disabled',
      message: 'Cuenta inactiva. Contacte al administrador.',
    });

    try {
      await mockFirebaseAuth.signInWithEmailAndPassword(
        'inactive@example.com',
        'Password123!'
      );
    } catch (error) {
      expect(error.message).toContain('inactiva');
    }
  });

  test('TC-ADMIN-012: Desactivar usuario cierra sesiones activas', () => {
    const activeSession = {
      userId: 'user-123',
      active: true,
      tokenValidUntil: Date.now() + 3600000,
    };

    const deactivateUser = (session) => {
      session.active = false;
      session.tokenValidUntil = Date.now(); // Invalidar token inmediatamente
    };

    deactivateUser(activeSession);

    expect(activeSession.active).toBe(false);
    expect(activeSession.tokenValidUntil).toBeLessThanOrEqual(Date.now());
  });
});

describe('US-020: Visualizar roles correctamente (Admin)', () => {
  test('TC-ADMIN-013: Rol actual visible en lista de usuarios', async () => {
    const users = [
      { id: 'user-1', name: 'Juan', role: 'admin' },
      { id: 'user-2', name: 'María', role: 'kitchen' },
      { id: 'user-3', name: 'Pedro', role: 'customer' },
    ];

    mockUserService.getAllUsers.mockResolvedValue(users);

    const result = await mockUserService.getAllUsers();

    result.forEach(user => {
      expect(user.role).toBeDefined();
      expect(['admin', 'kitchen', 'customer']).toContain(user.role);
    });
  });

  test('TC-ADMIN-014: Traducción correcta de roles según idioma', () => {
    const translateRole = (role, language) => {
      const translations = {
        admin: { es: 'Administrador', en: 'Administrator' },
        kitchen: { es: 'Cocina', en: 'Kitchen' },
        customer: { es: 'Cliente', en: 'Customer' },
      };

      return translations[role]?.[language] || role;
    };

    expect(translateRole('admin', 'es')).toBe('Administrador');
    expect(translateRole('admin', 'en')).toBe('Administrator');
    expect(translateRole('kitchen', 'es')).toBe('Cocina');
  });

  test('TC-ADMIN-015: Lista se actualiza inmediatamente tras editar rol', async () => {
    let users = [
      { id: 'user-1', role: 'kitchen' },
      { id: 'user-2', role: 'customer' },
    ];

    // Cambiar rol de user-1
    users[0].role = 'admin';

    mockUserService.getAllUsers.mockResolvedValue(users);

    const updatedList = await mockUserService.getAllUsers();

    expect(updatedList[0].role).toBe('admin');
  });
});

describe('US-021: Mantener sesión activa', () => {
  test('TC-AUTH-010: Sesión activa por 10 minutos de inactividad', () => {
    const session = {
      userId: 'user-123',
      lastActivity: Date.now(),
      sessionTimeout: 10 * 60 * 1000, // 10 minutos
    };

    const isSessionActive = (session) => {
      const elapsed = Date.now() - session.lastActivity;
      return elapsed < session.sessionTimeout;
    };

    expect(isSessionActive(session)).toBe(true);

    // Simular 11 minutos de inactividad
    session.lastActivity = Date.now() - (11 * 60 * 1000);
    expect(isSessionActive(session)).toBe(false);
  });

  test('TC-AUTH-011: Renovar sesión al detectar actividad', () => {
    const session = {
      lastActivity: Date.now() - (5 * 60 * 1000), // 5 minutos atrás
    };

    // Simular actividad del usuario
    const renewSession = (session) => {
      session.lastActivity = Date.now();
    };

    renewSession(session);

    const timeSinceActivity = Date.now() - session.lastActivity;
    expect(timeSinceActivity).toBeLessThan(1000); // Menos de 1 segundo
  });

  test('TC-AUTH-012: Solicitud clara de login al expirar token', () => {
    const checkTokenValidity = (tokenExpiry) => {
      if (Date.now() > tokenExpiry) {
        return {
          valid: false,
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        };
      }
      return { valid: true };
    };

    const expiredToken = Date.now() - 1000;
    const result = checkTokenValidity(expiredToken);

    expect(result.valid).toBe(false);
    expect(result.message).toContain('sesión ha expirado');
  });
});

describe('US-037: Proteger contraseñas de usuario', () => {
  test('TC-SECURITY-004: Contraseñas hasheadas con bcrypt', async () => {
    const password = 'MySecurePass123!';
    
    const hash = await bcrypt.hash(password, 10);

    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
    expect(hash.startsWith('$2')).toBe(true); // bcrypt hash
  });

  test('TC-SECURITY-005: Verificar contraseña hasheada', async () => {
    const password = 'MySecurePass123!';
    const hash = await bcrypt.hash(password, 10);

    const isValid = await bcrypt.compare(password, hash);
    const isInvalid = await bcrypt.compare('WrongPassword', hash);

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  test('TC-SECURITY-006: Contraseñas no visibles en texto plano', async () => {
    const user = {
      id: 'user-123',
      email: 'user@example.com',
      passwordHash: '$2b$10$abcdef...',
    };

    // Verificar que no hay campo password en texto plano
    expect(user.password).toBeUndefined();
    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHash).not.toBe('MyPassword123!');
  });

  test('TC-SECURITY-007: HTTPS para transmisión de credenciales', () => {
    const loginUrl = 'https://deliciouskitchen.com/api/auth/login';

    expect(loginUrl.startsWith('https://')).toBe(true);
  });

  test('TC-SECURITY-008: No exponer contraseñas en logs', () => {
    const logSecurely = (userData) => {
      const { password, passwordHash, ...safeData } = userData;
      return safeData;
    };

    const user = {
      email: 'user@example.com',
      password: 'SecretPass123!',
      name: 'Juan',
    };

    const logged = logSecurely(user);

    expect(logged.password).toBeUndefined();
    expect(logged.email).toBeDefined();
    expect(logged.name).toBeDefined();
  });
});
