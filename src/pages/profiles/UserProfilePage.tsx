/**
 * UserProfilePage.tsx
 *
 * Componente reutilizable de perfil de usuario con RBAC completo.
 *
 * Uso:
 *   <UserProfilePage entityType="estudiante" entityId="uuid-aquí" />
 *
 * El componente detecta el rol del viewer desde useAuth() y muestra
 * las acciones correspondientes.
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewerRole =
  | "administrador"
  | "estudiante"
  | "empresa"
  | "centro_educativo"
  | "tutor_centro"
  | "tutor_empresa";

type EntityType = "empresa" | "centro_educativo" | "estudiante" | "oferta";

interface Estudiante {
  id: string;
  nombre: string;
  apellidos: string;
  email?: string;
  titulacion?: string;
  ciudad?: string;
  telefono?: string;
  sobre_mi?: string;
  disponibilidad?: string;
  tipo_busqueda?: string;
  modalidad?: string;
  habilidades?: string[];
  avatar_url?: string;
  perfil_publico?: boolean;
  github_username?: string;
  formaciones?: unknown[];
  proyectos?: unknown[];
  redes_sociales?: Record<string, string>;
  created_at?: string;
}

interface Empresa {
  id: string;
  nombre: string;
  sector?: string;
  ciudad?: string;
  descripcion?: string;
  email_contacto?: string;
  telefono?: string;
  web?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  logo_url?: string;
  verificado?: boolean;
  tamano?: string;
  cif?: string;
}

interface CentroEducativo {
  id: string;
  nombre: string;
  tipo_centro?: string;
  ciudad?: string;
  provincia?: string;
  descripcion?: string;
  email_contacto?: string;
  telefono?: string;
  sitio_web?: string;
  avatar_url?: string;
  verificado?: boolean;
  num_alumnos?: number;
  titulaciones?: string[];
}

type ProfileData = Estudiante | Empresa | CentroEducativo;

interface ActionState {
  loading: boolean;
  success: string | null;
  error: string | null;
}

interface UserProfilePageProps {
  entityType: EntityType;
  entityId: string;
  onBack?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ENTITY_LABELS: Record<EntityType, string> = {
  empresa: "Empresa",
  centro_educativo: "Centro Educativo",
  estudiante: "Estudiante",
  oferta: "Oferta",
};

const ENTITY_COLOR: Record<
  EntityType,
  { bg: string; text: string; border: string }
> = {
  empresa: {
    bg: "rgba(192,255,114,0.08)",
    text: "#c0ff72",
    border: "rgba(192,255,114,0.18)",
  },
  centro_educativo: {
    bg: "rgba(99,179,237,0.08)",
    text: "#63b3ed",
    border: "rgba(99,179,237,0.18)",
  },
  estudiante: {
    bg: "rgba(246,173,85,0.08)",
    text: "#f6ad55",
    border: "rgba(246,173,85,0.18)",
  },
  oferta: {
    bg: "rgba(159,122,234,0.08)",
    text: "#9f7aea",
    border: "rgba(159,122,234,0.18)",
  },
};

function Avatar({
  url,
  name,
  size = 80,
}: {
  url?: string;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: size / 4,
          objectFit: "cover",
          border: "2px solid var(--color-border-strong)",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 4,
        background: "rgba(192,255,114,0.10)",
        border: "2px solid rgba(192,255,114,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.3,
        fontWeight: 700,
        color: "#c0ff72",
        fontFamily: "Syne, sans-serif",
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

function Badge({
  label,
  color,
}: {
  label: string;
  color?: { bg: string; text: string; border: string };
}) {
  const c = color ?? {
    bg: "rgba(255,255,255,0.06)",
    text: "var(--color-text-muted)",
    border: "var(--color-border-strong)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "2px 9px",
        borderRadius: 6,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      {label}
    </span>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        fontSize: 12,
        padding: "3px 10px",
        borderRadius: 6,
        background: "var(--color-surface-elevated)",
        border: "1px solid var(--color-border-strong)",
        color: "var(--color-text-secondary)",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      {label}
    </span>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "8px 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span
        style={{
          fontSize: 13,
          minWidth: 80,
          color: "var(--color-text-subtle)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        {icon} {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "var(--color-text-secondary)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--color-surface-strong)",
        border: "1px solid var(--color-border)",
        borderRadius: 14,
        padding: "20px 22px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-text-subtle)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function ActionButton({
  label,
  variant = "secondary",
  onClick,
  loading,
  disabled,
  danger,
}: {
  label: string;
  variant?: "primary" | "secondary";
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "Plus Jakarta Sans, sans-serif",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    border: "1px solid",
    transition: "all 0.15s",
    opacity: disabled || loading ? 0.5 : 1,
  };
  const styles: React.CSSProperties =
    variant === "primary"
      ? {
          ...base,
          background: danger ? "rgba(239,68,68,0.12)" : "var(--color-brand)",
          color: danger ? "#f87171" : "#03080f",
          borderColor: danger ? "rgba(239,68,68,0.3)" : "transparent",
        }
      : {
          ...base,
          background: "transparent",
          color: danger ? "#f87171" : "var(--color-text-secondary)",
          borderColor: danger
            ? "rgba(239,68,68,0.25)"
            : "var(--color-border-strong)",
        };

  return (
    <button onClick={onClick} disabled={disabled || loading} style={styles}>
      {loading ? (
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
            display: "inline-block",
          }}
        />
      ) : null}
      {label}
    </button>
  );
}

function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        padding: "12px 18px",
        borderRadius: 12,
        background:
          type === "success"
            ? "rgba(192,255,114,0.12)"
            : "rgba(239,68,68,0.12)",
        border: `1px solid ${type === "success" ? "rgba(192,255,114,0.3)" : "rgba(239,68,68,0.3)"}`,
        color: type === "success" ? "#c0ff72" : "#f87171",
        fontSize: 13,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontWeight: 600,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "srch-in 0.2s ease forwards",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {type === "success" ? "✓" : "✕"} {message}
    </div>
  );
}

// ─── RBAC Actions Matrix ───────────────────────────────────────────────────────
//
// Cada acción retorna { label, danger, action(viewerId, targetId, extra) }
// Se evalúan en tiempo de carga con el contexto de viewer + target.

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserProfilePage({
  entityType,
  entityId,
  onBack,
}: UserProfilePageProps) {
  const { user } = useAuth();
  const viewerRole: ViewerRole =
    (user?.user_metadata?.rol as ViewerRole) ?? "estudiante";
  const viewerId = user?.id ?? "";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({
    loading: false,
    success: null,
    error: null,
  });

  // Context needed for conditional actions
  const [viewerContext, setViewerContext] = useState<{
    centroId?: string; // if tutor_centro: their centro
    empresaId?: string; // if tutor_empresa: their empresa
    centroEstudiante?: string; // if estudiante is linked to the same centro as viewer
    isMiEstudiante?: boolean; // if estudiante already assigned to this tutor
    isBlocked?: boolean;
    isEnrolledEstudiante?: boolean; // centro_educativo: estudiante ya vinculado
    isMyPracticasStudent?: boolean; // tutor_empresa: already my practicas student
  }>({});

  const [userBlock, setUserBlock] = useState<{ blocked: boolean } | null>(null);

  // ── Load profile ──
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const table =
          entityType === "empresa"
            ? "empresa"
            : entityType === "centro_educativo"
              ? "centro_educativo"
              : "estudiante";

        const { data, error: e } = await supabase
          .from(table)
          .select("*")
          .eq("id", entityId)
          .maybeSingle();

        if (e || !data) {
          setError(e?.message ?? "No encontrado");
        } else {
          setProfile(data as ProfileData);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [entityType, entityId]);

  // ── Load viewer context ──
  useEffect(() => {
    if (!user) return;

    const loadViewerContext = async () => {
      const ctx: typeof viewerContext = {};
      const loads: Promise<any>[] = [];

      if (viewerRole === "tutor_centro") {
        loads.push(
          (async () => {
            const { data } = await supabase
              .from("tutor_centro")
              .select("centro_id")
              .eq("usuario_id", viewerId)
              .maybeSingle();

            if (data) ctx.centroId = data.centro_id;
          })(),
        );

        if (entityType === "estudiante") {
          loads.push(
            (async () => {
              const { data } = await supabase
                .from("centro_estudiante")
                .select("id, id_tutor")
                .eq("id_estudiante", entityId)
                .maybeSingle();

              if (data) {
                ctx.centroEstudiante = data.id;
                ctx.isMiEstudiante = data.id_tutor === viewerId;
              }
            })(),
          );
        }
      }

      if (viewerRole === "tutor_empresa") {
        loads.push(
          (async () => {
            const { data } = await supabase
              .from("tutor_empresa")
              .select("empresa_id")
              .eq("usuario_id", viewerId)
              .maybeSingle();

            if (data) ctx.empresaId = data.empresa_id;
          })(),
        );

        if (entityType === "estudiante") {
          loads.push(
            (async () => {
              const { data } = await supabase
                .from("estudiante_estado")
                .select("id, estado")
                .eq("id_estudiante", entityId)
                .maybeSingle();

              ctx.isMyPracticasStudent = data?.estado === "en_practicas";
            })(),
          );
        }
      }

      if (viewerRole === "centro_educativo" && entityType === "estudiante") {
        loads.push(
          (async () => {
            const { data } = await supabase
              .from("centro_estudiante")
              .select("id")
              .eq("id_estudiante", entityId)
              .maybeSingle();

            ctx.isEnrolledEstudiante = !!data;
          })(),
        );
      }

      if (viewerRole === "administrador") {
        loads.push(
          (async () => {
            await supabase
              .from("usuario")
              .select("id")
              .eq("id", entityId)
              .maybeSingle();

            setUserBlock({ blocked: false });
          })(),
        );
      }

      await Promise.all(loads);
    };

    loadViewerContext();
  }, [user, viewerRole, viewerId, entityId, entityType]);

  // ── Action helpers ──
  const withAction = async (fn: () => Promise<void>, successMsg: string) => {
    setActionState({ loading: true, success: null, error: null });
    try {
      await fn();
      setActionState({ loading: false, success: successMsg, error: null });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error inesperado";
      setActionState({ loading: false, success: null, error: msg });
    }
  };

  // ─ Admin actions ─
  const handleBlock = () =>
    withAction(async () => {
      // Flag en tabla usuario (requiere columna blocked boolean)
      const { error: e } = await supabase
        .from("usuario")
        .update({ blocked: true } as Record<string, unknown>)
        .eq("id", entityId);
      if (e) throw new Error(e.message);
      setUserBlock({ blocked: true });
    }, "Usuario bloqueado correctamente");

  const handleUnblock = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("usuario")
        .update({ blocked: false } as Record<string, unknown>)
        .eq("id", entityId);
      if (e) throw new Error(e.message);
      setUserBlock({ blocked: false });
    }, "Usuario desbloqueado correctamente");

  const handleVerify = (table: "empresa" | "centro_educativo") => () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from(table)
        .update({ verificado: true })
        .eq("id", entityId);
      if (e) throw new Error(e.message);
    }, `${ENTITY_LABELS[entityType]} verificado`);

  const handleDelete = () =>
    withAction(async () => {
      if (
        !window.confirm(
          "¿Seguro que deseas eliminar este perfil? Esta acción es irreversible.",
        )
      )
        return;
      const table =
        entityType === "empresa"
          ? "empresa"
          : entityType === "centro_educativo"
            ? "centro_educativo"
            : "estudiante";
      const { error: e } = await supabase
        .from(table)
        .delete()
        .eq("id", entityId);
      if (e) throw new Error(e.message);
      // Redirect after delete
      setTimeout(() => (window.location.href = "/"), 1000);
    }, "Perfil eliminado");

  // ─ Centro actions on estudiante ─
  const handleEnrollEstudiante = () =>
    withAction(async () => {
      const centroId = await resolveCentroId();
      const { error: e } = await supabase
        .from("centro_estudiante")
        .insert({ id_centro: centroId, id_estudiante: entityId });
      if (e) throw new Error(e.message);
      setViewerContext((c) => ({ ...c, isEnrolledEstudiante: true }));
    }, "Estudiante vinculado al centro");

  const handleUnenrollEstudiante = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("centro_estudiante")
        .delete()
        .eq("id_estudiante", entityId);
      if (e) throw new Error(e.message);
      setViewerContext((c) => ({ ...c, isEnrolledEstudiante: false }));
    }, "Estudiante desvinculado del centro");

  // ─ Tutor_centro actions on estudiante (mismo centro) ─
  const handleAssignMiEstudiante = () =>
    withAction(async () => {
      // Verify same centro
      if (!viewerContext.centroEstudiante)
        throw new Error("El estudiante no pertenece a tu centro");
      const { error: e } = await supabase
        .from("centro_estudiante")
        .update({ id_tutor: viewerId })
        .eq("id_estudiante", entityId);
      if (e) throw new Error(e.message);
      setViewerContext((c) => ({ ...c, isMiEstudiante: true }));
    }, "Estudiante asignado como tu tutorizado");

  const handleUnassignMiEstudiante = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("centro_estudiante")
        .update({ id_tutor: null })
        .eq("id_estudiante", entityId);
      if (e) throw new Error(e.message);
      setViewerContext((c) => ({ ...c, isMiEstudiante: false }));
    }, "Estudiante desasignado de tu tutela");

  // ─ Tutor_empresa actions on estudiante ─
  const handleStartPracticas = () =>
    withAction(async () => {
      if (!viewerContext.empresaId)
        throw new Error("No se encontró tu empresa");
      // Check estudiante is linked to the empresa via candidatura
      const { data: candidatura } = await supabase
        .from("candidatura")
        .select("id_candidatura")
        .eq("id_estudiante", entityId)
        .limit(1);
      if (!candidatura?.length)
        throw new Error(
          "El estudiante no tiene candidatura activa en tu empresa",
        );

      const { error: e } = await supabase.from("estudiante_estado").upsert({
        id_estudiante: entityId,
        id_empresa: viewerContext.empresaId,
        estado: "en_practicas",
        updated_at: new Date().toISOString(),
      });
      if (e) throw new Error(e.message);
      setViewerContext((c) => ({ ...c, isMyPracticasStudent: true }));
    }, "Estudiante marcado como alumno en prácticas");

  const handleEndPracticas = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("estudiante_estado")
        .update({ estado: "finalizado", updated_at: new Date().toISOString() })
        .eq("id_estudiante", entityId)
        .eq("id_empresa", viewerContext.empresaId ?? "");
      if (e) throw new Error(e.message);
      setViewerContext((c) => ({ ...c, isMyPracticasStudent: false }));
    }, "Prácticas finalizadas");

  // ─ Empresa action: save estudiante ─
  const handleGuardarEstudiante = () =>
    withAction(async () => {
      // guardado table uses integer ids — needs mapping; simplified for now
      const { error: e } = await supabase.from("guardado").insert({
        id_estudiante: entityId,
        fecha_guardado: new Date().toISOString(),
      });
      if (e) throw new Error(e.message);
    }, "Estudiante guardado");

  // Helpers
  async function resolveCentroId(): Promise<string> {
    if (viewerContext.centroId) return viewerContext.centroId;
    const { data } = await supabase
      .from("centro_educativo")
      .select("id")
      .eq("id", viewerId)
      .maybeSingle();
    return data?.id ?? viewerId;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
          color: "var(--color-text-muted)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "2px solid var(--color-border-strong)",
            borderTopColor: "var(--color-brand)",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 300,
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: "var(--color-text-muted)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          {error ?? "Perfil no encontrado"}
        </span>
        {onBack && (
          <button onClick={onBack} className="btn-secondary text-sm">
            ← Volver
          </button>
        )}
      </div>
    );
  }

  const ec = ENTITY_COLOR[entityType];

  // Extract name + avatar per type
  const getName = () => {
    if (entityType === "estudiante") {
      const s = profile as Estudiante;
      return `${s.nombre ?? ""} ${s.apellidos ?? ""}`.trim();
    }
    return (profile as Empresa | CentroEducativo).nombre ?? "";
  };

  const getAvatar = () => {
    if (entityType === "empresa") return (profile as Empresa).logo_url;
    return (profile as Estudiante | CentroEducativo).avatar_url;
  };

  const profileName = getName();
  const avatarUrl = getAvatar();

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "24px 16px 48px",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      {/* ── Back ── */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 20,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            fontSize: 13,
            fontFamily: "Plus Jakarta Sans, sans-serif",
            padding: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-text)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-text-muted)")
          }
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver
        </button>
      )}

      {/* ── Hero card ── */}
      <div
        style={{
          background: "var(--color-surface-strong)",
          border: "1px solid var(--color-border-strong)",
          borderRadius: 18,
          padding: "28px 28px 24px",
          marginBottom: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 200,
            height: 200,
            background: `radial-gradient(circle at top right, ${ec.border} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <Avatar url={avatarUrl} name={profileName} size={80} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 6,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--color-text)",
                  fontFamily: "Syne, sans-serif",
                }}
              >
                {profileName}
              </h1>
              <Badge label={ENTITY_LABELS[entityType]} color={ec} />
              {/* Verified badge */}
              {"verificado" in profile && profile.verificado && (
                <Badge
                  label="✓ Verificado"
                  color={{
                    bg: "rgba(192,255,114,0.1)",
                    text: "#c0ff72",
                    border: "rgba(192,255,114,0.25)",
                  }}
                />
              )}
            </div>

            {/* Subtitle per type */}
            {entityType === "estudiante" && (
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "var(--color-text-muted)",
                }}
              >
                {[
                  (profile as Estudiante).titulacion,
                  (profile as Estudiante).ciudad,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {entityType === "empresa" && (
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "var(--color-text-muted)",
                }}
              >
                {[(profile as Empresa).sector, (profile as Empresa).ciudad]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {entityType === "centro_educativo" && (
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "var(--color-text-muted)",
                }}
              >
                {[
                  (profile as CentroEducativo).tipo_centro,
                  (profile as CentroEducativo).ciudad,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>

        {/* ── RBAC Action buttons ── */}
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}
        >
          {renderActions()}
        </div>
      </div>

      {/* ── Info sections ── */}
      {renderInfoSections()}

      {/* ── Toast notifications ── */}
      {actionState.success && (
        <Toast
          message={actionState.success}
          type="success"
          onDismiss={() => setActionState((s) => ({ ...s, success: null }))}
        />
      )}
      {actionState.error && (
        <Toast
          message={actionState.error}
          type="error"
          onDismiss={() => setActionState((s) => ({ ...s, error: null }))}
        />
      )}

      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes srch-in { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>
    </div>
  );

  // ─── Render actions (RBAC) ────────────────────────────────────────────────

  function renderActions(): React.ReactNode {
    const al = actionState.loading;

    // ── ADMINISTRADOR ── Can do everything
    if (viewerRole === "administrador") {
      return (
        <>
          {(entityType === "empresa" || entityType === "centro_educativo") && (
            <ActionButton
              label="Verificar"
              variant="primary"
              onClick={handleVerify(
                entityType as "empresa" | "centro_educativo",
              )}
              loading={al}
            />
          )}
          {userBlock?.blocked ? (
            <ActionButton
              label="Desbloquear usuario"
              onClick={handleUnblock}
              loading={al}
            />
          ) : (
            <ActionButton
              label="Bloquear usuario"
              danger
              onClick={handleBlock}
              loading={al}
            />
          )}
          <ActionButton
            label="Eliminar perfil"
            danger
            onClick={handleDelete}
            loading={al}
          />
          <ActionButton
            label="Enviar mensaje"
            onClick={() => alert("Abrir chat")}
          />
        </>
      );
    }

    // ── CENTRO_EDUCATIVO ── Can manage estudiantes linked to it
    if (viewerRole === "centro_educativo" && entityType === "estudiante") {
      return (
        <>
          {viewerContext.isEnrolledEstudiante ? (
            <ActionButton
              label="Desvincular del centro"
              danger
              onClick={handleUnenrollEstudiante}
              loading={al}
            />
          ) : (
            <ActionButton
              label="Vincular al centro"
              variant="primary"
              onClick={handleEnrollEstudiante}
              loading={al}
            />
          )}
          <ActionButton
            label="Ver candidaturas"
            onClick={() =>
              (window.location.href = `/estudiantes/${entityId}/candidaturas`)
            }
          />
        </>
      );
    }

    // ── TUTOR_CENTRO ── Can assign/unassign their own tutored students (same centro)
    if (viewerRole === "tutor_centro" && entityType === "estudiante") {
      const sameCenter = !!viewerContext.centroEstudiante;
      return (
        <>
          {sameCenter ? (
            viewerContext.isMiEstudiante ? (
              <ActionButton
                label="Quitar de mis tutorizados"
                danger
                onClick={handleUnassignMiEstudiante}
                loading={al}
              />
            ) : (
              <ActionButton
                label="Añadir como mi tutorizado"
                variant="primary"
                onClick={handleAssignMiEstudiante}
                loading={al}
              />
            )
          ) : (
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-subtle)",
                alignSelf: "center",
              }}
            >
              Este estudiante no pertenece a tu centro
            </span>
          )}
          <ActionButton
            label="Enviar mensaje"
            onClick={() => alert("Abrir chat")}
          />
        </>
      );
    }

    // ── TUTOR_EMPRESA ── Can mark/unmark estudiante as practicas student (only if linked to empresa)
    if (viewerRole === "tutor_empresa" && entityType === "estudiante") {
      return (
        <>
          {viewerContext.isMyPracticasStudent ? (
            <ActionButton
              label="Finalizar prácticas"
              danger
              onClick={handleEndPracticas}
              loading={al}
            />
          ) : (
            <ActionButton
              label="Iniciar prácticas"
              variant="primary"
              onClick={handleStartPracticas}
              loading={al}
            />
          )}
          <ActionButton
            label="Guardar estudiante"
            onClick={handleGuardarEstudiante}
            loading={al}
          />
          <ActionButton
            label="Enviar mensaje"
            onClick={() => alert("Abrir chat")}
          />
        </>
      );
    }

    // ── EMPRESA ── Can save / message estudiante, view centro
    if (viewerRole === "empresa") {
      if (entityType === "estudiante") {
        return (
          <>
            <ActionButton
              label="Guardar perfil"
              variant="primary"
              onClick={handleGuardarEstudiante}
              loading={al}
            />
            <ActionButton
              label="Enviar mensaje"
              onClick={() => alert("Abrir chat")}
            />
            <ActionButton
              label="Ver candidaturas"
              onClick={() =>
                (window.location.href = `/estudiantes/${entityId}/candidaturas`)
              }
            />
          </>
        );
      }
      if (entityType === "centro_educativo") {
        return (
          <ActionButton
            label="Contactar centro"
            onClick={() => alert("Abrir chat")}
          />
        );
      }
    }

    // ── ESTUDIANTE ── Can apply to offers, view empresa/centro
    if (viewerRole === "estudiante") {
      if (entityType === "empresa") {
        return (
          <>
            <ActionButton
              label="Ver ofertas"
              variant="primary"
              onClick={() =>
                (window.location.href = `/empresas/${entityId}/ofertas`)
              }
            />
            <ActionButton
              label="Enviar mensaje"
              onClick={() => alert("Abrir chat")}
            />
          </>
        );
      }
      if (entityType === "centro_educativo") {
        return (
          <ActionButton
            label="Contactar centro"
            onClick={() => alert("Abrir chat")}
          />
        );
      }
    }

    return null;
  }

  // ─── Render info sections per entity type ─────────────────────────────────

  function renderInfoSections(): React.ReactNode {
    if (entityType === "estudiante") {
      const s = profile as Estudiante;
      return (
        <>
          {s.sobre_mi && (
            <SectionCard title="Sobre mí">
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                }}
              >
                {s.sobre_mi}
              </p>
            </SectionCard>
          )}

          <SectionCard title="Información">
            <InfoRow icon="📍" label="Ciudad" value={s.ciudad} />
            <InfoRow icon="📚" label="Titulación" value={s.titulacion} />
            <InfoRow
              icon="🔍"
              label="Disponibilidad"
              value={s.disponibilidad}
            />
            <InfoRow icon="💼" label="Tipo búsqueda" value={s.tipo_busqueda} />
            <InfoRow icon="🌐" label="Modalidad" value={s.modalidad} />
            <InfoRow
              icon="📞"
              label="Teléfono"
              value={viewerRole !== "estudiante" ? s.telefono : undefined}
            />
            <InfoRow
              icon="✉️"
              label="Email"
              value={
                viewerRole === "administrador" ||
                viewerRole === "tutor_centro" ||
                viewerRole === "tutor_empresa"
                  ? s.email
                  : undefined
              }
            />
            {s.github_username && (
              <InfoRow
                icon="🐙"
                label="GitHub"
                value={`github.com/${s.github_username}`}
              />
            )}
          </SectionCard>

          {s.habilidades && s.habilidades.length > 0 && (
            <SectionCard title="Habilidades">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {s.habilidades.map((h) => (
                  <Tag key={h} label={h} />
                ))}
              </div>
            </SectionCard>
          )}

          {Array.isArray(s.formaciones) && s.formaciones.length > 0 && (
            <SectionCard title="Formación">
              {(s.formaciones as Record<string, string>[]).map((f, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 10,
                    paddingBottom: 10,
                    borderBottom:
                      i < s.formaciones!.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "var(--color-text)",
                    }}
                  >
                    {f.titulo}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                  >
                    {[f.institucion, f.anio].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))}
            </SectionCard>
          )}

          {Array.isArray(s.proyectos) && s.proyectos.length > 0 && (
            <SectionCard title="Proyectos">
              {(s.proyectos as Record<string, string>[]).map((p, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 10,
                    paddingBottom: 10,
                    borderBottom:
                      i < s.proyectos!.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "var(--color-text)",
                    }}
                  >
                    {p.titulo}
                  </div>
                  {p.descripcion && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {p.descripcion}
                    </div>
                  )}
                  {p.enlace && (
                    <a
                      href={p.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12,
                        color: "var(--color-brand)",
                        textDecoration: "none",
                      }}
                    >
                      Ver proyecto →
                    </a>
                  )}
                </div>
              ))}
            </SectionCard>
          )}
        </>
      );
    }

    if (entityType === "empresa") {
      const e = profile as Empresa;
      return (
        <>
          {e.descripcion && (
            <SectionCard title="Descripción">
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                }}
              >
                {e.descripcion}
              </p>
            </SectionCard>
          )}
          <SectionCard title="Información">
            <InfoRow icon="📍" label="Ciudad" value={e.ciudad} />
            <InfoRow icon="🏭" label="Sector" value={e.sector} />
            <InfoRow icon="👥" label="Tamaño" value={e.tamano} />
            <InfoRow icon="✉️" label="Email" value={e.email_contacto} />
            <InfoRow icon="📞" label="Teléfono" value={e.telefono} />
            <InfoRow icon="🌐" label="Web" value={e.web} />
            {viewerRole === "administrador" && (
              <InfoRow icon="🆔" label="CIF" value={e.cif} />
            )}
          </SectionCard>
          {(e.linkedin || e.twitter || e.instagram) && (
            <SectionCard title="Redes sociales">
              {e.linkedin && (
                <InfoRow icon="🔗" label="LinkedIn" value={e.linkedin} />
              )}
              {e.twitter && (
                <InfoRow icon="🐦" label="Twitter/X" value={e.twitter} />
              )}
              {e.instagram && (
                <InfoRow icon="📸" label="Instagram" value={e.instagram} />
              )}
            </SectionCard>
          )}
        </>
      );
    }

    if (entityType === "centro_educativo") {
      const c = profile as CentroEducativo;
      return (
        <>
          {c.descripcion && (
            <SectionCard title="Descripción">
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                }}
              >
                {c.descripcion}
              </p>
            </SectionCard>
          )}
          <SectionCard title="Información">
            <InfoRow icon="📍" label="Ciudad" value={c.ciudad} />
            <InfoRow icon="🗺️" label="Provincia" value={c.provincia} />
            <InfoRow icon="🏫" label="Tipo centro" value={c.tipo_centro} />
            <InfoRow
              icon="👨‍🎓"
              label="Nº alumnos"
              value={c.num_alumnos?.toString()}
            />
            <InfoRow icon="✉️" label="Email" value={c.email_contacto} />
            <InfoRow icon="📞" label="Teléfono" value={c.telefono} />
            <InfoRow icon="🌐" label="Web" value={c.sitio_web} />
          </SectionCard>
          {c.titulaciones && c.titulaciones.length > 0 && (
            <SectionCard title="Titulaciones que imparte">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {c.titulaciones.map((t) => (
                  <Tag key={t} label={t} />
                ))}
              </div>
            </SectionCard>
          )}
        </>
      );
    }

    return null;
  }
}
