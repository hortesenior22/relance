/**
 * ProfilesPage.tsx — v4 Rediseño profesional
 *
 * Directorio avanzado de perfiles de la plataforma Relance.
 * - Sin emojis: todos los iconos son SVG inline
 * - Diseño editorial refinado: tipografía clara, espaciado generoso
 * - Tabs, búsqueda con debounce, paginación (PAGE_SIZE = 12)
 * - Cards con estado de vínculo
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role =
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

interface ProfileCardData {
  id: string;
  type: EntityType;
  name: string;
  avatarUrl?: string;
  subtitle: string;
  tags: string[];
  verificado?: boolean;
  disponibilidad?: string;
  relationStatus?: RelationStatus;
}

interface SearchContext {
  empresaId: string | null;
  centroId: string | null;
  tutorStudentIds: string[] | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const ROLE_PERMISSIONS: Record<Role, EntityType[]> = {
  administrador: [
    "empresa",
    "centro_educativo",
    "estudiante",
    "tutor_empresa",
    "tutor_centro",
  ],
  centro_educativo: ["estudiante", "empresa", "tutor_centro"],
  empresa: ["estudiante", "centro_educativo", "tutor_empresa"],
  tutor_centro: ["estudiante"],
  tutor_empresa: ["estudiante"],
  estudiante: ["empresa", "centro_educativo"],
};

const ENTITY_LABELS: Record<EntityType, string> = {
  empresa: "Empresas",
  centro_educativo: "Centros",
  estudiante: "Estudiantes",
  tutor_empresa: "Tutores empresa",
  tutor_centro: "Tutores centro",
  oferta: "Ofertas",
};

const ENTITY_LABEL_SINGULAR: Record<EntityType, string> = {
  empresa: "Empresa",
  centro_educativo: "Centro educativo",
  estudiante: "Estudiante",
  tutor_empresa: "Tutor de empresa",
  tutor_centro: "Tutor de centro",
  oferta: "Oferta",
};

function getProfileRoute(type: EntityType, id: string): string {
  switch (type) {
    case "empresa":
      return `/empresa/${id}`;
    case "centro_educativo":
      return `/centro/${id}`;
    case "estudiante":
      return `/estudiante/${id}`;
    case "tutor_empresa":
      return `/tutor-empresa/${id}`;
    case "tutor_centro":
      return `/tutor-centro/${id}`;
    case "oferta":
      return `/ofertas/${id}`;
    default:
      return `/perfiles/${id}`;
  }
}

// Color tokens por entidad
const EC: Record<
  EntityType,
  { accent: string; accentDim: string; accentMid: string }
> = {
  empresa: {
    accent: "#c0ff72",
    accentDim: "rgba(192,255,114,0.08)",
    accentMid: "rgba(192,255,114,0.18)",
  },
  centro_educativo: {
    accent: "#60a5fa",
    accentDim: "rgba(96,165,250,0.08)",
    accentMid: "rgba(96,165,250,0.18)",
  },
  estudiante: {
    accent: "#fb923c",
    accentDim: "rgba(251,146,60,0.08)",
    accentMid: "rgba(251,146,60,0.18)",
  },
  tutor_empresa: {
    accent: "#f472b6",
    accentDim: "rgba(244,114,182,0.08)",
    accentMid: "rgba(244,114,182,0.18)",
  },
  tutor_centro: {
    accent: "#34d399",
    accentDim: "rgba(52,211,153,0.08)",
    accentMid: "rgba(52,211,153,0.18)",
  },
  oferta: {
    accent: "#a78bfa",
    accentDim: "rgba(167,139,250,0.08)",
    accentMid: "rgba(167,139,250,0.18)",
  },
};

const DISP_COLOR: Record<string, { label: string; color: string }> = {
  inmediata: { label: "Disponible", color: "#4ade80" },
  "1_mes": { label: "En 1 mes", color: "#facc15" },
  "3_meses": { label: "En 3 meses", color: "#fb923c" },
  no_disponible: { label: "No disponible", color: "#f87171" },
};

const REL_META: Record<
  NonNullable<RelationStatus>,
  { label: string; color: string }
> = {
  matriculado: { label: "Matriculado", color: "#fb923c" },
  en_practicas: { label: "En prácticas", color: "#34d399" },
  finalizado: { label: "Finalizado", color: "#60a5fa" },
};

const SEARCH_PLACEHOLDER: Partial<Record<EntityType, string>> = {
  empresa: "Nombre, sector o ciudad…",
  centro_educativo: "Nombre o ciudad…",
  estudiante: "Nombre o titulación…",
  tutor_empresa: "Nombre o cargo…",
  tutor_centro: "Nombre o departamento…",
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconSearch = ({
  size = 16,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);
const IconX = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconChevronLeft = () => (
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
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const IconChevronRight = () => (
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
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const IconArrowRight = ({
  size = 13,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
const IconCheck = ({ size = 10 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconBuilding = ({
  size = 16,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <path d="M9 22V12h6v10" />
    <path d="M9 7h.01" />
    <path d="M12 7h.01" />
    <path d="M15 7h.01" />
    <path d="M9 11h.01" />
    <path d="M15 11h.01" />
  </svg>
);
const IconSchool = ({
  size = 16,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 22V12a2 2 0 0 0-4 0v10" />
    <path d="M22 10v12" />
    <path d="M2 10v12" />
    <path d="M12 2 2 7l10 5 10-5-10-5z" />
  </svg>
);
const IconUser = ({
  size = 16,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconUsers = ({
  size = 16,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ENTITY_ICON: Record<EntityType, (color: string) => React.ReactNode> = {
  empresa: (c) => <IconBuilding color={c} />,
  centro_educativo: (c) => <IconSchool color={c} />,
  estudiante: (c) => <IconUser color={c} />,
  tutor_empresa: (c) => <IconUsers color={c} />,
  tutor_centro: (c) => <IconUsers color={c} />,
  oferta: (c) => <IconBuilding color={c} />,
};

// ─── Hook: debounce ───────────────────────────────────────────────────────────

function useDebounce<T>(value: T, ms: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

// ─── SearchContext resolver ───────────────────────────────────────────────────

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
    const { data: t } = await supabase
      .from("tutor_centro")
      .select("id")
      .eq("usuario_id", userId)
      .maybeSingle();
    if (!t?.id) {
      ctx.tutorStudentIds = [];
      return ctx;
    }
    const { data: a } = await supabase
      .from("centro_estudiante")
      .select("id_estudiante")
      .eq("id_tutor", t.id);
    ctx.tutorStudentIds = (a ?? []).map((r) => r.id_estudiante);
  }
  if (role === "tutor_empresa") {
    const { data: t } = await supabase
      .from("tutor_empresa")
      .select("empresa_id")
      .eq("usuario_id", userId)
      .maybeSingle();
    if (!t?.empresa_id) {
      ctx.tutorStudentIds = [];
      return ctx;
    }
    ctx.empresaId = t.empresa_id;
    const { data: e } = await supabase
      .from("estudiante_estado")
      .select("id_estudiante")
      .eq("id_empresa", t.empresa_id)
      .in("estado", ["en_practicas", "finalizado"]);
    ctx.tutorStudentIds = (e ?? []).map((r) => r.id_estudiante);
  }
  return ctx;
}

// ─── Fetch functions ──────────────────────────────────────────────────────────

async function fetchEmpresas(
  term: string,
  page: number,
): Promise<{ data: ProfileCardData[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE,
    to = from + PAGE_SIZE - 1;
  let q = supabase
    .from("empresa")
    .select("id, nombre, sector, ciudad, logo_url, verificado, tamano", {
      count: "exact",
    });
  if (term)
    q = q.or(
      `nombre.ilike.%${term}%,sector.ilike.%${term}%,ciudad.ilike.%${term}%`,
    );
  const { data, count, error } = await q.range(from, to).order("nombre");
  if (error) return { data: [], total: 0 };
  return {
    data: (data ?? []).map((e) => ({
      id: e.id,
      type: "empresa" as const,
      name: e.nombre ?? "",
      avatarUrl: e.logo_url ?? undefined,
      subtitle: [e.sector, e.ciudad].filter(Boolean).join(" · "),
      tags: [e.tamano, e.sector].filter(Boolean) as string[],
      verificado: e.verificado,
    })),
    total: count ?? 0,
  };
}

async function fetchCentros(
  term: string,
  page: number,
): Promise<{ data: ProfileCardData[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE,
    to = from + PAGE_SIZE - 1;
  let q = supabase
    .from("centro_educativo")
    .select(
      "id, nombre, tipo_centro, ciudad, provincia, avatar_url, verificado, num_alumnos",
      { count: "exact" },
    );
  if (term)
    q = q.or(
      `nombre.ilike.%${term}%,ciudad.ilike.%${term}%,tipo_centro.ilike.%${term}%`,
    );
  const { data, count, error } = await q.range(from, to).order("nombre");
  if (error) return { data: [], total: 0 };
  return {
    data: (data ?? []).map((c) => ({
      id: c.id,
      type: "centro_educativo" as const,
      name: c.nombre ?? "",
      avatarUrl: c.avatar_url ?? undefined,
      subtitle: [c.tipo_centro, c.ciudad, c.provincia]
        .filter(Boolean)
        .join(" · "),
      tags: [
        c.tipo_centro,
        c.num_alumnos ? `${c.num_alumnos} alumnos` : null,
      ].filter(Boolean) as string[],
      verificado: c.verificado,
    })),
    total: count ?? 0,
  };
}

async function fetchEstudiantes(
  term: string,
  page: number,
  role: Role,
  ctx: SearchContext,
): Promise<{ data: ProfileCardData[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE,
    to = from + PAGE_SIZE - 1;
  if (ctx.tutorStudentIds !== null && ctx.tutorStudentIds.length === 0)
    return { data: [], total: 0 };
  let q = supabase
    .from("estudiante")
    .select(
      "id, nombre, apellidos, titulacion, ciudad, avatar_url, disponibilidad, habilidades",
      { count: "exact" },
    );
  if (term)
    q = q.or(
      `nombre.ilike.%${term}%,apellidos.ilike.%${term}%,titulacion.ilike.%${term}%,ciudad.ilike.%${term}%`,
    );
  if (ctx.tutorStudentIds !== null && ctx.tutorStudentIds.length > 0)
    q = q.in("id", ctx.tutorStudentIds);
  const { data, count, error } = await q.range(from, to).order("nombre");
  if (error) return { data: [], total: 0 };
  const relationMap = new Map<string, RelationStatus>();
  if (data?.length) {
    const ids = data.map((d) => d.id);
    if ((role === "empresa" || role === "tutor_empresa") && ctx.empresaId) {
      const { data: er } = await supabase
        .from("estudiante_estado")
        .select("id_estudiante, estado")
        .eq("id_empresa", ctx.empresaId)
        .in("id_estudiante", ids)
        .in("estado", ["en_practicas", "finalizado"]);
      (er ?? []).forEach((r) =>
        relationMap.set(r.id_estudiante, r.estado as RelationStatus),
      );
    }
    if (
      (role === "centro_educativo" || role === "tutor_centro") &&
      ctx.centroId
    ) {
      const { data: cr } = await supabase
        .from("centro_estudiante")
        .select("id_estudiante")
        .eq("id_centro", ctx.centroId)
        .in("id_estudiante", ids);
      (cr ?? []).forEach((r) =>
        relationMap.set(r.id_estudiante, "matriculado"),
      );
    }
  }
  return {
    data: (data ?? []).map((s) => ({
      id: s.id,
      type: "estudiante" as const,
      name: `${s.nombre ?? ""} ${s.apellidos ?? ""}`.trim(),
      avatarUrl: s.avatar_url ?? undefined,
      subtitle: [s.titulacion, s.ciudad].filter(Boolean).join(" · "),
      tags: ((s.habilidades as string[] | null) ?? []).slice(0, 3),
      disponibilidad: s.disponibilidad ?? undefined,
      relationStatus: relationMap.get(s.id) ?? null,
    })),
    total: count ?? 0,
  };
}

async function fetchTutoresEmpresa(
  term: string,
  page: number,
  role: Role,
  ctx: SearchContext,
): Promise<{ data: ProfileCardData[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE,
    to = from + PAGE_SIZE - 1;
  let q = supabase
    .from("tutor_empresa")
    .select("id, nombre, cargo, empresa_id", { count: "exact" });
  if (term) q = q.or(`nombre.ilike.%${term}%,cargo.ilike.%${term}%`);
  if (role === "empresa" && ctx.empresaId)
    q = q.eq("empresa_id", ctx.empresaId);
  const { data, count, error } = await q.range(from, to).order("nombre");
  if (error || !data?.length) return { data: [], total: 0 };
  const empresaIds = [
    ...new Set(data.map((t) => t.empresa_id).filter(Boolean)),
  ];
  let empMap: Record<string, string> = {};
  if (empresaIds.length) {
    const { data: emps } = await supabase
      .from("empresa")
      .select("id, nombre")
      .in("id", empresaIds);
    empMap = Object.fromEntries((emps ?? []).map((e) => [e.id, e.nombre]));
  }
  return {
    data: data.map((t) => ({
      id: t.id,
      type: "tutor_empresa" as const,
      name: t.nombre ?? "",
      subtitle: [empMap[t.empresa_id] ?? null, t.cargo]
        .filter(Boolean)
        .join(" · "),
      tags: [t.cargo].filter(Boolean) as string[],
    })),
    total: count ?? 0,
  };
}

async function fetchTutoresCentro(
  term: string,
  page: number,
  role: Role,
  ctx: SearchContext,
): Promise<{ data: ProfileCardData[]; total: number }> {
  const from = (page - 1) * PAGE_SIZE,
    to = from + PAGE_SIZE - 1;
  let q = supabase
    .from("tutor_centro")
    .select("id, nombre, departamento, centro_id", { count: "exact" });
  if (term) q = q.or(`nombre.ilike.%${term}%,departamento.ilike.%${term}%`);
  if (role === "centro_educativo" && ctx.centroId)
    q = q.eq("centro_id", ctx.centroId);
  const { data, count, error } = await q.range(from, to).order("nombre");
  if (error || !data?.length) return { data: [], total: 0 };
  const centroIds = [...new Set(data.map((t) => t.centro_id).filter(Boolean))];
  let centroMap: Record<string, string> = {};
  if (centroIds.length) {
    const { data: cs } = await supabase
      .from("centro_educativo")
      .select("id, nombre")
      .in("id", centroIds);
    centroMap = Object.fromEntries((cs ?? []).map((c) => [c.id, c.nombre]));
  }
  return {
    data: data.map((t) => ({
      id: t.id,
      type: "tutor_centro" as const,
      name: t.nombre ?? "",
      subtitle: [centroMap[t.centro_id] ?? null, t.departamento]
        .filter(Boolean)
        .join(" · "),
      tags: [t.departamento].filter(Boolean) as string[],
    })),
    total: count ?? 0,
  };
}

async function fetchProfiles(
  type: EntityType,
  term: string,
  page: number,
  role: Role,
  ctx: SearchContext,
): Promise<{ data: ProfileCardData[]; total: number }> {
  switch (type) {
    case "empresa":
      return fetchEmpresas(term, page);
    case "centro_educativo":
      return fetchCentros(term, page);
    case "estudiante":
      return fetchEstudiantes(term, page, role, ctx);
    case "tutor_empresa":
      return fetchTutoresEmpresa(term, page, role, ctx);
    case "tutor_centro":
      return fetchTutoresCentro(term, page, role, ctx);
    default:
      return { data: [], total: 0 };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CardAvatar({
  url,
  name,
  entityType,
}: {
  url?: string;
  name: string;
  entityType: EntityType;
}) {
  const ec = EC[entityType];
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  if (url)
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          objectFit: "cover",
          flexShrink: 0,
          border: `1px solid ${ec.accentMid}`,
        }}
      />
    );
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: ec.accentDim,
        border: `1px solid ${ec.accentMid}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 700,
        color: ec.accent,
        fontFamily: "'DM Sans', sans-serif",
        flexShrink: 0,
        letterSpacing: "-0.01em",
      }}
    >
      {initials || "?"}
    </div>
  );
}

function ProfileCard({
  card,
  onClick,
}: {
  card: ProfileCardData;
  onClick: () => void;
}) {
  const ec = EC[card.type];
  const [hovered, setHovered] = useState(false);
  const disp = card.disponibilidad ? DISP_COLOR[card.disponibilidad] : null;
  const rel = card.relationStatus ? REL_META[card.relationStatus] : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? ec.accentDim : "var(--color-surface-strong)",
        border: `1px solid ${hovered ? ec.accentMid : "var(--color-border)"}`,
        borderRadius: 14,
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          height: 3,
          background: hovered ? ec.accent : "transparent",
          transition: "background 0.2s",
        }}
      />

      <div style={{ padding: "20px 20px 18px" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 14,
            gap: 10,
          }}
        >
          <CardAvatar
            url={card.avatarUrl}
            name={card.name}
            entityType={card.type}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 5,
            }}
          >
            {card.verificado && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#c0ff72",
                  background: "rgba(192,255,114,0.08)",
                  border: "1px solid rgba(192,255,114,0.2)",
                  padding: "2px 7px",
                  borderRadius: 20,
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.04em",
                }}
              >
                <IconCheck size={9} /> Verificado
              </div>
            )}
            {rel && (
              <div
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "2px 7px",
                  borderRadius: 20,
                  background: `${rel.color}14`,
                  color: rel.color,
                  border: `1px solid ${rel.color}33`,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {rel.label}
              </div>
            )}
          </div>
        </div>

        {/* Name + type */}
        <div
          style={{
            marginBottom: 4,
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text)",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {card.name}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginBottom: 10,
          }}
        >
          <span
            style={{ color: ec.accent, display: "flex", alignItems: "center" }}
          >
            {ENTITY_ICON[card.type](ec.accent)}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: ec.accent,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "0.01em",
            }}
          >
            {ENTITY_LABEL_SINGULAR[card.type]}
          </span>
        </div>

        {card.subtitle && (
          <div
            style={{
              fontSize: 12.5,
              color: "var(--color-text-muted)",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: 12,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.4,
            }}
          >
            {card.subtitle}
          </div>
        )}

        {card.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
              marginBottom: 14,
            }}
          >
            {card.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 10.5,
                  padding: "3px 9px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--color-text-subtle)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {disp ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 500,
                color: disp.color,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: disp.color,
                  flexShrink: 0,
                }}
              />
              {disp.label}
            </div>
          ) : (
            <span />
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11.5,
              fontWeight: 600,
              color: hovered ? ec.accent : "var(--color-text-subtle)",
              fontFamily: "'DM Sans', sans-serif",
              transition: "color 0.2s",
            }}
          >
            Ver perfil
            <IconArrowRight
              size={11}
              color={hovered ? ec.accent : "currentColor"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--color-surface-strong)",
        border: "1px solid var(--color-border)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div style={{ height: 3, background: "rgba(255,255,255,0.04)" }} />
      <div style={{ padding: "20px 20px 18px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              animation: "sk-pulse 1.5s ease infinite",
              flexShrink: 0,
            }}
          />
        </div>
        <div
          style={{
            width: "65%",
            height: 13,
            borderRadius: 6,
            background: "rgba(255,255,255,0.05)",
            marginBottom: 8,
            animation: "sk-pulse 1.5s ease infinite 0.1s",
          }}
        />
        <div
          style={{
            width: 80,
            height: 11,
            borderRadius: 6,
            background: "rgba(255,255,255,0.04)",
            marginBottom: 12,
            animation: "sk-pulse 1.5s ease infinite 0.2s",
          }}
        />
        <div
          style={{
            width: "50%",
            height: 11,
            borderRadius: 6,
            background: "rgba(255,255,255,0.04)",
            animation: "sk-pulse 1.5s ease infinite 0.3s",
          }}
        />
      </div>
    </div>
  );
}

