import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import GitHubReposSection from "../GitHubIntegration";
import MainLayout from "../../components/layout/MainLayout";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface TipoBusquedaOption {
  id: string;
  label: string;
  icon: string;
  desc: string;
}

interface DisponibilidadOption {
  id: string;
  label: string;
}

interface ModalidadOption {
  id: string;
  label: string;
}

interface RedSocial {
  id: keyof RedesSociales;
  label: string;
  placeholder: string;
  icon: React.FC<IconProps>;
}

interface RedesSociales {
  linkedin: string;
  github: string;
  twitter: string;
  portfolio: string;
  behance: string;
  dribbble: string;
}

interface Formacion {
  id: number | null;
  titulo: string;
  centro: string;
  mes_inicio: string;
  anio_inicio: string | number;
  mes_fin: string;
  anio_fin: string | number;
  en_curso: boolean;
}

interface Proyecto {
  id: number | null;
  titulo: string;
  descripcion: string;
  tecnologias: string[];
  url_repo: string;
  url_demo: string;
}

interface EstudianteRow {
  nombre?: string | null;
  apellidos?: string | null;
  avatar_url?: string | null;
  sobre_mi?: string | null;
  formaciones?: Formacion[];
  habilidades?: string[];
  tipo_busqueda?: string | null;
  disponibilidad?: string | null;
  modalidad?: string | null;
  proyectos?: Proyecto[];
  redes_sociales?: RedesSociales | null;
  github_username?: string | null;
  github_repos_vinculados?: string[];
  ciudad?: string | null;
  telefono?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const TIPO_BUSQUEDA: TipoBusquedaOption[] = [
  {
    id: "practicas",
    label: "Solo prácticas",
    icon: "icon-book",
    desc: "Busco exclusivamente prácticas formativas",
  },
  {
    id: "practicas_contratacion",
    label: "Prácticas + contratación",
    icon: "icon-handshake",
    desc: "Prácticas con posibilidad de incorporación",
  },
  {
    id: "empleo",
    label: "Empleo directo",
    icon: "icon-briefcase",
    desc: "Busco incorporación inmediata al mercado laboral",
  },
];

const DISPONIBILIDAD: DisponibilidadOption[] = [
  { id: "media_jornada", label: "Media jornada" },
  { id: "flexible", label: "Flexible" },
  { id: "completa", label: "Completa" },
];

const MODALIDAD: ModalidadOption[] = [
  { id: "presencial", label: "Presencial" },
  { id: "remoto", label: "Remoto" },
  { id: "hibrido", label: "Híbrido" },
];

const MESES: string[] = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const REDES_SOCIALES: RedSocial[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/tuusuario",
    icon: IconLinkedIn,
  },
  {
    id: "github",
    label: "GitHub",
    placeholder: "https://github.com/tuusuario",
    icon: IconGitHub,
  },
  {
    id: "twitter",
    label: "X / Twitter",
    placeholder: "https://twitter.com/tuusuario",
    icon: IconTwitter,
  },
  {
    id: "portfolio",
    label: "Portfolio personal",
    placeholder: "https://tuportfolio.com",
    icon: IconGlobe,
  },
  {
    id: "behance",
    label: "Behance",
    placeholder: "https://behance.net/tuusuario",
    icon: IconBehance,
  },
  {
    id: "dribbble",
    label: "Dribbble",
    placeholder: "https://dribbble.com/tuusuario",
    icon: IconDribbble,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ICONOS SVG INLINE
// ─────────────────────────────────────────────────────────────────────────────
interface IconProps {
  size?: number;
}

function IconLinkedIn({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function IconGitHub({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function IconTwitter({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconGlobe({ size = 15 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function IconBehance({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029H23.7zM15.971 13h4.059c-.3-1.508-1.336-1.95-1.99-1.95-1.695 0-1.972 1.069-2.069 1.95zM8.342 7H1v10h7.812c3.465 0 4.188-3.773 2.18-5.126C12.22 10.637 11.5 7 8.342 7zM4.1 10.5h3.1c1.7 0 1.7 2.5 0 2.5H4.1v-2.5zm3.5 5H4.1V13h3.5c2 0 2 2.5 0 2.5z" />
    </svg>
  );
}

function IconDribbble({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconUser({ size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconPlus({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconEdit({ size = 13 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash({ size = 13 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function IconCheck({ size = 13 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconCamera({ size = 13 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

interface SpinnerProps {
  className?: string;
}

function Spinner({ className = "w-3.5 h-3.5" }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CARD
// ─────────────────────────────────────────────────────────────────────────────
interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <section
      style={{
        background: "var(--color-surface-strong)",
        border: "1px solid var(--color-border-strong)",
        borderRadius: 14,
        padding: "18px 20px",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <h2
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-subtle)",
            margin: 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: 11,
              marginTop: 3,
              marginBottom: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMACIÓN ACADÉMICA
// ─────────────────────────────────────────────────────────────────────────────
interface FormacionItemProps {
  item: Formacion;
  onEdit: (item: Formacion) => void;
  onDelete: (id: number | null) => void;
}

function FormacionItem({ item, onEdit, onDelete }: FormacionItemProps) {
  const mesInicio = item.mes_inicio ? MESES[parseInt(item.mes_inicio) - 1] : "";
  const mesFin = item.mes_fin ? MESES[parseInt(item.mes_fin) - 1] : "";
  const finLabel = item.en_curso ? "Actualidad" : `${mesFin} ${item.anio_fin}`;

  return (
    <div
      className="group"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "12px 14px",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          paddingTop: 3,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            border: "2px solid var(--color-brand)",
            background: "var(--color-surface)",
          }}
        />
        <div
          style={{
            width: 1,
            flex: 1,
            background: "var(--color-border)",
            marginTop: 3,
            minHeight: 24,
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            color: "var(--color-text)",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "Syne, sans-serif",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.titulo || "Sin título"}
        </p>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: 11,
            marginTop: 2,
            marginBottom: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.centro}
        </p>
        <p
          style={{
            color: "var(--color-text-subtle)",
            fontSize: 10,
            marginTop: 3,
            marginBottom: 0,
          }}
        >
          {mesInicio} {item.anio_inicio} —{" "}
          <span style={item.en_curso ? { color: "var(--color-brand)" } : {}}>
            {finLabel}
          </span>
        </p>
      </div>
      <div
        className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ flexShrink: 0 }}
      >
        <button
          onClick={() => onEdit(item)}
          style={{
            padding: "5px 6px",
            color: "var(--color-text-subtle)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            borderRadius: 6,
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.color = "var(--color-text)";
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.color = "var(--color-text-subtle)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <IconEdit />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          style={{
            padding: "5px 6px",
            color: "var(--color-text-subtle)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            borderRadius: 6,
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.color = "#f87171";
            e.currentTarget.style.background = "rgba(248,113,113,0.08)";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.color = "var(--color-text-subtle)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

interface FormacionModalProps {
  item: Formacion | null;
  onSave: (item: Formacion) => void;
  onClose: () => void;
}

function FormacionModal({ item, onSave, onClose }: FormacionModalProps) {
  const anioActual = new Date().getFullYear();
  const [form, setForm] = useState<Formacion>(
    item ?? {
      id: null,
      titulo: "",
      centro: "",
      mes_inicio: "",
      anio_inicio: "",
      mes_fin: "",
      anio_fin: "",
      en_curso: false,
    },
  );
  const [centroQuery, setCentroQuery] = useState<string>(item?.centro ?? "");
  const [centroSugerencias, setCentroSugerencias] = useState<string[]>([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState<boolean>(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const s =
    (k: keyof Formacion) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const anios: number[] = Array.from(
    { length: anioActual - 1980 + 1 },
    (_, i) => anioActual - i,
  );

  const buscarCentros = useCallback(async (q: string) => {
    if (q.length < 2) {
      setCentroSugerencias([]);
      return;
    }
    setLoadingSugerencias(true);
    const { data: data2 } = await supabase
      .from("centro_educativo")
      .select("nombre")
      .ilike("nombre", `%${q}%`)
      .limit(8);
    setCentroSugerencias([
      ...new Set(
        data2?.map((d: { nombre: string }) => d.nombre).filter(Boolean) ?? [],
      ),
    ]);
    setLoadingSugerencias(false);
  }, []);

  const handleCentroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCentroQuery(val);
    setForm((f) => ({ ...f, centro: val }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscarCentros(val), 300);
  };

  const seleccionarCentro = (nombre: string) => {
    setCentroQuery(nombre);
    setForm((f) => ({ ...f, centro: nombre }));
    setCentroSugerencias([]);
  };

  const isValid: boolean =
    Boolean(form.titulo.trim()) &&
    Boolean(form.centro.trim()) &&
    Boolean(form.mes_inicio) &&
    Boolean(form.anio_inicio) &&
    (form.en_curso || (Boolean(form.mes_fin) && Boolean(form.anio_fin)));

  return (
    <div
      className="modal-overlay"
      onClick={(e: React.MouseEvent<HTMLDivElement>) =>
        e.target === e.currentTarget && onClose()
      }
    >
      <div
        className="modal-card"
        style={{ maxHeight: "88vh", overflowY: "auto" }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "transparent",
            border: "none",
            color: "var(--color-text-muted)",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: 18,
            marginTop: 0,
          }}
        >
          {item ? "Editar formación" : "Añadir formación"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>
              Título / Grado{" "}
              <span style={{ color: "var(--color-brand)" }}>*</span>
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={s("titulo")}
              placeholder="Ej: Técnico Superior en DAM"
              className="input-field"
              style={inputSmall}
            />
          </div>
          <div style={{ position: "relative" }}>
            <label style={labelStyle}>
              Centro educativo{" "}
              <span style={{ color: "var(--color-brand)" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={centroQuery}
                onChange={handleCentroChange}
                placeholder="Escribe para buscar centros..."
                className="input-field"
                style={inputSmall}
                autoComplete="off"
              />
              {loadingSugerencias && (
                <div
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <Spinner />
                </div>
              )}
            </div>
            {centroSugerencias.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 30,
                  top: "100%",
                  marginTop: 4,
                  width: "100%",
                  background: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border-strong)",
                  borderRadius: 10,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                {centroSugerencias.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => seleccionarCentro(s)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "9px 14px",
                      fontSize: 12,
                      color: "var(--color-text-secondary)",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid var(--color-border)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)";
                      e.currentTarget.style.color = "var(--color-text)";
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color =
                        "var(--color-text-secondary)";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label style={labelStyle}>
              Fecha de inicio{" "}
              <span style={{ color: "var(--color-brand)" }}>*</span>
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <select
                value={form.mes_inicio}
                onChange={s("mes_inicio")}
                className="input-field"
                style={inputSmall}
              >
                <option value="">Mes</option>
                {MESES.map((m, i) => (
                  <option key={m} value={String(i + 1).padStart(2, "0")}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={form.anio_inicio}
                onChange={s("anio_inicio")}
                className="input-field"
                style={inputSmall}
              >
                <option value="">Año</option>
                {anios.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
            }}
          >
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  en_curso: !f.en_curso,
                  mes_fin: "",
                  anio_fin: "",
                }))
              }
              style={{
                position: "relative",
                width: 38,
                height: 22,
                borderRadius: 11,
                background: form.en_curso
                  ? "var(--color-brand)"
                  : "rgba(255,255,255,0.12)",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: form.en_curso ? 18 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  transition: "left 0.2s",
                }}
              />
            </button>
            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text)",
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                Todavía en curso
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                Aparecerá como "Actualidad" en tu perfil
              </p>
            </div>
          </div>
          {!form.en_curso && (
            <div className="animate-fade-in">
              <label style={labelStyle}>
                Fecha de finalización{" "}
                <span style={{ color: "var(--color-brand)" }}>*</span>
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <select
                  value={form.mes_fin}
                  onChange={s("mes_fin")}
                  className="input-field"
                  style={inputSmall}
                >
                  <option value="">Mes</option>
                  {MESES.map((m, i) => (
                    <option key={m} value={String(i + 1).padStart(2, "0")}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={form.anio_fin}
                  onChange={s("anio_fin")}
                  className="input-field"
                  style={inputSmall}
                >
                  <option value="">Año</option>
                  {anios.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, fontSize: 12, padding: "7px 12px" }}
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              isValid && onSave({ ...form, id: form.id ?? Date.now() })
            }
            disabled={!isValid}
            className="btn-primary"
            style={{
              flex: 1,
              fontSize: 12,
              padding: "7px 12px",
              opacity: isValid ? 1 : 0.4,
            }}
          >
            {item ? "Guardar cambios" : "Añadir formación"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROYECTO MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface ProyectoModalProps {
  proyecto: Proyecto | null;
  onSave: (proyecto: Proyecto) => void;
  onClose: () => void;
}

interface GitHubRepoData {
  name?: string;
  description?: string;
  stargazers_count?: number;
  homepage?: string;
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicContentBlock[];
}

function ProyectoModal({ proyecto, onSave, onClose }: ProyectoModalProps) {
  const [form, setForm] = useState<Proyecto>(
    proyecto ?? {
      id: null,
      titulo: "",
      descripcion: "",
      tecnologias: [],
      url_repo: "",
      url_demo: "",
    },
  );
  const [techInput, setTechInput] = useState<string>("");
  const [githubUrl, setGithubUrl] = useState<string>(proyecto?.url_repo ?? "");
  const [analizando, setAnalizando] = useState<boolean>(false);
  const [errorAnalisis, setErrorAnalisis] = useState<string | null>(null);

  const handleTechKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && techInput.trim()) {
      e.preventDefault();
      if (!form.tecnologias.includes(techInput.trim()))
        setForm((f) => ({
          ...f,
          tecnologias: [...f.tecnologias, techInput.trim()],
        }));
      setTechInput("");
    }
  };

  const analizarConIA = async (): Promise<void> => {
    if (!githubUrl.trim()) return;
    setAnalizando(true);
    setErrorAnalisis(null);
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/?\s]+)/);
    if (!match) {
      setErrorAnalisis(
        "URL de GitHub no válida. Usa el formato: https://github.com/usuario/repositorio",
      );
      setAnalizando(false);
      return;
    }
    const [, owner, repo] = match;
    try {
      const [repoRes, readmeRes, langsRes] = await Promise.allSettled([
        fetch(`https://api.github.com/repos/${owner}/${repo}`),
        fetch(`https://api.github.com/repos/${owner}/${repo}/readme`),
        fetch(`https://api.github.com/repos/${owner}/${repo}/languages`),
      ]);
      const repoData: GitHubRepoData =
        repoRes.status === "fulfilled" && repoRes.value.ok
          ? await repoRes.value.json()
          : {};
      const langsData: Record<string, number> =
        langsRes.status === "fulfilled" && langsRes.value.ok
          ? await langsRes.value.json()
          : {};
      let readmeText = "";
      if (readmeRes.status === "fulfilled" && readmeRes.value.ok) {
        const rd = await readmeRes.value.json();
        readmeText = atob(
          (rd.content as string)?.replace(/\n/g, "") ?? "",
        ).slice(0, 2000);
      }
      const tecnologiasDetectadas: string[] = Object.keys(langsData).slice(
        0,
        8,
      );
      const prompt = `Eres un asistente que genera descripciones profesionales y concisas de proyectos de GitHub para un currículum digital de desarrollador.\n\nDatos del repositorio:\n- Nombre: ${repoData.name ?? repo}\n- Descripción oficial: ${repoData.description ?? "No disponible"}\n- Lenguajes detectados: ${tecnologiasDetectadas.join(", ") || "No disponible"}\n- Estrellas: ${repoData.stargazers_count ?? 0}\n- README (fragmento): ${readmeText || "No disponible"}\n\nGenera UNA descripción en español de máximo 200 caracteres, directa, sin adornos, que explique qué hace este proyecto y para qué sirve. Solo devuelve la descripción, sin comillas ni explicaciones adicionales.`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const aiData: AnthropicResponse = await response.json();
      const descripcionIA: string =
        aiData.content?.[0]?.text?.trim() ?? repoData.description ?? "";
      setForm((f) => ({
        ...f,
        titulo: repoData.name ?? repo,
        descripcion: descripcionIA,
        tecnologias:
          tecnologiasDetectadas.length > 0
            ? tecnologiasDetectadas
            : f.tecnologias,
        url_repo: githubUrl,
        url_demo: repoData.homepage ?? f.url_demo,
      }));
    } catch {
      setErrorAnalisis(
        "No se pudo analizar el repositorio. Comprueba la URL e inténtalo de nuevo.",
      );
    }
    setAnalizando(false);
  };

  const isValid: boolean = Boolean(form.titulo.trim());

  return (
    <div
      className="modal-overlay"
      onClick={(e: React.MouseEvent<HTMLDivElement>) =>
        e.target === e.currentTarget && onClose()
      }
    >
      <div
        className="modal-card"
        style={{ maxHeight: "88vh", overflowY: "auto" }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "transparent",
            border: "none",
            color: "var(--color-text-muted)",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: 14,
            marginTop: 0,
          }}
        >
          {proyecto ? "Editar proyecto" : "Añadir proyecto"}
        </h2>
        {/* IA Banner */}
        <div
          style={{
            marginBottom: 14,
            padding: "12px 14px",
            background: "rgba(192,255,114,0.04)",
            border: "1px solid rgba(192,255,114,0.18)",
            borderRadius: 10,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-brand)",
              margin: "0 0 4px",
            }}
          >
            ✦ Rellena automáticamente con IA
          </p>
          <p
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              margin: "0 0 10px",
            }}
          >
            Pega la URL de un repositorio de GitHub y la IA generará título,
            descripción y tecnologías.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="url"
              value={githubUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGithubUrl(e.target.value)
              }
              placeholder="https://github.com/usuario/repositorio"
              className="input-field"
              style={{ ...inputSmall, flex: 1 }}
            />
            <button
              onClick={analizarConIA}
              disabled={analizando || !githubUrl.trim()}
              className="btn-primary"
              style={{
                fontSize: 11,
                padding: "6px 12px",
                flexShrink: 0,
                opacity: analizando || !githubUrl.trim() ? 0.4 : 1,
              }}
            >
              {analizando ? (
                <>
                  <Spinner /> Analizando...
                </>
              ) : (
                "Analizar"
              )}
            </button>
          </div>
          {errorAnalisis && (
            <p
              style={{
                color: "#f87171",
                fontSize: 11,
                marginTop: 6,
                marginBottom: 0,
              }}
            >
              {errorAnalisis}
            </p>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>
              Título del proyecto{" "}
              <span style={{ color: "var(--color-brand)" }}>*</span>
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({ ...f, titulo: e.target.value }))
              }
              placeholder="Mi proyecto"
              className="input-field"
              style={inputSmall}
            />
          </div>
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setForm((f) => ({
                  ...f,
                  descripcion: e.target.value.slice(0, 300),
                }))
              }
              placeholder="¿Qué hace este proyecto? ¿Qué problema resuelve?"
              className="input-field"
              style={{ ...inputSmall, resize: "none" }}
            />
            <p
              style={{
                fontSize: 10,
                color: "var(--color-text-subtle)",
                textAlign: "right",
                margin: "3px 0 0",
              }}
            >
              {form.descripcion.length}/300
            </p>
          </div>
          <div>
            <label style={labelStyle}>Tecnologías</label>
            <input
              type="text"
              value={techInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTechInput(e.target.value)
              }
              onKeyDown={handleTechKey}
              placeholder="Escribe y pulsa Enter (React, Node.js...)"
              className="input-field"
              style={{ ...inputSmall, marginBottom: 8 }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {form.tecnologias.map((t) => (
                <span
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "rgba(192,255,114,0.08)",
                    border: "1px solid rgba(192,255,114,0.2)",
                    color: "var(--color-brand)",
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}
                >
                  {t}
                  <button
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        tecnologias: f.tecnologias.filter((x) => x !== t),
                      }))
                    }
                    style={{
                      color: "inherit",
                      opacity: 0.6,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>URL del repositorio</label>
            <input
              type="url"
              value={form.url_repo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((f) => ({ ...f, url_repo: e.target.value }));
                setGithubUrl(e.target.value);
              }}
              placeholder="https://github.com/usuario/repo"
              className="input-field"
              style={inputSmall}
            />
          </div>
          <div>
            <label style={labelStyle}>URL de la demo</label>
            <input
              type="url"
              value={form.url_demo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm((f) => ({ ...f, url_demo: e.target.value }))
              }
              placeholder="https://miproyecto.vercel.app"
              className="input-field"
              style={inputSmall}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, fontSize: 12, padding: "7px 12px" }}
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              isValid && onSave({ ...form, id: form.id ?? Date.now() })
            }
            disabled={!isValid}
            className="btn-primary"
            style={{
              flex: 1,
              fontSize: 12,
              padding: "7px 12px",
              opacity: isValid ? 1 : 0.4,
            }}
          >
            {proyecto ? "Guardar cambios" : "Añadir proyecto"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProyectoCardProps {
  proyecto: Proyecto;
  onEdit: (proyecto: Proyecto) => void;
  onDelete: (id: number | null) => void;
}

function ProyectoCard({ proyecto, onEdit, onDelete }: ProyectoCardProps) {
  return (
    <div
      className="group"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "12px 14px",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) =>
        (e.currentTarget.style.borderColor = "var(--color-border-strong)")
      }
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) =>
        (e.currentTarget.style.borderColor = "var(--color-border)")
      }
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 600,
              color: "var(--color-text)",
              fontSize: 12,
              margin: "0 0 3px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {proyecto.titulo}
          </h3>
          {proyecto.descripcion && (
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: 11,
                margin: "0 0 6px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {proyecto.descripcion}
            </p>
          )}
          {proyecto.tecnologias?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginBottom: 6,
              }}
            >
              {proyecto.tecnologias.slice(0, 5).map((t) => (
                <span
                  key={t}
                  style={{
                    background: "rgba(192,255,114,0.08)",
                    border: "1px solid rgba(192,255,114,0.18)",
                    color: "var(--color-brand)",
                    fontSize: 10,
                    padding: "1px 7px",
                    borderRadius: 20,
                  }}
                >
                  {t}
                </span>
              ))}
              {proyecto.tecnologias.length > 5 && (
                <span
                  style={{
                    color: "var(--color-text-subtle)",
                    fontSize: 10,
                    padding: "1px 6px",
                  }}
                >
                  +{proyecto.tecnologias.length - 5}
                </span>
              )}
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {proyecto.url_repo && (
              <a
                href={proyecto.url_repo}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
                  (e.currentTarget.style.color = "var(--color-brand)")
                }
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
                  (e.currentTarget.style.color = "var(--color-text-muted)")
                }
              >
                <IconGitHub size={11} /> Repositorio
              </a>
            )}
            {proyecto.url_demo && (
              <a
                href={proyecto.url_demo}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
                  (e.currentTarget.style.color = "var(--color-brand)")
                }
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
                  (e.currentTarget.style.color = "var(--color-text-muted)")
                }
              >
                <IconGlobe size={11} /> Demo
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(proyecto)}
            style={{
              padding: "5px 6px",
              color: "var(--color-text-subtle)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: 6,
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = "var(--color-text)";
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = "var(--color-text-subtle)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <IconEdit />
          </button>
          <button
            onClick={() => onDelete(proyecto.id)}
            style={{
              padding: "5px 6px",
              color: "var(--color-text-subtle)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: 6,
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = "#f87171";
              e.currentTarget.style.background = "rgba(248,113,113,0.08)";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = "var(--color-text-subtle)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTILOS COMPARTIDOS
// ─────────────────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "var(--color-text-muted)",
  marginBottom: 5,
  fontFamily: "Plus Jakarta Sans, sans-serif",
};

const inputSmall: React.CSSProperties = {
  fontSize: 12,
  padding: "8px 11px",
};

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function StudentProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [formacionModal, setFormacionModal] = useState<
    Formacion | "new" | null
  >(null);
  const [proyectoModal, setProyectoModal] = useState<Proyecto | "new" | null>(
    null,
  );

  const [nombre, setNombre] = useState<string>("");
  const [apellidos, setApellidos] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [sobreMi, setSobreMi] = useState<string>("");
  const [formaciones, setFormaciones] = useState<Formacion[]>([]);
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [habilidadInput, setHabilidadInput] = useState<string>("");
  const [tipoBusqueda, setTipoBusqueda] = useState<string | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<string | null>(null);
  const [modalidad, setModalidad] = useState<string | null>(null);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [redesSociales, setRedesSociales] = useState<RedesSociales>({
    linkedin: "",
    github: "",
    twitter: "",
    portfolio: "",
    behance: "",
    dribbble: "",
  });
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [githubReposVinculados, setGithubReposVinculados] = useState<string[]>(
    [],
  );
  const [ciudad, setCiudad] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? "Tu perfil";
  const displayName = nombre && apellidos ? `${nombre} ${apellidos}` : fullName;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("estudiante")
        .select("*")
        .eq("id", user.id)
        .single<EstudianteRow>();

      if (error && error.code !== "PGRST116") {
        console.error("Error cargando perfil:", error.message);
        return;
      }
      if (data) {
        setNombre(data.nombre ?? "");
        setApellidos(data.apellidos ?? "");
        setAvatarUrl(data.avatar_url ?? null);
        setSobreMi(data.sobre_mi ?? "");
        setFormaciones(data.formaciones ?? []);
        setHabilidades(data.habilidades ?? []);
        setTipoBusqueda(data.tipo_busqueda ?? null);
        setDisponibilidad(data.disponibilidad ?? null);
        setModalidad(data.modalidad ?? null);
        setProyectos(data.proyectos ?? []);
        setRedesSociales(
          data.redes_sociales ?? {
            linkedin: "",
            github: "",
            twitter: "",
            portfolio: "",
            behance: "",
            dribbble: "",
          },
        );
        setGithubUsername(data.github_username ?? null);
        setGithubReposVinculados(data.github_repos_vinculados ?? []);
        setCiudad(data.ciudad ?? "");
        setTelefono(data.telefono ?? "");
      }
    };
    load();
  }, [user]);

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("La imagen no puede superar 2 MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Formato no válido. Usa JPG, PNG o WebP.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    const ext = file.name.split(".").pop()?.toLowerCase();
    const storagePath = `avatars/${user.id}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("profiles")
      .upload(storagePath, file, { upsert: true, contentType: file.type });
    if (uploadErr) {
      setUploadError("Error al subir la imagen: " + uploadErr.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(storagePath);
    const freshUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    setAvatarUrl(freshUrl);
    await supabase.from("estudiante").upsert({
      id: user.id,
      avatar_url: freshUrl,
      updated_at: new Date().toISOString(),
    });
    setUploading(false);
  };

  const handleHabilidadKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && habilidadInput.trim()) {
      e.preventDefault();
      if (!habilidades.includes(habilidadInput.trim()))
        setHabilidades([...habilidades, habilidadInput.trim()]);
      setHabilidadInput("");
    }
  };

  const handleGuardarFormacion = (item: Formacion) => {
    if (formacionModal === "new") setFormaciones((fs) => [...fs, item]);
    else setFormaciones((fs) => fs.map((f) => (f.id === item.id ? item : f)));
    setFormacionModal(null);
  };

  const handleGuardarProyecto = (p: Proyecto) => {
    if (proyectoModal === "new") setProyectos((ps) => [...ps, p]);
    else setProyectos((ps) => ps.map((x) => (x.id === p.id ? p : x)));
    setProyectoModal(null);
  };

  const handleSave = async (): Promise<void> => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    const payload = {
      id: user.id,
      nombre: nombre.trim() || null,
      apellidos: apellidos.trim() || null,
      avatar_url: avatarUrl,
      sobre_mi: sobreMi.trim() || null,
      formaciones,
      habilidades,
      tipo_busqueda: tipoBusqueda,
      disponibilidad,
      modalidad,
      proyectos,
      redes_sociales: redesSociales,
      github_username: githubUsername,
      github_repos_vinculados: githubReposVinculados,
      ciudad: ciudad.trim() || null,
      telefono: telefono.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("estudiante").upsert(payload);
    setSaving(false);
    if (error) setSaveError("Error al guardar: " + error.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
        <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px" }}>
          {/* Cabecera */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--color-text)",
                  margin: 0,
                }}
              >
                Mi perfil
              </h1>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: 11,
                  marginTop: 3,
                  marginBottom: 0,
                }}
              >
                Tu currículum digital en Relance
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                padding: "7px 14px",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <>
                  <Spinner /> Guardando...
                </>
              ) : saved ? (
                <>
                  <IconCheck /> Guardado
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>

          {saveError && (
            <div
              style={{
                marginBottom: 16,
                background: "var(--color-error-bg)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#f87171",
                fontSize: 12,
              }}
            >
              {saveError}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* ── 1. INFORMACIÓN PERSONAL ── */}
            <SectionCard title="Información personal">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 14,
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 14,
                        objectFit: "cover",
                        border: "2px solid var(--color-border-strong)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 14,
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-text-subtle)",
                      }}
                    >
                      <IconUser size={32} />
                    </div>
                  )}
                  {uploading && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 14,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Spinner className="w-5 h-5" />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setUploadError(null);
                      fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                    style={{
                      position: "absolute",
                      bottom: -6,
                      right: -6,
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "var(--color-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#02050d",
                      border: "2px solid var(--color-surface-strong)",
                      cursor: "pointer",
                      opacity: uploading ? 0.5 : 1,
                    }}
                  >
                    <IconCamera size={12} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div>
                  <p
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: 11,
                      marginBottom: 2,
                    }}
                  >
                    Foto de perfil
                  </p>
                  <p
                    style={{
                      color: "var(--color-text-subtle)",
                      fontSize: 10,
                      margin: 0,
                    }}
                  >
                    JPG, PNG o WebP · Máx. 2 MB
                  </p>
                  {uploadError && (
                    <p
                      style={{
                        color: "#f87171",
                        fontSize: 10,
                        marginTop: 4,
                        marginBottom: 0,
                      }}
                    >
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Nombre{" "}
                    <span style={{ color: "var(--color-brand)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNombre(e.target.value)
                    }
                    placeholder="Tu nombre"
                    className="input-field"
                    style={inputSmall}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Apellidos{" "}
                    <span style={{ color: "var(--color-brand)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={apellidos}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setApellidos(e.target.value)
                    }
                    placeholder="Tus apellidos"
                    className="input-field"
                    style={inputSmall}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Ciudad{" "}
                    <span style={{ color: "var(--color-brand)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCiudad(e.target.value)
                    }
                    placeholder="Ej: Córdoba"
                    className="input-field"
                    style={inputSmall}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTelefono(e.target.value)
                    }
                    placeholder="Ej: 612 345 678"
                    className="input-field"
                    style={inputSmall}
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── 2. SOBRE MÍ ── */}
            <SectionCard
              title="Sobre mí"
              subtitle="Cuéntale a las empresas quién eres y qué buscas"
            >
              <textarea
                value={sobreMi}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setSobreMi(e.target.value.slice(0, 500))
                }
                rows={3}
                placeholder="Soy un desarrollador apasionado por... Busco prácticas en..."
                className="input-field"
                style={{ ...inputSmall, resize: "none" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <span
                  style={{ fontSize: 10, color: "var(--color-text-subtle)" }}
                >
                  Aparecerá destacado en tu perfil público
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color:
                      sobreMi.length > 450
                        ? "var(--color-brand)"
                        : "var(--color-text-subtle)",
                  }}
                >
                  {sobreMi.length}/500
                </span>
              </div>
            </SectionCard>

            {/* ── 3. FORMACIÓN ACADÉMICA ── */}
            <SectionCard
              title="Formación académica"
              subtitle="Si sigues en curso aparecerá como «Actualidad»"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                {formaciones.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px 0",
                      border: "1px dashed var(--color-border-strong)",
                      borderRadius: 10,
                    }}
                  >
                    <p
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: 12,
                        margin: 0,
                      }}
                    >
                      Aún no has añadido formación académica
                    </p>
                    <p
                      style={{
                        color: "var(--color-text-subtle)",
                        fontSize: 11,
                        marginTop: 3,
                        marginBottom: 0,
                      }}
                    >
                      Pulsa el botón para añadir tus estudios
                    </p>
                  </div>
                )}
                {[...formaciones]
                  .sort((a, b) => {
                    if (a.en_curso && !b.en_curso) return -1;
                    if (!a.en_curso && b.en_curso) return 1;
                    return (
                      (Number(b.anio_inicio) || 0) -
                      (Number(a.anio_inicio) || 0)
                    );
                  })
                  .map((f) => (
                    <FormacionItem
                      key={f.id}
                      item={f}
                      onEdit={(item) => setFormacionModal(item)}
                      onDelete={(id) =>
                        setFormaciones((fs) => fs.filter((x) => x.id !== id))
                      }
                    />
                  ))}
              </div>
              <button
                onClick={() => setFormacionModal("new")}
                style={{
                  width: "100%",
                  border: "1px dashed var(--color-border-strong)",
                  background: "transparent",
                  color: "var(--color-text-muted)",
                  padding: "10px 0",
                  borderRadius: 10,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.borderColor = "rgba(192,255,114,0.35)";
                  e.currentTarget.style.color = "var(--color-brand)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.borderColor =
                    "var(--color-border-strong)";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                <IconPlus size={13} /> Añadir formación
              </button>
            </SectionCard>

            {/* ── 4. HABILIDADES TÉCNICAS ── */}
            <SectionCard title="Habilidades técnicas">
              <input
                type="text"
                value={habilidadInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setHabilidadInput(e.target.value)
                }
                onKeyDown={handleHabilidadKey}
                placeholder="Escribe una habilidad y pulsa Enter (React, Python, SQL...)"
                className="input-field"
                style={{ ...inputSmall, marginBottom: 10 }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {habilidades.map((h) => (
                  <span
                    key={h}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: "rgba(192,255,114,0.08)",
                      border: "1px solid rgba(192,255,114,0.2)",
                      color: "var(--color-brand)",
                      fontSize: 11,
                      padding: "3px 10px",
                      borderRadius: 20,
                    }}
                  >
                    {h}
                    <button
                      onClick={() =>
                        setHabilidades(habilidades.filter((x) => x !== h))
                      }
                      style={{
                        color: "inherit",
                        opacity: 0.6,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {habilidades.length === 0 && (
                  <p
                    style={{
                      color: "var(--color-text-subtle)",
                      fontSize: 12,
                      margin: 0,
                    }}
                  >
                    Aún no has añadido habilidades
                  </p>
                )}
              </div>
            </SectionCard>

            {/* ── 5. TIPO DE BÚSQUEDA ── */}
            <SectionCard title="Tipo de búsqueda">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {TIPO_BUSQUEDA.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTipoBusqueda(t.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border:
                        tipoBusqueda === t.id
                          ? "1px solid var(--color-brand)"
                          : "1px solid var(--color-border)",
                      background:
                        tipoBusqueda === t.id
                          ? "rgba(192,255,114,0.07)"
                          : "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <svg
                      style={{ width: 16, height: 16, flexShrink: 0 }}
                      viewBox="0 0 640 640"
                    >
                      <use href={`/icons.svg#${t.icon}`} />
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color:
                            tipoBusqueda === t.id
                              ? "var(--color-text)"
                              : "var(--color-text-secondary)",
                          margin: 0,
                        }}
                      >
                        {t.label}
                      </p>
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--color-text-muted)",
                          margin: "2px 0 0",
                        }}
                      >
                        {t.desc}
                      </p>
                    </div>
                    {tipoBusqueda === t.id && (
                      <div
                        style={{ color: "var(--color-brand)", flexShrink: 0 }}
                      >
                        <IconCheck size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* ── 6. DISPONIBILIDAD ── */}
            <SectionCard title="Disponibilidad y modalidad">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label
                    style={{
                      ...labelStyle,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Jornada disponible
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 6,
                    }}
                  >
                    {DISPONIBILIDAD.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDisponibilidad(d.id)}
                        style={{
                          padding: "8px 0",
                          borderRadius: 9,
                          border:
                            disponibilidad === d.id
                              ? "1px solid var(--color-brand)"
                              : "1px solid var(--color-border)",
                          background:
                            disponibilidad === d.id
                              ? "rgba(192,255,114,0.08)"
                              : "transparent",
                          fontSize: 11,
                          fontWeight: 500,
                          color:
                            disponibilidad === d.id
                              ? "var(--color-brand)"
                              : "var(--color-text-muted)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      ...labelStyle,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Modalidad preferida
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 6,
                    }}
                  >
                    {MODALIDAD.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setModalidad(m.id)}
                        style={{
                          padding: "8px 0",
                          borderRadius: 9,
                          border:
                            modalidad === m.id
                              ? "1px solid var(--color-brand)"
                              : "1px solid var(--color-border)",
                          background:
                            modalidad === m.id
                              ? "rgba(192,255,114,0.08)"
                              : "transparent",
                          fontSize: 11,
                          fontWeight: 500,
                          color:
                            modalidad === m.id
                              ? "var(--color-brand)"
                              : "var(--color-text-muted)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── 7. PORTFOLIO ── */}
            <SectionCard
              title="Portfolio y proyectos"
              subtitle="Pega una URL de GitHub y la IA rellenará los datos automáticamente"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                {proyectos.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px 0",
                      border: "1px dashed var(--color-border-strong)",
                      borderRadius: 10,
                    }}
                  >
                    <p
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: 12,
                        margin: 0,
                      }}
                    >
                      Aún no has añadido proyectos
                    </p>
                    <p
                      style={{
                        color: "var(--color-text-subtle)",
                        fontSize: 11,
                        marginTop: 3,
                        marginBottom: 0,
                      }}
                    >
                      ¡Muestra tu trabajo a las empresas!
                    </p>
                  </div>
                )}
                {proyectos.map((p) => (
                  <ProyectoCard
                    key={p.id}
                    proyecto={p}
                    onEdit={(proj) => setProyectoModal(proj)}
                    onDelete={(id) =>
                      setProyectos((ps) => ps.filter((x) => x.id !== id))
                    }
                  />
                ))}
              </div>
              <button
                onClick={() => setProyectoModal("new")}
                style={{
                  width: "100%",
                  border: "1px dashed var(--color-border-strong)",
                  background: "transparent",
                  color: "var(--color-text-muted)",
                  padding: "10px 0",
                  borderRadius: 10,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.borderColor = "rgba(192,255,114,0.35)";
                  e.currentTarget.style.color = "var(--color-brand)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.borderColor =
                    "var(--color-border-strong)";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                <IconPlus size={13} /> Añadir proyecto
              </button>
            </SectionCard>

            {/* ── 8. GITHUB ── */}
            <SectionCard
              title="Repositorios de GitHub"
              subtitle="Conecta tu cuenta para mostrar tus repos directamente en tu perfil"
            >
              <GitHubReposSection
                reposVinculados={githubReposVinculados}
                onReposChange={setGithubReposVinculados}
                githubUsername={githubUsername}
                onUsernameChange={setGithubUsername}
              />
            </SectionCard>

            {/* ── 9. REDES SOCIALES ── */}
            <SectionCard
              title="Redes sociales y enlaces"
              subtitle="Enlaza tus perfiles profesionales para que las empresas puedan conocerte mejor"
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {REDES_SOCIALES.map(
                  ({ id, label, placeholder, icon: Icon }) => (
                    <div
                      key={id}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-text-muted)",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={14} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ ...labelStyle, marginBottom: 3 }}>
                          {label}
                        </label>
                        <input
                          type="url"
                          value={redesSociales[id] ?? ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setRedesSociales((r) => ({
                              ...r,
                              [id]: e.target.value,
                            }))
                          }
                          placeholder={placeholder}
                          className="input-field"
                          style={inputSmall}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </SectionCard>

            {/* Botón guardar final */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                display: "flex",
                gap: 6,
                padding: "11px 0",
                fontSize: 13,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <>
                  <Spinner /> Guardando...
                </>
              ) : saved ? (
                <>
                  <IconCheck size={14} /> Perfil guardado
                </>
              ) : (
                "Guardar perfil"
              )}
            </button>
          </div>
        </main>

        {/* Modales */}
        {formacionModal && (
          <FormacionModal
            item={formacionModal === "new" ? null : formacionModal}
            onSave={handleGuardarFormacion}
            onClose={() => setFormacionModal(null)}
          />
        )}
        {proyectoModal && (
          <ProyectoModal
            proyecto={proyectoModal === "new" ? null : proyectoModal}
            onSave={handleGuardarProyecto}
            onClose={() => setProyectoModal(null)}
          />
        )}
      </div>
    </MainLayout>
  );
}
