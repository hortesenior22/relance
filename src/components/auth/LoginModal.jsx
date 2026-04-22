import { useState } from "react";
import { supabase } from "../../lib/supabase";
import logoUrl from "../../assets/logo_relance.jpg";

// Vista: 'login' | 'forgot'
export default function LoginModal({ onClose, onSwitchToRegister }) {
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotSent, setForgotSent] = useState(false);

  // ── Login ──────────────────────────────────────────────────────────────────
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
      onClose();
    }
  };

  // ── Recuperar contraseña ───────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logoUrl} alt="Relance" className="h-8 rounded-md" />
        </div>

        {/* ── Vista: Login ── */}
        {view === "login" && (
          <>
            <h2 className="font-display text-2xl font-bold text-white text-center mb-1">
              Bienvenido de vuelta
            </h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              Inicia sesión en tu cuenta
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  className="block text-sm text-gray-400 mb-1.5"
                  htmlFor="login-email"
                >
                  Correo electrónico
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="input-field"
                />
              </div>

              <div>
                <label
                  className="block text-sm text-gray-400 mb-1.5"
                  htmlFor="login-password"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="login-password"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    aria-label={showPassword ? "Ocultar" : "Mostrar"}
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Enlace recuperar contraseña */}
              <div className="text-right">
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

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              ¿No tienes cuenta?{" "}
              <button
                onClick={onSwitchToRegister}
                className="text-brand hover:text-brand-dark font-medium transition-colors"
              >
                Regístrate
              </button>
            </p>
          </>
        )}

        {/* ── Vista: Recuperar contraseña ── */}
        {view === "forgot" && (
          <>
            <button
              onClick={() => {
                setView("login");
                setError(null);
                setForgotSent(false);
              }}
              className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-4 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Volver al inicio de sesión
            </button>

            <h2 className="font-display text-2xl font-bold text-white text-center mb-1">
              Recuperar contraseña
            </h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              Te enviaremos un enlace para restablecer tu contraseña
            </p>

            {forgotSent ? (
              <div className="text-center">
                <div className="text-5xl flex justify-center">
                  <svg className="w-28">
                    <use href="icons.svg#icon-envelope" />
                  </svg>
                </div>
                <p className="text-white font-semibold mb-2">Correo enviado</p>
                <p className="text-gray-400 text-sm">
                  Revisa tu bandeja de entrada en{" "}
                  <span className="text-brand">{email}</span> y sigue las
                  instrucciones.
                </p>
                <button
                  onClick={() => {
                    setView("login");
                    setForgotSent(false);
                  }}
                  className="btn-secondary w-full mt-6"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
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
                    className="input-field"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    "Enviar enlace de recuperación"
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
