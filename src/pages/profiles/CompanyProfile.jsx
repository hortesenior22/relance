import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/layout/Header";
import InviteModal from "../../components/InviteModal";

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

export default function CompanyProfile() {
  const { user, refreshAvatar } = useAuth();
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // ── Avatar centralizado en tabla usuario ──
  const [avatarUrl, setAvatarUrl] = useState("");
  const [nombre, setNombre] = useState("");
  const [cif, setCif] = useState("");
  const [sector, setSector] = useState("");
  const [tamano, setTamano] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [web, setWeb] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    if (!user) return;
    const cargarPerfil = async () => {
      // Avatar y datos base vienen de usuario
      const { data: usuarioData } = await supabase
        .from("usuario")
        .select("id, email, nombre, avatar_url")
        .eq("id", user.id)
        .single();

      const { data: empresa, error: empresaError } = await supabase
        .from("empresa")
        .select("*")
        .eq("id_usuario", user.id)
        .maybeSingle();

      if (empresaError)
        console.error("Error al cargar empresa:", empresaError.message);

      setAvatarUrl(usuarioData?.avatar_url ?? "");

      if (empresa) {
        setNombre(empresa.nombre ?? usuarioData?.nombre ?? "");
        setCif(empresa.cif ?? "");
        setSector(empresa.sector ?? "");
        setTamano(empresa.tamano ?? "");
        setCiudad(empresa.ciudad ?? "");
        setWeb(empresa.web ?? "");
        setDescripcion(empresa.descripcion ?? "");
        setEmailContacto(
          empresa.email_contacto ?? usuarioData?.email ?? user.email ?? "",
        );
        setTelefono(empresa.telefono ?? "");
        setLinkedin(empresa.linkedin ?? "");
        setTwitter(empresa.twitter ?? "");
        setInstagram(empresa.instagram ?? "");
        setVerificado(empresa.verificado ?? false);
      } else {
        setNombre(usuarioData?.nombre ?? "");
        setEmailContacto(usuarioData?.email ?? user.email ?? "");
      }
    };
    cargarPerfil();
  }, [user]);

  // Avatar se guarda SOLO en usuario.avatar_url
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
      const freshUrl = `${data.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(freshUrl);
      await supabase
        .from("usuario")
        .update({ avatar_url: freshUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      await refreshAvatar?.();
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { error: usuarioError } = await supabase
        .from("usuario")
        .update({ nombre, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (usuarioError) throw usuarioError;

      // Sin logo_url — ese campo ya no existe en empresa
      const { error: empresaError } = await supabase.from("empresa").upsert(
        {
          id_usuario: user.id,
          nombre,
          cif,
          sector,
          tamano,
          ciudad,
          web,
          descripcion,
          email_contacto: emailContacto,
          telefono,
          linkedin,
          twitter,
          instagram,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id_usuario" },
      );
      if (empresaError) throw empresaError;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error al guardar:", err);
      setSaveError("No se pudieron guardar los cambios. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              Perfil de empresa
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Configura la información de tu empresa
            </p>
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
          <SectionCard title="Logo de empresa">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={nombre}
                    className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-dark border border-white/10 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-500"
                      viewBox="0 0 640 640"
                    >
                      <use href="/icons.svg#icon-building" />
                    </svg>
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
                  {nombre || "Tu empresa"}
                </p>
                <p className="text-gray-500 text-sm mb-3">{user?.email}</p>
                {verificado && (
                  <span className="inline-flex items-center gap-1 text-xs text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full mb-3">
                    ✓ Empresa verificada
                  </span>
                )}
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
                  Cambiar logo
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Información de la empresa">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1.5">
                  Nombre de la empresa *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Mi Empresa S.L."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  CIF
                </label>
                <input
                  type="text"
                  value={cif}
                  onChange={(e) => setCif(e.target.value)}
                  placeholder="B12345678"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Sector
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="input-field"
                >
                  <option value="">Seleccionar</option>
                  {[
                    "Tecnología",
                    "Marketing",
                    "Diseño",
                    "Finanzas",
                    "Salud",
                    "Educación",
                    "Comercio",
                    "Industria",
                    "Otro",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Tamaño
                </label>
                <select
                  value={tamano}
                  onChange={(e) => setTamano(e.target.value)}
                  className="input-field"
                >
                  <option value="">Seleccionar</option>
                  {["1–10", "11–50", "51–200", "201–500", "500+"].map((s) => (
                    <option key={s} value={s}>
                      {s} empleados
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="Madrid"
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1.5">
                  Sitio web
                </label>
                <input
                  type="url"
                  value={web}
                  onChange={(e) => setWeb(e.target.value)}
                  placeholder="https://miempresa.com"
                  className="input-field"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Descripción de la empresa">
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="Describe tu empresa, cultura, tecnologías que usáis y qué tipo de perfiles buscáis..."
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-600 mt-1 text-right">
              {descripcion.length}/500
            </p>
          </SectionCard>

          <SectionCard title="Datos de contacto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Email de contacto
                </label>
                <input
                  type="email"
                  value={emailContacto}
                  onChange={(e) => setEmailContacto(e.target.value)}
                  placeholder="rrhh@empresa.com"
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
                  placeholder="+34 900 000 000"
                  className="input-field"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Redes sociales">
            <div className="space-y-3">
              {[
                {
                  value: linkedin,
                  setter: setLinkedin,
                  icon: "icon-linkedin",
                  label: "LinkedIn",
                  placeholder: "https://linkedin.com/company/mi-empresa",
                },
                {
                  value: twitter,
                  setter: setTwitter,
                  icon: "icon-twitter",
                  label: "X / Twitter",
                  placeholder: "https://twitter.com/miempresa",
                },
                {
                  value: instagram,
                  setter: setInstagram,
                  icon: "icon-instagram",
                  label: "Instagram",
                  placeholder: "https://instagram.com/miempresa",
                },
              ].map(({ value, setter, icon, label, placeholder }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-7 flex justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 640 640">
                      <use href={`/icons.svg#${icon}`} />
                    </svg>
                  </span>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      {label}
                    </label>
                    <input
                      type="url"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Invitar tutores">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-brand" viewBox="0 0 640 640">
                  <use href="/icons.svg#icon-qrcode" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm mb-1">
                  Código QR de invitación
                </p>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">
                  Genera un enlace QR único que los tutores de la empresa puedan
                  escanear para registrarse en Relance vinculados
                  automáticamente a tu empresa. El enlace también se puede
                  enviar por correo o compartir manualmente. Caduca a los 7
                  días.
                </p>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Generar QR de invitación
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </main>
      {showInviteModal && (
        <InviteModal
          user={user}
          onClose={() => setShowInviteModal(false)}
          entityType="empresa"
          inviteRoute="/registro-tutor"
          expiresInHours={168}
          title="Invitar tutores de empresa"
          description="Genera un enlace QR para que los tutores se registren vinculados automáticamente a tu empresa."
          roleLabel="tutor de empresa"
          inviterName={nombre || "tu empresa"}
          extraParams={{ type: "empresa" }}
        />
      )}
    </div>
  );
}
