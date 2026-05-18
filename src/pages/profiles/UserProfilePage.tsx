/**
 * UserProfilePage.tsx — Rediseño Profesional Enterprise
 *
 * Página completa de perfil. Accesible mediante:
 *   /empresa/:id  |  /centro/:id  |  /estudiante/:id
 *   /tutor-empresa/:id  |  /tutor-centro/:id
 *
 * Sin emojis — todos los iconos son SVG inline.
 * Diseño editorial enterprise — denso, preciso, austero.
 * Tipografía: Geist + Geist Mono (Vercel's system)
 * Tamaños optimizados para portátil (~13" — todo ~10% más pequeño).
 */

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import MainLayout from "../../components/layout/MainLayout";

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

type TabItem =
  | { id: "info" | "actividad"; label: string; icon: React.ReactNode }
  | { id: "candidaturas"; label: string; count: number; icon: React.ReactNode };

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

// ─── Design tokens ────────────────────────────────────────────────────────────

const EC: Record<
  EntityType | "tutor_empresa" | "tutor_centro",
  {
    accent: string;
    accentFaint: string;
    accentBorder: string;
    label: string;
    dot: string;
  }
> = {
  empresa: {
    accent: "#c0ff72",
    accentFaint: "rgba(192,255,114,0.06)",
    accentBorder: "rgba(192,255,114,0.18)",
    label: "Empresa",
    dot: "#c0ff72",
  },
  centro_educativo: {
    accent: "#60a5fa",
    accentFaint: "rgba(96,165,250,0.06)",
    accentBorder: "rgba(96,165,250,0.18)",
    label: "Centro Educativo",
    dot: "#60a5fa",
  },
  estudiante: {
    accent: "#fb923c",
    accentFaint: "rgba(251,146,60,0.06)",
    accentBorder: "rgba(251,146,60,0.18)",
    label: "Estudiante",
    dot: "#fb923c",
  },
  oferta: {
    accent: "#a78bfa",
    accentFaint: "rgba(167,139,250,0.06)",
    accentBorder: "rgba(167,139,250,0.18)",
    label: "Oferta",
    dot: "#a78bfa",
  },
  tutor_empresa: {
    accent: "#f472b6",
    accentFaint: "rgba(244,114,182,0.06)",
    accentBorder: "rgba(244,114,182,0.18)",
    label: "Tutor de empresa",
    dot: "#f472b6",
  },
  tutor_centro: {
    accent: "#34d399",
    accentFaint: "rgba(52,211,153,0.06)",
    accentBorder: "rgba(52,211,153,0.18)",
    label: "Tutor de centro",
    dot: "#34d399",
  },
};

const DISP_MAP: Record<string, { label: string; color: string }> = {
  inmediata: { label: "Disponible ahora", color: "#4ade80" },
  "1_mes": { label: "Disponible en 1 mes", color: "#facc15" },
  "3_meses": { label: "Disponible en 3 meses", color: "#fb923c" },
  no_disponible: { label: "No disponible", color: "#f87171" },
};

const CAND_MAP: Record<string, { color: string; label: string }> = {
  pendiente: { color: "#facc15", label: "Pendiente" },
  aceptada: { color: "#4ade80", label: "Aceptada" },
  rechazada: { color: "#f87171", label: "Rechazada" },
  en_proceso: { color: "#60a5fa", label: "En proceso" },
};

// ─── Global styles injected once ─────────────────────────────────────────────

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap');
@keyframes spin { to { transform: rotate(360deg) } }
@keyframes toast-in { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
@keyframes fade-in { from { opacity:0 } to { opacity:1 } }

* { box-sizing: border-box; }

.up-root {
  min-height: 100vh;
  background: var(--color-bg);
  font-family: 'Geist', 'DM Sans', system-ui, sans-serif;
  font-size: 13px;
  color: var(--color-text);
  padding-top: 72px;
  animation: fade-in 0.18s ease;
}

.up-inner {
  max-width: 1020px;
  margin: 0 auto;
  padding: 28px 20px 80px;
  display: grid;
  grid-template-columns: 1fr 280px;
  grid-template-rows: auto 1fr;
  column-gap: 16px;
  row-gap: 0;
}

@media (max-width: 768px) {
  .up-inner { grid-template-columns: 1fr; }
  .up-sidebar { display: none; }
}

.up-main { grid-column: 1; }
.up-sidebar { grid-column: 2; grid-row: 1 / span 3; }

/* Back button */
.up-back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-subtle);
  font-size: 11.5px;
  font-family: inherit;
  padding: 0;
  margin-bottom: 18px;
  letter-spacing: 0.01em;
  transition: color 0.12s;
}
.up-back:hover { color: var(--color-text); }

/* Panel base */
.up-panel {
  background: var(--color-surface-strong, rgba(255,255,255,0.03));
  border: 1px solid var(--color-border, rgba(255,255,255,0.08));
  border-radius: 10px;
  overflow: hidden;
}

/* Hero panel */
.up-hero {
  margin-bottom: 10px;
  position: relative;
}

.up-hero-accent-bar {
  height: 2px;
  width: 100%;
}

.up-hero-body {
  padding: 20px 22px 18px;
}

