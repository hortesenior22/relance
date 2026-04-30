import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/layout/Header";

// ── Componente QR Modal ─────────────────────────────────────────────────────
function QRModal({ url, entityName, onClose }) {
  const [qrUrl, setQrUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      setLoadingQr(true);
      try {
        const res = await fetch("https://api.qrcode-monkey.com/qr/custom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: url,
            config: {
              body: "round",
              eye: "frame1",
              eyeBall: "ball1",
              erf1: [],
              erf2: [],
              erf3: [],
              brf1: [],
              brf2: [],
              brf3: [],
              bodyColor: "#c0ff72",
              bgColor: "#0A0A0A",
              eye1Color: "#c0ff72",
              eye2Color: "#c0ff72",
              eye3Color: "#c0ff72",
              eyeBall1Color: "#0A0A0A",
              eyeBall2Color: "#0A0A0A",
              eyeBall3Color: "#0A0A0A",
              gradientColor1: "",
              gradientColor2: "",
              gradientType: "linear",
              gradientOnEyes: "true",
              logo: "",
              logoMode: "default",
            },
            size: 400,
            download: false,
            file: "png",
          }),
        });
        const blob = await res.blob();
        setQrUrl(URL.createObjectURL(blob));
      } catch {
        setQrUrl(
          `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}&bgcolor=0A0A0A&color=c0ff72&margin=20`,
        );
      }
      setLoadingQr(false);
    };
    generateQR();
    return () => {
      if (qrUrl?.startsWith("blob:")) URL.revokeObjectURL(qrUrl);
    };
  }, [url]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `relance-tutor-qr-${entityName.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>

        <h2 className="font-display text-xl font-bold text-white mb-1">
          Código QR de invitación
        </h2>
        <p className="text-gray-500 text-sm mb-5">
          Comparte este QR para que los tutores de{" "}
          <strong className="text-white">{entityName}</strong> se registren
          directamente vinculados a tu empresa.
        </p>

        <div className="flex items-center justify-center mb-5">
          {loadingQr ? (
            <div className="w-48 h-48 bg-dark rounded-2xl flex items-center justify-center border border-white/10">
              <svg
                className="animate-spin w-8 h-8 text-brand"
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
          ) : (
            <div className="p-3 bg-dark rounded-2xl border border-brand/20">
              <img
                src={qrUrl}
                alt="QR de invitación"
                className="w-48 h-48 rounded-xl"
              />
            </div>
          )}
        </div>

        <div className="bg-dark border border-white/10 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
          <span className="text-gray-500 text-xs truncate flex-1 text-left">
            {url}
          </span>
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
              copied
                ? "bg-brand/20 text-brand"
                : "bg-white/10 text-gray-400 hover:text-white hover:bg-white/15"
            }`}
          >
            {copied ? "✓ Copiado" : "Copiar"}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={loadingQr}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar QR
          </button>
          <button onClick={onClose} className="btn-primary flex-1">
            Cerrar
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-4">
          <svg className="w-3.5 h-3.5 inline-block mr-1" viewBox="0 0 640 640">
            <use href="/icons.svg#icon-hourglass" />
          </svg>{" "}
          Los enlaces de invitación caducan a los{" "}
          <strong className="text-gray-500">7 días</strong>. Genera uno nuevo
          cuando sea necesario.
        </p>
      </div>
    </div>
  );
}

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
export default function CompanyProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [generatingToken, setGeneratingToken] = useState(false);

  // ── Campos del formulario (mapeados a columnas de empresa) ──
  const [logoUrl, setLogoUrl] = useState("");
  const [nombre, setNombre] = useState("");
  const [cif, setCif] = useState("");
  const [sector, setSector] = useState("");
  const [tamano, setTamano] = useState(""); // columna nueva: tamano
  const [ciudad, setCiudad] = useState("");
  const [web, setWeb] = useState(""); // columna: web
  const [descripcion, setDescripcion] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [linkedin, setLinkedin] = useState(""); // columnas planas
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [verificado, setVerificado] = useState(false);

  // ── Carga de datos desde Supabase ────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const cargarPerfil = async () => {
      // 1. Datos base del usuario (tabla genérica)
      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuario")
        .select("id, email, nombre")
        .eq("id", user.id)
        .single();

      if (usuarioError) {
        console.error("Error al cargar usuario:", usuarioError.message);
        return;
      }

      // 2. Datos específicos de empresa
      //    La FK es id → usuario.id
      const { data: empresa, error: empresaError } = await supabase
        .from("empresa")
        .select("*")
        .eq("id", user.id)
        .single();

      if (empresaError && empresaError.code !== "PGRST116") {
        console.error("Error al cargar empresa:", empresaError.message);
        return;
      }

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
        setLogoUrl(empresa.logo_url ?? "");
        setLinkedin(empresa.linkedin ?? "");
        setTwitter(empresa.twitter ?? "");
        setInstagram(empresa.instagram ?? "");
        setVerificado(empresa.verificado ?? false);
      } else {
        // Sin fila aún: pre-rellenar con datos de Auth
        setNombre(usuarioData?.nombre ?? "");
        setEmailContacto(usuarioData?.email ?? user.email ?? "");
      }
    };

    cargarPerfil();
  }, [user]);

  // ── Subida de logo ───────────────────────────────────────────────────
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `logos/empresas/${user.id}.${ext}`;
    const { error } = await supabase.storage
      .from("profiles")
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("profiles").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
    }
    setUploading(false);
  };

  // ── Guardar en Supabase ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);

    try {
      // 1. Actualizar nombre en la tabla genérica "usuario"
      const { error: usuarioError } = await supabase
        .from("usuario")
        .update({
          nombre: nombre,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (usuarioError) throw usuarioError;

      // 2. Upsert en empresa
      //    La FK es id (no "id" como en centro_educativo)
      const { error: empresaError } = await supabase.from("empresa").upsert(
        {
          id: user.id,
          nombre,
          cif,
          sector,
          tamano,
          ciudad,
          web,
          descripcion,
          email_contacto: emailContacto,
          telefono,
          logo_url: logoUrl,
          linkedin,
          twitter,
          instagram,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (empresaError) throw empresaError;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error al guardar:", err.message);
      setSaveError("No se pudieron guardar los cambios. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  // ── Generar QR de invitación ─────────────────────────────────────────
  const handleGenerateQR = async () => {
    setGeneratingToken(true);
    const token = crypto.randomUUID();
    await supabase.from("invite_tokens").insert({
      token,
      entity_id: user.id,
      entity_type: "empresa",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      used: false,
    });
    setInviteUrl(
      `${window.location.origin}/registro-tutor?token=${token}&entity=${user.id}&type=empresa`,
    );
    setGeneratingToken(false);
    setShowQR(true);
  };

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark">
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Cabecera */}
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

        {/* Error de guardado */}
        {saveError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {saveError}
          </div>
        )}

        <div className="space-y-6">
          {/* Logo */}
          <SectionCard title="Logo de empresa">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={nombre}
                    className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-dark border border-white/10 flex items-center justify-center text-4xl">
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

          {/* Información básica */}
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

          {/* Descripción */}
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

          {/* Contacto */}
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

          {/* Redes sociales */}
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
                  <span className="text-xl w-7 text-center">
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

          {/* QR de invitación */}
          <SectionCard title="Invitar tutores">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-2xl">
                <svg className="w-6 h-6 text-brand" viewBox="0 0 640 640">
                  <use href="/icons.svg#icon-qrcode" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm mb-1">
                  Código QR de invitación
                </p>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">
                  Genera un código QR único para que los tutores de tu empresa
                  se registren en Relance directamente vinculados a tu cuenta.
                  El enlace también se puede compartir manualmente. Caduca a los
                  7 días.
                </p>
                <button
                  onClick={handleGenerateQR}
                  disabled={generatingToken}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {generatingToken ? (
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
                      Generando...
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </main>

      {showQR && (
        <QRModal
          url={inviteUrl}
          entityName={nombre || "tu empresa"}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
