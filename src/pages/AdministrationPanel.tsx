import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import MainLayout from "../components/layout/MainLayout";
import InviteModal from "../components/InviteModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        style={{
          width: 28,
          height: 28,
          border: "2px solid rgba(255,255,255,0.08)",
          borderTopColor: "rgba(255,255,255,0.5)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}

const ROL_COLOR: Record<string, string> = {
  estudiante: "#60a5fa",
  empresa: "#a78bfa",
  centro_educativo: "#f59e0b",
  tutor_empresa: "#34d399",
  tutor_centro: "#34d399",
  admin: "#C0FF72",
  bloqueado: "#f87171",
};

const ROL_LABEL: Record<string, string> = {
  estudiante: "Estudiante",
  empresa: "Empresa",
  centro_educativo: "Centro",
  tutor_empresa: "Tutor empresa",
  tutor_centro: "Tutor centro",
  admin: "Admin",
  bloqueado: "Bloqueado",
};

function RolBadge({ rol }: { rol: string }) {
  const color = ROL_COLOR[rol] ?? "#6b7280";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        color,
        fontWeight: 600,
        background: `${color}14`,
        border: `1px solid ${color}30`,
        borderRadius: 20,
        padding: "2px 9px",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {ROL_LABEL[rol] ?? rol}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  const r = Number(rating) || 0;
  return (
    <span style={{ color: "#f59e0b", fontSize: 12, letterSpacing: 1 }}>
      {"★".repeat(Math.round(r))}
      {"☆".repeat(5 - Math.round(r))}
      <span style={{ color: "#6b7280", marginLeft: 5, fontSize: 11 }}>
        {r.toFixed(1)}
      </span>
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  suffix = "",
  accent = "#C0FF72",
}: {
  label: string;
  value: number | string;
  sub?: string;
  suffix?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <p
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#4b5563",
          fontWeight: 700,
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: accent,
          margin: 0,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        {suffix}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>{sub}</p>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
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
        marginBottom: 20,
        gap: 12,
      }}
    >
      <div>
        <h2
          style={{ fontSize: 17, fontWeight: 700, color: "#f9fafb", margin: 0 }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Search Input ─────────────────────────────────────────────────────────────
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
    <div style={{ position: "relative", maxWidth: 280 }}>
      <svg
        style={{
          position: "absolute",
          left: 11,
          top: "50%",
          transform: "translateY(-50%)",
          width: 14,
          height: 14,
          color: "#4b5563",
          pointerEvents: "none",
        }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          paddingLeft: 32,
          paddingRight: 12,
          paddingTop: 8,
          paddingBottom: 8,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          fontSize: 12,
          color: "#d1d5db",
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
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  padding: "11px 16px",
                  textAlign: "left",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#4b5563",
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
    </div>
  );
}

function TR({ cells, last }: { cells: React.ReactNode[]; last?: boolean }) {
  return (
    <tr
      style={{
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.02)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "transparent")
      }
    >
      {cells.map((c, i) => (
        <td
          key={i}
          style={{
            padding: "11px 16px",
            color: "#d1d5db",
            verticalAlign: "middle",
          }}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}

// ─── Btn ─────────────────────────────────────────────────────────────────────
function Btn({
  onClick,
  children,
  variant = "default",
  disabled = false,
  small = false,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "default" | "primary" | "danger" | "success" | "ghost";
  disabled?: boolean;
  small?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#d1d5db",
    },
    primary: {
      background: "rgba(192,255,114,0.1)",
      border: "1px solid rgba(192,255,114,0.25)",
      color: "#C0FF72",
    },
    danger: {
      background: "rgba(248,113,113,0.08)",
      border: "1px solid rgba(248,113,113,0.2)",
      color: "#f87171",
    },
    success: {
      background: "rgba(52,211,153,0.08)",
      border: "1px solid rgba(52,211,153,0.2)",
      color: "#34d399",
    },
    ghost: {
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.07)",
      color: "#6b7280",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        borderRadius: 10,
        padding: small ? "5px 12px" : "8px 16px",
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.15s",
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

// ─── OfferField ───────────────────────────────────────────────────────────────
function OfferField({ label, value }: { label: string; value?: any }) {
  const empty = !value || (Array.isArray(value) && value.length === 0);
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          color: "#4b5563",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 700,
          margin: "0 0 4px",
        }}
      >
        {label}
      </p>
      {empty ? (
        <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>—</p>
      ) : Array.isArray(value) ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {value.map((v: any, i: number) => (
            <span
              key={i}
              style={{
                background: "rgba(192,255,114,0.08)",
                border: "1px solid rgba(192,255,114,0.2)",
                color: "#C0FF72",
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 6,
                fontFamily: "monospace",
              }}
            >
              {v.nombre ?? v}
            </span>
          ))}
        </div>
      ) : (
        <p
          style={{ fontSize: 12, color: "#d1d5db", margin: 0, lineHeight: 1.6 }}
        >
          {value}
        </p>
      )}
    </div>
  );
}

