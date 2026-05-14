// ─── components/ofertas/CardOffer.jsx ────────────────────────────────────
import { useState } from "react";

// ── Tipo meta usando colores semánticos coherentes con el sistema ─────────
export const TIPO_META = {
  practicas: {
    label: "Prácticas",
    accent: "#63b3ed",
    strip: "linear-gradient(90deg, rgba(99,179,237,0.7), transparent)",
    badgeBg: "rgba(99,179,237,0.08)",
    badgeBorder: "rgba(99,179,237,0.22)",
    badgeColor: "#63b3ed",
  },
  practicas_contratacion: {
    label: "Prácticas + contratación",
    accent: "#68d391",
    strip: "linear-gradient(90deg, rgba(104,211,145,0.7), transparent)",
    badgeBg: "rgba(104,211,145,0.08)",
    badgeBorder: "rgba(104,211,145,0.22)",
    badgeColor: "#68d391",
  },
  empleo_junior: {
    label: "Empleo junior",
    accent: "#9f7aea",
    strip: "linear-gradient(90deg, rgba(159,122,234,0.7), transparent)",
    badgeBg: "rgba(159,122,234,0.08)",
    badgeBorder: "rgba(159,122,234,0.22)",
    badgeColor: "#9f7aea",
  },
};

// ── Badge genérico usando variables CSS ───────────────────────────────────
export function Badge({
  children,
  variant = "default",
  icon,
  style: extraStyle,
}) {
  const variants = {
    default: {
      background: "var(--color-surface-elevated)",
      border: "1px solid var(--color-border-strong)",
      color: "var(--color-text-muted)",
    },
    brand: {
      background: "rgba(192,255,114,0.08)",
      border: "1px solid rgba(192,255,114,0.2)",
      color: "var(--color-brand)",
    },
    success: {
      background: "rgba(104,211,145,0.08)",
      border: "1px solid rgba(104,211,145,0.2)",
      color: "#68d391",
    },
    warning: {
      background: "rgba(246,173,85,0.08)",
      border: "1px solid rgba(246,173,85,0.2)",
      color: "#f6ad55",
    },
    danger: {
      background: "rgba(252,129,129,0.08)",
      border: "1px solid rgba(252,129,129,0.2)",
      color: "#fc8181",
    },
    muted: {
      background: "var(--color-surface-elevated)",
      border: "1px solid var(--color-border)",
      color: "var(--color-text-subtle)",
    },
  };

  const s = variants[variant] ?? variants.default;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        ...s,
        ...extraStyle,
      }}
    >
      {icon && <span style={{ opacity: 0.85, display: "flex" }}>{icon}</span>}
      {children}
    </span>
  );
}

// ── Icono SVG inline (para independencia de /icons.svg) ───────────────────
const ICONS = {
  building: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-4 0v2" />
    </svg>
  ),
  pin: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  clock: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  users: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  calendar: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  globe: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  handshake: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  send: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
    </svg>
  ),
  x: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  edit: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  ),
  check: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  euro: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
};

function Icon({ id, size = 12 }) {
  return (
    <span
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      {ICONS[id]}
    </span>
  );
}

// ── Avatar empresa ─────────────────────────────────────────────────────────
function CompanyAvatar({ src, name }) {
  const [err, setErr] = useState(false);
  const initials = (name ?? "E")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          objectFit: "cover",
          border: "1px solid var(--color-border-strong)",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "rgba(192,255,114,0.07)",
        border: "1px solid rgba(192,255,114,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "Syne, sans-serif",
        fontWeight: 800,
        fontSize: 14,
        color: "var(--color-brand)",
      }}
    >
      {initials}
    </div>
  );
}

// ── Botón de acción pequeño ────────────────────────────────────────────────
function ActionBtn({ children, onClick, variant = "default", icon }) {
  const base = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: "8px 10px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "Plus Jakarta Sans, sans-serif",
    cursor: "pointer",
    transition: "all 0.15s ease",
    border: "none",
    outline: "none",
  };

  const variants = {
    default: {
      background: "var(--color-surface-elevated)",
      border: "1px solid var(--color-border-strong)",
      color: "var(--color-text-muted)",
      "--hover-bg": "var(--color-surface-strong)",
      "--hover-color": "var(--color-text)",
    },
    brand: {
      background: "rgba(192,255,114,0.08)",
      border: "1px solid rgba(192,255,114,0.2)",
      color: "var(--color-brand)",
      "--hover-bg": "rgba(192,255,114,0.15)",
    },
    danger: {
      background: "rgba(252,129,129,0.06)",
      border: "1px solid rgba(252,129,129,0.15)",
      color: "rgba(252,129,129,0.7)",
      "--hover-bg": "rgba(252,129,129,0.12)",
      "--hover-color": "#fc8181",
    },
    success: {
      background: "rgba(104,211,145,0.07)",
      border: "1px solid rgba(104,211,145,0.18)",
      color: "#68d391",
      "--hover-bg": "rgba(104,211,145,0.14)",
    },
  };

  const [hovered, setHovered] = useState(false);
  const v = variants[variant] ?? variants.default;

  return (
    <button
      onClick={onClick}
      style={{
        ...base,
        background: hovered ? v["--hover-bg"] || v.background : v.background,
        border: v.border,
        color: hovered ? v["--hover-color"] || v.color : v.color,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon && <Icon id={icon} size={11} />}
      {children}
    </button>
  );
}

