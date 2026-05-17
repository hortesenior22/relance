import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import Header from "../../components/layout/Header";

// ── QR Modal ─────────────────────────────────────────────────────────────────
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
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <div
          style={{
            background: "var(--color-surface-strong)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: 16,
            padding: "28px 28px 24px",
            width: "100%",
            maxWidth: 420,
            position: "relative",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
              borderRadius: 6,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--color-text)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--color-text-subtle)")
            }
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>

          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--color-text)",
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            Código QR de invitación
          </h2>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              margin: "0 0 20px",
              lineHeight: 1.5,
            }}
          >
            Comparte este QR para que los tutores de{" "}
            <strong style={{ color: "var(--color-text)" }}>{entityName}</strong>{" "}
            se registren vinculados automáticamente.
          </p>

          {/* QR */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            {loadingQr ? (
              <div
                style={{
                  width: 160,
                  height: 160,
                  background: "var(--color-surface)",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    border: "2px solid var(--color-border-strong)",
                    borderTopColor: "var(--color-brand)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  padding: 10,
                  background: "var(--color-surface)",
                  borderRadius: 14,
                  border: "1px solid rgba(192,255,114,0.2)",
                }}
              >
                <img
                  src={qrUrl}
                  alt="QR"
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: 8,
                    display: "block",
                  }}
                />
              </div>
            )}
          </div>

          {/* URL row */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              padding: "8px 10px",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: "var(--color-text-subtle)",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {url}
            </span>
            <button
              onClick={handleCopy}
              style={{
                flexShrink: 0,
                fontSize: 10,
                padding: "4px 10px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.15s",
                background: copied
                  ? "rgba(192,255,114,0.15)"
                  : "var(--color-surface-elevated)",
                color: copied
                  ? "var(--color-brand)"
                  : "var(--color-text-muted)",
              }}
            >
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button
              onClick={handleDownload}
              disabled={loadingQr}
              className="btn-secondary"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 11,
                padding: "9px 0",
              }}
            >
              <svg
                width="13"
                height="13"
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
              className="btn-secondary"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 11,
                padding: "9px 0",
              }}
            >
              <svg
                width="13"
                height="13"
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
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ width: "100%", fontSize: 12, padding: "9px 0" }}
          >
            Cerrar
          </button>
          <p
            style={{
              fontSize: 10,
              color: "var(--color-text-subtle)",
              textAlign: "center",
              marginTop: 10,
              marginBottom: 0,
            }}
          >
            Válido durante{" "}
            <strong style={{ color: "var(--color-text-muted)" }}>7 días</strong>
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