function EmptyState({
  type,
  term,
  ec,
}: {
  type: EntityType;
  term: string;
  ec: (typeof EC)[EntityType];
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        gap: 16,
        textAlign: "center",
        gridColumn: "1 / -1",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: ec.accentDim,
          border: `1px solid ${ec.accentMid}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ec.accent,
        }}
      >
        <IconSearch size={20} color={ec.accent} />
      </div>
      <div>
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text)",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          {term
            ? `Sin resultados para "${term}"`
            : `No hay ${ENTITY_LABELS[type].toLowerCase()} aún`}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "var(--color-text-muted)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {term
            ? "Prueba con otro término de búsqueda."
            : "Los perfiles aparecerán aquí cuando estén disponibles."}
        </p>
      </div>
    </div>
  );
}

function Pagination({
  page,
  total,
  onPageChange,
  ec,
}: {
  page: number;
  total: number;
  onPageChange: (p: number) => void;
  ec: (typeof EC)[EntityType];
}) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 4) pages.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 3) pages.push("…");
    pages.push(totalPages);
  }
  const btn = (
    content: React.ReactNode,
    action: () => void,
    active = false,
    disabled = false,
  ) => (
    <button
      onClick={action}
      disabled={disabled}
      style={{
        minWidth: 34,
        height: 34,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        border: active
          ? `1px solid ${ec.accentMid}`
          : "1px solid var(--color-border)",
        background: active ? ec.accentDim : "transparent",
        color: active ? ec.accent : "var(--color-text-muted)",
        fontSize: 13,
        fontWeight: active ? 700 : 400,
        fontFamily: "'DM Sans', sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        transition: "all 0.15s",
        padding: "0 6px",
      }}
    >
      {content}
    </button>
  );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        marginTop: 36,
        flexWrap: "wrap",
      }}
    >
      {btn(<IconChevronLeft />, () => onPageChange(page - 1), false, page <= 1)}
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`el-${i}`}
            style={{
              color: "var(--color-text-subtle)",
              fontSize: 13,
              padding: "0 4px",
            }}
          >
            …
          </span>
        ) : (
          btn(p, () => onPageChange(p as number), p === page)
        ),
      )}
      {btn(
        <IconChevronRight />,
        () => onPageChange(page + 1),
        false,
        page >= totalPages,
      )}
    </div>
  );
}

// ─── Main: ProfilesPage ───────────────────────────────────────────────────────

export default function ProfilesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = (user?.user_metadata?.rol as Role) ?? "estudiante";
  const userId = user?.id ?? "";
  const allowedTypes = ROLE_PERMISSIONS[role] ?? [];

  const [activeType, setActiveType] = useState<EntityType>(
    allowedTypes[0] ?? "empresa",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<ProfileCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchCtx, setSearchCtx] = useState<SearchContext>({
    empresaId: null,
    centroId: null,
    tutorStudentIds: null,
  });
  const [typeCounts, setTypeCounts] = useState<
    Partial<Record<EntityType, number>>
  >({});

  const debouncedTerm = useDebounce(searchTerm, 280);
  const ec = EC[activeType];

  useEffect(() => {
    if (userId) resolveSearchContext(role, userId).then(setSearchCtx);
  }, [role, userId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProfiles(activeType, debouncedTerm, page, role, searchCtx).then(
      ({ data, total }) => {
        if (!cancelled) {
          setResults(data);
          setTotal(total);
          setLoading(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [activeType, debouncedTerm, page, role, searchCtx]);

  useEffect(() => {
    setPage(1);
  }, [activeType, debouncedTerm]);

  useEffect(() => {
    if (!searchCtx || allowedTypes.length === 0) return;
    const counts: Partial<Record<EntityType, number>> = {};
    Promise.all(
      allowedTypes.map(async (t) => {
        const { total } = await fetchProfiles(t, "", 1, role, searchCtx);
        counts[t] = total;
      }),
    ).then(() => setTypeCounts({ ...counts }));
  }, [searchCtx, role]);

  const handleCardClick = (card: ProfileCardData) =>
    navigate(getProfileRoute(card.type, card.id));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getTabLabel = (type: EntityType) => {
    if (type === "estudiante" && role === "tutor_centro")
      return "Mis tutorizados";
    if (type === "estudiante" && role === "tutor_empresa")
      return "En prácticas";
    return ENTITY_LABELS[type];
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        paddingTop: 80,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
        @keyframes sk-pulse { 0%,100% { opacity:0.4 } 50% { opacity:0.9 } }
        @keyframes spin { to { transform:rotate(360deg) } }
        *::-webkit-scrollbar { width:0; height:0 }
      `}</style>

      <div
        style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 24px 100px" }}
      >
        {/* ── Page Header ── */}
        <div
          style={{
            marginBottom: 40,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: ec.accent,
                fontFamily: "'DM Mono', monospace",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div style={{ width: 18, height: 1, background: ec.accent }} />
              Directorio
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 800,
                color: "var(--color-text)",
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "-0.035em",
                lineHeight: 1.1,
              }}
            >
              Perfiles de la plataforma
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 14,
                color: "var(--color-text-muted)",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.5,
              }}
            >
              Explora y conecta con{" "}
              {allowedTypes
                .map((t) => ENTITY_LABELS[t].toLowerCase())
                .join(", ")}
              .
            </p>
          </div>
          {!loading && total > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 10,
                background: ec.accentDim,
                border: `1px solid ${ec.accentMid}`,
              }}
            >
              <span style={{ color: ec.accent }}>
                {ENTITY_ICON[activeType](ec.accent)}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: ec.accent,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {total}{" "}
                {total === 1
                  ? ENTITY_LABEL_SINGULAR[activeType]
                  : ENTITY_LABELS[activeType]}
              </span>
            </div>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div
          style={{
            background: "var(--color-surface-strong)",
            border: "1px solid var(--color-border)",
            borderRadius: 16,
            padding: "16px 18px",
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--color-bg)",
              border: `1px solid ${searchTerm ? ec.accentMid : "var(--color-border-strong)"}`,
              borderRadius: 10,
              padding: "10px 14px",
              transition: "border-color 0.2s",
            }}
          >
            {loading ? (
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "1.5px solid var(--color-border-strong)",
                  borderTopColor: ec.accent,
                  animation: "spin 0.7s linear infinite",
                  flexShrink: 0,
                }}
              />
            ) : (
              <IconSearch
                size={15}
                color={searchTerm ? ec.accent : "var(--color-text-subtle)"}
              />
            )}
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={SEARCH_PLACEHOLDER[activeType] ?? "Buscar perfiles…"}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--color-text)",
                fontSize: 13.5,
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-subtle)",
                  display: "flex",
                  alignItems: "center",
                  padding: 2,
                }}
              >
                <IconX size={13} />
              </button>
            )}
          </div>

          {/* Tabs */}
          {allowedTypes.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                overflowX: "auto",
                paddingBottom: 2,
              }}
            >
              {allowedTypes.map((type) => {
                const tec = EC[type];
                const isActive = activeType === type;
                const count = typeCounts[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setActiveType(type);
                      setSearchTerm("");
                      setPage(1);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 13px",
                      borderRadius: 8,
                      border: isActive
                        ? `1px solid ${tec.accentMid}`
                        : "1px solid var(--color-border)",
                      background: isActive ? tec.accentDim : "transparent",
                      color: isActive ? tec.accent : "var(--color-text-subtle)",
                      fontSize: 12.5,
                      fontWeight: isActive ? 600 : 400,
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        color: isActive
                          ? tec.accent
                          : "var(--color-text-subtle)",
                        opacity: isActive ? 1 : 0.5,
                        display: "flex",
                      }}
                    >
                      {ENTITY_ICON[type](
                        isActive ? tec.accent : "currentColor",
                      )}
                    </span>
                    {getTabLabel(type)}
                    {count !== undefined && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: 20,
                          background: isActive
                            ? `${tec.accent}18`
                            : "rgba(255,255,255,0.05)",
                          color: isActive
                            ? tec.accent
                            : "var(--color-text-subtle)",
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {count > 999 ? "999+" : count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Results meta ── */}
        {!loading && total > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-subtle)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Mostrando{" "}
              <strong
                style={{
                  color: "var(--color-text-secondary)",
                  fontWeight: 600,
                }}
              >
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
              </strong>{" "}
              de{" "}
              <strong
                style={{
                  color: "var(--color-text-secondary)",
                  fontWeight: 600,
                }}
              >
                {total}
              </strong>{" "}
              {ENTITY_LABELS[activeType].toLowerCase()}
              {searchTerm && (
                <span style={{ color: ec.accent }}> · «{searchTerm}»</span>
              )}
            </span>
            {totalPages > 1 && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-subtle)",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {page} / {totalPages}
              </span>
            )}
          </div>
        )}

        {/* ── Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {loading ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : results.length === 0 ? (
            <EmptyState type={activeType} term={searchTerm} ec={ec} />
          ) : (
            results.map((card) => (
              <ProfileCard
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card)}
              />
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {!loading && (
          <Pagination
            page={page}
            total={total}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            ec={ec}
          />
        )}
      </div>
    </div>
  );
}
