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

type RelationStatus = "matriculado" | "en_practicas" | "finalizado" | null;

interface SearchResult {
  id: string;
  type: EntityType;
  name: string;
  subtitle: string;
  avatarUrl?: string;
  href: string;
  relationStatus?: RelationStatus;
}

export interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  role: Role;
  userId: string;
  useExplorarPage?: boolean;
  explorarBasePath?: string;
}

// ─── RBAC ─────────────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<Role, EntityType[]> = {
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
  tutor_centro: ["estudiante", "oferta"],
  tutor_empresa: ["estudiante"],
  estudiante: ["empresa", "centro_educativo", "oferta"],
};

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
  { bg: string; text: string; dot: string; activeBg: string; border: string }
> = {
  empresa: {
    bg: "rgba(192,255,114,0.06)",
    text: "#c0ff72",
    dot: "#c0ff72",
    activeBg: "rgba(192,255,114,0.14)",
    border: "rgba(192,255,114,0.35)",
  },
  centro_educativo: {
    bg: "rgba(99,179,237,0.06)",
    text: "#63b3ed",
    dot: "#63b3ed",
    activeBg: "rgba(99,179,237,0.14)",
    border: "rgba(99,179,237,0.35)",
  },
  estudiante: {
    bg: "rgba(246,173,85,0.06)",
    text: "#f6ad55",
    dot: "#f6ad55",
    activeBg: "rgba(246,173,85,0.14)",
    border: "rgba(246,173,85,0.35)",
  },
  tutor_empresa: {
    bg: "rgba(252,129,129,0.06)",
    text: "#fc8181",
    dot: "#fc8181",
    activeBg: "rgba(252,129,129,0.14)",
    border: "rgba(252,129,129,0.35)",
  },
  tutor_centro: {
    bg: "rgba(154,230,180,0.06)",
    text: "#9ae6b4",
    dot: "#9ae6b4",
    activeBg: "rgba(154,230,180,0.14)",
    border: "rgba(154,230,180,0.35)",
  },
  oferta: {
    bg: "rgba(159,122,234,0.06)",
    text: "#9f7aea",
    dot: "#9f7aea",
    activeBg: "rgba(159,122,234,0.14)",
    border: "rgba(159,122,234,0.35)",
  },
};

// ─── Iconos SVG ───────────────────────────────────────────────────────────────

function EntityIcon({
  type,
  size = 12,
  color = "currentColor",
}: {
  type: EntityType;
  size?: number;
  color?: string;
}) {
  const s = { width: size, height: size, flexShrink: 0 as const };
  const p = {
    fill: "none",
    stroke: color,
    strokeWidth: "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (type) {
    case "empresa":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          <rect x="2" y="7" width="20" height="15" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="12" strokeWidth="3" />
          <path d="M2 12h20" />
        </svg>
      );
    case "centro_educativo":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
          <rect x="9" y="9" width="2" height="2" />
          <rect x="13" y="9" width="2" height="2" />
        </svg>
      );
    case "estudiante":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
        </svg>
      );
    case "tutor_empresa":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          <circle cx="9" cy="7" r="4" />
          <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
        </svg>
      );
    case "tutor_centro":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1" />
          <path d="M9 12l1.5 1.5L14 10" strokeWidth="2" />
        </svg>
      );
    case "oferta":
      return (
        <svg viewBox="0 0 24 24" style={s} {...p}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      );
  }
}

// ─── Placeholders ─────────────────────────────────────────────────────────────

