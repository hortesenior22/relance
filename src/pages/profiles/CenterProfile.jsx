import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/layout/Header";

/* ─── QR Modal ──────────────────────────────────────────────────────────── */
function QRModal({ url, entityName, onClose }) {
  const [qrUrl, setQrUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generate = async () => {
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
              bodyColor: "#c0ff72",
              bgColor: "#0A0A0A",
              eye1Color: "#c0ff72",
              eye2Color: "#c0ff72",
              eye3Color: "#c0ff72",
              eyeBall1Color: "#0A0A0A",
              eyeBall2Color: "#0A0A0A",
              eyeBall3Color: "#0A0A0A",
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
    generate();
  }, [url]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `relance-centro-qr-${entityName.replace(/\s+/g, "-").toLowerCase()}.png`;
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
          Comparte este QR para que los tutores del centro{" "}
          <strong className="text-white">{entityName}</strong> se registren
          vinculados automáticamente.
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
              <img src={qrUrl} alt="QR" className="w-48 h-48 rounded-xl" />
            </div>
          )}
        </div>
        <div className="bg-dark border border-white/10 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
          <span className="text-gray-500 text-xs truncate flex-1 text-left">
            {url}
          </span>
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${copied ? "bg-brand/20 text-brand" : "bg-white/10 text-gray-400 hover:text-white"}`}
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
        <p className="text-xs text-gray-600 mt-4 flex items-center gap-1">
          Válido durante <strong className="text-gray-500">7 días</strong>.
        </p>
      </div>
    </div>
  );
}

/* ─── Section Card ───────────────────────────────────────────────────────── */
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

/* ─── CenterProfile ──────────────────────────────────────────────────────── */
export default function CenterProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [generatingToken, setGeneratingToken] = useState(false);

  // ── Campos del formulario (mapeados a columnas de centro_educativo) ──
  const [logoUrl, setLogoUrl] = useState("");
  const [nombre, setNombre] = useState("");
  const [codigoInstitucional, setCodigoInstitucional] = useState("");
  const [tipoCentro, setTipoCentro] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [sitioWeb, setSitioWeb] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [numAlumnos, setNumAlumnos] = useState("");
  const [titulaciones, setTitulaciones] = useState([]);
  const [titulacionInput, setTitulacionInput] = useState("");
  const [verificado, setVerificado] = useState(false);

  // ── Carga de datos desde Supabase ────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const cargarPerfil = async () => {
      // 1. Obtenemos el id de la fila en centro_educativo a través de la
      //    tabla genérica "usuario" (la FK es usuario.id = centro_educativo.id)
      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuario")
        .select("id, email, nombre")
        .eq("id", user.id)
        .single();

      if (usuarioError) {
        console.error("Error al cargar usuario:", usuarioError.message);
        return;
      }

      // 2. Cargamos los datos específicos del centro
      const { data: centro, error: centroError } = await supabase
        .from("centro_educativo")
        .select("*")
        .eq("id", user.id)
        .single();

      if (centroError && centroError.code !== "PGRST116") {
        // PGRST116 = no rows → perfil aún no creado, es normal
        console.error("Error al cargar centro_educativo:", centroError.message);
        return;
      }

      if (centro) {
        setNombre(centro.nombre ?? usuarioData?.nombre ?? "");
        setCodigoInstitucional(centro.codigo_institucional ?? "");
        setEmailContacto(
          centro.email_contacto ?? usuarioData?.email ?? user.email ?? "",
        );
        setTelefono(centro.telefono ?? "");
        // Campos nuevos añadidos por la migración
        setTipoCentro(centro.tipo_centro ?? "");
        setCiudad(centro.ciudad ?? "");
        setProvincia(centro.provincia ?? "");
        setSitioWeb(centro.sitio_web ?? "");
        setDescripcion(centro.descripcion ?? "");
        setNumAlumnos(centro.num_alumnos ?? "");
        setTitulaciones(centro.titulaciones ?? []);
        setLogoUrl(centro.logo_url ?? "");
        setVerificado(centro.verificado ?? false);
      } else {
        // Sin fila aún: pre-rellenar con datos de Auth
        setEmailContacto(usuarioData?.email ?? user.email ?? "");
        setNombre(usuarioData?.nombre ?? "");
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
    const path = `logos/centros/${user.id}.${ext}`;
    const { error } = await supabase.storage
      .from("profiles")
      .upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("profiles").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
    }
    setUploading(false);
  };

  // ── Gestión de titulaciones (tags) ───────────────────────────────────
  const handleTitulacionKey = (e) => {
    if (e.key === "Enter" && titulacionInput.trim()) {
      e.preventDefault();
      const nueva = titulacionInput.trim();
      if (!titulaciones.includes(nueva))
        setTitulaciones([...titulaciones, nueva]);
      setTitulacionInput("");
    }
  };

  // ── Guardar en Supabase ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);

    try {
      // 1. Actualizar la tabla genérica "usuario" (nombre)
      const { error: usuarioError } = await supabase
        .from("usuario")
        .update({
          nombre: nombre,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (usuarioError) throw usuarioError;

      // 2. Upsert en centro_educativo
      //    - La columna "id" es la FK que apunta al usuario
      const { error: centroError } = await supabase
        .from("centro_educativo")
        .upsert(
          {
            id: user.id,
            nombre: nombre,
            codigo_institucional: codigoInstitucional,
            email_contacto: emailContacto,
            telefono: telefono,
            // Campos añadidos por la migración:
            tipo_centro: tipoCentro,
            ciudad: ciudad,
            provincia: provincia,
            sitio_web: sitioWeb,
            descripcion: descripcion,
            num_alumnos: numAlumnos !== "" ? Number(numAlumnos) : null,
            titulaciones: titulaciones,
            logo_url: logoUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      if (centroError) throw centroError;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      // console.error("Error al guardar:", err.message);
      console.error("Error completo:", err);
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
      entity_type: "centro_educativo",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      used: false,
    });
    setInviteUrl(
      `${window.location.origin}/registro-tutor?token=${token}&entity=${user.id}&type=centro_educativo`,
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

        {/* Error de guardado */}
        {saveError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {saveError}
          </div>
        )}

        <div className="space-y-6">
          {/* Logo */}
          <SectionCard title="Logo del centro">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={nombre}
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
                  {nombre || "Tu centro"}
                </p>
                <p className="text-gray-500 text-sm mb-3">{user?.email}</p>
                {verificado && (
                  <span className="inline-flex items-center gap-1 text-xs text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full mb-3">
                    ✓ Centro verificado
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

          {/* Información del centro */}
          <SectionCard title="Información del centro">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1.5">
                  Nombre del centro *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
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
                  value={codigoInstitucional}
                  onChange={(e) => setCodigoInstitucional(e.target.value)}
                  placeholder="IES-COR-2026"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Tipo de centro
                </label>
                <select
                  value={tipoCentro}
                  onChange={(e) => setTipoCentro(e.target.value)}
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
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
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
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                  placeholder="Córdoba"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  N.º de alumnos aprox.
                </label>
                <input
                  type="number"
                  value={numAlumnos}
                  onChange={(e) => setNumAlumnos(e.target.value)}
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
                  value={sitioWeb}
                  onChange={(e) => setSitioWeb(e.target.value)}
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
              value={titulacionInput}
              onChange={(e) => setTitulacionInput(e.target.value)}
              onKeyDown={handleTitulacionKey}
              placeholder="Escribe una titulación y pulsa Enter (DAM, DAW, ASIR...)"
              className="input-field mb-3"
            />
            <div className="flex flex-wrap gap-2">
              {titulaciones.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 text-brand text-sm px-3 py-1 rounded-full"
                >
                  {t}
                  <button
                    onClick={() =>
                      setTitulaciones(titulaciones.filter((x) => x !== t))
                    }
                    className="text-brand/60 hover:text-brand"
                  >
                    ×
                  </button>
                </span>
              ))}
              {titulaciones.length === 0 && (
                <p className="text-gray-600 text-sm">
                  Aún no has añadido titulaciones
                </p>
              )}
            </div>
          </SectionCard>

          {/* Descripción */}
          <SectionCard title="Descripción del centro">
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value.slice(0, 500))}
              rows={4}
              placeholder="Describe el centro, su especialización, proyectos destacados y qué tipo de empresas suelen colaborar..."
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-600 mt-1 text-right">
              {descripcion.length}/500
            </p>
          </SectionCard>

          {/* Datos de contacto */}
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
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+34 900 000 000"
                  className="input-field"
                />
              </div>
            </div>
          </SectionCard>

          {/* QR de invitación */}
          <SectionCard title="Invitar tutores de centro">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-brand" viewBox="0 0 640 640">
                  <use href="/icons.svg#icon-qrcode" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm mb-1">
                  Código QR de invitación para tutores
                </p>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">
                  Genera un enlace QR único que los tutores del centro puedan
                  escanear para registrarse en Relance vinculados
                  automáticamente a tu centro. Caduca a los 7 días.
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
          entityName={nombre || "tu centro"}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