// ── Fila de metadata ──────────────────────────────────────────────────────
function MetaRow({ icon, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: "var(--color-text-muted)",
        fontSize: 11,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          width: 12,
          height: 12,
          flexShrink: 0,
          color: "var(--color-text-subtle)",
        }}
      >
        {ICONS[icon]}
      </span>
      <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
        {children}
      </span>
    </div>
  );
}

// ── Card principal ────────────────────────────────────────────────────────
export default function OfertaCard({
  oferta,
  isEmpresa = false,
  isEstudiante = false,
  isTutorCentro = false,
  yaPostulado = false,
  onVerDetalle,
  onVerCandidatos,
  onEdit,
  onDelete,
  onPostular,
  onRetirar,
  onRecomendar,
  onCerrar,
}) {
  const meta = TIPO_META[oferta.tipo_oferta] ?? {
    label: "Oferta",
    accent: "var(--color-text-muted)",
    strip: "linear-gradient(90deg, var(--color-border-strong), transparent)",
    badgeBg: "var(--color-surface-elevated)",
    badgeBorder: "var(--color-border-strong)",
    badgeColor: "var(--color-text-muted)",
  };

  const empresa = oferta.empresa_nombre ?? "Empresa";
  const tecnologias = oferta.tecnologias ?? [];
  const [cardHovered, setCardHovered] = useState(false);

  return (
    <article
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
      style={{
        position: "relative",
        background: "var(--color-surface-strong)",
        border: `1px solid ${cardHovered ? "var(--color-border-strong)" : "var(--color-border)"}`,
        borderRadius: 18,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
        transform: cardHovered ? "translateY(-2px)" : "none",
        boxShadow: cardHovered
          ? "0 12px 40px rgba(3,8,15,0.5), 0 0 0 1px rgba(192,255,114,0.04)"
          : "0 2px 8px rgba(3,8,15,0.2)",
      }}
    >
      {/* Franja de color superior */}
      <div style={{ height: 3, background: meta.strip, flexShrink: 0 }} />

      <div
        style={{
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          flex: 1,
        }}
      >
        {/* ── Cabecera: avatar + título + estado ── */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <CompanyAvatar src={oferta.empresa_avatar} name={empresa} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <button
              onClick={() => onVerDetalle?.(oferta)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <h3
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  color: cardHovered
                    ? "var(--color-brand)"
                    : "var(--color-text)",
                  lineHeight: 1.25,
                  margin: 0,
                  transition: "color 0.15s",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {oferta.titulo}
              </h3>
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 4,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  width: 12,
                  height: 12,
                  color: "var(--color-text-subtle)",
                }}
              >
                {ICONS.building}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {empresa}
              </span>
            </div>
          </div>

          {/* Badge estado empresa */}
          {isEmpresa && oferta.estado && (
            <div style={{ flexShrink: 0 }}>
              {oferta.estado === "activa" && (
                <Badge variant="success">Activa</Badge>
              )}
              {oferta.estado === "pendiente" && (
                <Badge variant="warning">Revisión</Badge>
              )}
              {oferta.estado === "rechazada" && (
                <Badge variant="danger">Rechazada</Badge>
              )}
              {oferta.estado === "cerrada" && (
                <Badge variant="muted">Cerrada</Badge>
              )}
            </div>
          )}

          {/* Badge postulado */}
          {isEstudiante && yaPostulado && (
            <div style={{ flexShrink: 0 }}>
              <Badge variant="brand" icon={<Icon id="check" size={10} />}>
                Postulado
              </Badge>
            </div>
          )}
        </div>

        {/* ── Badges tipo + modalidad + contrato ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {/* Tipo oferta */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 9px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              background: meta.badgeBg,
              border: `1px solid ${meta.badgeBorder}`,
              color: meta.badgeColor,
            }}
          >
            {meta.label}
          </span>

          {oferta.modalidad && (
            <Badge
              icon={
                <Icon
                  id={oferta.modalidad === "Presencial" ? "building" : "globe"}
                  size={10}
                />
              }
            >
              {oferta.modalidad}
            </Badge>
          )}

          {oferta.opcion_contrato && (
            <Badge variant="success" icon={<Icon id="handshake" size={10} />}>
              Opción contrato
            </Badge>
          )}

          {/* Salario destacado */}
          {oferta.salario_mensual ? (
            <Badge variant="brand" icon={<Icon id="euro" size={10} />}>
              {oferta.salario_mensual} €/mes
            </Badge>
          ) : (
            <Badge variant="muted">No remunerado</Badge>
          )}
        </div>

        {/* ── Descripción ── */}
        {oferta.descripcion && (
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.65,
              color: "var(--color-text-muted)",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {oferta.descripcion}
          </p>
        )}

        {/* ── Tecnologías ── */}
        {tecnologias.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {tecnologias.slice(0, 5).map((t) => (
              <span
                key={t.id_tecnologia ?? t}
                style={{
                  background: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border-strong)",
                  color: "var(--color-text-secondary)",
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontFamily: "monospace",
                  letterSpacing: "0.01em",
                }}
              >
                {t.nombre ?? t}
              </span>
            ))}
            {tecnologias.length > 5 && (
              <span
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-subtle)",
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 6,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                +{tecnologias.length - 5}
              </span>
            )}
          </div>
        )}

        {/* ── Metadata grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px 12px",
            paddingTop: 12,
            borderTop: "1px solid var(--color-border)",
            marginTop: "auto",
          }}
        >
          {oferta.ubicacion && <MetaRow icon="pin">{oferta.ubicacion}</MetaRow>}
          {oferta.duracion_semanas && (
            <MetaRow icon="clock">{oferta.duracion_semanas} semanas</MetaRow>
          )}
          {oferta.horas_semanales && (
            <MetaRow icon="clock">{oferta.horas_semanales} h/semana</MetaRow>
          )}
          {oferta.num_plazas_restantes != null && (
            <MetaRow icon="users">
              {oferta.num_plazas_restantes} plaza
              {oferta.num_plazas_restantes !== 1 ? "s" : ""} libres
            </MetaRow>
          )}
          {oferta.fecha_fin_solicitud && (
            <MetaRow icon="calendar">
              Cierre{" "}
              {new Date(oferta.fecha_fin_solicitud).toLocaleDateString(
                "es-ES",
                {
                  day: "numeric",
                  month: "short",
                },
              )}
            </MetaRow>
          )}
          {oferta.fecha_inicio && (
            <MetaRow icon="calendar">
              Inicio{" "}
              {new Date(oferta.fecha_inicio).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
              })}
            </MetaRow>
          )}
        </div>
      </div>

      {/* ── Footer: botones de acción ── */}
      <div
        style={{
          padding: "0 20px 18px",
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {/* Ver detalle — siempre visible */}
        <ActionBtn
          onClick={() => onVerDetalle?.(oferta)}
          variant="default"
          icon="building"
        >
          Ver detalle
        </ActionBtn>

        {/* ── Estudiante ── */}
        {isEstudiante &&
          !isEmpresa &&
          (yaPostulado ? (
            <ActionBtn
              onClick={() => onRetirar?.(oferta)}
              variant="danger"
              icon="x"
            >
              Retirar
            </ActionBtn>
          ) : (
            <ActionBtn
              onClick={() => onPostular?.(oferta)}
              variant="brand"
              icon="send"
            >
              Postularme
            </ActionBtn>
          ))}

        {/* ── Tutor de centro ── */}
        {isTutorCentro && onRecomendar && (
          <ActionBtn
            onClick={(e) => {
              e?.stopPropagation();
              onRecomendar(oferta);
            }}
            variant="brand"
            icon="send"
          >
            Recomendar
          </ActionBtn>
        )}

        {/* ── Empresa ── */}
        {isEmpresa && (
          <>
            <ActionBtn
              onClick={() => onVerCandidatos?.(oferta)}
              variant="success"
              icon="users"
            >
              Candidatos
            </ActionBtn>
            <ActionBtn
              onClick={() => onEdit?.(oferta)}
              variant="default"
              icon="edit"
            >
              Editar
            </ActionBtn>
            <ActionBtn
              onClick={() => onDelete?.(oferta.id_oferta)}
              variant="danger"
              icon="trash"
            >
              Eliminar
            </ActionBtn>
          </>
        )}
      </div>
    </article>
  );
}
