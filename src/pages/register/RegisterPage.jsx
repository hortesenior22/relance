import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";

// ── Constantes ───────────────────────────────────────────────────────────────
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

// ── Validaciones ─────────────────────────────────────────────────────────────
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

// ── Atoms ────────────────────────────────────────────────────────────────────
function FieldError({ msg }) {
  return msg ? (
    <p style={{ fontSize: 11.5, color: "var(--color-error)", marginTop: 4 }}>
      {msg}
    </p>
  ) : null;
}

const inputStyle = (hasError = false) => ({
  width: "100%",
  background: "var(--color-surface)",
  border: `1px solid ${hasError ? "rgba(248,113,113,0.5)" : "var(--color-border-strong)"}`,
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  color: "var(--color-text)",
  fontFamily: "inherit",
  letterSpacing: "-0.01em",
  outline: "none",
  transition: "all 0.18s",
  boxSizing: "border-box",
});

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "var(--color-text-muted)",
  marginBottom: 6,
  fontWeight: 500,
};

function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  hasError = false,
  style: extra = {},
  min,
  max,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle(hasError),
        borderColor: focused
          ? "rgba(192,255,114,0.45)"
          : hasError
            ? "rgba(248,113,113,0.5)"
            : "var(--color-border-strong)",
        boxShadow: focused ? "0 0 0 3px rgba(192,255,114,0.12)" : "none",
        ...extra,
      }}
    />
  );
}

function Textarea({ value, onChange, rows = 3, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle(),
        resize: "none",
        lineHeight: 1.6,
        borderColor: focused
          ? "rgba(192,255,114,0.45)"
          : "var(--color-border-strong)",
        boxShadow: focused ? "0 0 0 3px rgba(192,255,114,0.12)" : "none",
      }}
    />
  );
}

function Select({ value, onChange, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle(),
        borderColor: focused
          ? "rgba(192,255,114,0.45)"
          : "var(--color-border-strong)",
        boxShadow: focused ? "0 0 0 3px rgba(192,255,114,0.12)" : "none",
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a9ab8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 36,
      }}
    >
      {children}
    </select>
  );
}

function PasswordField({
  value,
  onChange,
  placeholder = "Mínimo 8 caracteres",
  showStrength = true,
  hasError = false,
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const score = !value
    ? 0
    : value.length < 6
      ? 1
      : value.length < 8
        ? 2
        : /[A-Z]/.test(value) && /[0-9]/.test(value)
          ? 4
          : 3;
  const colors = ["", "#f87171", "#fb923c", "#facc15", "#c0ff72"];
  const labels = ["", "Muy débil", "Débil", "Media", "Fuerte"];

  return (
    <div>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle(hasError),
            paddingRight: 44,
            borderColor: focused
              ? "rgba(192,255,114,0.45)"
              : hasError
                ? "rgba(248,113,113,0.5)"
                : "var(--color-border-strong)",
            boxShadow: focused ? "0 0 0 3px rgba(192,255,114,0.12)" : "none",
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            padding: 4,
            display: "flex",
          }}
        >
          {show ? (
            <svg
              width="16"
              height="16"
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
              width="16"
              height="16"
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
        <div
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {[1, 2, 3, 4].map((lvl) => (
            <div
              key={lvl}
              style={{
                height: 3,
                flex: 1,
                borderRadius: 3,
                background:
                  score >= lvl ? colors[score] : "rgba(255,255,255,0.06)",
                transition: "background 0.3s",
              }}
            />
          ))}
          <span
            style={{
              fontSize: 10.5,
              color: "var(--color-text-muted)",
              width: 60,
              textAlign: "right",
              fontFamily: "monospace",
            }}
          >
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
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        padding: "12px 24px",
        background: loading ? "rgba(192,255,114,0.5)" : "var(--color-brand)",
        color: "#010a00",
        border: "none",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        fontFamily: "inherit",
        cursor: loading ? "not-allowed" : "pointer",
        letterSpacing: "-0.02em",
        transition: "all 0.16s",
      }}
    >
      {loading ? (
        <>
          <svg
            style={{
              width: 16,
              height: 16,
              animation: "spin 0.8s linear infinite",
            }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              style={{ opacity: 0.25 }}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              style={{ opacity: 0.75 }}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Creando cuenta...
        </>
      ) : (
        label
      )}
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <p
      style={{
        fontSize: 10,
        color: "var(--color-text-muted)",
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        fontWeight: 700,
        fontFamily: "monospace",
      }}
    >
      {children}
    </p>
  );
}

