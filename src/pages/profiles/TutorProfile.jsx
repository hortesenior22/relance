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
  const { user, userRole } = useAuth();
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Campos comunes
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Campo específico por rol
  const [cargoODepartamento, setCargoODepartamento] = useState("");

  // Info de la entidad vinculada
  const [entityInfo, setEntityInfo] = useState(null);

  const isCompanyTutor = userRole === "tutor_empresa";
  const roleLabel = isCompanyTutor
    ? "Tutor de empresa"
    : "Tutor de centro educativo";
  const roleIcon = isCompanyTutor ? "icon-building" : "icon-school";
  const fieldLabel = isCompanyTutor ? "Cargo" : "Departamento";
  const fieldPlaceholder = isCompanyTutor
    ? "Ej: Responsable de RRHH"
    : "Ej: Informática";

  const initials = nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  // ── Carga de datos ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !userRole) return;

    const load = async () => {
      const { data: usuarioData } = await supabase
        .from("usuario")
        .select("avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (usuarioData?.avatar_url) setAvatarUrl(usuarioData.avatar_url);

      if (isCompanyTutor) {
        const { data } = await supabase
          .from("tutor_empresa")
          .select("nombre, telefono, cargo, empresa_id")
          .eq("id", user.id)
          .maybeSingle();

        if (data) {
          setNombre(data.nombre ?? "");
          setTelefono(data.telefono ?? "");
          setCargoODepartamento(data.cargo ?? "");

          // Cargar nombre de la empresa
          if (data.empresa_id) {
            const { data: emp } = await supabase
              .from("empresa")
              .select("nombre, logo_url")
              .eq("id", data.empresa_id)
              .maybeSingle();
            if (emp) setEntityInfo({ name: emp.nombre, logo: emp.logo_url });
          }
        }
      } else {
        const { data } = await supabase
          .from("tutor_centro")
          .select("nombre, telefono, departamento, centro_id")
          .eq("id", user.id)
          .maybeSingle();

        if (data) {
          setNombre(data.nombre ?? "");
          setTelefono(data.telefono ?? "");
          setCargoODepartamento(data.departamento ?? "");

          // Cargar nombre del centro
          if (data.centro_id) {
            const { data: centro } = await supabase
              .from("centro_educativo")
              .select("nombre, logo_url")
              .eq("id", data.centro_id)
              .maybeSingle();
            if (centro)
              setEntityInfo({ name: centro.nombre, logo: centro.logo_url });
          }
        }
      }
    };

    load();
  }, [user, userRole]);

  // ── Subida de avatar ─────────────────────────────────────────────────
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/tutores/${user.id}.${ext}`;
    const { error } = await supabase.storage
      .from("profiles")
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("profiles").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    }
    setUploading(false);
  };

  // ── Guardar ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);

    try {
      // 1. Actualizar nombre en tabla usuario
      const { error: usuarioError } = await supabase
        .from("usuario")
        .update({
          nombre,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (usuarioError) throw usuarioError;

      // 2. Upsert en la tabla de tutor correspondiente
      if (isCompanyTutor) {
        const { error } = await supabase
          .from("tutor_empresa")
          .upsert(
            { id: user.id, nombre, telefono, cargo: cargoODepartamento },
            { onConflict: "id" },
          );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("tutor_centro")
          .upsert(
            { id: user.id, nombre, telefono, departamento: cargoODepartamento },
            { onConflict: "id" },
          );
        if (error) throw error;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error al guardar tutor:", err);
      setSaveError("No se pudieron guardar los cambios. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              Mi perfil
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 640 640">
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

        {saveError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {saveError}
          </div>
        )}

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
                <div className="w-12 h-12 rounded-xl bg-dark flex items-center justify-center border border-white/10">
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 640 640">
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

          {/* Foto */}
          <SectionCard title="Foto de perfil">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={nombre}
                    className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-brand flex items-center justify-center text-dark font-display font-bold text-2xl">
                    {initials || "?"}
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
                  {nombre || "Tu nombre"}
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

          {/* Información personal */}
          <SectionCard title="Información personal">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre y apellidos"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    {fieldLabel}
                  </label>
                  <input
                    type="text"
                    value={cargoODepartamento}
                    onChange={(e) => setCargoODepartamento(e.target.value)}
                    placeholder={fieldPlaceholder}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
