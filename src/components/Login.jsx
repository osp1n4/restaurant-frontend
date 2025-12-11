import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../context/AuthContext.jsx';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateAllowedRole = (claims) => {
    const role = (claims.role || '').toUpperCase();
    return role === "ADMIN" || role === "KITCHEN";
  };

  const handleAuthError = (error) => {
    console.error("Authentication error:", error);
    setError("Credenciales inválidas o error de autenticación.");
  };

  const handleUnauthorizedAccess = (claims) => {
    const claimsString = JSON.stringify(claims);
    setError(`Acceso denegado: no eres administrador. Claims: ${claimsString}`);
  };

  const handleSuccessfulLogin = (user, tokenResult) => {
    // Guardar usuario en localStorage para el menú lateral
    localStorage.setItem('user', JSON.stringify({ email: user.email, role: tokenResult.claims.role }));
    // Actualizar el estado global de autenticación
    login({
      email: user.email,
      role: tokenResult.claims.role || (tokenResult.claims.admin ? 'admin' : undefined),
      ...tokenResult.claims
    });
    // Redirigir según el rol
    const role = (tokenResult.claims.role || '').toUpperCase();
    if (role === 'ADMIN') {
      navigate("/users");
    } else if (role === 'KITCHEN') {
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
        <a className="text-[#666666] text-sm text-center underline hover:text-primary" href="#">Forgot Password?</a>
      </form>
    </div>
  );
}

export default Login;
