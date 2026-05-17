import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import MainLayout from "../components/layout/MainLayout";

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        style={{
          width: 28,
          height: 28,
          border: "2px solid var(--color-border-strong)",
          borderTopColor: "var(--color-brand)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}

const ESTADO_EST = {
  en_practicas: {
    label: "En prácticas",
    dot: "var(--color-info)",
    badge: "rgba(96,165,250,0.12)",
    border: "rgba(96,165,250,0.25)",
  },
  contratado: {
    label: "Contratado",
    dot: "var(--color-success)",
    badge: "rgba(74,222,128,0.12)",
    border: "rgba(74,222,128,0.25)",
  },
  buscando: {
    label: "Buscando",
    dot: "var(--color-warning)",
    badge: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.25)",
  },
  pendiente: {
    label: "Pendiente",
    dot: "var(--color-text-subtle)",
    badge: "rgba(53,78,104,0.2)",
    border: "rgba(53,78,104,0.35)",
  },
};

const ESTADO_CAND = {
  aceptada: {
    label: "Aceptada",
    color: "var(--color-success)",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.25)",
  },
  rechazada: {
    label: "Rechazada",
    color: "var(--color-error)",
    bg: "rgba(248,113,113,0.1)",
    border: "rgba(248,113,113,0.25)",
  },
  en_revision: {
    label: "En revisión",
    color: "var(--color-warning)",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.25)",
  },
  pendiente: {
    label: "Pendiente",
    color: "var(--color-text-subtle)",
    bg: "rgba(53,78,104,0.15)",
    border: "rgba(53,78,104,0.3)",
  },
};

const ESTADO_ACUERDO = {
  activo: {
    label: "Activo",
    color: "var(--color-success)",
    bg: "rgba(74,222,128,0.1)",
    border: "rgba(74,222,128,0.25)",
  },
  inactivo: {
    label: "Inactivo",
    color: "var(--color-text-subtle)",
    bg: "rgba(53,78,104,0.15)",
    border: "rgba(53,78,104,0.3)",
  },
  pendiente: {
    label: "Pendiente",
    color: "var(--color-warning)",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.25)",
  },
};

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
function IconBuilding() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h6M9 13h6M9 17h4" />
    </svg>
  );
}
function IconHandshake() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IconDrag() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
      {[0, 4, 8].map((y) => (
        <g key={y}>
          <circle cx="2" cy={y + 3} r="1" fill="currentColor" />
          <circle cx="7" cy={y + 3} r="1" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

function StatusBadge({ estado, map = ESTADO_EST }) {
  const cfg = map[estado] ?? map["pendiente"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10,
        fontWeight: 600,
        color: cfg.dot ?? cfg.color,
        background: cfg.badge ?? cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 20,
        padding: "2px 9px",
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: cfg.dot,
            flexShrink: 0,
          }}
        />
      )}
      {cfg.label}
    </span>
  );
}

function Stars({ rating }) {
  const r = Number(rating) || 0;
  return (
    <span style={{ fontSize: 11, letterSpacing: 1 }}>
      <span style={{ color: "var(--color-brand)" }}>
        {"★".repeat(Math.round(r))}
      </span>
      <span style={{ color: "var(--color-text-subtle)" }}>
        {"☆".repeat(5 - Math.round(r))}
      </span>
      <span
        style={{
          color: "var(--color-text-muted)",
          marginLeft: 5,
          fontSize: 10,
        }}
      >
        {r.toFixed(1)}
      </span>
    </span>
  );
}

function Avatar({ name, size = 32 }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "#c0ff72",
    "#60a5fa",
    "#f59e0b",
    "#a78bfa",
    "#34d399",
    "#f87171",
  ];
  const color = colors[name?.charCodeAt(0) % colors.length] ?? "#c0ff72";
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

