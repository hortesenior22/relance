import { useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

// ── Helpers ──────────────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="text-[11px] text-red-400 mt-1">{msg}</p> : null;
}

function Spinner({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
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

function IconEdit({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconCheck({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Campo editable inline ────────────────────────────────────────────────────
interface InlineFieldProps {
  label: string;
  value: string;
  onSave: (val: string) => Promise<string | null>;
  type?: string;
  validate?: (val: string) => string | undefined;
  hint?: string;
}

function InlineField({
  label,
  value,
  onSave,
  type = "text",
  validate,
  hint,
}: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(value);
    setErr(undefined);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancel = () => {
    setEditing(false);
    setErr(undefined);
  };

  const save = async () => {
    const validationErr = validate?.(draft);
    if (validationErr) {
      setErr(validationErr);
      return;
    }
    if (draft.trim() === value.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const saveErr = await onSave(draft.trim());
    setSaving(false);
    if (saveErr) {
      setErr(saveErr);
    } else {
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  };

  return (
    <div className="group">
      <label
        className="block mb-1.5"
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-text-subtle)",
        }}
      >
        {label}
      </label>

      {editing ? (
        <div>
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              type={type}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setErr(undefined);
              }}
              onKeyDown={handleKeyDown}
              className={`input-field flex-1 ${err ? "border-red-500/50 focus:border-red-500" : ""}`}
              style={{ fontSize: "13px", padding: "7px 12px" }}
            />
            <button
              onClick={save}
              disabled={saving}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50"
              style={{ background: "var(--color-brand)", color: "#02050d" }}
            >
              {saving ? (
                <Spinner className="w-3 h-3" />
              ) : (
                <IconCheck className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={cancel}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{
                border: "1px solid var(--color-border-strong)",
                color: "var(--color-text-muted)",
              }}
            >
              <IconX className="w-3.5 h-3.5" />
            </button>
          </div>
          <FieldError msg={err} />
          {hint && (
            <p
              className="mt-1"
              style={{ fontSize: "11px", color: "var(--color-text-subtle)" }}
            >
              {hint}
            </p>
          )}
        </div>
      ) : (
        <div
          className="flex items-center justify-between gap-3 cursor-pointer transition-all duration-200"
          onClick={startEdit}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid var(--color-border-strong)",
            background: "var(--color-surface)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor =
              "rgba(192,255,114,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor =
              "var(--color-border-strong)";
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: value ? "var(--color-text)" : "var(--color-text-subtle)",
            }}
          >
            {value || <em>Sin definir</em>}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {saved && (
              <span
                className="flex items-center gap-1 animate-fade-in"
                style={{ fontSize: "11px", color: "var(--color-brand)" }}
              >
                <IconCheck className="w-3 h-3" /> Guardado
              </span>
            )}
            <span style={{ color: "var(--color-text-subtle)" }}>
              <IconEdit className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat mini card ────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border-strong)",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          color: "var(--color-text-subtle)",
          marginBottom: "2px",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "12px",
          color: "var(--color-text-secondary)",
          fontFamily: "monospace",
        }}
        className="truncate"
      >
        {value}
      </p>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AdminProfile() {
  const { user } = useAuth();

  const [nombre, setNombre] = useState<string>(
    user?.user_metadata?.full_name ?? "",
  );
  const [email] = useState<string>(user?.email ?? "");

  const saveNombre = async (val: string): Promise<string | null> => {
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: val },
    });
    if (authError) return authError.message;
    const { error: dbError } = await supabase
      .from("usuario")
      .update({ nombre: val })
      .eq("id", user?.id);
    if (dbError) return dbError.message;
    setNombre(val);
    return null;
  };

  const saveEmail = async (val: string): Promise<string | null> => {
    const { error } = await supabase.auth.updateUser({ email: val });
    if (error) return error.message;
    return null;
  };

  const memberSince = user?.created_at
    ? new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(user.created_at))
    : "—";

  const lastAccess = user?.last_sign_in_at
    ? new Intl.DateTimeFormat("es-ES", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(user.last_sign_in_at))
    : "—";

  const initial = nombre?.trim()?.[0]?.toUpperCase() ?? "A";

  return (
    <MainLayout>
      {/* Fondo grid sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: -99,
          opacity: 0.025,
          backgroundImage: `linear-gradient(var(--color-brand) 1px, transparent 1px), linear-gradient(90deg, var(--color-brand) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow ambiental */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "500px",
          height: "200px",
          borderRadius: "50%",
          opacity: 0.04,
          filter: "blur(80px)",
          background: "var(--color-brand)",
        }}
      />

      <div className="max-w-lg mx-auto py-8 px-4">
        {/* Cabecera de página */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1
              className="font-display font-extrabold"
              style={{
                fontSize: "18px",
                color: "var(--color-text)",
                letterSpacing: "-0.03em",
                marginBottom: "2px",
              }}
            >
              Mi perfil
            </h1>
            <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              Gestiona tus datos de administrador
            </p>
          </div>

          {/* Badge de rol */}
          <span
            className="flex items-center gap-1.5 rounded-full font-semibold"
            style={{
              fontSize: "11px",
              padding: "4px 10px",
              background: "rgba(192,255,114,0.08)",
              color: "var(--color-brand)",
              border: "1px solid rgba(192,255,114,0.2)",
            }}
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Administrador
          </span>
        </div>

        {/* Card principal */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--color-surface-strong)",
            border: "1px solid var(--color-border-strong)",
          }}
        >
          {/* Header con avatar */}
          <div
            className="flex items-center gap-4 px-5 py-4"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            {/* Avatar */}
            <div
              className="relative flex-shrink-0 flex items-center justify-center rounded-xl"
              style={{
                width: "52px",
                height: "52px",
                background: "rgba(192,255,114,0.06)",
                border: "1px solid rgba(192,255,114,0.2)",
              }}
            >
              <span
                className="font-display font-bold"
                style={{ fontSize: "22px", color: "var(--color-brand)" }}
              >
                {initial}
              </span>
              {/* Dot de estado */}
              <span
                className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center"
                style={{
                  width: "14px",
                  height: "14px",
                  background: "var(--color-brand)",
                }}
              >
                <svg
                  className="w-2 h-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#02050d"
                  strokeWidth="3"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p
                className="font-display font-bold truncate"
                style={{
                  fontSize: "15px",
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em",
                }}
              >
                {nombre || "Administrador"}
              </p>
              <p
                className="truncate"
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                  marginTop: "1px",
                }}
              >
                {email}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-subtle)",
                  marginTop: "2px",
                }}
              >
                Miembro desde {memberSince}
              </p>
            </div>
          </div>

          {/* Sección de campos */}
          <div className="px-5 py-4 space-y-4">
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-subtle)",
                marginBottom: "12px",
              }}
            >
              Datos personales
            </p>

            <InlineField
              label="Nombre completo"
              value={nombre}
              onSave={saveNombre}
              validate={(v) => {
                if (!v.trim()) return "El nombre no puede estar vacío.";
                if (v.trim().length < 2) return "Mínimo 2 caracteres.";
              }}
            />
            <InlineField
              label="Correo electrónico"
              value={email}
              type="email"
              onSave={saveEmail}
              validate={(v) => {
                if (!v.trim()) return "El correo no puede estar vacío.";
                if (!isValidEmail(v)) return "Introduce un correo válido.";
              }}
              hint="Se enviará un correo de confirmación a la nueva dirección."
            />
          </div>

          {/* Nota informativa */}
          <div className="px-5 pb-4">
            <div
              className="flex items-start gap-2.5 rounded-xl px-3 py-2.5"
              style={{
                background: "rgba(192,255,114,0.03)",
                border: "1px solid rgba(192,255,114,0.1)",
              }}
            >
              <svg
                className="flex-shrink-0 mt-0.5"
                style={{
                  width: "13px",
                  height: "13px",
                  color: "var(--color-text-subtle)",
                }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--color-text-subtle)",
                  lineHeight: "1.5",
                }}
              >
                Haz clic en cualquier campo para editarlo. Los cambios se
                guardan de inmediato. Para cambiar la contraseña usa{" "}
                <strong style={{ color: "var(--color-text-muted)" }}>
                  «¿Olvidaste tu contraseña?»
                </strong>{" "}
                en el inicio de sesión.
              </p>
            </div>
          </div>
        </div>

        {/* Metadatos — grid 2 cols */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <StatCard label="ID de usuario" value={user?.id ?? "—"} />
          <StatCard label="Último acceso" value={lastAccess} />
        </div>
      </div>
    </MainLayout>
  );
}