function InfoNote({ children }) {
  return (
    <div
      style={{
        marginTop: 12,
        background: "rgba(192,255,114,0.04)",
        border: "1px solid rgba(192,255,114,0.12)",
        borderRadius: 10,
        padding: "10px 14px",
      }}
    >
      <p
        style={{
          fontSize: 11.5,
          color: "var(--color-text-muted)",
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          lineHeight: 1.6,
        }}
      >
        <svg
          width="14"
          height="14"
          style={{ flexShrink: 0, marginTop: 2, color: "var(--color-brand)" }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        {children}
      </p>
    </div>
  );
}

function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div
      style={{
        background: "var(--color-error-bg)",
        border: "1px solid rgba(248,113,113,0.25)",
        borderRadius: 10,
        padding: "12px 14px",
        color: "var(--color-error)",
        fontSize: 13,
      }}
    >
      {msg}
    </div>
  );
}

// ── Grid helpers ─────────────────────────────────────────────────────────────
const formGrid = { display: "grid", gap: 12 };
const twoCol = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const fullSpan = { gridColumn: "1 / -1" };

// ── STUDENT FORM ─────────────────────────────────────────────────────────────
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) onSubmit({ ...form, role: "estudiante" });
      }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
      noValidate
    >
      <div style={formGrid}>
        <div>
          <label style={labelStyle}>Nombre completo *</label>
          <Input
            value={form.fullName}
            onChange={s("fullName")}
            placeholder="Tu nombre y apellidos"
            hasError={!!errs.fullName}
          />
          <FieldError msg={errs.fullName} />
        </div>
        <div>
          <label style={labelStyle}>Correo electrónico *</label>
          <Input
            type="email"
            value={form.email}
            onChange={s("email")}
            placeholder="tu@correo.com"
            hasError={!!errs.email}
          />
          <FieldError msg={errs.email} />
        </div>
        <div style={twoCol}>
          <div>
            <label style={labelStyle}>Contraseña *</label>
            <PasswordField
              value={form.password}
              onChange={s("password")}
              hasError={!!errs.password}
            />
            <FieldError msg={errs.password} />
          </div>
          <div>
            <label style={labelStyle}>Confirmar contraseña *</label>
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
      </div>

      <div
        style={{ paddingTop: 14, borderTop: "1px solid var(--color-border)" }}
      >
        <SectionLabel>Información académica (opcional)</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>Centro educativo</label>
            <Input
              value={form.centerName}
              onChange={s("centerName")}
              placeholder="Ej: IES Trassierra"
            />
          </div>
          <div style={twoCol}>
            <div>
              <label style={labelStyle}>Titulación / Ciclo</label>
              <Input
                value={form.degree}
                onChange={s("degree")}
                placeholder="Ej: DAM"
              />
            </div>
            <div>
              <label style={labelStyle}>Año de finalización</label>
              <Input
                type="number"
                value={form.graduationYear}
                onChange={s("graduationYear")}
                placeholder="2025"
                min="2020"
                max="2035"
                hasError={!!errs.graduationYear}
              />
              <FieldError msg={errs.graduationYear} />
            </div>
          </div>
        </div>
      </div>

      <ErrorBox msg={error} />
      <SubmitButton loading={loading} label="Crear cuenta de estudiante" />
    </form>
  );
}

