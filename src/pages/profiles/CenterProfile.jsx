import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/layout/Header";

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
          <svg className="w-3.5 h-3.5 inline-block" viewBox="0 0 640 640">
            <use href="/icons.svg#icon-hourglass" />
          </svg>{" "}
          Válido durante <strong className="text-gray-500">7 días</strong>.
        </p>
      </div>
    </div>
  );
}

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

export default function CenterProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const meta = user?.user_metadata ?? {};

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [generatingToken, setGeneratingToken] = useState(false);

  const [logoUrl, setLogoUrl] = useState(null);
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
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setLogoUrl(data.logo_url);
        setCenterName(data.center_name ?? meta.centerName ?? "");
        setInstitutionalCode(
          data.institutional_code ?? meta.institutionalCode ?? "",
        );
        setCenterType(data.center_type ?? meta.centerType ?? "");
        setCity(data.city ?? meta.city ?? "");
        setProvince(data.province ?? meta.province ?? "");
        setWebsite(data.website ?? meta.website ?? "");
        setDescription(data.description ?? "");
        setEmail(data.contact_email ?? user.email ?? "");
        setPhone(data.phone ?? "");
        setStudentsCount(data.students_count ?? "");
        setDegreesOffered(data.degrees_offered ?? []);
      }
    };
    load();
  }, [user]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const { error } = await supabase.storage
      .from("profiles")
      .upload(`logos/${user.id}.${ext}`, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage
        .from("profiles")
        .getPublicUrl(`logos/${user.id}.${ext}`);
      setLogoUrl(data.publicUrl);
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
    await supabase.from("profiles").upsert({
      id: user.id,
      logo_url: logoUrl,
      center_name: centerName,
      institutional_code: institutionalCode,
      center_type: centerType,
      city,
      province,
      website,
      description,
      contact_email: email,
      phone,
      students_count: studentsCount,
      degrees_offered: degreesOffered,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleGenerateQR = async () => {
    setGeneratingToken(true);
    const token = crypto.randomUUID();
    await supabase
      .from("invite_tokens")
      .insert({
        token,
        entity_id: user.id,
        entity_type: "centro_educativo",
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
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
          <SectionCard title="Logo del centro">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
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

          {/* QR de invitación para tutores */}
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
          entityName={centerName || "tu centro"}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
