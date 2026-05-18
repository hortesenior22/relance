import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import MainLayout from "../components/layout/MainLayout";

// ─── InviteModal props interface (fixes the TS error) ──────────────────────────
interface InviteModalProps {
  user: import("@supabase/supabase-js").User | null;
  onClose: () => void;
  entityType: string;
  inviteRoute: string;
  expiresInHours: number;
  title: string;
  description: string;
  warningText: string;
  roleLabel: string;
  inviterName: string;
}

// Import with cast so existing InviteModal JS component accepts the typed props
import InviteModalRaw from "../components/InviteModal";
const InviteModal = InviteModalRaw as React.ComponentType<InviteModalProps>;

// ─── Shared atoms (same style language as CenterEducativePanel) ───────────────

function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 0",
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          border: "2px solid var(--color-border-strong)",
          borderTopColor: "var(--color-brand)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}

function IconSearch() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function IconClipboard() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
    </svg>
  );
}

// ─── Role badge — uses CSS vars ───────────────────────────────────────────────

const ROL_CFG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  estudiante: {
    label: "Estudiante",
    color: "var(--color-info)",
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.25)",
  },
  empresa: {
    label: "Empresa",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    border: "rgba(167,139,250,0.25)",
  },
  centro_educativo: {
    label: "Centro",
    color: "var(--color-warning)",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.25)",
  },
  tutor_empresa: {
    label: "Tutor empresa",
    color: "var(--color-success)",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.25)",
  },
  tutor_centro: {
    label: "Tutor centro",
    color: "var(--color-success)",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.25)",
  },
  admin: {
    label: "Admin",
    color: "var(--color-brand)",
    bg: "rgba(192,255,114,0.1)",
    border: "rgba(192,255,114,0.25)",
  },
  bloqueado: {
    label: "Bloqueado",
    color: "var(--color-error)",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.25)",
  },
};

function RolBadge({ rol }: { rol: string }) {
  const cfg = ROL_CFG[rol] ?? {
    label: rol,
    color: "var(--color-text-subtle)",
    bg: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10,
        fontWeight: 600,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 20,
        padding: "2px 9px",
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: cfg.color,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}

// ─── Stat card — same as CenterEducativePanel ─────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  suffix = "",
  accent = false,
}: {
  label: string;
  value: number | string;
  sub?: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--color-surface-strong)",
        border: `1px solid ${accent ? "rgba(192,255,114,0.22)" : "var(--color-border)"}`,
        borderRadius: 12,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {accent && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, var(--color-brand), transparent)",
          }}
        />
      )}
      <p
        style={{
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.13em",
          color: "var(--color-text-subtle)",
          fontWeight: 700,
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: "var(--color-text)",
          margin: 0,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.03em",
        }}
      >
        {value}
        {suffix}
      </p>
      {sub && (
        <p
          style={{ fontSize: 10, color: "var(--color-text-muted)", margin: 0 }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 12,
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              margin: "3px 0 0",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Search input ─────────────────────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div style={{ position: "relative", maxWidth: 240 }}>
      <span
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--color-text-subtle)",
          pointerEvents: "none",
          display: "flex",
        }}
      >
        <IconSearch />
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          paddingLeft: 30,
          paddingRight: 10,
          paddingTop: 7,
          paddingBottom: 7,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 9,
          fontSize: 11,
          color: "var(--color-text-secondary)",
          outline: "none",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

function Table({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children?: React.ReactNode;
  empty?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "0.11em",
                  color: "var(--color-text-subtle)",
                  fontWeight: 700,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && (
        <div
          style={{
            textAlign: "center",
            padding: "28px 0",
            color: "var(--color-text-subtle)",
            fontSize: 12,
          }}
        >
          {empty}
        </div>
      )}
    </div>
  );
}