// ── COMPANY FORM ─────────────────────────────────────────────────────────────
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) onSubmit({ ...form, role: "empresa" });
      }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
      noValidate
    >
      <div style={formGrid}>
        <div>
          <label style={labelStyle}>Tu nombre completo (representante) *</label>
          <Input
            value={form.fullName}
            onChange={s("fullName")}
            placeholder="Nombre del representante"
            hasError={!!errs.fullName}
          />
          <FieldError msg={errs.fullName} />
        </div>
        <div>
          <label style={labelStyle}>Correo electrónico corporativo *</label>
          <Input
            type="email"
            value={form.email}
            onChange={s("email")}
            placeholder="contacto@empresa.com"
            hasError={!!errs.email}
          />
          <FieldError msg={errs.email} />
        </div>
        <div style={twoCol}>
          <div>
            <label style={labelStyle}>Contraseña *</label>
            <PasswordField
              value={form.password}
              onChange={s("password")}
              hasError={!!errs.password}
            />
            <FieldError msg={errs.password} />
          </div>
          <div>
            <label style={labelStyle}>Confirmar contraseña *</label>
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
      </div>

      <div
        style={{ paddingTop: 14, borderTop: "1px solid var(--color-border)" }}
      >
        <SectionLabel>Datos de la empresa</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>Nombre de la empresa *</label>
            <Input
              value={form.companyName}
              onChange={s("companyName")}
              placeholder="Mi Empresa S.L."
              hasError={!!errs.companyName}
            />
            <FieldError msg={errs.companyName} />
          </div>
          <div style={twoCol}>
            <div>
              <label style={labelStyle}>CIF *</label>
              <Input
                value={form.cif}
                onChange={s("cif")}
                placeholder="B12345678"
                hasError={!!errs.cif}
              />
              <FieldError msg={errs.cif} />
            </div>
            <div>
              <label style={labelStyle}>Sector</label>
              <Select value={form.sector} onChange={s("sector")}>
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
              </Select>
            </div>
          </div>
          <div style={twoCol}>
            <div>
              <label style={labelStyle}>Tamaño de empresa</label>
              <Select value={form.tamanio} onChange={s("tamanio")}>
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
              </Select>
            </div>
            <div>
              <label style={labelStyle}>Ciudad</label>
              <Input
                value={form.ciudad}
                onChange={s("ciudad")}
                placeholder="Madrid"
              />
            </div>
          </div>
          <div style={twoCol}>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <Input
                type="tel"
                value={form.telefono}
                onChange={s("telefono")}
                placeholder="+34 900 000 000"
                hasError={!!errs.telefono}
              />
              <FieldError msg={errs.telefono} />
            </div>
            <div>
              <label style={labelStyle}>Sitio web</label>
              <Input
                type="url"
                value={form.web}
                onChange={s("web")}
                placeholder="https://miempresa.com"
                hasError={!!errs.web}
              />
              <FieldError msg={errs.web} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Descripción de la empresa</label>
            <Textarea
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  descripcion: e.target.value.slice(0, 500),
                }))
              }
              placeholder="Describe tu empresa, cultura y qué tipo de perfiles buscáis..."
            />
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginTop: 4,
                textAlign: "right",
              }}
            >
              {form.descripcion.length}/500
            </p>
          </div>
          <InfoNote>
            El CIF será verificado por el equipo de Relance en un plazo de 24–48
            h antes de activar la cuenta plenamente.
          </InfoNote>
        </div>
      </div>

      <ErrorBox msg={error} />
      <SubmitButton loading={loading} label="Crear cuenta de empresa" />
    </form>
  );
}

