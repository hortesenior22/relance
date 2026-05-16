import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role =
  | "administrador"
  | "estudiante"
  | "empresa"
  | "centro_educativo"
  | "tutor_centro"
  | "tutor_empresa";

type EntityType =
  | "empresa"
  | "centro_educativo"
  | "estudiante"
  | "tutor_empresa"
  | "tutor_centro"
  | "oferta";

interface SearchResult {
  id: string;
  type: EntityType;
  name: string;
  subtitle: string;
  avatarUrl?: string;
  href: string;
}

export interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  role: Role;
  userId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RBAC — AQUÍ SE DECLARA QUÉ PUEDE BUSCAR CADA ROL
// Cambiar los permisos de un rol = editar SOLO esta constante.
//
// Las restricciones adicionales de fila (empresa → solo sus ofertas,
// tutores → solo sus estudiantes asignados) se aplican dentro de las
// queries individuales; ver fetchOfertas y fetchEstudiantes.
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<Role, EntityType[]> = {
  //                  ┌── entidades que puede buscar este rol
  administrador: [
    "empresa",
    "centro_educativo",
    "estudiante",
    "tutor_empresa",
    "tutor_centro",
    "oferta",
  ],
  centro_educativo: ["estudiante", "empresa", "tutor_centro"],
  empresa: ["estudiante", "centro_educativo", "tutor_empresa", "oferta"],
  //                  ↑ empresa NO se incluye a sí misma
  tutor_centro: ["estudiante", "oferta"], // estudiante → solo asignados (ver fetchEstudiantes)
  tutor_empresa: ["estudiante"], // estudiante → solo asignados (ver fetchEstudiantes)
  estudiante: ["empresa", "centro_educativo", "oferta"],
};

// ─── Labels y colores ─────────────────────────────────────────────────────────

