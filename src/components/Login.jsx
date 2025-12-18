import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from '../context/AuthContext.jsx';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Protección: redirigir al inicio si se accede directamente por URL
  useEffect(() => {
    // Verificar si viene desde el botón Dashboard mediante state
    if (!location.state || !location.state.fromDashboard) {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const validateAllowedRole = (claims) => {
    // Aceptar role explícito o la claim boolean `admin` desde Firebase
    const role = (claims && (claims.role || (claims.admin ? 'ADMIN' : ''))) || '';
    const roleNormalized = String(role).toUpperCase();
    return roleNormalized === "ADMIN" || roleNormalized === "KITCHEN";
  };

  const handleAuthError = (error) => {
    console.error("Authentication error:", error);
    
    // Mensajes de error claros según el tipo de error de Firebase
    let errorMessage = "Error de autenticación. Por favor intenta nuevamente.";
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = "No existe una cuenta con este correo electrónico.";
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = "Contraseña incorrecta. Por favor verifica tus credenciales.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "El formato del correo electrónico es inválido.";
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = "Esta cuenta ha sido desactivada. Contacta al administrador.";
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = "Demasiados intentos fallidos. Por favor intenta más tarde.";
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = "Error de conexión. Verifica tu conexión a internet.";
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = "Credenciales inválidas. Verifica tu correo y contraseña.";
    }
    
    setError(errorMessage);
  };

  const handleUnauthorizedAccess = (claims) => {
    // Mostrar ADMIN si existe claims.admin booleano
    const role = claims && (claims.role ? String(claims.role).toUpperCase() : (claims.admin ? 'ADMIN' : 'NO ASIGNADO'));
    setError(`Acceso denegado: Tu rol actual es "${role}". Solo usuarios con rol ADMIN o KITCHEN pueden acceder. Por favor contacta al administrador para que te asigne un rol válido.`);
  };

  const handleSuccessfulLogin = (user, tokenResult) => {
    // Guardar usuario en localStorage para el menú lateral
    const claims = tokenResult.claims || {};
    const resolvedRole = (claims.role ? String(claims.role) : (claims.admin ? 'ADMIN' : undefined));
    const normalizedRole = resolvedRole ? String(resolvedRole).toUpperCase() : undefined;
    localStorage.setItem('user', JSON.stringify({ email: user.email, role: normalizedRole }));
    // Actualizar el estado global de autenticación
    login({
      email: user.email,
      role: normalizedRole,
      ...claims
    });
    // Redirigir según el rol
    if (normalizedRole === 'ADMIN') {
      navigate("/users");
    } else if (normalizedRole === 'KITCHEN') {
      navigate("/kitchen");
    } else {
      navigate("/");
    }
  };

  const authenticateUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const tokenResult = await user.getIdTokenResult(true);
    

    
    return { user, tokenResult };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user, tokenResult } = await authenticateUser(email, password);
      const isAllowed = validateAllowedRole(tokenResult.claims);


      if (isAllowed) {
        handleSuccessfulLogin(user, tokenResult);
      } else {
        handleUnauthorizedAccess(tokenResult.claims);
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Email de recuperación enviado. Por favor revisa tu bandeja de entrada.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail("");
        setResetMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      if (error.code === 'auth/user-not-found') {
        setResetError("No existe una cuenta con este email.");
      } else if (error.code === 'auth/invalid-email') {
        setResetError("Email inválido.");
      } else {
        setResetError("Error al enviar el email de recuperación. Intenta nuevamente.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f6f5]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <svg className="text-primary" fill="none" height="48" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg">
            <rect height="11" rx="2" ry="2" width="18" x="3" y="11"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <p className="text-2xl font-bold text-[#222222]">Admin Panel</p>
        </div>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col w-full">
            <span className="text-[#222222] text-sm font-medium pb-2">Username or Email</span>
            <input
              className="form-input rounded-lg border border-[#e7deda] bg-white h-12 p-3 text-base"
              type="email"
              placeholder="Enter your username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col w-full">
            <span className="text-[#222222] text-sm font-medium pb-2">Password</span>
            <input
              className="form-input rounded-lg border border-[#e7deda] bg-white h-12 p-3 text-base"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Login"}
        </button>
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-[#666666] text-sm text-center underline hover:text-primary"
        >
          Forgot Password?
        </button>
      </form>

      {/* Modal de Forgot Password */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmail("");
                setResetMessage("");
                setResetError("");
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2">
                <svg className="text-primary" fill="none" height="40" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <h2 className="text-2xl font-bold text-[#222222]">Recuperar Contraseña</h2>
                <p className="text-sm text-[#666666] text-center">
                  Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <label className="flex flex-col w-full">
                  <span className="text-[#222222] text-sm font-medium pb-2">Email</span>
                  <input
                    className="form-input rounded-lg border border-[#e7deda] bg-white h-12 p-3 text-base"
                    type="email"
                    placeholder="tu-email@ejemplo.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </label>

                {resetMessage && (
                  <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">
                    {resetMessage}
                  </div>
                )}
                {resetError && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                    {resetError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Enviando..." : "Enviar Email de Recuperación"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail("");
                    setResetMessage("");
                    setResetError("");
                  }}
                  className="w-full h-12 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