.up-hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.up-hero-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.up-avatar-wrap { position: relative; flex-shrink: 0; }

.up-avatar {
  width: 58px;
  height: 58px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}

.up-avatar-placeholder {
  width: 58px;
  height: 58px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.up-verified-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #c0ff72;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-surface-strong, #111);
}

.up-hero-meta { padding-top: 2px; }

.up-entity-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-family: 'Geist Mono', 'DM Mono', monospace;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.up-name {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
  color: var(--color-text);
}

.up-subtitle {
  font-size: 12px;
  color: var(--color-text-muted, rgba(255,255,255,0.4));
  margin-top: 3px;
  letter-spacing: -0.01em;
}

.up-hero-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: flex-start;
  padding-top: 2px;
}

.up-pills {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 2px;
  margin-top: 12px;
  border-top: 1px solid var(--color-border, rgba(255,255,255,0.06));
  padding-top: 12px;
}

.up-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-subtle, rgba(255,255,255,0.35));
}

/* Stats strip */
.up-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  border-top: 1px solid var(--color-border, rgba(255,255,255,0.06));
}

.up-stat {
  padding: 14px 18px;
  border-right: 1px solid var(--color-border, rgba(255,255,255,0.06));
}
.up-stat:last-child { border-right: none; }

.up-stat-value {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 3px;
}

.up-stat-label {
  font-size: 10.5px;
  color: var(--color-text-subtle, rgba(255,255,255,0.35));
  font-family: 'Geist Mono', 'DM Mono', monospace;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Tabs */
.up-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.06));
  margin-bottom: 10px;
  gap: 0;
}

.up-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 9px 14px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  font-weight: 500;
  color: var(--color-text-muted, rgba(255,255,255,0.4));
  transition: all 0.12s;
  margin-bottom: -1px;
  letter-spacing: -0.01em;
}
.up-tab:hover { color: var(--color-text); }
.up-tab.active { color: var(--color-text); }

.up-tab-badge {
  font-size: 9.5px;
  font-family: 'Geist Mono', 'DM Mono', monospace;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(255,255,255,0.06);
}
.up-tab.active .up-tab-badge { background: rgba(255,255,255,0.1); }

/* Section cards */
.up-section {
  margin-bottom: 10px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--color-border, rgba(255,255,255,0.07));
  background: var(--color-surface-strong, rgba(255,255,255,0.02));
}

.up-section-header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.06));
  background: rgba(255,255,255,0.015);
}

.up-section-title {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'Geist Mono', 'DM Mono', monospace;
  color: var(--color-text-subtle, rgba(255,255,255,0.35));
}

.up-section-body { padding: 14px 16px; }
.up-section-body-flush { padding: 0; }

/* Info rows */
.up-info-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: baseline;
  gap: 8px;
  padding: 7px 0;
  border-bottom: 1px solid rgba(255,255,255,0.035);
}
.up-info-row:last-child { border-bottom: none; }

.up-info-label {
  font-size: 11px;
  color: var(--color-text-subtle, rgba(255,255,255,0.35));
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Geist Mono', 'DM Mono', monospace;
}

.up-info-value {
  font-size: 12.5px;
  color: var(--color-text-secondary, rgba(255,255,255,0.7));
  word-break: break-word;
}

.up-info-link {
  font-size: 12.5px;
  color: var(--color-brand, #c0ff72);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  word-break: break-word;
}
.up-info-link:hover { text-decoration: underline; }

/* Two-col grid */
.up-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}
@media (max-width: 600px) { .up-two-col { grid-template-columns: 1fr; } }

/* Skill bars */
.up-skill-row { margin-bottom: 10px; }
.up-skill-row:last-child { margin-bottom: 0; }
.up-skill-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.up-skill-name {
  font-size: 11.5px;
  color: var(--color-text-secondary, rgba(255,255,255,0.65));
}
.up-skill-pct {
  font-size: 10px;
  color: var(--color-text-subtle, rgba(255,255,255,0.35));
  font-family: 'Geist Mono', 'DM Mono', monospace;
}
.up-skill-track {
  height: 2px;
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
  overflow: hidden;
}
.up-skill-fill {
  height: 100%;
  border-radius: 2px;
}

/* Tags */
.up-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.up-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 5px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--color-text-secondary, rgba(255,255,255,0.55));
  font-family: 'Geist Mono', 'DM Mono', monospace;
}

.up-accent-tag {
  display: inline-flex;
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 5px;
  font-weight: 500;
}

/* Formation / project cards */
.up-formation-row {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  align-items: flex-start;
}
.up-formation-row:last-child { border-bottom: none; }

.up-formation-icon {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.up-formation-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.01em;
}
.up-formation-sub {
  font-size: 11px;
  color: var(--color-text-muted, rgba(255,255,255,0.4));
  margin-top: 2px;
  font-family: 'Geist Mono', 'DM Mono', monospace;
}

/* Project cards grid */
.up-projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}

.up-project-card {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 12px;
}

.up-project-name {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}
.up-project-desc {
  font-size: 11.5px;
  color: var(--color-text-muted, rgba(255,255,255,0.4));
  line-height: 1.5;
  margin-bottom: 8px;
}