const ENTITY_PLACEHOLDER: Record<EntityType, string> = {
  empresa: "Buscar empresas…",
  centro_educativo: "Buscar centros educativos…",
  estudiante: "Buscar estudiantes…",
  tutor_empresa: "Buscar tutores de empresa…",
  tutor_centro: "Buscar tutores de centro…",
  oferta: "Buscar ofertas…",
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

// ─── SearchContext ─────────────────────────────────────────────────────────────

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

  if (role === "empresa") ctx.empresaId = userId;
  if (role === "centro_educativo") ctx.centroId = userId;

  if (role === "tutor_centro") {
    const { data: tutorRow, error } = await supabase
      .from("tutor_centro")
      .select("id")
      .eq("usuario_id", userId)
      .maybeSingle();
    if (error)
      console.error("[Search] resolveContext tutor_centro:", error.message);
    if (!tutorRow?.id) {
      ctx.tutorStudentIds = [];
      return ctx;
    }
    const { data: asignados, error: errA } = await supabase
      .from("centro_estudiante")
      .select("id_estudiante")
      .eq("id_tutor", tutorRow.id);
    if (errA)
      console.error("[Search] resolveContext centro_estudiante:", errA.message);
    ctx.tutorStudentIds = (asignados ?? []).map((r) => r.id_estudiante);
  }

  if (role === "tutor_empresa") {
    const { data: tutorRow, error } = await supabase
      .from("tutor_empresa")
      .select("empresa_id")
      .eq("usuario_id", userId)
      .maybeSingle();
    if (error)
      console.error("[Search] resolveContext tutor_empresa:", error.message);
    if (!tutorRow?.empresa_id) {
      ctx.tutorStudentIds = [];
      return ctx;
    }
    const { data: estadoRows, error: errE } = await supabase
      .from("estudiante_estado")
      .select("id_estudiante")
      .eq("id_empresa", tutorRow.empresa_id)
      .in("estado", ["en_practicas", "finalizado"]);
    if (errE)
      console.error("[Search] resolveContext estudiante_estado:", errE.message);
    ctx.tutorStudentIds = (estadoRows ?? []).map((r) => r.id_estudiante);
  }

  return ctx;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

async function fetchEstudiantesDirecto(
  term: string,
  scopedIds?: string[],
): Promise<SearchResult[]> {
  let query = supabase
    .from("estudiante")
    .select("id, nombre, apellidos, titulacion, ciudad, avatar_url")
    .or(`nombre.ilike.%${term}%,apellidos.ilike.%${term}%`)
    .limit(8);
  if (scopedIds && scopedIds.length > 0) query = query.in("id", scopedIds);
  const { data, error } = await query;
  if (error) {
    console.error("[Search] fetchEstudiantesDirecto:", error.message);
    return [];
  }
  return (data ?? []).map((s) => ({
    id: s.id,
    type: "estudiante" as const,
    name: `${s.nombre ?? ""} ${s.apellidos ?? ""}`.trim(),
    subtitle: [s.titulacion, s.ciudad].filter(Boolean).join(" · "),
    avatarUrl: s.avatar_url ?? undefined,
    href: `/estudiante/${s.id}`,
  }));
}

async function fetchEmpresas(term: string): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from("empresa")
    .select("id, nombre, sector, ciudad, logo_url")
    .ilike("nombre", `%${term}%`)
    .limit(8);
  if (error) {
    console.error("[Search] empresa:", error.message);
    return [];
  }
  return (data ?? []).map((e) => ({
    id: e.id,
    type: "empresa" as const,
    name: e.nombre ?? "",
    subtitle: [e.sector, e.ciudad].filter(Boolean).join(" · "),
    avatarUrl: e.logo_url ?? undefined,
    href: `/empresa/${e.id}`,
  }));
}

async function fetchCentros(term: string): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from("centro_educativo")
    .select("id, nombre, tipo_centro, ciudad, avatar_url")
    .ilike("nombre", `%${term}%`)
    .limit(8);
  if (error) {
    console.error("[Search] centro_educativo:", error.message);
    return [];
  }
  return (data ?? []).map((c) => ({
    id: c.id,
    type: "centro_educativo" as const,
    name: c.nombre ?? "",
    subtitle: [c.tipo_centro, c.ciudad].filter(Boolean).join(" · "),
    avatarUrl: c.avatar_url ?? undefined,
    href: `/centro/${c.id}`,
  }));
}

