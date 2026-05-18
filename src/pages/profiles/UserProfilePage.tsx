/**
 * UserProfilePage.tsx — Rediseño Enterprise v2
 *
 * Rediseño completo con:
 * - Layout centrado con márgenes amplios (max-width 1140px)
 * - Hero card estilo LinkedIn con cover, avatar flotante y stats integrados
 * - Sistema de tarjetas con secciones bien delimitadas
 * - Sidebar sticky con datos clave y sugerencias
 * - Responsive: grid 2col → 1col en móvil, sidebar oculto
 * - Paleta original conservada, jerarquía visual mejorada
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import MainLayout from "../../components/layout/MainLayout";

// ─── Types ─────────────────────────────────────────────────────────────────

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

export interface UserProfilePageProps {
  entityType?: EntityType;
  entityId?: string;
  onBack?: () => void;
}

// ─── Route inference ──────────────────────────────────────────────────────

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

// ─── Design tokens ────────────────────────────────────────────────────────

const EC: Record<
  EntityType | "tutor_empresa" | "tutor_centro",
  {
    accent: string;
    accentFaint: string;
    accentBorder: string;
    label: string;
    dot: string;
    coverFrom: string;
    coverTo: string;
  }
> = {
  empresa: {
    accent: "#c0ff72",
    accentFaint: "rgba(192,255,114,0.08)",
    accentBorder: "rgba(192,255,114,0.22)",
    label: "Empresa",
    dot: "#c0ff72",
    coverFrom: "rgba(192,255,114,0.12)",
    coverTo: "rgba(192,255,114,0.03)",
  },
  centro_educativo: {
    accent: "#60a5fa",
    accentFaint: "rgba(96,165,250,0.08)",
    accentBorder: "rgba(96,165,250,0.22)",
    label: "Centro Educativo",
    dot: "#60a5fa",
    coverFrom: "rgba(96,165,250,0.12)",
    coverTo: "rgba(96,165,250,0.03)",
  },
  estudiante: {
    accent: "#c0ff72",
    accentFaint: "rgba(192,255,114,0.08)",
    accentBorder: "rgba(192,255,114,0.22)",
    label: "Estudiante",
    dot: "#c0ff72",
    coverFrom: "rgba(192,255,114,0.1)",
    coverTo: "rgba(96,165,250,0.04)",
  },
  oferta: {
    accent: "#a78bfa",
    accentFaint: "rgba(167,139,250,0.08)",
    accentBorder: "rgba(167,139,250,0.22)",
    label: "Oferta",
    dot: "#a78bfa",
    coverFrom: "rgba(167,139,250,0.1)",
    coverTo: "rgba(167,139,250,0.03)",
  },
  tutor_empresa: {
    accent: "#f472b6",
    accentFaint: "rgba(244,114,182,0.08)",
    accentBorder: "rgba(244,114,182,0.22)",
    label: "Tutor de empresa",
    dot: "#f472b6",
    coverFrom: "rgba(244,114,182,0.1)",
    coverTo: "rgba(244,114,182,0.03)",
  },
  tutor_centro: {
    accent: "#34d399",
    accentFaint: "rgba(52,211,153,0.08)",
    accentBorder: "rgba(52,211,153,0.22)",
    label: "Tutor de centro",
    dot: "#34d399",
    coverFrom: "rgba(52,211,153,0.1)",
    coverTo: "rgba(52,211,153,0.03)",
  },
};

const DISP_MAP: Record<string, { label: string; color: string; bg: string }> = {
  inmediata: {
    label: "Disponible ahora",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.1)",
  },
  "1_mes": { label: "En 1 mes", color: "#facc15", bg: "rgba(250,204,21,0.1)" },
  "3_meses": {
    label: "En 3 meses",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.1)",
  },
  no_disponible: {
    label: "No disponible",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
  },
};

const CAND_MAP: Record<string, { color: string; label: string; bg: string }> = {
  pendiente: {
    color: "#facc15",
    label: "Pendiente",
    bg: "rgba(250,204,21,0.1)",
  },
  aceptada: { color: "#4ade80", label: "Aceptada", bg: "rgba(74,222,128,0.1)" },
  rechazada: {
    color: "#f87171",
    label: "Rechazada",
    bg: "rgba(248,113,113,0.1)",
  },
  en_proceso: {
    color: "#60a5fa",
    label: "En proceso",
    bg: "rgba(96,165,250,0.1)",
  },
};

// ─── CSS ──────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600&display=swap');

@keyframes spin { to { transform: rotate(360deg) } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
@keyframes toastIn { from { opacity: 0; transform: translateY(10px) scale(0.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
@keyframes shimmer { from { background-position: -400% 0 } to { background-position: 400% 0 } }
@keyframes progressFill { from { width: 0 } }

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.p-root {
  min-height: 100vh;
  background: var(--color-bg);
  font-family: 'Geist', system-ui, sans-serif;
  color: var(--color-text);
  padding-top: 68px;
  animation: fadeIn 0.24s ease forwards;
}

/* ── Page container (márgenes amplios) ── */
.p-page {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 28px 100px;
}

@media (max-width: 1180px) { .p-page { padding: 0 20px 80px; } }
@media (max-width: 640px)  { .p-page { padding: 0 14px 60px; } }

/* ── Back button ── */
.p-back-row {
  display: flex;
  align-items: center;
  padding: 20px 0 14px;
}
.p-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 12px;
  font-family: inherit;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 4px 0;
  transition: color 0.13s;
}
.p-back:hover { color: var(--color-text); }

/* ── Main layout: main + sidebar ── */
.p-layout {
  display: grid;
  grid-template-columns: 1fr 308px;
  gap: 18px;
  align-items: start;
}
@media (max-width: 860px) {
  .p-layout { grid-template-columns: 1fr; }
  .p-sidebar { display: none; }
}

/* ═══════════════════════════════════════
   HERO CARD
═══════════════════════════════════════ */
.p-hero {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-strong);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 14px;
}

/* Cover band */
.p-cover {
  height: 120px;
  position: relative;
  overflow: hidden;
}
.p-cover-bg {
  position: absolute;
  inset: 0;
}
.p-cover-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 22px 22px;
}
.p-cover-fade {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 60px;
  background: linear-gradient(to bottom, transparent, var(--color-surface-strong));
}
.p-cover-line {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
}

/* Avatar + header */
.p-head {
  padding: 0 28px 24px;
  position: relative;
}

.p-avatar-wrap {
  position: absolute;
  top: -44px;
  left: 28px;
}
.p-avatar-shell {
  width: 88px;
  height: 88px;
  border-radius: 16px;
  border: 3px solid var(--color-surface-strong);
  overflow: hidden;
  background: var(--color-surface-elevated);
  position: relative;
}
.p-avatar-img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}
.p-avatar-initials {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.04em;
}
.p-verified-badge {
  position: absolute;
  bottom: -4px; right: -4px;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: #c0ff72;
  border: 2.5px solid var(--color-surface-strong);
  display: flex; align-items: center; justify-content: center;
}

/* Name row */
.p-name-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 54px;
  gap: 16px;
}
.p-name-info { flex: 1; min-width: 0; }

.p-entity-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-family: 'Geist Mono', monospace;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 6px;
  margin-bottom: 8px;
}
.p-verified-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-family: 'Geist Mono', monospace;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(192,255,114,0.1);
  color: #c0ff72;
  border: 1px solid rgba(192,255,114,0.2);
  margin-left: 8px;
  vertical-align: middle;
}

