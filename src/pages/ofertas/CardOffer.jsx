// ─── components/ofertas/OfertaCard.jsx ────────────────────────────────────
import { useState } from "react";

export const TIPO_META = {
  practicas: { label: "Prácticas", accent: "#3b82f6", colorClass: "blue" },
  practicas_contratacion: {
    label: "Prácticas + contratación",
    accent: "#22c55e",
    colorClass: "green",
  },
  empleo_junior: {
    label: "Empleo junior",
    accent: "#a855f7",
    colorClass: "purple",
  },
};

export function Badge({ children, color = "gray", icon }) {
  const palette = {
    brand: "bg-[#C0FF72]/10 text-[#C0FF72]  border-[#C0FF72]/20",
    blue: "bg-blue-500/10  text-blue-400   border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    green: "bg-green-500/10 text-green-400  border-green-500/20",
    red: "bg-red-500/10   text-red-400    border-red-500/20",
    gray: "bg-white/5      text-gray-400   border-white/10",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${palette[color] ?? palette.gray}`}
    >
      {icon && <span className="opacity-80">{icon}</span>}
      {children}
    </span>
  );
}

function Icon({ id, className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 640 640" aria-hidden="true">
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}

function CompanyAvatar({ src, name, size = "md" }) {
  const [err, setErr] = useState(false);
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-sm";
  const initials = (name ?? "E")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        className={`${sizeClass} rounded-xl object-cover border border-white/10 flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-xl bg-gradient-to-br from-[#C0FF72]/20 to-[#C0FF72]/5 border border-[#C0FF72]/15 flex items-center justify-center flex-shrink-0 font-display font-bold text-[#C0FF72]`}
    >
      {initials}
    </div>
  );
}

export default function OfertaCard({
  oferta,
  isEmpresa = false,
  isEstudiante = false,
  isTutorCentro = false, // ← NUEVO
  yaPostulado = false,
  onVerDetalle,
  onVerCandidatos,
  onEdit,
  onDelete,
  onPostular,
  onRetirar,
  onRecomendar, // ← NUEVO
  onCerrar,
}) {
  const meta = TIPO_META[oferta.tipo_oferta] ?? {
    label: "Oferta",
    accent: "#6b7280",
    colorClass: "gray",
  };
  const empresa = oferta.empresa_nombre ?? "Empresa";
  const tecnologias = oferta.tecnologias ?? [];

  const stripColor =
    {
      blue: "from-blue-500/70   to-blue-500/10",
      green: "from-green-500/70  to-green-500/10",
      purple: "from-purple-500/70 to-purple-500/10",
      gray: "from-gray-500/40   to-gray-500/10",
    }[meta.colorClass] ?? "from-gray-500/40 to-gray-500/10";

  return (
    <article className="group relative bg-dark-800 border border-white/8 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-0.5">
      {/* Franja superior */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${stripColor}`} />

      <div className="p-5 flex flex-col gap-3.5 flex-1">
        {/* Cabecera */}
        <div className="flex items-start gap-3">
          <CompanyAvatar src={oferta.empresa_avatar} name={empresa} />

          <div className="flex-1 min-w-0">
            <button
              onClick={() => onVerDetalle?.(oferta)}
              className="block text-left w-full"
            >
              <h3 className="font-display font-bold text-white text-[15px] leading-snug hover:text-[#C0FF72] transition-colors line-clamp-2">
                {oferta.titulo}
              </h3>
            </button>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Icon
                id="icon-building"
                className="w-3 h-3 text-gray-600 flex-shrink-0"
              />
              <p className="text-gray-500 text-xs truncate">{empresa}</p>
            </div>
          </div>

          {/* Estado (empresa) */}
          {isEmpresa && oferta.estado && (
            <div className="flex-shrink-0">
              {oferta.estado === "activa" && (
                <Badge color="green">Activa</Badge>
              )}
              {oferta.estado === "pendiente" && (
                <Badge color="orange">Revisión</Badge>
              )}
              {oferta.estado === "rechazada" && (
                <Badge color="red">Rechazada</Badge>
              )}
              {oferta.estado === "cerrada" && (
                <Badge color="gray">Cerrada</Badge>
              )}
            </div>
          )}

          {/* Postulado (estudiante) */}
          {isEstudiante && yaPostulado && (
            <div className="flex-shrink-0">
              <Badge color="brand">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Postulado
              </Badge>
            </div>
          )}
        </div>

        {/* Badges tipo + modalidad + contrato */}
        <div className="flex flex-wrap gap-1.5">
          <Badge color={meta.colorClass}>{meta.label}</Badge>
          {oferta.modalidad === "Presencial" && (
            <Badge color="gray">
              <Icon id="icon-building" className="w-3 h-3" />
              Presencial
            </Badge>
          )}
          {oferta.modalidad === "Remoto" && (
            <Badge color="gray">
              <Icon id="icon-globe" className="w-3 h-3" />
              Remoto
            </Badge>
          )}
          {oferta.modalidad === "Híbrido" && (
            <Badge color="gray">
              <Icon id="icon-globe" className="w-3 h-3" />
              Híbrido
            </Badge>
          )}
          {oferta.opcion_contrato && (
            <Badge color="green">
              <Icon id="icon-handshake" className="w-3 h-3" />
              Opción contrato
            </Badge>
          )}
        </div>

        {/* Descripción */}
        {oferta.descripcion && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
            {oferta.descripcion}
          </p>
        )}

        {/* Tecnologías */}
        {tecnologias.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tecnologias.slice(0, 4).map((t) => (
              <span
                key={t.id_tecnologia ?? t}
                className="bg-white/4 border border-white/8 text-gray-400 text-[10px] px-2 py-0.5 rounded-md font-mono tracking-tight"
              >
                {t.nombre ?? t}
              </span>
            ))}
            {tecnologias.length > 4 && (
              <span className="text-gray-600 text-[10px] px-1.5 py-0.5 rounded-md bg-white/3 border border-white/5">
                +{tecnologias.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-3 border-t border-white/5 mt-auto">
          {oferta.ubicacion && (
            <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
              <svg
                className="w-3 h-3 flex-shrink-0 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span className="truncate">{oferta.ubicacion}</span>
            </div>
          )}
          {oferta.duracion_semanas && (
            <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
              <Icon
                id="icon-clock"
                className="w-3 h-3 flex-shrink-0 text-gray-600"
              />
              <span>{oferta.duracion_semanas} semanas</span>
            </div>
          )}
          {oferta.horas_semanales && (
            <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
              <Icon
                id="icon-hourglass"
                className="w-3 h-3 flex-shrink-0 text-gray-600"
              />
              <span>{oferta.horas_semanales} h/semana</span>
            </div>
          )}
          {oferta.num_plazas_restantes != null && (
            <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
              <Icon
                id="icon-user"
                className="w-3 h-3 flex-shrink-0 text-gray-600"
              />
              <span>
                {oferta.num_plazas_restantes} plaza
                {oferta.num_plazas_restantes !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          {oferta.salario_mensual ? (
            <div className="flex items-center gap-1 text-[#C0FF72] text-[11px] font-semibold">
              <span className="text-[10px] opacity-70">€</span>
              <span>{oferta.salario_mensual}/mes</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
              <span>No remunerado</span>
            </div>
          )}
          {oferta.fecha_fin_solicitud && (
            <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
              <svg
                className="w-3 h-3 flex-shrink-0"
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
              <span>
                Cierre{" "}
                {new Date(oferta.fecha_fin_solicitud).toLocaleDateString(
                  "es-ES",
                  { day: "numeric", month: "short" },
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: acciones */}
      <div className="px-5 pb-4 flex gap-2 flex-wrap">
        {/* Ver detalle — siempre */}
        <button
          onClick={() => onVerDetalle?.(oferta)}
          className="flex-1 text-[11px] font-medium py-2 rounded-xl bg-white/4 hover:bg-white/8 text-gray-400 hover:text-white transition-all border border-white/8 hover:border-white/15"
        >
          Ver detalle
        </button>

        {/* ── Estudiante ── */}
        {isEstudiante &&
          !isEmpresa &&
          (yaPostulado ? (
            <button
              onClick={() => onRetirar?.(oferta)}
              className="flex-1 text-[11px] font-medium py-2 rounded-xl bg-red-500/8 hover:bg-red-500/15 text-red-400/80 hover:text-red-300 transition-all border border-red-500/15 hover:border-red-500/30 flex items-center justify-center gap-1.5"
            >
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Retirar
            </button>
          ) : (
            <button
              onClick={() => onPostular?.(oferta)}
              className="flex-1 text-[11px] font-semibold py-2 rounded-xl bg-[#C0FF72]/12 hover:bg-[#C0FF72]/20 text-[#C0FF72] transition-all border border-[#C0FF72]/20 hover:border-[#C0FF72]/35 flex items-center justify-center gap-1.5"
            >
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
              Postularme
            </button>
          ))}

        {/* ── Tutor de centro — botón Recomendar ── */}
        {isTutorCentro && onRecomendar && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRecomendar(oferta);
            }}
            className="flex-1 text-[11px] font-semibold py-2 rounded-xl bg-[#C0FF72]/10 hover:bg-[#C0FF72]/18 text-[#C0FF72] transition-all border border-[#C0FF72]/20 hover:border-[#C0FF72]/40 flex items-center justify-center gap-1.5"
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
            Recomendar
          </button>
        )}

        {/* ── Empresa ── */}
        {isEmpresa && (
          <>
            <button
              onClick={() => onVerCandidatos?.(oferta)}
              className="flex-1 text-[11px] font-medium py-2 rounded-xl bg-[#C0FF72]/8 hover:bg-[#C0FF72]/15 text-[#C0FF72] hover:text-[#d7ffab] transition-all border border-[#C0FF72]/15 hover:border-[#C0FF72]/30 flex items-center justify-center gap-1.5"
            >
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              Candidatos
            </button>
            <button
              onClick={() => onEdit?.(oferta)}
              className="flex-1 text-[11px] font-medium py-2 rounded-xl bg-white/4 hover:bg-white/8 text-gray-400 hover:text-white transition-all border border-white/8 flex items-center justify-center gap-1.5"
            >
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </button>
            <button
              onClick={() => onDelete?.(oferta.id_oferta)}
              className="flex-1 text-[11px] font-medium py-2 rounded-xl bg-red-500/5 hover:bg-red-500/12 text-red-500/60 hover:text-red-400 transition-all border border-red-500/10 hover:border-red-500/25 flex items-center justify-center gap-1.5"
            >
              <svg
                className="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
              Eliminar
            </button>
          </>
        )}
      </div>
    </article>
  );
}