const ENTITY_LABELS: Record<EntityType, string> = {
  empresa: "Empresa",
  centro_educativo: "Centro",
  estudiante: "Estudiante",
  tutor_empresa: "Tutor empresa",
  tutor_centro: "Tutor centro",
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
  tutor_empresa: {
    bg: "rgba(252,129,129,0.08)",
    text: "#fc8181",
    dot: "#fc8181",
  },
  tutor_centro: {
    bg: "rgba(154,230,180,0.08)",
    text: "#9ae6b4",
    dot: "#9ae6b4",
  },
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

// ─── Contexto de búsqueda ─────────────────────────────────────────────────────
//
// Se resuelve UNA sola vez al abrir el modal (o al cambiar rol/userId).
//
//   empresaId       → UUID de la empresa del usuario logado
//                     FIX: empresa.id = usuario.id (no existe columna usuario_id
//                     en la tabla empresa según el esquema real de la BD).
//                     No se necesita query extra.
//
//   tutorStudentIds → UUIDs de estudiantes asignados al tutor.
//                     null = sin restricción (rol que ve todos los estudiantes).

interface SearchContext {
  empresaId: string | null;
  centroId: string | null;
  tutorStudentIds: string[] | null;
}

async function resolveSearchContext(
  role: Role,
  userId: string,
): Promise<SearchContext> {
  const ctx: SearchContext = {
    empresaId: null,
    centroId: null,
    tutorStudentIds: null,
  };
  if (!userId) return ctx;

  // ── empresa ──────────────────────────────────────────────────────────────
  // La tabla `empresa` usa el mismo UUID que el usuario auth (sin usuario_id).
  // No es necesaria ninguna query adicional.
  if (role === "empresa") {
    ctx.empresaId = userId;
  }


  if (role === "centro_educativo") {
    const { data: centroRow } = await supabase
      .from("centro_educativo")
      .select("id")
      .eq("usuario_id", userId)
      .maybeSingle();

    ctx.centroId = centroRow?.id ?? userId;
  }

  // ── tutor_centro: estudiantes asignados a este tutor en centro_estudiante ─
  if (role === "tutor_centro") {
    const { data } = await supabase
      .from("centro_estudiante")
      .select("id_estudiante")
      .eq("id_tutor", userId);
    ctx.tutorStudentIds = (data ?? []).map((r) => r.id_estudiante);
  }

  // ── tutor_empresa: estudiantes en prácticas asignados a su empresa ────────
  if (role === "tutor_empresa") {
    // 1. Localizar la empresa del tutor via tutor_empresa.usuario_id
    const { data: tutorRow } = await supabase
      .from("tutor_empresa")
      .select("empresa_id")
      .eq("usuario_id", userId)
      .maybeSingle();

    if (!tutorRow?.empresa_id) {
      ctx.tutorStudentIds = []; // tutor sin empresa asignada
      return ctx;
    }

    // 2. Estudiantes activos o finalizados en esa empresa
    const { data: estadoRows } = await supabase
      .from("estudiante_estado")
      .select("id_estudiante")
      .eq("id_empresa", tutorRow.empresa_id)
      .in("estado", ["en_practicas", "finalizado"]);

    ctx.tutorStudentIds = (estadoRows ?? []).map((r) => r.id_estudiante);
  }

  return ctx;
}

// ─── Queries Supabase — una función por entidad ───────────────────────────────

async function fetchEmpresas(term: string): Promise<SearchResult[]> {
  const { data } = await supabase
    .from("empresa")
    .select("id, nombre, sector, ciudad, logo_url")
    .ilike("nombre", `%${term}%`)
    .limit(5);

  return (data ?? []).map((e) => ({
    id: e.id,
    type: "empresa" as const,
    name: e.nombre,
    subtitle: [e.sector, e.ciudad].filter(Boolean).join(" · "),
    avatarUrl: e.logo_url ?? undefined,
    href: `/empresa/${e.id}`,
  }));
}

async function fetchCentros(term: string): Promise<SearchResult[]> {
  const { data } = await supabase
    .from("centro_educativo")
    .select("id, nombre, tipo_centro, ciudad, avatar_url")
    .ilike("nombre", `%${term}%`)
    .limit(5);

  return (data ?? []).map((c) => ({
    id: c.id,
    type: "centro_educativo" as const,
    name: c.nombre,
    subtitle: [c.tipo_centro, c.ciudad].filter(Boolean).join(" · "),
    avatarUrl: c.avatar_url ?? undefined,
    href: `/centro_educativo/${c.id}`,
  }));
}

async function fetchEstudiantes(
  term: string,
  tutorStudentIds: string[] | null,
): Promise<SearchResult[]> {
  const isTutorScoped = tutorStudentIds !== null;

  if (isTutorScoped && tutorStudentIds.length === 0) return [];

  let query = supabase
    .from("estudiante")
    .select("id, nombre, apellidos, titulacion, ciudad, avatar_url")
    .or(`nombre.ilike.%${term}%,apellidos.ilike.%${term}%`)
    .limit(5);

  if (isTutorScoped) {
    query = query.in("id", tutorStudentIds);
  }

  const { data } = await query;

  return (data ?? []).map((s) => ({
    id: s.id,
    type: "estudiante" as const,
    name: `${s.nombre ?? ""} ${s.apellidos ?? ""}`.trim(),
    subtitle: [s.titulacion, s.ciudad].filter(Boolean).join(" · "),
    avatarUrl: s.avatar_url ?? undefined,
    href: `/estudiante/${s.id}`,
  }));
}

async function fetchTutoresEmpresa(
  term: string,
  empresaId: string | null,
  role: Role,
): Promise<SearchResult[]> {
  // FIX: la tabla tutor_empresa solo tiene `nombre` (text), NO `apellidos`.
  // Subtítulo: cargo + nombre de la empresa (join via empresa_id → empresa.nombre).
  let query = supabase
    .from("tutor_empresa")
    .select("id, nombre, cargo, empresa_id, empresa:empresa_id(nombre), avatar_url")
    .ilike("nombre", `%${term}%`)
    .limit(5);

  if (role === "empresa") {
    if (!empresaId) return [];
    query = query.eq("empresa_id", empresaId);
  }

  const { data } = await query;

  return (data ?? []).map((t) => ({
    id: t.id,
    type: "tutor_empresa" as const,
    name: t.nombre ?? "",
    subtitle: [(t.empresa as { nombre?: string } | null)?.nombre, t.cargo]
      .filter(Boolean)
      .join(" · "),
    avatarUrl: t.avatar_url ?? undefined,
    href: `/tutor_empresa/${t.id}`,
  }));
}

async function fetchTutoresCentro(
  term: string,
  centroId: string | null,
  role: Role,
): Promise<SearchResult[]> {
  // FIX: la tabla tutor_centro solo tiene `nombre` (text), NO `apellidos`.
  // Subtítulo: departamento + nombre del centro (join via centro_id → centro_educativo.nombre).
  let query = supabase
    .from("tutor_centro")
    .select("id, nombre, departamento, centro_id, centro:centro_id(nombre), avatar_url")
    .ilike("nombre", `%${term}%`)
    .limit(5);

  if (role === "centro_educativo") {
    if (!centroId) return [];
    query = query.eq("centro_id", centroId);
  }

  const { data } = await query;

  return (data ?? []).map((t) => ({
    id: t.id,
    type: "tutor_centro" as const,
    name: t.nombre ?? "",
    subtitle: [(t.centro as { nombre?: string } | null)?.nombre, t.departamento]
      .filter(Boolean)
      .join(" · "),
    avatarUrl: t.avatar_url ?? undefined,
    href: `/tutor_centro/${t.id}`,
  }));
}

async function fetchOfertas(
  term: string,
  empresaId: string | null,
  role: Role,
): Promise<SearchResult[]> {
  // Empresa sin ID resuelto → no puede ver ofertas
  if (role === "empresa" && !empresaId) return [];

  let query = supabase
    .from("oferta")
    .select("id_oferta, titulo, modalidad, ubicacion")
    .ilike("titulo", `%${term}%`)
    .eq("estado", "activa")
    .limit(5);

  // Empresa: solo sus propias ofertas (filtro por id_empresa = empresaId)
  if (role === "empresa") {
    query = query.eq("id_empresa", empresaId!);
  }

  // tutor_centro, administrador, estudiante → todas las ofertas activas

  const { data } = await query;

  return (data ?? []).map((o) => ({
    id: o.id_oferta,
    type: "oferta" as const,
    name: o.titulo,
    subtitle: [o.modalidad, o.ubicacion].filter(Boolean).join(" · "),
    href: `/ofertas/${o.id_oferta}`,
  }));
}

// ─── Orquestador ─────────────────────────────────────────────────────────────

async function runSearch(
  term: string,
  allowed: EntityType[],
  role: Role,
  ctx: SearchContext,
): Promise<SearchResult[]> {
  if (!term.trim()) return [];

  const searches: Promise<SearchResult[]>[] = [];

  if (allowed.includes("empresa")) searches.push(fetchEmpresas(term));
  if (allowed.includes("centro_educativo")) searches.push(fetchCentros(term));
  if (allowed.includes("estudiante"))
    searches.push(fetchEstudiantes(term, ctx.tutorStudentIds));
  if (allowed.includes("tutor_empresa"))
    searches.push(fetchTutoresEmpresa(term, ctx.empresaId, role));
  if (allowed.includes("tutor_centro"))
    searches.push(fetchTutoresCentro(term, ctx.centroId, role));
  if (allowed.includes("oferta"))
    searches.push(fetchOfertas(term, ctx.empresaId, role));

  const batches = await Promise.all(searches);
  return batches.flat();
}

// ─── Hooks internos ───────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStudentSectionLabel(role: Role): string {
  if (role === "tutor_centro") return "Mis estudiantes tutorizados";
  if (role === "tutor_empresa") return "Estudiantes en mis prácticas";
  return "Estudiantes";
}