.p-name {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1.08;
  color: var(--color-text);
  margin-bottom: 5px;
}
.p-headline {
  font-size: 14px;
  color: var(--color-text-secondary);
  letter-spacing: -0.01em;
  line-height: 1.55;
}

/* Actions cluster */
.p-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding-top: 4px;
}

/* Meta pills */
.p-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 16px 28px 0;
  border-top: 1px solid var(--color-border);
  margin-top: 20px;
}
.p-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.01em;
}
.p-meta-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  text-decoration: none;
  transition: opacity 0.13s;
  font-family: 'Geist Mono', monospace;
}
.p-meta-link:hover { opacity: 0.75; }

/* ── Stats strip (horizontal dividers) ── */
.p-stats {
  display: grid;
  border-top: 1px solid var(--color-border);
  margin-top: 20px;
}
.p-stats-3 { grid-template-columns: repeat(3, 1fr); }
.p-stats-2 { grid-template-columns: repeat(2, 1fr); }
.p-stats-1 { grid-template-columns: 1fr; }

.p-stat {
  padding: 18px 24px;
  text-align: center;
  border-right: 1px solid var(--color-border);
}
.p-stat:last-child { border-right: none; }
.p-stat-value {
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.06em;
  line-height: 1;
  margin-bottom: 4px;
}
.p-stat-label {
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ═══════════════════════════════════════
   TABS
═══════════════════════════════════════ */
.p-tabs {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-strong);
  border-radius: 12px;
  padding: 5px;
  display: flex;
  gap: 3px;
  margin-bottom: 14px;
}
.p-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 14px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  color: var(--color-text-muted);
  letter-spacing: -0.01em;
  transition: all 0.14s;
  white-space: nowrap;
}
.p-tab:hover { color: var(--color-text); background: rgba(255,255,255,0.03); }
.p-tab.active {
  background: var(--color-surface-elevated);
  color: var(--color-text);
  box-shadow: 0 1px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05);
}
.p-tab-badge {
  font-size: 9px;
  font-family: 'Geist Mono', monospace;
  padding: 1px 6px;
  border-radius: 5px;
  background: rgba(255,255,255,0.07);
}
.p-tab.active .p-tab-badge { background: rgba(255,255,255,0.12); }

/* ═══════════════════════════════════════
   SECTION CARDS
═══════════════════════════════════════ */
.p-section {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-strong);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 12px;
}
.p-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
  border-bottom: 1px solid var(--color-border);
  background: rgba(255,255,255,0.015);
}
.p-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.p-section-title-text {
  font-size: 10.5px;
  font-family: 'Geist Mono', monospace;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.p-section-body { padding: 20px 22px; }
.p-section-body-flush { padding: 0; }

/* ── Prose ── */
.p-prose {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.82;
  letter-spacing: -0.005em;
}

/* ── Info grid ── */
.p-info-grid {
  display: grid;
  gap: 0;
}
.p-info-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: baseline;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.035);
}
.p-info-row:last-child { border-bottom: none; }
.p-info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: 'Geist Mono', monospace;
}
.p-info-val {
  font-size: 13px;
  color: var(--color-text-secondary);
  word-break: break-word;
  line-height: 1.5;
}
.p-info-link {
  font-size: 13px;
  color: var(--color-brand);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.p-info-link:hover { text-decoration: underline; }

/* ── Two-col grid ── */
.p-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
@media (max-width: 620px) { .p-two-col { grid-template-columns: 1fr; } }

/* ── Skill bars ── */
.p-skill {
  margin-bottom: 14px;
}
.p-skill:last-child { margin-bottom: 0; }
.p-skill-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.p-skill-name { font-size: 12.5px; color: var(--color-text-secondary); font-weight: 500; }
.p-skill-pct { font-size: 10.5px; color: var(--color-text-muted); font-family: 'Geist Mono', monospace; }
.p-skill-track {
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  overflow: hidden;
}
.p-skill-fill {
  height: 100%;
  border-radius: 4px;
  animation: progressFill 0.8s cubic-bezier(0.4,0,0.2,1) forwards;
  background: linear-gradient(90deg, rgba(192,255,114,0.9), rgba(96,165,250,0.8));
}

/* ── Tags ── */
.p-tags { display: flex; flex-wrap: wrap; gap: 7px; }
.p-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  padding: 5px 11px;
  border-radius: 7px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--color-text-secondary);
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.01em;
  transition: all 0.13s;
  cursor: default;
}
.p-tag:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.13); }

/* ── Formation rows ── */
.p-formation {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.p-formation:first-child { padding-top: 0; }
.p-formation:last-child { border-bottom: none; padding-bottom: 0; }
.p-formation-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.p-formation-name { font-size: 13.5px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em; }
.p-formation-sub {
  font-size: 11.5px;
  color: var(--color-text-muted);
  font-family: 'Geist Mono', monospace;
  margin-top: 3px;
}
.p-formation-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-top: 5px;
}

/* ── Projects ── */
.p-projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}
.p-project {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 16px;
  transition: border-color 0.14s, background 0.14s;
}
.p-project:hover { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); }
.p-project-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}
.p-project-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.65;
  margin-bottom: 10px;
}
.p-project-link {
  font-size: 11.5px;
  color: var(--color-brand);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.p-project-link:hover { text-decoration: underline; }

/* ── Candidaturas ── */
.p-cand-list { display: flex; flex-direction: column; }
.p-cand {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.045);
}
.p-cand:first-child { padding-top: 0; }
.p-cand:last-child { border-bottom: none; padding-bottom: 0; }
.p-cand-name { font-size: 13.5px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em; }
.p-cand-date {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: 'Geist Mono', monospace;
  margin-top: 3px;
}
.p-cand-comment {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.025);
  border-left: 2px solid rgba(255,255,255,0.1);
  border-radius: 0 6px 6px 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  font-style: italic;
  line-height: 1.6;
}
.p-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: 'Geist Mono', monospace;
  border: 1px solid;
}

/* ── Activity ── */
.p-activity { display: flex; flex-direction: column; gap: 0; }
.p-activity-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.p-activity-item:first-child { padding-top: 0; }
.p-activity-item:last-child { border-bottom: none; padding-bottom: 0; }
.p-activity-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.08);
}
.p-activity-text { font-size: 13px; color: var(--color-text-secondary); line-height: 1.5; }
.p-activity-sub {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: 'Geist Mono', monospace;
  margin-top: 3px;
}
.p-activity-soon {
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.02);
  border: 1px dashed rgba(255,255,255,0.08);
  border-radius: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* ── Empty state ── */
.p-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  gap: 10px;
  color: var(--color-text-muted);
  font-size: 13px;
  text-align: center;
}

