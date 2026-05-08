import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import logoUrl from "../../assets/logo_relance.jpg";

// ── Helpers ──────────────────────────────────────────────────────────────────
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function FieldError({ msg }) {
  return msg ? <p className="text-xs text-red-400 mt-1">{msg}</p> : null;
}
function inputCls(err) {
  return `input-field${err ? " border-red-500/50 focus:border-red-500" : ""}`;
}

function PasswordField({ value, onChange, hasError }) {
  const [show, setShow] = useState(false);
  const score = !value
    ? 0
    : value.length < 6
      ? 1
      : value.length < 8
        ? 2
        : /[A-Z]/.test(value) && /[0-9]/.test(value)
          ? 4
          : 3;
  const colors = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-brand",
  ];
  const labels = ["", "Muy débil", "Débil", "Media", "Fuerte"];
  return (
    <div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="Mínimo 8 caracteres"
          className={inputCls(hasError) + " pr-10"}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          {show ? (
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
      {value && (
        <div className="mt-2 flex items-center gap-2">
          {[1, 2, 3, 4].map((lvl) => (
            <div
              key={lvl}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${score >= lvl ? colors[score] : "bg-white/10"}`}
            />
          ))}
          <span className="text-xs text-gray-500 w-16 text-right">
            {labels[score]}
          </span>
        </div>
      )}
    </div>
  );
}

function Spinner({ className = "w-8 h-8" }) {
  return (
    <svg
      className={`animate-spin text-brand ${className}`}
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
  );
}

function AlreadyLoggedIn({ userName, onSignOut }) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-10 text-center">
        <div className="mb-4 flex justify-center">
          <svg className="w-14 h-14 text-brand" viewBox="0 0 640 640">
            <use href="/icons.svg#icon-user-check" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-white mb-2">
          Ya tienes sesión iniciada
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Estás conectado como{" "}
          <strong className="text-white">{userName}</strong>. Para registrarte
          como administrador cierra tu sesión primero.
        </p>
        <button onClick={onSignOut} className="btn-primary w-full mb-3">
          Cerrar sesión y continuar
        </button>
        <a href="/" className="btn-secondary block w-full text-center">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

function InvalidToken() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-10 text-center">
        <div className="mb-4 flex justify-center">
          <svg className="w-14 h-14 text-yellow-400" viewBox="0 0 640 640">
            <use href="/icons.svg#icon-warning" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-white mb-2">
          Enlace inválido o caducado
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Este enlace de invitación de administrador no es válido, ya ha sido
          usado o ha caducado. Solicita uno nuevo al administrador que te
          invitó.
        </p>
        <a href="/" className="btn-secondary block w-full text-center">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

function SuccessScreen({ navigate }) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-10 text-center">
        <div className="mb-5 flex justify-center">
          <svg className="w-16 h-16 text-brand" viewBox="0 0 640 640">
            <use href="/icons.svg#icon-party" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">
          ¡Cuenta de administrador creada!
        </h2>
        <p className="text-gray-400 text-sm mb-2">
          Ya puedes acceder al panel de administración de Relance.
        </p>
        <p className="text-gray-500 text-xs mb-8">
          Revisa tu correo para verificar la cuenta antes de iniciar sesión.
        </p>
        <button onClick={() => navigate("/")} className="btn-primary w-full">
          Ir al inicio
        </button>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AdminRegisterPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const token = params.get("token");
  const entityId = params.get("entity"); // id del admin que invita

  const [pageState, setPageState] = useState("loading");
  const [inviterName, setInviterName] = useState("Relance");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errs, setErrs] = useState({});
  const s = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrs((p) => ({ ...p, [k]: undefined }));
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // ── Validar token ────────────────────────────────────────────────────────
  const validateToken = async () => {
    if (!token || !entityId) return null;
    const { data, error } = await supabase
      .from("invite_tokens")
      .select("id, entity_id, entity_type, used, expires_at")
      .eq("token", token)
      .eq("entity_id", entityId)
      .eq("entity_type", "admin")
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();
    if (error) {
      console.error("Error validando token admin:", error.message);
      return null;
    }
    return data;
  };

  useEffect(() => {
    if (authLoading) return;
    const init = async () => {
      if (user) {
        setPageState("logged_in");
        return;
      }
      const tokenData = await validateToken();
      if (!tokenData) {
        setPageState("invalid");
        return;
      }
      // Obtener nombre del admin que invita
      try {
        const { data } = await supabase
          .from("usuario")
          .select("nombre")
          .eq("id", entityId)
          .maybeSingle();
        if (data?.nombre) setInviterName(data.nombre);
      } catch {
        /* ignorar */
      }
      setPageState("form");
    };
    init();
  }, [authLoading, user]);

  const handleSignOut = async () => {
    setPageState("loading");
    await signOut();
  };

  // ── Validación ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "El nombre es obligatorio.";
    if (!form.email.trim()) e.email = "El correo es obligatorio.";
    else if (!isValidEmail(form.email)) e.email = "Introduce un correo válido.";
    if (!form.password) e.password = "La contraseña es obligatoria.";
    else if (form.password.length < 8) e.password = "Mínimo 8 caracteres.";
    else if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password))
      e.password = "Debe tener al menos una mayúscula y un número.";
    if (!form.confirmPassword) e.confirmPassword = "Confirma tu contraseña.";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Las contraseñas no coinciden.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Crear cuenta en Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.fullName, role: "admin" } },
        },
      );
      if (signUpError) throw signUpError;

      const uid = authData.user?.id;
      if (!uid) throw new Error("No se pudo obtener el ID del usuario.");

      // 2. Insertar en tabla usuario
      await supabase
        .from("usuario")
        .upsert(
          {
            id: uid,
            email: form.email,
            nombre: form.fullName,
            rol: "admin",
            is_profile_completed: true,
          },
          { onConflict: "id" },
        );

      // 3. Insertar en tabla administrador
      await supabase
        .from("administrador")
        .insert({ id_usuario: uid, nivel: "admin" });

      // 4. Marcar token como usado
      await supabase
        .from("invite_tokens")
        .update({ used: true, used_at: new Date().toISOString() })
        .eq("token", token);

      setPageState("success");
    } catch (err) {
      console.error("Error en registro de admin:", err);
      setSubmitError(
        err.message || "Error al crear la cuenta. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Renders condicionales ─────────────────────────────────────────────────
  if (pageState === "loading")
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Spinner />
      </div>
    );
  if (pageState === "logged_in")
    return (
      <AlreadyLoggedIn
        userName={user?.user_metadata?.full_name || user?.email}
        onSignOut={handleSignOut}
      />
    );
  if (pageState === "invalid") return <InvalidToken />;
  if (pageState === "success") return <SuccessScreen navigate={navigate} />;

  return (
    <div className="min-h-screen bg-dark py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <a href="/">
            <img
              src={logoUrl}
              alt="Relance"
              className="h-9 rounded-md mx-auto mb-6"
            />
          </a>
        </div>

        {/* Banner */}
        <div className="bg-brand/10 border border-brand/25 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <span className="flex-shrink-0">
            <svg className="w-8 h-8 text-brand" viewBox="0 0 640 640">
              <use href="/icons.svg#icon-shield" />
            </svg>
          </span>
          <div>
            <p className="text-white font-semibold font-display">
              Invitación de administrador
            </p>
            <p className="text-gray-400 text-sm mt-1">
              <strong className="text-white">{inviterName}</strong> te ha
              invitado a unirte al equipo de administración de{" "}
              <strong className="text-brand">Relance</strong>.
            </p>
          </div>
        </div>

        <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">
            Crear cuenta de administrador
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Esta cuenta tendrá acceso al panel de administración.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Nombre completo *
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={s("fullName")}
                placeholder="Tu nombre y apellidos"
                className={inputCls(errs.fullName)}
              />
              <FieldError msg={errs.fullName} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Correo electrónico *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={s("email")}
                placeholder="admin@relance.es"
                className={inputCls(errs.email)}
              />
              <FieldError msg={errs.email} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Contraseña *
              </label>
              <PasswordField
                value={form.password}
                onChange={s("password")}
                hasError={!!errs.password}
              />
              <FieldError msg={errs.password} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Confirmar contraseña *
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={s("confirmPassword")}
                placeholder="Repite la contraseña"
                className={inputCls(errs.confirmPassword)}
              />
              {form.confirmPassword &&
                form.confirmPassword === form.password &&
                form.password.length >= 8 && (
                  <p className="text-xs text-brand mt-1">✓ Coinciden</p>
                )}
              <FieldError msg={errs.confirmPassword} />
            </div>

            {/* Indicador de rol */}
            <div className="bg-dark border border-white/8 rounded-xl p-3 flex items-center gap-3">
              <svg
                className="w-5 h-5 text-brand flex-shrink-0"
                viewBox="0 0 640 640"
              >
                <use href="/icons.svg#icon-shield" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Rol asignado</p>
                <p className="text-sm text-white font-semibold">
                  Administrador de Relance
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-brand/20 text-brand px-2 py-0.5 rounded-full">
                  Acceso total
                </span>
              </div>
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex justify-center items-center gap-2 py-3.5 text-base disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Spinner className="w-4 h-4" />
                  Creando cuenta...
                </>
              ) : (
                "Crear cuenta de administrador"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
