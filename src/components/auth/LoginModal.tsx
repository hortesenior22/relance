import { useState, FormEvent } from "react";
import { supabase, loginWithGoogle } from "../../lib/supabase";
import logoUrl from "../../assets/logo_relance.jpg";

// Vista: 'login' | 'forgot'
type View = "login" | "forgot";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingGoogle, setLoadingGoogle] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  // ── Login email/contraseña ─────────────────────────────────────────────────
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
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

  // ── Login con Google ───────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setLoadingGoogle(true);
    setError(null);
    await loginWithGoogle();
  };

  // ── Recuperar contraseña ───────────────────────────────────────────────────
  const handleForgot = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setForgotSent(true);
  };

  return (
    <>
      {/* ── SVG SPRITE ── */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
        <symbol id="icon-google-color" viewBox="-0.5 0 48 48">
          <title>Google-color</title>
          <g fill="none" fillRule="evenodd">
            <g transform="translate(-401 -860)">
              <g transform="translate(401 860)">
                <path
                  d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                  fill="#FBBC05"
                />
                <path
                  d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                  fill="#EB4335"
                />
                <path
                  d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                  fill="#34A853"
                />
                <path
                  d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                  fill="#4285F4"
                />
              </g>
            </g>
          </g>
        </symbol>
      </svg>

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

              {/* Botón Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loadingGoogle}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm px-4 py-2.5 rounded-xl border border-gray-200 transition-all duration-200 mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingGoogle ? (
                  <svg
                    className="animate-spin w-4 h-4 text-gray-500"
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
                ) : (
                  <svg width="18" height="18">
                    <use href="#icon-google-color" />
                  </svg>
                )}
                {loadingGoogle ? "Conectando..." : "Continuar con Google"}
              </button>

              {/* Separador */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-gray-600 text-xs">o con correo</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

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
                Te enviaremos un enlace para restablecerla
              </p>

              {forgotSent ? (
                <div className="text-center">
                  <div className="text-5xl mb-4">📧</div>
                  <p className="text-white font-semibold mb-2">
                    Correo enviado
                  </p>
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
    </>
  );
}
