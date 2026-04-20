import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logoUrl from "../../assets/logo_relance.jpg";

export default function LoginModal({ onSwitchToRegister }) {
  const { openRegisterModal } = useAuth();
  const { isLoginOpen, closeLoginModal, markJustLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // no renderizar si está cerrado
  if (!isLoginOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : error.message,
      );
      setLoading(false);
    } else {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");

      markJustLoggedIn();

      closeLoginModal();
      navigate(redirect || "/", { replace: true });
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && closeLoginModal()}
    >
      <div className="modal-card">
        {/* Cerrar */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          ✕
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logoUrl} alt="Relance" className="h-8 rounded-md" />
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Bienvenido de vuelta
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="input-field"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              👁
            </button>
          </div>

          {/* Error */}
          {error && <div className="text-red-400 text-sm">{error}</div>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Switch */}
        <p className="text-center text-sm text-gray-500 mt-4">
          ¿No tienes cuenta?{" "}
          <button onClick={openRegisterModal} className="text-brand">
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}
