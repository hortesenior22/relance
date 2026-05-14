import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import MainLayout from "../../components/layout/MainLayout";

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="section-card">
      <p className="section-card-label">{title}</p>
      {children}
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TutorProfile() {
  const { user, userRole, avatarUrl, refreshAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const meta = user?.user_metadata ?? {};

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [fullName, setFullName] = useState<string>(meta.full_name ?? "");
  const [bio, setBio] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [specialty, setSpecialty] = useState<string>(meta.specialty ?? "");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState<string>("");
  const [linkedinUrl, setLinkedinUrl] = useState<string>("");
  const [entityInfo, setEntityInfo] = useState<{ name: string } | null>(null);

  const role = userRole ?? meta.role ?? "";
  const isCompanyTutor = role === "tutor_empresa";
  const roleLabel = isCompanyTutor
    ? "Tutor de empresa"
    : "Tutor de centro educativo";

  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  // ─── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;
    const isEmpresa = role === "tutor_empresa";
    const tutorTable = isEmpresa ? "tutor_empresa" : "tutor_centro";
    const entityFk = isEmpresa ? "empresa_id" : "centro_id";

    const load = async () => {
      const { data } = await supabase
        .from(tutorTable)
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setFullName(data.nombre ?? meta.full_name ?? "");
        setBio(data.bio ?? "");
        setPhone(data.telefono ?? "");
        setSpecialty(
          isEmpresa ? (data.cargo ?? "") : (data.departamento ?? ""),
        );
        setSkills(data.habilidades ?? []);
        setLinkedinUrl(data.linkedin ?? "");
      } else {
        setFullName(meta.full_name ?? "");
        setSpecialty(meta.specialty ?? "");
      }

      const entityId = data?.[entityFk] ?? meta.entity_id;
      if (entityId) {
        if (isEmpresa) {
          const { data: emp } = await supabase
            .from("empresa")
            .select("nombre")
            .eq("id_usuario", entityId)
            .maybeSingle();
          if (emp) setEntityInfo({ name: emp.nombre || "Empresa" });
        } else {
          const { data: cen } = await supabase
            .from("centro_educativo")
            .select("nombre")
            .eq("id_centro", entityId)
            .maybeSingle();
          if (cen) setEntityInfo({ name: cen.nombre || "Centro" });
        }
      }
    };
    load();
  }, [user, userRole]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error } = await supabase.storage
      .from("profiles")
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("profiles").getPublicUrl(path);
      await supabase
        .from("usuario")
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      await refreshAvatar();
    }
    setUploading(false);
  };

  const handleSkillKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    const isEmpresa = role === "tutor_empresa";
    const tutorTable = isEmpresa ? "tutor_empresa" : "tutor_centro";

    const payload = isEmpresa
      ? {
          id: user.id,
          nombre: fullName,
          bio,
          telefono: phone,
          cargo: specialty,
          habilidades: skills,
          linkedin: linkedinUrl,
          updated_at: new Date().toISOString(),
        }
      : {
          id: user.id,
          nombre: fullName,
          bio,
          telefono: phone,
          departamento: specialty,
          habilidades: skills,
          linkedin: linkedinUrl,
          updated_at: new Date().toISOString(),
        };

    await supabase.from(tutorTable).upsert(payload, { onConflict: "id" });
    await supabase
      .from("usuario")
      .update({ nombre: fullName, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <MainLayout>
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "3rem 1.25rem",
        }}
      >
        {/* ── Page header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "2rem",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "1.875rem",
                fontWeight: 800,
                color: "var(--color-text)",
                marginBottom: "0.375rem",
                lineHeight: 1.15,
              }}
            >
              Mi perfil
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Role dot */}
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: isCompanyTutor ? "var(--color-brand)" : "#63b3ed",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "0.875rem",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                {roleLabel}
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: saving ? 0.6 : 1,
              flexShrink: 0,
            }}
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin"
                  style={{ width: 15, height: 15 }}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    style={{ opacity: 0.25 }}
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    style={{ opacity: 0.75 }}
                  />
                </svg>
                Guardando…
              </>
            ) : saved ? (
              <>
                <svg
                  style={{ width: 15, height: 15 }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Guardado
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* ── Entidad vinculada ── */}
          {entityInfo && (
            <div
              style={{
                background: "rgba(192,255,114,0.04)",
                border: "1px solid rgba(192,255,114,0.14)",
                borderRadius: "1rem",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "0.75rem",
                  background: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isCompanyTutor ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-brand)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-4 0v2" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#63b3ed"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                )}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted)",
                    marginBottom: 2,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Vinculado a
                </p>
                <p
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    color: "var(--color-text)",
                    fontSize: "1rem",
                  }}
                >
                  {entityInfo.name}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-brand)",
                    marginTop: 2,
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {roleLabel}
                </p>
              </div>
            </div>
          )}

          {/* ── Avatar ── */}
          <SectionCard title="Foto de perfil">
            <div
              style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
            >
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: "0.875rem",
                      objectFit: "cover",
                      border: "1px solid var(--color-border-strong)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: "0.875rem",
                      background: "var(--color-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 800,
                      fontSize: "1.5rem",
                      color: "var(--color-bg)",
                    }}
                  >
                    {initials || "?"}
                  </div>
                )}
                {uploading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "0.875rem",
                      background: "rgba(3,8,15,0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      className="animate-spin"
                      style={{
                        width: 20,
                        height: 20,
                        color: "var(--color-brand)",
                      }}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        style={{ opacity: 0.25 }}
                      />
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        style={{ opacity: 0.75 }}
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info + upload */}
              <div>
                <p
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    color: "var(--color-text)",
                    fontSize: "1.1rem",
                    marginBottom: 2,
                  }}
                >
                  {fullName || "Sin nombre"}
                </p>
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.8rem",
                    marginBottom: "0.875rem",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {user?.email}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "0.375rem 0.875rem" }}
                >
                  Cambiar foto
                </button>
              </div>
            </div>
          </SectionCard>

          {/* ── Info personal ── */}
          <SectionCard title="Información personal">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.375rem",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
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
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.375rem",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  Sobre mí
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 300))}
                  rows={3}
                  placeholder="Describe tu experiencia como tutor, áreas en las que puedes orientar a los estudiantes…"
                  className="input-field"
                  style={{ resize: "none" }}
                />
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-subtle)",
                    textAlign: "right",
                    marginTop: "0.25rem",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  {bio.length}/300
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.375rem",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
                    {isCompanyTutor ? "Cargo" : "Departamento"}
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Desarrollo Web, Diseño…"
                    className="input-field"
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.375rem",
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                    }}
                  >
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

          {/* ── Habilidades ── */}
          <SectionCard title="Áreas de conocimiento">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKey}
              placeholder="Escribe un área y pulsa Enter…"
              className="input-field"
              style={{ marginBottom: "0.875rem" }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {skills.map((s) => (
                <span
                  key={s}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    background: "rgba(192,255,114,0.08)",
                    border: "1px solid rgba(192,255,114,0.2)",
                    color: "var(--color-brand)",
                    fontSize: "0.8125rem",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "9999px",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {s}
                  <button
                    onClick={() => setSkills(skills.filter((x) => x !== s))}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(192,255,114,0.45)",
                      lineHeight: 1,
                      fontSize: "1rem",
                      padding: 0,
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color =
                        "var(--color-brand)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color =
                        "rgba(192,255,114,0.45)")
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <p
                  style={{
                    color: "var(--color-text-subtle)",
                    fontSize: "0.875rem",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  Aún no has añadido áreas de conocimiento
                </p>
              )}
            </div>
          </SectionCard>

          {/* ── LinkedIn ── */}
          <SectionCard title="Perfil profesional">
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}
            >
              {/* LinkedIn icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "0.5rem",
                  background: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="var(--color-text-muted)"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.25rem",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                  }}
                >
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/tuusuario"
                  className="input-field"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </MainLayout>
  );
}
