import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import logoUrl from "../../assets/logo_relance.jpg";

// ── Password field con indicador de fortaleza ────────────────────────────────
function PasswordField({ value, onChange }) {
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
          required
          minLength={8}
          className="input-field pr-10"
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

// ── Pantalla: sesión activa ──────────────────────────────────────────────────
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
          con esta invitación, cierra tu sesión primero.
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

// ── Pantalla: token inválido ─────────────────────────────────────────────────
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
          Este enlace de invitación no es válido, ya ha sido usado o ha caducado
          (validez: 7 días). Pide a tu empresa o centro que genere un nuevo
          código QR desde su perfil.
        </p>
        <a href="/" className="btn-secondary block w-full text-center">
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

// ── Pantalla: éxito ──────────────────────────────────────────────────────────
function SuccessScreen({ entityName, navigate }) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-10 text-center">
        <div className="mb-5 flex justify-center">
          <svg className="w-16 h-16 text-brand" viewBox="0 0 640 640">
            <use href="/icons.svg#icon-party" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">
          ¡Ya eres parte del equipo!
        </h2>
        <p className="text-gray-400 text-sm mb-2">
          Tu cuenta de tutor ha sido creada y vinculada a:
        </p>
        <p className="text-brand font-semibold text-lg mb-4">{entityName}</p>
        <p className="text-gray-500 text-xs mb-8">
          Revisa tu correo para verificar tu cuenta antes de iniciar sesión.
        </p>
        <button onClick={() => navigate("/")} className="btn-primary w-full">
          Ir al inicio
        </button>
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function TutorRegisterPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const token = params.get("token");
  const entityId = params.get("entity");
  const entityType = params.get("type"); // 'empresa' | 'centro_educativo'

  // pageState: "loading" | "logged_in" | "invalid" | "form" | "success"
  const [pageState, setPageState] = useState("loading");
  const [entityInfo, setEntityInfo] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    specialty: "",
  });
  const s = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // ── Validar token ────────────────────────────────────────────────────
  // La tabla invite_tokens necesita una política RLS de SELECT para "anon":
  //   Supabase Dashboard → Authentication → Policies → invite_tokens
  //   → New Policy → "Enable read access for all users" → USING (true)
  const validateToken = async () => {
    if (!token || !entityId || !entityType) return null;

    const { data, error } = await supabase
      .from("invite_tokens")
      .select("id, entity_id, entity_type, used, expires_at")
      .eq("token", token)
      .eq("entity_id", entityId)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle(); // No lanza error si 0 filas, a diferencia de .single()

    if (error) {
      console.error("Error al validar token:", error.message);
      return null;
    }
    return data; // null si no existe/expiró
  };

  const fetchEntityName = async () => {
    try {
      if (entityType === "empresa") {
        const { data } = await supabase
          .from("empresa")
          .select("nombre")
          .eq("id_usuario", entityId)
          .maybeSingle();
        return data?.nombre || null;
      }
      if (entityType === "centro_educativo") {
        const { data } = await supabase
          .from("centro_educativo")
          .select("nombre")
          .eq("id", entityId)
          .maybeSingle();
        return data?.nombre || null;
      }
    } catch {
      return null;
    }
    return null;
  };

  // ── Efecto: esperar a Auth, luego validar ────────────────────────────
  useEffect(() => {
    if (authLoading) return; // Esperar a que AuthContext resuelva

    const init = async () => {
      // Si hay sesión activa, mostrar aviso
      if (user) {
        setPageState("logged_in");
        return;
      }

      // Validar token
      const tokenData = await validateToken();
      if (!tokenData) {
        setPageState("invalid");
        return;
      }

      // Obtener nombre de la entidad (best effort)
      const entityName = await fetchEntityName();

      setEntityInfo({
        name:
          entityName || (entityType === "empresa" ? "la empresa" : "el centro"),
        type: entityType,
        id: entityId,
        tokenId: tokenData.id,
      });

      setPageState("form");
    };

    init();
  }, [authLoading, user]);

  // ── Cerrar sesión → AuthContext actualiza user → useEffect re-ejecuta ─
  const handleSignOut = async () => {
    setPageState("loading");
    await signOut();
  };

  // ── Submit: crear cuenta + insertar en BD ────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setSubmitError("Las contraseñas no coinciden.");
      return;
    }
    if (form.password.length < 8) {
      setSubmitError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const role = entityType === "empresa" ? "tutor_empresa" : "tutor_centro";

    try {
      // 1. Crear cuenta en Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.fullName, role } },
        },
      );
      if (signUpError) throw signUpError;

      const newUserId = authData.user?.id;
      if (!newUserId)
        throw new Error("No se pudo obtener el ID del nuevo usuario.");

      // 2. Insertar en tabla genérica "usuario"
      const { error: usuarioError } = await supabase.from("usuario").upsert(
        {
          id: newUserId,
          email: form.email,
          nombre: form.fullName,
          rol: role,
          is_profile_completed: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
      console.log("usuario insert error:", usuarioError);

      if (usuarioError && !usuarioError.message?.includes("duplicate")) {
        throw usuarioError;
      }

      // 3. Insertar en tabla de tutor y vincular a la entidad
      //    Ajusta los nombres de tabla y columnas según tu esquema real
      if (entityType === "empresa") {
        const { error: tutorError } = await supabase
          .from("tutor_empresa")
          .insert({
            id: newUserId, // PK = id del usuario
            empresa_id: entityId,
            nombre: form.fullName,
            telefono: form.phone || null,
            cargo: form.specialty || null, // specialty → cargo
          });
        if (tutorError)
          console.warn("tutor_empresa insert:", tutorError.message);
      } else {
        const { error: tutorError } = await supabase
          .from("tutor_centro")
          .insert({
            id: newUserId, // PK = id del usuario
            centro_id: entityId,
            nombre: form.fullName,
            telefono: form.phone || null,
            departamento: form.specialty || null, // specialty → departamento
          });
        if (tutorError)
          console.warn("tutor_centro insert:", tutorError.message);
      }

      // 4. Marcar token como usado
      await supabase
        .from("invite_tokens")
        .update({ used: true, used_at: new Date().toISOString() })
        .eq("token", token);

      setPageState("success");
    } catch (err) {
      console.error("Error en registro de tutor:", err);
      setSubmitError(
        err.message || "Error al crear la cuenta. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Renders condicionales ────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (pageState === "logged_in") {
    const displayName =
      user?.user_metadata?.full_name || user?.email || "tu cuenta actual";
    return <AlreadyLoggedIn userName={displayName} onSignOut={handleSignOut} />;
  }
  if (pageState === "invalid") return <InvalidToken />;
  if (pageState === "success") {
    return <SuccessScreen entityName={entityInfo?.name} navigate={navigate} />;
  }

  // ── Formulario ───────────────────────────────────────────────────────
  const entityLabel = entityType === "empresa" ? "empresa" : "centro educativo";
  const roleLabel =
    entityType === "empresa" ? "tutor de empresa" : "tutor de centro educativo";

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

        {/* Banner de invitación */}
        <div className="bg-brand/10 border border-brand/25 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <span className="flex-shrink-0">
            <svg className="w-8 h-8 text-brand" viewBox="0 0 640 640">
              <use href="/icons.svg#icon-hand-wave" />
            </svg>
          </span>
          <div>
            <p className="text-white font-semibold font-display">
              Invitación de {entityInfo?.name}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Estás a punto de crear tu cuenta como{" "}
              <strong className="text-brand">{roleLabel}</strong> vinculado a
              esta {entityLabel}.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-white mb-6">
            Completa tu registro
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Nombre completo *
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={s("fullName")}
                placeholder="Tu nombre y apellidos"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Correo electrónico *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={s("email")}
                placeholder="tutor@correo.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Contraseña *
              </label>
              <PasswordField value={form.password} onChange={s("password")} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Confirmar contraseña *
              </label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={s("confirmPassword")}
                placeholder="Repite la contraseña"
                className="input-field"
              />
              {form.confirmPassword &&
                form.confirmPassword !== form.password && (
                  <p className="text-xs text-red-400 mt-1">No coinciden</p>
                )}
              {form.confirmPassword &&
                form.confirmPassword === form.password &&
                form.password.length >= 8 && (
                  <p className="text-xs text-brand mt-1">✓ Coinciden</p>
                )}
            </div>

            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">
                Información adicional
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={s("phone")}
                    placeholder="+34 600 000 000"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    {entityType === "empresa" ? "Cargo" : "Departamento"}
                  </label>
                  <input
                    type="text"
                    value={form.specialty}
                    onChange={s("specialty")}
                    placeholder={
                      entityType === "empresa"
                        ? "Ej: Responsable de RRHH"
                        : "Ej: Informática"
                    }
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Entidad vinculada (solo lectura) */}
            <div className="bg-dark border border-white/8 rounded-xl p-3 flex items-center gap-3">
              <span>
                {entityType === "empresa" ? (
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 640 640">
                    <use href="/icons.svg#icon-building" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 640 640">
                    <use href="/icons.svg#icon-school" />
                  </svg>
                )}
              </span>
              <div>
                <p className="text-xs text-gray-500">Vinculado a</p>
                <p className="text-sm text-white font-semibold">
                  {entityInfo?.name}
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-brand/20 text-brand px-2 py-0.5 rounded-full">
                  Invitación válida
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
                `Registrarme como ${roleLabel}`
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/"
            className="text-gray-400 hover:text-white underline transition-colors"
          >
            Inicia sesión desde el inicio
          </a>
        </p>
      </div>
    </div>
  );
}
