import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Swal from "sweetalert2";
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
    icon: "icon-building",
    label: "Empresa",
    desc: "Publica ofertas y encuentra talento",
  },
  {
    id: "centro_educativo",
    icon: "icon-home",
    label: "Centro educativo",
    desc: "Gestiona tus estudiantes",
  },
  {
    id: "tutor",
    icon: "icon-user2",
    label: "Tutor",
    desc: "Solo por enlace de invitación",
  },
];

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(null);
  const [cif, setCif] = useState("");
  const [institutionalCode, setInstitutionalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [success, setSuccess] = useState(false);
  // Control de envío para evitar múltiples peticiones simultáneas
  const [submitting, setSubmitting] = useState(false);

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return "weak";
    if (password.length < 8) return "medium";
    return "strong";
  };

  const strength = passwordStrength();

  const isDisabled = role === "tutor" || !role;

  const handleRegister = async (e) => {
    e.preventDefault();

    // Evita múltiples envíos simultáneos (causa común del rate limit)
    if (submitting) return;

    setSubmitting(true);
    setLoading(true);
    setError(null);

    // Validaciones básicas
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setSubmitting(false);
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setSubmitting(false);
      setLoading(false);
      return;
    }

    const metadata = {
      full_name: fullName,
      role,
      ...(role === "empresa" && { cif }),
      ...(role === "centro_educativo" && {
        institutional_code: institutionalCode,
      }),
    };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    // ERROR HANDLING MEJORADO
    if (error) {
      // Caso específico de Supabase rate limit
      if (error.message?.toLowerCase().includes("rate limit")) {
        setError(
          "Demasiados intentos seguidos. Espera unos minutos e inténtalo de nuevo.",
        );
      } else {
        setError(error.message);
      }

      setSubmitting(false);
      setLoading(false);
      return;
    }

    setSubmitting(false);
    setLoading(false);

    // SUCCESS MODAL
    Swal.fire({
      icon: "success",
      title: "¡Cuenta creada!",
      html: `
      <p style="color:#9ca3af; font-size:14px; line-height:1.5;">
        Revisa tu correo electrónico para confirmar tu cuenta.<br/>
        Una vez confirmada, podrás iniciar sesión.
      </p>
    `,
      confirmButtonText: "Entendido",
      confirmButtonColor: "#c0ff72",
      background: "#0b0f14",
      color: "#ffffff",
      iconColor: "#c0ff72",
      customClass: {
        popup: "rounded-2xl border border-white/10",
      },
    }).then(() => {
      onClose();
    });
  };

  // if (success) {
  //   return (
  //     <div
  //       className="modal-overlay"
  //       onClick={(e) => e.target === e.currentTarget && onClose()}
  //     >
  //       <div className="modal-card text-center">
  //         <div className="text-5xl mb-4">✅</div>
  //         <h2 className="font-display text-2xl font-bold text-white mb-2">
  //           ¡Cuenta creada!
  //         </h2>
  //         <p className="text-gray-400 text-sm mb-6">
  //           Revisa tu correo electrónico para confirmar tu cuenta. Una vez
  //           confirmada, podrás iniciar sesión.
  //         </p>
  //         <button onClick={onClose} className="btn-primary w-full">
  //           Entendido
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

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
            {/* Indicador de fuerza */}
            {strength && (
              <div className="mt-2 flex gap-1">
                {["weak", "medium", "strong"].map((lvl, i) => (
                  <div
                    key={lvl}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      ["weak", "medium", "strong"].indexOf(strength) >= i
                        ? strength === "weak"
                          ? "bg-red-500"
                          : strength === "medium"
                            ? "bg-yellow-500"
                            : "bg-brand"
                        : "bg-white/10"
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-2">
                  {strength === "weak" && "Débil"}
                  {strength === "medium" && "Media"}
                  {strength === "strong" && "Fuerte"}
                </span>
              </div>
            )}
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
          </div>

          {/* Selector de rol */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Tipo de cuenta
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                    role === r.id
                      ? "border-brand bg-brand/10 text-white"
                      : "border-white/10 hover:border-white/20 text-gray-400 hover:text-gray-300"
                  } ${r.id === "tutor" ? "opacity-60" : ""}`}
                >
                  <div className="mb-1">
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

          {/* Campo adicional: CIF para empresa */}
          {role === "empresa" && (
            <div className="animate-fade-in">
              <label className="block text-sm text-gray-400 mb-1.5">
                CIF de la empresa
              </label>
              <input
                type="text"
                required
                value={cif}
                onChange={(e) => setCif(e.target.value)}
                placeholder="B12345678"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400">
                  <use href={`icons.svg#icon-info`} />
                </svg>
                Será verificado por el equipo de Relance
              </p>
            </div>
          )}

          {/* Campo adicional: Código institucional */}
          {role === "centro_educativo" && (
            <div className="animate-fade-in">
              <label className="block text-sm text-gray-400 mb-1.5">
                Código institucional
              </label>
              <input
                type="text"
                required
                value={institutionalCode}
                onChange={(e) => setInstitutionalCode(e.target.value)}
                placeholder="Ej: IES-COR-2026"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4 text-gray-400">
                  <use href={`icons.svg#icon-info`} />
                </svg>
                Será verificado por el equipo de Relance
              </p>
            </div>
          )}

          {/* Aviso para tutor */}
          {role === "tutor" && (
            <div className="animate-fade-in bg-brand/10 border border-brand/30 rounded-xl p-4">
              <p className="text-sm text-brand">
                <svg className="w-4 h-4 inline-block mr-1 align-text-bottom">
                  <use href="icons.svg#icon-info" />
                </svg>
                Los tutores deben registrarse a través del{" "}
                <strong>enlace de invitación</strong> enviado por su empresa o
                centro educativo.
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
            disabled={isDisabled || loading || submitting}
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
            ) : role === "tutor" ? (
              "Registro solo por invitación"
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        {/* Switch a login */}
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
