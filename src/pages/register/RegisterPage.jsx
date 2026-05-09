import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";

// ── Constantes ─────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: "estudiante",
    icon: "icon-student",
    label: "Estudiante",
    desc: "Busca prácticas o tu primer empleo",
  },
  {
    id: "empresa",
    icon: "icon-company",
    label: "Empresa",
    desc: "Publica ofertas y encuentra talento",
  },
  {
    id: "centro_educativo",
    icon: "icon-educativeCenter",
    label: "Centro educativo",
    desc: "Gestiona las prácticas de tus alumnos",
  },
];

// ── Helpers de validación ───────────────────────────────────────────────────
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidUrl = (v) => {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};
const isValidCif = (v) => /^[A-Z0-9]{8,9}$/i.test(v.trim());
const isValidPhone = (v) => /^[+\d\s\-().]{7,20}$/.test(v.trim());

function validateCommon(form) {
  const errs = {};
  if (!form.fullName.trim()) errs.fullName = "El nombre es obligatorio.";
  if (!form.email.trim()) errs.email = "El correo es obligatorio.";
  else if (!isValidEmail(form.email))
    errs.email = "Introduce un correo válido.";
  if (!form.password) errs.password = "La contraseña es obligatoria.";
  else if (form.password.length < 8) errs.password = "Mínimo 8 caracteres.";
  else if (!/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password))
    errs.password = "Debe tener al menos una mayúscula y un número.";
  if (!form.confirmPassword) errs.confirmPassword = "Confirma tu contraseña.";
  else if (form.password !== form.confirmPassword)
    errs.confirmPassword = "Las contraseñas no coinciden.";
  return errs;
}

// ── Componentes auxiliares ──────────────────────────────────────────────────
function FieldError({ msg }) {
  return msg ? <p className="text-xs text-red-400 mt-1">{msg}</p> : null;
}

function inputCls(hasError) {
  return `input-field${hasError ? " border-red-500/50 focus:border-red-500" : ""}`;
}

function PasswordField({
  value,
  onChange,
  placeholder = "Mínimo 8 caracteres",
  showStrength = true,
  hasError = false,
}) {
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

// ── Formulario ESTUDIANTE ───────────────────────────────────────────────────
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
  const [errs, setErrs] = useState({});
  const s = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrs((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = validateCommon(form);
    if (form.graduationYear) {
      const y = Number(form.graduationYear);
      if (isNaN(y) || y < 2020 || y > 2035)
        e.graduationYear = "Introduce un año entre 2020 y 2035.";
    }
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, role: "estudiante" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
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
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">
            Correo electrónico *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={s("email")}
            placeholder="tu@correo.com"
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
          <PasswordField
            value={form.confirmPassword}
            onChange={s("confirmPassword")}
            placeholder="Repite la contraseña"
            showStrength={false}
            hasError={!!errs.confirmPassword}
          />
          <FieldError msg={errs.confirmPassword} />
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
              className={inputCls(errs.graduationYear)}
            />
            <FieldError msg={errs.graduationYear} />
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

// ── Formulario EMPRESA ──────────────────────────────────────────────────────
function CompanyForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    cif: "",
    sector: "",
    tamanio: "",
    ciudad: "",
    web: "",
    telefono: "",
    descripcion: "",
  });
  const [errs, setErrs] = useState({});
  const s = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrs((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = validateCommon(form);
    if (!form.companyName.trim())
      e.companyName = "El nombre de la empresa es obligatorio.";
    if (!form.cif.trim()) e.cif = "El CIF es obligatorio.";
    else if (!isValidCif(form.cif))
      e.cif = "Formato de CIF inválido (ej: B12345678).";
    if (form.web && !isValidUrl(form.web))
      e.web = "Introduce una URL válida (ej: https://miempresa.com).";
    if (form.telefono && !isValidPhone(form.telefono))
      e.telefono = "Teléfono no válido.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, role: "empresa" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">
            Tu nombre completo (representante) *
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={s("fullName")}
            placeholder="Nombre del representante"
            className={inputCls(errs.fullName)}
          />
          <FieldError msg={errs.fullName} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">
            Correo electrónico corporativo *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={s("email")}
            placeholder="contacto@empresa.com"
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
          <PasswordField
            value={form.confirmPassword}
            onChange={s("confirmPassword")}
            placeholder="Repite la contraseña"
            showStrength={false}
            hasError={!!errs.confirmPassword}
          />
          <FieldError msg={errs.confirmPassword} />
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
              value={form.companyName}
              onChange={s("companyName")}
              placeholder="Mi Empresa S.L."
              className={inputCls(errs.companyName)}
            />
            <FieldError msg={errs.companyName} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">CIF *</label>
            <input
              type="text"
              value={form.cif}
              onChange={s("cif")}
              placeholder="B12345678"
              className={inputCls(errs.cif)}
            />
            <FieldError msg={errs.cif} />
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
              ].map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Tamaño de empresa
            </label>
            <select
              value={form.tamanio}
              onChange={s("tamanio")}
              className="input-field"
            >
              <option value="">Seleccionar tamaño</option>
              {[
                "1–10 empleados",
                "11–50 empleados",
                "51–200 empleados",
                "201–500 empleados",
                "500+ empleados",
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Ciudad</label>
            <input
              type="text"
              value={form.ciudad}
              onChange={s("ciudad")}
              placeholder="Madrid"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Teléfono
            </label>
            <input
              type="tel"
              value={form.telefono}
              onChange={s("telefono")}
              placeholder="+34 900 000 000"
              className={inputCls(errs.telefono)}
            />
            <FieldError msg={errs.telefono} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-1.5">
              Sitio web
            </label>
            <input
              type="url"
              value={form.web}
              onChange={s("web")}
              placeholder="https://miempresa.com"
              className={inputCls(errs.web)}
            />
            <FieldError msg={errs.web} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-1.5">
              Descripción de la empresa
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  descripcion: e.target.value.slice(0, 500),
                }))
              }
              rows={3}
              placeholder="Describe tu empresa, cultura y qué tipo de perfiles buscáis..."
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-600 mt-1 text-right">
              {form.descripcion.length}/500
            </p>
          </div>
        </div>
        <div className="mt-3 bg-brand/5 border border-brand/15 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5">
              <use href="icons.svg#icon-info" />
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

