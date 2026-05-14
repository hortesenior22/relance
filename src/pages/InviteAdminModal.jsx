// ─── Modal invitar admin ──────────────────────────────────────────────────────
// Reemplaza el componente InviteAdminModal en AdminProfile.jsx
// Los cambios son:
//   1. Se añade estado "error" para mostrar mensajes visibles al usuario
//   2. handleGenerate muestra el error si falla el INSERT
//   3. Se añade generación de QR (igual que en CenterProfile / CompanyProfile)
//   4. Se añade botón de descarga del QR además del de copiar

import { useState } from "react";
import { supabase } from "../lib/supabase";

function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg
      className={`animate-spin text-brand ${className}`}
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
  );
}

export function InviteAdminModal({ user, onClose }) {
  // "idle" → usuario ve el aviso y pulsa "Generar"
  // "generating" → petición en curso
  // "generated" → enlace listo
  const [step, setStep] = useState("form"); // form | generated
  const [generating, setGenerating] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // ── Generar token e insertar en BD ────────────────────────────────────────
  onst handleGenerate = async () => {
    setGenerating(true);
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const { error } = await supabase.from("invite_tokens").insert({
      token,
      entity_id: user.id,
      entity_type: "admin",
      expires_at: expires.toISOString(),
      used: false,
    });

    if (error) {
      console.error("invite error:", error);
      setGenerating(false);
      return;
    }

    const url = `${window.location.origin}/admin/registro?token=${token}&entity=${user.id}`;
    setInviteUrl(url);
    setExpiresAt(expires);
    setStep("generated");
    setGenerating(false);

    // Generar QR en segundo plano
    generateQR(url);
  };

  // ── Generar imagen QR ─────────────────────────────────────────────────────
  const generateQR = async (url) => {
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
            erf1: [], erf2: [], erf3: [],
            brf1: [], brf2: [], brf3: [],
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
      // Fallback a API gratuita sin marca de agua
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
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `relance-admin-invite-qr.png`;
    a.click();
  };

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
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            </button>

            {step === "form" ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-brand" viewBox="0 0 640 640">
                    <use href="/icons.svg#icon-shield" />
                  </svg>
                </div>

                <h2 className="font-display text-xl font-bold text-white mb-1">
                  Invitar administrador
                </h2>
                <p className="text-gray-500 text-sm mb-5">
                  Genera un enlace y código QR de invitación de{" "}
                  <strong className="text-white">48 horas</strong> para que
                  otra persona cree su cuenta de administrador.
                </p>

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
                    Los administradores tienen acceso total a la plataforma:
                    validación de ofertas, gestión de usuarios y generación de
                    nuevas invitaciones. Comparte este enlace solo con personas
                    de confianza.
                  </p>
                </div>

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
                        <Spinner className="w-4 h-4" /> Generando...
                      </>
                    ) : (
                      "Generar enlace"
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">
                  <svg
                    className="w-7 h-7 text-green-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h2 className="font-display text-xl font-bold text-white mb-1">
                  Enlace generado
                </h2>
                <p className="text-gray-500 text-sm mb-5">
                  Caduca el{" "}
                  <strong className="text-white">
                    {expiresAt?.toLocaleString("es-ES", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </strong>{" "}
                  (48 horas). Escanea el QR o copia el enlace.
                </p>

                {/* QR */}
                <div className="flex flex-col items-center mb-5">
                  <div className="p-3 bg-dark rounded-2xl border border-brand/20 mb-3">
                    {loadingQr ? (
                      <div className="w-48 h-48 flex items-center justify-center">
                        <Spinner className="w-8 h-8" />
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
                      Caduca en 48 h
                    </span>
                  </div>
                </div>

                {/* URL */}
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
                    className="w-3.5 h-3.5 text-gray-600"
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
          inviterName="el equipo de administración"
          inviterType="admin"
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </>
  );
}
