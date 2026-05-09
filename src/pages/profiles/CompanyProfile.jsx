import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/layout/Header";
import InviteModal from "../../components/InviteModal";

// ── Sección helper ──────────────────────────────────────────────────────────
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

// ── Página principal ────────────────────────────────────────────────────────
export default function CenterProfile() {
  const { user, avatarUrl, refreshAvatar } = useAuth();
  const fileInputRef = useRef(null);
  const meta = user?.user_metadata ?? {};

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [centerName, setCenterName] = useState(meta.centerName ?? "");
  const [institutionalCode, setInstitutionalCode] = useState(
    meta.institutionalCode ?? "",
  );
  const [centerType, setCenterType] = useState(meta.centerType ?? "");
  const [city, setCity] = useState(meta.city ?? "");
  const [province, setProvince] = useState(meta.province ?? "");
  const [website, setWebsite] = useState(meta.website ?? "");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentsCount, setStudentsCount] = useState("");
  const [degreesOffered, setDegreesOffered] = useState([]);
  const [degreeInput, setDegreeInput] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("centro_educativo")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) console.error("[CenterProfile] Error cargando datos:", error);
      if (data) {
        setCenterName(data.nombre ?? meta.centerName ?? "");
        setInstitutionalCode(
          data.codigo_institucional ?? meta.institutionalCode ?? "",
        );
        setCenterType(data.tipo_centro ?? meta.centerType ?? "");
        setCity(data.ciudad ?? meta.city ?? "");
        setProvince(data.provincia ?? "");
        setWebsite(data.sitio_web ?? meta.website ?? "");
        setDescription(data.descripcion ?? "");
        setEmail(data.email_contacto ?? user.email ?? "");
        setPhone(data.telefono ?? "");
        setStudentsCount(data.num_alumnos ?? "");
        setDegreesOffered(data.titulaciones ?? []);
      } else {
        setCenterName(meta.centerName ?? "");
        setInstitutionalCode(meta.institutionalCode ?? "");
        setCenterType(meta.centerType ?? "");
        setCity(meta.city ?? "");
        setProvince(meta.province ?? "");
        setEmail(user.email ?? "");
      }
    };
    load();
  }, [user]);

  const handleLogoUpload = async (e) => {
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

  const handleDegreeKey = (e) => {
    if (e.key === "Enter" && degreeInput.trim()) {
      e.preventDefault();
      if (!degreesOffered.includes(degreeInput.trim()))
        setDegreesOffered([...degreesOffered, degreeInput.trim()]);
      setDegreeInput("");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error: centroError } = await supabase
      .from("centro_educativo")
      .upsert(
        {
          id: user.id,
          nombre: centerName,
          codigo_institucional: institutionalCode,
          tipo_centro: centerType,
          ciudad: city,
          provincia: province,
          sitio_web: website,
          descripcion: description,
          email_contacto: email,
          telefono: phone,
          num_alumnos: studentsCount !== "" ? Number(studentsCount) : null,
          titulaciones: degreesOffered,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    if (centroError)
      console.error("[CenterProfile] Error guardando:", centroError);
    await supabase
      .from("usuario")
      .update({ nombre: centerName, updated_at: new Date().toISOString() })
      .eq("id", user.id);
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
              Perfil del centro
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Configura la información de tu centro educativo
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

        <div className="space-y-6">
          {/* Logo */}
          <SectionCard title="Logo del centro">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={centerName}
                    className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-dark border border-white/10 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-500"
                      viewBox="0 0 640 640"
                    >
                      <use href="/icons.svg#icon-school" />
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
                  {centerName || "Tu centro"}
                </p>
                <p className="text-gray-500 text-sm mb-3">{user?.email}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
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

          {/* Info centro */}
          <SectionCard title="Información del centro">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1.5">
                  Nombre del centro *
                </label>
                <input
                  type="text"
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  placeholder="IES Nombre del Centro"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Código institucional
                </label>
                <input
                  type="text"
                  value={institutionalCode}
                  onChange={(e) => setInstitutionalCode(e.target.value)}
                  placeholder="IES-MAD-2024"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Tipo de centro
                </label>
                <select
                  value={centerType}
                  onChange={(e) => setCenterType(e.target.value)}
                  className="input-field"
                >
                  <option value="">Seleccionar</option>
                  {[
                    "IES",
                    "FP",
                    "Universidad",
                    "Centro privado",
                    "Academia",
                    "Otro",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
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
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  N.º de alumnos aprox.
                </label>
                <input
                  type="number"
                  value={studentsCount}
                  onChange={(e) => setStudentsCount(e.target.value)}
                  placeholder="300"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Sitio web
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://iesejemplo.edu.es"
                  className="input-field"
                />
              </div>
            </div>
          </SectionCard>

          {/* Titulaciones */}
          <SectionCard title="Ciclos / Titulaciones ofertadas">
            <input
              type="text"
              value={degreeInput}
              onChange={(e) => setDegreeInput(e.target.value)}
              onKeyDown={handleDegreeKey}
              placeholder="Escribe una titulación y pulsa Enter (DAM, DAW, ASIR...)"
              className="input-field mb-3"
            />
            <div className="flex flex-wrap gap-2">
              {degreesOffered.map((d) => (
                <span
                  key={d}
                  className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 text-brand text-sm px-3 py-1 rounded-full"
                >
                  {d}
                  <button
                    onClick={() =>
                      setDegreesOffered(degreesOffered.filter((x) => x !== d))
                    }
                    className="text-brand/60 hover:text-brand"
                  >
                    ×
                  </button>
                </span>
              ))}
              {degreesOffered.length === 0 && (
                <p className="text-gray-600 text-sm">
                  Aún no has añadido titulaciones
                </p>
              )}
            </div>
          </SectionCard>

          {/* Descripción */}
          <SectionCard title="Descripción del centro">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="Describe el centro, su especialización, proyectos destacados y qué tipo de empresas suelen colaborar..."
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-600 mt-1 text-right">
              {description.length}/500
            </p>
          </SectionCard>

          {/* Contacto */}
          <SectionCard title="Datos de contacto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Email de contacto
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="secretaria@centro.edu.es"
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
                  placeholder="+34 900 000 000"
                  className="input-field"
                />
              </div>
            </div>
          </SectionCard>

          {/* Invitar tutores */}
          <SectionCard title="Invitar tutores de centro">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-brand"
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
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm mb-1">
                  Código QR de invitación para tutores
                </p>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">
                  Genera un enlace QR único que los tutores del centro puedan
                  escanear para registrarse en Relance vinculados
                  automáticamente a tu centro. El enlace también se puede enviar
                  por correo o compartir manualmente. Caduca a los 7 días.
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
          entityType="centro_educativo"
          inviteRoute="/registro-tutor"
          expiresInHours={168}
          title="Invitar tutores de centro"
          description="Genera un enlace QR para que los tutores se registren vinculados automáticamente a tu centro."
          roleLabel="tutor de centro educativo"
          inviterName={centerName || "tu centro"}
          extraParams={{ type: "centro_educativo" }}
        />
      )}
    </div>
  );
}
