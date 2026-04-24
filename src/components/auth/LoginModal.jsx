import { useState } from "react";
import { supabase } from "../../lib/supabase";
import logoUrl from "../../assets/logo_relance.jpg";
import { loginWithGoogle } from "../../lib/supabase";

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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
        return;
      }

      // IMPORTANTE: cerrar modal después de login exitoso
      onClose();
    } catch (err) {
      setError("Error inesperado al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setForgotSent(true);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logoUrl} alt="Relance" className="h-8 rounded-md" />
        </div>

        {/* ───────── LOGIN ───────── */}
        {view === "login" && (
          <>
            <h2 className="font-display text-2xl font-bold text-white text-center mb-1">
              Bienvenido de vuelta
            </h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              Inicia sesión en tu cuenta
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="input-field py-2 text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field py-2 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    👁
                  </button>
                </div>
              </div>

              {/* Botón 1: LOGIN */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-1.5 text-sm"
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>

              {/* Botón 2: GOOGLE */}
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center py-1.5 text-sm gap-2 border border-gray-700 bg-white text-gray-900 font-medium rounded-lg   hover:bg-gray-100 transition-colors"
              >
                {/* Icono Google */}
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C36.68 2.36 30.82 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.21C12.43 13.09 17.77 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.1 24.55c0-1.57-.14-3.09-.39-4.55H24v9.1h12.44c-.54 2.9-2.18 5.36-4.64 7.04l7.18 5.57C43.94 37.1 46.1 31.35 46.1 24.55z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.54 28.43A14.5 14.5 0 019.5 24c0-1.52.26-2.99.72-4.43l-7.98-6.21A23.9 23.9 0 000 24c0 3.84.92 7.46 2.56 10.64l7.98-6.21z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.18-5.57c-2.01 1.35-4.6 2.17-8.72 2.17-6.23 0-11.57-3.59-13.46-8.8l-7.98 6.21C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>

                <span>Continuar con Google</span>
              </button>

              {/* Botón 3: OLVIDE CONTRASEÑA (centrado) */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot");
                    setError(null);
                  }}
                  className="text-xs text-brand hover:text-brand-dark transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </form>

            {/* Botón 4: REGISTRO */}
            <p className="text-center text-sm text-gray-500 mt-6">
              ¿No tienes cuenta?{" "}
              <button
                onClick={onSwitchToRegister}
                className="text-brand hover:text-brand-dark font-medium"
              >
                Regístrate
              </button>
            </p>
          </>
        )}

        {/* ───────── FORGOT PASSWORD ───────── */}
        {view === "forgot" && (
          <>
            <button
              onClick={() => {
                setView("login");
                setError(null);
                setForgotSent(false);
              }}
              className="text-sm text-gray-400 mb-4"
            >
              ← Volver
            </button>

            <h2 className="text-xl font-bold text-center text-white mb-2">
              Recuperar contraseña
            </h2>

            <p className="text-sm text-gray-500 text-center mb-6">
              Te enviaremos un enlace a tu correo
            </p>

            {forgotSent ? (
              <p className="text-center text-sm text-green-400">
                Revisa tu correo 📩
              </p>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="input-field"
                />

                <button className="btn-primary w-full">Enviar enlace</button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