// ── CENTER FORM ───────────────────────────────────────────────────────────────
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) onSubmit({ ...form, role: "centro_educativo" });
      }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
      noValidate
    >
      <div style={formGrid}>
        <div>
          <label style={labelStyle}>Tu nombre completo (responsable) *</label>
          <Input
            value={form.fullName}
            onChange={s("fullName")}
            placeholder="Nombre del responsable"
            hasError={!!errs.fullName}
          />
          <FieldError msg={errs.fullName} />
        </div>
        <div>
          <label style={labelStyle}>Correo electrónico institucional *</label>
          <Input
            type="email"
            value={form.email}
            onChange={s("email")}
            placeholder="responsable@centro.edu.es"
            hasError={!!errs.email}
          />
          <FieldError msg={errs.email} />
        </div>
        <div style={twoCol}>
          <div>
            <label style={labelStyle}>Contraseña *</label>
            <PasswordField
              value={form.password}
              onChange={s("password")}
              hasError={!!errs.password}
            />
            <FieldError msg={errs.password} />
          </div>
          <div>
            <label style={labelStyle}>Confirmar contraseña *</label>
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
      </div>

      <div
        style={{ paddingTop: 14, borderTop: "1px solid var(--color-border)" }}
      >
        <SectionLabel>Datos del centro</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>Nombre del centro *</label>
            <Input
              value={form.centerName}
              onChange={s("centerName")}
              placeholder="IES Nombre del Centro"
              hasError={!!errs.centerName}
            />
            <FieldError msg={errs.centerName} />
          </div>
          <div style={twoCol}>
            <div>
              <label style={labelStyle}>Código institucional *</label>
              <Input
                value={form.institutionalCode}
                onChange={s("institutionalCode")}
                placeholder="Ej: IES-COR-2026"
                hasError={!!errs.institutionalCode}
              />
              <FieldError msg={errs.institutionalCode} />
            </div>
            <div>
              <label style={labelStyle}>Tipo de centro</label>
              <Select value={form.centerType} onChange={s("centerType")}>
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
              </Select>
            </div>
          </div>
          <div style={twoCol}>
            <div>
              <label style={labelStyle}>Ciudad *</label>
              <Input
                value={form.city}
                onChange={s("city")}
                placeholder="Córdoba"
                hasError={!!errs.city}
              />
              <FieldError msg={errs.city} />
            </div>
            <div>
              <label style={labelStyle}>Provincia</label>
              <Input
                value={form.province}
                onChange={s("province")}
                placeholder="Córdoba"
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Sitio web del centro</label>
            <Input
              type="url"
              value={form.website}
              onChange={s("website")}
              placeholder="https://iesejemplo.edu.es"
              hasError={!!errs.website}
            />
            <FieldError msg={errs.website} />
          </div>
          <InfoNote>
            El código institucional será verificado por el equipo de Relance
            antes de activar la cuenta.
          </InfoNote>
        </div>
      </div>

      <ErrorBox msg={error} />
      <SubmitButton
        loading={loading}
        label="Crear cuenta de centro educativo"
      />
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
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
    setLoading(false);
    setRegisteredEmail(email);
    setSuccess(true);
  };

  // ── Success screen ──
  if (success) {
    return (
      <MainLayout>
        <div
          style={{
            minHeight: "100vh",
            background: "var(--color-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "var(--color-surface-strong)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: 18,
              width: "100%",
              maxWidth: 440,
              padding: "48px 36px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                marginBottom: 20,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "rgba(192,255,114,0.08)",
                  border: "1px solid rgba(192,255,114,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg className="w-16 h-16 text-brand" viewBox="0 0 640 640">
                  <use href="/icons.svg#icon-party" />
                </svg>
              </div>
            </div>
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: 22,
                fontWeight: 800,
                color: "var(--color-text)",
                marginBottom: 10,
                letterSpacing: "-0.04em",
              }}
            >
              ¡Cuenta creada!
            </h2>
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: 13,
                marginBottom: 6,
              }}
            >
              Hemos enviado un correo de verificación a:
            </p>
            <p
              style={{
                color: "var(--color-brand)",
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 20,
              }}
            >
              {registeredEmail}
            </p>
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: 12,
                marginBottom: 28,
                lineHeight: 1.7,
              }}
            >
              Revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en
              el enlace para activar tu cuenta.
              {(selectedRole === "empresa" ||
                selectedRole === "centro_educativo") && (
                <span style={{ display: "block", marginTop: 8 }}>
                  El equipo de Relance verificará tus datos en 24–48 h.
                </span>
              )}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => navigate("/")}
                style={{
                  width: "100%",
                  padding: "11px 20px",
                  background: "var(--color-brand)",
                  color: "#010a00",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                Ir al inicio
              </button>
              <button
                onClick={() => navigate("/login")}
                style={{
                  width: "100%",
                  padding: "11px 20px",
                  background: "transparent",
                  color: "var(--color-brand)",
                  border: "1px solid rgba(192,255,114,0.25)",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Register screen ──
  return (
    <MainLayout>
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -99,
          opacity: 0.03,
          backgroundImage:
            "linear-gradient(rgba(192,255,114,1) 1px, transparent 1px), linear-gradient(90deg, rgba(192,255,114,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 600,
          height: 400,
          borderRadius: "50%",
          opacity: 0.05,
          filter: "blur(100px)",
          background: "var(--color-brand)",
          pointerEvents: "none",
          zIndex: -98,
        }}
      />

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px 60px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", padding: "40px 0 28px" }}>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: "var(--color-text)",
              marginBottom: 8,
              letterSpacing: "-0.04em",
            }}
          >
            Crea tu cuenta
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            Elige tu tipo de cuenta para empezar
          </p>
        </div>

        {/* Role selector */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {ROLES.map((role) => {
            const active = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  setError(null);
                }}
                style={{
                  position: "relative",
                  padding: "16px 12px",
                  borderRadius: 12,
                  border: `1px solid ${active ? "rgba(192,255,114,0.35)" : "var(--color-border-strong)"}`,
                  background: active
                    ? "rgba(192,255,114,0.06)"
                    : "var(--color-surface-strong)",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  outline: "none",
                }}
              >
                {active && (
                  <div style={{ position: "absolute", top: 10, right: 10 }}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#c0ff72"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
                <span style={{ display: "block", marginBottom: 8 }}>
                  <svg
                    style={{
                      width: 18,
                      height: 18,
                      color: active
                        ? "var(--color-brand)"
                        : "var(--color-text-muted)",
                    }}
                  >
                    <use href={`/icons.svg#${role.icon}`} />
                  </svg>
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: active
                      ? "var(--color-text)"
                      : "var(--color-text-secondary)",
                    marginBottom: 2,
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  {role.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.4,
                  }}
                >
                  {role.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tutor notice */}
        <div
          style={{
            marginBottom: 16,
            background: "rgba(192,255,114,0.04)",
            border: "1px solid rgba(192,255,114,0.15)",
            borderRadius: 12,
            padding: "14px 16px",
            display: "flex",
            gap: 12,
          }}
        >
          <span style={{ flexShrink: 0, color: "var(--color-brand)" }}>
            <svg style={{ width: 18, height: 18 }}>
              <use href="/icons.svg#icon-tutor" />
            </svg>
          </span>
          <div>
            <p
              style={{
                color: "var(--color-brand)",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              ¿Eres tutor?
            </p>
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              Los tutores se registran únicamente a través del{" "}
              <strong style={{ color: "var(--color-text-secondary)" }}>
                enlace de invitación QR
              </strong>{" "}
              generado por su empresa o centro.
            </p>
          </div>
        </div>

        {/* Form card */}
        {selectedRole && (
          <div
            style={{
              background: "var(--color-surface-strong)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: 14,
              padding: "22px 24px",
            }}
          >
            {/* Form header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
                paddingBottom: 14,
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>
                <svg style={{ width: 18, height: 18 }}>
                  <use
                    href={`/icons.svg#${ROLES.find((r) => r.id === selectedRole)?.icon}`}
                  />
                </svg>
              </span>
              <h2
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  color: "var(--color-text)",
                  fontSize: 16,
                  letterSpacing: "-0.03em",
                }}
              >
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

        {/* Empty state */}
        {!selectedRole && (
          <div
            style={{
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: 13,
              padding: "28px 0",
            }}
          >
            Selecciona un tipo de cuenta para continuar
          </div>
        )}

        {/* Login link */}
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "var(--color-text-muted)",
            marginTop: 20,
          }}
        >
          ¿Ya tienes cuenta?{" "}
          <a
            onClick={() => navigate("/", { state: { openLogin: true } })}
            style={{
              color: "var(--color-brand)",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Inicia sesión
          </a>
        </p>
      </div>
    </MainLayout>
  );
}