/* ═══════════════════════════════════════
   BUTTONS
═══════════════════════════════════════ */
.p-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.14s;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.p-btn-primary {
  background: var(--color-brand);
  color: #020a00;
  border-color: transparent;
}
.p-btn-primary:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow: 0 5px 18px rgba(192,255,114,0.22);
}
.p-btn-secondary {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border-strong);
}
.p-btn-secondary:hover {
  background: rgba(255,255,255,0.04);
  color: var(--color-text);
  border-color: rgba(255,255,255,0.18);
}
.p-btn-danger {
  background: rgba(239,68,68,0.08);
  color: #f87171;
  border-color: rgba(239,68,68,0.2);
}
.p-btn-danger:hover { background: rgba(239,68,68,0.14); }
.p-btn:disabled { opacity: 0.38; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

.p-spinner {
  width: 11px; height: 11px;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  animation: spin 0.7s linear infinite;
}

/* ═══════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════ */
.p-sidebar {
  position: sticky;
  top: 84px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Context alert card */
.p-ctx-card {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-strong);
  border-radius: 12px;
  overflow: hidden;
}
.p-ctx-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  font-size: 12px;
  font-weight: 500;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.p-ctx-item:last-child { border-bottom: none; }

/* Data card */
.p-data-card {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-strong);
  border-radius: 12px;
  overflow: hidden;
}
.p-data-card-header {
  padding: 11px 16px;
  border-bottom: 1px solid var(--color-border);
  background: rgba(255,255,255,0.015);
}
.p-data-card-title {
  font-size: 10px;
  font-family: 'Geist Mono', monospace;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.p-data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  gap: 10px;
}
.p-data-row:last-child { border-bottom: none; }
.p-data-label {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: 'Geist Mono', monospace;
  flex-shrink: 0;
}
.p-data-val {
  font-size: 12.5px;
  color: var(--color-text-secondary);
  text-align: right;
  word-break: break-word;
}

/* Suggestions */
.p-sug-card {
  background: var(--color-surface-strong);
  border: 1px solid var(--color-border-strong);
  border-radius: 12px;
  overflow: hidden;
}
.p-sug-header {
  padding: 11px 16px;
  border-bottom: 1px solid var(--color-border);
  background: rgba(255,255,255,0.015);
}
.p-sug-title {
  font-size: 10px;
  font-family: 'Geist Mono', monospace;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.p-sug-list { padding: 8px; display: flex; flex-direction: column; gap: 2px; }
.p-sug-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 9px;
  text-decoration: none;
  transition: background 0.12s;
  cursor: pointer;
}
.p-sug-item:hover { background: rgba(255,255,255,0.04); }
.p-sug-avatar {
  width: 36px; height: 36px;
  border-radius: 9px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
}
.p-sug-avatar img { width: 100%; height: 100%; object-fit: cover; }
.p-sug-info { flex: 1; min-width: 0; }
.p-sug-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.p-sug-sub {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}
.p-sug-chip {
  flex-shrink: 0;
  font-size: 9.5px;
  font-family: 'Geist Mono', monospace;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

/* ── Toast ── */
.p-toast {
  position: fixed;
  bottom: 28px; right: 28px;
  z-index: 9999;
  padding: 11px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 9px;
  animation: toastIn 0.2s ease forwards;
  border: 1px solid;
  box-shadow: 0 10px 40px rgba(0,0,0,0.45);
}

/* ── Divider ── */
.p-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0;
}

/* ── Loading skeleton ── */
.p-skeleton {
  background: linear-gradient(90deg,
    rgba(255,255,255,0.04) 0%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.04) 100%);
  background-size: 400% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 6px;
}
`;

// ─── Icons ───────────────────────────────────────────────────────────────

const Ic = {
  ArrowLeft: () => (
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
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Check: ({ s = 9 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
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
  X: ({ s = 10 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  MapPin: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Mail: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Phone: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.63 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Globe: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  GradCap: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  Briefcase: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  GitHub: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  Linkedin: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  ),
  Building: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  FileText: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Activity: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Info: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
      width="10"
      height="10"
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
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Layers: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Message: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Lock: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Unlock: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  BookOpen: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Code: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Bookmark: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  ),
  Hash: () => (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  ),
  Star: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Dot: ({ color }: { color: string }) => (
    <svg width="7" height="7" viewBox="0 0 7 7">
      <circle cx="3.5" cy="3.5" r="3.5" fill={color} />
    </svg>
  ),
};

// ─── Atoms ───────────────────────────────────────────────────────────────

function Btn({
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
  const cls = danger
    ? "p-btn p-btn-danger"
    : variant === "primary"
      ? "p-btn p-btn-primary"
      : "p-btn p-btn-secondary";
  return (
    <button className={cls} onClick={onClick} disabled={disabled || l}>
      {l ? <div className="p-spinner" /> : icon}
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
  const ok = type === "success";
  return (
    <div
      className="p-toast"
      style={{
        background: ok ? "rgba(192,255,114,0.07)" : "rgba(239,68,68,0.07)",
        borderColor: ok ? "rgba(192,255,114,0.24)" : "rgba(239,68,68,0.24)",
        color: ok ? "#c0ff72" : "#f87171",
      }}
    >
      {ok ? <Ic.Check s={10} /> : <Ic.X s={10} />}
      {message}
    </div>
  );
}

function Avatar({
  url,
  name,
  size = 88,
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
  if (url) return <img src={url} alt={name} className="p-avatar-img" />;
  return (
    <div
      className="p-avatar-initials"
      style={{
        background: ec.accentFaint,
        color: ec.accent,
        fontSize: size * 0.26,
      }}
    >
      {initials || "?"}
    </div>
  );
}

function Section({
  title,
  icon,
  children,
  flush,
  count,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  flush?: boolean;
  count?: number;
}) {
  return (
    <div className="p-section">
      <div className="p-section-header">
        <div className="p-section-title">
          {icon && (
            <span style={{ color: "var(--color-text-muted)", display: "flex" }}>
              {icon}
            </span>
          )}
          <span className="p-section-title-text">{title}</span>
          {count !== undefined && (
            <span
              style={{
                fontSize: 9,
                fontFamily: "'Geist Mono',monospace",
                padding: "1px 7px",
                borderRadius: 5,
                background: "rgba(255,255,255,0.06)",
                color: "var(--color-text-muted)",
              }}
            >
              {count}
            </span>
          )}
        </div>
      </div>
      <div className={flush ? "p-section-body-flush" : "p-section-body"}>
        {children}
      </div>
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
    <div className="p-info-row">
      <span className="p-info-label">
        <span style={{ display: "flex", color: "var(--color-text-muted)" }}>
          {icon}
        </span>
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-info-link"
        >
          {value} <Ic.ExternalLink />
        </a>
      ) : (
        <span className="p-info-val">{value}</span>
      )}
    </div>
  );
}

function SkillBar({ skill }: { skill: string }) {
  const hash = skill.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pct = 42 + (hash % 52);
  return (
    <div className="p-skill">
      <div className="p-skill-row">
        <span className="p-skill-name">{skill}</span>
        <span className="p-skill-pct">{pct}%</span>
      </div>
      <div className="p-skill-track">
        <div className="p-skill-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CandRow({ c }: { c: Candidatura }) {
  const col = CAND_MAP[c.estado] ?? {
    color: "#6b7280",
    label: c.estado,
    bg: "rgba(107,114,128,0.1)",
  };
  const date = new Date(c.fecha_envio).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="p-cand">
      <div style={{ minWidth: 0 }}>
        <div className="p-cand-name">
          {c.titulo_oferta ?? `Oferta #${c.id_candidatura}`}
        </div>
        <div className="p-cand-date">{date}</div>
        {c.comentario_empresa && (
          <div className="p-cand-comment">"{c.comentario_empresa}"</div>
        )}
      </div>
      <span
        className="p-status-pill"
        style={{
          background: col.bg,
          color: col.color,
          borderColor: `${col.color}30`,
        }}
      >
        <Ic.Dot color={col.color} />
        {col.label}
      </span>
    </div>
  );
}

