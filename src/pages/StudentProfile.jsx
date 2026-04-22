import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import Header from "../components/layout/Header";
import MainLayout from "../components/layout/MainLayout";

// ── Constantes ─────────────────────────────────────────────────────────────
const SEARCH_TYPES = [
  { id: "practicas", label: "Solo prácticas", icon: "📚" },
  {
    id: "practicas_contratacion",
    label: "Prácticas con posibilidad de contratación",
    icon: "🚀",
  },
  { id: "empleo", label: "Empleo directo", icon: "💼" },
];

const MODALITIES = [
  { id: "presencial", label: "Presencial" },
  { id: "remoto", label: "Remoto" },
  { id: "hibrido", label: "Híbrido" },
];

const LINK_TYPES = [
  {
    id: "github",
    label: "GitHub",
    icon: "icon-github",
    placeholder: "https://github.com/tuusuario",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: "icon-portfolio",
    placeholder: "https://tuportfolio.com",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "icon-linkedin",
    placeholder: "https://linkedin.com/in/tuusuario",
  },
  {
    id: "otro",
    label: "Otro enlace",
    icon: "icon-link",
    placeholder: "https://...",
  },
];

// ── Componentes auxiliares ──────────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <section className="bg-dark-800 border border-white/10 rounded-2xl p-6">
      <h2 className="font-display text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <div className="group bg-dark border border-white/10 rounded-xl p-4 relative">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-white text-sm truncate">
            {project.title}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">
            {project.description}
          </p>
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {project.technologies.map((t) => (
                <span
                  key={t}
                  className="bg-brand/10 border border-brand/20 text-brand text-xs px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand transition-colors"
              >
                <span>🐙</span> Repositorio
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand transition-colors"
              >
                <span>🚀</span> Demo
              </a>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(project)}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <svg
              width="14"
              height="14"
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
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectModal({ project, onSave, onClose }) {
  const [form, setForm] = useState(
    project || {
      title: "",
      description: "",
      technologies: [],
      repo_url: "",
      demo_url: "",
    },
  );
  const [techInput, setTechInput] = useState("");

  const handleTechKey = (e) => {
    if (e.key === "Enter" && techInput.trim()) {
      e.preventDefault();
      if (!form.technologies.includes(techInput.trim())) {
        setForm((f) => ({
          ...f,
          technologies: [...f.technologies, techInput.trim()],
        }));
      }
      setTechInput("");
    }
  };

  const removeTech = (t) =>
    setForm((f) => ({
      ...f,
      technologies: f.technologies.filter((x) => x !== t),
    }));

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>

        <h2 className="font-display text-xl font-bold text-white mb-6">
          {project ? "Editar proyecto" : "Añadir proyecto"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Título del proyecto *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Mi proyecto awesome"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Descripción
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="¿Qué hace este proyecto? ¿Qué problema resuelve?"
              className="input-field resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Tecnologías utilizadas
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
              {form.technologies.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 bg-brand/10 border border-brand/20 text-brand text-xs px-2.5 py-1 rounded-full"
                >
                  {t}
                  <button
                    onClick={() => removeTech(t)}
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
              value={form.repo_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, repo_url: e.target.value }))
              }
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
              value={form.demo_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, demo_url: e.target.value }))
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
            onClick={() => {
              if (form.title.trim()) onSave(form);
            }}
            className="btn-primary flex-1"
          >
            {project ? "Guardar cambios" : "Añadir proyecto"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ────────────────────────────────────────────────────────
export default function StudentProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [projectModal, setProjectModal] = useState(null); // null | 'new' | project obj

  // ── Estado del perfil ────────────────────────────────────────────────────
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [bio, setBio] = useState("");
  const [centerName, setCenterName] = useState("");
  const [degree, setDegree] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [searchType, setSearchType] = useState(null);
  const [availableFrom, setAvailableFrom] = useState("");
  const [modality, setModality] = useState(null);
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // ── Proyectos ─────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);

  // ── Links externos ─────────────────────────────────────────────────────────
  const [externalLinks, setExternalLinks] = useState([
    { type: "github", url: "" },
    { type: "portfolio", url: "" },
    { type: "linkedin", url: "" },
  ]);

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? "Tu perfil";
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  // ── Cargar perfil ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setAvatarUrl(data.avatar_url);
        setBio(data.bio ?? "");
        setCenterName(data.center_name ?? "");
        setDegree(data.degree ?? "");
        setGraduationYear(data.graduation_year ?? "");
        setSkills(data.skills ?? []);
        setSearchType(data.search_type);
        setAvailableFrom(data.available_from ?? "");
        setModality(data.modality);
        setCity(data.city ?? "");
        setProvince(data.province ?? "");
        setIsPublic(data.is_public ?? true);
        setProjects(data.projects ?? []);
        if (data.external_links?.length) setExternalLinks(data.external_links);
      }
    };
    load();
  }, [user]);

  // ── Foto de perfil ─────────────────────────────────────────────────────────
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error } = await supabase.storage
      .from("profiles")
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("profiles").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    }
    setUploading(false);
  };

  // ── Skills ─────────────────────────────────────────────────────────────────
  const handleSkillKey = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim()))
        setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  // ── Proyectos CRUD ─────────────────────────────────────────────────────────
  const handleSaveProject = (form) => {
    if (projectModal === "new") {
      setProjects((ps) => [...ps, { ...form, id: Date.now() }]);
    } else {
      setProjects((ps) =>
        ps.map((p) => (p.id === projectModal.id ? { ...form, id: p.id } : p)),
      );
    }
    setProjectModal(null);
  };

  const handleDeleteProject = (id) =>
    setProjects((ps) => ps.filter((p) => p.id !== id));

  // ── Links externos ──────────────────────────────────────────────────────────
  const updateLink = (type, url) => {
    setExternalLinks((ls) => {
      const exists = ls.find((l) => l.type === type);
      return exists
        ? ls.map((l) => (l.type === type ? { ...l, url } : l))
        : [...ls, { type, url }];
    });
  };

  // ── Guardar perfil ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      avatar_url: avatarUrl,
      bio,
      center_name: centerName,
      degree,
      graduation_year: graduationYear,
      skills,
      search_type: searchType,
      available_from: availableFrom || null,
      modality,
      city,
      province,
      is_public: isPublic,
      projects,
      external_links: externalLinks.filter((l) => l.url.trim()),
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <div className="min-h-screen bg-dark">
        {/* <Header onLoginClick={() => {}} onRegisterClick={() => {}} /> */}

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl font-bold text-white">
              Mi perfil
            </h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
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
                  Guardando...
                </>
              ) : saved ? (
                "✓ Guardado"
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>

          <div className="space-y-6">
            {/* ── 1. Foto de perfil ── */}
            <SectionCard title="Foto de perfil">
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-brand flex items-center justify-center text-dark font-display font-bold text-2xl">
                      {initials}
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                      <svg
                        className="animate-spin w-5 h-5 text-brand"
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
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-lg font-display">
                    {fullName}
                  </p>
                  <p className="text-gray-500 text-sm mb-3">{user?.email}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    Cambiar foto
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* ── 2. Descripción personal ── */}
            <SectionCard title="Sobre mí">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 300))}
                rows={4}
                placeholder="Cuéntanos sobre ti, tus objetivos y qué tipo de oportunidades buscas..."
                className="input-field resize-none"
              />
              <p className="text-xs text-gray-600 mt-1 text-right">
                {bio.length}/300
              </p>
            </SectionCard>

            {/* ── 3. Información académica ── */}
            <SectionCard title="Información académica">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Centro educativo
                  </label>
                  <input
                    type="text"
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    placeholder="Ej: IES Torre del Mar"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Titulación / Ciclo
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="Ej: DAM — Desarrollo de Aplicaciones Multiplataforma"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Año de finalización
                  </label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="2025"
                    min="2020"
                    max="2035"
                    className="input-field"
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── 4. Habilidades técnicas ── */}
            <SectionCard title="Habilidades técnicas">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKey}
                placeholder="Escribe una habilidad y pulsa Enter (React, Python, SQL...)"
                className="input-field mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 text-brand text-sm px-3 py-1 rounded-full"
                  >
                    {s}
                    <button
                      onClick={() => setSkills(skills.filter((x) => x !== s))}
                      className="text-brand/60 hover:text-brand"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <p className="text-gray-600 text-sm">
                    Aún no has añadido habilidades
                  </p>
                )}
              </div>
            </SectionCard>

            {/* ── 5. Portfolio y proyectos ── */}
            <SectionCard title="Portfolio y proyectos">
              <div className="space-y-3 mb-4">
                {projects.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-4">
                    Aún no has añadido proyectos. ¡Muestra tu trabajo a las
                    empresas!
                  </p>
                )}
                {projects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onEdit={(proj) => setProjectModal(proj)}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
              <button
                onClick={() => setProjectModal("new")}
                className="w-full border border-dashed border-white/20 hover:border-brand/40 text-gray-500 hover:text-brand py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Añadir proyecto
              </button>
            </SectionCard>

            {/* ── 6. Integración con GitHub / portfolio externo ── */}
            <SectionCard title="Perfiles y enlaces externos">
              <p className="text-gray-500 text-xs mb-4">
                Añade enlaces a GitHub, tu portfolio personal, LinkedIn u otras
                plataformas donde tengas publicados tus proyectos.
              </p>
              <div className="space-y-3">
                {LINK_TYPES.map((lt) => {
                  const existing = externalLinks.find((l) => l.type === lt.id);
                  return (
                    <div key={lt.id} className="flex items-center gap-3">
                      <span className="text-xl flex-shrink-0 w-7 text-center">
                        <svg width="20" height="20" fill="currentColor">
                          <use href={`icons.svg#${lt.icon}`} />
                        </svg>
                      </span>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">
                          {lt.label}
                        </label>
                        <input
                          type="url"
                          value={existing?.url ?? ""}
                          onChange={(e) => updateLink(lt.id, e.target.value)}
                          placeholder={lt.placeholder}
                          className="input-field text-sm"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                <svg width="16" height="16" fill="currentColor">
                  <use href="icons.svg#icon-info" />
                </svg>
                Futura versión: importación automática de repositorios vía API
                de GitHub.
              </p>
            </SectionCard>

            {/* ── 7. Tipo de búsqueda ── */}
            <SectionCard title="Tipo de búsqueda">
              <div className="space-y-2">
                {SEARCH_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSearchType(t.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                      searchType === t.id
                        ? "border-brand bg-brand/10 text-white"
                        : "border-white/10 hover:border-white/20 text-gray-400"
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-sm font-medium flex-1">
                      {t.label}
                    </span>
                    {searchType === t.id && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-brand flex-shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* ── 8. Disponibilidad ── */}
            <SectionCard title="Disponibilidad">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Disponible a partir de
                  </label>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Modalidad preferida
                  </label>
                  <div className="flex gap-2">
                    {MODALITIES.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setModality(m.id)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                          modality === m.id
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── 9. Ubicación ── */}
            <SectionCard title="Ubicación">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Madrid"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Madrid"
                    className="input-field"
                  />
                </div>
              </div>
            </SectionCard>

            {/* ── 10. Privacidad ── */}
            <SectionCard title="Privacidad del perfil">
              <div className="flex flex-col gap-2">
                {[
                  {
                    value: true,
                    icon: "🌐",
                    label: "Público",
                    desc: "Visible para todas las empresas verificadas y tutores",
                  },
                  {
                    value: false,
                    icon: "🔒",
                    label: "Privado",
                    desc: "Solo empresas con candidatura activa o relación de seguimiento",
                  },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => setIsPublic(opt.value)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                      isPublic === opt.value
                        ? "border-brand bg-brand/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className="text-xl mt-0.5">{opt.icon}</span>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${isPublic === opt.value ? "text-white" : "text-gray-400"}`}
                      >
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                    {isPublic === opt.value && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-brand mt-0.5 flex-shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
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
                  <svg
                    className="animate-spin w-4 h-4"
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
                  Guardando...
                </>
              ) : saved ? (
                "✓ Perfil guardado"
              ) : (
                "Guardar perfil"
              )}
            </button>
          </div>
        </main>

        {/* Modal de proyecto */}
        {projectModal && (
          <ProjectModal
            project={projectModal === "new" ? null : projectModal}
            onSave={handleSaveProject}
            onClose={() => setProjectModal(null)}
          />
        )}
      </div>
    </MainLayout>
  );
}
