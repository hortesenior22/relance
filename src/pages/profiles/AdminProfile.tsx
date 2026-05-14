import { useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
// import InviteModal from "../components/InviteModal";

// ── Helpers ──────────────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="text-xs text-red-400 mt-1">{msg}</p> : null;
}

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
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

// ── Icono de edición ─────────────────────────────────────────────────────────
function IconEdit({ className = "w-4 h-4" }: { className?: string }) {
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

function IconCheck({ className = "w-4 h-4" }: { className?: string }) {
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

function IconX({ className = "w-4 h-4" }: { className?: string }) {
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
  onSave: (val: string) => Promise<string | null>; // retorna error o null
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
      <label className="block text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
        {label}
      </label>

      {editing ? (
        <div>
          <div className="flex items-center gap-2">
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
            />
            <button
              onClick={save}
              disabled={saving}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-brand text-dark hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Spinner className="w-3.5 h-3.5 text-dark" />
              ) : (
                <IconCheck className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={cancel}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
          <FieldError msg={err} />
          {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
        </div>
      ) : (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/8 bg-dark-800 cursor-pointer hover:border-white/15 transition-all duration-200"
          onClick={startEdit}
        >
          <span className="text-sm text-white">
            {value || <span className="text-gray-600 italic">Sin definir</span>}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            {saved && (
              <span className="flex items-center gap-1 text-xs text-brand animate-fade-in">
                <IconCheck className="w-3 h-3" />
                Guardado
              </span>
            )}
            <span className="text-gray-600 group-hover:text-gray-400 transition-colors">
              <IconEdit className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Avatar con inicial ───────────────────────────────────────────────────────
function AdminAvatar({ name }: { name: string }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "A";
  return (
    <div className="relative w-20 h-20 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center flex-shrink-0">
      <span className="font-display text-3xl font-bold text-brand">
        {initial}
      </span>
      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand flex items-center justify-center">
        <svg
          className="w-3 h-3 text-dark"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
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

  // ── Guardar nombre ───────────────────────────────────────────────────────
  const saveNombre = async (val: string): Promise<string | null> => {
    // 1. Actualizar metadatos en Auth
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: val },
    });
    if (authError) return authError.message;

    // 2. Actualizar en tabla usuario
    const { error: dbError } = await supabase
      .from("usuario")
      .update({ nombre: val })
      .eq("id", user?.id);
    if (dbError) return dbError.message;

    setNombre(val);
    return null;
  };

  // ── Guardar email ────────────────────────────────────────────────────────
  const saveEmail = async (val: string): Promise<string | null> => {
    // Supabase envía un correo de confirmación al nuevo email
    const { error } = await supabase.auth.updateUser({ email: val });
    if (error) return error.message;
    return null;
  };

  const memberSince = user?.created_at
    ? new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(user.created_at))
    : "—";

  return (
    <MainLayout>
      {/* Fondo grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          zIndex: -99,
          backgroundImage: `linear-gradient(rgba(192,255,114,1) 1px, transparent 1px), linear-gradient(90deg, rgba(192,255,114,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.05] blur-[100px] pointer-events-none"
        style={{ background: "#c0ff72" }}
      />

      <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Cabecera */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-extrabold text-white mb-1">
            Mi perfil
          </h1>
          <p className="text-gray-500 text-sm">
            Gestiona tus datos personales de administrador
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden">
          {/* Header de la card */}
          <div className="px-6 pt-6 pb-5 border-b border-white/8 flex items-center gap-5">
            <AdminAvatar name={nombre} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-bold text-white text-lg truncate">
                  {nombre || "Administrador"}
                </h2>
                <span className="flex-shrink-0 text-xs bg-brand/20 text-brand px-2 py-0.5 rounded-full font-medium">
                  Admin
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{email}</p>
              <p className="text-xs text-gray-600 mt-1">
                Miembro desde {memberSince}
              </p>
            </div>
          </div>

          {/* Sección datos personales */}
          <div className="px-6 py-6 space-y-5">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">
                Datos personales
              </p>
              <div className="space-y-4">
                <InlineField
                  label="Nombre completo"
                  value={nombre}
                  onSave={saveNombre}
                  validate={(v) => {
                    if (!v.trim()) return "El nombre no puede estar vacío.";
                    if (v.trim().length < 2)
                      return "El nombre debe tener al menos 2 caracteres.";
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
            </div>
          </div>

          {/* Footer informativo */}
          <div className="px-6 pb-6">
            <div className="bg-brand/5 border border-brand/15 rounded-xl px-4 py-3 flex items-start gap-3">
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs text-gray-500 leading-relaxed">
                Haz clic en cualquier campo para editarlo. Los cambios se
                guardan inmediatamente. Para cambiar la contraseña usa la opción
                de{" "}
                <strong className="text-gray-400">
                  «¿Olvidaste tu contraseña?»
                </strong>{" "}
                en la pantalla de inicio de sesión.
              </p>
            </div>
          </div>
        </div>

        {/* Metadatos de sesión */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-dark-800 border border-white/8 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-600 mb-1">ID de usuario</p>
            <p className="text-xs text-gray-400 font-mono truncate">
              {user?.id ?? "—"}
            </p>
          </div>
          <div className="bg-dark-800 border border-white/8 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-600 mb-1">Último acceso</p>
            <p className="text-xs text-gray-400">
              {user?.last_sign_in_at
                ? new Intl.DateTimeFormat("es-ES", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(user.last_sign_in_at))
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