function SugItem({
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
  return (
    <a href={profile.href} className="p-sug-item">
      <div
        className="p-sug-avatar"
        style={{
          background: ec.accentFaint,
          border: `1px solid ${ec.accentBorder}`,
          color: ec.accent,
        }}
      >
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.name} />
        ) : (
          <span>{initials || "?"}</span>
        )}
      </div>
      <div className="p-sug-info">
        <div className="p-sug-name">{profile.name}</div>
        {profile.subtitle && (
          <div className="p-sug-sub">{profile.subtitle}</div>
        )}
      </div>
      <span
        className="p-sug-chip"
        style={{ background: ec.accentFaint, color: ec.accent }}
      >
        {profile.reason}
      </span>
    </a>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

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
  const [relatedSuggestions, setRelatedSuggestions] = useState<
    SuggestedProfile[]
  >([]);
  const [roleSuggestions, setRoleSuggestions] = useState<SuggestedProfile[]>(
    [],
  );
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
              .limit(15);
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

      loads.push(
        (async () => {
          const sugs: SuggestedProfile[] = [];
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
                .limit(3);
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
                    avatarUrl: p.avatar_url ?? undefined,
                    href: `/estudiante/${p.id}`,
                    reason: "Centro",
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
                    avatarUrl: p.avatar_url ?? undefined,
                    href: `/estudiante/${p.id}`,
                    reason: "Titulación",
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
                  avatarUrl: e.logo_url ?? undefined,
                  href: `/empresa/${e.id}`,
                  reason: emp.sector!,
                }),
              );
            }
            if (sugs.length < 4) {
              const existing = new Set([...sugs.map((s) => s.id), entityId]);
              const { data: byCity } = await supabase
                .from("empresa")
                .select("id, nombre, sector, ciudad, logo_url")
                .eq("ciudad", (profile as Empresa).ciudad ?? "")
                .neq("id", entityId)
                .limit(4);
              (byCity ?? [])
                .filter((e) => !existing.has(e.id))
                .slice(0, 4 - sugs.length)
                .forEach((e) =>
                  sugs.push({
                    id: e.id,
                    type: "empresa",
                    name: e.nombre,
                    subtitle: [e.sector, e.ciudad].filter(Boolean).join(" · "),
                    avatarUrl: e.logo_url ?? undefined,
                    href: `/empresa/${e.id}`,
                    reason: "Ciudad",
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
                  avatarUrl: c.avatar_url ?? undefined,
                  href: `/centro/${c.id}`,
                  reason: centro.ciudad!,
                }),
              );
            }
          }
          setRelatedSuggestions(sugs.slice(0, 4));
        })(),
      );

      loads.push(
        (async () => {
          const roleSugs: SuggestedProfile[] = [];
          try {
            if (viewerRole === "estudiante") {
              const { data } = await supabase
                .from("estudiante")
                .select("id, nombre, apellidos, titulacion, ciudad, avatar_url")
                .neq("id", viewerId)
                .limit(5);
              (data ?? []).forEach((p) =>
                roleSugs.push({
                  id: p.id,
                  type: "estudiante",
                  name: `${p.nombre ?? ""} ${p.apellidos ?? ""}`.trim(),
                  subtitle: [p.titulacion, p.ciudad]
                    .filter(Boolean)
                    .join(" · "),
                  avatarUrl: p.avatar_url ?? undefined,
                  href: `/estudiante/${p.id}`,
                  reason: "Perfil",
                }),
              );
            } else if (viewerRole === "empresa") {
              const { data } = await supabase
                .from("empresa")
                .select("id, nombre, sector, ciudad, logo_url")
                .neq("id", viewerId)
                .limit(5);
              (data ?? []).forEach((e) =>
                roleSugs.push({
                  id: e.id,
                  type: "empresa",
                  name: e.nombre,
                  subtitle: [e.sector, e.ciudad].filter(Boolean).join(" · "),
                  avatarUrl: e.logo_url ?? undefined,
                  href: `/empresa/${e.id}`,
                  reason: "Empresa",
                }),
              );
            } else if (viewerRole === "centro_educativo") {
              const { data } = await supabase
                .from("centro_educativo")
                .select("id, nombre, tipo_centro, ciudad, avatar_url")
                .neq("id", viewerId)
                .limit(5);
              (data ?? []).forEach((c) =>
                roleSugs.push({
                  id: c.id,
                  type: "centro_educativo",
                  name: c.nombre,
                  subtitle: [c.tipo_centro, c.ciudad]
                    .filter(Boolean)
                    .join(" · "),
                  avatarUrl: c.avatar_url ?? undefined,
                  href: `/centro/${c.id}`,
                  reason: "Centro",
                }),
              );
            } else if (viewerRole === "administrador") {
              const [estRes, empRes] = await Promise.all([
                supabase
                  .from("estudiante")
                  .select(
                    "id, nombre, apellidos, titulacion, ciudad, avatar_url",
                  )
                  .limit(3),
                supabase
                  .from("empresa")
                  .select("id, nombre, sector, ciudad, logo_url")
                  .limit(2),
              ]);
              (estRes.data ?? []).forEach((p) =>
                roleSugs.push({
                  id: p.id,
                  type: "estudiante",
                  name: `${p.nombre ?? ""} ${p.apellidos ?? ""}`.trim(),
                  subtitle: [p.titulacion, p.ciudad]
                    .filter(Boolean)
                    .join(" · "),
                  avatarUrl: p.avatar_url ?? undefined,
                  href: `/estudiante/${p.id}`,
                  reason: "Estudiante",
                }),
              );
              (empRes.data ?? []).forEach((e) =>
                roleSugs.push({
                  id: e.id,
                  type: "empresa",
                  name: e.nombre,
                  subtitle: [e.sector, e.ciudad].filter(Boolean).join(" · "),
                  avatarUrl: e.logo_url ?? undefined,
                  href: `/empresa/${e.id}`,
                  reason: "Empresa",
                }),
              );
            } else {
              const { data } = await supabase
                .from("estudiante")
                .select("id, nombre, apellidos, titulacion, ciudad, avatar_url")
                .limit(5);
              (data ?? []).forEach((p) =>
                roleSugs.push({
                  id: p.id,
                  type: "estudiante",
                  name: `${p.nombre ?? ""} ${p.apellidos ?? ""}`.trim(),
                  subtitle: [p.titulacion, p.ciudad]
                    .filter(Boolean)
                    .join(" · "),
                  avatarUrl: p.avatar_url ?? undefined,
                  href: `/estudiante/${p.id}`,
                  reason: "Estudiante",
                }),
              );
            }
          } catch (_) {}
          setRoleSuggestions(roleSugs);
        })(),
      );

      await Promise.all(loads);
    };
    loadExtras();
  }, [profile, rawEntityType, entityId, isTutorPage, viewerRole, viewerId]);

  // ── Viewer context ──
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
    if (onBack) onBack();
    else history.back();
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
    }, "Estudiante asignado");
  const handleUnassign = () =>
    withAction(async () => {
      const { error: e } = await supabase
        .from("centro_estudiante")
        .update({ id_tutor: null })
        .eq("id_estudiante", entityId);
      if (e) throw e;
      setViewerContext((c) => ({ ...c, isMiEstudiante: false }));
    }, "Estudiante desasignado");
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
    }, "Guardado");

  // ── Loading ──
  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <style>{CSS}</style>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "2px solid var(--color-border-strong)",
            borderTopColor: "var(--color-brand)",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
      </div>
    );

  if (error || (!profile && !tutorProfile))
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <style>{CSS}</style>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ic.Info />
        </div>
        <span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
          {error ?? "Perfil no encontrado"}
        </span>
        <button
          className="p-btn p-btn-secondary"
          onClick={handleBack}
          style={{ fontFamily: "inherit" }}
        >
          <Ic.ArrowLeft /> Volver
        </button>
      </div>
    );

  // ── Tutor page ──
  if (isTutorPage && tutorProfile) {
    const name = tutorProfile.nombre ?? "";
    return (
      <MainLayout>
        <style>{CSS}</style>
        <div className="p-root">
          <div className="p-page" style={{ maxWidth: 760 }}>
            <div className="p-back-row">
              <button className="p-back" onClick={handleBack}>
                <Ic.ArrowLeft /> Volver
              </button>
            </div>
            <div className="p-hero">
              <div className="p-cover">
                <div
                  className="p-cover-bg"
                  style={{
                    background: `linear-gradient(135deg, ${ec.coverFrom}, ${ec.coverTo})`,
                  }}
                />
                <div className="p-cover-dots" />
                <div className="p-cover-fade" />
                <div
                  className="p-cover-line"
                  style={{
                    background: `linear-gradient(90deg, ${ec.accent}50, transparent)`,
                  }}
                />
              </div>
              <div className="p-head">
                <div className="p-avatar-wrap">
                  <div
                    className="p-avatar-shell"
                    style={{ borderColor: ec.accentBorder }}
                  >
                    <Avatar url={tutorProfile.avatar_url} name={name} ec={ec} />
                  </div>
                </div>
                <div className="p-name-row">
                  <div className="p-name-info">
                    <div
                      className="p-entity-badge"
                      style={{ background: ec.accentFaint, color: ec.accent }}
                    >
                      <Ic.Dot color={ec.dot} /> {ec.label}
                    </div>
                    <h1 className="p-name">{name}</h1>
                    <p className="p-headline">
                      {tutorType === "tutor_empresa"
                        ? tutorProfile.cargo
                        : tutorProfile.departamento}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Helpers ──
  const getName = () =>
    rawEntityType === "estudiante"
      ? `${(profile as Estudiante).nombre ?? ""} ${(profile as Estudiante).apellidos ?? ""}`.trim()
      : ((profile as Empresa | CentroEducativo).nombre ?? "");
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
  const getSubtitle = () => {
    if (rawEntityType === "estudiante")
      return [
        (profile as Estudiante).titulacion,
        (profile as Estudiante).ciudad,
      ]
        .filter(Boolean)
        .join(" · ");
    if (rawEntityType === "empresa")
      return [
        (profile as Empresa).sector,
        (profile as Empresa).ciudad,
        (profile as Empresa).tamano,
      ]
        .filter(Boolean)
        .join(" · ");
    if (rawEntityType === "centro_educativo")
      return [
        (profile as CentroEducativo).tipo_centro,
        (profile as CentroEducativo).ciudad,
        (profile as CentroEducativo).provincia,
      ]
        .filter(Boolean)
        .join(" · ");
    return "";
  };

  const profileName = getName();
  const avatarUrl = getAvatar();
  const memberSince = getMemberSince();
  const isVerified =
    "verificado" in (profile ?? {}) && (profile as any).verificado;
  const dispInfo =
    rawEntityType === "estudiante"
      ? (DISP_MAP[(profile as Estudiante).disponibilidad ?? ""] ?? null)
      : null;

  const canSeeCandidaturas =
    viewerRole === "administrador" ||
    viewerRole === "empresa" ||
    viewerRole === "tutor_empresa" ||
    viewerRole === "tutor_centro" ||
    (viewerRole === "estudiante" &&
      rawEntityType === "estudiante" &&
      entityId === viewerId);

  const hasStats =
    stats.candidaturas > 0 ||
    stats.ofertas > 0 ||
    stats.estudiantes > 0 ||
    stats.valoracion !== undefined;

  // ── Actions ──
  function renderActions() {
    if (viewerRole === "administrador")
      return (
        <>
          {(rawEntityType === "empresa" ||
            rawEntityType === "centro_educativo") && (
            <Btn
              label="Verificar"
              variant="primary"
              onClick={handleVerify(
                rawEntityType as "empresa" | "centro_educativo",
              )}
              loading={al}
              icon={<Ic.Check />}
            />
          )}
          {userBlock?.blocked ? (
            <Btn
              label="Desbloquear"
              onClick={handleUnblock}
              loading={al}
              icon={<Ic.Unlock />}
            />
          ) : (
            <Btn
              label="Bloquear"
              danger
              onClick={handleBlock}
              loading={al}
              icon={<Ic.Lock />}
            />
          )}
          <Btn
            label="Eliminar"
            danger
            onClick={handleDelete}
            loading={al}
            icon={<Ic.Trash />}
          />
          <Btn
            label="Mensaje"
            onClick={() => alert("Abrir chat")}
            icon={<Ic.Message />}
          />
        </>
      );
    if (viewerRole === "centro_educativo" && rawEntityType === "estudiante")
      return (
        <>
          {viewerContext.isEnrolledEstudiante ? (
            <Btn
              label="Desvincular"
              danger
              onClick={handleUnenroll}
              loading={al}
            />
          ) : (
            <Btn
              label="Vincular al centro"
              variant="primary"
              onClick={handleEnroll}
              loading={al}
              icon={<Ic.Users />}
            />
          )}
          <Btn
            label="Mensaje"
            onClick={() => alert("Abrir chat")}
            icon={<Ic.Message />}
          />
        </>
      );
    if (viewerRole === "tutor_centro" && rawEntityType === "estudiante") {
      const sameCenter = !!viewerContext.centroEstudiante;
      return (
        <>
          {sameCenter ? (
            viewerContext.isMiEstudiante ? (
              <Btn
                label="Quitar tutorizado"
                danger
                onClick={handleUnassign}
                loading={al}
              />
            ) : (
              <Btn
                label="Tutorizar"
                variant="primary"
                onClick={handleAssign}
                loading={al}
                icon={<Ic.Users />}
              />
            )
          ) : (
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                alignSelf: "center",
              }}
            >
              Fuera de tu centro
            </span>
          )}
          <Btn
            label="Mensaje"
            onClick={() => alert("Abrir chat")}
            icon={<Ic.Message />}
          />
        </>
      );
    }
    if (viewerRole === "tutor_empresa" && rawEntityType === "estudiante")
      return (
        <>
          {viewerContext.isMyPracticasStudent ? (
            <Btn
              label="Finalizar prácticas"
              danger
              onClick={handleEndPracticas}
              loading={al}
            />
          ) : (
            <Btn
              label="Iniciar prácticas"
              variant="primary"
              onClick={handleStartPracticas}
              loading={al}
              icon={<Ic.Briefcase />}
            />
          )}
          <Btn
            label="Guardar"
            onClick={handleGuardar}
            loading={al}
            icon={<Ic.Bookmark />}
          />
          <Btn
            label="Mensaje"
            onClick={() => alert("Abrir chat")}
            icon={<Ic.Message />}
          />
        </>
      );
    if (viewerRole === "empresa") {
      if (rawEntityType === "estudiante")
        return (
          <>
            <Btn
              label="Guardar perfil"
              variant="primary"
              onClick={handleGuardar}
              loading={al}
              icon={<Ic.Bookmark />}
            />
            <Btn
              label="Mensaje"
              onClick={() => alert("Abrir chat")}
              icon={<Ic.Message />}
            />
          </>
        );
      if (rawEntityType === "centro_educativo")
        return (
          <Btn
            label="Contactar centro"
            onClick={() => alert("Abrir chat")}
            icon={<Ic.Message />}
          />
        );
    }
    if (viewerRole === "estudiante") {
      if (rawEntityType === "empresa")
        return (
          <>
            <Btn
              label="Ver ofertas"
              variant="primary"
              onClick={() =>
                (window.location.href = `/empresa/${entityId}/ofertas`)
              }
              icon={<Ic.Layers />}
            />
            <Btn
              label="Mensaje"
              onClick={() => alert("Abrir chat")}
              icon={<Ic.Message />}
            />
          </>
        );
      if (rawEntityType === "centro_educativo")
        return (
          <Btn
            label="Contactar centro"
            onClick={() => alert("Abrir chat")}
            icon={<Ic.Message />}
          />
        );
    }
    return null;
  }

  // ── Info sections ──
  function renderInfo() {
    if (rawEntityType === "estudiante") {
      const s = profile as Estudiante;
      return (
        <>
          {s.sobre_mi && (
            <Section title="Presentación" icon={<Ic.Info />}>
              <p className="p-prose">{s.sobre_mi}</p>
            </Section>
          )}

          <div className="p-two-col">
            <Section title="Contacto y búsqueda" icon={<Ic.FileText />}>
              <InfoRow icon={<Ic.MapPin />} label="Ciudad" value={s.ciudad} />
              <InfoRow
                icon={<Ic.GradCap />}
                label="Titulación"
                value={s.titulacion}
              />
              <InfoRow
                icon={<Ic.Calendar />}
                label="Disponibilidad"
                value={s.disponibilidad}
              />
              <InfoRow
                icon={<Ic.Briefcase />}
                label="Tipo búsqueda"
                value={s.tipo_busqueda}
              />
              <InfoRow
                icon={<Ic.Globe />}
                label="Modalidad"
                value={s.modalidad}
              />
              {(viewerRole !== "estudiante" || entityId === viewerId) && (
                <InfoRow
                  icon={<Ic.Phone />}
                  label="Teléfono"
                  value={s.telefono}
                />
              )}
              {(viewerRole === "administrador" ||
                viewerRole === "tutor_centro" ||
                viewerRole === "tutor_empresa") && (
                <InfoRow icon={<Ic.Mail />} label="Email" value={s.email} />
              )}
              {s.github_username && (
                <InfoRow
                  icon={<Ic.GitHub />}
                  label="GitHub"
                  value={`github.com/${s.github_username}`}
                  href={`https://github.com/${s.github_username}`}
                />
              )}
            </Section>

            {s.habilidades && s.habilidades.length > 0 && (
              <Section title="Nivel de habilidades" icon={<Ic.Activity />}>
                {s.habilidades.slice(0, 7).map((h) => (
                  <SkillBar key={h} skill={h} />
                ))}
              </Section>
            )}
          </div>

          {s.habilidades && s.habilidades.length > 0 && (
            <Section title="Habilidades y tecnologías" icon={<Ic.Code />}>
              <div className="p-tags">
                {s.habilidades.map((h) => (
                  <span key={h} className="p-tag">
                    <Ic.Hash />
                    {h}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {Array.isArray(s.formaciones) && s.formaciones.length > 0 && (
            <Section title="Formación académica" icon={<Ic.GradCap />}>
              {(s.formaciones as Record<string, string>[]).map((f, i) => (
                <div key={i} className="p-formation">
                  <div
                    className="p-formation-icon"
                    style={{
                      background: EC.centro_educativo.accentFaint,
                      border: `1px solid ${EC.centro_educativo.accentBorder}`,
                      color: EC.centro_educativo.accent,
                    }}
                  >
                    <Ic.GradCap />
                  </div>
                  <div>
                    <div className="p-formation-name">{f.titulo}</div>
                    <div className="p-formation-sub">
                      {[f.institucion, f.anio].filter(Boolean).join(" · ")}
                    </div>
                    {f.descripcion && (
                      <div className="p-formation-desc">{f.descripcion}</div>
                    )}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {Array.isArray(s.proyectos) && s.proyectos.length > 0 && (
            <Section title="Proyectos destacados" icon={<Ic.Code />}>
              <div className="p-projects">
                {(s.proyectos as Record<string, string>[]).map((p, i) => (
                  <div key={i} className="p-project">
                    <div className="p-project-name">{p.titulo}</div>
                    {p.descripcion && (
                      <div className="p-project-desc">{p.descripcion}</div>
                    )}
                    {p.enlace && (
                      <a
                        href={p.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-project-link"
                      >
                        Ver proyecto <Ic.ExternalLink />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {s.redes_sociales && Object.keys(s.redes_sociales).length > 0 && (
            <Section title="Redes sociales" icon={<Ic.Link />}>
              {Object.entries(s.redes_sociales).map(([red, url]) => (
                <InfoRow
                  key={red}
                  icon={<Ic.Link />}
                  label={red}
                  value={url}
                  href={url}
                />
              ))}
            </Section>
          )}
        </>
      );
    }

    if (rawEntityType === "empresa") {
      const e = profile as Empresa;
      return (
        <>
          {e.descripcion && (
            <Section title="Sobre la empresa" icon={<Ic.Building />}>
              <p className="p-prose">{e.descripcion}</p>
            </Section>
          )}
          <div className="p-two-col">
            <Section title="Información corporativa" icon={<Ic.FileText />}>
              <InfoRow icon={<Ic.MapPin />} label="Ciudad" value={e.ciudad} />
              <InfoRow
                icon={<Ic.Briefcase />}
                label="Sector"
                value={e.sector}
              />
              <InfoRow icon={<Ic.Users />} label="Tamaño" value={e.tamano} />
              <InfoRow
                icon={<Ic.Mail />}
                label="Email"
                value={e.email_contacto}
              />
              <InfoRow
                icon={<Ic.Phone />}
                label="Teléfono"
                value={e.telefono}
              />
              <InfoRow
                icon={<Ic.Globe />}
                label="Web"
                value={e.web}
                href={e.web}
              />
              {viewerRole === "administrador" && (
                <InfoRow icon={<Ic.Shield />} label="CIF" value={e.cif} />
              )}
            </Section>

            {(e.linkedin || e.twitter) && (
              <Section title="Redes y presencia" icon={<Ic.Link />}>
                {e.linkedin && (
                  <InfoRow
                    icon={<Ic.Linkedin />}
                    label="LinkedIn"
                    value={e.linkedin}
                    href={e.linkedin}
                  />
                )}
                {e.twitter && (
                  <InfoRow
                    icon={<Ic.Twitter />}
                    label="Twitter / X"
                    value={e.twitter}
                    href={e.twitter}
                  />
                )}
              </Section>
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
            <Section title="Sobre el centro" icon={<Ic.BookOpen />}>
              <p className="p-prose">{c.descripcion}</p>
            </Section>
          )}
          <div className="p-two-col">
            <Section title="Datos del centro" icon={<Ic.FileText />}>
              <InfoRow icon={<Ic.MapPin />} label="Ciudad" value={c.ciudad} />
              <InfoRow
                icon={<Ic.MapPin />}
                label="Provincia"
                value={c.provincia}
              />
              <InfoRow
                icon={<Ic.BookOpen />}
                label="Tipo"
                value={c.tipo_centro}
              />
              <InfoRow
                icon={<Ic.Users />}
                label="N.º alumnos"
                value={c.num_alumnos?.toString()}
              />
              <InfoRow
                icon={<Ic.Mail />}
                label="Email"
                value={c.email_contacto}
              />
              <InfoRow
                icon={<Ic.Phone />}
                label="Teléfono"
                value={c.telefono}
              />
              <InfoRow
                icon={<Ic.Globe />}
                label="Web"
                value={c.sitio_web}
                href={c.sitio_web}
              />
            </Section>

            {c.titulaciones && c.titulaciones.length > 0 && (
              <Section title="Titulaciones ofertadas" icon={<Ic.Layers />}>
                <div className="p-tags" style={{ gap: 5 }}>
                  {c.titulaciones.map((t) => (
                    <span
                      key={t}
                      className="p-tag"
                      style={{
                        background: ec.accentFaint,
                        borderColor: ec.accentBorder,
                        color: ec.accent,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </>
      );
    }
    return null;
  }

  // ── Sidebar data ──
  function renderSidebarData() {
    if (rawEntityType === "estudiante") {
      const s = profile as Estudiante;
      return (
        <>
          {s.ciudad && (
            <div className="p-data-row">
              <span className="p-data-label">Ciudad</span>
              <span className="p-data-val">{s.ciudad}</span>
            </div>
          )}
          {s.titulacion && (
            <div className="p-data-row">
              <span className="p-data-label">Titulación</span>
              <span className="p-data-val">{s.titulacion}</span>
            </div>
          )}
          {s.modalidad && (
            <div className="p-data-row">
              <span className="p-data-label">Modalidad</span>
              <span className="p-data-val">{s.modalidad}</span>
            </div>
          )}
          {s.tipo_busqueda && (
            <div className="p-data-row">
              <span className="p-data-label">Búsqueda</span>
              <span className="p-data-val">{s.tipo_busqueda}</span>
            </div>
          )}
          {s.disponibilidad &&
            (() => {
              const d = DISP_MAP[s.disponibilidad!];
              return d ? (
                <div className="p-data-row">
                  <span className="p-data-label">Estado</span>
                  <span
                    style={{
                      color: d.color,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Ic.Dot color={d.color} /> {d.label}
                  </span>
                </div>
              ) : null;
            })()}
        </>
      );
    }
    if (rawEntityType === "empresa") {
      const e = profile as Empresa;
      return (
        <>
          {e.sector && (
            <div className="p-data-row">
              <span className="p-data-label">Sector</span>
              <span className="p-data-val">{e.sector}</span>
            </div>
          )}
          {e.ciudad && (
            <div className="p-data-row">
              <span className="p-data-label">Ciudad</span>
              <span className="p-data-val">{e.ciudad}</span>
            </div>
          )}
          {e.tamano && (
            <div className="p-data-row">
              <span className="p-data-label">Tamaño</span>
              <span className="p-data-val">{e.tamano}</span>
            </div>
          )}
          <div className="p-data-row">
            <span className="p-data-label">Verificada</span>
            <span
              style={{
                color: isVerified ? "#4ade80" : "#f87171",
                fontSize: 12,
              }}
            >
              {isVerified ? "Sí" : "No"}
            </span>
          </div>
        </>
      );
    }
    if (rawEntityType === "centro_educativo") {
      const c = profile as CentroEducativo;
      return (
        <>
          {c.tipo_centro && (
            <div className="p-data-row">
              <span className="p-data-label">Tipo</span>
              <span className="p-data-val">{c.tipo_centro}</span>
            </div>
          )}
          {c.ciudad && (
            <div className="p-data-row">
              <span className="p-data-label">Ciudad</span>
              <span className="p-data-val">{c.ciudad}</span>
            </div>
          )}
          {c.provincia && (
            <div className="p-data-row">
              <span className="p-data-label">Provincia</span>
              <span className="p-data-val">{c.provincia}</span>
            </div>
          )}
          {c.num_alumnos != null && (
            <div className="p-data-row">
              <span className="p-data-label">Alumnos</span>
              <span className="p-data-val">{c.num_alumnos}</span>
            </div>
          )}
          <div className="p-data-row">
            <span className="p-data-label">Verificado</span>
            <span
              style={{
                color: isVerified ? "#4ade80" : "#f87171",
                fontSize: 12,
              }}
            >
              {isVerified ? "Sí" : "No"}
            </span>
          </div>
        </>
      );
    }
    return null;
  }

  const suggestionTitle =
    rawEntityType === "empresa"
      ? "Empresas relacionadas"
      : rawEntityType === "centro_educativo"
        ? "Centros relacionados"
        : "Perfiles relacionados";
  const roleTitle =
    viewerRole === "estudiante"
      ? "Otros estudiantes"
      : viewerRole === "empresa"
        ? "Otras empresas"
        : viewerRole === "centro_educativo"
          ? "Otros centros"
          : "Perfiles sugeridos";

  const statsCount =
    (rawEntityType === "estudiante" && stats.candidaturas > 0 ? 1 : 0) +
    (rawEntityType === "empresa" && stats.ofertas > 0 ? 1 : 0) +
    (rawEntityType === "empresa" && stats.valoracion !== undefined ? 1 : 0) +
    (rawEntityType === "centro_educativo" && stats.estudiantes > 0 ? 1 : 0);
  const statsClass =
    statsCount >= 3
      ? "p-stats p-stats-3"
      : statsCount === 2
        ? "p-stats p-stats-2"
        : "p-stats p-stats-1";

  // ── Render ──
  return (
    <MainLayout>
      <style>{CSS}</style>
      <div className="p-root">
        <div className="p-page">
          {/* Back */}
          <div className="p-back-row">
            <button className="p-back" onClick={handleBack}>
              <Ic.ArrowLeft /> Volver al directorio
            </button>
          </div>

          <div className="p-layout">
            {/* ── Main column ── */}
            <div>
              {/* Hero Card */}
              <div className="p-hero">
                {/* Cover band */}
                <div className="p-cover">
                  <div
                    className="p-cover-bg"
                    style={{
                      background: `linear-gradient(135deg, ${ec.coverFrom} 0%, ${ec.coverTo} 100%)`,
                    }}
                  />
                  <div className="p-cover-dots" />
                  <div className="p-cover-fade" />
                  <div
                    className="p-cover-line"
                    style={{
                      background: `linear-gradient(90deg, ${ec.accent}55, transparent 60%)`,
                    }}
                  />
                </div>

                {/* Profile head */}
                <div className="p-head">
                  {/* Avatar */}
                  <div className="p-avatar-wrap">
                    <div
                      className="p-avatar-shell"
                      style={{ borderColor: ec.accentBorder }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <Avatar url={avatarUrl} name={profileName} ec={ec} />
                        {isVerified && (
                          <div className="p-verified-badge">
                            <Ic.Check s={9} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name + actions */}
                  <div className="p-name-row">
                    <div className="p-name-info">
                      <div
                        className="p-entity-badge"
                        style={{ background: ec.accentFaint, color: ec.accent }}
                      >
                        <Ic.Dot color={ec.dot} />
                        {rawEntityType ? EC[rawEntityType].label : ""}
                        {isVerified && (
                          <span className="p-verified-chip">
                            <Ic.Check s={7} /> verificado
                          </span>
                        )}
                      </div>
                      <h1 className="p-name">{profileName}</h1>
                      {getSubtitle() && (
                        <p className="p-headline">{getSubtitle()}</p>
                      )}
                    </div>
                    <div className="p-actions">{renderActions()}</div>
                  </div>

                  {/* Meta pills */}
                  {(memberSince ||
                    dispInfo ||
                    (rawEntityType === "empresa" &&
                      (profile as Empresa).web)) && (
                    <div className="p-meta-row">
                      {memberSince && (
                        <span className="p-meta-item">
                          <Ic.Calendar /> Miembro desde {memberSince}
                        </span>
                      )}
                      {dispInfo && (
                        <span
                          className="p-meta-item"
                          style={{ color: dispInfo.color }}
                        >
                          <Ic.Dot color={dispInfo.color} /> {dispInfo.label}
                        </span>
                      )}
                      {rawEntityType === "empresa" &&
                        (profile as Empresa).web && (
                          <a
                            href={(profile as Empresa).web!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-meta-link"
                            style={{ color: ec.accent }}
                          >
                            <Ic.Globe /> {(profile as Empresa).web}
                          </a>
                        )}
                    </div>
                  )}
                </div>

                {/* Stats strip */}
                {hasStats && (
                  <div className={statsClass}>
                    {rawEntityType === "estudiante" &&
                      stats.candidaturas > 0 && (
                        <div className="p-stat">
                          <div
                            className="p-stat-value"
                            style={{ color: ec.accent }}
                          >
                            {stats.candidaturas}
                          </div>
                          <div className="p-stat-label">Candidaturas</div>
                        </div>
                      )}
                    {rawEntityType === "empresa" && stats.ofertas > 0 && (
                      <div className="p-stat">
                        <div
                          className="p-stat-value"
                          style={{ color: ec.accent }}
                        >
                          {stats.ofertas}
                        </div>
                        <div className="p-stat-label">Ofertas activas</div>
                      </div>
                    )}
                    {rawEntityType === "empresa" &&
                      stats.valoracion !== undefined && (
                        <div className="p-stat">
                          <div
                            className="p-stat-value"
                            style={{ color: "#facc15" }}
                          >
                            {stats.valoracion}
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 400,
                                color: "var(--color-text-muted)",
                              }}
                            >
                              /5
                            </span>
                          </div>
                          <div className="p-stat-label">Valoración media</div>
                        </div>
                      )}
                    {rawEntityType === "centro_educativo" &&
                      stats.estudiantes > 0 && (
                        <div className="p-stat">
                          <div
                            className="p-stat-value"
                            style={{ color: ec.accent }}
                          >
                            {stats.estudiantes}
                          </div>
                          <div className="p-stat-label">Estudiantes</div>
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="p-tabs">
                {[
                  {
                    id: "info" as const,
                    label: "Información",
                    icon: <Ic.Info />,
                  },
                  ...(canSeeCandidaturas && rawEntityType === "estudiante"
                    ? [
                        {
                          id: "candidaturas" as const,
                          label: "Candidaturas",
                          count: stats.candidaturas,
                          icon: <Ic.FileText />,
                        },
                      ]
                    : []),
                  {
                    id: "actividad" as const,
                    label: "Actividad",
                    icon: <Ic.Activity />,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`p-tab${activeTab === tab.id ? " active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                    style={activeTab === tab.id ? { color: ec.accent } : {}}
                  >
                    <span
                      style={{
                        display: "flex",
                        opacity: activeTab === tab.id ? 1 : 0.45,
                      }}
                    >
                      {tab.icon}
                    </span>
                    {tab.label}
                    {"count" in tab &&
                      tab.count !== undefined &&
                      tab.count > 0 && (
                        <span className="p-tab-badge">{tab.count}</span>
                      )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "info" && renderInfo()}

              {activeTab === "candidaturas" && (
                <Section
                  title="Candidaturas"
                  icon={<Ic.FileText />}
                  count={stats.candidaturas}
                >
                  {candidaturas.length === 0 ? (
                    <div className="p-empty">
                      <Ic.FileText />
                      <span>No hay candidaturas registradas.</span>
                    </div>
                  ) : (
                    <div className="p-cand-list">
                      {candidaturas.map((c) => (
                        <CandRow key={c.id_candidatura} c={c} />
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {activeTab === "actividad" && (
                <Section title="Actividad reciente" icon={<Ic.Activity />}>
                  <div className="p-activity">
                    {memberSince && (
                      <div className="p-activity-item">
                        <div
                          className="p-activity-icon"
                          style={{
                            background: ec.accentFaint,
                            color: ec.accent,
                            borderColor: ec.accentBorder,
                          }}
                        >
                          <Ic.Calendar />
                        </div>
                        <div>
                          <div className="p-activity-text">
                            Perfil creado en Relance
                          </div>
                          <div className="p-activity-sub">{memberSince}</div>
                        </div>
                      </div>
                    )}
                    {rawEntityType === "estudiante" &&
                      stats.candidaturas > 0 && (
                        <div className="p-activity-item">
                          <div
                            className="p-activity-icon"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            <Ic.FileText />
                          </div>
                          <div>
                            <div className="p-activity-text">
                              {stats.candidaturas} candidatura
                              {stats.candidaturas > 1 ? "s" : ""} enviada
                              {stats.candidaturas > 1 ? "s" : ""}
                            </div>
                            <div className="p-activity-sub">
                              Ver historial en la pestaña Candidaturas
                            </div>
                          </div>
                        </div>
                      )}
                    {rawEntityType === "empresa" && stats.ofertas > 0 && (
                      <div className="p-activity-item">
                        <div
                          className="p-activity-icon"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          <Ic.Layers />
                        </div>
                        <div>
                          <div className="p-activity-text">
                            {stats.ofertas} oferta{stats.ofertas > 1 ? "s" : ""}{" "}
                            publicada{stats.ofertas > 1 ? "s" : ""}
                          </div>
                          <div className="p-activity-sub">
                            Historial de publicaciones
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-activity-soon">
                    El historial detallado de actividad estará disponible
                    próximamente.
                  </div>
                </Section>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="p-sidebar">
              {/* Context badges */}
              {(viewerContext.isMiEstudiante ||
                viewerContext.isEnrolledEstudiante ||
                viewerContext.isMyPracticasStudent) && (
                <div className="p-ctx-card">
                  {viewerContext.isMiEstudiante && (
                    <div className="p-ctx-item" style={{ color: "#4ade80" }}>
                      <Ic.Check s={11} /> Estudiante tutorizado por ti
                    </div>
                  )}
                  {viewerContext.isEnrolledEstudiante &&
                    !viewerContext.isMiEstudiante && (
                      <div className="p-ctx-item" style={{ color: "#60a5fa" }}>
                        <Ic.Info /> Matriculado en tu centro
                      </div>
                    )}
                  {viewerContext.isMyPracticasStudent && (
                    <div className="p-ctx-item" style={{ color: "#fb923c" }}>
                      <Ic.Briefcase /> En prácticas en tu empresa
                    </div>
                  )}
                </div>
              )}

              {/* Quick data */}
              {/* <div className="p-data-card">
                <div className="p-data-card-header">
                  <span className="p-data-card-title">Datos clave</span>
                </div>
                {renderSidebarData()}
              </div> */}

              {/* Related suggestions */}
              {relatedSuggestions.length > 0 && (
                <div className="p-sug-card">
                  <div className="p-sug-header">
                    <span className="p-sug-title">{suggestionTitle}</span>
                  </div>
                  <div className="p-sug-list">
                    {relatedSuggestions.map((s) => (
                      <SugItem key={s.id} profile={s} />
                    ))}
                  </div>
                </div>
              )}

              {/* Role suggestions */}
              {roleSuggestions.length > 0 && (
                <div className="p-sug-card">
                  <div className="p-sug-header">
                    <span className="p-sug-title">{roleTitle}</span>
                  </div>
                  <div className="p-sug-list">
                    {roleSuggestions.map((s) => (
                      <SugItem key={`role-${s.id}`} profile={s} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
    </MainLayout>
  );
}