// ── Send Invite Email Modal ───────────────────────────────────────────────────
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
    if (fnError) setError("No se pudo enviar el correo. Inténtalo de nuevo.");
    else setSent(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 60,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  };
  const cardStyle = {
    background: "var(--color-surface-strong)",
    border: "1px solid var(--color-border-strong)",
    borderRadius: 16,
    padding: "28px 28px 24px",
    width: "100%",
    maxWidth: 400,
    position: "relative",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={modalStyle}
    >
      <div style={cardStyle}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            borderRadius: 6,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>

        {/* Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "var(--color-brand)",
              borderRadius: 8,
              padding: "4px 14px",
            }}
          >
            <span
              style={{
                color: "#0A0A0A",
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: "-0.5px",
              }}
            >
              Relance
            </span>
          </div>
        </div>

        {!sent ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(192,255,114,0.1)",
                  border: "1px solid rgba(192,255,114,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-brand)"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
            </div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--color-text)",
                textAlign: "center",
                margin: "0 0 6px",
                letterSpacing: "-0.02em",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              Enviar invitación por correo
            </h2>
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                textAlign: "center",
                margin: "0 0 20px",
                lineHeight: 1.5,
              }}
            >
              Invita a un tutor a unirse a{" "}
              <strong style={{ color: "var(--color-brand)" }}>
                {inviterName}
              </strong>{" "}
              como{" "}
              <strong style={{ color: "var(--color-text)" }}>
                {roleLabel}
              </strong>
              .
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    color: "var(--color-text-muted)",
                    marginBottom: 5,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                  }}
                >
                  Correo del tutor
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tutor@centro.edu.es"
                  className="input-field"
                  style={{ fontSize: 12 }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    color: "var(--color-text-muted)",
                    marginBottom: 5,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                  }}
                >
                  Enlace de invitación
                </label>
                <div
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    padding: "8px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--color-text-subtle)",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {inviteUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      flexShrink: 0,
                      fontSize: 10,
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "all 0.15s",
                      background: copied
                        ? "rgba(192,255,114,0.15)"
                        : "var(--color-surface-elevated)",
                      color: copied
                        ? "var(--color-brand)"
                        : "var(--color-text-muted)",
                    }}
                  >
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    background: "rgba(248,113,113,0.08)",
                    border: "1px solid rgba(248,113,113,0.25)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 11,
                    color: "var(--color-error)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handleSend}
                disabled={loading || !email}
                className="btn-primary"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 12,
                  padding: "9px 0",
                  opacity: loading || !email ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Enviando…
                  </>
                ) : (
                  <>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Enviar invitación
                  </>
                )}
              </button>
            </div>
            <p
              style={{
                fontSize: 10,
                color: "var(--color-text-subtle)",
                textAlign: "center",
                marginTop: 12,
                marginBottom: 0,
              }}
            >
              El enlace caduca en{" "}
              <strong style={{ color: "var(--color-text-muted)" }}>
                7 días
              </strong>
            </p>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 13,
                  background: "rgba(192,255,114,0.1)",
                  border: "1px solid rgba(192,255,114,0.28)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-brand)"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--color-text)",
                margin: "0 0 8px",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              Invitación enviada
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-muted)",
                margin: "0 0 4px",
              }}
            >
              Se ha enviado la invitación a{" "}
              <span style={{ color: "var(--color-brand)" }}>{email}</span>.
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-subtle)",
                margin: "0 0 20px",
              }}
            >
              El tutor recibirá un correo con el enlace para registrarse
              vinculado a tu centro.
            </p>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{ width: "100%", fontSize: 12, padding: "9px 0" }}
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <section
      style={{
        background: "var(--color-surface-strong)",
        border: "1px solid var(--color-border)",
        borderRadius: 14,
        padding: "20px 22px",
      }}
    >
      <h2
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "var(--color-text-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.13em",
          margin: "0 0 14px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

// ── Label + Input helper ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 10,
          color: "var(--color-text-muted)",
          marginBottom: 5,
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
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
      if (error) console.error("[CenterProfile]:", error);
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

  const inputStyle = { fontSize: 12 };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Header onLoginClick={() => {}} onRegisterClick={() => {}} />

      <main
        style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 64px" }}
      >
        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 24,
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--color-text)",
                margin: "0 0 4px",
                letterSpacing: "-0.03em",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              Perfil del centro
            </h1>
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              Configura la información de tu centro educativo
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              padding: "9px 18px",
              whiteSpace: "nowrap",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <>
                <div
                  style={{
                    width: 13,
                    height: 13,
                    border: "2px solid rgba(0,0,0,0.2)",
                    borderTopColor: "#0A0A0A",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Guardando…
              </>
            ) : saved ? (
              <>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
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

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Logo */}
          <SectionCard title="Logo del centro">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={centerName}
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 14,
                      objectFit: "cover",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 14,
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      className="w-8 h-8"
                      style={{
                        width: 32,
                        height: 32,
                        color: "var(--color-text-subtle)",
                      }}
                      viewBox="0 0 640 640"
                    >
                      <use href="/icons.svg#icon-school" />
                    </svg>
                  </div>
                )}
                {uploading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 14,
                      background: "rgba(0,0,0,0.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        border: "2px solid rgba(255,255,255,0.25)",
                        borderTopColor: "var(--color-brand)",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-text)",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {centerName || "Tu centro"}
                </p>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {user?.email}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleLogoUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: "6px 12px" }}
                >
                  Cambiar logo
                </button>
              </div>
            </div>
          </SectionCard>

          {/* Info */}
          <SectionCard title="Información del centro">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Nombre del centro *">
                  <input
                    type="text"
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    placeholder="IES Nombre del Centro"
                    className="input-field"
                    style={inputStyle}
                  />
                </Field>
              </div>
              <Field label="Código institucional">
                <input
                  type="text"
                  value={institutionalCode}
                  onChange={(e) => setInstitutionalCode(e.target.value)}
                  placeholder="IES-MAD-2024"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
              <Field label="Tipo de centro">
                <select
                  value={centerType}
                  onChange={(e) => setCenterType(e.target.value)}
                  className="input-field"
                  style={inputStyle}
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
              </Field>
              <Field label="Ciudad">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Madrid"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
              <Field label="Provincia">
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Madrid"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
              <Field label="N.º de alumnos aprox.">
                <input
                  type="number"
                  value={studentsCount}
                  onChange={(e) => setStudentsCount(e.target.value)}
                  placeholder="300"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Sitio web">
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://iesejemplo.edu.es"
                    className="input-field"
                    style={inputStyle}
                  />
                </Field>
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
              className="input-field"
              style={{ ...inputStyle, marginBottom: 10 }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {degreesOffered.map((d) => (
                <span
                  key={d}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: "rgba(192,255,114,0.1)",
                    border: "1px solid rgba(192,255,114,0.22)",
                    color: "var(--color-brand)",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 20,
                  }}
                >
                  {d}
                  <button
                    onClick={() =>
                      setDegreesOffered(degreesOffered.filter((x) => x !== d))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(192,255,114,0.6)",
                      fontSize: 14,
                      lineHeight: 1,
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              {degreesOffered.length === 0 && (
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-subtle)",
                    margin: 0,
                  }}
                >
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
              className="input-field"
              style={{ ...inputStyle, resize: "none" }}
            />
            <p
              style={{
                fontSize: 10,
                color: "var(--color-text-subtle)",
                textAlign: "right",
                margin: "4px 0 0",
              }}
            >
              {description.length}/500
            </p>
          </SectionCard>

          {/* Contacto */}
          <SectionCard title="Datos de contacto">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <Field label="Email de contacto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="secretaria@centro.edu.es"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
              <Field label="Teléfono">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 900 000 000"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
            </div>
          </SectionCard>

          {/* QR Invitación */}
          <SectionCard title="Invitar tutores de centro">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: 11,
                  background: "rgba(192,255,114,0.1)",
                  border: "1px solid rgba(192,255,114,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  style={{ width: 22, height: 22, color: "var(--color-brand)" }}
                  viewBox="0 0 640 640"
                >
                  <use href="/icons.svg#icon-qrcode" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--color-text)",
                  }}
                >
                  Código QR de invitación para tutores
                </p>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.55,
                  }}
                >
                  Genera un enlace QR único que los tutores puedan escanear para
                  registrarse vinculados automáticamente a tu centro. Caduca a
                  los 7 días.
                </p>
                <button
                  onClick={handleGenerateQR}
                  disabled={generatingToken}
                  className="btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 11,
                    padding: "8px 16px",
                    opacity: generatingToken ? 0.7 : 1,
                  }}
                >
                  {generatingToken ? (
                    <>
                      <div
                        style={{
                          width: 13,
                          height: 13,
                          border: "2px solid rgba(0,0,0,0.2)",
                          borderTopColor: "#0A0A0A",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Generando…
                    </>
                  ) : (
                    <>
                      <svg
                        width="13"
                        height="13"
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
