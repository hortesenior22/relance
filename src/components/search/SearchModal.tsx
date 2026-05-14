import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role =
  | "administrador"
  | "estudiante"
  | "empresa"
  | "centro_educativo"
  | "tutor_centro"
  | "tutor_empresa";

type EntityType = "empresa" | "centro_educativo" | "estudiante" | "oferta";

interface SearchResult {
  id: string;
  type: EntityType;
  name: string;
  subtitle: string;
  avatarUrl?: string;
  href: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: Role;
}

// ─── RBAC Config ──────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<Role, EntityType[]> = {
  administrador: ["empresa", "centro_educativo", "estudiante", "oferta"],
  empresa: ["centro_educativo", "estudiante"],
  centro_educativo: ["empresa", "oferta"],
  tutor_empresa: ["estudiante", "centro_educativo"],
  tutor_centro: ["empresa", "oferta"],
  estudiante: ["empresa", "centro_educativo", "oferta"],
};

const ENTITY_LABELS: Record<EntityType, string> = {
  empresa: "Empresa",
  centro_educativo: "Centro educativo",
  estudiante: "Estudiante",
  oferta: "Oferta",
};

const ENTITY_ICONS: Record<EntityType, JSX.Element> = {
  empresa: (
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
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-4 0v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  centro_educativo: (
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
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  estudiante: (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  oferta: (
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
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
};

// ─── Mock recent / popular (replace with real persistence) ────────────────────

const RECENT_SEARCHES = [
  "Accenture",
  "IES Ramiro de Maeztu",
  "Prácticas marketing",
];
const POPULAR_SEARCHES = [
  "Empresas tecnología",
  "Centros Madrid",
  "Ofertas verano 2025",
];

// ─── Debounce hook ────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── API call (replace with your real endpoint) ───────────────────────────────

async function fetchResults(
  query: string,
  allowedTypes: EntityType[],
): Promise<SearchResult[]> {
  // Example endpoint:
  // GET /api/search?q=accenture&types=empresa,estudiante
  const params = new URLSearchParams({
    q: query,
    types: allowedTypes.join(","),
  });
  const res = await fetch(`/api/search?${params}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

// ─── Mock results for UI demo (remove when backend is ready) ──────────────────

function getMockResults(query: string, allowed: EntityType[]): SearchResult[] {
  const pool: SearchResult[] = [
    {
      id: "1",
      type: "empresa",
      name: "Accenture Spain",
      subtitle: "Consultoría · Madrid",
      href: "/empresas/accenture",
    },
    {
      id: "2",
      type: "empresa",
      name: "Indra Sistemas",
      subtitle: "Tecnología · Alcobendas",
      href: "/empresas/indra",
    },
    {
      id: "3",
      type: "centro_educativo",
      name: "IES Ramiro de Maeztu",
      subtitle: "FP Dual · Madrid",
      href: "/centros/ramiro",
    },
    {
      id: "4",
      type: "centro_educativo",
      name: "CIFP Canarias",
      subtitle: "FP · Las Palmas",
      href: "/centros/cifp-canarias",
    },
    {
      id: "5",
      type: "estudiante",
      name: "Laura Martínez",
      subtitle: "DAM · 2º curso",
      href: "/estudiantes/laura",
    },
    {
      id: "6",
      type: "estudiante",
      name: "Carlos Pérez",
      subtitle: "ASIR · 1º curso",
      href: "/estudiantes/carlos",
    },
    {
      id: "7",
      type: "oferta",
      name: "Prácticas Full Stack",
      subtitle: "Accenture · Madrid",
      href: "/ofertas/1",
    },
    {
      id: "8",
      type: "oferta",
      name: "Prácticas Marketing Digital",
      subtitle: "Telefónica · Remoto",
      href: "/ofertas/2",
    },
  ];
  return pool.filter(
    (r) =>
      allowed.includes(r.type) &&
      (r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase())),
  );
}

// ─── Avatar initials fallback ─────────────────────────────────────────────────

function Avatar({ result }: { result: SearchResult }) {
  const initials = result.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  if (result.avatarUrl) {
    return (
      <img
        src={result.avatarUrl}
        alt={result.name}
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          objectFit: "cover",
          flexShrink: 0,
          border: "1px solid var(--color-border-strong)",
        }}
      />
    );
  }

  const bg: Record<EntityType, string> = {
    empresa: "rgba(192,255,114,0.12)",
    centro_educativo: "rgba(99,179,237,0.12)",
    estudiante: "rgba(246,173,85,0.12)",
    oferta: "rgba(159,122,234,0.12)",
  };
  const fg: Record<EntityType, string> = {
    empresa: "#c0ff72",
    centro_educativo: "#63b3ed",
    estudiante: "#f6ad55",
    oferta: "#9f7aea",
  };

  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        flexShrink: 0,
        background: bg[result.type],
        border: `1px solid ${fg[result.type]}22`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        color: fg[result.type],
        fontFamily: "Syne, sans-serif",
      }}
    >
      {initials || "?"}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: EntityType }) {
  const colors: Record<EntityType, { bg: string; text: string }> = {
    empresa: { bg: "rgba(192,255,114,0.08)", text: "#c0ff72" },
    centro_educativo: { bg: "rgba(99,179,237,0.08)", text: "#63b3ed" },
    estudiante: { bg: "rgba(246,173,85,0.08)", text: "#f6ad55" },
    oferta: { bg: "rgba(159,122,234,0.08)", text: "#9f7aea" },
  };
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "2px 7px",
        borderRadius: 4,
        background: colors[type].bg,
        color: colors[type].text,
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      {ENTITY_LABELS[type]}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SearchModal({
  isOpen,
  onClose,
  userRole,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 220);
  const allowedTypes = ROLE_PERMISSIONS[userRole] ?? [];

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // CTRL+K to open (consumed by parent, but also handled here)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) onClose(); // parent controls open; this just prevents default
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Fetch on debounced query
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Swap getMockResults for fetchResults in production:
    // fetchResults(debouncedQuery, allowedTypes)
    Promise.resolve(getMockResults(debouncedQuery, allowedTypes))
      .then((r) => {
        setResults(r);
        setActiveIndex(-1);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        const r = results[activeIndex];
        if (r) {
          window.location.href = r.href;
          onClose();
        }
      }
    },
    [results, activeIndex, onClose],
  );

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(
        `[data-index="${activeIndex}"]`,
      ) as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Group results by type
  const grouped = results.reduce<Partial<Record<EntityType, SearchResult[]>>>(
    (acc, r) => {
      (acc[r.type] ??= []).push(r);
      return acc;
    },
    {},
  );

  const isEmpty = !query.trim();
  const hasResults = results.length > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(2,6,14,0.82)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "overlayIn 0.18s ease forwards",
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscador global"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 51,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "12vh",
          paddingLeft: 16,
          paddingRight: 16,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 620,
            background: "var(--color-surface-strong)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: 16,
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(192,255,114,0.04)",
            overflow: "hidden",
            pointerEvents: "all",
            animation: "modalIn 0.2s cubic-bezier(0.16,1,0.3,1) forwards",
            maxHeight: "72vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search input row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              borderBottom: `1px solid var(--color-border)`,
            }}
          >
            {/* Search icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar empresas, centros, ofertas…"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--color-text)",
                fontSize: 16,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 500,
              }}
            />

            {loading && (
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "2px solid var(--color-border-strong)",
                  borderTopColor: "var(--color-brand)",
                  animation: "spin 0.7s linear infinite",
                  flexShrink: 0,
                }}
              />
            )}

            {/* ESC badge */}
            <kbd
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: 6,
                border: "1px solid var(--color-border-strong)",
                background: "var(--color-surface-elevated)",
                color: "var(--color-text-muted)",
                fontSize: 11,
                fontFamily: "Plus Jakarta Sans, sans-serif",
                cursor: "pointer",
                flexShrink: 0,
              }}
              onClick={onClose}
              title="Cerrar"
            >
              ESC
            </kbd>
          </div>

          {/* Body */}
          <div ref={listRef} style={{ overflowY: "auto", flex: 1 }}>
            {/* Empty state: recents + popular */}
            {isEmpty && (
              <div style={{ padding: "8px 0 12px" }}>
                <Section title="Recientes">
                  {RECENT_SEARCHES.map((s) => (
                    <SuggestionRow
                      key={s}
                      label={s}
                      icon={<HistoryIcon />}
                      onClick={() => setQuery(s)}
                    />
                  ))}
                </Section>
                <Section title="Populares">
                  {POPULAR_SEARCHES.map((s) => (
                    <SuggestionRow
                      key={s}
                      label={s}
                      icon={<TrendIcon />}
                      onClick={() => setQuery(s)}
                    />
                  ))}
                </Section>

                {/* Role scope hint */}
                <div
                  style={{
                    margin: "4px 18px 8px",
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(192,255,114,0.04)",
                    border: "1px solid rgba(192,255,114,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c0ff72"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Puedes buscar:{" "}
                    <span style={{ color: "var(--color-brand)" }}>
                      {allowedTypes.map((t) => ENTITY_LABELS[t]).join(", ")}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Results */}
            {!isEmpty && hasResults && (
              <div style={{ padding: "8px 0 12px" }}>
                {(
                  Object.entries(grouped) as [EntityType, SearchResult[]][]
                ).map(([type, items]) => {
                  // compute flat index offset
                  const typeOrder = allowedTypes;
                  const offset = typeOrder
                    .slice(0, typeOrder.indexOf(type))
                    .reduce((acc, t) => acc + (grouped[t]?.length ?? 0), 0);

                  return (
                    <Section
                      key={type}
                      title={ENTITY_LABELS[type]}
                      icon={ENTITY_ICONS[type]}
                    >
                      {items.map((r, i) => (
                        <ResultRow
                          key={r.id}
                          result={r}
                          index={offset + i}
                          active={activeIndex === offset + i}
                          onHover={() => setActiveIndex(offset + i)}
                          onClick={() => {
                            window.location.href = r.href;
                            onClose();
                          }}
                        />
                      ))}
                    </Section>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {!isEmpty && !hasResults && !loading && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 20px",
                  gap: 10,
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-subtle)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <span
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: 14,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  Sin resultados para{" "}
                  <strong style={{ color: "var(--color-text)" }}>
                    "{query}"
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "10px 18px",
              borderTop: `1px solid var(--color-border)`,
            }}
          >
            {[
              { keys: ["↑", "↓"], label: "navegar" },
              { keys: ["↵"], label: "abrir" },
              { keys: ["ESC"], label: "cerrar" },
            ].map(({ keys, label }) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                {keys.map((k) => (
                  <kbd
                    key={k}
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                      border: "1px solid var(--color-border-strong)",
                      background: "var(--color-surface-elevated)",
                      color: "var(--color-text-muted)",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    {k}
                  </kbd>
                ))}
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-subtle)",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes overlayIn { from { opacity:0 } to { opacity:1 } }
        @keyframes modalIn {
          from { opacity:0; transform:scale(0.97) translateY(-10px) }
          to   { opacity:1; transform:scale(1)    translateY(0)     }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: JSX.Element;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 18px 4px",
          color: "var(--color-text-subtle)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
        {title}
      </div>
      {children}
    </div>
  );
}

function ResultRow({
  result,
  index,
  active,
  onHover,
  onClick,
}: {
  result: SearchResult;
  index: number;
  active: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  return (
    <a
      href={result.href}
      data-index={index}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseEnter={onHover}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 18px",
        textDecoration: "none",
        background: active ? "rgba(192,255,114,0.06)" : "transparent",
        borderLeft: active
          ? "2px solid var(--color-brand)"
          : "2px solid transparent",
        transition: "background 0.1s, border-color 0.1s",
        cursor: "pointer",
      }}
    >
      <Avatar result={result} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: active ? "var(--color-text)" : "var(--color-text-secondary)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {result.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-muted)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {result.subtitle}
        </div>
      </div>
      <TypeBadge type={result.type} />
      {active && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      )}
    </a>
  );
}

function SuggestionRow({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: JSX.Element;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 18px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        color: "var(--color-text-secondary)",
        transition: "background 0.1s",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.03)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ color: "var(--color-text-subtle)", flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ fontSize: 14 }}>{label}</span>
    </button>
  );
}

function HistoryIcon() {
  return (
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
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-5" />
    </svg>
  );
}

function TrendIcon() {
  return (
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
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
