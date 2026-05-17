import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, loginWithGoogle } from "../../lib/supabase";
import { fetchUserRole, getRoleRoute } from "../../context/AuthContext";
import logoUrl from "../../assets/logo_relance.jpg";

type View = "login" | "forgot";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

// ── Helpers de validación ────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function LoginModal({
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateLogin = () => {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = "El correo es obligatorio.";
    else if (!isValidEmail(email)) errs.email = "Introduce un correo válido.";
    if (!password) errs.password = "La contraseña es obligatoria.";
    else if (password.length < 6) errs.password = "Mínimo 6 caracteres.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateForgot = () => {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = "El correo es obligatorio.";
    else if (!isValidEmail(email)) errs.email = "Introduce un correo válido.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
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
      if (data.user) {
        const role = await fetchUserRole(data.user.id);
        navigate("/");
      }
    }
  };

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    setError(null);
    await loginWithGoogle();
  };

  const handleForgot = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForgot()) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setForgotSent(true);
  };

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-red-400 mt-1">{msg}</p> : null;

  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
        <symbol id="icon-google-color" viewBox="-0.5 0 48 48">
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
        {/*
          En móvil: ancho completo con margen, padding generoso.
          En portátil (lg+): ancho máximo más estrecho, padding y texto reducidos.
        */}
        <div
          className="modal-card w-full max-w-sm lg:max-w-xs"
          style={{ padding: "clamp(16px, 3vw, 28px)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-4 lg:mb-3">
            <img
              src={logoUrl}
              alt="Relance"
              className="h-6 lg:h-5 rounded-md"
            />
          </div>

          {/* ── Login ── */}
          {view === "login" && (
            <>
              <h2 className="font-display text-xl lg:text-lg font-bold text-white text-center mb-0.5">
                Bienvenido de vuelta
              </h2>
              <p className="text-gray-500 text-xs text-center mb-4 lg:mb-3">
                Inicia sesión en tu cuenta
              </p>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loadingGoogle}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs px-3 py-2 rounded-lg border border-gray-200 transition-all duration-200 mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingGoogle ? (
                  <svg
                    className="animate-spin w-3.5 h-3.5 text-gray-500"
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
                  <svg width="15" height="15">
                    <use href="#icon-google-color" />
                  </svg>
                )}
                {loadingGoogle ? "Conectando..." : "Continuar con Google"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-gray-600 text-xs">o con correo</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleLogin} className="space-y-3" noValidate>
                <div>
                  <label
                    className="block text-xs text-gray-400 mb-1"
                    htmlFor="login-email"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((p) => ({ ...p, email: undefined }));
                    }}
                    placeholder="tu@correo.com"
                    className={`input-field text-sm py-2 ${fieldErrors.email ? "border-red-500/50 focus:border-red-500" : ""}`}
                  />
                  <FieldError msg={fieldErrors.email} />
                </div>

                <div>
                  <label
                    className="block text-xs text-gray-400 mb-1"
                    htmlFor="login-password"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFieldErrors((p) => ({ ...p, password: undefined }));
                      }}
                      placeholder="••••••••"
                      className={`input-field text-sm py-2 pr-9 ${fieldErrors.password ? "border-red-500/50 focus:border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      aria-label={showPassword ? "Ocultar" : "Mostrar"}
                    >
                      {showPassword ? (
                        <svg
                          width="15"
                          height="15"
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
                          width="15"
                          height="15"
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
                  <FieldError msg={fieldErrors.password} />
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setError(null);
                      setFieldErrors({});
                    }}
                    className="text-xs text-brand hover:text-brand-dark transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-xs">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex justify-center items-center gap-2 text-sm py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-3.5 h-3.5"
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

              <p className="text-center text-xs text-gray-500 mt-4">
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

          {/* ── Recuperar contraseña ── */}
          {view === "forgot" && (
            <>
              <button
                onClick={() => {
                  setView("login");
                  setError(null);
                  setForgotSent(false);
                  setFieldErrors({});
                }}
                className="flex items-center gap-1 text-gray-500 hover:text-white text-xs mb-3 transition-colors"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Volver al inicio de sesión
              </button>

              <h2 className="font-display text-xl lg:text-lg font-bold text-white text-center mb-0.5">
                Recuperar contraseña
              </h2>
              <p className="text-gray-500 text-xs text-center mb-4 lg:mb-3">
                Te enviaremos un enlace para restablecerla
              </p>

              {forgotSent ? (
                <div className="text-center">
                  <div className="mb-3 flex items-center justify-center">
                    <svg className="size-12">
                      <use href="icons.svg#icon-envelope" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">
                    Correo enviado
                  </p>
                  <p className="text-gray-400 text-xs">
                    Revisa tu bandeja de entrada en{" "}
                    <span className="text-brand">{email}</span> y sigue las
                    instrucciones.
                  </p>
                  <button
                    onClick={() => {
                      setView("login");
                      setForgotSent(false);
                    }}
                    className="btn-secondary w-full mt-4 text-sm py-2"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-3" noValidate>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldErrors((p) => ({ ...p, email: undefined }));
                      }}
                      placeholder="tu@correo.com"
                      className={`input-field text-sm py-2 ${fieldErrors.email ? "border-red-500/50" : ""}`}
                    />
                    <FieldError msg={fieldErrors.email} />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-xs">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex justify-center items-center gap-2 text-sm py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin w-3.5 h-3.5"
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