/* Candidatura rows */
.up-cand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  gap: 10px;
}
.up-cand-row:last-child { border-bottom: none; }

.up-cand-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}
.up-cand-date {
  font-size: 10.5px;
  color: var(--color-text-subtle, rgba(255,255,255,0.35));
  font-family: 'Geist Mono', 'DM Mono', monospace;
  margin-top: 2px;
}
.up-status-pill {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: 'Geist Mono', 'DM Mono', monospace;
}

/* Activity log */
.up-activity-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 9px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.up-activity-row:last-child { border-bottom: none; }

.up-activity-icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--color-border, rgba(255,255,255,0.07));
}

.up-activity-text {
  font-size: 12px;
  color: var(--color-text-secondary, rgba(255,255,255,0.65));
}
.up-activity-sub {
  font-size: 10.5px;
  color: var(--color-text-subtle, rgba(255,255,255,0.35));
  font-family: 'Geist Mono', 'DM Mono', monospace;
  margin-top: 2px;
}

/* Action buttons */
.up-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 11.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.12s;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.up-btn-primary {
  background: var(--color-brand, #c0ff72);
  color: #0a1500;
  border-color: transparent;
}
.up-btn-primary:hover { filter: brightness(1.08); }

.up-btn-secondary {
  background: transparent;
  color: var(--color-text-secondary, rgba(255,255,255,0.7));
  border-color: var(--color-border-strong, rgba(255,255,255,0.12));
}
.up-btn-secondary:hover {
  background: rgba(255,255,255,0.04);
  color: var(--color-text);
}

.up-btn-danger {
  background: rgba(239,68,68,0.08);
  color: #f87171;
  border-color: rgba(239,68,68,0.2);
}
.up-btn-danger:hover { background: rgba(239,68,68,0.14); }

.up-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Loading spinner */
.up-spinner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  animation: spin 0.7s linear infinite;
}

/* Sidebar */
.up-sidebar-inner { position: sticky; top: 80px; display: flex; flex-direction: column; gap: 10px; }

/* Suggestion cards */
.up-suggestion {
  display: block;
  text-decoration: none;
  border-radius: 8px;
  border: 1px solid var(--color-border, rgba(255,255,255,0.07));
  background: var(--color-surface-strong, rgba(255,255,255,0.02));
  padding: 10px;
  transition: all 0.14s;
  margin-bottom: 0;
}
.up-suggestion:hover {
  border-color: rgba(255,255,255,0.13);
  background: rgba(255,255,255,0.04);
}

.up-sug-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }

.up-sug-avatar {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}
.up-sug-avatar-placeholder {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.up-sug-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.up-sug-sub {
  font-size: 10.5px;
  color: var(--color-text-muted, rgba(255,255,255,0.4));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.up-sug-reason {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 4px;
  font-family: 'Geist Mono', 'DM Mono', monospace;
  font-weight: 500;
}

/* Verified info strip */
.up-info-strip {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: rgba(255,255,255,0.015);
  border: 1px solid var(--color-border, rgba(255,255,255,0.07));
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}
.up-strip-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 11.5px;
}
.up-strip-row:last-child { border-bottom: none; }
.up-strip-label { color: var(--color-text-subtle, rgba(255,255,255,0.35)); min-width: 70px; font-family: 'Geist Mono', 'DM Mono', monospace; font-size: 10.5px; }
.up-strip-val { color: var(--color-text-secondary, rgba(255,255,255,0.65)); }

/* Toast */
.up-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  padding: 9px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 7px;
  animation: toast-in 0.18s ease forwards;
  border: 1px solid;
}

/* Divider label */
.up-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.up-divider-line { flex: 1; height: 1px; background: var(--color-border, rgba(255,255,255,0.06)); }
.up-divider-text {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: 'Geist Mono', 'DM Mono', monospace;
  color: var(--color-text-subtle, rgba(255,255,255,0.3));
  white-space: nowrap;
}

/* Prose */
.up-prose {
  font-size: 13px;
  color: var(--color-text-secondary, rgba(255,255,255,0.65));
  line-height: 1.75;
  margin: 0;
}

/* Empty state */
.up-empty {
  font-size: 12px;
  color: var(--color-text-muted, rgba(255,255,255,0.35));
  padding: 8px 0;
}

/* Sidebar section header */
.up-sidebar-label {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: 'Geist Mono', 'DM Mono', monospace;
  color: var(--color-text-subtle, rgba(255,255,255,0.3));
  margin-bottom: 7px;
}

.up-viewer-context-card {
  background: rgba(255,255,255,0.015);
  border: 1px solid var(--color-border, rgba(255,255,255,0.07));
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 11.5px;
  color: var(--color-text-secondary, rgba(255,255,255,0.6));
  line-height: 1.5;
}