function TR({ cells, last }: { cells: React.ReactNode[]; last?: boolean }) {
  return (
    <tr
      style={{
        borderBottom: last ? "none" : "1px solid var(--color-border-subtle)",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--color-surface)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {cells.map((c, i) => (
        <td
          key={i}
          style={{
            padding: "10px 14px",
            color: "var(--color-text-secondary)",
            verticalAlign: "middle",
          }}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

type BtnVariant = "default" | "primary" | "danger" | "success" | "ghost";

const BTN_STYLES: Record<BtnVariant, React.CSSProperties> = {
  default: {
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border-strong)",
    color: "var(--color-text-secondary)",
  },
  primary: {
    background: "rgba(192,255,114,0.1)",
    border: "1px solid rgba(192,255,114,0.3)",
    color: "var(--color-brand)",
  },
  danger: {
    background: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.22)",
    color: "var(--color-error)",
  },
  success: {
    background: "rgba(74,222,128,0.08)",
    border: "1px solid rgba(74,222,128,0.22)",
    color: "var(--color-success)",
  },
  ghost: {
    background: "transparent",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-muted)",
  },
};

function Btn({
  onClick,
  children,
  variant = "default",
  disabled = false,
  small = false,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: BtnVariant;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...BTN_STYLES[variant],
        borderRadius: 9,
        padding: small ? "5px 11px" : "7px 14px",
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.14s",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

// ─── Avatar initials ──────────────────────────────────────────────────────────

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const COLORS = [
    "#c0ff72",
    "#60a5fa",
    "#f59e0b",
    "#a78bfa",
    "#34d399",
    "#f87171",
  ];
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: `${color}18`,
        border: `1.5px solid ${color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        color,
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
}

// ─── OfferField ───────────────────────────────────────────────────────────────

function OfferField({ label, value }: { label: string; value?: any }) {
  const empty = !value || (Array.isArray(value) && value.length === 0);
  return (
    <div>
      <p
        style={{
          fontSize: 9,
          color: "var(--color-text-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.11em",
          fontWeight: 700,
          margin: "0 0 4px",
        }}
      >
        {label}
      </p>
      {empty ? (
        <p
          style={{ fontSize: 11, color: "var(--color-text-subtle)", margin: 0 }}
        >
          —
        </p>
      ) : Array.isArray(value) ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {value.map((v: any, i: number) => (
            <span
              key={i}
              style={{
                background: "rgba(192,255,114,0.08)",
                border: "1px solid rgba(192,255,114,0.2)",
                color: "var(--color-brand)",
                fontSize: 10,
                padding: "2px 7px",
                borderRadius: 5,
                fontFamily: "monospace",
              }}
            >
              {v.nombre ?? v}
            </span>
          ))}
        </div>
      ) : (
        <p
          style={{
            fontSize: 11,
            color: "var(--color-text-secondary)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {value}
        </p>
      )}
    </div>
  );
}

// ─── ValidarOfertaModal ───────────────────────────────────────────────────────

function ValidarOfertaModal({
  oferta,
  onClose,
  onSaved,
}: {
  oferta: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [action, setAction] = useState<"activa" | "rechazada" | null>(null);
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (action === "rechazada" && !motivo.trim()) return;
    setSaving(true);
    await supabase
      .from("oferta")
      .update({
        estado: action,
        motivo_rechazo: action === "rechazada" ? motivo.trim() : null,
        fecha_modificacion: new Date().toISOString(),
      })
      .eq("id_oferta", oferta.id_oferta);
    setSaving(false);
    onSaved();
    onClose();
  };

  const TIPO_MAP: Record<string, string> = {
    practicas: "Prácticas",
    practicas_contratacion: "Prácticas + contratación",
    empleo_junior: "Empleo junior",
    contrato: "Contrato",
    beca: "Beca",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border-strong)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 620,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 56px rgba(0,0,0,0.55)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--color-warning)",
                fontWeight: 700,
                margin: "0 0 4px",
              }}
            >
              Pendiente de revisión
            </p>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "var(--color-text)",
              }}
            >
              {oferta.titulo}
            </h2>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 11,
                color: "var(--color-text-muted)",
              }}
            >
              {oferta.empresa_nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-subtle)",
              cursor: "pointer",
              padding: 4,
              flexShrink: 0,
              display: "flex",
            }}
          >
            <IconClose />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "18px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px 20px",
            }}
          >
            <OfferField
              label="Tipo"
              value={TIPO_MAP[oferta.tipo_oferta] ?? oferta.tipo_oferta}
            />
            <OfferField label="Modalidad" value={oferta.modalidad} />
            <OfferField label="Ubicación" value={oferta.ubicacion} />
            <OfferField
              label="Publicación"
              value={
                oferta.fecha_publicacion
                  ? new Date(oferta.fecha_publicacion).toLocaleDateString(
                      "es-ES",
                      { day: "2-digit", month: "long", year: "numeric" },
                    )
                  : null
              }
            />
            <OfferField
              label="Duración"
              value={
                oferta.duracion_semanas
                  ? `${oferta.duracion_semanas} semanas`
                  : (oferta.duracion ?? null)
              }
            />
            <OfferField
              label="Horas / semana"
              value={
                oferta.horas_semanales ? `${oferta.horas_semanales} h` : null
              }
            />
            <OfferField
              label="Plazas"
              value={
                oferta.num_plazas != null
                  ? `${oferta.num_plazas_restantes ?? oferta.num_plazas} disp. de ${oferta.num_plazas}`
                  : null
              }
            />
            <OfferField
              label="Remuneración"
              value={
                oferta.salario_mensual != null
                  ? oferta.salario_mensual === 0
                    ? "No remunerado"
                    : `${oferta.salario_mensual} €/mes`
                  : (oferta.salario ?? null)
              }
            />
            <OfferField label="Horario" value={oferta.horario} />
            <OfferField
              label="Cierre solicitudes"
              value={
                oferta.fecha_fin_solicitud
                  ? new Date(oferta.fecha_fin_solicitud).toLocaleDateString(
                      "es-ES",
                      { day: "2-digit", month: "long", year: "numeric" },
                    )
                  : null
              }
            />
            <OfferField
              label="Opción de contratación"
              value={
                oferta.opcion_contrato != null
                  ? oferta.opcion_contrato
                    ? "Sí"
                    : "No"
                  : null
              }
            />
          </div>
          {[
            ["Descripción", oferta.descripcion],
            ["Requisitos", oferta.requisitos ?? oferta.requisitos_adicionales],
            ["Beneficios", oferta.beneficios],
          ].map(([lbl, val]) =>
            val ? (
              <div
                key={lbl as string}
                style={{
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: 14,
                }}
              >
                <OfferField label={lbl as string} value={val} />
              </div>
            ) : null,
          )}
          {oferta.tecnologias?.length > 0 && (
            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                paddingTop: 14,
              }}
            >
              <OfferField label="Tecnologías" value={oferta.tecnologias} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            padding: "14px 22px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {(["activa", "rechazada"] as const).map((a) => {
              const isApr = a === "activa";
              const active = action === a;
              return (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  style={{
                    padding: "9px 0",
                    borderRadius: 10,
                    fontFamily: "inherit",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.14s",
                    border: `1px solid ${active ? (isApr ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)") : "var(--color-border)"}`,
                    background: active
                      ? isApr
                        ? "rgba(74,222,128,0.1)"
                        : "rgba(248,113,113,0.08)"
                      : "var(--color-surface)",
                    color: active
                      ? isApr
                        ? "var(--color-success)"
                        : "var(--color-error)"
                      : "var(--color-text-muted)",
                  }}
                >
                  {isApr ? <IconCheck /> : <IconX />}
                  {isApr ? "Aprobar oferta" : "Rechazar"}
                </button>
              );
            })}
          </div>

          {action === "rechazada" && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 9,
                  color: "var(--color-text-subtle)",
                  textTransform: "uppercase",
                  letterSpacing: "0.11em",
                  fontWeight: 700,
                  marginBottom: 5,
                }}
              >
                Motivo <span style={{ color: "var(--color-error)" }}>*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value.slice(0, 300))}
                rows={3}
                placeholder="Explica brevemente por qué se rechaza esta oferta…"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 9,
                  color: "var(--color-text-secondary)",
                  fontSize: 11,
                  padding: "9px 11px",
                  fontFamily: "inherit",
                  resize: "none",
                  outline: "none",
                }}
              />
              <p
                style={{
                  fontSize: 10,
                  color: "var(--color-text-subtle)",
                  textAlign: "right",
                  margin: "2px 0 0",
                }}
              >
                {motivo.length}/300
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={onClose} variant="ghost">
              Cancelar
            </Btn>
            <button
              onClick={handleConfirm}
              disabled={
                !action || (action === "rechazada" && !motivo.trim()) || saving
              }
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 0.14s",
                border: `1px solid ${action === "activa" ? "rgba(74,222,128,0.3)" : action === "rechazada" ? "rgba(248,113,113,0.3)" : "var(--color-border)"}`,
                background:
                  action === "activa"
                    ? "rgba(74,222,128,0.1)"
                    : action === "rechazada"
                      ? "rgba(248,113,113,0.08)"
                      : "var(--color-surface)",
                color:
                  action === "activa"
                    ? "var(--color-success)"
                    : action === "rechazada"
                      ? "var(--color-error)"
                      : "var(--color-text-subtle)",
                cursor:
                  !action ||
                  (action === "rechazada" && !motivo.trim()) ||
                  saving
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  !action ||
                  (action === "rechazada" && !motivo.trim()) ||
                  saving
                    ? 0.4
                    : 1,
              }}
            >
              {saving ? (
                <div
                  style={{
                    width: 13,
                    height: 13,
                    border: "2px solid rgba(255,255,255,0.1)",
                    borderTopColor: "currentColor",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              ) : action === "activa" ? (
                "Confirmar aprobación"
              ) : action === "rechazada" ? (
                "Confirmar rechazo"
              ) : (
                "Selecciona una acción"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdministrationPanel() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchUsuario, setSearchUsuario] = useState("");

  const [stats, setStats] = useState({
    estudiantes: 0,
    empresas: 0,
    centros: 0,
    tutores: 0,
    ofertas_pendientes: 0,
    ofertas_activas: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [ofertasPendientes, setOfertasPendientes] = useState<any[]>([]);
  const [loadingOfertas, setLoadingOfertas] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [validarOferta, setValidarOferta] = useState<any>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const cargarStats = useCallback(async () => {
    setLoadingStats(true);
    const [est, emp, cen, tut, ofPend, ofActiva] = await Promise.all([
      supabase
        .from("usuario")
        .select("id", { count: "exact", head: true })
        .eq("rol", "estudiante"),
      supabase
        .from("usuario")
        .select("id", { count: "exact", head: true })
        .eq("rol", "empresa"),
      supabase
        .from("usuario")
        .select("id", { count: "exact", head: true })
        .eq("rol", "centro_educativo"),
      supabase
        .from("usuario")
        .select("id", { count: "exact", head: true })
        .in("rol", ["tutor_empresa", "tutor_centro"]),
      supabase
        .from("oferta")
        .select("id_oferta", { count: "exact", head: true })
        .eq("estado", "pendiente"),
      supabase
        .from("oferta")
        .select("id_oferta", { count: "exact", head: true })
        .eq("estado", "activa"),
    ]);
    if (!mountedRef.current) return;
    setStats({
      estudiantes: est.count ?? 0,
      empresas: emp.count ?? 0,
      centros: cen.count ?? 0,
      tutores: tut.count ?? 0,
      ofertas_pendientes: ofPend.count ?? 0,
      ofertas_activas: ofActiva.count ?? 0,
    });
    setLoadingStats(false);
  }, []);

  const cargarOfertas = useCallback(async () => {
    setLoadingOfertas(true);
    const { data: ofertasData } = await supabase
      .from("oferta")
      .select(
        `id_oferta, titulo, descripcion, modalidad, ubicacion, tipo_oferta,
               salario_mensual, duracion_semanas, horas_semanales,
               num_plazas, num_plazas_restantes, beneficios, requisitos_adicionales,
               opcion_contrato, fecha_publicacion, fecha_fin_solicitud, estado, id_empresa`,
      )
      .eq("estado", "pendiente")
      .order("fecha_publicacion", { ascending: true });

    const ofertasRaw = ofertasData ?? [];
    const empresaIds = [
      ...new Set(ofertasRaw.map((o: any) => o.id_empresa).filter(Boolean)),
    ];
    let empresaMap: Record<string, any> = {};
    if (empresaIds.length > 0) {
      const { data: empData } = await supabase
        .from("empresa")
        .select("id, nombre, logo_url")
        .in("id", empresaIds);
      empresaMap = (empData ?? []).reduce((acc: any, e: any) => {
        acc[e.id] = e;
        return acc;
      }, {});
    }
    const ofertaIds = ofertasRaw.map((o: any) => o.id_oferta);
    let tecMap: Record<string, any[]> = {};
    if (ofertaIds.length > 0) {
      const { data: tecData } = await supabase
        .from("oferta_tecnologia")
        .select("id_oferta, tecnologia(id_tecnologia, nombre)")
        .in("id_oferta", ofertaIds);
      tecMap = (tecData ?? []).reduce((acc: any, row: any) => {
        if (!acc[row.id_oferta]) acc[row.id_oferta] = [];
        if (row.tecnologia) acc[row.id_oferta].push(row.tecnologia);
        return acc;
      }, {});
    }
    if (!mountedRef.current) return;
    setOfertasPendientes(
      ofertasRaw.map((o: any) => {
        const empresa = empresaMap[o.id_empresa] ?? null;
        return {
          ...o,
          empresa_nombre: empresa?.nombre ?? "Empresa desconocida",
          empresa_avatar: empresa?.logo_url ?? null,
          tecnologias: tecMap[o.id_oferta] ?? [],
        };
      }),
    );
    setLoadingOfertas(false);
  }, []);

  const cargarUsuarios = useCallback(async () => {
    setLoadingUsuarios(true);
    const { data } = await supabase
      .from("usuario")
      .select("id, email, nombre, rol, created_at, avatar_url")
      .not("rol", "eq", "admin")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!mountedRef.current) return;
    setUsuarios(data ?? []);
    setLoadingUsuarios(false);
  }, []);

  const cargarAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    const { data } = await supabase
      .from("usuario")
      .select("id, email, nombre, created_at, avatar_url")
      .eq("rol", "admin")
      .order("created_at", { ascending: true });
    if (!mountedRef.current) return;
    setAdmins(data ?? []);
    setLoadingAdmins(false);
  }, []);

  useEffect(() => {
    cargarStats();
  }, [cargarStats]);
  useEffect(() => {
    if (activeTab === "ofertas") cargarOfertas();
    if (activeTab === "usuarios") cargarUsuarios();
    if (activeTab === "admins") cargarAdmins();
  }, [activeTab, cargarOfertas, cargarUsuarios, cargarAdmins]);

  const handleToggleBlock = async (userId: string, currentRol: string) => {
    const nuevoRol = currentRol === "bloqueado" ? "estudiante" : "bloqueado";
    await supabase.from("usuario").update({ rol: nuevoRol }).eq("id", userId);
    cargarUsuarios();
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const q = searchUsuario.toLowerCase();
    return (
      !q ||
      u.nombre?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const TABS = [
    { id: "dashboard", label: "Dashboard" },
    {
      id: "ofertas",
      label: "Validar ofertas",
      badge: stats.ofertas_pendientes || null,
    },
    { id: "usuarios", label: "Usuarios" },
    { id: "admins", label: "Administradores" },
  ];

  return (
    <MainLayout>
      <>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          * { box-sizing: border-box; }
          input::placeholder, textarea::placeholder { color: var(--color-text-subtle); }
          input:focus, textarea:focus { border-color: var(--color-border-strong) !important; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: var(--color-border-strong); border-radius: 4px; }
        `}</style>

        <div
          style={{
            minHeight: "100vh",
            background: "var(--color-bg)",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            color: "var(--color-text)",
          }}
        >
          <div
            style={{
              maxWidth: 1000,
              margin: "0 auto",
              padding: "32px 24px 64px",
              animation: "fadeUp 0.3s ease",
            }}
          >
            {/* ── Header ── */}
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--color-brand)",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: "var(--color-text-muted)",
                    fontWeight: 700,
                  }}
                >
                  Administración
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 24,
                      fontWeight: 800,
                      color: "var(--color-text)",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Panel de administración
                  </h1>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {user?.email ?? "—"}
                  </p>
                </div>
                <Btn variant="primary" onClick={() => setInviteModal(true)}>
                  <IconShield /> Invitar administrador
                </Btn>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div
              style={{
                display: "flex",
                gap: 2,
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 11,
                padding: 3,
                marginBottom: 24,
                overflowX: "auto",
              }}
            >
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                      letterSpacing: "-0.01em",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      transition: "all 0.14s",
                      background: active
                        ? "var(--color-surface-elevated)"
                        : "transparent",
                      color: active
                        ? "var(--color-text)"
                        : "var(--color-text-muted)",
                      boxShadow: active
                        ? "0 1px 4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
                        : "none",
                      borderBottom: active
                        ? "1px solid rgba(192,255,114,0.18)"
                        : "1px solid transparent",
                    }}
                  >
                    {tab.label}
                    {tab.badge != null && tab.badge > 0 && (
                      <span
                        style={{
                          background: "var(--color-warning)",
                          color: "var(--color-bg)",
                          fontSize: 9,
                          fontWeight: 800,
                          borderRadius: 20,
                          padding: "1px 6px",
                          lineHeight: 1.4,
                        }}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ══ DASHBOARD ══ */}
            {activeTab === "dashboard" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  animation: "fadeUp 0.22s ease",
                }}
              >
                {loadingStats ? (
                  <Spinner />
                ) : (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(160px, 1fr))",
                        gap: 8,
                      }}
                    >
                      <StatCard
                        label="Estudiantes"
                        value={stats.estudiantes}
                        sub="Registrados"
                        accent
                      />
                      <StatCard
                        label="Empresas"
                        value={stats.empresas}
                        sub="Activas"
                      />
                      <StatCard
                        label="Centros educativos"
                        value={stats.centros}
                        sub="Registrados"
                      />
                      <StatCard
                        label="Tutores"
                        value={stats.tutores}
                        sub="Empresa y centro"
                      />
                      <StatCard
                        label="Ofertas activas"
                        value={stats.ofertas_activas}
                        sub="Publicadas"
                      />
                      <StatCard
                        label="Pendientes de revisión"
                        value={stats.ofertas_pendientes}
                        sub={
                          stats.ofertas_pendientes > 0
                            ? "Requieren atención"
                            : "Todo al día"
                        }
                      />
                    </div>

                    {/* Quick actions */}
                    <div
                      style={{
                        background: "var(--color-surface-strong)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        overflow: "hidden",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 9,
                          textTransform: "uppercase",
                          letterSpacing: "0.13em",
                          color: "var(--color-text-subtle)",
                          fontWeight: 700,
                          padding: "14px 18px",
                          margin: 0,
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        Acciones rápidas
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(220px, 1fr))",
                        }}
                      >
                        {[
                          {
                            onClick: () => setActiveTab("ofertas"),
                            color: "var(--color-warning)",
                            colorRaw: "#f59e0b",
                            label: "Validar ofertas",
                            sub: `${stats.ofertas_pendientes} pendientes`,
                            icon: <IconClipboard />,
                          },
                          {
                            onClick: () => setActiveTab("usuarios"),
                            color: "var(--color-info)",
                            colorRaw: "#60a5fa",
                            label: "Gestionar usuarios",
                            sub: `${stats.estudiantes + stats.empresas + stats.centros + stats.tutores} registrados`,
                            icon: <IconUsers />,
                          },
                          {
                            onClick: () => setInviteModal(true),
                            color: "var(--color-brand)",
                            colorRaw: "#c0ff72",
                            label: "Invitar administrador",
                            sub: "Enlace seguro · caduca en 48 h",
                            icon: <IconShield />,
                          },
                        ].map((item, i, arr) => (
                          <button
                            key={i}
                            onClick={item.onClick}
                            style={{
                              background: "transparent",
                              border: "none",
                              borderRight:
                                i < arr.length - 1
                                  ? "1px solid var(--color-border)"
                                  : "none",
                              padding: "16px 18px",
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "background 0.14s",
                              width: "100%",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--color-surface)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 9,
                                background: `${item.colorRaw}14`,
                                border: `1px solid ${item.colorRaw}30`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: item.color,
                                flexShrink: 0,
                              }}
                            >
                              {item.icon}
                            </div>
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "var(--color-text)",
                                }}
                              >
                                {item.label}
                              </p>
                              <p
                                style={{
                                  margin: "2px 0 0",
                                  fontSize: 10,
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                {item.sub}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ══ VALIDAR OFERTAS ══ */}
            {activeTab === "ofertas" && (
              <div style={{ animation: "fadeUp 0.22s ease" }}>
                <SectionHeader
                  title="Ofertas pendientes"
                  subtitle="Revisa y aprueba o rechaza cada oferta antes de publicarla."
                  action={
                    <Btn variant="ghost" onClick={cargarOfertas} small>
                      <IconRefresh /> Actualizar
                    </Btn>
                  }
                />
                {loadingOfertas ? (
                  <Spinner />
                ) : ofertasPendientes.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "44px 0",
                      border: "1px dashed var(--color-border)",
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "rgba(74,222,128,0.08)",
                        border: "1px solid rgba(74,222,128,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 10px",
                        color: "var(--color-success)",
                      }}
                    >
                      <IconCheck />
                    </div>
                    <p
                      style={{
                        color: "var(--color-text)",
                        fontWeight: 600,
                        margin: 0,
                        fontSize: 13,
                      }}
                    >
                      ¡Todo al día!
                    </p>
                    <p
                      style={{
                        color: "var(--color-text-subtle)",
                        fontSize: 11,
                        margin: "4px 0 0",
                      }}
                    >
                      No hay ofertas pendientes de revisión.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {ofertasPendientes.map((o) => (
                      <div
                        key={o.id_oferta}
                        style={{
                          background: "var(--color-surface-strong)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 12,
                          padding: "12px 14px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          transition: "border-color 0.14s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--color-border-strong)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--color-border)")
                        }
                      >
                        {/* Company avatar */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: "rgba(192,255,114,0.06)",
                            border: "1px solid rgba(192,255,114,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            overflow: "hidden",
                          }}
                        >
                          {o.empresa_avatar ? (
                            <img
                              src={o.empresa_avatar}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="var(--color-brand)"
                              strokeWidth="1.5"
                            >
                              <rect x="2" y="7" width="20" height="14" rx="2" />
                              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                            </svg>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              flexWrap: "wrap",
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                fontWeight: 700,
                                color: "var(--color-text)",
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {o.titulo}
                            </p>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: "var(--color-warning)",
                                background: "rgba(251,191,36,0.1)",
                                border: "1px solid rgba(251,191,36,0.25)",
                                borderRadius: 20,
                                padding: "1px 7px",
                              }}
                            >
                              Pendiente
                            </span>
                          </div>
                          <p
                            style={{
                              margin: "2px 0 0",
                              fontSize: 10,
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {o.empresa_nombre} · {o.modalidad ?? "—"} ·{" "}
                            {o.ubicacion ?? "Sin ubicación"}
                          </p>
                          {o.tecnologias.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 3,
                                marginTop: 5,
                              }}
                            >
                              {o.tecnologias.slice(0, 5).map((t: any) => (
                                <span
                                  key={t.id_tecnologia}
                                  style={{
                                    background: "var(--color-surface)",
                                    border: "1px solid var(--color-border)",
                                    color: "var(--color-text-subtle)",
                                    fontSize: 9,
                                    padding: "1px 5px",
                                    borderRadius: 4,
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {t.nombre}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--color-text-subtle)",
                            flexShrink: 0,
                          }}
                        >
                          {o.fecha_publicacion
                            ? new Date(o.fecha_publicacion).toLocaleDateString(
                                "es-ES",
                              )
                            : ""}
                        </p>
                        <Btn
                          variant="primary"
                          small
                          onClick={() => setValidarOferta(o)}
                        >
                          <IconEye /> Revisar
                        </Btn>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ USUARIOS ══ */}
            {activeTab === "usuarios" && (
              <div style={{ animation: "fadeUp 0.22s ease" }}>
                <SectionHeader
                  title="Usuarios registrados"
                  subtitle={`${usuarios.length} usuarios sin admins`}
                  action={
                    <SearchInput
                      value={searchUsuario}
                      onChange={setSearchUsuario}
                      placeholder="Buscar usuario…"
                    />
                  }
                />
                {loadingUsuarios ? (
                  <Spinner />
                ) : (
                  <Table
                    headers={["Usuario", "Rol", "Fecha registro", "Acción"]}
                    empty={
                      usuariosFiltrados.length === 0
                        ? "No se encontraron usuarios."
                        : undefined
                    }
                  >
                    {usuariosFiltrados.map((u, i) => (
                      <TR
                        key={u.id}
                        last={i === usuariosFiltrados.length - 1}
                        cells={[
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 9,
                            }}
                          >
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                background: "var(--color-surface-elevated)",
                                border: "1px solid var(--color-border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                overflow: "hidden",
                                fontSize: 11,
                                fontWeight: 700,
                                color: "var(--color-text-subtle)",
                              }}
                            >
                              {u.avatar_url ? (
                                <img
                                  src={u.avatar_url}
                                  alt=""
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                (u.nombre || u.email || "?")[0]?.toUpperCase()
                              )}
                            </div>
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontWeight: 700,
                                  color: "var(--color-text)",
                                  fontSize: 11,
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {u.nombre || "Sin nombre"}
                              </p>
                              <p
                                style={{
                                  margin: "1px 0 0",
                                  color: "var(--color-text-subtle)",
                                  fontSize: 10,
                                }}
                              >
                                {u.email}
                              </p>
                            </div>
                          </div>,
                          <RolBadge rol={u.rol} />,
                          <span
                            style={{
                              color: "var(--color-text-subtle)",
                              fontSize: 10,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {u.created_at
                              ? new Date(u.created_at).toLocaleDateString(
                                  "es-ES",
                                )
                              : "—"}
                          </span>,
                          <Btn
                            variant={
                              u.rol === "bloqueado" ? "success" : "danger"
                            }
                            small
                            onClick={() => handleToggleBlock(u.id, u.rol)}
                          >
                            {u.rol === "bloqueado" ? "Desbloquear" : "Bloquear"}
                          </Btn>,
                        ]}
                      />
                    ))}
                  </Table>
                )}
              </div>
            )}

            {/* ══ ADMINISTRADORES ══ */}
            {activeTab === "admins" && (
              <div style={{ animation: "fadeUp 0.22s ease" }}>
                <SectionHeader
                  title="Administradores"
                  subtitle="Usuarios con acceso total a la plataforma."
                  action={
                    <Btn
                      variant="primary"
                      onClick={() => setInviteModal(true)}
                      small
                    >
                      <IconPlus /> Invitar admin
                    </Btn>
                  }
                />
                {loadingAdmins ? (
                  <Spinner />
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {admins.map((a) => {
                      const isMe = a.id === user?.id;
                      return (
                        <div
                          key={a.id}
                          style={{
                            background: isMe
                              ? "rgba(192,255,114,0.04)"
                              : "var(--color-surface-strong)",
                            border: `1px solid ${isMe ? "rgba(192,255,114,0.2)" : "var(--color-border)"}`,
                            borderRadius: 12,
                            padding: "14px 18px",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              background: "rgba(192,255,114,0.08)",
                              border: "1px solid rgba(192,255,114,0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              fontSize: 13,
                              fontWeight: 700,
                              color: "var(--color-brand)",
                              overflow: "hidden",
                            }}
                          >
                            {a.avatar_url ? (
                              <img
                                src={a.avatar_url}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              (a.nombre || a.email || "A")[0]?.toUpperCase()
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "var(--color-text)",
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {a.nombre || "Sin nombre"}
                              </p>
                              {isMe && (
                                <span
                                  style={{
                                    fontSize: 9,
                                    background: "rgba(192,255,114,0.12)",
                                    color: "var(--color-brand)",
                                    border: "1px solid rgba(192,255,114,0.25)",
                                    borderRadius: 20,
                                    padding: "1px 7px",
                                    fontWeight: 700,
                                  }}
                                >
                                  Tú
                                </span>
                              )}
                            </div>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 10,
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {a.email}
                            </p>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <RolBadge rol="admin" />
                            <p
                              style={{
                                margin: "4px 0 0",
                                fontSize: 10,
                                color: "var(--color-text-subtle)",
                              }}
                            >
                              Desde{" "}
                              {a.created_at
                                ? new Date(a.created_at).toLocaleDateString(
                                    "es-ES",
                                    { month: "short", year: "numeric" },
                                  )
                                : "—"}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add admin button */}
                    <button
                      onClick={() => setInviteModal(true)}
                      style={{
                        background: "var(--color-surface)",
                        border: "1px dashed var(--color-border)",
                        borderRadius: 12,
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        cursor: "pointer",
                        transition: "all 0.14s",
                        width: "100%",
                        marginTop: 2,
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "rgba(192,255,114,0.3)";
                        el.style.background = "rgba(192,255,114,0.02)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "var(--color-border)";
                        el.style.background = "var(--color-surface)";
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: "var(--color-surface-elevated)",
                          border: "1px solid var(--color-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "var(--color-text-subtle)",
                        }}
                      >
                        <IconPlus />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          Añadir nuevo administrador
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 10,
                            color: "var(--color-text-subtle)",
                          }}
                        >
                          Enlace de invitación seguro · caduca en 48 h
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Modales ── */}
        {inviteModal && (
          <InviteModal
            user={user}
            onClose={() => setInviteModal(false)}
            entityType="admin"
            inviteRoute="/admin/registro"
            expiresInHours={48}
            title="Invitar administrador"
            description="Genera un enlace de invitación para que otra persona cree su cuenta de administrador."
            warningText="Los administradores tienen acceso total a la plataforma. Comparte este enlace solo con personas de confianza."
            roleLabel="administrador"
            inviterName="el equipo de administración"
          />
        )}
        {validarOferta && (
          <ValidarOfertaModal
            oferta={validarOferta}
            onClose={() => setValidarOferta(null)}
            onSaved={() => {
              cargarOfertas();
              cargarStats();
            }}
          />
        )}
      </>
    </MainLayout>
  );
}