async function fetchEstudiantes(
  term: string,
  role: Role,
  ctx: SearchContext,
): Promise<SearchResult[]> {
  const isTutorScoped = ctx.tutorStudentIds !== null;
  if (isTutorScoped && ctx.tutorStudentIds!.length === 0) return [];

  if (role === "centro_educativo") {
    const { data: todosVinculos } = await supabase
      .from("centro_estudiante")
      .select("id_estudiante, id_centro");
    const estudianteCentroMap = new Map<string, string>(
      (todosVinculos ?? []).map((r) => [r.id_estudiante, r.id_centro]),
    );
    const centroIds = [
      ...new Set((todosVinculos ?? []).map((r) => r.id_centro)),
    ];
    const centroNombreMap = new Map<string, string>();
    if (centroIds.length > 0) {
      const { data: centros } = await supabase
        .from("centro_educativo")
        .select("id, nombre")
        .in("id", centroIds);
      (centros ?? []).forEach((c) => centroNombreMap.set(c.id, c.nombre));
    }
    const results = await fetchEstudiantesDirecto(term);
    if (!results.length) return [];
    return results
      .map((r) => {
        const idCentroDelEstudiante = estudianteCentroMap.get(r.id);
        const nombreCentro = idCentroDelEstudiante
          ? centroNombreMap.get(idCentroDelEstudiante)
          : undefined;
        return {
          ...r,
          subtitle: [r.subtitle, nombreCentro].filter(Boolean).join(" · "),
          relationStatus: (idCentroDelEstudiante
            ? "matriculado"
            : null) as RelationStatus,
        };
      })
      .sort((a, b) =>
        a.relationStatus && !b.relationStatus
          ? -1
          : !a.relationStatus && b.relationStatus
            ? 1
            : 0,
      );
  }

  if (role === "empresa") {
    let estadoMap = new Map<string, "en_practicas" | "finalizado">();
    if (ctx.empresaId) {
      const { data: estadoRows, error: errE } = await supabase
        .from("estudiante_estado")
        .select("id_estudiante, estado")
        .eq("id_empresa", ctx.empresaId)
        .in("estado", ["en_practicas", "finalizado"]);
      if (errE)
        console.error("[Search] estudiante_estado empresa:", errE.message);
      for (const row of estadoRows ?? [])
        estadoMap.set(
          row.id_estudiante,
          row.estado as "en_practicas" | "finalizado",
        );
    }
    const results = await fetchEstudiantesDirecto(term);
    if (!results.length) return [];
    return results
      .map((r) => ({
        ...r,
        relationStatus: (estadoMap.get(r.id) ?? null) as RelationStatus,
      }))
      .sort((a, b) =>
        a.relationStatus && !b.relationStatus
          ? -1
          : !a.relationStatus && b.relationStatus
            ? 1
            : 0,
      );
  }

  if (isTutorScoped) return fetchEstudiantesDirecto(term, ctx.tutorStudentIds!);
  return fetchEstudiantesDirecto(term);
}

async function fetchTutoresEmpresa(
  term: string,
  role: Role,
  ctx: SearchContext,
): Promise<SearchResult[]> {
  let query = supabase
    .from("tutor_empresa")
    .select("id, nombre, cargo, empresa_id")
    .ilike("nombre", `%${term}%`)
    .limit(8);
  if (role === "empresa") {
    if (!ctx.empresaId) return [];
    query = query.eq("empresa_id", ctx.empresaId);
  }
  const { data, error } = await query;
  if (error) {
    console.error("[Search] tutor_empresa:", error.message);
    return [];
  }
  if (!data?.length) return [];
  const empresaIds = [
    ...new Set(data.map((t) => t.empresa_id).filter(Boolean)),
  ];
  let empresaMap: Record<string, string> = {};
  if (empresaIds.length > 0) {
    const { data: emps } = await supabase
      .from("empresa")
      .select("id, nombre")
      .in("id", empresaIds);
    empresaMap = Object.fromEntries((emps ?? []).map((e) => [e.id, e.nombre]));
  }
  return data.map((t) => ({
    id: t.id,
    type: "tutor_empresa" as const,
    name: t.nombre ?? "",
    subtitle: [empresaMap[t.empresa_id] ?? null, t.cargo]
      .filter(Boolean)
      .join(" · "),
    href: `/tutor-empresa/${t.id}`,
  }));
}

