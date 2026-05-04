import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
// import Header from "../components/layout/Header";
import GitHubReposSection from "./GitHubIntegration";
import MainLayout from "../components/layout/MainLayout";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const TIPO_BUSQUEDA = [
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

const DISPONIBILIDAD = [
  { id: "media_jornada", label: "Media jornada" },
  { id: "flexible", label: "Flexible" },
  { id: "completa", label: "Completa" },
];

const MODALIDAD = [
  { id: "presencial", label: "Presencial" },
  { id: "remoto", label: "Remoto" },
  { id: "hibrido", label: "Híbrido" },
];

const MESES = [
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

const REDES_SOCIALES = [
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
function IconLinkedIn({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
function IconGitHub({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
function IconTwitter({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function IconGlobe({ size = 16 }) {
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
function IconBehance({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029H23.7zM15.971 13h4.059c-.tabel3-1.508-1.336-1.95-1.99-1.95-1.695 0-1.972 1.069-2.069 1.95zM8.342 7H1v10h7.812c3.465 0 4.188-3.773 2.18-5.126C12.22 10.637 11.5 7 8.342 7zM4.1 10.5h3.1c1.7 0 1.7 2.5 0 2.5H4.1v-2.5zm3.5 5H4.1V13h3.5c2 0 2 2.5 0 2.5z" />
    </svg>
  );
}
function IconDribbble({ size = 16 }) {
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
function IconUser({ size = 36 }) {
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
function IconPlus({ size = 16 }) {
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
function IconEdit({ size = 14 }) {
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
function IconTrash({ size = 14 }) {
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
function IconCheck({ size = 16 }) {
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
function IconCamera({ size = 14 }) {
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
function Spinner({ className = "w-4 h-4" }) {
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
// COMPONENTES UI
// ─────────────────────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children }) {
  return (
    <section className="bg-dark-800 border border-white/10 rounded-2xl p-6">
      <div className="mb-5">
        <h2 className="font-display text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {title}
        </h2>
        {subtitle && <p className="text-gray-600 text-xs mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMACIÓN ACADÉMICA — subcomponente
// ─────────────────────────────────────────────────────────────────────────────
function FormacionItem({ item, onEdit, onDelete }) {
  const mesInicio = item.mes_inicio ? MESES[parseInt(item.mes_inicio) - 1] : "";
  const mesFin = item.mes_fin ? MESES[parseInt(item.mes_fin) - 1] : "";
  const finLabel = item.en_curso ? "Actualidad" : `${mesFin} ${item.anio_fin}`;

  return (
    <div className="group flex items-start gap-3 p-4 bg-dark border border-white/8 rounded-xl relative">
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div className="w-2.5 h-2.5 rounded-full border-2 border-brand bg-dark" />
        <div className="w-px flex-1 bg-white/10 mt-1 min-h-[32px]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold font-display truncate">
          {item.titulo || "Sin título"}
        </p>
        <p className="text-gray-400 text-xs mt-0.5 truncate">{item.centro}</p>
        <p className="text-gray-600 text-xs mt-1">
          {mesInicio} {item.anio_inicio} —{" "}
          <span className={item.en_curso ? "text-brand" : ""}>{finLabel}</span>
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        >
          <IconEdit />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

function FormacionModal({ item, onSave, onClose }) {
  const anioActual = new Date().getFullYear();
  const [form, setForm] = useState(
    item || {
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
  const [centroQuery, setCentroQuery] = useState(item?.centro || "");
  const [centroSugerencias, setCentroSugerencias] = useState([]);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const debounceRef = useRef(null);

  const s = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const anios = Array.from(
    { length: anioActual - 1980 + 1 },
    (_, i) => anioActual - i,
  );

  const buscarCentros = useCallback(async (q) => {
    if (q.length < 2) {
      setCentroSugerencias([]);
      return;
    }
    setLoadingSugerencias(true);
    const { data } = await supabase
      .from("profiles")
      .select("center_name")
      .ilike("center_name", `%${q}%`)
      .limit(8);
    const { data: data2 } = await supabase
      .from("centros_educativos")
      .select("nombre")
      .ilike("nombre", `%${q}%`)
      .limit(8);
    const nombres = [
      ...(data?.map((d) => d.center_name).filter(Boolean) || []),
      ...(data2?.map((d) => d.nombre).filter(Boolean) || []),
    ];
    setCentroSugerencias([...new Set(nombres)]);
    setLoadingSugerencias(false);
  }, []);

  const handleCentroChange = (e) => {
    const val = e.target.value;
    setCentroQuery(val);
    setForm((f) => ({ ...f, centro: val }));
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscarCentros(val), 300);
  };

  const seleccionarCentro = (nombre) => {
    setCentroQuery(nombre);
    setForm((f) => ({ ...f, centro: nombre }));
    setCentroSugerencias([]);
  };

  const isValid =
    form.titulo.trim() &&
    form.centro.trim() &&
    form.mes_inicio &&
    form.anio_inicio &&
    (form.en_curso || (form.mes_fin && form.anio_fin));

  return (
    // <MainLayout>
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
        <h2 className="font-display text-xl font-bold text-white mb-6">
          {item ? "Editar formación" : "Añadir formación"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Título / Grado <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={s("titulo")}
              placeholder="Ej: Técnico Superior en DAM"
              className="input-field"
            />
          </div>
          <div className="relative">
            <label className="block text-sm text-gray-400 mb-1.5">
              Centro educativo <span className="text-brand">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={centroQuery}
                onChange={handleCentroChange}
                placeholder="Escribe para buscar centros..."
                className="input-field pr-8"
                autoComplete="off"
              />
              {loadingSugerencias && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Spinner className="w-4 h-4 text-brand" />
                </div>
              )}
            </div>
            {centroSugerencias.length > 0 && (
              <div className="absolute z-30 top-full mt-1 w-full bg-dark-800 border border-white/15 rounded-xl overflow-hidden shadow-xl">
                {centroSugerencias.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => seleccionarCentro(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/8 hover:text-white transition-colors border-b border-white/5 last:border-0"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Fecha de inicio <span className="text-brand">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.mes_inicio}
                onChange={s("mes_inicio")}
                className="input-field"
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
          <div className="flex items-center gap-3 p-3 bg-dark border border-white/8 rounded-xl">
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
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${form.en_curso ? "bg-brand" : "bg-white/15"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.en_curso ? "translate-x-5" : ""}`}
              />
            </button>
            <div>
              <p className="text-sm text-white font-medium">Todavía en curso</p>
              <p className="text-xs text-gray-500">
                Aparecerá como "Actualidad" en tu perfil
              </p>
            </div>
          </div>
          {!form.en_curso && (
            <div className="animate-fade-in">
              <label className="block text-sm text-gray-400 mb-1.5">
                Fecha de finalización <span className="text-brand">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.mes_fin}
                  onChange={s("mes_fin")}
                  className="input-field"
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
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={() =>
              isValid && onSave({ ...form, id: form.id || Date.now() })
            }
            disabled={!isValid}
            className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {item ? "Guardar cambios" : "Añadir formación"}
          </button>
        </div>
      </div>
    </div>
    // </MainLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO — subcomponente con IA via Anthropic API
// ─────────────────────────────────────────────────────────────────────────────
function ProyectoModal({ proyecto, onSave, onClose }) {
  const [form, setForm] = useState(
    proyecto || {
      id: null,
      titulo: "",
      descripcion: "",
      tecnologias: [],
      url_repo: "",
      url_demo: "",
    },
  );
  const [techInput, setTechInput] = useState("");
  const [githubUrl, setGithubUrl] = useState(proyecto?.url_repo || "");
  const [analizando, setAnalizando] = useState(false);
  const [errorAnalisis, setErrorAnalisis] = useState(null);

  const handleTechKey = (e) => {
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

  const analizarConIA = async () => {
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
      const repoData =
        repoRes.status === "fulfilled" && repoRes.value.ok
          ? await repoRes.value.json()
          : {};
      const langsData =
        langsRes.status === "fulfilled" && langsRes.value.ok
          ? await langsRes.value.json()
          : {};
      let readmeText = "";
      if (readmeRes.status === "fulfilled" && readmeRes.value.ok) {
        const rd = await readmeRes.value.json();
        readmeText = atob(rd.content?.replace(/\n/g, "") || "").slice(0, 2000);
      }
      const tecnologiasDetectadas = Object.keys(langsData).slice(0, 8);
      const prompt = `Eres un asistente que genera descripciones profesionales y concisas de proyectos de GitHub para un currículum digital de desarrollador.

Datos del repositorio:
- Nombre: ${repoData.name || repo}
- Descripción oficial: ${repoData.description || "No disponible"}
- Lenguajes detectados: ${tecnologiasDetectadas.join(", ") || "No disponible"}
- Estrellas: ${repoData.stargazers_count ?? 0}
- README (fragmento): ${readmeText || "No disponible"}

Genera UNA descripción en español de máximo 200 caracteres, directa, sin adornos, que explique qué hace este proyecto y para qué sirve. Solo devuelve la descripción, sin comillas ni explicaciones adicionales.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const aiData = await response.json();
      const descripcionIA =
        aiData.content?.[0]?.text?.trim() || repoData.description || "";
      setForm((f) => ({
        ...f,
        titulo: repoData.name || repo,
        descripcion: descripcionIA,
        tecnologias:
          tecnologiasDetectadas.length > 0
            ? tecnologiasDetectadas
            : f.tecnologias,
        url_repo: githubUrl,
        url_demo: repoData.homepage || f.url_demo,
      }));
    } catch (err) {
      setErrorAnalisis(
        "No se pudo analizar el repositorio. Comprueba la URL e inténtalo de nuevo.",
      );
    }
    setAnalizando(false);
  };

  const isValid = form.titulo.trim();

  return (
    // <MainLayout>
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
        <h2 className="font-display text-xl font-bold text-white mb-6">
          {proyecto ? "Editar proyecto" : "Añadir proyecto"}
        </h2>
        <div className="mb-5 p-4 bg-brand/5 border border-brand/20 rounded-xl">
          <p className="text-brand text-xs font-semibold uppercase tracking-wider mb-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 640 640">
              <use href="/icons.svg#icon-sparkles" />
            </svg>{" "}
            Rellena automáticamente con IA
          </p>
          <p className="text-gray-500 text-xs mb-3">
            Pega la URL de un repositorio de GitHub y la IA generará título,
            descripción y tecnologías automáticamente.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/usuario/repositorio"
              className="input-field flex-1 text-sm"
            />
            <button
              onClick={analizarConIA}
              disabled={analizando || !githubUrl.trim()}
              className="btn-primary flex-shrink-0 flex items-center gap-2 text-sm disabled:opacity-40"
            >
              {analizando ? (
                <>
                  <Spinner className="w-3.5 h-3.5" /> Analizando...
                </>
              ) : (
                "Analizar"
              )}
            </button>
          </div>
          {errorAnalisis && (
            <p className="text-red-400 text-xs mt-2">{errorAnalisis}</p>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Título del proyecto <span className="text-brand">*</span>
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) =>
                setForm((f) => ({ ...f, titulo: e.target.value }))
              }
              placeholder="Mi proyecto"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Descripción
            </label>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  descripcion: e.target.value.slice(0, 300),
                }))
              }
              placeholder="¿Qué hace este proyecto? ¿Qué problema resuelve?"
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-600 mt-1 text-right">
              {form.descripcion.length}/300
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Tecnologías
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleTechKey}
              placeholder="Escribe y pulsa Enter (React, Node.js...)"
              className="input-field mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {form.tecnologias.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 bg-brand/10 border border-brand/20 text-brand text-xs px-2.5 py-1 rounded-full"
                >
                  {t}
                  <button
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        tecnologias: f.tecnologias.filter((x) => x !== t),
                      }))
                    }
                    className="text-brand/60 hover:text-brand"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              URL del repositorio
            </label>
            <input
              type="url"
              value={form.url_repo}
              onChange={(e) => {
                setForm((f) => ({ ...f, url_repo: e.target.value }));
                setGithubUrl(e.target.value);
              }}
              placeholder="https://github.com/usuario/repo"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              URL de la demo
            </label>
            <input
              type="url"
              value={form.url_demo}
              onChange={(e) =>
                setForm((f) => ({ ...f, url_demo: e.target.value }))
              }
              placeholder="https://miproyecto.vercel.app"
              className="input-field"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={() =>
              isValid && onSave({ ...form, id: form.id || Date.now() })
            }
            disabled={!isValid}
            className="btn-primary flex-1 disabled:opacity-40"
          >
            {proyecto ? "Guardar cambios" : "Añadir proyecto"}
          </button>
        </div>
      </div>
    </div>
    // </MainLayout>
  );
}

function ProyectoCard({ proyecto, onEdit, onDelete }) {
  return (
    // <MainLayout>
    <div className="group bg-dark border border-white/8 rounded-xl p-4 hover:border-white/15 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-white text-sm truncate">
            {proyecto.titulo}
          </h3>
          {proyecto.descripcion && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">
              {proyecto.descripcion}
            </p>
          )}
          {proyecto.tecnologias?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {proyecto.tecnologias.slice(0, 5).map((t) => (
                <span
                  key={t}
                  className="bg-brand/10 border border-brand/20 text-brand text-xs px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
              {proyecto.tecnologias.length > 5 && (
                <span className="text-gray-600 text-xs px-2 py-0.5">
                  +{proyecto.tecnologias.length - 5}
                </span>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {proyecto.url_repo && (
              <a
                href={proyecto.url_repo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand transition-colors"
              >
                <IconGitHub size={12} /> Repositorio
              </a>
            )}
            {proyecto.url_demo && (
              <a
                href={proyecto.url_demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand transition-colors"
              >
                <IconGlobe size={12} /> Demo
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(proyecto)}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <IconEdit />
          </button>
          <button
            onClick={() => onDelete(proyecto.id)}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </div>
    // </MainLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function StudentProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [formacionModal, setFormacionModal] = useState(null);
  const [proyectoModal, setProyectoModal] = useState(null);

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [sobreMi, setSobreMi] = useState("");
  const [formaciones, setFormaciones] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const [habilidadInput, setHabilidadInput] = useState("");
  const [tipoBusqueda, setTipoBusqueda] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [modalidad, setModalidad] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [redesSociales, setRedesSociales] = useState({
    linkedin: "",
    github: "",
    twitter: "",
    portfolio: "",
    behance: "",
    dribbble: "",
  });

  // Estado GitHub ──────────────────────────────────────────────────
  const [githubUsername, setGithubUsername] = useState(null);
  const [githubReposVinculados, setGithubReposVinculados] = useState([]);

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? "Tu perfil";
  const displayName = nombre && apellidos ? `${nombre} ${apellidos}` : fullName;

  // ── Cargar perfil desde Supabase ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("estudiante")
        .select("*")
        .eq("id", user.id)
        .single();

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
        // GitHub
        setGithubUsername(data.github_username ?? null);
        setGithubReposVinculados(data.github_repos_vinculados ?? []);
      }
    };
    load();
  }, [user]);

  // ── Subir avatar ───────────────────────────────────────────────────────────
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
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
    const ext = file.name.split(".").pop().toLowerCase();
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

  const handleHabilidadKey = (e) => {
    if (e.key === "Enter" && habilidadInput.trim()) {
      e.preventDefault();
      if (!habilidades.includes(habilidadInput.trim()))
        setHabilidades([...habilidades, habilidadInput.trim()]);
      setHabilidadInput("");
    }
  };

  const handleGuardarFormacion = (item) => {
    if (formacionModal === "new") {
      setFormaciones((fs) => [...fs, item]);
    } else {
      setFormaciones((fs) => fs.map((f) => (f.id === item.id ? item : f)));
    }
    setFormacionModal(null);
  };

  const handleGuardarProyecto = (p) => {
    if (proyectoModal === "new") {
      setProyectos((ps) => [...ps, p]);
    } else {
      setProyectos((ps) => ps.map((x) => (x.id === p.id ? p : x)));
    }
    setProyectoModal(null);
  };

  // ── Guardar perfil completo ────────────────────────────────────────────────
  const handleSave = async () => {
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
      // GitHub
      github_username: githubUsername,
      github_repos_vinculados: githubReposVinculados,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("estudiante").upsert(payload);
    setSaving(false);
    if (error) {
      setSaveError("Error al guardar: " + error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <div className="min-h-screen bg-dark">
        {/* <Header onLoginClick={() => {}} onRegisterClick={() => {}} /> */}

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          {/* Cabecera */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">
                Mi perfil
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Tu currículum digital en Relance
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Spinner /> Guardando...
                </>
              ) : saved ? (
                <>
                  <IconCheck size={14} /> Guardado
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>

          {saveError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {saveError}
            </div>
          )}

          <div className="space-y-6">
            {/* ── 1. INFORMACIÓN PERSONAL ── */}
            <SectionCard title="Información personal">
              <div className="flex items-center gap-5 mb-5">
                <div className="relative flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-dark border border-white/10 flex items-center justify-center text-gray-600">
                      <IconUser size={40} />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 rounded-2xl bg-black/70 flex items-center justify-center">
                      <Spinner className="w-6 h-6 text-brand" />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setUploadError(null);
                      fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand flex items-center justify-center text-dark shadow-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
                  >
                    <IconCamera size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-xs mb-1">Foto de perfil</p>
                  <p className="text-gray-600 text-xs">
                    JPG, PNG o WebP · Máx. 2 MB
                  </p>
                  {uploadError && (
                    <p className="text-red-400 text-xs mt-1">{uploadError}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Nombre <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Apellidos <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Tus apellidos"
                    className="input-field"
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
                onChange={(e) => setSobreMi(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Soy un desarrollador apasionado por... Busco prácticas en..."
                className="input-field resize-none"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-600">
                  Aparecerá destacado en tu perfil público
                </span>
                <span
                  className={`text-xs ${sobreMi.length > 450 ? "text-brand" : "text-gray-600"}`}
                >
                  {sobreMi.length}/500
                </span>
              </div>
            </SectionCard>

            {/* ── 3. FORMACIÓN ACADÉMICA ── */}
            <SectionCard
              title="Formación académica"
              subtitle="Añade tus estudios. Si sigues en curso aparecerá como «Actualidad»"
            >
              <div className="space-y-3 mb-4">
                {formaciones.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                    <p className="text-gray-600 text-sm">
                      Aún no has añadido formación académica
                    </p>
                    <p className="text-gray-700 text-xs mt-1">
                      Pulsa el botón para añadir tus estudios
                    </p>
                  </div>
                )}
                {[...formaciones]
                  .sort((a, b) => {
                    if (a.en_curso && !b.en_curso) return -1;
                    if (!a.en_curso && b.en_curso) return 1;
                    return (b.anio_inicio || 0) - (a.anio_inicio || 0);
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
                className="w-full border border-dashed border-white/20 hover:border-brand/40 text-gray-500 hover:text-brand py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <IconPlus size={14} /> Añadir formación
              </button>
            </SectionCard>

            {/* ── 4. HABILIDADES TÉCNICAS ── */}
            <SectionCard title="Habilidades técnicas">
              <input
                type="text"
                value={habilidadInput}
                onChange={(e) => setHabilidadInput(e.target.value)}
                onKeyDown={handleHabilidadKey}
                placeholder="Escribe una habilidad y pulsa Enter (React, Python, SQL...)"
                className="input-field mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {habilidades.map((h) => (
                  <span
                    key={h}
                    className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 text-brand text-sm px-3 py-1 rounded-full"
                  >
                    {h}
                    <button
                      onClick={() =>
                        setHabilidades(habilidades.filter((x) => x !== h))
                      }
                      className="text-brand/60 hover:text-brand leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {habilidades.length === 0 && (
                  <p className="text-gray-600 text-sm">
                    Aún no has añadido habilidades
                  </p>
                )}
              </div>
            </SectionCard>

            {/* ── 5. TIPO DE BÚSQUEDA ── */}
            <SectionCard title="Tipo de búsqueda">
              <div className="space-y-2">
                {TIPO_BUSQUEDA.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTipoBusqueda(t.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                      tipoBusqueda === t.id
                        ? "border-brand bg-brand/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      viewBox="0 0 640 640"
                    >
                      <use href={`/icons.svg#${t.icon}`} />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold ${tipoBusqueda === t.id ? "text-white" : "text-gray-300"}`}
                      >
                        {t.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                    </div>
                    {tipoBusqueda === t.id && (
                      <div className="flex-shrink-0 text-brand">
                        <IconCheck size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* ── 6. DISPONIBILIDAD ── */}
            <SectionCard title="Disponibilidad y modalidad">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">
                    Jornada disponible
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DISPONIBILIDAD.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDisponibilidad(d.id)}
                        className={`py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                          disponibilidad === d.id
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">
                    Modalidad preferida
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {MODALIDAD.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setModalidad(m.id)}
                        className={`py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                          modalidad === m.id
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── 7. PORTFOLIO Y PROYECTOS ── */}
            <SectionCard
              title="Portfolio y proyectos"
              subtitle="Muestra tu trabajo. Pega una URL de GitHub y la IA rellenará los datos automáticamente"
            >
              <div className="space-y-3 mb-4">
                {proyectos.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                    <p className="text-gray-600 text-sm">
                      Aún no has añadido proyectos
                    </p>
                    <p className="text-gray-700 text-xs mt-1">
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
                className="w-full border border-dashed border-white/20 hover:border-brand/40 text-gray-500 hover:text-brand py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <IconPlus size={14} /> Añadir proyecto
              </button>
            </SectionCard>

            {/* ── 8. REPOSITORIOS DE GITHUB (NUEVO) ── */}
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
              <div className="space-y-3">
                {REDES_SOCIALES.map(
                  ({ id, label, placeholder, icon: Icon }) => (
                    <div key={id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 flex-shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">
                          {label}
                        </label>
                        <input
                          type="url"
                          value={redesSociales[id] || ""}
                          onChange={(e) =>
                            setRedesSociales((r) => ({
                              ...r,
                              [id]: e.target.value,
                            }))
                          }
                          placeholder={placeholder}
                          className="input-field text-sm"
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
              className="btn-primary w-full flex justify-center items-center gap-2 py-3.5 text-base disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Spinner /> Guardando...
                </>
              ) : saved ? (
                <>
                  <IconCheck size={16} /> Perfil guardado
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
