import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import UserMenu from "../auth/UserMenu";
import logoUrl from "../../assets/logo_relance.jpg";
import { supabase } from "../../lib/supabase";

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

type HeaderProps = {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
};

// ─── RBAC ─────────────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<Role, EntityType[]> = {
  administrador: ["empresa", "centro_educativo", "estudiante", "oferta"],
  empresa: ["centro_educativo", "estudiante"],
  centro_educativo: ["empresa", "estudiante", "oferta"],
  tutor_empresa: ["estudiante", "centro_educativo"],
  tutor_centro: ["estudiante", "empresa", "oferta"],
  estudiante: ["empresa", "centro_educativo", "oferta"],
};

const ENTITY_LABELS: Record<EntityType, string> = {
  empresa: "Empresa",
  centro_educativo: "Centro",
  estudiante: "Estudiante",
  oferta: "Oferta",
};

const ENTITY_COLOR: Record<
  EntityType,
  { bg: string; text: string; dot: string }
> = {
  empresa: { bg: "rgba(192,255,114,0.08)", text: "#c0ff72", dot: "#c0ff72" },
  centro_educativo: {
    bg: "rgba(99,179,237,0.08)",
    text: "#63b3ed",
    dot: "#63b3ed",
  },
  estudiante: { bg: "rgba(246,173,85,0.08)", text: "#f6ad55", dot: "#f6ad55" },
  oferta: { bg: "rgba(159,122,234,0.08)", text: "#9f7aea", dot: "#9f7aea" },
};

const RECENT: string[] = [
  "Accenture",
  "IES Ramiro de Maeztu",
  "Prácticas marketing",
];
const POPULAR: string[] = [
  "Empresas tecnología",
  "Centros Madrid",
  "Ofertas 2025",
];

// ─── Búsqueda real contra Supabase ────────────────────────────────────────────

async function searchSupabase(
  q: string,
  allowed: EntityType[],
): Promise<SearchResult[]> {
  const term = q.trim().toLowerCase();
  const searches: Promise<void>[] = [];
  const results: any[] = [];

  if (allowed.includes("empresa")) {
    searches.push(
      (async () => {
        const { data } = await supabase
          .from("empresa")
          .select("id, nombre, sector, ciudad, logo_url")
          .ilike("nombre", `%${term}%`)
          .limit(5);
        (data ?? []).forEach((e) => {
          results.push({
            id: e.id,
            type: "empresa",
            name: e.nombre,
            subtitle: [e.sector, e.ciudad].filter(Boolean).join(" · "),
            avatarUrl: e.logo_url ?? undefined,
            href: `/empresas/${e.id}`,
          });
        });
      })(),
    );
  }

  if (allowed.includes("centro_educativo")) {
    searches.push(
      (async () => {
        const { data } = await supabase
          .from("centro_educativo")
          .select("id, nombre, tipo_centro, ciudad, avatar_url")
          .ilike("nombre", `%${term}%`)
          .limit(5);
        (data ?? []).forEach((c) => {
          results.push({
            id: c.id,
            type: "centro_educativo",
            name: c.nombre,
            subtitle: [c.tipo_centro, c.ciudad].filter(Boolean).join(" · "),
            avatarUrl: c.avatar_url ?? undefined,
            href: `/centros/${c.id}`,
          });
        });
      })(),
    );
  }

  if (allowed.includes("estudiante")) {
    searches.push(
      (async () => {
        const { data } = await supabase
          .from("estudiante")
          .select("id, nombre, apellidos, titulacion, ciudad, avatar_url")
          .or(`nombre.ilike.%${term}%,apellidos.ilike.%${term}%`)
          .limit(5);
        (data ?? []).forEach((s) => {
          results.push({
            id: s.id,
            type: "estudiante",
            name: `${s.nombre ?? ""} ${s.apellidos ?? ""}`.trim(),
            subtitle: [s.titulacion, s.ciudad].filter(Boolean).join(" · "),
            avatarUrl: s.avatar_url ?? undefined,
            href: `/estudiantes/${s.id}`,
          });
        });
      })(),
    );
  }

  if (allowed.includes("oferta")) {
    searches.push(
      (async () => {
        const { data } = await supabase
          .from("oferta")
          .select("id_oferta, titulo, modalidad, ubicacion")
          .ilike("titulo", `%${term}%`)
          .eq("estado", "activa")
          .limit(5);
        (data ?? []).forEach((o) => {
          results.push({
            id: o.id_oferta,
            type: "oferta",
            name: o.titulo,
            subtitle: [o.modalidad, o.ubicacion].filter(Boolean).join(" · "),
            href: `/ofertas/${o.id_oferta}`,
          });
        });
      })(),
    );
  }

  await Promise.all(searches);
  return results;
}