async function fetchTutoresCentro(
  term: string,
  role: Role,
  ctx: SearchContext,
): Promise<SearchResult[]> {
  if (role === "centro_educativo" && !ctx.centroId) return [];
  let scopedTutorIds: string[] | null = null;
  if (role === "centro_educativo") {
    const { data: centroTutorRows, error: errCT } = await supabase
      .from("centro_tutor")
      .select("id_tutor")
      .eq("id_centro", ctx.centroId!);
    if (errCT) {
      console.error("[Search] centro_tutor:", errCT.message);
      return [];
    }
    scopedTutorIds = (centroTutorRows ?? []).map((r) => r.id_tutor);
    if (scopedTutorIds.length === 0) return [];
  }
  let query = supabase
    .from("tutor_centro")
    .select("id, nombre, departamento, usuario_id")
    .ilike("nombre", `%${term}%`)
    .limit(8);
  if (scopedTutorIds) query = query.in("id", scopedTutorIds);
  const { data, error } = await query;
  if (error) {
    console.error("[Search] tutor_centro:", error.message);
    return [];
  }
  if (!data?.length) return [];
  const tutorIds = data.map((t) => t.id);
  const { data: centroTutorRows } = await supabase
    .from("centro_tutor")
    .select("id_tutor, id_centro")
    .in("id_tutor", tutorIds);
  const tutorCentroMap = new Map<string, string>(
    (centroTutorRows ?? []).map((r) => [r.id_tutor, r.id_centro]),
  );
  const centroIds = [
    ...new Set((centroTutorRows ?? []).map((r) => r.id_centro).filter(Boolean)),
  ];
  let centroMap: Record<string, string> = {};
  if (centroIds.length > 0) {
    const { data: centros } = await supabase
      .from("centro_educativo")
      .select("id, nombre")
      .in("id", centroIds);
    centroMap = Object.fromEntries(
      (centros ?? []).map((c) => [c.id, c.nombre]),
    );
  }
  return data.map((t) => {
    const centroId = tutorCentroMap.get(t.id);
    return {
      id: t.id,
      type: "tutor_centro" as const,
      name: t.nombre ?? "",
      subtitle: [centroId ? centroMap[centroId] : null, t.departamento]
        .filter(Boolean)
        .join(" · "),
      href: `/tutor-centro/${t.id}`,
    };
  });
}

async function fetchOfertas(
  term: string,
  role: Role,
  ctx: SearchContext,
): Promise<SearchResult[]> {
  if (role === "empresa" && !ctx.empresaId) return [];
  let query = supabase
    .from("oferta")
    .select("id_oferta, titulo, modalidad, ubicacion, id_empresa")
    .ilike("titulo", `%${term}%`)
    .eq("estado", "activa")
    .limit(8);
  if (role === "empresa") query = query.eq("id_empresa", ctx.empresaId!);
  const { data, error } = await query;
  if (error) {
    console.error("[Search] oferta:", error.message);
    return [];
  }
  if (!data?.length) return [];
  const empresaIds = [
    ...new Set(data.map((o) => o.id_empresa).filter(Boolean)),
  ];
  let empresaMap: Record<string, string> = {};
  if (empresaIds.length > 0) {
    const { data: emps } = await supabase
      .from("empresa")
      .select("id, nombre")
      .in("id", empresaIds);
    empresaMap = Object.fromEntries((emps ?? []).map((e) => [e.id, e.nombre]));
  }
  return data.map((o) => ({
    id: o.id_oferta,
    type: "oferta" as const,
    name: o.titulo ?? "",
    subtitle: [empresaMap[o.id_empresa] ?? null, o.modalidad, o.ubicacion]
      .filter(Boolean)
      .join(" · "),
    href: `/ofertas/${o.id_oferta}`,
  }));
}

