// components/InviteModal.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// ── Sub-modal: enviar por correo ─────────────────────────────────────────────
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
    if (fnError) setError("No se pudo enviar el correo. Inténtalo de nuevo.");
    else setSent(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      style={{ zIndex: 60 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md relative p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>

        {!sent ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-brand"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-1">
              Enviar invitación por correo
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Escribe el correo de la persona que quieres invitar a unirse como{" "}
              <strong className="text-white">{inviterType}</strong>.
            </p>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="persona@ejemplo.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Enlace de invitación
                </label>
                <div className="bg-dark border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-gray-500 text-xs truncate flex-1 font-mono">
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
                className="btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-60"
              >
                {loading ? "Enviando..." : "Enviar invitación →"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-green-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">
              ¡Invitación enviada!
            </h2>
            <p className="text-gray-400 text-sm mb-1">
              Se ha enviado la invitación a{" "}
              <span className="text-brand">{email}</span>.
            </p>
            <p className="text-gray-500 text-xs mb-6">
              Recibirá un correo con el enlace para registrarse.
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

// ── Componente principal ─────────────────────────────────────────────────────
/**
 * InviteModal — modal genérico de invitación para cualquier rol
 *
 * Props:
 * @param {object}   user           — usuario autenticado (de useAuth)
 * @param {function} onClose        — cierra el modal
 *
 * @param {string}   entityType     — valor guardado en invite_tokens.entity_type
 *                                    Ej: "admin" | "tutor_empresa" | "tutor_centro"
 * @param {string}   inviteRoute    — ruta relativa del registro
 *                                    Ej: "/admin/registro" | "/registro-tutor"
 * @param {number}   expiresInHours — horas hasta que caduca el token (ej: 48 | 168)
 *
 * @param {string}   title          — título del paso "form"
 *                                    Ej: "Invitar administrador"
 * @param {string}   description    — párrafo explicativo del paso "form"
 * @param {string}   warningText    — texto del aviso naranja (opcional)
 * @param {string}   roleLabel      — cómo se llama el rol en texto natural
 *                                    Ej: "administrador" | "tutor de empresa"
 * @param {string}   inviterName    — nombre del invitador para el email
 *                                    Ej: nombre de empresa o "el equipo de administración"
 */
export default function InviteModal({
  user,
  onClose,
  // configuración del token
  entityType,
  inviteRoute,
  expiresInHours = 48,
  // textos
  title,
  description,
  warningText,
  roleLabel,
  inviterName,
}) {
  const [step, setStep] = useState("form"); // form | generated
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Limpia el blob al desmontar
  useEffect(() => {
    return () => {
      if (qrUrl?.startsWith("blob:")) URL.revokeObjectURL(qrUrl);
    };
  }, [qrUrl]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    const token = crypto.randomUUID();
    console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("TOKEN:", token);
    const expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const { error: dbError } = await supabase.from("invite_tokens").insert({
      token,
      entity_id: user.id,
      entity_type: entityType,
      expires_at: expires.toISOString(),
      used: false,
    });

    if (dbError) {
      console.error("InviteModal error:", dbError);
      setError("No se pudo generar el enlace. Inténtalo de nuevo.");
      setGenerating(false);
      return;
    }
    const BASE_URL = "https://relance-platform.vercel.app"; // TODO: extraer a config

    const url = `${BASE_URL}${inviteRoute}?token=${token}&entity=${user.id}&type=${entityType}`;

    console.log(url);

    setInviteUrl(url);
    setExpiresAt(expires);
    setStep("generated");
    setGenerating(false);

    // Generar QR
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    // const a = document.createElement("a");
    // a.href = qrUrl;
    // a.download = `relance-invite-${entityType}.png`;
    // a.click();
    window.open(qrUrl, "_blank", "noopener,noreferrer");
  };

  const expiresLabel =
    expiresInHours >= 24
      ? `${expiresInHours / 24} día${expiresInHours / 24 !== 1 ? "s" : ""}`
      : `${expiresInHours} hora${expiresInHours !== 1 ? "s" : ""}`;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md relative">
          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            </button>

            {/* ── PASO 1: formulario ── */}
            {step === "form" && (
              <>
                <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                  <svg
                    className="w-7 h-7 text-brand"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>

                <h2 className="font-display text-xl font-bold text-white mb-1">
                  {title}
                </h2>
                <p className="text-gray-500 text-sm mb-5">
                  {description} El enlace caduca en{" "}
                  <strong className="text-white">{expiresLabel}</strong>.
                </p>

                {warningText && (
                  <div className="bg-orange-500/8 border border-orange-500/20 rounded-xl px-4 py-3 mb-5 flex gap-3">
                    <svg
                      className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-xs text-orange-300/80 leading-relaxed">
                      {warningText}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={onClose} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {generating ? (
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
                      "Generar enlace"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* ── PASO 2: generado ── */}
            {step === "generated" && (
              <>
                <h2 className="font-display text-xl font-bold text-white mb-1">
                  Código QR de invitación
                </h2>
                <p className="text-gray-500 text-sm mb-5">
                  Caduca el{" "}
                  <strong className="text-white">
                    {expiresAt?.toLocaleString("es-ES", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </strong>{" "}
                  ({expiresLabel}). Escanea el QR o copia el enlace.
                </p>

                {/* QR */}
                <div className="flex flex-col items-center mb-5">
                  <div className="p-3 bg-dark rounded-2xl border border-brand/20 mb-3">
                    {loadingQr ? (
                      <div className="w-48 h-48 flex items-center justify-center">
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
                      <img
                        src={qrUrl}
                        alt="QR de invitación"
                        className="w-48 h-48 rounded-xl"
                      />
                    )}
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-brand/8 border border-brand/20 rounded-full px-3 py-1">
                    <svg
                      className="w-3 h-3 text-brand"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="text-brand text-xs font-semibold">
                      Caduca en {expiresLabel}
                    </span>
                  </div>
                </div>

                {/* URL copiable */}
                <div className="bg-dark border border-white/10 rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2">
                  <span className="text-gray-500 text-xs truncate flex-1 font-mono">
                    {inviteUrl}
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

                <p className="text-xs text-gray-600 mb-4 flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  El enlace se marcará como usado en cuanto alguien complete el
                  registro.
                </p>

                {/* Acciones */}
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
              </>
            )}
          </div>
        </div>
      </div>

      {showEmailModal && (
        <SendInviteEmailModal
          inviteUrl={inviteUrl}
          inviterName={inviterName}
          inviterType={roleLabel}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </>
  );
}
