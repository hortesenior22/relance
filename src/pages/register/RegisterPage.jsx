import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import logoUrl from "../../assets/logo_relance.jpg";
import MainLayout from "../../components/layout/MainLayout";

// ── Constantes ─────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: "estudiante",
    icon: "icon-student",
    label: "Estudiante",
    desc: "Busca prácticas o tu primer empleo",
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/30",
    accent: "#60a5fa",
  },
  {
    id: "empresa",
    icon: "icon-company",
    label: "Empresa",
    desc: "Publica ofertas y encuentra talento",
    color: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/30",
    accent: "#a78bfa",
  },
  {
    id: "centro_educativo",
    icon: "icon-educativeCenter",
    label: "Centro educativo",
    desc: "Gestiona las prácticas de tus alumnos",
    color: "from-orange-500/20 to-orange-600/5",
    border: "border-orange-500/30",
    accent: "#fb923c",
  },
];

// ── Componentes auxiliares ──────────────────────────────────────────────────
function PasswordField({
  value,
  onChange,
  placeholder = "Mínimo 8 caracteres",
  required = true,
  minLength = 8,
  showStrength = true,
}) {
  const navigate = useNavigate();
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
          placeholder={placeholder}
          required={required}
          minLength={minLength}
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
      {showStrength && value && (
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

// Formulario para ESTUDIANTE
function StudentForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    centerName: "",
    degree: "",
    graduationYear: "",
  });
  const s = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    onSubmit({ ...form, role: "estudiante" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
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
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">
            Correo electrónico *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={s("email")}
            placeholder="tu@correo.com"
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
          {/* <input
            type="password"
            required
            value={form.confirmPassword}
            onChange={s("confirmPassword")}
            placeholder="Repite la contraseña"
            className="input-field"
          /> */}
          <PasswordField
            value={form.confirmPassword}
            onChange={s("confirmPassword")}
            placeholder="Repite la contraseña"
            showStrength={false}
          />
          {form.confirmPassword && form.confirmPassword !== form.password && (
            <p className="text-xs text-red-400 mt-1">No coinciden</p>
          )}
          {form.confirmPassword &&
            form.confirmPassword === form.password &&
            form.password.length >= 8 && (
              <p className="text-xs text-brand mt-1">✓ Coinciden</p>
            )}
        </div>
      </div>

      <div className="pt-2 border-t border-white/10">
        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">
          Información académica (opcional)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-1.5">
              Centro educativo
            </label>
            <input
              type="text"
              value={form.centerName}
              onChange={s("centerName")}
              placeholder="Ej: IES Trassierra"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Titulación / Ciclo
            </label>
            <input
              type="text"
              value={form.degree}
              onChange={s("degree")}
              placeholder="Ej: DAM"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Año de finalización
            </label>
            <input
              type="number"
              value={form.graduationYear}
              onChange={s("graduationYear")}
              placeholder="2025"
              min="2020"
              max="2035"
              className="input-field"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      <SubmitButton loading={loading} label="Crear cuenta de estudiante" />
    </form>
  );
}

// Formulario para EMPRESA
function CompanyForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    cif: "",
    sector: "",
    size: "",
    website: "",
    city: "",
  });
  const s = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    onSubmit({ ...form, role: "empresa" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">
            Tu nombre completo (representante) *
          </label>
          <input
            type="text"
            required
            value={form.fullName}
            onChange={s("fullName")}
            placeholder="Nombre del representante"
            className="input-field"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">
            Correo electrónico corporativo *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={s("email")}
            placeholder="contacto@empresa.com"
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
          {/* <input
            type="password"
            required
            value={form.confirmPassword}
            onChange={s("confirmPassword")}
            placeholder="Repite la contraseña"
            className="input-field"
          /> */}
          <PasswordField
            value={form.confirmPassword}
            onChange={s("confirmPassword")}
            placeholder="Repite la contraseña"
            showStrength={false}
          />
          {form.confirmPassword && form.confirmPassword !== form.password && (
            <p className="text-xs text-red-400 mt-1">No coinciden</p>
          )}
          {form.confirmPassword &&
            form.confirmPassword === form.password &&
            form.password.length >= 8 && (
              <p className="text-xs text-brand mt-1">✓ Coinciden</p>
            )}
        </div>
      </div>

      <div className="pt-2 border-t border-white/10">
        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">
          Datos de la empresa
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-1.5">
              Nombre de la empresa *
            </label>
            <input
              type="text"
              required
              value={form.companyName}
              onChange={s("companyName")}
              placeholder="Mi Empresa S.L."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">CIF *</label>
            <input
              type="text"
              required
              value={form.cif}
              onChange={s("cif")}
              placeholder="B12345678"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Sector</label>
            <select
              value={form.sector}
              onChange={s("sector")}
              className="input-field"
            >
              <option value="">Seleccionar sector</option>
              {[
                "Tecnología",
                "Marketing",
                "Diseño",
                "Finanzas",
                "Salud",
                "Educación",
                "Comercio",
                "Industria",
                "Otro",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Tamaño de empresa
            </label>
            <select
              value={form.size}
              onChange={s("size")}
              className="input-field"
            >
              <option value="">Seleccionar tamaño</option>
              {[
                "1–10 empleados",
                "11–50 empleados",
                "51–200 empleados",
                "201–500 empleados",
                "500+ empleados",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Ciudad</label>
            <input
              type="text"
              value={form.city}
              onChange={s("city")}
              placeholder="Córdoba"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Sitio web
            </label>
            <input
              type="url"
              value={form.website}
              onChange={s("website")}
              placeholder="https://miempresa.com"
              className="input-field"
            />
          </div>
        </div>
        <div className="mt-3 bg-brand/5 border border-brand/15 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400">
              <use href={`icons.svg#icon-info`} />
            </svg>
            El CIF será verificado por el equipo de Relance en un plazo de 24–48
            h antes de activar la cuenta plenamente.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      <SubmitButton loading={loading} label="Crear cuenta de empresa" />
    </form>
  );
}

// Formulario para CENTRO EDUCATIVO
function CenterForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    centerName: "",
    institutionalCode: "",
    centerType: "",
    city: "",
    province: "",
    website: "",
  });
  const s = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    onSubmit({ ...form, role: "centro_educativo" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">
            Tu nombre completo (responsable) *
          </label>
          <input
            type="text"
            required
            value={form.fullName}
            onChange={s("fullName")}
            placeholder="Nombre del responsable"
            className="input-field"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">
            Correo electrónico institucional *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={s("email")}
            placeholder="responsable@centro.edu.es"
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
          {/* <input
            type="password"
            required
            value={form.confirmPassword}
            onChange={s("confirmPassword")}
            placeholder="Repite la contraseña"
            className="input-field"
          /> */}
          <PasswordField
            value={form.confirmPassword}
            onChange={s("confirmPassword")}
            placeholder="Repite la contraseña"
            showStrength={false}
          />
          {form.confirmPassword && form.confirmPassword !== form.password && (
            <p className="text-xs text-red-400 mt-1">No coinciden</p>
          )}
          {form.confirmPassword &&
            form.confirmPassword === form.password &&
            form.password.length >= 8 && (
              <p className="text-xs text-brand mt-1">✓ Coinciden</p>
            )}
        </div>
      </div>

      <div className="pt-2 border-t border-white/10">
        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">
          Datos del centro
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-1.5">
              Nombre del centro *
            </label>
            <input
              type="text"
              required
              value={form.centerName}
              onChange={s("centerName")}
              placeholder="IES Nombre del Centro"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Código institucional *
            </label>
            <input
              type="text"
              required
              value={form.institutionalCode}
              onChange={s("institutionalCode")}
              placeholder="Ej: IES-COR-2026"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Tipo de centro
            </label>
            <select
              value={form.centerType}
              onChange={s("centerType")}
              className="input-field"
            >
              <option value="">Seleccionar tipo</option>
              {[
                "IES — Instituto de Educación Secundaria",
                "FP — Formación Profesional",
                "Universidad",
                "Centro privado",
                "Academia",
                "Otro",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Ciudad *
            </label>
            <input
              type="text"
              required
              value={form.city}
              onChange={s("city")}
              placeholder="Córdoba"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Provincia
            </label>
            <input
              type="text"
              value={form.province}
              onChange={s("province")}
              placeholder="Córdoba"
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-1.5">
              Sitio web del centro
            </label>
            <input
              type="url"
              value={form.website}
              onChange={s("website")}
              placeholder="https://iesejemplo.edu.es"
              className="input-field"
            />
          </div>
        </div>
        <div className="mt-3 bg-brand/5 border border-brand/15 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400">
              <use href={`icons.svg#icon-info`} />
            </svg>
            El código institucional será verificado por el equipo de Relance
            antes de activar la cuenta.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      <SubmitButton
        loading={loading}
        label="Crear cuenta de centro educativo"
      />
    </form>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="btn-primary w-full flex justify-center items-center gap-2 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
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
      ) : (
        label
      )}
    </button>
  );
}

// ── Página principal ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    const { fullName, email, password, role, ...extra } = formData;

    const metadata = { full_name: fullName, role, ...extra };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    setLoading(false);
    if (error) {
      setError(
        error.message === "User already registered"
          ? "Este correo ya está registrado. ¿Quieres iniciar sesión?"
          : error.message,
      );
    } else {
      setRegisteredEmail(email);
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-10 text-center">
            <div className="text-6xl mb-5">🎉</div>
            <h2 className="font-display text-2xl font-bold text-white mb-3">
              ¡Cuenta creada!
            </h2>
            <p className="text-gray-400 text-sm mb-2">
              Hemos enviado un correo de verificación a:
            </p>
            <p className="text-brand font-semibold mb-6">{registeredEmail}</p>
            <p className="text-gray-500 text-xs mb-8">
              Revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en
              el enlace para activar tu cuenta.
              {(selectedRole === "empresa" ||
                selectedRole === "centro_educativo") && (
                <span className="block mt-2">
                  Además, el equipo de Relance verificará tus datos en 24–48 h.
                </span>
              )}
            </p>
            <button
              onClick={() => navigate("/")}
              className="btn-primary w-full"
            >
              Ir al inicio
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn-secondary w-full mt-3"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* <div className="min-h-screen bg-dark py-12 px-4"> */}
      {/* // <div className="relative min-h-screen bg-dark py-12 px-4 overflow-hidden"> */}
      {/* GRID de fondo */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          zIndex: -99,
          backgroundImage: `linear-gradient(rgba(192,255,114,1) 1px, transparent 1px), linear-gradient(90deg, rgba(192,255,114,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow central */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-[0.06] blur-[120px] pointer-events-none"
        style={{ background: "#c0ff72" }}
      />

      {/* Glow secundario */}
      <div
        className="absolute bottom-20 right-10 w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px] pointer-events-none"
        style={{ background: "#c0ff72" }}
      />

      {/* Contenido */}
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center m-10">
          {/* <a href="/">
            <img
              src={logoUrl}
              alt="Relance"
              className="h-9 rounded-md mx-auto mb-6"
            />
          </a> */}
          <h1 className="font-display text-3xl font-extrabold text-white mb-2">
            Crea tu cuenta
          </h1>
          <p className="text-gray-500 text-base">
            Elige tu tipo de cuenta para empezar
          </p>
        </div>

        {/* Selector de rol */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                setSelectedRole(role.id);
                setError(null);
              }}
              className={`relative p-4 rounded-2xl border text-left transition-all duration-200 group overflow-hidden ${
                selectedRole === role.id
                  ? `border-brand bg-brand/10`
                  : "border-white/10 hover:border-white/20 bg-dark-800"
              }`}
            >
              {/* Glow de fondo si seleccionado */}
              {selectedRole === role.id && (
                <div className="absolute inset-0 bg-brand/5 pointer-events-none" />
              )}
              <span className="text-2xl block mb-2">
                <svg className="w-5 h-5">
                  <use href={`icons.svg#${role.icon}`} />
                </svg>
              </span>
              <span
                className={`block text-sm font-bold font-display ${selectedRole === role.id ? "text-white" : "text-gray-300"}`}
              >
                {role.label}
              </span>
              <span className="block text-xs text-gray-500 mt-0.5 leading-tight">
                {role.desc}
              </span>
              {selectedRole === role.id && (
                <div className="absolute top-2.5 right-2.5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c0ff72"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Tutor: aviso */}
        <div className="mb-6 bg-brand/5 border border-brand/20 rounded-2xl p-4 flex gap-3">
          <span className="text-xl flex-shrink-0">
            <svg className="text-brand w-5 h-5">
              <use href={`icons.svg#icon-tutor`} />
            </svg>
          </span>
          <div>
            <p className="text-brand text-sm font-semibold">¿Eres tutor?</p>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              Los tutores (de empresa o de centro educativo) se registran
              únicamente a través del
              <strong className="text-gray-400">
                {" "}
                enlace de invitación QR
              </strong>{" "}
              generado por su empresa o centro. Pide a tu responsable que lo
              genere desde su perfil de configuración.
            </p>
          </div>
        </div>

        {/* Formulario por rol */}
        {selectedRole && (
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 sm:p-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <span className="text-xl">
                <svg className="w-6 h-6">
                  <use
                    href={`icons.svg#${ROLES.find((r) => r.id === selectedRole)?.icon}`}
                  />
                </svg>

                {/* {ROLES.find((r) => r.id === selectedRole)?.icon} */}
              </span>
              <h2 className="font-display font-bold text-white">
                Registro como {ROLES.find((r) => r.id === selectedRole)?.label}
              </h2>
            </div>

            {selectedRole === "estudiante" && (
              <StudentForm
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
              />
            )}
            {selectedRole === "empresa" && (
              <CompanyForm
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
              />
            )}
            {selectedRole === "centro_educativo" && (
              <CenterForm
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
              />
            )}
          </div>
        )}

        {!selectedRole && (
          <div className="text-center text-gray-600 text-sm py-8">
            Selecciona un tipo de cuenta para continuar
          </div>
        )}

        {/* Link a login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <a
            onClick={() => navigate("/", { state: { openLogin: true } })}
            className="text-brand hover:text-brand-dark font-medium transition-colors hover:cursor-pointer"
          >
            Inicia sesión
          </a>
        </p>
      </div>
      {/* </div> */}
    </MainLayout>
  );
}
