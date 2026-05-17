/**
 * UserProfilePage.tsx — v4 Rediseño profesional
 *
 * Página completa de perfil. Accesible mediante:
 *   /empresa/:id  |  /centro/:id  |  /estudiante/:id
 *   /tutor-empresa/:id  |  /tutor-centro/:id
 *
 * Sin emojis — todos los iconos son SVG inline.
 * Diseño editorial refinado, tipografía DM Sans + DM Mono.
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewerRole =
  | "administrador"
  | "estudiante"
  | "empresa"
  | "centro_educativo"
  | "tutor_centro"
  | "tutor_empresa";
type EntityType = "empresa" | "centro_educativo" | "estudiante" | "oferta";

interface Estudiante {
  id: string;
  nombre: string;
  apellidos: string;
  email?: string;
  titulacion?: string;
  ciudad?: string;
  telefono?: string;
  sobre_mi?: string;
  disponibilidad?: string;
  tipo_busqueda?: string;
  modalidad?: string;
  habilidades?: string[];
  avatar_url?: string;
  perfil_publico?: boolean;
  github_username?: string;
  formaciones?: unknown[];
  proyectos?: unknown[];
  redes_sociales?: Record<string, string>;
  created_at?: string;
}
interface Empresa {
  id: string;
  nombre: string;
  sector?: string;
  ciudad?: string;
  descripcion?: string;
  email_contacto?: string;
  telefono?: string;
  web?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  logo_url?: string;
  verificado?: boolean;
  tamano?: string;
  cif?: string;
  created_at?: string;
}
interface CentroEducativo {
  id: string;
  nombre: string;
  tipo_centro?: string;
  ciudad?: string;
  provincia?: string;
  descripcion?: string;
  email_contacto?: string;
  telefono?: string;
  sitio_web?: string;
  avatar_url?: string;
  verificado?: boolean;
  num_alumnos?: number;
  titulaciones?: string[];
  created_at?: string;
}
type ProfileData = Estudiante | Empresa | CentroEducativo;

interface ActionState {
  loading: boolean;
  success: string | null;
  error: string | null;
}
interface SuggestedProfile {
  id: string;
  name: string;
  subtitle: string;
  avatarUrl?: string;
  href: string;
  type: EntityType;
  reason: string;
}
interface Candidatura {
  id_candidatura: number;
  estado: string;
  fecha_envio: string;
  comentario_empresa?: string;
  id_oferta: string;
  titulo_oferta?: string;
}
interface Valoracion {
  id: string;
  puntuacion: number;
  created_at: string;
}

export interface UserProfilePageProps {
  entityType?: EntityType;
  entityId?: string;
  onBack?: () => void;
}

// ─── Route inference ──────────────────────────────────────────────────────────

function inferFromPath(): {
  entityType: EntityType | null;
  entityId: string | null;
} {
  const parts = window.location.pathname.replace(/^\//, "").split("/");
  if (parts.length < 2) return { entityType: null, entityId: null };
  const [segment, id] = parts;
  if (!id) return { entityType: null, entityId: null };
  const map: Record<string, EntityType> = {
    empresa: "empresa",
    centro: "centro_educativo",
    estudiante: "estudiante",
  };
  return { entityType: map[segment] ?? null, entityId: id };
}

function inferTutorType(): "tutor_empresa" | "tutor_centro" | null {
  const parts = window.location.pathname.replace(/^\//, "").split("/");
  if (parts[0] === "tutor-empresa") return "tutor_empresa";
  if (parts[0] === "tutor-centro") return "tutor_centro";
  return null;
}

// ─── Constants & Tokens ───────────────────────────────────────────────────────

const ENTITY_LABELS: Record<
  EntityType | "tutor_empresa" | "tutor_centro",
  string
> = {
  empresa: "Empresa",
  centro_educativo: "Centro Educativo",
  estudiante: "Estudiante",
  oferta: "Oferta",
  tutor_empresa: "Tutor de empresa",
  tutor_centro: "Tutor de centro",
};

const EC: Record<
  EntityType | "tutor_empresa" | "tutor_centro",
  { accent: string; accentDim: string; accentMid: string; accentGlow: string }
> = {
  empresa: {
    accent: "#c0ff72",
    accentDim: "rgba(192,255,114,0.07)",
    accentMid: "rgba(192,255,114,0.2)",
    accentGlow: "rgba(192,255,114,0.08)",
  },
  centro_educativo: {
    accent: "#60a5fa",
    accentDim: "rgba(96,165,250,0.07)",
    accentMid: "rgba(96,165,250,0.2)",
    accentGlow: "rgba(96,165,250,0.08)",
  },
  estudiante: {
    accent: "#fb923c",
    accentDim: "rgba(251,146,60,0.07)",
    accentMid: "rgba(251,146,60,0.2)",
    accentGlow: "rgba(251,146,60,0.08)",
  },
  oferta: {
    accent: "#a78bfa",
    accentDim: "rgba(167,139,250,0.07)",
    accentMid: "rgba(167,139,250,0.2)",
    accentGlow: "rgba(167,139,250,0.08)",
  },
  tutor_empresa: {
    accent: "#f472b6",
    accentDim: "rgba(244,114,182,0.07)",
    accentMid: "rgba(244,114,182,0.2)",
    accentGlow: "rgba(244,114,182,0.08)",
  },
  tutor_centro: {
    accent: "#34d399",
    accentDim: "rgba(52,211,153,0.07)",
    accentMid: "rgba(52,211,153,0.2)",
    accentGlow: "rgba(52,211,153,0.08)",
  },
};

const DISP_COLOR: Record<string, { label: string; color: string }> = {
  inmediata: { label: "Disponible ahora", color: "#4ade80" },
  "1_mes": { label: "Disponible en 1 mes", color: "#facc15" },
  "3_meses": { label: "Disponible en 3 meses", color: "#fb923c" },
  no_disponible: { label: "No disponible", color: "#f87171" },
};

const CAND_COLOR: Record<string, { color: string; label: string }> = {
  pendiente: { color: "#facc15", label: "Pendiente" },
  aceptada: { color: "#4ade80", label: "Aceptada" },
  rechazada: { color: "#f87171", label: "Rechazada" },
  en_proceso: { color: "#60a5fa", label: "En proceso" },
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const I = {
  ArrowLeft: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  ArrowRight: ({
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
  ),
  Check: ({ size = 10 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
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
  MapPin: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Mail: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Phone: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Globe: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  GraduationCap: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  Briefcase: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  GitHub: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  Linkedin: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  Twitter: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  ),
  Building: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M9 22V12h6v10" />
      <path d="M9 7h.01M12 7h.01M15 7h.01M9 11h.01M15 11h.01" />
    </svg>
  ),
  Users: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Calendar: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Star: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  FileText: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  Activity: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Info: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  ExternalLink: () => (
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Shield: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Layers: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Link: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  MessageSquare: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Lock: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Unlock: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  BookOpen: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Code: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Bookmark: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  ),
  Hash: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  ),
};

// ─── Atom Components ──────────────────────────────────────────────────────────

function Avatar({
  url,
  name,
  size = 80,
  ec,
}: {
  url?: string;
  name: string;
  size?: number;
  ec: (typeof EC)[keyof typeof EC];
}) {
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
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.2),
          objectFit: "cover",
          border: `1.5px solid ${ec.accentMid}`,
          flexShrink: 0,
        }}
      />
    );
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.2),
        background: ec.accentDim,
        border: `1.5px solid ${ec.accentMid}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.28,
        fontWeight: 700,
        color: ec.accent,
        fontFamily: "'DM Sans', sans-serif",
        flexShrink: 0,
        letterSpacing: "-0.02em",
      }}
    >
      {initials || "?"}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
  noPad,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  noPad?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--color-surface-strong)",
        border: "1px solid var(--color-border)",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "13px 20px 11px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {icon && (
          <span style={{ color: "var(--color-text-subtle)", display: "flex" }}>
            {icon}
          </span>
        )}
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-subtle)",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {title}
        </span>
      </div>
      <div style={noPad ? {} : { padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "9px 0",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span
        style={{
          color: "var(--color-text-subtle)",
          flexShrink: 0,
          marginTop: 1,
          display: "flex",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: 11.5,
          minWidth: 90,
          color: "var(--color-text-subtle)",
          fontFamily: "'DM Sans', sans-serif",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            color: "var(--color-brand, #c0ff72)",
            fontFamily: "'DM Sans', sans-serif",
            wordBreak: "break-word",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {value} <I.ExternalLink />
        </a>
      ) : (
        <span
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            fontFamily: "'DM Sans', sans-serif",
            wordBreak: "break-word",
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        padding: "4px 11px",
        borderRadius: 6,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.09)",
        color: "var(--color-text-secondary)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <I.Hash />
      {label}
    </span>
  );
}

function AccentTag({
  label,
  ec,
}: {
  label: string;
  ec: (typeof EC)[keyof typeof EC];
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        fontSize: 12,
        padding: "4px 11px",
        borderRadius: 6,
        background: ec.accentDim,
        border: `1px solid ${ec.accentMid}`,
        color: ec.accent,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}

function StatBadge({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "var(--color-surface-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "14px 18px",
        flex: 1,
        minWidth: 80,
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: color ?? "var(--color-text)",
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1,
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--color-text-subtle)",
          fontFamily: "'DM Sans', sans-serif",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  variant = "secondary",
  onClick,
  loading: l,
  disabled,
  danger,
  icon,
}: {
  label: string;
  variant?: "primary" | "secondary";
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 9,
    fontSize: 12.5,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: disabled || l ? "not-allowed" : "pointer",
    border: "1px solid",
    transition: "all 0.15s",
    opacity: disabled || l ? 0.45 : 1,
    letterSpacing: "-0.01em",
  };
  const styles: React.CSSProperties =
    variant === "primary"
      ? {
          ...base,
          background: danger
            ? "rgba(239,68,68,0.1)"
            : "var(--color-brand, #c0ff72)",
          color: danger ? "#f87171" : "#0d1a05",
          borderColor: danger ? "rgba(239,68,68,0.3)" : "transparent",
        }
      : {
          ...base,
          background: "transparent",
          color: danger ? "#f87171" : "var(--color-text-secondary)",
          borderColor: danger
            ? "rgba(239,68,68,0.2)"
            : "var(--color-border-strong)",
        };
  return (
    <button onClick={onClick} disabled={disabled || l} style={styles}>
      {l ? (
        <div
          style={{
            width: 11,
            height: 11,
            borderRadius: "50%",
            border: "1.5px solid currentColor",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }}
        />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        padding: "11px 16px",
        borderRadius: 10,
        background:
          type === "success" ? "rgba(192,255,114,0.1)" : "rgba(239,68,68,0.1)",
        border: `1px solid ${type === "success" ? "rgba(192,255,114,0.25)" : "rgba(239,68,68,0.25)"}`,
        color: type === "success" ? "#c0ff72" : "#f87171",
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        animation: "fade-up 0.2s ease forwards",
      }}
    >
      {type === "success" ? <I.Check size={11} /> : "×"} {message}
    </div>
  );
}

function SkillBar({ skill }: { skill: string }) {
  const hash = skill.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pct = 45 + (hash % 50);
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <span
          style={{
            fontSize: 12.5,
            color: "var(--color-text-secondary)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {skill}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-subtle)",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {pct}%
        </span>
      </div>
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: "rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 2,
            background: "linear-gradient(90deg, #c0ff72 0%, #60a5fa 100%)",
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

function CandidaturaRow({ c }: { c: Candidatura }) {
  const col = CAND_COLOR[c.estado] ?? { color: "#6b7280", label: c.estado };
  const date = new Date(c.fecha_envio).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--color-text)",
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {c.titulo_oferta ?? `Oferta #${c.id_candidatura}`}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--color-text-subtle)",
            fontFamily: "'DM Mono', monospace",
            marginTop: 2,
          }}
        >
          {date}
        </div>
      </div>
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "3px 9px",
          borderRadius: 6,
          background: `${col.color}14`,
          color: col.color,
          border: `1px solid ${col.color}30`,
          fontFamily: "'DM Sans', sans-serif",
          flexShrink: 0,
        }}
      >
        {col.label}
      </span>
    </div>
  );
}

function SuggestedCard({
  profile,
}: {
  profile: {
    id: string;
    name: string;
    subtitle: string;
    avatarUrl?: string;
    href: string;
    type: EntityType;
    reason: string;
  };
}) {
  const ec = EC[profile.type];
  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={profile.href}
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: hovered ? ec.accentDim : "var(--color-surface-strong)",
          border: `1px solid ${hovered ? ec.accentMid : "var(--color-border)"}`,
          borderRadius: 12,
          padding: 14,
          transition: "all 0.18s",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                objectFit: "cover",
                border: `1px solid ${ec.accentMid}`,
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: ec.accentDim,
                border: `1px solid ${ec.accentMid}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: ec.accent,
                fontFamily: "'DM Sans', sans-serif",
                flexShrink: 0,
              }}
            >
              {initials || "?"}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--color-text)",
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "-0.01em",
              }}
            >
              {profile.name}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--color-text-muted)",
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {profile.subtitle}
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: 10.5,
            color: ec.accent,
            fontFamily: "'DM Sans', sans-serif",
            background: ec.accentDim,
            padding: "2px 8px",
            borderRadius: 5,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            alignSelf: "flex-start",
            fontWeight: 500,
          }}
        >
          <I.Link /> {profile.reason}
        </span>
      </div>
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserProfilePage({
  entityType: propEntityType,
  entityId: propEntityId,
  onBack,
}: UserProfilePageProps) {
  const { user } = useAuth();
  const viewerRole: ViewerRole =
    (user?.user_metadata?.rol as ViewerRole) ?? "estudiante";
  const viewerId = user?.id ?? "";

  const tutorType = !propEntityType ? inferTutorType() : null;
  const resolved = !propEntityType || !propEntityId ? inferFromPath() : null;
  const rawEntityType: EntityType | null =
    propEntityType ?? resolved?.entityType ?? null;
  const entityId: string = propEntityId ?? resolved?.entityId ?? "";
  const isTutorPage = tutorType !== null && !propEntityType;
  const effectiveType: EntityType | "tutor_empresa" | "tutor_centro" =
    tutorType ?? rawEntityType ?? "estudiante";
  const ec = EC[effectiveType];

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tutorProfile, setTutorProfile] = useState<{
    id: string;
    nombre: string;
    cargo?: string;
    departamento?: string;
    empresa_id?: string;
    centro_id?: string;
    avatar_url?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({
    loading: false,
    success: null,
    error: null,
  });
  // const [suggestions, setSuggestions] = useState<
  //   ReturnType<typeof SuggestedCard> extends React.ReactElement
  //     ? never
  //     : Parameters<typeof SuggestedCard>[0]["profile"][]
  // >([]);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [stats, setStats] = useState<{
    candidaturas: number;
    ofertas: number;
    estudiantes: number;
    valoracion?: number;
  }>({ candidaturas: 0, ofertas: 0, estudiantes: 0 });
  const [viewerContext, setViewerContext] = useState<{
    centroId?: string;
    empresaId?: string;
    centroEstudiante?: string;
    isMiEstudiante?: boolean;
    isEnrolledEstudiante?: boolean;
    isMyPracticasStudent?: boolean;
  }>({});
  const [userBlock, setUserBlock] = useState<{ blocked: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "info" | "candidaturas" | "actividad"
  >("info");

  // ── Load profile ──
  useEffect(() => {
    if (!entityId) return;
    const load = async () => {
      try {
        setLoading(true);
        if (isTutorPage && tutorType) {
          const table =
            tutorType === "tutor_empresa" ? "tutor_empresa" : "tutor_centro";
          const fields =
            tutorType === "tutor_empresa"
              ? "id, nombre, cargo, empresa_id, avatar_url"
              : "id, nombre, departamento, centro_id, avatar_url";
          const { data, error: e } = await supabase
            .from(table)
            .select(fields)
            .eq("id", entityId)
            .maybeSingle();
          if (e || !data) {
            setError(e?.message ?? "No encontrado");
            return;
          }
          setTutorProfile(data as any);
          return;
        }
        const table =
          rawEntityType === "empresa"
            ? "empresa"
            : rawEntityType === "centro_educativo"
              ? "centro_educativo"
              : "estudiante";
        const { data, error: e } = await supabase
          .from(table)
          .select("*")
          .eq("id", entityId)
          .maybeSingle();
        if (e || !data) {
          setError(e?.message ?? "No encontrado");
          return;
        }
        setProfile(data as ProfileData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [entityId, rawEntityType, isTutorPage, tutorType]);

  // ── Load extras ──
  useEffect(() => {
    if (isTutorPage || !profile) return;
    const loadExtras = async () => {
      const loads: Promise<void>[] = [];
      if (rawEntityType === "estudiante") {
        loads.push(
          (async () => {
            const { count: nCand } = await supabase
              .from("candidatura")
              .select("id_candidatura", { count: "exact", head: true })
              .eq("id_estudiante", entityId);
            const { data: candData } = await supabase
              .from("candidatura")
              .select(
                "id_candidatura, estado, fecha_envio, comentario_empresa, id_oferta",
              )
              .eq("id_estudiante", entityId)
              .order("fecha_envio", { ascending: false })
              .limit(10);
            const enriched: Candidatura[] = await Promise.all(
              (candData ?? []).map(async (c) => {
                const { data: oferta } = await supabase
                  .from("oferta")
                  .select("titulo")
                  .eq("id_oferta", c.id_oferta)
                  .maybeSingle();
                return { ...c, titulo_oferta: oferta?.titulo };
              }),
            );
            setCandidaturas(enriched);
            setStats((s) => ({ ...s, candidaturas: nCand ?? 0 }));
          })(),
        );
      }
      if (rawEntityType === "empresa") {
        loads.push(
          (async () => {
            const [{ count: nOfertas }, valData] = await Promise.all([
              supabase
                .from("oferta")
                .select("id_oferta", { count: "exact", head: true })
                .eq("id_empresa", entityId),
              supabase
                .from("valoracion_empresa")
                .select("puntuacion")
                .eq("id_empresa", entityId),
            ]);
            const vals = valData.data ?? [];
            const avg = vals.length
              ? vals.reduce((a, v) => a + Number(v.puntuacion), 0) / vals.length
              : undefined;
            setStats((s) => ({
              ...s,
              ofertas: nOfertas ?? 0,
              valoracion: avg ? parseFloat(avg.toFixed(1)) : undefined,
            }));
          })(),
        );
      }
      if (rawEntityType === "centro_educativo") {
        loads.push(
          (async () => {
            const { count: nEst } = await supabase
              .from("centro_estudiante")
              .select("id", { count: "exact", head: true })
              .eq("id_centro", entityId);
            setStats((s) => ({ ...s, estudiantes: nEst ?? 0 }));
          })(),
        );
      }
      // Suggestions
      loads.push(
        (async () => {
          const sugs: Parameters<typeof SuggestedCard>[0]["profile"][] = [];
          if (rawEntityType === "estudiante") {
            const est = profile as Estudiante;
            const { data: centroLink } = await supabase
              .from("centro_estudiante")
              .select("id_centro")
              .eq("id_estudiante", entityId)
              .maybeSingle();
            if (centroLink?.id_centro) {
              const { data: comp } = await supabase
                .from("centro_estudiante")
                .select("id_estudiante")
                .eq("id_centro", centroLink.id_centro)
                .neq("id_estudiante", entityId)
                .limit(4);
              if (comp?.length) {
                const { data: profs } = await supabase
                  .from("estudiante")
                  .select(
                    "id, nombre, apellidos, titulacion, ciudad, avatar_url",
                  )
                  .in(
                    "id",
                    comp.map((c) => c.id_estudiante),
                  );
                (profs ?? []).forEach((p) =>
                  sugs.push({
                    id: p.id,
                    type: "estudiante",
                    name: `${p.nombre ?? ""} ${p.apellidos ?? ""}`.trim(),
                    subtitle: [p.titulacion, p.ciudad]
                      .filter(Boolean)
                      .join(" · "),
                    avatarUrl: p.avatar_url,
                    href: `/estudiante/${p.id}`,
                    reason: "Mismo centro",
                  }),
                );
              }
            }
            if (sugs.length < 4 && est.titulacion) {
              const existing = new Set([...sugs.map((s) => s.id), entityId]);
              const { data: mt } = await supabase
                .from("estudiante")
                .select("id, nombre, apellidos, titulacion, ciudad, avatar_url")
                .ilike("titulacion", `%${est.titulacion.split(" ")[0]}%`)
                .neq("id", entityId)
                .limit(6);
              (mt ?? [])
                .filter((p) => !existing.has(p.id))
                .slice(0, 4 - sugs.length)
                .forEach((p) =>
                  sugs.push({
                    id: p.id,
                    type: "estudiante",
                    name: `${p.nombre ?? ""} ${p.apellidos ?? ""}`.trim(),
                    subtitle: [p.titulacion, p.ciudad]
                      .filter(Boolean)
                      .join(" · "),
                    avatarUrl: p.avatar_url,
                    href: `/estudiante/${p.id}`,
                    reason: "Misma titulación",
                  }),
                );
            }
          }
          if (rawEntityType === "empresa") {
            const emp = profile as Empresa;
            if (emp.sector) {
              const { data } = await supabase
                .from("empresa")
                .select("id, nombre, sector, ciudad, logo_url")
                .ilike("sector", `%${emp.sector}%`)
                .neq("id", entityId)
                .limit(4);
              (data ?? []).forEach((e) =>
                sugs.push({
                  id: e.id,
                  type: "empresa",
                  name: e.nombre,
                  subtitle: [e.sector, e.ciudad].filter(Boolean).join(" · "),
                  avatarUrl: e.logo_url,
                  href: `/empresa/${e.id}`,
                  reason: emp.sector!,
                }),
              );
            }
          }
          if (rawEntityType === "centro_educativo") {
            const centro = profile as CentroEducativo;
            if (centro.ciudad) {
              const { data } = await supabase
                .from("centro_educativo")
                .select("id, nombre, tipo_centro, ciudad, avatar_url")
                .ilike("ciudad", `%${centro.ciudad}%`)
                .neq("id", entityId)
                .limit(4);
              (data ?? []).forEach((c) =>
                sugs.push({
                  id: c.id,
                  type: "centro_educativo",
                  name: c.nombre,
                  subtitle: [c.tipo_centro, c.ciudad]
                    .filter(Boolean)
                    .join(" · "),
                  avatarUrl: c.avatar_url,
                  href: `/centro/${c.id}`,
                  reason: centro.ciudad!,
                }),
              );
            }
          }
          setSuggestions(sugs.slice(0, 4) as any);
        })(),
      );
      await Promise.all(loads);
    };
    loadExtras();
  }, [profile, rawEntityType, entityId, isTutorPage]);

  // ── Load viewer context ──
  useEffect(() => {
    if (!user || isTutorPage) return;
    const load = async () => {
      const ctx: typeof viewerContext = {};
      const loads: Promise<void>[] = [];
      if (viewerRole === "tutor_centro") {
        loads.push(
          (async () => {
            const { data } = await supabase
              .from("tutor_centro")
              .select("centro_id")
              .eq("usuario_id", viewerId)
              .maybeSingle();
            if (data) ctx.centroId = data.centro_id;
          })(),
        );
        if (rawEntityType === "estudiante") {
          loads.push(
            (async () => {
              const { data } = await supabase
                .from("centro_estudiante")
                .select("id, id_tutor")
                .eq("id_estudiante", entityId)
                .maybeSingle();
              if (data) {
                ctx.centroEstudiante = data.id;
                ctx.isMiEstudiante = data.id_tutor === viewerId;
              }
            })(),
          );
        }
      }
      if (viewerRole === "tutor_empresa") {
        loads.push(
          (async () => {
            const { data } = await supabase
              .from("tutor_empresa")
              .select("empresa_id")
              .eq("usuario_id", viewerId)
              .maybeSingle();
            if (data) ctx.empresaId = data.empresa_id;
          })(),
        );
        if (rawEntityType === "estudiante") {
          loads.push(
            (async () => {
              const { data } = await supabase
                .from("estudiante_estado")
                .select("id, estado")
                .eq("id_estudiante", entityId)
                .maybeSingle();
              ctx.isMyPracticasStudent = data?.estado === "en_practicas";
            })(),
          );
        }
      }
      if (viewerRole === "centro_educativo" && rawEntityType === "estudiante") {
        loads.push(
          (async () => {
            const { data } = await supabase
              .from("centro_estudiante")
              .select("id")
              .eq("id_estudiante", entityId)
              .maybeSingle();
            ctx.isEnrolledEstudiante = !!data;
          })(),
        );
      }
      if (viewerRole === "administrador") {
        loads.push(
          (async () => {
            await supabase
              .from("usuario")
              .select("id")
              .eq("id", entityId)
              .maybeSingle();
            setUserBlock({ blocked: false });
          })(),
        );
      }
      await Promise.all(loads);
      setViewerContext(ctx);
    };
    load();
  }, [user, viewerRole, viewerId, entityId, rawEntityType, isTutorPage]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      history.back();
    }
  };

  const withAction = async (fn: () => Promise<void>, successMsg: string) => {
    setActionState({ loading: true, success: null, error: null });
    try {
      await fn();
      setActionState({ loading: false, success: successMsg, error: null });
    } catch (e: unknown) {
      setActionState({
        loading: false,
        success: null,
        error: e instanceof Error ? e.message : "Error inesperado",
      });
    }
  };

  const al = actionState.loading;

  const handleBlock = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("usuario")
        .update({ blocked: true } as any)
        .eq("id", entityId);
      if (e) throw e;
      setUserBlock({ blocked: true });
    }, "Usuario bloqueado");
  const handleUnblock = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("usuario")
        .update({ blocked: false } as any)
        .eq("id", entityId);
      if (e) throw e;
      setUserBlock({ blocked: false });
    }, "Usuario desbloqueado");
  const handleVerify = (table: "empresa" | "centro_educativo") => () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from(table)
        .update({ verificado: true })
        .eq("id", entityId);
      if (e) throw e;
    }, "Entidad verificada");
  const handleDelete = () =>
    withAction(async () => {
      if (
        !window.confirm("¿Eliminar este perfil? Esta acción es irreversible.")
      )
        return;
      const table =
        rawEntityType === "empresa"
          ? "empresa"
          : rawEntityType === "centro_educativo"
            ? "centro_educativo"
            : "estudiante";
      const { error: e } = await supabase
        .from(table)
        .delete()
        .eq("id", entityId);
      if (e) throw e;
      setTimeout(() => (window.location.href = "/perfiles"), 1000);
    }, "Perfil eliminado");
  const handleEnroll = () =>
    withAction(async () => {
      const { data: cData } = await supabase
        .from("centro_educativo")
        .select("id")
        .eq("id", viewerId)
        .maybeSingle();
      const centroId = viewerContext.centroId ?? cData?.id ?? viewerId;
      const { error: e } = await supabase
        .from("centro_estudiante")
        .insert({ id_centro: centroId, id_estudiante: entityId });
      if (e) throw e;
      setViewerContext((c) => ({ ...c, isEnrolledEstudiante: true }));
    }, "Estudiante vinculado");
  const handleUnenroll = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("centro_estudiante")
        .delete()
        .eq("id_estudiante", entityId);
      if (e) throw e;
      setViewerContext((c) => ({ ...c, isEnrolledEstudiante: false }));
    }, "Estudiante desvinculado");
  const handleAssign = () =>
    withAction(async () => {
      if (!viewerContext.centroEstudiante)
        throw new Error("El estudiante no pertenece a tu centro");
      const { error: e } = await supabase
        .from("centro_estudiante")
        .update({ id_tutor: viewerId })
        .eq("id_estudiante", entityId);
      if (e) throw e;
      setViewerContext((c) => ({ ...c, isMiEstudiante: true }));
    }, "Estudiante asignado como tutorizado");
  const handleUnassign = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("centro_estudiante")
        .update({ id_tutor: null })
        .eq("id_estudiante", entityId);
      if (e) throw e;
      setViewerContext((c) => ({ ...c, isMiEstudiante: false }));
    }, "Estudiante desasignado de tu tutela");
  const handleStartPracticas = () =>
    withAction(async () => {
      if (!viewerContext.empresaId)
        throw new Error("No se encontró tu empresa");
      const { error: e } = await supabase.from("estudiante_estado").upsert({
        id_estudiante: entityId,
        id_empresa: viewerContext.empresaId,
        estado: "en_practicas",
        updated_at: new Date().toISOString(),
      });
      if (e) throw e;
      setViewerContext((c) => ({ ...c, isMyPracticasStudent: true }));
    }, "Prácticas iniciadas");
  const handleEndPracticas = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("estudiante_estado")
        .update({ estado: "finalizado", updated_at: new Date().toISOString() })
        .eq("id_estudiante", entityId)
        .eq("id_empresa", viewerContext.empresaId ?? "");
      if (e) throw e;
      setViewerContext((c) => ({ ...c, isMyPracticasStudent: false }));
    }, "Prácticas finalizadas");
  const handleGuardar = () =>
    withAction(async () => {
      const { error: e } = await supabase.from("guardado").insert({
        id_estudiante: entityId,
        fecha_guardado: new Date().toISOString(),
      });
      if (e) throw e;
    }, "Estudiante guardado");

  // ── Loading ──
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          paddingTop: 80,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "2px solid var(--color-border-strong)",
            borderTopColor: "var(--color-brand)",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (error || (!profile && !tutorProfile)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          paddingTop: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: "var(--color-text-muted)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {error ?? "Perfil no encontrado"}
        </span>
        <button
          onClick={handleBack}
          style={{
            padding: "8px 18px",
            borderRadius: 9,
            border: "1px solid var(--color-border-strong)",
            background: "transparent",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <I.ArrowLeft /> Volver
        </button>
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      </div>
    );
  }

  // ── Tutor page ──
  if (isTutorPage && tutorProfile) {
    const name = tutorProfile.nombre ?? "";
    const initials = name
      .split(" ")
      .slice(0, 2)
      .map((w: string) => w[0]?.toUpperCase())
      .join("");
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
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500&display=swap');
          @keyframes spin { to { transform:rotate(360deg) } }
          @keyframes fade-up { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        `}</style>
        <div
          style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 80px" }}
        >
          <button
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 28,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-subtle)",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              padding: 0,
            }}
          >
            <I.ArrowLeft /> Volver al directorio
          </button>
          <div
            style={{
              background: "var(--color-surface-strong)",
              border: `1px solid ${ec.accentMid}`,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div style={{ height: 4, background: ec.accent }} />
            <div style={{ padding: "32px 28px 28px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {tutorProfile.avatar_url ? (
                  <img
                    src={tutorProfile.avatar_url}
                    alt={name}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 14,
                      objectFit: "cover",
                      border: `1.5px solid ${ec.accentMid}`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 14,
                      background: ec.accentDim,
                      border: `1.5px solid ${ec.accentMid}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      fontWeight: 700,
                      color: ec.accent,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {initials || "?"}
                  </div>
                )}
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: ec.accent,
                      fontFamily: "'DM Mono', monospace",
                      marginBottom: 6,
                    }}
                  >
                    {
                      ENTITY_LABELS[
                        effectiveType as "tutor_empresa" | "tutor_centro"
                      ]
                    }
                  </div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 24,
                      fontWeight: 800,
                      color: "var(--color-text)",
                      fontFamily: "'DM Sans', sans-serif",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {name}
                  </h1>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 14,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {tutorType === "tutor_empresa"
                      ? tutorProfile.cargo
                      : tutorProfile.departamento}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <SectionCard title="Información" icon={<I.Info />}>
            <InfoRow
              icon={<I.Briefcase />}
              label={tutorType === "tutor_empresa" ? "Cargo" : "Departamento"}
              value={
                tutorType === "tutor_empresa"
                  ? tutorProfile.cargo
                  : tutorProfile.departamento
              }
            />
          </SectionCard>
        </div>
      </div>
    );
  }

  // ── Profile data helpers ──
  const getName = () => {
    if (rawEntityType === "estudiante") {
      const s = profile as Estudiante;
      return `${s.nombre ?? ""} ${s.apellidos ?? ""}`.trim();
    }
    return (profile as Empresa | CentroEducativo).nombre ?? "";
  };
  const getAvatar = () =>
    rawEntityType === "empresa"
      ? (profile as Empresa).logo_url
      : (profile as Estudiante | CentroEducativo).avatar_url;
  const getMemberSince = () => {
    const d = (profile as any).created_at;
    if (!d) return null;
    return new Date(d).toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };
  const profileName = getName();
  const avatarUrl = getAvatar();
  const memberSince = getMemberSince();
  const isVerified =
    "verificado" in (profile ?? {}) && (profile as any).verificado;

  const canSeeCandidaturas =
    viewerRole === "administrador" ||
    viewerRole === "empresa" ||
    viewerRole === "tutor_empresa" ||
    viewerRole === "tutor_centro" ||
    (viewerRole === "estudiante" &&
      rawEntityType === "estudiante" &&
      entityId === viewerId);

  const tabs = [
    { id: "info" as const, label: "Información", icon: <I.Info /> },
    ...(canSeeCandidaturas && rawEntityType === "estudiante"
      ? [
          {
            id: "candidaturas" as const,
            label: `Candidaturas`,
            count: stats.candidaturas,
            icon: <I.FileText />,
          },
        ]
      : []),
    { id: "actividad" as const, label: "Actividad", icon: <I.Activity /> },
  ];

  // ── Actions ──
  function renderActions() {
    if (viewerRole === "administrador")
      return (
        <>
          {(rawEntityType === "empresa" ||
            rawEntityType === "centro_educativo") && (
            <ActionBtn
              label="Verificar"
              variant="primary"
              onClick={handleVerify(
                rawEntityType as "empresa" | "centro_educativo",
              )}
              loading={al}
              icon={<I.Check />}
            />
          )}
          {userBlock?.blocked ? (
            <ActionBtn
              label="Desbloquear"
              onClick={handleUnblock}
              loading={al}
              icon={<I.Unlock />}
            />
          ) : (
            <ActionBtn
              label="Bloquear"
              danger
              onClick={handleBlock}
              loading={al}
              icon={<I.Lock />}
            />
          )}
          <ActionBtn
            label="Eliminar"
            danger
            onClick={handleDelete}
            loading={al}
            icon={<I.Trash />}
          />
          <ActionBtn
            label="Mensaje"
            onClick={() => alert("Abrir chat")}
            icon={<I.MessageSquare />}
          />
        </>
      );
    if (viewerRole === "centro_educativo" && rawEntityType === "estudiante")
      return (
        <>
          {viewerContext.isEnrolledEstudiante ? (
            <ActionBtn
              label="Desvincular"
              danger
              onClick={handleUnenroll}
              loading={al}
            />
          ) : (
            <ActionBtn
              label="Vincular al centro"
              variant="primary"
              onClick={handleEnroll}
              loading={al}
              icon={<I.Users />}
            />
          )}
          <ActionBtn
            label="Mensaje"
            onClick={() => alert("Abrir chat")}
            icon={<I.MessageSquare />}
          />
        </>
      );
    if (viewerRole === "tutor_centro" && rawEntityType === "estudiante") {
      const sameCenter = !!viewerContext.centroEstudiante;
      return (
        <>
          {sameCenter ? (
            viewerContext.isMiEstudiante ? (
              <ActionBtn
                label="Quitar tutorizado"
                danger
                onClick={handleUnassign}
                loading={al}
              />
            ) : (
              <ActionBtn
                label="Añadir como tutorizado"
                variant="primary"
                onClick={handleAssign}
                loading={al}
                icon={<I.Users />}
              />
            )
          ) : (
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-subtle)",
                alignSelf: "center",
              }}
            >
              Fuera de tu centro
            </span>
          )}
          <ActionBtn
            label="Mensaje"
            onClick={() => alert("Abrir chat")}
            icon={<I.MessageSquare />}
          />
        </>
      );
    }
    if (viewerRole === "tutor_empresa" && rawEntityType === "estudiante")
      return (
        <>
          {viewerContext.isMyPracticasStudent ? (
            <ActionBtn
              label="Finalizar prácticas"
              danger
              onClick={handleEndPracticas}
              loading={al}
            />
          ) : (
            <ActionBtn
              label="Iniciar prácticas"
              variant="primary"
              onClick={handleStartPracticas}
              loading={al}
              icon={<I.Briefcase />}
            />
          )}
          <ActionBtn
            label="Guardar"
            onClick={handleGuardar}
            loading={al}
            icon={<I.Bookmark />}
          />
          <ActionBtn
            label="Mensaje"
            onClick={() => alert("Abrir chat")}
            icon={<I.MessageSquare />}
          />
        </>
      );
    if (viewerRole === "empresa") {
      if (rawEntityType === "estudiante")
        return (
          <>
            <ActionBtn
              label="Guardar perfil"
              variant="primary"
              onClick={handleGuardar}
              loading={al}
              icon={<I.Bookmark />}
            />
            <ActionBtn
              label="Mensaje"
              onClick={() => alert("Abrir chat")}
              icon={<I.MessageSquare />}
            />
          </>
        );
      if (rawEntityType === "centro_educativo")
        return (
          <ActionBtn
            label="Contactar centro"
            onClick={() => alert("Abrir chat")}
            icon={<I.MessageSquare />}
          />
        );
    }
    if (viewerRole === "estudiante") {
      if (rawEntityType === "empresa")
        return (
          <>
            <ActionBtn
              label="Ver ofertas"
              variant="primary"
              onClick={() =>
                (window.location.href = `/empresa/${entityId}/ofertas`)
              }
              icon={<I.Layers />}
            />
            <ActionBtn
              label="Mensaje"
              onClick={() => alert("Abrir chat")}
              icon={<I.MessageSquare />}
            />
          </>
        );
      if (rawEntityType === "centro_educativo")
        return (
          <ActionBtn
            label="Contactar centro"
            onClick={() => alert("Abrir chat")}
            icon={<I.MessageSquare />}
          />
        );
    }
    return null;
  }

  // ── Info sections ──
  function renderInfoSections() {
    if (rawEntityType === "estudiante") {
      const s = profile as Estudiante;
      return (
        <>
          {s.sobre_mi && (
            <SectionCard title="Sobre mí" icon={<I.Info />}>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.8,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {s.sobre_mi}
              </p>
            </SectionCard>
          )}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <SectionCard title="Contacto y datos" icon={<I.FileText />}>
              <InfoRow icon={<I.MapPin />} label="Ciudad" value={s.ciudad} />
              <InfoRow
                icon={<I.GraduationCap />}
                label="Titulación"
                value={s.titulacion}
              />
              <InfoRow
                icon={<I.Calendar />}
                label="Disponibilidad"
                value={s.disponibilidad}
              />
              <InfoRow
                icon={<I.Briefcase />}
                label="Tipo búsqueda"
                value={s.tipo_busqueda}
              />
              <InfoRow
                icon={<I.Globe />}
                label="Modalidad"
                value={s.modalidad}
              />
              {(viewerRole !== "estudiante" || entityId === viewerId) && (
                <InfoRow
                  icon={<I.Phone />}
                  label="Teléfono"
                  value={s.telefono}
                />
              )}
              {(viewerRole === "administrador" ||
                viewerRole === "tutor_centro" ||
                viewerRole === "tutor_empresa") && (
                <InfoRow icon={<I.Mail />} label="Email" value={s.email} />
              )}
              {s.github_username && (
                <InfoRow
                  icon={<I.GitHub />}
                  label="GitHub"
                  value={`github.com/${s.github_username}`}
                  href={`https://github.com/${s.github_username}`}
                />
              )}
            </SectionCard>
            {s.habilidades && s.habilidades.length > 0 && (
              <SectionCard title="Nivel de habilidades" icon={<I.Activity />}>
                {s.habilidades.slice(0, 6).map((h) => (
                  <SkillBar key={h} skill={h} />
                ))}
              </SectionCard>
            )}
          </div>
          {s.habilidades && s.habilidades.length > 0 && (
            <SectionCard title="Habilidades" icon={<I.Code />}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {s.habilidades.map((h) => (
                  <Tag key={h} label={h} />
                ))}
              </div>
            </SectionCard>
          )}
          {Array.isArray(s.formaciones) && s.formaciones.length > 0 && (
            <SectionCard title="Formación académica" icon={<I.GraduationCap />}>
              {(s.formaciones as Record<string, string>[]).map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "12px 0",
                    borderBottom:
                      i < s.formaciones!.length - 1
                        ? "1px solid rgba(255,255,255,0.05)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: EC.centro_educativo.accentDim,
                      border: `1px solid ${EC.centro_educativo.accentMid}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: EC.centro_educativo.accent,
                      flexShrink: 0,
                    }}
                  >
                    <I.GraduationCap />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "var(--color-text)",
                        fontFamily: "'DM Sans', sans-serif",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {f.titulo}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                        marginTop: 2,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {[f.institucion, f.anio].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
              ))}
            </SectionCard>
          )}
          {Array.isArray(s.proyectos) && s.proyectos.length > 0 && (
            <SectionCard title="Proyectos" icon={<I.Code />}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 10,
                }}
              >
                {(s.proyectos as Record<string, string>[]).map((p, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--color-surface-elevated)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "var(--color-text)",
                        fontFamily: "'DM Sans', sans-serif",
                        marginBottom: 4,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {p.titulo}
                    </div>
                    {p.descripcion && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-muted)",
                          lineHeight: 1.55,
                          marginBottom: 8,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {p.descripcion}
                      </div>
                    )}
                    {p.enlace && (
                      <a
                        href={p.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 12,
                          color: "var(--color-brand)",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Ver proyecto <I.ExternalLink />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
          {s.redes_sociales && Object.keys(s.redes_sociales).length > 0 && (
            <SectionCard title="Redes sociales" icon={<I.Link />}>
              {Object.entries(s.redes_sociales).map(([red, url]) => (
                <InfoRow
                  key={red}
                  icon={<I.Link />}
                  label={red}
                  value={url}
                  href={url}
                />
              ))}
            </SectionCard>
          )}
        </>
      );
    }

    if (rawEntityType === "empresa") {
      const e = profile as Empresa;
      return (
        <>
          {e.descripcion && (
            <SectionCard title="Sobre la empresa" icon={<I.Building />}>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.8,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {e.descripcion}
              </p>
            </SectionCard>
          )}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <SectionCard title="Información" icon={<I.FileText />}>
              <InfoRow icon={<I.MapPin />} label="Ciudad" value={e.ciudad} />
              <InfoRow icon={<I.Briefcase />} label="Sector" value={e.sector} />
              <InfoRow icon={<I.Users />} label="Tamaño" value={e.tamano} />
              <InfoRow
                icon={<I.Mail />}
                label="Email"
                value={e.email_contacto}
              />
              <InfoRow icon={<I.Phone />} label="Teléfono" value={e.telefono} />
              <InfoRow
                icon={<I.Globe />}
                label="Web"
                value={e.web}
                href={e.web}
              />
              {viewerRole === "administrador" && (
                <InfoRow icon={<I.Shield />} label="CIF" value={e.cif} />
              )}
            </SectionCard>
            {(e.linkedin || e.twitter || e.instagram) && (
              <SectionCard title="Redes sociales" icon={<I.Link />}>
                {e.linkedin && (
                  <InfoRow
                    icon={<I.Linkedin />}
                    label="LinkedIn"
                    value={e.linkedin}
                    href={e.linkedin}
                  />
                )}
                {e.twitter && (
                  <InfoRow
                    icon={<I.Twitter />}
                    label="Twitter / X"
                    value={e.twitter}
                    href={e.twitter}
                  />
                )}
              </SectionCard>
            )}
          </div>
        </>
      );
    }

    if (rawEntityType === "centro_educativo") {
      const c = profile as CentroEducativo;
      return (
        <>
          {c.descripcion && (
            <SectionCard title="Sobre el centro" icon={<I.BookOpen />}>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.8,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {c.descripcion}
              </p>
            </SectionCard>
          )}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <SectionCard title="Información" icon={<I.FileText />}>
              <InfoRow icon={<I.MapPin />} label="Ciudad" value={c.ciudad} />
              <InfoRow
                icon={<I.MapPin />}
                label="Provincia"
                value={c.provincia}
              />
              <InfoRow
                icon={<I.BookOpen />}
                label="Tipo centro"
                value={c.tipo_centro}
              />
              <InfoRow
                icon={<I.Users />}
                label="N.º alumnos"
                value={c.num_alumnos?.toString()}
              />
              <InfoRow
                icon={<I.Mail />}
                label="Email"
                value={c.email_contacto}
              />
              <InfoRow icon={<I.Phone />} label="Teléfono" value={c.telefono} />
              <InfoRow
                icon={<I.Globe />}
                label="Web"
                value={c.sitio_web}
                href={c.sitio_web}
              />
            </SectionCard>
            {c.titulaciones && c.titulaciones.length > 0 && (
              <SectionCard title="Titulaciones" icon={<I.Layers />}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {c.titulaciones.map((t) => (
                    <AccentTag key={t} label={t} ec={ec} />
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </>
      );
    }
    return null;
  }

  // ── Main render ──
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes fade-up { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      <div
        style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 80px" }}
      >
        {/* Back */}
        <button
          onClick={handleBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 28,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-subtle)",
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            padding: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-text)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-text-subtle)")
          }
        >
          <I.ArrowLeft /> Volver al directorio
        </button>

        {/* ── Hero ── */}
        <div
          style={{
            background: "var(--color-surface-strong)",
            border: `1px solid ${ec.accentMid}`,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          {/* Accent top bar */}
          <div style={{ height: 4, background: ec.accent }} />

          <div style={{ padding: "28px 28px 24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {/* Avatar + verified */}
              <div style={{ position: "relative" }}>
                <Avatar url={avatarUrl} name={profileName} size={76} ec={ec} />
                {isVerified && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: -4,
                      right: -4,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#c0ff72",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid var(--color-surface-strong)",
                    }}
                  >
                    <I.Check size={9} />
                  </div>
                )}
              </div>
              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  paddingTop: 4,
                }}
              >
                {renderActions()}
              </div>
            </div>

            {/* Name + type label */}
            <div style={{ marginBottom: 6 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: ec.accent,
                  fontFamily: "'DM Mono', monospace",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <div style={{ width: 14, height: 1, background: ec.accent }} />
                {rawEntityType ? ENTITY_LABELS[rawEntityType] : ""}
                {isVerified && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 9,
                      background: "rgba(192,255,114,0.1)",
                      border: "1px solid rgba(192,255,114,0.25)",
                      color: "#c0ff72",
                      padding: "1px 6px",
                      borderRadius: 4,
                      letterSpacing: "0.08em",
                    }}
                  >
                    VERIFICADO
                  </span>
                )}
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 800,
                  color: "var(--color-text)",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "-0.035em",
                  lineHeight: 1.1,
                }}
              >
                {profileName}
              </h1>
            </div>

            {/* Subtitle */}
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 14,
                color: "var(--color-text-muted)",
                lineHeight: 1.5,
              }}
            >
              {rawEntityType === "estudiante" &&
                [
                  (profile as Estudiante).titulacion,
                  (profile as Estudiante).ciudad,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              {rawEntityType === "empresa" &&
                [
                  (profile as Empresa).sector,
                  (profile as Empresa).ciudad,
                  (profile as Empresa).tamano,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              {rawEntityType === "centro_educativo" &&
                [
                  (profile as CentroEducativo).tipo_centro,
                  (profile as CentroEducativo).ciudad,
                  (profile as CentroEducativo).provincia,
                ]
                  .filter(Boolean)
                  .join(" · ")}
            </p>

            {/* Meta row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              {memberSince && (
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <I.Calendar /> Miembro desde {memberSince}
                </span>
              )}
              {rawEntityType === "estudiante" &&
                (profile as Estudiante).disponibilidad &&
                (() => {
                  const d =
                    DISP_COLOR[(profile as Estudiante).disponibilidad!] ??
                    DISP_COLOR.no_disponible;
                  return (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        color: d.color,
                      }}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: d.color,
                        }}
                      />
                      {d.label}
                    </span>
                  );
                })()}
              {rawEntityType === "empresa" && (profile as Empresa).web && (
                <a
                  href={(profile as Empresa).web!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    color: ec.accent,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <I.Globe /> {(profile as Empresa).web}
                </a>
              )}
            </div>
          </div>

          {/* Stats row */}
          {(stats.candidaturas > 0 ||
            stats.ofertas > 0 ||
            stats.estudiantes > 0 ||
            stats.valoracion !== undefined) && (
            <>
              <div style={{ height: 1, background: "var(--color-border)" }} />
              <div
                style={{
                  display: "flex",
                  padding: "16px 28px",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {rawEntityType === "estudiante" && (
                  <StatBadge
                    value={stats.candidaturas}
                    label="Candidaturas"
                    color={ec.accent}
                  />
                )}
                {rawEntityType === "empresa" && (
                  <StatBadge
                    value={stats.ofertas}
                    label="Ofertas"
                    color={ec.accent}
                  />
                )}
                {rawEntityType === "empresa" &&
                  stats.valoracion !== undefined && (
                    <StatBadge
                      value={`${stats.valoracion} / 5`}
                      label="Valoración media"
                      color="#facc15"
                    />
                  )}
                {rawEntityType === "centro_educativo" && (
                  <StatBadge
                    value={stats.estudiantes}
                    label="Estudiantes vinculados"
                    color={ec.accent}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Tabs ── */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 16,
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === tab.id
                    ? `2px solid ${ec.accent}`
                    : "2px solid transparent",
                color:
                  activeTab === tab.id ? ec.accent : "var(--color-text-muted)",
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 400,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                transition: "all 0.15s",
                marginBottom: -1,
                letterSpacing: "-0.01em",
              }}
            >
              <span
                style={{
                  opacity: activeTab === tab.id ? 1 : 0.5,
                  display: "flex",
                }}
              >
                {tab.icon}
              </span>
              {tab.label}
              {"count" in tab && tab.count > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "1px 6px",
                    borderRadius: 20,
                    background:
                      activeTab === tab.id
                        ? `${ec.accent}18`
                        : "rgba(255,255,255,0.06)",
                    color:
                      activeTab === tab.id
                        ? ec.accent
                        : "var(--color-text-subtle)",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === "info" && renderInfoSections()}

        {activeTab === "candidaturas" && (
          <SectionCard title="Candidaturas enviadas" icon={<I.FileText />}>
            {candidaturas.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                No hay candidaturas registradas.
              </p>
            ) : (
              candidaturas.map((c) => (
                <CandidaturaRow key={c.id_candidatura} c={c} />
              ))
            )}
          </SectionCard>
        )}

        {activeTab === "actividad" && (
          <SectionCard title="Actividad reciente" icon={<I.Activity />}>
            {memberSince && (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: ec.accentDim,
                    border: `1px solid ${ec.accentMid}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: ec.accent,
                    flexShrink: 0,
                  }}
                >
                  <I.Calendar />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Perfil creado en Relance
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-subtle)",
                      fontFamily: "'DM Mono', monospace",
                      marginTop: 2,
                    }}
                  >
                    {memberSince}
                  </div>
                </div>
              </div>
            )}
            {rawEntityType === "estudiante" && stats.candidaturas > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-text-subtle)",
                    flexShrink: 0,
                  }}
                >
                  <I.FileText />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {stats.candidaturas} candidatura
                    {stats.candidaturas > 1 ? "s" : ""} enviada
                    {stats.candidaturas > 1 ? "s" : ""}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-subtle)",
                      fontFamily: "'DM Mono', monospace",
                      marginTop: 2,
                    }}
                  >
                    Historial completo
                  </div>
                </div>
              </div>
            )}
            <p
              style={{
                margin: "16px 0 0",
                fontSize: 12,
                color: "var(--color-text-subtle)",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.5,
              }}
            >
              El historial detallado de actividad estará disponible
              próximamente.
            </p>
          </SectionCard>
        )}

        {/* ── Related profiles ── */}
        {(suggestions as any[]).length > 0 && (
          <div style={{ marginTop: 36 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  height: 1,
                  flex: 1,
                  background: "var(--color-border)",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-text-subtle)",
                  fontFamily: "'DM Mono', monospace",
                  whiteSpace: "nowrap",
                }}
              >
                Perfiles relacionados
              </span>
              <div
                style={{
                  height: 1,
                  flex: 1,
                  background: "var(--color-border)",
                }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 10,
              }}
            >
              {(suggestions as any[]).map((s: any) => (
                <SuggestedCard key={s.id} profile={s} />
              ))}
            </div>
          </div>
        )}

        {/* ── Toasts ── */}
        {actionState.success && (
          <Toast
            message={actionState.success}
            type="success"
            onDismiss={() => setActionState((s) => ({ ...s, success: null }))}
          />
        )}
        {actionState.error && (
          <Toast
            message={actionState.error}
            type="error"
            onDismiss={() => setActionState((s) => ({ ...s, error: null }))}
          />
        )}
      </div>
    </div>
  );
}