// ── Formulario CENTRO EDUCATIVO ─────────────────────────────────────────────
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
  const [errs, setErrs] = useState({});
  const s = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrs((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = validateCommon(form);
    if (!form.centerName.trim())
      e.centerName = "El nombre del centro es obligatorio.";
    if (!form.institutionalCode.trim())
      e.institutionalCode = "El código institucional es obligatorio.";
    else if (form.institutionalCode.trim().length < 3)
      e.institutionalCode = "El código debe tener al menos 3 caracteres.";
    if (!form.city.trim()) e.city = "La ciudad es obligatoria.";
    if (form.website && !isValidUrl(form.website))
      e.website = "Introduce una URL válida (ej: https://iesejemplo.edu.es).";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, role: "centro_educativo" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">
            Tu nombre completo (responsable) *
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={s("fullName")}
            placeholder="Nombre del responsable"
            className={inputCls(errs.fullName)}
          />
          <FieldError msg={errs.fullName} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-gray-400 mb-1.5">
            Correo electrónico institucional *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={s("email")}
            placeholder="responsable@centro.edu.es"
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
          <PasswordField
            value={form.confirmPassword}
            onChange={s("confirmPassword")}
            placeholder="Repite la contraseña"
            showStrength={false}
            hasError={!!errs.confirmPassword}
          />
          <FieldError msg={errs.confirmPassword} />
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
              value={form.centerName}
              onChange={s("centerName")}
              placeholder="IES Nombre del Centro"
              className={inputCls(errs.centerName)}
            />
            <FieldError msg={errs.centerName} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Código institucional *
            </label>
            <input
              type="text"
              value={form.institutionalCode}
              onChange={s("institutionalCode")}
              placeholder="Ej: IES-COR-2026"
              className={inputCls(errs.institutionalCode)}
            />
            <FieldError msg={errs.institutionalCode} />
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
              value={form.city}
              onChange={s("city")}
              placeholder="Córdoba"
              className={inputCls(errs.city)}
            />
            <FieldError msg={errs.city} />
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
              className={inputCls(errs.website)}
            />
            <FieldError msg={errs.website} />
          </div>
        </div>
        <div className="mt-3 bg-brand/5 border border-brand/15 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5">
              <use href="icons.svg#icon-info" />
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

    // El trigger handle_new_user() se encarga de insertar en `usuario`
    // y en la tabla de extensión correspondiente (estudiante / empresa /
    // centro_educativo) usando los metadatos que pasamos aquí.
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          ...(role === "empresa" && { cif: extra.cif ?? "" }),
          ...(role === "centro_educativo" && {
            institutional_code: extra.institutionalCode ?? "",
          }),
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(
        signUpError.message === "User already registered"
          ? "Este correo ya está registrado. ¿Quieres iniciar sesión?"
          : signUpError.message,
      );
      return;
    }

    // Para empresa guardamos los datos extra (sector, tamaño, etc.) que el
    // trigger no tiene porque no viajan en los metadatos de auth.
    // Lo hacemos con service_role a través de una edge function, o bien
    // dejamos que el usuario los complete en su perfil tras verificar el email.
    // Por ahora simplemente mostramos el estado de éxito.

    setLoading(false);
    setRegisteredEmail(email);
    setSuccess(true);
  };

  if (success) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-10 text-center">
            <div className="mb-5 flex justify-center">
              <svg className="w-16 h-16 text-brand" viewBox="0 0 640 640">
                <use href="/icons.svg#icon-party" />
              </svg>
            </div>
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
      {/* Fondo grid */}
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

      <div className="max-w-2xl mx-auto">
        <div className="text-center m-10">
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
              className={`relative p-4 rounded-2xl border text-left transition-all duration-200 overflow-hidden ${
                selectedRole === role.id
                  ? "border-brand bg-brand/10"
                  : "border-white/10 hover:border-white/20 bg-dark-800"
              }`}
            >
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

        {/* Aviso tutores */}
        <div className="mb-6 bg-brand/5 border border-brand/20 rounded-2xl p-4 flex gap-3">
          <span className="flex-shrink-0">
            <svg className="text-brand w-5 h-5">
              <use href="icons.svg#icon-tutor" />
            </svg>
          </span>
          <div>
            <p className="text-brand text-sm font-semibold">¿Eres tutor?</p>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              Los tutores se registran únicamente a través del{" "}
              <strong className="text-gray-400">enlace de invitación QR</strong>{" "}
              generado por su empresa o centro. Pide a tu responsable que lo
              genere desde su perfil.
            </p>
          </div>
        </div>

        {/* Formulario */}
        {selectedRole && (
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <span className="text-xl">
                <svg className="w-6 h-6">
                  <use
                    href={`icons.svg#${ROLES.find((r) => r.id === selectedRole)?.icon}`}
                  />
                </svg>
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
    </MainLayout>
  );
}