async function runSearchForType(
  term: string,
  type: EntityType,
  role: Role,
  ctx: SearchContext,
): Promise<SearchResult[]> {
  if (!term.trim() || term.trim().length < 2) return [];
  switch (type) {
    case "empresa":
      return fetchEmpresas(term);
    case "centro_educativo":
      return fetchCentros(term);
    case "estudiante":
      return fetchEstudiantes(term, role, ctx);
    case "tutor_empresa":
      return fetchTutoresEmpresa(term, role, ctx);
    case "tutor_centro":
      return fetchTutoresCentro(term, role, ctx);
    case "oferta":
      return fetchOfertas(term, role, ctx);
  }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

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
  if (role === "centro_educativo") return "Estudiantes del centro";
  return "Estudiantes";
}

function getSectionLabel(type: EntityType, role: Role): string {
  return type === "estudiante"
    ? getStudentSectionLabel(role)
    : ENTITY_LABELS[type];
}

function buildExplorarUrl(basePath: string, result: SearchResult): string {
  return `${basePath}?id=${result.id}&type=${result.type}`;
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
          width: 26,
          height: 26,
          borderRadius: 6,
          objectFit: "cover",
          flexShrink: 0,
          border: "1px solid var(--color-border-strong)",
        }}
      />
    );
  return (
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: 6,
        flexShrink: 0,
        background: c.bg,
        border: `1px solid ${c.dot}22`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
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
    <div style={{ marginBottom: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 14px 2px",
          fontSize: 9.5,
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
              width: 4,
              height: 4,
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
        gap: 9,
        padding: "5px 14px",
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
            width="11"
            height="11"
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
            width="11"
            height="11"
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
          fontSize: 12,
          color: "var(--color-text-secondary)",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        {label}
      </span>
    </button>
  );
}

const RELATION_BADGE: Record<
  NonNullable<RelationStatus>,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  matriculado: {
    label: "Matriculado",
    bg: "rgba(246,173,85,0.12)",
    text: "#f6ad55",
    icon: (
      <svg
        width="8"
        height="8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
      </svg>
    ),
  },
  en_practicas: {
    label: "En prácticas",
    bg: "rgba(154,230,180,0.12)",
    text: "#9ae6b4",
    icon: (
      <svg
        width="8"
        height="8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  finalizado: {
    label: "Finalizado",
    bg: "rgba(99,179,237,0.12)",
    text: "#63b3ed",
    icon: (
      <svg
        width="8"
        height="8"
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
  },
};

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
  const rel = result.relationStatus
    ? RELATION_BADGE[result.relationStatus]
    : null;
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
        gap: 9,
        padding: "5px 14px",
        textDecoration: "none",
        cursor: "pointer",
        background: active ? "rgba(192,255,114,0.05)" : "transparent",
        borderLeft: active
          ? "2px solid var(--color-brand)"
          : "2px solid transparent",
        transition: "background 0.1s, border-color 0.1s",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <ResultAvatar r={result} />
        {rel && (
          <span
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: rel.text,
              border: "2px solid var(--color-surface-strong)",
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
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
            fontSize: 10.5,
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
      <div
        style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
      >
        {rel && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "1px 5px",
              borderRadius: 4,
              background: rel.bg,
              color: rel.text,
              fontFamily: "Plus Jakarta Sans, sans-serif",
            }}
          >
            {rel.icon}
            {rel.label}
          </span>
        )}
        {!rel && result.type === "estudiante" && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              padding: "1px 5px",
              borderRadius: 4,
              background: "rgba(255,255,255,0.04)",
              color: "var(--color-text-subtle)",
              fontFamily: "Plus Jakarta Sans, sans-serif",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Sin vincular
          </span>
        )}
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "1px 5px",
            borderRadius: 4,
            background: c.bg,
            color: c.text,
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          {ENTITY_LABELS[result.type]}
        </span>
      </div>
    </a>
  );
}