// ─── Modal: Validar Oferta ────────────────────────────────────────────────────
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

  const tipo_map: Record<string, string> = {
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
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#080a0f",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          width: "100%",
          maxWidth: 640,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header modal */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
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
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#f59e0b",
                fontWeight: 700,
                margin: "0 0 4px",
              }}
            >
              Pendiente de revisión
            </p>
            <h2
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: "#f9fafb",
              }}
            >
              {oferta.titulo}
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>
              {oferta.empresa_nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#4b5563",
              cursor: "pointer",
              padding: 4,
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        {/* Contenido scrollable */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Info general */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px 24px",
            }}
          >
            <OfferField
              label="Tipo de oferta"
              value={tipo_map[oferta.tipo_oferta] ?? oferta.tipo_oferta}
            />
            <OfferField label="Modalidad" value={oferta.modalidad} />
            <OfferField label="Ubicación" value={oferta.ubicacion} />
            <OfferField
              label="Fecha publicación"
              value={
                oferta.fecha_publicacion
                  ? new Date(oferta.fecha_publicacion).toLocaleDateString(
                      "es-ES",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
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
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
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

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 16,
            }}
          >
            <OfferField label="Descripción" value={oferta.descripcion} />
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 16,
            }}
          >
            <OfferField
              label="Requisitos"
              value={oferta.requisitos ?? oferta.requisitos_adicionales}
            />
          </div>
          {oferta.tecnologias?.length > 0 && (
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: 16,
              }}
            >
              <OfferField label="Tecnologías" value={oferta.tecnologias} />
            </div>
          )}
          {oferta.beneficios && (
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: 16,
              }}
            >
              <OfferField label="Beneficios" value={oferta.beneficios} />
            </div>
          )}
        </div>

        {/* Footer modal */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "16px 24px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Selector acción */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <button
              onClick={() => setAction("activa")}
              style={{
                padding: "10px 0",
                borderRadius: 12,
                border: `1px solid ${action === "activa" ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.08)"}`,
                background:
                  action === "activa"
                    ? "rgba(52,211,153,0.12)"
                    : "rgba(255,255,255,0.03)",
                color: action === "activa" ? "#34d399" : "#6b7280",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Aprobar oferta
            </button>
            <button
              onClick={() => setAction("rechazada")}
              style={{
                padding: "10px 0",
                borderRadius: 12,
                border: `1px solid ${action === "rechazada" ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.08)"}`,
                background:
                  action === "rechazada"
                    ? "rgba(248,113,113,0.1)"
                    : "rgba(255,255,255,0.03)",
                color: action === "rechazada" ? "#f87171" : "#6b7280",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Rechazar
            </button>
          </div>

          {/* Motivo rechazo */}
          {action === "rechazada" && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Motivo del rechazo <span style={{ color: "#f87171" }}>*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value.slice(0, 300))}
                rows={3}
                placeholder="Explica brevemente por qué se rechaza esta oferta..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  color: "#d1d5db",
                  fontSize: 12,
                  padding: "10px 12px",
                  fontFamily: "inherit",
                  resize: "none",
                  outline: "none",
                }}
              />
              <p
                style={{
                  fontSize: 10,
                  color: "#4b5563",
                  textAlign: "right",
                  margin: "3px 0 0",
                }}
              >
                {motivo.length}/300
              </p>
            </div>
          )}

          {/* Botones confirmar */}
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
                padding: "10px 0",
                borderRadius: 10,
                border: `1px solid ${
                  action === "activa"
                    ? "rgba(52,211,153,0.3)"
                    : action === "rechazada"
                      ? "rgba(248,113,113,0.3)"
                      : "rgba(255,255,255,0.08)"
                }`,
                background:
                  action === "activa"
                    ? "rgba(52,211,153,0.1)"
                    : action === "rechazada"
                      ? "rgba(248,113,113,0.1)"
                      : "rgba(255,255,255,0.03)",
                color:
                  action === "activa"
                    ? "#34d399"
                    : action === "rechazada"
                      ? "#f87171"
                      : "#4b5563",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "inherit",
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
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {saving ? (
                <div
                  style={{
                    width: 14,
                    height: 14,
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdministrationPanel() {
  const { user, avatarUrl } = useAuth();

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? "Admin";
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0]?.toUpperCase())
    .join("");

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
    const { data: ofertasData, error: ofertasError } = await supabase
      .from("oferta")
      .select(
        `id_oferta, titulo, descripcion, modalidad, ubicacion, tipo_oferta,
         salario_mensual, duracion_semanas, horas_semanales,
         num_plazas, num_plazas_restantes, beneficios, requisitos_adicionales,
         opcion_contrato, fecha_publicacion, fecha_fin_solicitud,
         estado, id_empresa`,
      )
      .eq("estado", "pendiente")
      .order("fecha_publicacion", { ascending: true });
    if (ofertasError) console.error("[cargarOfertas]:", ofertasError);
    const ofertasRaw = ofertasData ?? [];
    const empresaIds = [
      ...new Set(ofertasRaw.map((o: any) => o.id_empresa).filter(Boolean)),
    ];
    let empresaMap: Record<string, any> = {};
    if (empresaIds.length > 0) {
      const { data: empresasData } = await supabase
        .from("empresa")
        .select("id, nombre, logo_url")
        .in("id", empresaIds);
      empresaMap = (empresasData ?? []).reduce((acc: any, e: any) => {
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
    const { data, error } = await supabase
      .from("usuario")
      .select("id, email, nombre, rol, created_at, avatar_url")
      .not("rol", "eq", "admin")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) console.error("[cargarUsuarios]:", error);
    if (!mountedRef.current) return;
    setUsuarios(data ?? []);
    setLoadingUsuarios(false);
  }, []);

  const cargarAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    const { data, error } = await supabase
      .from("usuario")
      .select("id, email, nombre, created_at, avatar_url")
      .eq("rol", "admin")
      .order("created_at", { ascending: true });
    if (error) console.error("[cargarAdmins]:", error);
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
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
          * { box-sizing: border-box; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          input::placeholder, textarea::placeholder { color: #4b5563; }
          input:focus, textarea:focus { border-color: rgba(255,255,255,0.18) !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.03); }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        `}</style>

        <div
          style={{
            minHeight: "100vh",
            background: "#080a0f",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            color: "#f9fafb",
          }}
        >
          <div
            style={{
              maxWidth: 960,
              margin: "0 auto",
              padding: "40px 24px 60px",
              animation: "fadeUp 0.4s ease",
            }}
          >
            {/* ── Header ── */}
            <div style={{ marginBottom: 36 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#C0FF72",
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "#6b7280",
                    fontWeight: 700,
                  }}
                >
                  Administración
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 26,
                      fontWeight: 800,
                      color: "#f9fafb",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Panel de administración
                  </h1>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    {user?.email ?? "—"}
                  </p>
                </div>
                <Btn variant="primary" onClick={() => setInviteModal(true)}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                  Invitar administrador
                </Btn>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div
              style={{
                display: "flex",
                gap: 2,
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: 4,
                marginBottom: 32,
                overflowX: "auto",
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                    background:
                      activeTab === tab.id
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                    color: activeTab === tab.id ? "#f9fafb" : "#6b7280",
                    boxShadow:
                      activeTab === tab.id
                        ? "0 1px 3px rgba(0,0,0,0.3)"
                        : "none",
                    letterSpacing: "0.01em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  {tab.label}
                  {tab.badge != null && tab.badge > 0 && (
                    <span
                      style={{
                        background: "#f59e0b",
                        color: "#080a0f",
                        fontSize: 10,
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
              ))}
            </div>

            {/* ══ DASHBOARD ══ */}
            {activeTab === "dashboard" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                  animation: "fadeUp 0.3s ease",
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
                          "repeat(auto-fill, minmax(170px, 1fr))",
                        gap: 12,
                      }}
                    >
                      <StatCard
                        label="Estudiantes"
                        value={stats.estudiantes}
                        sub="Registrados"
                        accent="#60a5fa"
                      />
                      <StatCard
                        label="Empresas"
                        value={stats.empresas}
                        sub="Activas"
                        accent="#a78bfa"
                      />
                      <StatCard
                        label="Centros educativos"
                        value={stats.centros}
                        sub="Registrados"
                        accent="#f59e0b"
                      />
                      <StatCard
                        label="Tutores"
                        value={stats.tutores}
                        sub="Empresa y centro"
                        accent="#34d399"
                      />
                      <StatCard
                        label="Ofertas activas"
                        value={stats.ofertas_activas}
                        sub="Publicadas"
                        accent="#C0FF72"
                      />
                      <StatCard
                        label="Pendientes de revisión"
                        value={stats.ofertas_pendientes}
                        sub={
                          stats.ofertas_pendientes > 0
                            ? "Requieren atención"
                            : "Todo al día"
                        }
                        accent="#f59e0b"
                      />
                    </div>

                    {/* Accesos rápidos */}
                    <div
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 16,
                        overflow: "hidden",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          color: "#4b5563",
                          fontWeight: 700,
                          padding: "16px 20px",
                          margin: 0,
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        Acciones rápidas
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(240px, 1fr))",
                        }}
                      >
                        {[
                          {
                            onClick: () => setActiveTab("ofertas"),
                            color: "#f59e0b",
                            label: "Validar ofertas",
                            sub: `${stats.ofertas_pendientes} pendientes`,
                            icon: (
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
                            ),
                          },
                          {
                            onClick: () => setActiveTab("usuarios"),
                            color: "#60a5fa",
                            label: "Gestionar usuarios",
                            sub: `${stats.estudiantes + stats.empresas + stats.centros + stats.tutores} registrados`,
                            icon: (
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
                            ),
                          },
                          {
                            onClick: () => setInviteModal(true),
                            color: "#C0FF72",
                            label: "Invitar administrador",
                            sub: "Enlace seguro · caduca en 48 h",
                            icon: (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                              </svg>
                            ),
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
                                  ? "1px solid rgba(255,255,255,0.05)"
                                  : "none",
                              padding: "18px 20px",
                              display: "flex",
                              alignItems: "center",
                              gap: 14,
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "background 0.15s",
                              width: "100%",
                            }}
                            onMouseEnter={(e) =>
                              ((
                                e.currentTarget as HTMLElement
                              ).style.background = "rgba(255,255,255,0.02)")
                            }
                            onMouseLeave={(e) =>
                              ((
                                e.currentTarget as HTMLElement
                              ).style.background = "transparent")
                            }
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: `${item.color}14`,
                                border: `1px solid ${item.color}30`,
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
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#f9fafb",
                                }}
                              >
                                {item.label}
                              </p>
                              <p
                                style={{
                                  margin: "2px 0 0",
                                  fontSize: 11,
                                  color: "#6b7280",
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
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <SectionHeader
                  title="Ofertas pendientes"
                  subtitle="Revisa y aprueba o rechaza cada oferta antes de publicarla."
                  action={
                    <Btn variant="ghost" onClick={cargarOfertas} small>
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
                      Actualizar
                    </Btn>
                  }
                />

                {loadingOfertas ? (
                  <Spinner />
                ) : ofertasPendientes.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px 0",
                      border: "1px dashed rgba(255,255,255,0.08)",
                      borderRadius: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "rgba(52,211,153,0.08)",
                        border: "1px solid rgba(52,211,153,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p style={{ color: "#f9fafb", fontWeight: 600, margin: 0 }}>
                      ¡Todo al día!
                    </p>
                    <p
                      style={{
                        color: "#4b5563",
                        fontSize: 12,
                        margin: "4px 0 0",
                      }}
                    >
                      No hay ofertas pendientes de revisión.
                    </p>
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {ofertasPendientes.map((o) => (
                      <div
                        key={o.id_oferta}
                        style={{
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: 14,
                          padding: "14px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          transition: "border-color 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.borderColor =
                            "rgba(255,255,255,0.14)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.borderColor =
                            "rgba(255,255,255,0.07)")
                        }
                      >
                        {/* Avatar empresa */}
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: "rgba(192,255,114,0.08)",
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
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#C0FF72"
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
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#f9fafb",
                              }}
                            >
                              {o.titulo}
                            </p>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#f59e0b",
                                background: "rgba(245,158,11,0.1)",
                                border: "1px solid rgba(245,158,11,0.25)",
                                borderRadius: 20,
                                padding: "1px 8px",
                              }}
                            >
                              Pendiente
                            </span>
                          </div>
                          <p
                            style={{
                              margin: "3px 0 0",
                              fontSize: 11,
                              color: "#6b7280",
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
                                gap: 4,
                                marginTop: 6,
                              }}
                            >
                              {o.tecnologias.slice(0, 5).map((t: any) => (
                                <span
                                  key={t.id_tecnologia}
                                  style={{
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    color: "#6b7280",
                                    fontSize: 10,
                                    padding: "1px 6px",
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
                            fontSize: 11,
                            color: "#4b5563",
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
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Revisar
                        </Btn>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ USUARIOS ══ */}
            {activeTab === "usuarios" && (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <SectionHeader
                  title="Usuarios registrados"
                  subtitle={`${usuarios.length} usuarios (sin admins)`}
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
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                overflow: "hidden",
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#9ca3af",
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
                                  fontWeight: 600,
                                  color: "#f9fafb",
                                  fontSize: 12,
                                }}
                              >
                                {u.nombre || "Sin nombre"}
                              </p>
                              <p
                                style={{
                                  margin: "1px 0 0",
                                  color: "#6b7280",
                                  fontSize: 11,
                                }}
                              >
                                {u.email}
                              </p>
                            </div>
                          </div>,
                          <RolBadge rol={u.rol} />,
                          <span
                            style={{
                              color: "#6b7280",
                              fontSize: 11,
                              fontFamily: "'DM Mono', monospace",
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
                {!loadingUsuarios && usuariosFiltrados.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "#4b5563",
                      fontSize: 13,
                    }}
                  >
                    No se encontraron usuarios.
                  </div>
                )}
              </div>
            )}

            {/* ══ ADMINISTRADORES ══ */}
            {activeTab === "admins" && (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <SectionHeader
                  title="Administradores"
                  subtitle="Usuarios con acceso total a la plataforma."
                  action={
                    <Btn
                      variant="primary"
                      onClick={() => setInviteModal(true)}
                      small
                    >
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
                      Invitar admin
                    </Btn>
                  }
                />

                {loadingAdmins ? (
                  <Spinner />
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {admins.map((a) => {
                      const isMe = a.id === user?.id;
                      return (
                        <div
                          key={a.id}
                          style={{
                            background: isMe
                              ? "rgba(192,255,114,0.04)"
                              : "rgba(255,255,255,0.025)",
                            border: `1px solid ${isMe ? "rgba(192,255,114,0.2)" : "rgba(255,255,255,0.07)"}`,
                            borderRadius: 14,
                            padding: "16px 20px",
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background: "rgba(192,255,114,0.08)",
                              border: "1px solid rgba(192,255,114,0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#C0FF72",
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
                                gap: 8,
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "#f9fafb",
                                }}
                              >
                                {a.nombre || "Sin nombre"}
                              </p>
                              {isMe && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    background: "rgba(192,255,114,0.12)",
                                    color: "#C0FF72",
                                    border: "1px solid rgba(192,255,114,0.25)",
                                    borderRadius: 20,
                                    padding: "1px 8px",
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
                                fontSize: 11,
                                color: "#6b7280",
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
                                fontSize: 11,
                                color: "#4b5563",
                              }}
                            >
                              Desde{" "}
                              {a.created_at
                                ? new Date(a.created_at).toLocaleDateString(
                                    "es-ES",
                                    {
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "—"}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Botón añadir */}
                    <button
                      onClick={() => setInviteModal(true)}
                      style={{
                        background: "rgba(255,255,255,0.015)",
                        border: "1px dashed rgba(255,255,255,0.08)",
                        borderRadius: 14,
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        width: "100%",
                        marginTop: 4,
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "rgba(192,255,114,0.3)";
                        el.style.background = "rgba(192,255,114,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "rgba(255,255,255,0.08)";
                        el.style.background = "rgba(255,255,255,0.015)";
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6b7280"
                          strokeWidth="2"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#9ca3af",
                          }}
                        >
                          Añadir nuevo administrador
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11,
                            color: "#4b5563",
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