// ─── Debounce ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, ms: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function ResultAvatar({ r }: { r: SearchResult }) {
  const initials = r.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const c = ENTITY_COLOR[r.type];
  if (r.avatarUrl)
    return (
      <img
        src={r.avatarUrl}
        alt={r.name}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          objectFit: "cover",
          flexShrink: 0,
          border: "1px solid var(--color-border-strong)",
        }}
      />
    );
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        flexShrink: 0,
        background: c.bg,
        border: `1px solid ${c.dot}22`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        color: c.text,
        fontFamily: "Syne, sans-serif",
        letterSpacing: "0.02em",
      }}
    >
      {initials || "?"}
    </div>
  );
}

// ─── Search Modal ─────────────────────────────────────────────────────────────

function SearchModal({
  open,
  onClose,
  allowedTypes,
}: {
  open: boolean;
  onClose: () => void;
  allowedTypes: EntityType[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dq = useDebounce(query, 220);

  useScrollLock(open);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
      setQuery("");
      setResults([]);
      setActive(-1);
    }
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    if (!dq.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    searchSupabase(dq, allowedTypes)
      .then((r) => {
        if (!cancelled) {
          setResults(r);
          setActive(-1);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dq, allowedTypes]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        const r = results[activeIdx];
        if (r) {
          window.location.href = r.href;
          onClose();
        }
      }
    },
    [results, activeIdx, onClose],
  );

  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const el = listRef.current.querySelector(
        `[data-idx="${activeIdx}"]`,
      ) as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  const grouped = results.reduce<Partial<Record<EntityType, SearchResult[]>>>(
    (acc, r) => {
      (acc[r.type] ??= []).push(r);
      return acc;
    },
    {},
  );

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(1,3,8,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          animation: "srch-bg 0.15s ease forwards",
        }}
      />
      <div
        role="dialog"
        aria-modal
        aria-label="Buscador global"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "13vh 16px 0",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 620,
            background: "var(--color-surface-strong)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: 20,
            boxShadow:
              "0 48px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(192,255,114,0.07), inset 0 1px 0 rgba(255,255,255,0.04)",
            overflow: "hidden",
            pointerEvents: "all",
            animation: "srch-in 0.22s cubic-bezier(0.16,1,0.3,1) forwards",
            maxHeight: "72vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Input row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "15px 20px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {loading ? (
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  flexShrink: 0,
                  border: "2px solid var(--color-border-strong)",
                  borderTopColor: "var(--color-brand)",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-muted)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            )}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Buscar empresas, centros, estudiantes, ofertas…"
              aria-label="Campo de búsqueda"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--color-text)",
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            />
            <kbd
              onClick={onClose}
              role="button"
              aria-label="Cerrar buscador"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onClose()}
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 6,
                cursor: "pointer",
                border: "1px solid var(--color-border-strong)",
                background: "var(--color-surface-elevated)",
                color: "var(--color-text-muted)",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              ESC
            </kbd>
          </div>

          {/* Results body */}
          <div ref={listRef} style={{ overflowY: "auto", flex: 1 }}>
            {!query.trim() && (
              <div style={{ padding: "6px 0 10px" }}>
                <SRSection label="Recientes">
                  {RECENT.map((s) => (
                    <SRSuggestion
                      key={s}
                      label={s}
                      icon="clock"
                      onClick={() => setQuery(s)}
                    />
                  ))}
                </SRSection>
                <SRSection label="Populares">
                  {POPULAR.map((s) => (
                    <SRSuggestion
                      key={s}
                      label={s}
                      icon="trend"
                      onClick={() => setQuery(s)}
                    />
                  ))}
                </SRSection>
                <div
                  style={{
                    margin: "4px 18px 6px",
                    padding: "9px 13px",
                    borderRadius: 10,
                    background: "rgba(192,255,114,0.04)",
                    border: "1px solid rgba(192,255,114,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
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
                      fontSize: 11.5,
                      color: "var(--color-text-muted)",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Puedes buscar:{" "}
                    <span
                      style={{ color: "var(--color-brand)", fontWeight: 600 }}
                    >
                      {allowedTypes.map((t) => ENTITY_LABELS[t]).join(", ")}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {query.trim() && results.length > 0 && (
              <div style={{ padding: "6px 0 10px" }}>
                {(
                  Object.entries(grouped) as [EntityType, SearchResult[]][]
                ).map(([type, items]) => {
                  const offset = allowedTypes
                    .slice(0, allowedTypes.indexOf(type))
                    .reduce((a, t) => a + (grouped[t]?.length ?? 0), 0);
                  return (
                    <SRSection
                      key={type}
                      label={ENTITY_LABELS[type]}
                      dot={ENTITY_COLOR[type].dot}
                    >
                      {items.map((r, i) => (
                        <SRResult
                          key={r.id}
                          result={r}
                          idx={offset + i}
                          active={activeIdx === offset + i}
                          onHover={() => setActive(offset + i)}
                          onClick={() => {
                            window.location.href = r.href;
                            onClose();
                          }}
                        />
                      ))}
                    </SRSection>
                  );
                })}
              </div>
            )}

            {query.trim() && results.length === 0 && !loading && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "40px 0",
                  gap: 10,
                }}
              >
                <svg
                  width="28"
                  height="28"
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
                    fontSize: 13,
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

          {/* Footer shortcuts */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "9px 18px",
              borderTop: "1px solid var(--color-border)",
              flexWrap: "wrap",
            }}
          >
            {[
              ["↑↓", "navegar"],
              ["↵", "abrir"],
              ["ESC", "cerrar"],
            ].map(([k, l]) => (
              <span
                key={l}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <kbd
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 5,
                    border: "1px solid var(--color-border-strong)",
                    background: "var(--color-surface-elevated)",
                    color: "var(--color-text-muted)",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {k}
                </kbd>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-subtle)",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {l}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes srch-bg { from { opacity:0 } to { opacity:1 } }
        @keyframes srch-in { from { opacity:0; transform:scale(0.96) translateY(-14px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>
    </>
  );
}

// ─── Sub-componentes del modal ────────────────────────────────────────────────

function SRSection({
  label,
  dot,
  children,
}: {
  label: string;
  dot?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 2 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "5px 18px 3px",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "var(--color-text-subtle)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        {dot && (
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: dot,
              flexShrink: 0,
            }}
          />
        )}
        {label}
      </div>
      {children}
    </div>
  );
}

function SRSuggestion({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: "clock" | "trend";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "7px 18px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.03)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ color: "var(--color-text-subtle)", flexShrink: 0 }}>
        {icon === "clock" ? (
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
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-5" />
          </svg>
        ) : (
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
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        )}
      </span>
      <span
        style={{
          fontSize: 13.5,
          color: "var(--color-text-secondary)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function SRResult({
  result,
  idx,
  active,
  onHover,
  onClick,
}: {
  result: SearchResult;
  idx: number;
  active: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  const c = ENTITY_COLOR[result.type];
  return (
    <a
      href={result.href}
      data-idx={idx}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseEnter={onHover}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "7px 18px",
        textDecoration: "none",
        cursor: "pointer",
        background: active ? "rgba(192,255,114,0.05)" : "transparent",
        borderLeft: active
          ? "2px solid var(--color-brand)"
          : "2px solid transparent",
        transition: "background 0.1s, border-color 0.1s",
      }}
    >
      <ResultAvatar r={result} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
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
            fontSize: 11.5,
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
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          padding: "2px 7px",
          borderRadius: 5,
          background: c.bg,
          color: c.text,
          fontFamily: "Plus Jakarta Sans, sans-serif",
          flexShrink: 0,
        }}
      >
        {ENTITY_LABELS[result.type]}
      </span>
    </a>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header({
  onLoginClick,
  onRegisterClick,
}: HeaderProps): JSX.Element {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    user?.user_metadata?.avatar_url,
  );

  const role: Role = (user?.user_metadata?.rol as Role) ?? "estudiante";
  const allowedTypes = ROLE_PERMISSIONS[role] ?? [];
  const fullName: string = user?.user_metadata?.full_name ?? user?.email ?? "";
  const initials: string = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("usuario")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      });
  }, [user]);

  // Ctrl+K / Cmd+K global
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const navLinks = [{ label: "Inicio", href: "/" }];

  return (
    <>
      <div
        className="sticky top-0 z-40 pointer-events-none"
        style={{ padding: "10px 20px 0" }}
      >
        <header
          className="pointer-events-auto"
          style={{
            borderRadius: 20,
            border: scrolled
              ? "1px solid rgba(192,255,114,0.14)"
              : "1px solid rgba(255,255,255,0.06)",
            background: scrolled ? "rgba(1,3,9,0.96)" : "rgba(2,5,13,0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: scrolled
              ? "0 8px 40px rgba(0,0,0,0.7), 0 1px 0 rgba(192,255,114,0.07) inset, 0 0 0 1px rgba(192,255,114,0.04)"
              : "0 4px 24px rgba(0,0,0,0.4)",
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <div className="flex items-center justify-between h-14 gap-3">
              {/* ── Logo ── */}
              <a
                href="/"
                className="flex items-center gap-2.5 flex-shrink-0 group"
              >
                <img
                  src={logoUrl}
                  alt="Relance"
                  style={{
                    height: 28,
                    width: "auto",
                    borderRadius: 7,
                    transition: "opacity 0.2s",
                  }}
                />
              </a>

              {/* ── Nav desktop ── */}
              <nav className="hidden md:flex items-center gap-0.5">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{
                      padding: "6px 13px",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--color-text-muted)",
                      borderRadius: 9,
                      textDecoration: "none",
                      transition: "color 0.15s, background 0.15s",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      letterSpacing: "-0.01em",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--color-text)";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--color-text-muted)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* ── Search trigger (desktop) ── */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Abrir buscador (Ctrl+K)"
                className="hidden md:flex"
                style={{
                  flex: "1 1 0",
                  maxWidth: 300,
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 12px",
                  borderRadius: 11,
                  border: "1px solid var(--color-border-strong)",
                  background: "rgba(255,255,255,0.025)",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  transition: "all 0.18s",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: 12.5,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(192,255,114,0.25)";
                  e.currentTarget.style.background = "rgba(192,255,114,0.04)";
                  e.currentTarget.style.color = "var(--color-text-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--color-border-strong)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span style={{ flex: 1, textAlign: "left" }}>Buscar…</span>
                <kbd
                  style={{
                    fontSize: 9.5,
                    padding: "2px 6px",
                    borderRadius: 5,
                    border: "1px solid var(--color-border-strong)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--color-text-subtle)",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    flexShrink: 0,
                  }}
                >
                  ⌘K
                </kbd>
              </button>

              {/* ── Right section ── */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {user ? (
                  // ── Avatar + UserMenu (no hamburger) ──
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: menuOpen
                          ? "2px solid var(--color-brand)"
                          : "2px solid rgba(255,255,255,0.1)",
                        transition: "border-color 0.2s",
                        flexShrink: 0,
                        cursor: "pointer",
                        padding: 0,
                        background: "transparent",
                      }}
                      aria-label="Menú de usuario"
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={fullName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "var(--color-brand)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#02050d",
                            fontWeight: 700,
                            fontSize: 12,
                            fontFamily: "Syne, sans-serif",
                          }}
                        >
                          {initials || "?"}
                        </div>
                      )}
                    </button>
                    {menuOpen && (
                      <UserMenu onClose={() => setMenuOpen(false)} />
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={onLoginClick}
                      className="hidden sm:flex btn-secondary"
                    >
                      Iniciar sesión
                    </button>

                    <button
                      onClick={onRegisterClick}
                      className="hidden md:flex btn-primary"
                    >
                      Registrarse
                    </button>

                    {/* Mobile: botones compactos sin hamburger */}
                    <button
                      onClick={onLoginClick}
                      className="md:hidden"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 9,
                        fontSize: 12,
                        fontWeight: 500,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        border: "1px solid var(--color-border-strong)",
                        background: "transparent",
                        color: "var(--color-text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      Entrar
                    </button>
                    <button
                      onClick={onRegisterClick}
                      className="md:hidden"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 9,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "Plus Jakarta Sans, sans-serif",
                        border: "none",
                        background: "var(--color-brand)",
                        color: "#02050d",
                        cursor: "pointer",
                      }}
                    >
                      Registro
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      </div>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        allowedTypes={allowedTypes}
      />
    </>
  );
}