function getSectionLabel(type: EntityType, role: Role): string {
  return type === "estudiante" &&
    (role === "tutor_centro" || role === "tutor_empresa")
    ? getStudentSectionLabel(role)
    : ENTITY_LABELS[type];
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

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

// ─── SearchModal (export default) ────────────────────────────────────────────

export default function SearchModal({
  open,
  onClose,
  role,
  userId,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActive] = useState(-1);
  const [searchCtx, setSearchCtx] = useState<SearchContext>({
    empresaId: null,
    centroId: null,
    tutorStudentIds: null,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dq = useDebounce(query, 220);

  const allowedTypes = ROLE_PERMISSIONS[role] ?? [];
  const isTutor = role === "tutor_centro" || role === "tutor_empresa";

  useScrollLock(open);

  // Resolver contexto al abrir o cambiar rol/userId
  useEffect(() => {
    if (!open || !userId) return;
    resolveSearchContext(role, userId).then(setSearchCtx);
  }, [open, role, userId]);

  // Reset + foco al abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
      setQuery("");
      setResults([]);
      setActive(-1);
    }
  }, [open]);

  // ESC para cerrar
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // Búsqueda con debounce
  useEffect(() => {
    if (!dq.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    runSearch(dq, allowedTypes, role, searchCtx)
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
  }, [dq, allowedTypes, role, searchCtx]);

  // Navegación por teclado
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

  // Scroll al elemento activo
  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const el = listRef.current.querySelector(
        `[data-idx="${activeIdx}"]`,
      ) as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  // Agrupación en orden de allowedTypes
  const grouped = allowedTypes.reduce<
    Partial<Record<EntityType, SearchResult[]>>
  >((acc, type) => {
    const items = results.filter((r) => r.type === type);
    if (items.length > 0) acc[type] = items;
    return acc;
  }, {});

  const offsetOf = (type: EntityType): number => {
    let offset = 0;
    for (const t of allowedTypes) {
      if (t === type) break;
      offset += grouped[t]?.length ?? 0;
    }
    return offset;
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
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

      {/* Panel */}
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
          {/* ── Input ── */}
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
              placeholder="Buscar empresas, centros, estudiantes, tutores, ofertas…"
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

          {/* ── Body ── */}
          <div ref={listRef} style={{ overflowY: "auto", flex: 1 }}>
            {/* Estado vacío */}
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
                    {isTutor && allowedTypes.includes("estudiante") ? (
                      <>
                        Buscando:{" "}
                        <span style={{ color: "#f6ad55", fontWeight: 600 }}>
                          {getStudentSectionLabel(role)}
                        </span>
                      </>
                    ) : (
                      <>
                        Puedes buscar:{" "}
                        <span
                          style={{
                            color: "var(--color-brand)",
                            fontWeight: 600,
                          }}
                        >
                          {allowedTypes.map((t) => ENTITY_LABELS[t]).join(", ")}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Resultados agrupados */}
            {query.trim() && results.length > 0 && (
              <div style={{ padding: "6px 0 10px" }}>
                {(
                  Object.entries(grouped) as [EntityType, SearchResult[]][]
                ).map(([type, items]) => (
                  <SRSection
                    key={type}
                    label={getSectionLabel(type, role)}
                    dot={ENTITY_COLOR[type].dot}
                  >
                    {items.map((r, i) => (
                      <SRResult
                        key={r.id}
                        result={r}
                        idx={offsetOf(type) + i}
                        active={activeIdx === offsetOf(type) + i}
                        onHover={() => setActive(offsetOf(type) + i)}
                        onClick={() => {
                          window.location.href = r.href;
                          onClose();
                        }}
                      />
                    ))}
                  </SRSection>
                ))}
              </div>
            )}

            {/* Sin resultados */}
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
                    textAlign: "center",
                  }}
                >
                  Sin resultados para{" "}
                  <strong style={{ color: "var(--color-text)" }}>
                    "{query}"
                  </strong>
                  {isTutor && allowedTypes.includes("estudiante") && (
                    <span
                      style={{
                        display: "block",
                        fontSize: 11.5,
                        color: "var(--color-text-subtle)",
                        marginTop: 4,
                      }}
                    >
                      La búsqueda está limitada a tus estudiantes asignados
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
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
            {(
              [
                ["↑↓", "navegar"],
                ["↵", "abrir"],
                ["ESC", "cerrar"],
              ] as const
            ).map(([k, l]) => (
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
        @keyframes spin    { to   { transform:rotate(360deg) } }
      `}</style>
    </>
  );
}