.up-comment-box {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 11.5px;
  color: var(--color-text-secondary, rgba(255,255,255,0.6));
  font-style: italic;
  margin-top: 4px;
  line-height: 1.5;
}
`;

// ─── SVG Icons (compact, 12×12 stroke icons) ──────────────────────────────────

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
  ArrowRight: ({ s = 11 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
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
      <line x1="10" y1="9" x2="8" y2="9" />
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
    <svg width="6" height="6" viewBox="0 0 6 6">
      <circle cx="3" cy="3" r="3" fill={color} />
    </svg>
  ),
};

// ─── Small atom components ─────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
  flush,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  flush?: boolean;
}) {
  return (
    <div className="up-section">
      <div className="up-section-header">
        {icon && (
          <span style={{ color: "var(--color-text-subtle)", display: "flex" }}>
            {icon}
          </span>
        )}
        <span className="up-section-title">{title}</span>
      </div>
      <div className={flush ? "up-section-body-flush" : "up-section-body"}>
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
    <div className="up-info-row">
      <span className="up-info-label">
        <span style={{ display: "flex", color: "var(--color-text-subtle)" }}>
          {icon}
        </span>
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="up-info-link"
        >
          {value} <Ic.ExternalLink />
        </a>
      ) : (
        <span className="up-info-value">{value}</span>
      )}
    </div>
  );
}

function SkillBar({ skill }: { skill: string }) {
  const hash = skill.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pct = 40 + (hash % 55);
  return (
    <div className="up-skill-row">
      <div className="up-skill-head">
        <span className="up-skill-name">{skill}</span>
        <span className="up-skill-pct">{pct}%</span>
      </div>
      <div className="up-skill-track">
        <div
          className="up-skill-fill"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, rgba(192,255,114,0.7) 0%, rgba(96,165,250,0.7) 100%)",
          }}
        />
      </div>
    </div>
  );
}

function CandidaturaRow({ c }: { c: Candidatura }) {
  const col = CAND_MAP[c.estado] ?? { color: "#6b7280", label: c.estado };
  const date = new Date(c.fecha_envio).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="up-cand-row">
      <div style={{ minWidth: 0 }}>
        <div className="up-cand-title">
          {c.titulo_oferta ?? `Oferta #${c.id_candidatura}`}
        </div>
        <div className="up-cand-date">{date}</div>
        {c.comentario_empresa && (
          <div className="up-comment-box">"{c.comentario_empresa}"</div>
        )}
      </div>
      <span
        className="up-status-pill"
        style={{
          background: `${col.color}14`,
          color: col.color,
          border: `1px solid ${col.color}28`,
        }}
      >
        {col.label}
      </span>
    </div>
  );
}

function SuggestedCard({ profile }: { profile: SuggestedProfile }) {
  const ec = EC[profile.type];
  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <a href={profile.href} className="up-suggestion">
      <div className="up-sug-head">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="up-sug-avatar"
            style={{ border: `1px solid ${ec.accentBorder}` }}
          />
        ) : (
          <div
            className="up-sug-avatar-placeholder"
            style={{
              background: ec.accentFaint,
              border: `1px solid ${ec.accentBorder}`,
              color: ec.accent,
            }}
          >
            {initials || "?"}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div className="up-sug-name">{profile.name}</div>
          <div className="up-sug-sub">{profile.subtitle}</div>
        </div>
      </div>
      <span
        className="up-sug-reason"
        style={{ background: ec.accentFaint, color: ec.accent }}
      >
        <Ic.Link /> {profile.reason}
      </span>
    </a>
  );
}

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
    ? "up-btn up-btn-danger"
    : variant === "primary"
      ? "up-btn up-btn-primary"
      : "up-btn up-btn-secondary";
  return (
    <button className={cls} onClick={onClick} disabled={disabled || l}>
      {l ? <div className="up-spinner" /> : icon}
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
  const isOk = type === "success";
  return (
    <div
      className="up-toast"
      style={{
        background: isOk ? "rgba(192,255,114,0.08)" : "rgba(239,68,68,0.08)",
        borderColor: isOk ? "rgba(192,255,114,0.2)" : "rgba(239,68,68,0.2)",
        color: isOk ? "#c0ff72" : "#f87171",
      }}
    >
      {isOk ? <Ic.Check s={10} /> : <Ic.X s={10} />}
      {message}
    </div>
  );
}

