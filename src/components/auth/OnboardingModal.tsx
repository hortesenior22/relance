import { useState, FormEvent, ChangeEvent } from "react";
import { supabase } from "../../lib/supabase";
import logoUrl from "../../assets/logo_relance.jpg";
import { User } from "@supabase/supabase-js";
import type { AccountType } from "./AccountType";

// ─── Roles disponibles en el selector inicial ────────────────────────────────
const ROLES: {
  id: AccountType;
  label: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: "estudiante",
    label: "Estudiante",
    desc: "Busco prácticas o mi primer empleo",
    icon: "icon-student",
  },
  {
    id: "empresa",
    label: "Empresa",
    desc: "Publico ofertas y encuentro talento",
    icon: "icon-company",
  },
  {
    id: "centro_educativo",
    label: "Centro educativo",
    desc: "Gestiono las prácticas de mis alumnos",
    icon: "icon-educativeCenter",
  },
];

// ─── Icono desde el sprite SVG ────────────────────────────────────────────────
function Icon({ id, className = "w-5 h-5" }: { id: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 640" aria-hidden="true">
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}

// ─── Spinner reutilizable ─────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Campo con label ──────────────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">
        {label}
        {required && <span className="text-brand ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Bloque de error ──────────────────────────────────────────────────────────
function ErrorBlock({ msg }: { msg: string }) {
  return (
    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg">
      {msg}
    </p>
  );
}

// ─── Botón de submit compartido ───────────────────────────────────────────────
function SubmitBtn({ loading, disabled }: { loading: boolean; disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="btn-primary w-full flex justify-center items-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? <><Spinner /> Guardando...</> : "Completar registro"}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMULARIO ESTUDIANTE
// ─────────────────────────────────────────────────────────────────────────────
interface EstudianteState {
  nombre: string;
  apellidos: string;
  telefono: string;
  ciudad: string;
}

function EstudianteForm({
  email,
  defaultName,
  onSubmit,
  loading,
  error,
}: {
  email: string;
  defaultName: string;
  onSubmit: (d: EstudianteState) => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<EstudianteState>({
    nombre: defaultName.split(" ")[0] ?? "",
    apellidos: defaultName.split(" ").slice(1).join(" ") ?? "",
    telefono: "",
    ciudad: "",
  });

  const set = (k: keyof EstudianteState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={(e: FormEvent) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nombre" required>
          <input type="text" value={form.nombre} onChange={set("nombre")} placeholder="Tu nombre" className="input-field" required />
        </Field>
        <Field label="Apellidos" required>
          <input type="text" value={form.apellidos} onChange={set("apellidos")} placeholder="Tus apellidos" className="input-field" required />
        </Field>
      </div>

      <Field label="Correo electrónico">
        <input type="email" value={email} disabled className="input-field opacity-50 cursor-not-allowed" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Teléfono">
          <input type="tel" value={form.telefono} onChange={set("telefono")} placeholder="+34 600 000 000" className="input-field" />
        </Field>
        <Field label="Ciudad">
          <input type="text" value={form.ciudad} onChange={set("ciudad")} placeholder="Madrid" className="input-field" />
        </Field>
      </div>

      {error && <ErrorBlock msg={error} />}
      <SubmitBtn loading={loading} disabled={!form.nombre.trim() || !form.apellidos.trim()} />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMULARIO EMPRESA
// ─────────────────────────────────────────────────────────────────────────────
interface EmpresaState {
  nombre: string;
  cif: string;
  sector: string;
  ciudad: string;
  web: string;
}

const SECTORES = ["Tecnología", "Marketing", "Diseño", "Finanzas", "Salud", "Educación", "Comercio", "Industria", "Otro"];

function EmpresaForm({
  email,
  onSubmit,
  loading,
  error,
}: {
  email: string;
  onSubmit: (d: EmpresaState) => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<EmpresaState>({ nombre: "", cif: "", sector: "", ciudad: "", web: "" });

  const set = (k: keyof EmpresaState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={(e: FormEvent) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <Field label="Nombre de la empresa" required>
        <input type="text" value={form.nombre} onChange={set("nombre")} placeholder="Mi Empresa S.L." className="input-field" required />
      </Field>

      <Field label="Correo electrónico de contacto">
        <input type="email" value={email} disabled className="input-field opacity-50 cursor-not-allowed" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="CIF" required>
          <input type="text" value={form.cif} onChange={set("cif")} placeholder="B12345678" className="input-field" required />
        </Field>
        <Field label="Sector">
          <select value={form.sector} onChange={set("sector")} className="input-field">
            <option value="">Seleccionar</option>
            {SECTORES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Ciudad">
          <input type="text" value={form.ciudad} onChange={set("ciudad")} placeholder="Madrid" className="input-field" />
        </Field>
        <Field label="Sitio web">
          <input type="url" value={form.web} onChange={set("web")} placeholder="https://miempresa.com" className="input-field" />
        </Field>
      </div>

      <div className="bg-brand/5 border border-brand/15 rounded-xl px-4 py-3">
        <p className="text-xs text-gray-500">
          El CIF será verificado por el equipo de Relance en un plazo de 24–48 h antes de activar la cuenta plenamente.
        </p>
      </div>

      {error && <ErrorBlock msg={error} />}
      <SubmitBtn loading={loading} disabled={!form.nombre.trim() || !form.cif.trim()} />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMULARIO CENTRO EDUCATIVO
// ─────────────────────────────────────────────────────────────────────────────
interface CentroState {
  nombre: string;
  codigo_centro: string;
  tipo: string;
  ciudad: string;
}

const TIPOS_CENTRO = [
  "IES — Instituto de Educación Secundaria",
  "FP — Formación Profesional",
  "Universidad",
  "Centro privado",
  "Academia",
  "Otro",
];

function CentroForm({
  email,
  onSubmit,
  loading,
  error,
}: {
  email: string;
  onSubmit: (d: CentroState) => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<CentroState>({ nombre: "", codigo_centro: "", tipo: "", ciudad: "" });

  const set = (k: keyof CentroState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={(e: FormEvent) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <Field label="Nombre del centro" required>
        <input type="text" value={form.nombre} onChange={set("nombre")} placeholder="IES Nombre del Centro" className="input-field" required />
      </Field>

      <Field label="Correo electrónico institucional">
        <input type="email" value={email} disabled className="input-field opacity-50 cursor-not-allowed" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Código de centro" required>
          <input type="text" value={form.codigo_centro} onChange={set("codigo_centro")} placeholder="IES-MAD-2024" className="input-field" required />
        </Field>
        <Field label="Tipo de centro">
          <select value={form.tipo} onChange={set("tipo")} className="input-field">
            <option value="">Seleccionar</option>
            {TIPOS_CENTRO.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Ciudad">
        <input type="text" value={form.ciudad} onChange={set("ciudad")} placeholder="Madrid" className="input-field" />
      </Field>

      <div className="bg-brand/5 border border-brand/15 rounded-xl px-4 py-3">
        <p className="text-xs text-gray-500">
          El código de centro será verificado por el equipo de Relance antes de activar la cuenta plenamente.
        </p>
      </div>

      {error && <ErrorBlock msg={error} />}
      <SubmitBtn loading={loading} disabled={!form.nombre.trim() || !form.codigo_centro.trim()} />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL PRINCIPAL — dos pasos
// ─────────────────────────────────────────────────────────────────────────────
export default function OnboardingModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<AccountType | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultName = user.user_metadata?.full_name || user.user_metadata?.name || "";
  const email = user.email ?? "";

  // ─── Guardo los datos en Supabase ────────────────────────────────────────
  const saveToSupabase = async (roleData: Record<string, unknown>) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Tabla central usuario — uso upsert con onConflict en la columna id
      //    para que si ya existe la fila (caso raro de reintento) la actualice
      const { error: usuarioError } = await supabase
        .from("usuario")
        .upsert(
          {
            id: user.id,
            email,
            nombre: roleData.nombre ?? defaultName,
            rol: role,
            is_profile_completed: true,
          },
          { onConflict: "id" }
        );

      if (usuarioError) throw usuarioError;

      // 2. Tabla de extensión por rol
      if (role === "estudiante") {
        const { error: e } = await supabase.from("estudiante").upsert(
          {
            id: user.id,
            nombre: roleData.nombre,
            apellidos: roleData.apellidos,
            telefono: roleData.telefono || null,
            ciudad: roleData.ciudad || null,
          },
          { onConflict: "id" }
        );
        if (e) throw e;
      }

      if (role === "empresa") {
        const { error: e } = await supabase.from("empresa").upsert(
          {
            id_usuario: user.id,
            nombre: roleData.nombre,
            cif: roleData.cif,
            sector: roleData.sector || null,
            ciudad: roleData.ciudad || null,
            web: roleData.web || null,
          },
          { onConflict: "id_usuario" }
        );
        if (e) throw e;
      }

      if (role === "centro_educativo") {
        const { error: e } = await supabase.from("centro_educativo").upsert(
          {
            id_centro: user.id,
            nombre: roleData.nombre,
            codigo_centro: roleData.codigo_centro,
            tipo: roleData.tipo || null,
            ciudad: roleData.ciudad || null,
          },
          { onConflict: "id_centro" }
        );
        if (e) throw e;
      }

      // 3. Persisto el rol en user_metadata para no tener que consultar la BD
      //    en cada recarga de página
      await supabase.auth.updateUser({
        data: { role, full_name: roleData.nombre },
      });

      onClose();
    } catch (err: unknown) {
      const supaErr = err as { message?: string; details?: string; hint?: string };
      const msg = supaErr?.message ?? (typeof err === "string" ? err : "Error desconocido");
      const detail = supaErr?.details || supaErr?.hint || "";
      console.error("OnboardingModal saveToSupabase:", err);
      setError(`${msg}${detail ? ` — ${detail}` : ""}`);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-lg mx-4 animate-slide-down">

      {/* Cabecera */}
      <div className="px-8 pt-8 pb-6 border-b border-white/10">
        <div className="flex justify-center mb-5">
          <img src={logoUrl} alt="Relance" className="h-8 rounded-md" />
        </div>

        <h2 className="font-display text-2xl font-bold text-white text-center mb-1">
          {step === 1
            ? "Bienvenido a Relance"
            : `Registro como ${ROLES.find((r) => r.id === role)?.label}`}
        </h2>
        <p className="text-gray-500 text-sm text-center">
          {step === 1
            ? "Selecciona el tipo de cuenta para configurar tu perfil"
            : "Completa los datos básicos para empezar"}
        </p>

        {/* Indicador de paso */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {[1, 2].map((n) => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                n === step ? "w-8 bg-brand" : n < step ? "w-4 bg-brand/40" : "w-4 bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">

        {/* ── Paso 1: selector de rol ── */}
        {step === 1 && (
          <div className="space-y-3">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                  role === r.id
                    ? "border-brand bg-brand/8 text-white"
                    : "border-white/10 hover:border-white/20 text-gray-400 hover:text-gray-300"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    role === r.id ? "bg-brand/15 text-brand" : "bg-white/5 text-gray-500"
                  }`}
                >
                  <Icon id={r.icon} className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold font-display ${role === r.id ? "text-white" : "text-gray-300"}`}>
                    {r.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                </div>

                {role === r.id && (
                  <svg className="w-4 h-4 text-brand flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}

            {/* Aviso para tutores */}
            <div className="flex items-start gap-3 p-4 bg-white/3 border border-white/8 rounded-xl">
              <Icon id="icon-info" className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">
                Los tutores se registran mediante el enlace de invitación generado por su empresa o centro educativo.
              </p>
            </div>

            <button
              onClick={() => role && setStep(2)}
              disabled={!role}
              className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        )}

        {/* ── Paso 2: formulario por rol ── */}
        {step === 2 && role === "estudiante" && (
          <EstudianteForm email={email} defaultName={defaultName} onSubmit={saveToSupabase} loading={loading} error={error} />
        )}
        {step === 2 && role === "empresa" && (
          <EmpresaForm email={email} onSubmit={saveToSupabase} loading={loading} error={error} />
        )}
        {step === 2 && role === "centro_educativo" && (
          <CentroForm email={email} onSubmit={saveToSupabase} loading={loading} error={error} />
        )}
      </div>

      {/* Botón de volver — solo en paso 2 */}
      {step === 2 && (
        <div className="px-8 pb-6">
          <button
            type="button"
            onClick={() => { setStep(1); setError(null); }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors mx-auto"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Volver a elegir tipo de cuenta
          </button>
        </div>
      )}
    </div>
  );
}
