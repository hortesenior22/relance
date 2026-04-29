import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/layout/Header";

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

export default function TutorProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const meta = user?.user_metadata ?? {};

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [fullName, setFullName] = useState(meta.full_name ?? "");
  const [role] = useState(meta.role ?? "");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState(meta.specialty ?? "");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Entidad a la que pertenece el tutor
  const [entityInfo, setEntityInfo] = useState(null);

  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
  const isCompanyTutor = role === "tutor_empresa";
  const roleLabel = isCompanyTutor
    ? "Tutor de empresa"
    : "Tutor de centro educativo";
  const roleIcon = isCompanyTutor ? "icon-building" : "icon-school";

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
        setFullName(data.full_name ?? meta.full_name ?? "");
        setBio(data.bio ?? "");
        setPhone(data.phone ?? "");
        setSpecialty(data.specialty ?? meta.specialty ?? "");
        setSkills(data.skills ?? []);
        setLinkedinUrl(data.linkedin_url ?? "");
      }

      // Cargar info de la entidad vinculada
      if (meta.entity_id) {
        const { data: entityData } = await supabase
          .from("profiles")
          .select("company_name, center_name, logo_url")
          .eq("id", meta.entity_id)
          .single();
        if (entityData) {
          setEntityInfo({
            name:
              entityData.company_name || entityData.center_name || "Entidad",
            logo: entityData.logo_url,
          });
        }
      }
    };
    load();
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const { error } = await supabase.storage
      .from("profiles")
      .upload(`avatars/${user.id}.${ext}`, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage
        .from("profiles")
        .getPublicUrl(`avatars/${user.id}.${ext}`);
      setAvatarUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSkillKey = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim()))
        setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").upsert({
      id: user.id,
      avatar_url: avatarUrl,
      full_name: fullName,
      bio,
      phone,
      specialty,
      skills,
      linkedin_url: linkedinUrl,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              Mi perfil
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <svg className="w-4 h-4" viewBox="0 0 640 640">
                <use href={`/icons.svg#${roleIcon}`} />
              </svg>
              <p className="text-gray-500 text-sm">{roleLabel}</p>
            </div>
          </div>
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
          {/* Entidad vinculada */}
          {entityInfo && (
            <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4 flex items-center gap-4">
              {entityInfo.logo ? (
                <img
                  src={entityInfo.logo}
                  alt={entityInfo.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-dark flex items-center justify-center text-2xl border border-white/10">
                  <svg className="w-5 h-5" viewBox="0 0 640 640">
                    <use href={`/icons.svg#${roleIcon}`} />
                  </svg>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Vinculado a</p>
                <p className="text-white font-semibold font-display">
                  {entityInfo.name}
                </p>
                <p className="text-xs text-brand mt-0.5">{roleLabel}</p>
              </div>
            </div>
          )}

          <SectionCard title="Foto de perfil">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-20 h-20 rounded-2xl object-cover border border-white/10"
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

          <SectionCard title="Información personal">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre y apellidos"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Sobre mí
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 300))}
                  rows={3}
                  placeholder="Describe tu experiencia como tutor, áreas en las que puedes orientar a los estudiantes..."
                  className="input-field resize-none"
                />
                <p className="text-xs text-gray-600 mt-1 text-right">
                  {bio.length}/300
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Especialidad / Área
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Desarrollo Web, Diseño..."
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Habilidades técnicas">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKey}
              placeholder="Añade áreas de conocimiento y pulsa Enter..."
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
                  Aún no has añadido áreas de conocimiento
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Perfil profesional">
            <div className="flex items-center gap-3">
              <span className="w-7 flex justify-center">
                <svg className="w-5 h-5" viewBox="0 0 640 640">
                  <use href="/icons.svg#icon-briefcase" />
                </svg>
              </span>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/tuusuario"
                  className="input-field text-sm"
                />
              </div>
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
