import { useState } from "react";
import { supabase } from "../../lib/supabase";
import logoUrl from "../../assets/logo_relance.jpg";

const ROLES = [
  {
    id: "estudiante",
    icon: "icon-user",
    label: "Estudiante",
    desc: "Busca prácticas o empleo",
  },
  {
    id: "empresa",
    icon: "icon-company",
    label: "Empresa",
    desc: "Publica ofertas y encuentra talento",
    extraField: {
      label: "CIF de la empresa",
      placeholder: "B12345678",
      key: "cif",
    },
    note: "Será verificado por el equipo de Relance",
  },
  {
    id: "centro_educativo",
    icon: "icon-educativeCenter",
    label: "Centro educativo",
    desc: "Gestiona tus estudiantes",
    extraField: {
      label: "Código institucional",
      placeholder: "Ej: IES-MAD-2024",
      key: "code",
    },
    note: "Será verificado por el equipo de Relance",
  },
  {
    id: "tutor",
    icon: "icon-user2",
    label: "Tutor",
    desc: "Solo por enlace de invitación",
    disabled: true,
  },
];

function PasswordStrength({ password }) {
  const score =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 8
          ? 2
          : 3;
  const colors = ["", "bg-red-500", "bg-yellow-500", "bg-brand"];
  const labels = ["", "Débil", "Media", "Fuerte"];
  if (!password) return null;
  return (
    <div className="mt-2 flex items-center gap-2">
      {[1, 2, 3].map((lvl) => (
        <div
          key={lvl}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${score >= lvl ? colors[score] : "bg-white/10"}`}
        />
      ))}
      <span className="text-xs text-gray-500 w-10">{labels[score]}</span>
    </div>
  );
}

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(null);
  const [extraValue, setExtraValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const selectedRole = ROLES.find((r) => r.id === role);
  const isTutor = role === "tutor";
  const canSubmit = role && !isTutor;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    const metadata = {
      full_name: fullName,
      role,
      ...(role === "empresa" && { cif: extraValue }),
      ...(role === "centro_educativo" && { institutional_code: extraValue }),
    };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div
        className="modal-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-card text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">
            ¡Cuenta creada!
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Revisa tu correo electrónico en{" "}
            <span className="text-brand">{email}</span> para confirmar tu
            cuenta.
            {(role === "empresa" || role === "centro_educativo") && (
              <span className="block mt-2 text-gray-500">
                Tu {role === "empresa" ? "CIF" : "código institucional"} será
                verificado por el equipo de Relance en las próximas 24–48 h.
              </span>
            )}
          </p>
          <button onClick={onClose} className="btn-primary w-full">
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card max-h-[90vh] overflow-y-auto">
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

        <h2 className="font-display text-2xl font-bold text-white text-center mb-1">
          Crea tu cuenta
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          Únete a Relance y conecta con oportunidades reales
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Nombre completo
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre y apellidos"
              className="input-field"
            />
          </div>

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
              className="input-field"
            />
          </div>

          {/* Contraseña */}
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
                placeholder="Mínimo 8 caracteres"
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
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
            <PasswordStrength password={password} />
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Confirmar contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="input-field"
            />
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-red-400 mt-1">
                Las contraseñas no coinciden
              </p>
            )}
            {confirmPassword &&
              confirmPassword === password &&
              password.length >= 8 && (
                <p className="text-xs text-brand mt-1">
                  ✓ Las contraseñas coinciden
                </p>
              )}
          </div>

          {/* Selector de rol — cards visuales */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Tipo de cuenta
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => {
                    setRole(r.id);
                    setExtraValue("");
                  }}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                    role === r.id
                      ? "border-brand bg-brand/10 text-white"
                      : "border-white/10 hover:border-white/20 text-gray-400 hover:text-gray-300"
                  } ${r.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                  disabled={r.disabled}
                >
                  <div className="text-xl mb-1">
                    <svg className="w-5 h-5">
                      <use href={`icons.svg#${r.icon}`} />
                    </svg>
                  </div>
                  <div className="text-xs font-semibold">{r.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                    {r.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Campo adicional para empresa o centro educativo */}
          {selectedRole?.extraField && (
            <div className="animate-fade-in">
              <label className="block text-sm text-gray-400 mb-1.5">
                {selectedRole.extraField.label}
              </label>
              <input
                type="text"
                required
                value={extraValue}
                onChange={(e) => setExtraValue(e.target.value)}
                placeholder={selectedRole.extraField.placeholder}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                ℹ️ {selectedRole.note}
              </p>
            </div>
          )}

          {/* Aviso para tutor */}
          {isTutor && (
            <div className="animate-fade-in bg-brand/10 border border-brand/30 rounded-xl p-4">
              <p className="text-sm text-brand">
                👨‍🏫 Los tutores deben registrarse a través del{" "}
                <strong>enlace de invitación</strong> enviado por su empresa o
                centro educativo. Existen dos tipos: tutores de centro educativo
                y tutores de empresa.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                Creando cuenta...
              </>
            ) : isTutor ? (
              "Registro solo por invitación"
            ) : !role ? (
              "Selecciona un tipo de cuenta"
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-brand hover:text-brand-dark font-medium transition-colors"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