function FilterBar({
  types,
  active,
  role,
  onChange,
}: {
  types: EntityType[];
  active: EntityType;
  role: Role;
  onChange: (t: EntityType) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "7px 12px",
        borderBottom: "1px solid var(--color-border)",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {types.map((type) => {
        const c = ENTITY_COLOR[type];
        const isActive = active === type;
        const label =
          type === "estudiante" &&
          (role === "tutor_centro" ||
            role === "tutor_empresa" ||
            role === "centro_educativo")
            ? getSectionLabel(type, role)
            : ENTITY_LABELS[type];
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            title={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 9px",
              borderRadius: 6,
              flexShrink: 0,
              border: isActive
                ? `1px solid ${c.border}`
                : "1px solid var(--color-border)",
              background: isActive ? c.activeBg : "transparent",
              color: isActive ? c.text : "var(--color-text-subtle)",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = c.bg;
                e.currentTarget.style.color = c.text;
                e.currentTarget.style.borderColor = `${c.dot}44`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--color-text-subtle)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }
            }}
          >
            <EntityIcon
              type={type}
              size={11}
              color={isActive ? c.text : "currentColor"}
            />
            {label}
            {isActive && (
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: c.dot,
                  marginLeft: 1,
                  flexShrink: 0,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function ExplorarLink({
  basePath,
  activeType,
  role,
}: {
  basePath: string;
  activeType: EntityType;
  role: Role;
}) {
  const c = ENTITY_COLOR[activeType];
  return (
    <a
      href={`${basePath}?type=${activeType}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 14px",
        textDecoration: "none",
        color: c.text,
        fontSize: 11.5,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontWeight: 600,
        transition: "background 0.1s",
        borderTop: "1px solid var(--color-border)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = c.bg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <EntityIcon type={activeType} size={11} color={c.text} />
      Ver todos los {getSectionLabel(activeType, role).toLowerCase()}
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginLeft: "auto" }}
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </a>
  );
}

// ─── SearchModal ──────────────────────────────────────────────────────────────

export default function SearchModal({
  open,
  onClose,
  role,
  userId,
  useExplorarPage = false,
  explorarBasePath = "/explorar",
}: SearchModalProps) {
  const allowedTypes = ROLE_PERMISSIONS[role] ?? [];
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<EntityType>(allowedTypes[0]);
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
  const isScopedRole =
    role === "tutor_centro" ||
    role === "tutor_empresa" ||
    role === "centro_educativo";

  useScrollLock(open);

  useEffect(() => {
    if (!open || !userId) return;
    resolveSearchContext(role, userId).then(setSearchCtx);
  }, [open, role, userId]);
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
      setQuery("");
      setResults([]);
      setActive(-1);
      setActiveType(allowedTypes[0]);
    }
  }, [open]);
  useEffect(() => {
    setQuery("");
    setResults([]);
    setActive(-1);
    setTimeout(() => inputRef.current?.focus(), 30);
  }, [activeType]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    if (!dq.trim() || dq.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    runSearchForType(dq, activeType, role, searchCtx)
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
  }, [dq, activeType, role, searchCtx]);

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
          window.location.href = useExplorarPage
            ? buildExplorarUrl(explorarBasePath, r)
            : r.href;
          onClose();
        }
      }
    },
    [results, activeIdx, onClose, useExplorarPage, explorarBasePath],
  );

  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const el = listRef.current.querySelector(
        `[data-idx="${activeIdx}"]`,
      ) as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  const c = ENTITY_COLOR[activeType];

  if (!open) return null;

  function handleResultClick(result: SearchResult) {
    window.location.href = useExplorarPage
      ? buildExplorarUrl(explorarBasePath, result)
      : result.href;
    onClose();
  }

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(1,3,8,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
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
          padding: "12vh 16px 0",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 500,
            background: "var(--color-surface-strong)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: 14,
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(192,255,114,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
            overflow: "hidden",
            pointerEvents: "all",
            animation: "srch-in 0.2s cubic-bezier(0.16,1,0.3,1) forwards",
            maxHeight: "65vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 14px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {loading ? (
              <div
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  flexShrink: 0,
                  border: "2px solid var(--color-border-strong)",
                  borderTopColor: c.dot,
                  animation: "spin 0.7s linear infinite",
                }}
              />
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke={query.trim() ? c.dot : "var(--color-text-muted)"}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, transition: "stroke 0.2s" }}
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
              placeholder={ENTITY_PLACEHOLDER[activeType]}
              aria-label="Campo de búsqueda"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--color-text)",
                fontSize: 13,
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
                fontSize: 9,
                padding: "1px 6px",
                borderRadius: 5,
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

          {/* Filtros */}
          {allowedTypes.length > 1 && (
            <FilterBar
              types={allowedTypes}
              active={activeType}
              role={role}
              onChange={(t) => setActiveType(t)}
            />
          )}

          {/* Cuerpo */}
          <div ref={listRef} style={{ overflowY: "auto", flex: 1 }}>
            {!query.trim() && (
              <div style={{ padding: "5px 0 8px" }}>
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
                    margin: "3px 14px 5px",
                    padding: "7px 11px",
                    borderRadius: 8,
                    background: c.bg,
                    border: `1px solid ${c.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <EntityIcon type={activeType} size={11} color={c.dot} />
                  <span
                    style={{
                      fontSize: 10.5,
                      color: "var(--color-text-muted)",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    Buscando en:{" "}
                    <span style={{ color: c.text, fontWeight: 600 }}>
                      {getSectionLabel(activeType, role)}
                    </span>
                    {isScopedRole && activeType === "estudiante" && (
                      <span style={{ color: "var(--color-text-subtle)" }}>
                        {" "}
                        · limitado a tus asignados
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {query.trim() && results.length > 0 && (
              <div style={{ padding: "5px 0 0" }}>
                <SRSection
                  label={getSectionLabel(activeType, role)}
                  dot={c.dot}
                >
                  {results.map((r, i) => (
                    <SRResult
                      key={r.id}
                      result={r}
                      idx={i}
                      active={activeIdx === i}
                      onHover={() => setActive(i)}
                      onClick={() => handleResultClick(r)}
                    />
                  ))}
                </SRSection>
                {useExplorarPage && (
                  <ExplorarLink
                    basePath={explorarBasePath}
                    activeType={activeType}
                    role={role}
                  />
                )}
              </div>
            )}

            {query.trim().length >= 2 && results.length === 0 && !loading && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "28px 0",
                  gap: 8,
                }}
              >
                <svg
                  width="22"
                  height="22"
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
                    fontSize: 12,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    textAlign: "center",
                  }}
                >
                  Sin resultados para{" "}
                  <strong style={{ color: "var(--color-text)" }}>
                    "{query}"
                  </strong>{" "}
                  en{" "}
                  <span style={{ color: c.text, fontWeight: 600 }}>
                    {getSectionLabel(activeType, role)}
                  </span>
                  {isScopedRole && activeType === "estudiante" && (
                    <span
                      style={{
                        display: "block",
                        fontSize: 10.5,
                        color: "var(--color-text-subtle)",
                        marginTop: 3,
                      }}
                    >
                      Búsqueda limitada a tus estudiantes asignados
                    </span>
                  )}
                </span>
              </div>
            )}

            {query.trim().length === 1 && (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  fontSize: 11,
                  color: "var(--color-text-subtle)",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                Escribe al menos 2 caracteres para buscar
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 14px",
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
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <kbd
                  style={{
                    fontSize: 9,
                    padding: "1px 5px",
                    borderRadius: 4,
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
                    fontSize: 10,
                    color: "var(--color-text-subtle)",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {l}
                </span>
              </span>
            ))}
            {useExplorarPage && !query.trim() && (
              <a
                href={explorarBasePath}
                onClick={onClose}
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10.5,
                  color: c.text,
                  textDecoration: "none",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontWeight: 600,
                  opacity: 0.8,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
              >
                <EntityIcon type={activeType} size={10} color={c.text} />
                Explorar directorio
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            )}
            {results.length > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  color: "var(--color-text-subtle)",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                {results.length} resultado{results.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes srch-bg { from { opacity:0 } to { opacity:1 } }
        @keyframes srch-in  { from { opacity:0; transform:scale(0.96) translateY(-12px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes spin     { to   { transform:rotate(360deg) } }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
