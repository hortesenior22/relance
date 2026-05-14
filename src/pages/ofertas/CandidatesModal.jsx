// ─── components/ofertas/CandidatosModal.jsx ───────────────────────────────
import { useEffect, useState, useCallback } from "react";

// ── SVG Icons ─────────────────────────────────────────────────────────────────
function IconSearch({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconX({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
    </svg>
  );
}
function IconCalendar({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconPin({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
function IconLink({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}
function IconChevronRight({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
function IconUsers({ className = "w-7 h-7" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconGithub({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
function IconPhone({ className = "w-3 h-3" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}
function IconTarget({ className = "w-3 h-3" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
function IconMonitor({ className = "w-3 h-3" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
function IconAvailability({ className = "w-3 h-3" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconStar({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconCheck({ className = "w-3 h-3" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconNote({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ className = "w-5 h-5" }) {
  return (
    <svg
      className={`animate-spin text-[#C0FF72] ${className}`}
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

// ── Estado badge ──────────────────────────────────────────────────────────────
const ESTADO_META = {
  pendiente: { label: "Pendiente", color: "orange" },
  revisando: { label: "Revisando", color: "blue" },
  aceptado: { label: "Aceptado", color: "green" },
  rechazado: { label: "Rechazado", color: "red" },
  retirado: { label: "Retirado", color: "gray" },
};

const ESTADO_PALETTE = {
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  blue: "bg-blue-500/10   text-blue-400   border-blue-500/20",
  green: "bg-green-500/10  text-green-400  border-green-500/20",
  red: "bg-red-500/10    text-red-400    border-red-500/20",
  gray: "bg-white/5       text-gray-400   border-white/10",
};

function EstadoBadge({ estado, onChange }) {
  const meta = ESTADO_META[estado] ?? { label: estado, color: "gray" };
  return (
    <select
      value={estado ?? "pendiente"}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className={`text-[11px] font-medium px-2.5 py-1 rounded-full border cursor-pointer appearance-none transition-all focus:outline-none focus:ring-1 focus:ring-white/20 ${ESTADO_PALETTE[meta.color] ?? ESTADO_PALETTE.gray}`}
    >
      {Object.entries(ESTADO_META).map(([val, m]) => (
        <option key={val} value={val}>
          {m.label}
        </option>
      ))}
    </select>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ src, nombre, size = "md" }) {
  const [err, setErr] = useState(false);
  const sz = size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  const initials = (nombre ?? "E")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src && !err) {
    return (
      <img
        src={src}
        alt={nombre}
        onError={() => setErr(true)}
        className={`${sz} rounded-xl object-cover border border-white/10 flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sz} rounded-xl bg-gradient-to-br from-[#C0FF72]/20 to-[#C0FF72]/5 border border-[#C0FF72]/15 flex items-center justify-center flex-shrink-0 font-bold text-[#C0FF72] font-display`}
    >
      {initials}
    </div>
  );
}

// ── Stat box ──────────────────────────────────────────────────────────────────
function StatBox({ label, val, color }) {
  const palette = {
    brand: "text-[#C0FF72]",
    orange: "text-orange-400",
    green: "text-green-400",
    red: "text-red-400",
    gray: "text-gray-400",
  };
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3 text-center">
      <p
        className={`text-2xl font-display font-bold tabular-nums ${palette[color] ?? palette.gray}`}
      >
        {val}
      </p>
      <p className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

// ── InfoChip ──────────────────────────────────────────────────────────────────
function InfoChip({ icon, label, val }) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2.5">
      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-gray-300 text-xs font-medium flex items-center gap-1.5">
        <span className="text-gray-500">{icon}</span>
        {val}
      </p>
    </div>
  );
}

// ── Nota interna ──────────────────────────────────────────────────────────────
function Nota({ candidato }) {
  const [nota, setNota] = useState(candidato.comentario_empresa ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    setNota(candidato.comentario_empresa ?? "");
  }, [candidato.id_candidatura]);

  const guardar = async () => {
    setGuardando(true);
    await new Promise((r) => setTimeout(r, 400));
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
    candidato._onNotaChange?.(nota);
  };

  return (
    <div>
      <h4 className="text-[11px] text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
        <IconNote className="w-3.5 h-3.5" /> Nota interna
      </h4>
      <textarea
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        rows={3}
        placeholder="Añade notas privadas sobre este candidato..."
        className="input-field resize-none text-sm w-full"
      />
      <button
        onClick={guardar}
        disabled={guardando}
        className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all disabled:opacity-50 flex items-center gap-1.5"
      >
        {guardando ? (
          <Spinner className="w-3 h-3" />
        ) : guardado ? (
          <>
            <IconCheck className="w-3 h-3 text-[#C0FF72]" /> Guardado
          </>
        ) : (
          "Guardar nota"
        )}
      </button>
    </div>
  );
}

// ── Drawer de perfil ──────────────────────────────────────────────────────────
function PerfilDrawer({ candidato, onClose, onEstadoChange }) {
  const e = candidato.estudiante;
  const nombre =
    [e?.nombre, e?.apellidos].filter(Boolean).join(" ") || "Estudiante";
  const tecnologias = candidato.tecnologias ?? [];
  const formaciones = e?.formaciones ?? [];
  const proyectos = e?.proyectos ?? [];
  const repos = e?.github_repos_vinculados ?? [];
  const redes = e?.redes_sociales ?? {};

  // return (
  //   <div
  //     className="fixed inset-0 z-[70] flex"
  //     onClick={(ev) => ev.target === ev.currentTarget && onClose()}
  //   >
  //     <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
  //     <div className="w-full max-w-lg bg-dark-800 border-l border-white/10 h-full overflow-y-auto flex flex-col shadow-2xl">
  //       {/* Header */}
  //       <div className="sticky top-0 bg-dark-800/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
  //         <div>
  //           <h2 className="font-display font-bold text-white text-lg">
  //             Perfil del candidato
  //           </h2>
  //           <p className="text-gray-600 text-xs mt-0.5">
  //             {oferta_title_placeholder}
  //           </p>
  //         </div>
  //         <button
  //           onClick={onClose}
  //           className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all"
  //         >
  //           <IconX className="w-4 h-4" />
  //         </button>
  //       </div>

  //       <div className="p-6 space-y-6 flex-1">
  //         {/* Avatar + nombre */}
  //         <div className="flex items-start gap-4">
  //           <Avatar src={e?.avatar_url} nombre={nombre} size="lg" />
  //           <div className="flex-1 min-w-0">
  //             <h3 className="font-display font-bold text-white text-xl leading-tight">
  //               {nombre}
  //             </h3>
  //             {e?.titulacion && (
  //               <p className="text-[#C0FF72] text-sm mt-0.5">{e.titulacion}</p>
  //             )}
  //             {e?.ciudad && (
  //               <p className="text-gray-500 text-xs mt-1 flex items-center gap-1.5">
  //                 <IconPin className="w-3 h-3" />
  //                 {e.ciudad}
  //               </p>
  //             )}
  //             <div className="mt-2.5">
  //               <EstadoBadge
  //                 estado={candidato.estado}
  //                 onChange={onEstadoChange}
  //               />
  //             </div>
  //           </div>
  //         </div>

  //         {/* Fecha postulación */}
  //         <div className="flex items-center gap-2.5 text-xs text-gray-500 bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3">
  //           <IconCalendar className="w-3.5 h-3.5 text-gray-600" />
  //           <span>Postulado el</span>
  //           <span className="text-gray-300 font-medium">
  //             {candidato.fecha_envio
  //               ? new Date(candidato.fecha_envio).toLocaleDateString("es-ES", {
  //                   day: "numeric",
  //                   month: "long",
  //                   year: "numeric",
  //                 })
  //               : "—"}
  //           </span>
  //         </div>

  //         {/* Mensaje del estudiante */}
  //         {candidato.comentario_estudiante && (
  //           <div className="bg-[#C0FF72]/5 border border-[#C0FF72]/15 rounded-xl p-4">
  //             <p className="text-[11px] text-[#C0FF72]/50 uppercase tracking-widest mb-2">
  //               Mensaje de presentación
  //             </p>
  //             <p className="text-gray-300 text-sm leading-relaxed italic">
  //               "{candidato.comentario_estudiante}"
  //             </p>
  //           </div>
  //         )}

  //         {/* Sobre mí */}
  //         {e?.sobre_mi && (
  //           <div>
  //             <h4 className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">
  //               Sobre mí
  //             </h4>
  //             <p className="text-gray-300 text-sm leading-relaxed">
  //               {e.sobre_mi}
  //             </p>
  //           </div>
  //         )}

  //         {/* Info rápida */}
  //         <div className="grid grid-cols-2 gap-2">
  //           {e?.disponibilidad && (
  //             <InfoChip
  //               icon={<IconAvailability className="w-3 h-3" />}
  //               label="Disponibilidad"
  //               val={e.disponibilidad}
  //             />
  //           )}
  //           {e?.modalidad && (
  //             <InfoChip
  //               icon={<IconMonitor className="w-3 h-3" />}
  //               label="Modalidad"
  //               val={e.modalidad}
  //             />
  //           )}
  //           {e?.tipo_busqueda && (
  //             <InfoChip
  //               icon={<IconTarget className="w-3 h-3" />}
  //               label="Busca"
  //               val={e.tipo_busqueda}
  //             />
  //           )}
  //           {e?.telefono && (
  //             <InfoChip
  //               icon={<IconPhone className="w-3 h-3" />}
  //               label="Teléfono"
  //               val={e.telefono}
  //             />
  //           )}
  //         </div>

  //         {/* Habilidades */}
  //         {(e?.habilidades ?? []).length > 0 && (
  //           <div>
  //             <h4 className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">
  //               Habilidades
  //             </h4>
  //             <div className="flex flex-wrap gap-1.5">
  //               {e.habilidades.map((h, i) => (
  //                 <span
  //                   key={i}
  //                   className="bg-white/5 border border-white/10 text-gray-300 text-xs px-2.5 py-1 rounded-full font-mono"
  //                 >
  //                   {h}
  //                 </span>
  //               ))}
  //             </div>
  //           </div>
  //         )}

  //         {/* Match con oferta */}
  //         {tecnologias.length > 0 && (
  //           <div>
  //             <h4 className="text-[11px] text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
  //               <IconStar className="w-3 h-3 text-[#C0FF72]" /> Match con la
  //               oferta
  //             </h4>
  //             <div className="flex flex-wrap gap-1.5">
  //               {tecnologias.map((t, i) => (
  //                 <span
  //                   key={i}
  //                   className="bg-[#C0FF72]/10 border border-[#C0FF72]/20 text-[#C0FF72] text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
  //                 >
  //                   <IconCheck className="w-2.5 h-2.5" />
  //                   {t}
  //                 </span>
  //               ))}
  //             </div>
  //           </div>
  //         )}

  //         {/* Formación */}
  //         {formaciones.length > 0 && (
  //           <div>
  //             <h4 className="text-[11px] text-gray-500 uppercase tracking-widest mb-3">
  //               Formación
  //             </h4>
  //             <div className="space-y-2">
  //               {formaciones.map((f, i) => (
  //                 <div
  //                   key={i}
  //                   className="bg-white/[0.03] border border-white/8 rounded-xl p-3.5"
  //                 >
  //                   <p className="text-white text-sm font-semibold">
  //                     {f.titulo}
  //                   </p>
  //                   <p className="text-gray-500 text-xs mt-0.5">{f.centro}</p>
  //                   {(f.fecha_inicio || f.fecha_fin) && (
  //                     <p className="text-gray-600 text-xs mt-1">
  //                       {f.fecha_inicio}
  //                       {f.fecha_inicio && f.fecha_fin ? " – " : ""}
  //                       {f.fecha_fin}
  //                     </p>
  //                   )}
  //                 </div>
  //               ))}
  //             </div>
  //           </div>
  //         )}

  //         {/* Proyectos */}
  //         {proyectos.length > 0 && (
  //           <div>
  //             <h4 className="text-[11px] text-gray-500 uppercase tracking-widest mb-3">
  //               Proyectos
  //             </h4>
  //             <div className="space-y-2">
  //               {proyectos.map((p, i) => (
  //                 <div
  //                   key={i}
  //                   className="bg-white/[0.03] border border-white/8 rounded-xl p-3.5"
  //                 >
  //                   <div className="flex items-start justify-between gap-2">
  //                     <p className="text-white text-sm font-semibold">
  //                       {p.nombre}
  //                     </p>
  //                     {p.url && (
  //                       <a
  //                         href={p.url}
  //                         target="_blank"
  //                         rel="noopener noreferrer"
  //                         onClick={(ev) => ev.stopPropagation()}
  //                         className="text-gray-500 hover:text-[#C0FF72] transition-colors flex-shrink-0"
  //                       >
  //                         <IconLink className="w-3.5 h-3.5" />
  //                       </a>
  //                     )}
  //                   </div>
  //                   {p.descripcion && (
  //                     <p className="text-gray-500 text-xs mt-1 leading-relaxed">
  //                       {p.descripcion}
  //                     </p>
  //                   )}
  //                   {(p.tecnologias ?? []).length > 0 && (
  //                     <div className="flex flex-wrap gap-1 mt-2">
  //                       {p.tecnologias.map((t, j) => (
  //                         <span
  //                           key={j}
  //                           className="bg-white/5 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-mono"
  //                         >
  //                           {t}
  //                         </span>
  //                       ))}
  //                     </div>
  //                   )}
  //                 </div>
  //               ))}
  //             </div>
  //           </div>
  //         )}

  //         {/* GitHub repos */}
  //         {repos.length > 0 && (
  //           <div>
  //             <h4 className="text-[11px] text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
  //               <IconGithub className="w-3.5 h-3.5" />
  //               GitHub
  //             </h4>
  //             <div className="space-y-1.5">
  //               {repos.slice(0, 4).map((r, i) => (
  //                 <a
  //                   key={i}
  //                   href={r.url}
  //                   target="_blank"
  //                   rel="noopener noreferrer"
  //                   onClick={(ev) => ev.stopPropagation()}
  //                   className="flex items-center justify-between bg-white/[0.03] hover:bg-white/6 border border-white/8 hover:border-white/15 rounded-xl px-3.5 py-2.5 transition-all group"
  //                 >
  //                   <div className="flex items-center gap-2 min-w-0">
  //                     <IconGithub className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
  //                     <span className="text-gray-400 text-xs truncate group-hover:text-white transition-colors">
  //                       {r.nombre ?? r.url}
  //                     </span>
  //                   </div>
  //                   <IconLink className="w-3 h-3 text-gray-600 flex-shrink-0" />
  //                 </a>
  //               ))}
  //             </div>
  //           </div>
  //         )}

  //         {/* Redes */}
  //         {Object.keys(redes).length > 0 && (
  //           <div>
  //             <h4 className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">
  //               Redes
  //             </h4>
  //             <div className="flex flex-wrap gap-2">
  //               {Object.entries(redes).map(
  //                 ([red, url]) =>
  //                   url && (
  //                     <a
  //                       key={red}
  //                       href={url}
  //                       target="_blank"
  //                       rel="noopener noreferrer"
  //                       onClick={(ev) => ev.stopPropagation()}
  //                       className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/8 border border-white/8 hover:border-white/15 px-3 py-1.5 rounded-lg transition-all capitalize"
  //                     >
  //                       {red}
  //                       <IconLink className="w-2.5 h-2.5" />
  //                     </a>
  //                   ),
  //               )}
  //             </div>
  //           </div>
  //         )}

  //         {/* Nota interna */}
  //         <div className="pt-2 border-t border-white/8">
  //           <Nota candidato={candidato} />
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}

// Variable placeholder — en el contexto real se pasa como prop
const oferta_title_placeholder = "";

// ── Modal principal ───────────────────────────────────────────────────────────
export default function CandidatosModal({ oferta, onClose, supabase }) {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [perfilAbierto, setPerfilAbierto] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from("candidatura")
        .select(
          `
        id_candidatura,
        fecha_envio,
        estado,
        comentario_estudiante,
        comentario_empresa,
        id_estudiante,
        estudiante:estudiante(*)
      `,
        )
        .eq("id_oferta", oferta.id_oferta)
        .order("fecha_envio", { ascending: false });

      if (err) throw err;

      console.log("RAW DATA:", data);

      const estudiantesIds = [
        ...new Set((data ?? []).map((c) => c.id_estudiante)),
      ];

      let estudiantesMap = {};

      if (estudiantesIds.length > 0) {
        const { data: estudiantesData } = await supabase
          .from("estudiante")
          .select("*")
          .in("id", estudiantesIds);

        estudiantesMap = Object.fromEntries(
          (estudiantesData ?? []).map((e) => [e.id, e]),
        );
      }

      const ofertaTecnologias = (oferta.tecnologias ?? []).map((t) =>
        (t.nombre ?? t).toLowerCase(),
      );

      const normalized = (data ?? []).map((c) => {
        const estudiante =
          c.estudiante ?? estudiantesMap[c.id_estudiante] ?? null;

        const habilidades = estudiante?.habilidades ?? [];

        const match = ofertaTecnologias.filter((ot) =>
          habilidades.some((h) => h.toLowerCase().includes(ot)),
        );

        return {
          ...c,
          estudiante,
          tecnologias: match,
        };
      });

      console.log("NORMALIZED:", normalized);

      setCandidatos(normalized);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [oferta.id_oferta, supabase]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actualizarEstado = async (idCandidatura, nuevoEstado) => {
    const { error: err } = await supabase
      .from("candidatura")
      .update({ estado: nuevoEstado })
      .eq("id_candidatura", idCandidatura);
    if (!err) {
      setCandidatos((prev) =>
        prev.map((c) =>
          c.id_candidatura === idCandidatura
            ? { ...c, estado: nuevoEstado }
            : c,
        ),
      );
      if (perfilAbierto?.id_candidatura === idCandidatura)
        setPerfilAbierto((prev) => ({ ...prev, estado: nuevoEstado }));
    }
  };

  const actualizarNota = async (idCandidatura, nota) => {
    await supabase
      .from("candidatura")
      .update({ comentario_empresa: nota })
      .eq("id_candidatura", idCandidatura);
    setCandidatos((prev) =>
      prev.map((c) =>
        c.id_candidatura === idCandidatura
          ? { ...c, comentario_empresa: nota }
          : c,
      ),
    );
  };

  const listaFiltrada = candidatos.filter((c) => {
    const e = c.estudiante;
    const nombre = [e?.nombre, e?.apellidos]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const q = busqueda.toLowerCase();
    return (
      (!q ||
        nombre.includes(q) ||
        (e?.titulacion ?? "").toLowerCase().includes(q)) &&
      (!filtroEstado || c.estado === filtroEstado)
    );
  });

  const stats = candidatos.reduce((acc, c) => {
    acc[c.estado] = (acc[c.estado] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-black/60">
          {/* ── Header ── */}
          <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C0FF72]/10 border border-[#C0FF72]/20 flex items-center justify-center flex-shrink-0">
                <IconUsers className="w-4 h-4 text-[#C0FF72]" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white">
                  Candidatos
                </h2>
                <p className="text-gray-500 text-xs mt-0.5 truncate max-w-xs">
                  {oferta.titulo}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all ml-4 flex-shrink-0"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          {/* ── Stats ── */}
          {!loading && candidatos.length > 0 && (
            <div className="px-6 pt-4 grid grid-cols-4 gap-2 flex-shrink-0">
              <StatBox label="Total" val={candidatos.length} color="brand" />
              <StatBox
                label="Pendientes"
                val={stats.pendiente ?? 0}
                color="orange"
              />
              <StatBox
                label="Aceptados"
                val={stats.aceptado ?? 0}
                color="green"
              />
              <StatBox
                label="Rechazados"
                val={stats.rechazado ?? 0}
                color="red"
              />
            </div>
          )}

          {/* ── Filtros ── */}
          {!loading && candidatos.length > 0 && (
            <div className="px-6 pt-3 pb-3 flex gap-2 flex-shrink-0">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar candidato..."
                  className="input-field pl-8 py-2 text-sm w-full"
                />
              </div>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="input-field py-2 text-sm w-auto flex-shrink-0"
              >
                <option value="">Todos los estados</option>
                {Object.entries(ESTADO_META).map(([val, m]) => (
                  <option key={val} value={val}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── Separador ── */}
          {!loading && candidatos.length > 0 && (
            <div className="h-px bg-white/8 mx-6 flex-shrink-0" />
          )}

          {/* ── Lista ── */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner className="w-8 h-8" />
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-400 text-sm">
                {error}
              </div>
            ) : candidatos.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <IconUsers className="w-7 h-7 text-gray-600" />
                </div>
                <p className="text-gray-400 font-medium text-sm">
                  Aún no hay candidatos
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Los estudiantes que se postulen aparecerán aquí
                </p>
              </div>
            ) : listaFiltrada.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No hay candidatos que coincidan con los filtros
              </div>
            ) : (
              <div className="space-y-1.5">
                {listaFiltrada.map((c) => {
                  const e = c.estudiante;
                  const nombre =
                    [e?.nombre, e?.apellidos].filter(Boolean).join(" ") ||
                    "Estudiante";
                  const estadoMeta = ESTADO_META[c.estado] ?? {
                    label: c.estado,
                    color: "gray",
                  };
                  return (
                    <button
                      key={c.id_candidatura}
                      onClick={() =>
                        setPerfilAbierto({
                          ...c,
                          _onNotaChange: (nota) =>
                            actualizarNota(c.id_candidatura, nota),
                        })
                      }
                      className="w-full text-left bg-white/[0.02] hover:bg-white/5 border border-white/8 hover:border-white/15 rounded-xl px-4 py-3.5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={e?.avatar_url} nombre={nombre} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 justify-between mb-0.5">
                            <p className="text-white text-sm font-semibold group-hover:text-[#C0FF72] transition-colors truncate">
                              {nombre}
                            </p>
                            {/* Estado badge inline solo lectura */}
                            <span
                              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border flex-shrink-0 ${ESTADO_PALETTE[estadoMeta.color] ?? ESTADO_PALETTE.gray}`}
                            >
                              {estadoMeta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {e?.titulacion && (
                              <p className="text-gray-500 text-xs truncate">
                                {e.titulacion}
                              </p>
                            )}
                            {c.tecnologias.length > 0 && (
                              <span className="text-[#C0FF72] text-[10px] font-semibold flex-shrink-0 flex items-center gap-1">
                                <IconStar className="w-2.5 h-2.5" />
                                {c.tecnologias.length} match
                                {c.tecnologias.length !== 1 ? "es" : ""}
                              </span>
                            )}
                          </div>
                          {c.comentario_estudiante && (
                            <p className="text-gray-600 text-xs mt-1 line-clamp-1 italic">
                              "{c.comentario_estudiante}"
                            </p>
                          )}
                        </div>
                        {/* Selector de estado en la fila */}
                        <div
                          className="flex-shrink-0 flex items-center gap-2"
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          <EstadoBadge
                            estado={c.estado}
                            onChange={(v) =>
                              actualizarEstado(c.id_candidatura, v)
                            }
                          />
                        </div>
                        <IconChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {perfilAbierto && (
        <PerfilDrawer
          candidato={perfilAbierto}
          onClose={() => setPerfilAbierto(null)}
          onEstadoChange={(v) =>
            actualizarEstado(perfilAbierto.id_candidatura, v)
          }
        />
      )}
    </>
  );
}
