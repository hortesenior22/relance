/**
 * StudentProfileDrawer
 * Componente reutilizable para visualizar el perfil de un estudiante.
 * Puede usarse desde cualquier rol (empresa, admin, tutor, etc.).
 *
 * Props:
 *  - estudianteId: string | null   → id del estudiante a mostrar
 *  - onClose: () => void
 *  - supabase: supabaseClient       → instancia ya configurada
 */

import { useState, useEffect } from "react";

// ── Helpers ────────────────────────────────────────────────────────────────
function Avatar({ src, nombre, size = "lg" }) {
  const dim = size === "lg" ? "w-20 h-20" : "w-10 h-10";
  const text = size === "lg" ? "text-2xl" : "text-sm";
  const initial = nombre?.[0]?.toUpperCase() ?? "?";
  return src ? (
    <img
      src={src}
      alt={nombre}
      className={`${dim} rounded-2xl object-cover border border-white/10 flex-shrink-0`}
    />
  ) : (
    <div
      className={`${dim} rounded-2xl bg-[#C0FF72]/10 border border-[#C0FF72]/20 flex items-center justify-center flex-shrink-0`}
    >
      <span className={`${text} font-bold text-[#C0FF72] font-display`}>
        {initial}
      </span>
    </div>
  );
}

function Tag({ children, color = "brand" }) {
  const cls = {
    brand: "bg-[#C0FF72]/10 text-[#C0FF72] border-[#C0FF72]/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    gray: "bg-white/5 text-gray-400 border-white/10",
  }[color];
  return (
    <span
      className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {children}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-gray-600 mt-0.5 flex-shrink-0 w-4 text-center">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-600 mb-0.5">{label}</p>
        <p className="text-sm text-gray-200 break-words">{value}</p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin w-6 h-6 text-[#C0FF72]"
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

// ── Componente principal ───────────────────────────────────────────────────
export default function StudentProfileDrawer({
  estudianteId,
  onClose,
  supabase,
}) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!estudianteId) return;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // Datos del estudiante con su usuario base y tecnologías
        const { data, error: err } = await supabase
          .from("estudiante")
          .select(
            `
            id,
            nombre,
            apellidos,
            especialidad,
            descripcion,
            linkedin,
            github,
            portfolio,
            cv_url,
            disponibilidad,
            modalidad_preferida,
            salario_esperado,
            anio_fin_estudios,
            usuario:usuario!estudiante_id_fkey(avatar_url, email),
            estudiante_tecnologia(tecnologia(id_tecnologia, nombre))
          `,
          )
          .eq("id", estudianteId)
          .single();

        if (err) throw err;

        setPerfil({
          ...data,
          avatar: data.usuario?.avatar_url ?? null,
          email: data.usuario?.email ?? null,
          tecnologias:
            data.estudiante_tecnologia
              ?.map((et) => et.tecnologia)
              .filter(Boolean) ?? [],
        });
      } catch (e) {
        setError(e.message ?? "No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    })();
  }, [estudianteId, supabase]);

  // Bloquea scroll del body mientras está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer deslizante desde la derecha */}
      <div
        className="fixed top-0 right-0 h-full z-[80] w-full max-w-md
                   bg-[#0e0e0e] border-l border-white/10 shadow-2xl
                   flex flex-col overflow-hidden
                   animate-[slideInRight_0.25s_ease-out]"
        style={{ animation: "slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Keyframe inline */}
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Perfil del candidato
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
                       hover:text-white hover:bg-white/8 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : perfil ? (
            <div className="p-6 space-y-6">
              {/* Hero */}
              <div className="flex items-start gap-4">
                <Avatar src={perfil.avatar} nombre={perfil.nombre} size="lg" />
                <div className="min-w-0 flex-1 pt-1">
                  <h2 className="font-display font-bold text-white text-xl leading-tight truncate">
                    {perfil.nombre} {perfil.apellidos}
                  </h2>
                  {perfil.especialidad && (
                    <p className="text-[#C0FF72] text-sm mt-0.5 truncate">
                      {perfil.especialidad}
                    </p>
                  )}
                  {perfil.email && (
                    <a
                      href={`mailto:${perfil.email}`}
                      className="text-gray-500 text-xs mt-1 hover:text-gray-300 transition-colors block truncate"
                    >
                      {perfil.email}
                    </a>
                  )}
                </div>
              </div>

              {/* Tags de disponibilidad */}
              {(perfil.disponibilidad || perfil.modalidad_preferida) && (
                <div className="flex flex-wrap gap-1.5">
                  {perfil.disponibilidad && (
                    <Tag color="brand">✅ {perfil.disponibilidad}</Tag>
                  )}
                  {perfil.modalidad_preferida && (
                    <Tag color="blue">🌐 {perfil.modalidad_preferida}</Tag>
                  )}
                  {perfil.salario_esperado && (
                    <Tag color="gray">💶 {perfil.salario_esperado} €/mes</Tag>
                  )}
                  {perfil.anio_fin_estudios && (
                    <Tag color="gray">
                      🎓 Fin estudios {perfil.anio_fin_estudios}
                    </Tag>
                  )}
                </div>
              )}

              {/* Sobre mí */}
              {perfil.descripcion && (
                <Section title="Sobre mí">
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {perfil.descripcion}
                  </p>
                </Section>
              )}

              {/* Tecnologías */}
              {perfil.tecnologias.length > 0 && (
                <Section title="Tecnologías">
                  <div className="flex flex-wrap gap-1.5">
                    {perfil.tecnologias.map((t) => (
                      <span
                        key={t.id_tecnologia}
                        className="bg-[#C0FF72]/10 border border-[#C0FF72]/20 text-[#C0FF72] text-xs px-2.5 py-1 rounded-full"
                      >
                        {t.nombre}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Info de contacto y links */}
              <Section title="Contacto y enlaces">
                <div className="bg-dark-800 border border-white/8 rounded-xl overflow-hidden">
                  <InfoRow icon="✉️" label="Email" value={perfil.email} />
                  <InfoRow icon="🔗" label="LinkedIn" value={perfil.linkedin} />
                  <InfoRow icon="⌨️" label="GitHub" value={perfil.github} />
                  <InfoRow
                    icon="🌐"
                    label="Portfolio"
                    value={perfil.portfolio}
                  />
                </div>
              </Section>

              {/* CV */}
              {perfil.cv_url && (
                <a
                  href={perfil.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4
                             bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                             rounded-xl text-sm text-gray-300 hover:text-white transition-all font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Ver Currículum
                </a>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
