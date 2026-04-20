import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import Header from "../components/layout/Header";

const SEARCH_TYPES = [
  { id: "practicas", label: "Solo prácticas", icon: "icon-document" },
  {
    id: "practicas_contratacion",
    label: "Prácticas con posibilidad de contratación",
    icon: "icon-rocket",
  },
  { id: "empleo", label: "Empleo directo", icon: "icon-briefcase" },
];

const MODALITIES = [
  { id: "presencial", label: "Presencial" },
  { id: "remoto", label: "Remoto" },
  { id: "hibrido", label: "Híbrido" },
];

export default function StudentProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Campos del perfil
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

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? "Tu perfil";
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  // Cargar perfil existente
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
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
      }
    };
    loadProfile();
  }, [user]);

  // Subir foto de perfil
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    // 1. Subida a Supabase Storage
    const { error } = await supabase.storage
      .from("profiles")
      .upload(path, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      setUploading(false);
      return;
    }

    // 2. Obtener URL pública
    const { data } = supabase.storage.from("profiles").getPublicUrl(path);

    // 3. Evito caché del navegador
    const url = `${data.publicUrl}?t=${Date.now()}`;

    setAvatarUrl(url);

    // 4. Guardo en BD
    await supabase.from("profiles").upsert({
      id: user.id,
      avatar_url: data.publicUrl,
    });

    setUploading(false);
  };

  // Añadir skill con Enter
  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Guardar perfil
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
      available_from: availableFrom,
      modality,
      city,
      province,
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-white mb-8">
          Mi perfil
        </h1>

        <div className="space-y-6">
          {/* ── 1. Header del perfil ── */}
          <section className="bg-dark-800 border border-white/10 rounded-2xl p-6">
            <h2 className="font-display text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Foto de perfil
            </h2>
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
          </section>

          {/* ── 2. Descripción personal ── */}
          <section className="bg-dark-800 border border-white/10 rounded-2xl p-6">
            <h2 className="font-display text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Sobre mí
            </h2>
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
          </section>

          {/* ── 3. Información académica ── */}
          <section className="bg-dark-800 border border-white/10 rounded-2xl p-6">
            <h2 className="font-display text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Información académica
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Centro educativo
                </label>
                <input
                  type="text"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  placeholder="Ej: IES Trassierra"
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
                  placeholder="Ej: DAW — Desarrollo de Aplicaciones Web"
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
                  placeholder="2026"
                  min="2020"
                  max="2035"
                  className="input-field"
                />
              </div>
            </div>
          </section>

          {/* ── 4. Habilidades técnicas ── */}
          <section className="bg-dark-800 border border-white/10 rounded-2xl p-6">
            <h2 className="font-display text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Habilidades técnicas
            </h2>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder="Escribe una habilidad y pulsa Enter (ej: React, Python, SQL...)"
              className="input-field mb-3"
            />
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 text-brand text-sm px-3 py-1 rounded-full"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-brand/60 hover:text-brand transition-colors"
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
          </section>

          {/* ── 5. Tipo de búsqueda ── */}
          <section className="bg-dark-800 border border-white/10 rounded-2xl p-6">
            <h2 className="font-display text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Tipo de búsqueda
            </h2>
            <div className="space-y-2">
              {SEARCH_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSearchType(type.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                    searchType === type.id
                      ? "border-brand bg-brand/10 text-white"
                      : "border-white/10 hover:border-white/20 text-gray-400"
                  }`}
                >
                  {/* <span className="text-xl">{type.icon}</span> */}

                  <span className="text-xl text-brand">
                    <svg className="w-6 h-6">
                      <use href={`icons.svg#${type.icon}`} />
                    </svg>
                  </span>
                  <span className="text-sm font-medium">{type.label}</span>
                  {searchType === type.id && (
                    <span className="ml-auto text-brand">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* ── 6. Disponibilidad ── */}
          <section className="bg-dark-800 border border-white/10 rounded-2xl p-6">
            <h2 className="font-display text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Disponibilidad
            </h2>
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
          </section>

          {/* ── 7. Ubicación ── */}
          <section className="bg-dark-800 border border-white/10 rounded-2xl p-6">
            <h2 className="font-display text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Ubicación
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Córdoba"
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
                  placeholder="Córdoba"
                  className="input-field"
                />
              </div>
            </div>
          </section>

          {/* ── 8. Privacidad ── */}
          <section className="bg-dark-800 border border-white/10 rounded-2xl p-6">
            <h2 className="font-display text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Privacidad del perfil
            </h2>

            <div className="flex flex-col gap-2">
              {[
                {
                  value: true,
                  icon: "icon-globe",
                  label: "Público",
                  desc: "Visible para todas las empresas verificadas",
                },
                {
                  value: false,
                  icon: "icon-lock",
                  label: "Privado",
                  desc: "Solo empresas con candidatura activa",
                },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setIsPublic(opt.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                    isPublic === opt.value
                      ? "border-brand bg-brand/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* ICONO SVG */}
                  <span className="text-brand mt-0.5">
                    <svg className="w-6 h-6">
                      <use href={`/icons.svg#${opt.icon}`} />
                    </svg>
                  </span>

                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isPublic === opt.value ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>

                  {isPublic === opt.value && (
                    <span className="ml-auto text-brand mt-0.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Botón guardar */}
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
    </div>
  );
}
