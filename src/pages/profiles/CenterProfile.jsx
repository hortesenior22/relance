import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/layout/Header";

// ── Modal QR ────────────────────────────────────────────────────────────────
function QRModal({ url, entityName, onClose }) {
  const [qrUrl, setQrUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

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
    a.download = `relance-tutor-qr-${entityName.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  return (
    <>
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
          <div className="flex gap-3 mb-3">
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
            <button
              onClick={() => setShowEmailModal(true)}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Enviar por correo
            </button>
          </div>
          <button onClick={onClose} className="btn-primary w-full">
            Cerrar
          </button>
          <p className="text-xs text-gray-600 mt-4">
            Válido durante <strong className="text-gray-500">7 días</strong>.
          </p>
        </div>
      </div>

      {showEmailModal && (
        <SendInviteEmailModal
          inviteUrl={url}
          inviterName={entityName}
          inviterType="centro_educativo"
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </>
  );
}

// ── Modal envío de invitación por correo ────────────────────────────────────
function SendInviteEmailModal({
  inviteUrl,
  inviterName,
  inviterType,
  onClose,
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const roleLabel =
    inviterType === "empresa"
      ? "tutor de empresa"
      : "tutor de centro educativo";

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: fnError } = await supabase.functions.invoke(
      "send-invite-email",
      {
        body: { to: email, inviterName, inviterType, inviteUrl },
      },
    );

    setLoading(false);
    if (fnError) {
      setError("No se pudo enviar el correo. Inténtalo de nuevo.");
    } else {
      setSent(true);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 60 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-card">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>

        <div className="flex justify-center mb-6">
          <div
            style={{
              display: "inline-block",
              background: "#c0ff72",
              borderRadius: "10px",
              padding: "6px 18px",
            }}
          >
            <span
              style={{
                color: "#0A0A0A",
                fontWeight: 800,
                fontSize: "18px",
                letterSpacing: "-0.5px",
              }}
            >
              Relance
            </span>
          </div>
        </div>

        {!sent ? (
          <>
            <div className="flex justify-center mb-4">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "rgba(192,255,114,0.12)",
                  border: "1px solid rgba(192,255,114,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                }}
              >
                👋
              </div>
            </div>
            <h2 className="font-display text-2xl font-bold text-white text-center mb-1">
              Enviar invitación por correo
            </h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              Escribe el correo del tutor al que quieres invitar a unirse a{" "}
              <strong style={{ color: "#c0ff72" }}>{inviterName}</strong> como{" "}
              <strong className="text-white">{roleLabel}</strong>.
            </p>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label
                  className="block text-sm text-gray-400 mb-1.5"
                  htmlFor="invite-email-centro"
                >
                  Correo electrónico del tutor
                </label>
                <input
                  id="invite-email-centro"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tutor@centro.edu.es"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Enlace de invitación
                </label>
                <div className="bg-dark border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-gray-500 text-xs truncate flex-1">
                    {inviteUrl}
                  </span>
                  <button
                    type="button"
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
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
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
                    Enviando...
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
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Enviar invitación →
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-600 text-center mt-4">
              El enlace caduca en{" "}
              <strong className="text-gray-500">7 días</strong>.
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "rgba(192,255,114,0.12)",
                  border: "1px solid rgba(192,255,114,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c0ff72"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">
              ¡Invitación enviada!
            </h2>
            <p className="text-gray-400 text-sm mb-1">
              Se ha enviado la invitación a{" "}
              <span style={{ color: "#c0ff72" }}>{email}</span>.
            </p>
            <p className="text-gray-500 text-xs mb-6">
              El tutor recibirá un correo con el enlace para registrarse
              vinculado a tu centro.
            </p>
            <button onClick={onClose} className="btn-primary w-full">
              Cerrar
            </button>
          </div>
        )}
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
export default function CenterProfile() {
  const { user, avatarUrl, refreshAvatar } = useAuth();
  const fileInputRef = useRef(null);
  const meta = user?.user_metadata ?? {};

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [generatingToken, setGeneratingToken] = useState(false);

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
                  automáticamente a tu centro. El enlace también se puede enviar
                  por correo o compartir manualmente. Caduca a los 7 días.
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
          entityName={centerName || "tu centro"}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
