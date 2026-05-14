import { useEffect } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

const TIPO_META = {
  practicas: {
    label: "Prácticas",
    color: "#63b3ed",
    bg: "rgba(99,179,237,0.08)",
    border: "rgba(99,179,237,0.2)",
  },
  practicas_contratacion: {
    label: "Prácticas + contratación",
    color: "#68d391",
    bg: "rgba(104,211,145,0.08)",
    border: "rgba(104,211,145,0.2)",
  },
  empleo_junior: {
    label: "Empleo junior",
    color: "#9f7aea",
    bg: "rgba(159,122,234,0.08)",
    border: "rgba(159,122,234,0.2)",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Íconos SVG inline ────────────────────────────────────────────────────────

const SVG = {
  clock: (
    <svg
      width="13"
      height="13"
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
  sun: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  users: (
    <svg
      width="13"
      height="13"
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
  euro: (
    <svg
      width="13"
      height="13"
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
  calendar: (
    <svg
      width="13"
      height="13"
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
  alert: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  pin: (
    <svg
      width="13"
      height="13"
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
  check: (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  building: (
    <svg
      width="20"
      height="20"
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
  close: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  globe: (
    <svg
      width="13"
      height="13"
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
  home: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  send: (
    <svg
      width="15"
      height="15"
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
};

// ─── Pill badge ───────────────────────────────────────────────────────────────

function Pill({ children, color, bg, border }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 11px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.03em",
        color,
        background: bg,
        border: `1px solid ${border}`,
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      {children}
    </span>
  );
}

// ─── Tarjeta de stat ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent = false }) {
  return (
    <div
      style={{
        background: accent
          ? "rgba(192,255,114,0.04)"
          : "var(--color-surface-elevated)",
        border: `1px solid ${accent ? "rgba(192,255,114,0.15)" : "var(--color-border-strong)"}`,
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          color: accent ? "var(--color-brand)" : "var(--color-text-muted)",
        }}
      >
        {icon}
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          {label}
        </span>
      </div>
      <p
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: accent ? "var(--color-brand)" : "var(--color-text)",
          fontFamily: "Syne, sans-serif",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Sección con título ────────────────────────────────────────────────────────

function Section({ title, icon, children }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 12,
          color: "var(--color-text-subtle)",
        }}
      >
        {icon}
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── Fila de fecha ────────────────────────────────────────────────────────────

function DateRow({ label, value, isDeadline = false }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "11px 16px",
        borderRadius: 10,
        background: isDeadline
          ? "rgba(246,173,85,0.05)"
          : "var(--color-surface-elevated)",
        border: `1px solid ${isDeadline ? "rgba(246,173,85,0.18)" : "var(--color-border-strong)"}`,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: "var(--color-text-muted)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: isDeadline ? "#f6ad55" : "var(--color-text)",
          fontFamily: "Syne, sans-serif",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Bloque de texto con fondo ────────────────────────────────────────────────

function TextBlock({ children, variant = "default" }) {
  const styles = {
    default: {
      background: "var(--color-surface-elevated)",
      border: "1px solid var(--color-border-strong)",
    },
    brand: {
      background: "rgba(192,255,114,0.03)",
      border: "1px solid rgba(192,255,114,0.1)",
    },
  };
  return (
    <div
      style={{
        borderRadius: 12,
        padding: "16px 18px",
        ...styles[variant],
      }}
    >
      <p
        style={{
          fontSize: 13.5,
          lineHeight: 1.8,
          color: "var(--color-text-secondary)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          whiteSpace: "pre-line",
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: 1, background: "var(--color-border)" }} />;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function OfferDetailsModal({
  oferta,
  onClose,
  onPostular,
  yaPostulado,
  isEstudiante,
}) {
  const meta = TIPO_META[oferta.tipo_oferta] ?? {
    label: "Oferta",
    color: "var(--color-text-muted)",
    bg: "var(--color-surface)",
    border: "var(--color-border)",
  };
  const tecnologias = oferta.tecnologias ?? [];

  // Cerrar con ESC
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Icono de modalidad
  const modalidadIcon = {
    Presencial: SVG.building,
    Remoto: SVG.globe,
    Híbrido: SVG.home,
  };

  // Stats grid — solo las que tienen valor
  const stats = [
    oferta.duracion_semanas && {
      icon: SVG.clock,
      label: "Duración",
      value: `${oferta.duracion_semanas} semanas`,
    },
    oferta.horas_semanales && {
      icon: SVG.sun,
      label: "Horas / semana",
      value: `${oferta.horas_semanales} h`,
    },
    oferta.num_plazas_restantes != null && {
      icon: SVG.users,
      label: "Plazas libres",
      value: `${oferta.num_plazas_restantes} de ${oferta.num_plazas ?? "?"}`,
    },
    {
      icon: SVG.euro,
      label: "Remuneración",
      value: oferta.salario_mensual
        ? `${oferta.salario_mensual} €/mes`
        : "No remunerado",
      accent: !!oferta.salario_mensual,
    },
  ].filter(Boolean);

  return (
    <>
      {/* Fondo */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(3,8,15,0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          animation: "modal-bg 0.18s ease forwards",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 51,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 16px",
          pointerEvents: "none",
        }}
      >
        <div
          role="dialog"
          aria-modal
          aria-label={oferta.titulo}
          style={{
            width: "100%",
            maxWidth: 720,
            background: "var(--color-surface-strong)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: 22,
            boxShadow:
              "0 50px 120px rgba(3,8,15,0.75), 0 0 0 1px rgba(192,255,114,0.04)",
            pointerEvents: "all",
            animation: "modal-in 0.22s cubic-bezier(0.16,1,0.3,1) forwards",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Franja de color */}
          <div
            style={{
              height: 3,
              background: `linear-gradient(90deg, ${meta.color}, transparent)`,
              flexShrink: 0,
            }}
          />

          {/* ── Header sticky ── */}
          <div
            style={{
              padding: "20px 28px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              flexShrink: 0,
              background: "var(--color-surface-strong)",
            }}
          >
            {/* Avatar empresa */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 15,
                flexShrink: 0,
                background: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {oferta.empresa_avatar ? (
                <img
                  src={oferta.empresa_avatar}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ color: "var(--color-brand)" }}>
                  {SVG.building}
                </span>
              )}
            </div>

            {/* Título y empresa */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: "1.3rem",
                  color: "var(--color-text)",
                  margin: "0 0 3px",
                  lineHeight: 1.2,
                }}
              >
                {oferta.titulo}
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: "0 0 12px",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                {oferta.empresa_nombre ?? "Empresa"}
              </p>

              {/* Pills row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {/* Tipo */}
                <Pill color={meta.color} bg={meta.bg} border={meta.border}>
                  {meta.label}
                </Pill>

                {/* Modalidad */}
                {oferta.modalidad && (
                  <Pill
                    color="var(--color-text-secondary)"
                    bg="var(--color-surface-elevated)"
                    border="var(--color-border-strong)"
                  >
                    {modalidadIcon[oferta.modalidad]}
                    {oferta.modalidad}
                  </Pill>
                )}

                {/* Ubicación */}
                {oferta.ubicacion && (
                  <Pill
                    color="var(--color-text-secondary)"
                    bg="var(--color-surface-elevated)"
                    border="var(--color-border-strong)"
                  >
                    {SVG.pin}
                    {oferta.ubicacion}
                  </Pill>
                )}

                {/* Opción contrato */}
                {oferta.opcion_contrato && (
                  <Pill
                    color="#68d391"
                    bg="rgba(104,211,145,0.08)"
                    border="rgba(104,211,145,0.22)"
                  >
                    {SVG.check}
                    Opción de contratación
                  </Pill>
                )}

                {/* Salario / no remunerado */}
                {oferta.salario_mensual ? (
                  <Pill
                    color="var(--color-brand)"
                    bg="rgba(192,255,114,0.08)"
                    border="rgba(192,255,114,0.2)"
                  >
                    {oferta.salario_mensual} €/mes
                  </Pill>
                ) : (
                  <Pill
                    color="var(--color-text-subtle)"
                    bg="var(--color-surface-elevated)"
                    border="var(--color-border)"
                  >
                    No remunerado
                  </Pill>
                )}

                {/* Estado (si está disponible) */}
                {oferta.estado && oferta.estado !== "activa" && (
                  <Pill
                    color={
                      oferta.estado === "pendiente"
                        ? "#f6ad55"
                        : "var(--color-text-muted)"
                    }
                    bg={
                      oferta.estado === "pendiente"
                        ? "rgba(246,173,85,0.08)"
                        : "var(--color-surface-elevated)"
                    }
                    border={
                      oferta.estado === "pendiente"
                        ? "rgba(246,173,85,0.2)"
                        : "var(--color-border-strong)"
                    }
                  >
                    {oferta.estado === "pendiente"
                      ? "En revisión"
                      : oferta.estado}
                  </Pill>
                )}
              </div>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flexShrink: 0,
                background: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border-strong)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-text)";
                e.currentTarget.style.borderColor = "var(--color-brand)";
                e.currentTarget.style.background =
                  "var(--color-surface-strong)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-muted)";
                e.currentTarget.style.borderColor =
                  "var(--color-border-strong)";
                e.currentTarget.style.background =
                  "var(--color-surface-elevated)";
              }}
            >
              {SVG.close}
            </button>
          </div>

          {/* ── Cuerpo scrollable ── */}
          <div
            style={{
              overflowY: "auto",
              flex: 1,
              padding: "26px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 26,
            }}
          >
            {/* Stats grid */}
            {stats.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
                  gap: 10,
                }}
              >
                {stats.map((s) => (
                  <StatCard
                    key={s.label}
                    icon={s.icon}
                    label={s.label}
                    value={s.value}
                    accent={s.accent}
                  />
                ))}
              </div>
            )}

            <Divider />

            {/* Descripción */}
            {oferta.descripcion && (
              <Section title="Descripción del puesto" icon={SVG.building}>
                <TextBlock>{oferta.descripcion}</TextBlock>
              </Section>
            )}

            {/* Tecnologías */}
            {tecnologias.length > 0 && (
              <Section title="Tecnologías requeridas" icon={SVG.check}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {tecnologias.map((t) => (
                    <span
                      key={t.id_tecnologia}
                      style={{
                        padding: "6px 13px",
                        borderRadius: 8,
                        background: "rgba(192,255,114,0.06)",
                        border: "1px solid rgba(192,255,114,0.18)",
                        color: "var(--color-brand)",
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                      }}
                    >
                      {t.nombre}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Requisitos adicionales */}
            {oferta.requisitos_adicionales && (
              <Section title="Requisitos adicionales" icon={SVG.alert}>
                <TextBlock>{oferta.requisitos_adicionales}</TextBlock>
              </Section>
            )}

            {/* Beneficios */}
            {oferta.beneficios && (
              <Section title="Beneficios ofrecidos" icon={SVG.check}>
                <TextBlock variant="brand">{oferta.beneficios}</TextBlock>
              </Section>
            )}

            {/* Detalles extra — num_plazas total, horas semanales */}
            {(oferta.num_plazas ||
              oferta.horas_semanales ||
              oferta.duracion_semanas) && (
              <>
                <Divider />
                <Section title="Condiciones de la posición" icon={SVG.users}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {oferta.num_plazas && (
                      <div
                        style={{
                          background: "var(--color-surface-elevated)",
                          border: "1px solid var(--color-border-strong)",
                          borderRadius: 10,
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                            fontFamily: "Plus Jakarta Sans, sans-serif",
                          }}
                        >
                          Plazas totales
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--color-text)",
                            fontFamily: "Syne, sans-serif",
                          }}
                        >
                          {oferta.num_plazas}
                        </span>
                      </div>
                    )}
                    {oferta.num_plazas_restantes != null && (
                      <div
                        style={{
                          background: "var(--color-surface-elevated)",
                          border: "1px solid var(--color-border-strong)",
                          borderRadius: 10,
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                            fontFamily: "Plus Jakarta Sans, sans-serif",
                          }}
                        >
                          Plazas disponibles
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--color-text)",
                            fontFamily: "Syne, sans-serif",
                          }}
                        >
                          {oferta.num_plazas_restantes}
                        </span>
                      </div>
                    )}
                    {oferta.duracion_semanas && (
                      <div
                        style={{
                          background: "var(--color-surface-elevated)",
                          border: "1px solid var(--color-border-strong)",
                          borderRadius: 10,
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                            fontFamily: "Plus Jakarta Sans, sans-serif",
                          }}
                        >
                          Duración
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--color-text)",
                            fontFamily: "Syne, sans-serif",
                          }}
                        >
                          {oferta.duracion_semanas} sem.
                        </span>
                      </div>
                    )}
                    {oferta.horas_semanales && (
                      <div
                        style={{
                          background: "var(--color-surface-elevated)",
                          border: "1px solid var(--color-border-strong)",
                          borderRadius: 10,
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                            fontFamily: "Plus Jakarta Sans, sans-serif",
                          }}
                        >
                          Horas / semana
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--color-text)",
                            fontFamily: "Syne, sans-serif",
                          }}
                        >
                          {oferta.horas_semanales} h
                        </span>
                      </div>
                    )}
                  </div>
                </Section>
              </>
            )}

            {/* Fechas clave */}
            {(oferta.fecha_inicio || oferta.fecha_fin_solicitud) && (
              <>
                <Divider />
                <Section title="Fechas clave" icon={SVG.calendar}>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {oferta.fecha_inicio && (
                      <DateRow
                        label="Inicio de la práctica"
                        value={formatDate(oferta.fecha_inicio)}
                      />
                    )}
                    {oferta.fecha_fin_solicitud && (
                      <DateRow
                        label="Cierre de solicitudes"
                        value={formatDate(oferta.fecha_fin_solicitud)}
                        isDeadline
                      />
                    )}
                  </div>
                </Section>
              </>
            )}
          </div>

          {/* ── Footer CTA ── */}
          {isEstudiante && (
            <div
              style={{
                padding: "18px 28px",
                borderTop: "1px solid var(--color-border)",
                flexShrink: 0,
                background: "var(--color-surface-strong)",
              }}
            >
              {yaPostulado ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "14px",
                    borderRadius: 12,
                    background: "rgba(192,255,114,0.06)",
                    border: "1px solid rgba(192,255,114,0.18)",
                  }}
                >
                  <span
                    style={{ color: "var(--color-brand)", display: "flex" }}
                  >
                    {SVG.check}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--color-brand)",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Ya te has postulado a esta oferta
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => onPostular?.(oferta)}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 9,
                    padding: "14px",
                    fontSize: 14,
                    fontWeight: 700,
                    borderRadius: 12,
                  }}
                >
                  {SVG.send}
                  Postularme a esta oferta
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modal-bg { from { opacity:0 } to { opacity:1 } }
        @keyframes modal-in {
          from { opacity:0; transform:scale(0.96) translateY(14px) }
          to   { opacity:1; transform:scale(1)    translateY(0)    }
        }
      `}</style>
    </>
  );
}