function StatCard({ label, value, sub, suffix = "", accent = false }) {
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

function SectionHeader({ title, subtitle, action }) {
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

function SearchInput({ value, onChange, placeholder }) {
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
        className="input-field"
        style={{
          paddingLeft: 30,
          paddingRight: 10,
          paddingTop: 7,
          paddingBottom: 7,
          fontSize: 11,
        }}
      />
    </div>
  );
}

function Table({ headers, children, empty }) {
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

function TR({ cells, last }) {
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

function AcuerdosTable({ acuerdos, loading }) {
  const [search, setSearch] = useState("");
  const filtrados = acuerdos.filter((a) => {
    const q = search.toLowerCase();
    return (
      !q ||
      a.empresa.toLowerCase().includes(q) ||
      (a.sector ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <SectionHeader
        title="Acuerdos de colaboración"
        subtitle={`${acuerdos.length} empresas con acuerdo de prácticas`}
        action={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar empresa…"
          />
        }
      />
      {loading ? (
        <Spinner />
      ) : (
        <Table
          headers={[
            "Empresa",
            "Sector",
            "Plazas ofertadas",
            "Alumnos activos",
            "Vigencia",
            "Estado",
          ]}
          empty={
            filtrados.length === 0 ? "No se encontraron acuerdos." : undefined
          }
        >
          {filtrados.map((a, i) => (
            <TR
              key={a.id}
              last={i === filtrados.length - 1}
              cells={[
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar name={a.empresa} size={28} />
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
                      {a.empresa}
                    </p>
                    {a.contacto && (
                      <p
                        style={{
                          margin: "1px 0 0",
                          fontSize: 10,
                          color: "var(--color-text-subtle)",
                        }}
                      >
                        {a.contacto}
                      </p>
                    )}
                  </div>
                </div>,
                <span
                  style={{ color: "var(--color-text-muted)", fontSize: 11 }}
                >
                  {a.sector ?? "—"}
                </span>,
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--color-text-muted)",
                    fontSize: 11,
                  }}
                >
                  {a.plazas ?? "—"}
                </span>,
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    color:
                      a.alumnos_activos > 0
                        ? "var(--color-brand)"
                        : "var(--color-text-subtle)",
                    fontSize: 11,
                    fontWeight: a.alumnos_activos > 0 ? 700 : 400,
                  }}
                >
                  {a.alumnos_activos}
                </span>,
                <span
                  style={{ color: "var(--color-text-subtle)", fontSize: 10 }}
                >
                  {a.fecha_inicio && a.fecha_fin
                    ? `${new Date(a.fecha_inicio).toLocaleDateString("es-ES")} – ${new Date(a.fecha_fin).toLocaleDateString("es-ES")}`
                    : a.fecha_inicio
                      ? `Desde ${new Date(a.fecha_inicio).toLocaleDateString("es-ES")}`
                      : "—"}
                </span>,
                <StatusBadge
                  estado={a.estado ?? "activo"}
                  map={ESTADO_ACUERDO}
                />,
              ]}
            />
          ))}
        </Table>
      )}
    </div>
  );
}

function DraggableStudent({ estudiante, fromTutorId, onDragStart, dragging }) {
  const isBeingDragged = dragging?.estudiante?.id === estudiante.id;
  const est = ESTADO_EST[estudiante.estado] ?? ESTADO_EST["pendiente"];
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, estudiante, fromTutorId)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 9px",
        borderRadius: 8,
        background: isBeingDragged
          ? "rgba(192,255,114,0.08)"
          : "var(--color-surface-elevated)",
        border: `1px solid ${isBeingDragged ? "rgba(192,255,114,0.28)" : "var(--color-border-subtle)"}`,
        cursor: "grab",
        opacity: isBeingDragged ? 0.5 : 1,
        transition: "all 0.12s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        if (!isBeingDragged)
          e.currentTarget.style.borderColor = "var(--color-border-strong)";
      }}
      onMouseLeave={(e) => {
        if (!isBeingDragged)
          e.currentTarget.style.borderColor = "var(--color-border-subtle)";
      }}
    >
      <span
        style={{
          color: "var(--color-text-subtle)",
          display: "flex",
          flexShrink: 0,
        }}
      >
        <IconDrag />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 600,
            color: "var(--color-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {estudiante.nombre}
        </p>
        <p
          style={{
            margin: "1px 0 0",
            fontSize: 9,
            color: "var(--color-text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {estudiante.titulacion}
        </p>
      </div>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: est.dot,
          flexShrink: 0,
        }}
      />
    </div>
  );
}