function Avatar({
  url,
  name,
  size = 58,
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
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.17),
    border: `1.5px solid ${ec.accentBorder}`,
    flexShrink: 0,
  };
  if (url)
    return (
      <img
        src={url}
        alt={name}
        style={{ ...style, objectFit: "cover", display: "block" }}
      />
    );
  return (
    <div
      style={{
        ...style,
        background: ec.accentFaint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.28,
        fontWeight: 800,
        color: ec.accent,
        letterSpacing: "-0.03em",
      }}
    >
      {initials || "?"}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

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
  const [suggestions, setSuggestions] = useState<SuggestedProfile[]>([]);
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

      // Suggestions — role-aware
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
                    avatarUrl: p.avatar_url ?? undefined,
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
                    avatarUrl: p.avatar_url ?? undefined,
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
                    reason: "Misma ciudad",
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
            if (sugs.length < 4 && centro.tipo_centro) {
              const existing = new Set([...sugs.map((s) => s.id), entityId]);
              const { data: byType } = await supabase
                .from("centro_educativo")
                .select("id, nombre, tipo_centro, ciudad, avatar_url")
                .eq("tipo_centro", centro.tipo_centro)
                .neq("id", entityId)
                .limit(4);
              (byType ?? [])
                .filter((c) => !existing.has(c.id))
                .slice(0, 4 - sugs.length)
                .forEach((c) =>
                  sugs.push({
                    id: c.id,
                    type: "centro_educativo",
                    name: c.nombre,
                    subtitle: [c.tipo_centro, c.ciudad]
                      .filter(Boolean)
                      .join(" · "),
                    avatarUrl: c.avatar_url ?? undefined,
                    href: `/centro/${c.id}`,
                    reason: "Mismo tipo",
                  }),
                );
            }
          }

          setSuggestions(sugs.slice(0, 4));
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
      const { error: e } = await supabase
        .from("estudiante_estado")
        .upsert({
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
      const { error: e } = await supabase
        .from("guardado")
        .insert({
          id_estudiante: entityId,
          fecha_guardado: new Date().toISOString(),
        });
      if (e) throw e;
    }, "Guardado");

  // ─── Loading / Error ──────────────────────────────────────────────────────

  if (loading)
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
        <style>{GLOBAL_CSS}</style>
        <div
          style={{
            width: 20,
            height: 20,
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
          paddingTop: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <style>{GLOBAL_CSS}</style>
        <span
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            fontFamily: "inherit",
          }}
        >
          {error ?? "Perfil no encontrado"}
        </span>
        <button
          className="up-btn up-btn-secondary"
          onClick={handleBack}
          style={{ fontFamily: "inherit" }}
        >
          <Ic.ArrowLeft /> Volver
        </button>
      </div>
    );

  // ─── Tutor page ───────────────────────────────────────────────────────────

  if (isTutorPage && tutorProfile) {
    const name = tutorProfile.nombre ?? "";
    return (
      <div className="up-root">
        <style>{GLOBAL_CSS}</style>
        <div className="up-inner" style={{ display: "block", maxWidth: 700 }}>
          <button className="up-back" onClick={handleBack}>
            <Ic.ArrowLeft /> Volver al directorio
          </button>
          <div className="up-panel up-hero">
            <div
              className="up-hero-accent-bar"
              style={{ background: ec.accent }}
            />
            <div className="up-hero-body">
              <div className="up-hero-top">
                <div className="up-hero-left">
                  <Avatar url={tutorProfile.avatar_url} name={name} ec={ec} />
                  <div className="up-hero-meta">
                    <div
                      className="up-entity-label"
                      style={{ color: ec.accent }}
                    >
                      <Ic.Dot color={ec.dot} /> {ec.label}
                    </div>
                    <h1 className="up-name">{name}</h1>
                    <div className="up-subtitle">
                      {tutorType === "tutor_empresa"
                        ? tutorProfile.cargo
                        : tutorProfile.departamento}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <SectionCard title="Información" icon={<Ic.Info />}>
            <InfoRow
              icon={<Ic.Briefcase />}
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

  // ─── Helpers ──────────────────────────────────────────────────────────────

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

  const tabs: TabItem[] = [
    { id: "info", label: "Información", icon: <Ic.Info /> },
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
    { id: "actividad", label: "Actividad", icon: <Ic.Activity /> },
  ];

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

  // ─── Actions ─────────────────────────────────────────────────────────────

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
                color: "var(--color-text-subtle)",
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

  // ─── Info sections ────────────────────────────────────────────────────────

  function renderInfoSections() {
    if (rawEntityType === "estudiante") {
      const s = profile as Estudiante;
      return (
        <>
          {s.sobre_mi && (
            <SectionCard title="Presentación" icon={<Ic.Info />}>
              <p className="up-prose">{s.sobre_mi}</p>
            </SectionCard>
          )}
          <div className="up-two-col">
            <SectionCard title="Datos de contacto" icon={<Ic.FileText />}>
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
            </SectionCard>
            {s.habilidades && s.habilidades.length > 0 && (
              <SectionCard title="Nivel de habilidades" icon={<Ic.Activity />}>
                {s.habilidades.slice(0, 7).map((h) => (
                  <SkillBar key={h} skill={h} />
                ))}
              </SectionCard>
            )}
          </div>
          {s.habilidades && s.habilidades.length > 0 && (
            <SectionCard title="Habilidades y tecnologías" icon={<Ic.Code />}>
              <div className="up-tags">
                {s.habilidades.map((h) => (
                  <span key={h} className="up-tag">
                    <Ic.Hash />
                    {h}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}
          {Array.isArray(s.formaciones) && s.formaciones.length > 0 && (
            <SectionCard title="Formación académica" icon={<Ic.GradCap />}>
              {(s.formaciones as Record<string, string>[]).map((f, i) => (
                <div key={i} className="up-formation-row">
                  <div
                    className="up-formation-icon"
                    style={{
                      background: EC.centro_educativo.accentFaint,
                      border: `1px solid ${EC.centro_educativo.accentBorder}`,
                      color: EC.centro_educativo.accent,
                    }}
                  >
                    <Ic.GradCap />
                  </div>
                  <div>
                    <div className="up-formation-name">{f.titulo}</div>
                    <div className="up-formation-sub">
                      {[f.institucion, f.anio].filter(Boolean).join(" · ")}
                    </div>
                    {f.descripcion && (
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "var(--color-text-muted)",
                          marginTop: 4,
                          lineHeight: 1.5,
                        }}
                      >
                        {f.descripcion}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </SectionCard>
          )}
          {Array.isArray(s.proyectos) && s.proyectos.length > 0 && (
            <SectionCard title="Proyectos destacados" icon={<Ic.Code />}>
              <div className="up-projects-grid">
                {(s.proyectos as Record<string, string>[]).map((p, i) => (
                  <div key={i} className="up-project-card">
                    <div className="up-project-name">{p.titulo}</div>
                    {p.descripcion && (
                      <div className="up-project-desc">{p.descripcion}</div>
                    )}
                    {p.enlace && (
                      <a
                        href={p.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 11.5,
                          color: "var(--color-brand)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        Ver proyecto <Ic.ExternalLink />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
          {s.redes_sociales && Object.keys(s.redes_sociales).length > 0 && (
            <SectionCard title="Redes sociales" icon={<Ic.Link />}>
              {Object.entries(s.redes_sociales).map(([red, url]) => (
                <InfoRow
                  key={red}
                  icon={<Ic.Link />}
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
            <SectionCard title="Sobre la empresa" icon={<Ic.Building />}>
              <p className="up-prose">{e.descripcion}</p>
            </SectionCard>
          )}
          <div className="up-two-col">
            <SectionCard title="Información corporativa" icon={<Ic.FileText />}>
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
            </SectionCard>
            <div>
              {(e.linkedin || e.twitter || e.instagram) && (
                <SectionCard title="Redes y presencia" icon={<Ic.Link />}>
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
                </SectionCard>
              )}
            </div>
          </div>
        </>
      );
    }

    if (rawEntityType === "centro_educativo") {
      const c = profile as CentroEducativo;
      return (
        <>
          {c.descripcion && (
            <SectionCard title="Sobre el centro" icon={<Ic.BookOpen />}>
              <p className="up-prose">{c.descripcion}</p>
            </SectionCard>
          )}
          <div className="up-two-col">
            <SectionCard title="Datos del centro" icon={<Ic.FileText />}>
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
            </SectionCard>
            {c.titulaciones && c.titulaciones.length > 0 && (
              <SectionCard title="Titulaciones ofertadas" icon={<Ic.Layers />}>
                <div className="up-tags" style={{ gap: 5 }}>
                  {c.titulaciones.map((t) => (
                    <span
                      key={t}
                      className="up-accent-tag"
                      style={{
                        background: ec.accentFaint,
                        border: `1px solid ${ec.accentBorder}`,
                        color: ec.accent,
                      }}
                    >
                      {t}
                    </span>
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

  // ─── Main render ──────────────────────────────────────────────────────────

  const dispInfo =
    rawEntityType === "estudiante"
      ? (DISP_MAP[(profile as Estudiante).disponibilidad ?? ""] ?? null)
      : null;

  return (
    <MainLayout>
      <style>{GLOBAL_CSS}</style>
      <div className="up-root">
        <div className="up-inner">
          {/* ── Back (spans full width) ── */}
          <div style={{ gridColumn: "1 / -1", marginBottom: 4 }}>
            <button className="up-back" onClick={handleBack}>
              <Ic.ArrowLeft /> Volver al directorio
            </button>
          </div>

          {/* ── Main column ── */}
          <div className="up-main">
            {/* Hero card */}
            <div className="up-panel up-hero">
              <div
                className="up-hero-accent-bar"
                style={{ background: ec.accent }}
              />
              <div className="up-hero-body">
                <div className="up-hero-top">
                  <div className="up-hero-left">
                    <div className="up-avatar-wrap">
                      <Avatar url={avatarUrl} name={profileName} ec={ec} />
                      {isVerified && (
                        <div className="up-verified-badge">
                          <Ic.Check s={8} />
                        </div>
                      )}
                    </div>
                    <div className="up-hero-meta">
                      <div
                        className="up-entity-label"
                        style={{ color: ec.accent }}
                      >
                        <Ic.Dot color={ec.dot} />
                        {rawEntityType ? EC[rawEntityType].label : ""}
                        {isVerified && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 9,
                              background: "rgba(192,255,114,0.1)",
                              border: "1px solid rgba(192,255,114,0.2)",
                              color: "#c0ff72",
                              padding: "1px 5px",
                              borderRadius: 3,
                              letterSpacing: "0.06em",
                            }}
                          >
                            VERIFICADO
                          </span>
                        )}
                      </div>
                      <h1 className="up-name">{profileName}</h1>
                      <div className="up-subtitle">{getSubtitle()}</div>
                    </div>
                  </div>
                  <div className="up-hero-actions">{renderActions()}</div>
                </div>

                <div className="up-pills">
                  {memberSince && (
                    <span className="up-pill">
                      <Ic.Calendar /> Miembro desde {memberSince}
                    </span>
                  )}
                  {dispInfo && (
                    <span className="up-pill" style={{ color: dispInfo.color }}>
                      <Ic.Dot color={dispInfo.color} /> {dispInfo.label}
                    </span>
                  )}
                  {rawEntityType === "empresa" && (profile as Empresa).web && (
                    <a
                      href={(profile as Empresa).web!}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        color: ec.accent,
                        textDecoration: "none",
                      }}
                    >
                      <Ic.Globe /> {(profile as Empresa).web}
                    </a>
                  )}
                </div>
              </div>

              {/* Stats */}
              {(stats.candidaturas > 0 ||
                stats.ofertas > 0 ||
                stats.estudiantes > 0 ||
                stats.valoracion !== undefined) && (
                <div className="up-stats">
                  {rawEntityType === "estudiante" && (
                    <div className="up-stat">
                      <div
                        className="up-stat-value"
                        style={{ color: ec.accent }}
                      >
                        {stats.candidaturas}
                      </div>
                      <div className="up-stat-label">Candidaturas</div>
                    </div>
                  )}
                  {rawEntityType === "empresa" && (
                    <div className="up-stat">
                      <div
                        className="up-stat-value"
                        style={{ color: ec.accent }}
                      >
                        {stats.ofertas}
                      </div>
                      <div className="up-stat-label">Ofertas activas</div>
                    </div>
                  )}
                  {rawEntityType === "empresa" &&
                    stats.valoracion !== undefined && (
                      <div className="up-stat">
                        <div
                          className="up-stat-value"
                          style={{ color: "#facc15" }}
                        >
                          {stats.valoracion}
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 400,
                              color: "var(--color-text-subtle)",
                            }}
                          >
                            /5
                          </span>
                        </div>
                        <div className="up-stat-label">Valoración media</div>
                      </div>
                    )}
                  {rawEntityType === "centro_educativo" && (
                    <div className="up-stat">
                      <div
                        className="up-stat-value"
                        style={{ color: ec.accent }}
                      >
                        {stats.estudiantes}
                      </div>
                      <div className="up-stat-label">Estudiantes</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="up-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`up-tab${activeTab === tab.id ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    borderBottomColor:
                      activeTab === tab.id ? ec.accent : "transparent",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      opacity: activeTab === tab.id ? 1 : 0.5,
                    }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                  {"count" in tab && tab.count > 0 && (
                    <span className="up-tab-badge">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "info" && renderInfoSections()}

            {activeTab === "candidaturas" && (
              <SectionCard
                title={`Candidaturas enviadas · ${stats.candidaturas}`}
                icon={<Ic.FileText />}
              >
                {candidaturas.length === 0 ? (
                  <p className="up-empty">No hay candidaturas registradas.</p>
                ) : (
                  candidaturas.map((c) => (
                    <CandidaturaRow key={c.id_candidatura} c={c} />
                  ))
                )}
              </SectionCard>
            )}

            {activeTab === "actividad" && (
              <SectionCard title="Actividad reciente" icon={<Ic.Activity />}>
                {memberSince && (
                  <div className="up-activity-row">
                    <div
                      className="up-activity-icon"
                      style={{
                        background: ec.accentFaint,
                        color: ec.accent,
                        borderColor: ec.accentBorder,
                      }}
                    >
                      <Ic.Calendar />
                    </div>
                    <div>
                      <div className="up-activity-text">
                        Perfil creado en Relance
                      </div>
                      <div className="up-activity-sub">{memberSince}</div>
                    </div>
                  </div>
                )}
                {rawEntityType === "estudiante" && stats.candidaturas > 0 && (
                  <div className="up-activity-row">
                    <div className="up-activity-icon">
                      <Ic.FileText />
                    </div>
                    <div>
                      <div className="up-activity-text">
                        {stats.candidaturas} candidatura
                        {stats.candidaturas > 1 ? "s" : ""} enviada
                        {stats.candidaturas > 1 ? "s" : ""}
                      </div>
                      <div className="up-activity-sub">
                        Ver historial completo en la pestaña Candidaturas
                      </div>
                    </div>
                  </div>
                )}
                {rawEntityType === "empresa" && stats.ofertas > 0 && (
                  <div className="up-activity-row">
                    <div className="up-activity-icon">
                      <Ic.Layers />
                    </div>
                    <div>
                      <div className="up-activity-text">
                        {stats.ofertas} oferta{stats.ofertas > 1 ? "s" : ""}{" "}
                        publicada{stats.ofertas > 1 ? "s" : ""}
                      </div>
                      <div className="up-activity-sub">
                        Historial de publicaciones
                      </div>
                    </div>
                  </div>
                )}
                <p
                  style={{
                    margin: "14px 0 0",
                    fontSize: 11,
                    color: "var(--color-text-subtle)",
                    lineHeight: 1.6,
                  }}
                >
                  El historial detallado de actividad estará disponible
                  próximamente.
                </p>
              </SectionCard>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="up-sidebar">
            <div className="up-sidebar-inner">
              {/* Quick info strip */}
              <div>
                <div className="up-sidebar-label">Datos clave</div>
                <div className="up-info-strip">
                  {rawEntityType === "estudiante" &&
                    (() => {
                      const s = profile as Estudiante;
                      return (
                        <>
                          {s.ciudad && (
                            <div className="up-strip-row">
                              <span className="up-strip-label">Ciudad</span>
                              <span className="up-strip-val">{s.ciudad}</span>
                            </div>
                          )}
                          {s.titulacion && (
                            <div className="up-strip-row">
                              <span className="up-strip-label">Titulación</span>
                              <span className="up-strip-val">
                                {s.titulacion}
                              </span>
                            </div>
                          )}
                          {s.modalidad && (
                            <div className="up-strip-row">
                              <span className="up-strip-label">Modalidad</span>
                              <span className="up-strip-val">
                                {s.modalidad}
                              </span>
                            </div>
                          )}
                          {s.tipo_busqueda && (
                            <div className="up-strip-row">
                              <span className="up-strip-label">Búsqueda</span>
                              <span className="up-strip-val">
                                {s.tipo_busqueda}
                              </span>
                            </div>
                          )}
                          {s.disponibilidad &&
                            (() => {
                              const d = DISP_MAP[s.disponibilidad!];
                              return d ? (
                                <div className="up-strip-row">
                                  <span className="up-strip-label">Estado</span>
                                  <span
                                    style={{
                                      color: d.color,
                                      fontSize: 11.5,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    <Ic.Dot color={d.color} />
                                    {d.label}
                                  </span>
                                </div>
                              ) : null;
                            })()}
                        </>
                      );
                    })()}
                  {rawEntityType === "empresa" &&
                    (() => {
                      const e = profile as Empresa;
                      return (
                        <>
                          {e.sector && (
                            <div className="up-strip-row">
                              <span className="up-strip-label">Sector</span>
                              <span className="up-strip-val">{e.sector}</span>
                            </div>
                          )}
                          {e.ciudad && (
                            <div className="up-strip-row">
                              <span className="up-strip-label">Ciudad</span>
                              <span className="up-strip-val">{e.ciudad}</span>
                            </div>
                          )}
                          {e.tamano && (
                            <div className="up-strip-row">
                              <span className="up-strip-label">Tamaño</span>
                              <span className="up-strip-val">{e.tamano}</span>
                            </div>
                          )}
                          <div className="up-strip-row">
                            <span className="up-strip-label">Verificada</span>
                            <span
                              style={{
                                color: isVerified ? "#4ade80" : "#f87171",
                                fontSize: 11.5,
                              }}
                            >
                              {isVerified ? "Sí" : "No"}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  {rawEntityType === "centro_educativo" &&
                    (() => {
                      const c = profile as CentroEducativo;
                      return (
                        <>
                          {c.tipo_centro && (
                            <div className="up-strip-row">
                              <span className="up-strip-label">Tipo</span>
                              <span className="up-strip-val">
                                {c.tipo_centro}
                              </span>
                            </div>
                          )}
                          {c.ciudad && (
                            <div className="up-strip-row">
                              <span className="up-strip-label">Ciudad</span>
                              <span className="up-strip-val">{c.ciudad}</span>
                            </div>
                          )}
                          {c.provincia && (
                            <div className="up-strip-row">
                              <span className="up-strip-label">Provincia</span>
                              <span className="up-strip-val">
                                {c.provincia}
                              </span>
                            </div>
                          )}
                          {c.num_alumnos != null && (
                            <div className="up-strip-row">
                              <span className="up-strip-label">Alumnos</span>
                              <span className="up-strip-val">
                                {c.num_alumnos}
                              </span>
                            </div>
                          )}
                          <div className="up-strip-row">
                            <span className="up-strip-label">Verificado</span>
                            <span
                              style={{
                                color: isVerified ? "#4ade80" : "#f87171",
                                fontSize: 11.5,
                              }}
                            >
                              {isVerified ? "Sí" : "No"}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                </div>
              </div>

              {/* Viewer context card — only shows relevant info */}
              {(viewerContext.isMiEstudiante ||
                viewerContext.isEnrolledEstudiante ||
                viewerContext.isMyPracticasStudent) && (
                <div className="up-viewer-context-card">
                  {viewerContext.isMiEstudiante && (
                    <span
                      style={{
                        color: "#4ade80",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11.5,
                      }}
                    >
                      <Ic.Check s={10} /> Estudiante tutorizado por ti
                    </span>
                  )}
                  {viewerContext.isEnrolledEstudiante &&
                    !viewerContext.isMiEstudiante && (
                      <span
                        style={{
                          color: "#60a5fa",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11.5,
                        }}
                      >
                        <Ic.Info /> Matriculado en tu centro
                      </span>
                    )}
                  {viewerContext.isMyPracticasStudent && (
                    <span
                      style={{
                        color: "#fb923c",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11.5,
                      }}
                    >
                      <Ic.Briefcase /> En prácticas en tu empresa
                    </span>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <div className="up-sidebar-label" style={{ marginTop: 4 }}>
                    {rawEntityType === "empresa"
                      ? "Empresas relacionadas"
                      : rawEntityType === "centro_educativo"
                        ? "Centros relacionados"
                        : "Estudiantes relacionados"}
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {suggestions.map((s) => (
                      <SuggestedCard key={s.id} profile={s} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toasts */}
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