function TutorAssignment({ tutores, estudiantes, idCentro, onUpdate }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const sinTutor = estudiantes.filter((e) => !e.id_tutor);
  const porTutor = tutores.map((t) => ({
    ...t,
    alumnos: estudiantes.filter((e) => e.id_tutor === t.id),
  }));

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDragStart = (e, estudiante, fromTutorId) => {
    setDragging({ estudiante, fromTutorId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e, toTutorId) => {
    e.preventDefault();
    setDragOver(null);
    if (!dragging) return;
    if (dragging.fromTutorId === toTutorId) return;
    setSaving(true);
    try {
      const newVal = toTutorId === "sin_tutor" ? null : toTutorId;
      const { error } = await supabase
        .from("centro_estudiante")
        .update({ id_tutor: newVal })
        .eq("id_centro", idCentro)
        .eq("id_estudiante", dragging.estudiante.id);
      if (error) throw error;
      showToast(`${dragging.estudiante.nombre} reasignado correctamente`);
      onUpdate();
    } catch (err) {
      showToast(err.message ?? "Error al reasignar", false);
    } finally {
      setSaving(false);
      setDragging(null);
    }
  };

  const DropZone = ({ id, label, alumnos, icon }) => (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(id);
      }}
      onDragLeave={() => setDragOver(null)}
      onDrop={(e) => handleDrop(e, id)}
      style={{
        background:
          dragOver === id
            ? "rgba(192,255,114,0.05)"
            : "var(--color-surface-strong)",
        border: `1.5px ${dragOver === id ? "solid rgba(192,255,114,0.35)" : "solid var(--color-border)"}`,
        borderRadius: 12,
        padding: "14px",
        transition: "all 0.15s",
        minHeight: 110,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        {icon}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-text)",
              letterSpacing: "-0.01em",
            }}
          >
            {label}
          </p>
          <p
            style={{
              margin: "1px 0 0",
              fontSize: 10,
              color: "var(--color-text-muted)",
            }}
          >
            {alumnos.length} {alumnos.length === 1 ? "alumno" : "alumnos"}
          </p>
        </div>
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color:
              alumnos.length > 0
                ? "var(--color-brand)"
                : "var(--color-text-subtle)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {alumnos.length}
        </span>
      </div>
      {dragOver === id && (
        <div
          style={{
            border: "1.5px dashed rgba(192,255,114,0.4)",
            borderRadius: 8,
            padding: "8px",
            marginBottom: 6,
            textAlign: "center",
            fontSize: 10,
            color: "var(--color-brand)",
          }}
        >
          Soltar aquí
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {alumnos.map((al) => (
          <DraggableStudent
            key={al.id}
            estudiante={al}
            fromTutorId={id}
            onDragStart={handleDragStart}
            dragging={dragging}
          />
        ))}
        {alumnos.length === 0 && dragOver !== id && (
          <p
            style={{
              fontSize: 10,
              color: "var(--color-text-subtle)",
              textAlign: "center",
              padding: "10px 0",
              margin: 0,
            }}
          >
            Sin alumnos asignados
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 999,
            background: toast.ok
              ? "rgba(74,222,128,0.14)"
              : "rgba(248,113,113,0.14)",
            border: `1px solid ${toast.ok ? "rgba(74,222,128,0.28)" : "rgba(248,113,113,0.28)"}`,
            borderRadius: 10,
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 600,
            color: toast.ok ? "var(--color-success)" : "var(--color-error)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            {toast.ok ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            )}
          </svg>
          {toast.msg}
        </div>
      )}
      {saving && (
        <div
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: 11,
            color: "var(--color-text-secondary)",
            backdropFilter: "blur(12px)",
          }}
        >
          Guardando…
        </div>
      )}
      <p
        style={{
          fontSize: 11,
          color: "var(--color-text-muted)",
          margin: "0 0 14px",
        }}
      >
        Arrastra y suelta los alumnos entre tutores para reasignarlos.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 10,
        }}
      >
        <DropZone
          id="sin_tutor"
          label="Sin tutor asignado"
          alumnos={sinTutor}
          icon={
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--color-surface-elevated)",
                border: "1.5px dashed var(--color-border-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "var(--color-text-subtle)" }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          }
        />
        {porTutor.map((t) => (
          <DropZone
            key={t.id}
            id={t.id}
            label={t.nombre}
            alumnos={t.alumnos}
            icon={<Avatar name={t.nombre} size={32} />}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function CenterEducativePanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("resumen");
  const [searchEst, setSearchEst] = useState("");
  const [searchEmp, setSearchEmp] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAcuerdos, setLoadingAcuerdos] = useState(false);

  const [centro, setCentro] = useState(null);
  const [stats, setStats] = useState({
    estudiantes: 0,
    empresas: 0,
    candidaturas: 0,
    tasa_contrato: 0,
    valoracion_media: 0,
  });
  const [estadosDistribucion, setEstadosDistribucion] = useState([]);
  const [topEmpresas, setTopEmpresas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [candidaturas, setCandidaturas] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [acuerdos, setAcuerdos] = useState([]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const cargarAcuerdos = useCallback(
    async (idCentro, empresasEnriquecidas, alumnosActivosMap) => {
      setLoadingAcuerdos(true);
      try {
        const { data: acuerdosData, error } = await supabase
          .from("centro_empresa_acuerdo")
          .select(
            "id, id_empresa, plazas_acordadas, fecha_inicio, fecha_fin, estado, notas",
          )
          .eq("id_centro", idCentro);

        if (!error && acuerdosData && acuerdosData.length > 0) {
          const empIds = [
            ...new Set(acuerdosData.map((a) => a.id_empresa).filter(Boolean)),
          ];
          let empMap = {};
          if (empIds.length > 0) {
            const { data: empRows } = await supabase
              .from("empresa")
              .select("id, nombre, sector")
              .in("id", empIds);
            (empRows ?? []).forEach((e) => {
              empMap[e.id] = e;
            });
          }
          const enriquecidos = acuerdosData.map((a) => ({
            id: a.id,
            empresa: empMap[a.id_empresa]?.nombre ?? "—",
            sector: empMap[a.id_empresa]?.sector ?? null,
            plazas: a.plazas_acordadas,
            fecha_inicio: a.fecha_inicio,
            fecha_fin: a.fecha_fin,
            estado: a.estado ?? "activo",
            contacto: a.notas ?? null,
            alumnos_activos: alumnosActivosMap[a.id_empresa] ?? 0,
          }));
          if (mountedRef.current) setAcuerdos(enriquecidos);
        } else {
          const derivados = empresasEnriquecidas.map((e) => ({
            id: e.id,
            empresa: e.nombre,
            sector: e.sector ?? null,
            plazas: null,
            fecha_inicio: null,
            fecha_fin: null,
            estado:
              e.alumnos_activos > 0 || e.colaboraciones > 0
                ? "activo"
                : "pendiente",
            contacto: null,
            alumnos_activos: alumnosActivosMap[e.id] ?? 0,
          }));
          if (mountedRef.current) setAcuerdos(derivados);
        }
      } catch {
        const derivados = empresasEnriquecidas.map((e) => ({
          id: e.id,
          empresa: e.nombre,
          sector: e.sector ?? null,
          plazas: null,
          fecha_inicio: null,
          fecha_fin: null,
          estado: e.alumnos_activos > 0 ? "activo" : "pendiente",
          contacto: null,
          alumnos_activos: alumnosActivosMap[e.id] ?? 0,
        }));
        if (mountedRef.current) setAcuerdos(derivados);
      }
      setLoadingAcuerdos(false);
    },
    [],
  );

  const cargarTodo = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // ── Buscar centro: primero por id directo, luego por email ───────────────
    let centroData = null;

    const { data: c1 } = await supabase
      .from("centro_educativo")
      .select("id, nombre, ciudad, provincia, email_contacto, num_alumnos")
      .eq("id", user.id)
      .maybeSingle();

    if (c1) {
      centroData = c1;
    } else {
      const { data: usuarioRow } = await supabase
        .from("usuario")
        .select("email")
        .eq("id", user.id)
        .maybeSingle();

      if (usuarioRow?.email) {
        const { data: c2 } = await supabase
          .from("centro_educativo")
          .select("id, nombre, ciudad, provincia, email_contacto, num_alumnos")
          .eq("email_contacto", usuarioRow.email)
          .maybeSingle();
        centroData = c2 ?? null;
      }
    }

    if (!mountedRef.current) return;
    setCentro(centroData ?? null);

    if (!centroData) {
      console.warn("[centro] No encontrado para user:", user.id);
      setLoading(false);
      return;
    }

    const idCentro = centroData.id;

    // ── Tutores via centro_tutor ─────────────────────────────────────────────
    const { data: ctRows, error: ctErr } = await supabase
      .from("centro_tutor")
      .select(
        "id_tutor, tutor:id_tutor(id, nombre, departamento, telefono, usuario_id)",
      )
      .eq("id_centro", idCentro);
    if (ctErr) console.error("[centro_tutor]:", ctErr);

    const tutoresData = (ctRows ?? []).map((r) => r.tutor).filter(Boolean);

    const tutorUserIds = tutoresData.map((t) => t.usuario_id).filter(Boolean);
    let tutorEmailMap = {};
    if (tutorUserIds.length > 0) {
      const { data: usuariosData } = await supabase
        .from("usuario")
        .select("id, email")
        .in("id", tutorUserIds);
      (usuariosData ?? []).forEach((u) => {
        tutorEmailMap[u.id] = u.email;
      });
    }
    const tutoresEnriquecidos = tutoresData.map((t) => ({
      ...t,
      email: tutorEmailMap[t.usuario_id] ?? "—",
    }));

    // ── Estudiantes ──────────────────────────────────────────────────────────
    const { data: ceRows, error: ceErr } = await supabase
      .from("centro_estudiante")
      .select(
        "id_tutor, estudiante:id_estudiante(id, nombre, apellidos, titulacion)",
      )
      .eq("id_centro", idCentro);
    if (ceErr) console.error("[centro_estudiante]:", ceErr);

    const ceData = ceRows ?? [];
    const estudianteIds = ceData.map((r) => r.estudiante?.id).filter(Boolean);

    let estadoMap = {},
      empresaEstudianteMap = {};
    if (estudianteIds.length > 0) {
      const { data: estadosData } = await supabase
        .from("estudiante_estado")
        .select("id_estudiante, estado, id_empresa")
        .in("id_estudiante", estudianteIds);
      (estadosData ?? []).forEach((r) => {
        estadoMap[r.id_estudiante] = r.estado ?? "pendiente";
        if (r.id_empresa) empresaEstudianteMap[r.id_estudiante] = r.id_empresa;
      });
    }

    const empresaIds = [...new Set(Object.values(empresaEstudianteMap))];
    let empresaNombreMap = {};
    if (empresaIds.length > 0) {
      const { data: empNames } = await supabase
        .from("empresa")
        .select("id, nombre")
        .in("id", empresaIds);
      (empNames ?? []).forEach((e) => {
        empresaNombreMap[e.id] = e.nombre;
      });
    }

    let candidaturasData = [];
    if (estudianteIds.length > 0) {
      const { data: candRows, error: candErr } = await supabase
        .from("candidatura")
        .select(
          "id_candidatura, estado, fecha_envio, id_estudiante, oferta:id_oferta(titulo, id_empresa, empresa:id_empresa(nombre))",
        )
        .in("id_estudiante", estudianteIds)
        .order("fecha_envio", { ascending: false });
      if (candErr) console.error("[candidatura]:", candErr);
      candidaturasData = candRows ?? [];
    }

    const estudianteNombreMap = {};
    ceData.forEach((r) => {
      if (r.estudiante) {
        estudianteNombreMap[r.estudiante.id] =
          [r.estudiante.nombre, r.estudiante.apellidos]
            .filter(Boolean)
            .join(" ") || "—";
      }
    });

    const empresaIdsCand = [
      ...new Set(
        candidaturasData.map((c) => c.oferta?.id_empresa).filter(Boolean),
      ),
    ];
    let empresasColaboradoras = [];
    if (empresaIdsCand.length > 0) {
      const { data: empRows } = await supabase
        .from("empresa")
        .select("id, nombre, sector, logo_url")
        .in("id", empresaIdsCand);
      empresasColaboradoras = empRows ?? [];
    }

    let valoracionMap = {};
    if (empresaIdsCand.length > 0 && estudianteIds.length > 0) {
      const { data: valRows } = await supabase
        .from("valoracion_empresa")
        .select("id_empresa, puntuacion")
        .in("id_empresa", empresaIdsCand)
        .in("id_estudiante", estudianteIds);
      (valRows ?? []).forEach((v) => {
        if (!valoracionMap[v.id_empresa]) valoracionMap[v.id_empresa] = [];
        valoracionMap[v.id_empresa].push(Number(v.puntuacion));
      });
    }

    const colaboracionesMap = {};
    candidaturasData.forEach((c) => {
      const empId = c.oferta?.id_empresa;
      if (!empId) return;
      if (!colaboracionesMap[empId]) colaboracionesMap[empId] = 0;
      if (c.estado === "aceptada") colaboracionesMap[empId]++;
    });

    const alumnosActivosMap = {};
    Object.entries(empresaEstudianteMap).forEach(([_estId, empId]) => {
      alumnosActivosMap[empId] = (alumnosActivosMap[empId] ?? 0) + 1;
    });

    const estudiantesEnriquecidos = ceData.map((r) => {
      const est = r.estudiante ?? {};
      const estado = estadoMap[est.id] ?? "pendiente";
      const idEmp = empresaEstudianteMap[est.id] ?? null;
      const tutor = tutoresEnriquecidos.find((t) => t.id === r.id_tutor);
      return {
        id: est.id,
        nombre: [est.nombre, est.apellidos].filter(Boolean).join(" ") || "—",
        titulacion: est.titulacion ?? "—",
        estado,
        empresa: idEmp ? (empresaNombreMap[idEmp] ?? null) : null,
        tutor: tutor?.nombre ?? "—",
        id_tutor: r.id_tutor ?? null,
        candidaturas: candidaturasData.filter((c) => c.id_estudiante === est.id)
          .length,
      };
    });

    const empresasEnriquecidas = empresasColaboradoras.map((e) => {
      const vals = valoracionMap[e.id] ?? [];
      return {
        ...e,
        alumnos_activos: alumnosActivosMap[e.id] ?? 0,
        valoracion:
          vals.length > 0
            ? parseFloat(
                (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
              )
            : 0,
        colaboraciones: colaboracionesMap[e.id] ?? 0,
      };
    });

    const candidaturasEnriquecidas = candidaturasData.map((c) => ({
      id: c.id_candidatura,
      estudiante: estudianteNombreMap[c.id_estudiante] ?? "—",
      empresa: c.oferta?.empresa?.nombre ?? "—",
      oferta: c.oferta?.titulo ?? "—",
      fecha: c.fecha_envio,
      estado: c.estado ?? "pendiente",
    }));

    const tutoresConAlumnos = tutoresEnriquecidos.map((t) => ({
      ...t,
      lista: estudiantesEnriquecidos.filter((e) => e.id_tutor === t.id),
    }));

    const totalEst = estudiantesEnriquecidos.length;
    const contratados = estudiantesEnriquecidos.filter(
      (e) => e.estado === "contratado",
    ).length;
    const enPracticas = estudiantesEnriquecidos.filter(
      (e) => e.estado === "en_practicas",
    ).length;
    const tasaContrato =
      totalEst > 0 ? Math.round((contratados / totalEst) * 100) : 0;
    const todasVal = Object.values(valoracionMap).flat();
    const valoracionMedia =
      todasVal.length > 0
        ? parseFloat(
            (todasVal.reduce((a, b) => a + b, 0) / todasVal.length).toFixed(1),
          )
        : 0;

    if (!mountedRef.current) return;

    setStats({
      estudiantes: totalEst,
      empresas: empresasEnriquecidas.length,
      candidaturas: candidaturasData.length,
      tasa_contrato: tasaContrato,
      valoracion_media: valoracionMedia,
    });
    setEstadosDistribucion([
      { label: "En prácticas", count: enPracticas, color: "var(--color-info)" },
      {
        label: "Contratados",
        count: contratados,
        color: "var(--color-success)",
      },
      {
        label: "Buscando",
        count: estudiantesEnriquecidos.filter((e) => e.estado === "buscando")
          .length,
        color: "var(--color-warning)",
      },
      {
        label: "Sin actividad",
        count: estudiantesEnriquecidos.filter((e) => e.estado === "pendiente")
          .length,
        color: "var(--color-text-subtle)",
      },
    ]);
    setTopEmpresas(
      [...empresasEnriquecidas].sort(
        (a, b) => b.colaboraciones - a.colaboraciones,
      ),
    );
    setEstudiantes(estudiantesEnriquecidos);
    setEmpresas(empresasEnriquecidas);
    setCandidaturas(candidaturasEnriquecidas);
    setTutores(tutoresConAlumnos);
    setLoading(false);

    await cargarAcuerdos(idCentro, empresasEnriquecidas, alumnosActivosMap);
  }, [user, cargarAcuerdos]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  const estudiantesFiltrados = estudiantes.filter((e) => {
    const q = searchEst.toLowerCase();
    return (
      !q ||
      e.nombre.toLowerCase().includes(q) ||
      (e.empresa ?? "").toLowerCase().includes(q) ||
      e.titulacion.toLowerCase().includes(q)
    );
  });
  const empresasFiltradas = empresas.filter((e) => {
    const q = searchEmp.toLowerCase();
    return (
      !q ||
      e.nombre.toLowerCase().includes(q) ||
      (e.sector ?? "").toLowerCase().includes(q)
    );
  });

  const TABS = [
    { id: "resumen", label: "Resumen", icon: <IconGrid /> },
    { id: "estudiantes", label: "Estudiantes", icon: <IconUsers /> },
    { id: "empresas", label: "Empresas", icon: <IconBuilding /> },
    { id: "acuerdos", label: "Acuerdos", icon: <IconHandshake /> },
    { id: "candidaturas", label: "Candidaturas", icon: <IconChevron /> },
    { id: "tutores", label: "Tutores", icon: <IconUsers /> },
  ];

  return (
    <MainLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: "var(--color-text)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
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
                Centro educativo
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                color: "var(--color-text)",
                letterSpacing: "-0.03em",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              Panel de supervisión
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: "var(--color-text-muted)",
              }}
            >
              {centro
                ? `${centro.nombre}${centro.ciudad ? ` — ${centro.ciudad}` : ""}${centro.provincia ? `, ${centro.provincia}` : ""}`
                : "Cargando centro…"}
            </p>
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
            {TABS.map((tab) => (
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
                  transition: "all 0.15s",
                  letterSpacing: "-0.01em",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background:
                    activeTab === tab.id
                      ? "var(--color-surface-elevated)"
                      : "transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--color-text)"
                      : "var(--color-text-muted)",
                  boxShadow:
                    activeTab === tab.id
                      ? "0 1px 4px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
                      : "none",
                  borderBottom:
                    activeTab === tab.id
                      ? "1px solid rgba(192,255,114,0.18)"
                      : "1px solid transparent",
                }}
              >
                <span style={{ opacity: activeTab === tab.id ? 1 : 0.5 }}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div style={{ animation: "fadeUp 0.22s ease" }}>
              {/* ══ RESUMEN ══ */}
              {activeTab === "resumen" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
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
                      sub="En el centro"
                      accent
                    />
                    <StatCard
                      label="Empresas"
                      value={stats.empresas}
                      sub="Colaboradoras"
                    />
                    <StatCard
                      label="Candidaturas"
                      value={stats.candidaturas}
                      sub="Total enviadas"
                    />
                    <StatCard
                      label="Conversión"
                      value={stats.tasa_contrato}
                      suffix="%"
                      sub="Prácticas → contrato"
                    />
                    <StatCard
                      label="Valoración"
                      value={stats.valoracion_media}
                      suffix=" ★"
                      sub="Media empresas"
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        background: "var(--color-surface-strong)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        padding: "18px 20px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 14px",
                          fontSize: 9,
                          textTransform: "uppercase",
                          letterSpacing: "0.13em",
                          color: "var(--color-text-subtle)",
                          fontWeight: 700,
                        }}
                      >
                        Estado de estudiantes
                      </p>
                      {estadosDistribucion.map((item) => (
                        <div
                          key={item.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 9,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--color-text-muted)",
                              width: 82,
                              flexShrink: 0,
                            }}
                          >
                            {item.label}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 4,
                              background: "var(--color-border)",
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width:
                                  stats.estudiantes > 0
                                    ? `${(item.count / stats.estudiantes) * 100}%`
                                    : "0%",
                                background: item.color,
                                borderRadius: 4,
                                transition:
                                  "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--color-text-muted)",
                              width: 22,
                              textAlign: "right",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        background: "var(--color-surface-strong)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        padding: "18px 20px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 14px",
                          fontSize: 9,
                          textTransform: "uppercase",
                          letterSpacing: "0.13em",
                          color: "var(--color-text-subtle)",
                          fontWeight: 700,
                        }}
                      >
                        Empresas más colaboradoras
                      </p>
                      {topEmpresas.length === 0 ? (
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-subtle)",
                          }}
                        >
                          Sin datos aún.
                        </p>
                      ) : (
                        topEmpresas.slice(0, 5).map((e, i) => (
                          <div
                            key={e.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "8px 0",
                              borderBottom:
                                i < 4
                                  ? "1px solid var(--color-border-subtle)"
                                  : "none",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-subtle)",
                                fontWeight: 700,
                                width: 18,
                                textAlign: "center",
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              #{i + 1}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "var(--color-text)",
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {e.nombre}
                              </p>
                              <p
                                style={{
                                  margin: "1px 0 0",
                                  fontSize: 10,
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                {e.sector ?? "—"}
                              </p>
                            </div>
                            {e.valoracion > 0 && (
                              <Stars rating={e.valoracion} />
                            )}
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-muted)",
                                fontVariantNumeric: "tabular-nums",
                                flexShrink: 0,
                              }}
                            >
                              {e.colaboraciones} col.
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ ESTUDIANTES ══ */}
              {activeTab === "estudiantes" && (
                <div>
                  <SectionHeader
                    title="Estudiantes registrados"
                    subtitle={`${estudiantes.length} alumnos en la plataforma`}
                    action={
                      <SearchInput
                        value={searchEst}
                        onChange={setSearchEst}
                        placeholder="Buscar alumno…"
                      />
                    }
                  />
                  <Table
                    headers={[
                      "Alumno",
                      "Tutor asignado",
                      "Empresa",
                      "Candidaturas",
                      "Estado",
                    ]}
                    empty={
                      estudiantesFiltrados.length === 0
                        ? "No se encontraron alumnos."
                        : undefined
                    }
                  >
                    {estudiantesFiltrados.map((e, i) => (
                      <TR
                        key={e.id}
                        last={i === estudiantesFiltrados.length - 1}
                        cells={[
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
                              {e.nombre}
                            </p>
                            <p
                              style={{
                                margin: "2px 0 0",
                                color: "var(--color-text-subtle)",
                                fontSize: 10,
                              }}
                            >
                              {e.titulacion}
                            </p>
                          </div>,
                          <span
                            style={{
                              color: "var(--color-text-secondary)",
                              fontSize: 11,
                            }}
                          >
                            {e.tutor}
                          </span>,
                          <span
                            style={{
                              color: e.empresa
                                ? "var(--color-text-secondary)"
                                : "var(--color-text-subtle)",
                              fontSize: 11,
                            }}
                          >
                            {e.empresa ?? "—"}
                          </span>,
                          <span
                            style={{
                              fontVariantNumeric: "tabular-nums",
                              color: "var(--color-text-muted)",
                              fontSize: 11,
                            }}
                          >
                            {e.candidaturas}
                          </span>,
                          <StatusBadge estado={e.estado} />,
                        ]}
                      />
                    ))}
                  </Table>
                </div>
              )}

              {/* ══ EMPRESAS ══ */}
              {activeTab === "empresas" && (
                <div>
                  <SectionHeader
                    title="Empresas colaboradoras"
                    subtitle={`${empresas.length} empresas activas`}
                    action={
                      <SearchInput
                        value={searchEmp}
                        onChange={setSearchEmp}
                        placeholder="Buscar empresa…"
                      />
                    }
                  />
                  <Table
                    headers={[
                      "Empresa",
                      "Sector",
                      "Alumnos activos",
                      "Colaboraciones",
                      "Valoración",
                    ]}
                    empty={
                      empresasFiltradas.length === 0
                        ? "No se encontraron empresas."
                        : undefined
                    }
                  >
                    {empresasFiltradas.map((e, i) => (
                      <TR
                        key={e.id}
                        last={i === empresasFiltradas.length - 1}
                        cells={[
                          <span
                            style={{
                              fontWeight: 700,
                              color: "var(--color-text)",
                              fontSize: 11,
                            }}
                          >
                            {e.nombre}
                          </span>,
                          <span
                            style={{
                              color: "var(--color-text-muted)",
                              fontSize: 11,
                            }}
                          >
                            {e.sector ?? "—"}
                          </span>,
                          <span
                            style={{
                              fontVariantNumeric: "tabular-nums",
                              color: "var(--color-text-muted)",
                              fontSize: 11,
                            }}
                          >
                            {e.alumnos_activos}
                          </span>,
                          <span
                            style={{
                              fontVariantNumeric: "tabular-nums",
                              color: "var(--color-text-muted)",
                              fontSize: 11,
                            }}
                          >
                            {e.colaboraciones}
                          </span>,
                          e.valoracion > 0 ? (
                            <Stars rating={e.valoracion} />
                          ) : (
                            <span
                              style={{
                                color: "var(--color-text-subtle)",
                                fontSize: 10,
                              }}
                            >
                              Sin valoraciones
                            </span>
                          ),
                        ]}
                      />
                    ))}
                  </Table>
                </div>
              )}

              {/* ══ ACUERDOS ══ */}
              {activeTab === "acuerdos" && (
                <AcuerdosTable acuerdos={acuerdos} loading={loadingAcuerdos} />
              )}

              {/* ══ CANDIDATURAS ══ */}
              {activeTab === "candidaturas" && (
                <div>
                  <SectionHeader
                    title="Candidaturas enviadas"
                    subtitle={`${candidaturas.length} candidaturas registradas`}
                  />
                  <Table
                    headers={[
                      "Estudiante",
                      "Empresa",
                      "Oferta",
                      "Fecha",
                      "Estado",
                    ]}
                    empty={
                      candidaturas.length === 0
                        ? "No hay candidaturas registradas."
                        : undefined
                    }
                  >
                    {candidaturas.map((c, i) => (
                      <TR
                        key={c.id}
                        last={i === candidaturas.length - 1}
                        cells={[
                          <span
                            style={{
                              fontWeight: 700,
                              color: "var(--color-text)",
                              fontSize: 11,
                            }}
                          >
                            {c.estudiante}
                          </span>,
                          <span
                            style={{
                              color: "var(--color-text-secondary)",
                              fontSize: 11,
                            }}
                          >
                            {c.empresa}
                          </span>,
                          <span
                            style={{
                              color: "var(--color-text-muted)",
                              fontSize: 11,
                              fontStyle: "italic",
                            }}
                          >
                            {c.oferta}
                          </span>,
                          <span
                            style={{
                              color: "var(--color-text-subtle)",
                              fontSize: 10,
                            }}
                          >
                            {c.fecha
                              ? new Date(c.fecha).toLocaleDateString("es-ES")
                              : "—"}
                          </span>,
                          <StatusBadge estado={c.estado} map={ESTADO_CAND} />,
                        ]}
                      />
                    ))}
                  </Table>
                </div>
              )}

              {/* ══ TUTORES ══ */}
              {activeTab === "tutores" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 24 }}
                >
                  <div>
                    <SectionHeader
                      title="Tutores del centro"
                      subtitle={`${tutores.length} tutores activos`}
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: 8,
                      }}
                    >
                      {tutores.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            background: "var(--color-surface-strong)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 12,
                            padding: "16px 18px",
                            transition: "border-color 0.2s",
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
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 9,
                              marginBottom: 10,
                            }}
                          >
                            <Avatar name={t.nombre} size={34} />
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "var(--color-text)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {t.nombre}
                              </p>
                              <p
                                style={{
                                  margin: "1px 0 0",
                                  fontSize: 10,
                                  color: "var(--color-text-muted)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {t.departamento ?? t.email}
                              </p>
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 22,
                                fontWeight: 800,
                                color: "var(--color-brand)",
                                fontVariantNumeric: "tabular-nums",
                                letterSpacing: "-0.03em",
                              }}
                            >
                              {t.lista?.length ?? 0}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--color-text-muted)",
                              }}
                            >
                              alumnos
                            </span>
                          </div>
                        </div>
                      ))}
                      {tutores.length === 0 && (
                        <p
                          style={{
                            color: "var(--color-text-subtle)",
                            fontSize: 12,
                            gridColumn: "1/-1",
                          }}
                        >
                          No hay tutores asignados al centro.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        marginBottom: 14,
                        paddingBottom: 14,
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--color-text)",
                          margin: "0 0 3px",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Asignación de tutores
                      </h2>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                          margin: 0,
                        }}
                      >
                        Arrastra y suelta alumnos entre tutores para
                        reasignarlos
                      </p>
                    </div>
                    <TutorAssignment
                      tutores={tutores}
                      estudiantes={estudiantes}
                      idCentro={centro?.id}
                      onUpdate={cargarTodo}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
