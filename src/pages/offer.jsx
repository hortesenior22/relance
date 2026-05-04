import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/layout/MainLayout";

// ─── Constantes ────────────────────────────────────────────────────────────
const MODALIDADES = ["Presencial", "Remoto", "Híbrido"];
const TIPOS = [
  { id: "practicas", label: "Solo prácticas" },
  { id: "practicas_contratacion", label: "Prácticas + contratación" },
  { id: "empleo_junior", label: "Empleo junior" },
];
const DURACIONES = [
  { val: 4, label: "1 mes" },
  { val: 8, label: "2 meses" },
  { val: 12, label: "3 meses" },
  { val: 16, label: "4 meses" },
  { val: 24, label: "6 meses" },
  { val: 48, label: "12 meses" },
];

// ─── Helpers UI ────────────────────────────────────────────────────────────
function Badge({ children, color = "brand" }) {
  const cls = {
    brand: "bg-brand/10 text-brand border-brand/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    gray: "bg-white/5 text-gray-400 border-white/10",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
  }[color];
  return (
    <span
      className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {children}
    </span>
  );
}

function Spinner({ className = "w-5 h-5" }) {
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

// Mapa tipo → colores
const tipoMeta = {
  practicas: { label: "Prácticas", color: "blue" },
  practicas_contratacion: { label: "Prácticas + contratación", color: "green" },
  empleo_junior: { label: "Empleo junior", color: "purple" },
};
const modalidadIcon = {
  Presencial: "🏢",
  Remoto: "🌐",
  Híbrido: "⚡",
};

// ─── Tarjeta de oferta ─────────────────────────────────────────────────────
function OfertaCard({ oferta, onVerDetalle, isEmpresa, onEdit, onDelete }) {
  const meta = tipoMeta[oferta.tipo_oferta] ?? {
    label: "Oferta",
    color: "gray",
  };
  const empresa = oferta.empresa_nombre ?? "Empresa";
  const tecnologias = oferta.tecnologias ?? [];

  return (
    <article className="group relative bg-dark-800 border border-white/10 rounded-2xl p-5 hover:border-brand/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand/5 cursor-pointer flex flex-col gap-4">
      {/* Estado (solo visible para empresa) */}
      {isEmpresa && oferta.estado && (
        <div className="absolute top-4 right-4">
          {oferta.estado === "activa" && <Badge color="green">✓ Activa</Badge>}
          {oferta.estado === "pendiente" && (
            <Badge color="orange">⏳ Pendiente</Badge>
          )}
          {oferta.estado === "rechazada" && (
            <Badge color="gray">✗ Rechazada</Badge>
          )}
          {oferta.estado === "cerrada" && <Badge color="gray">Cerrada</Badge>}
        </div>
      )}

      <div onClick={() => onVerDetalle(oferta)} className="flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Logo empresa placeholder */}
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
            {oferta.empresa_avatar ? (
              <img
                src={oferta.empresa_avatar}
                alt={empresa}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <svg className="w-5 h-5 text-brand" viewBox="0 0 640 640">
                <use href="/icons.svg#icon-building" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-white text-base leading-tight truncate pr-16">
              {oferta.titulo}
            </h3>
            <p className="text-gray-400 text-sm truncate">{empresa}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge color={meta.color}>{meta.label}</Badge>
          {oferta.modalidad && (
            <Badge color="gray">
              {modalidadIcon[oferta.modalidad]} {oferta.modalidad}
            </Badge>
          )}
          {oferta.ubicacion && (
            <Badge color="gray">📍 {oferta.ubicacion}</Badge>
          )}
          {oferta.opcion_contrato && (
            <Badge color="green">💼 Opción de contratación</Badge>
          )}
        </div>

        {/* Descripción */}
        {oferta.descripcion && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
            {oferta.descripcion}
          </p>
        )}

        {/* Tecnologías */}
        {tecnologias.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tecnologias.slice(0, 5).map((t) => (
              <span
                key={t.id_tecnologia ?? t}
                className="bg-white/5 border border-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full"
              >
                {t.nombre ?? t}
              </span>
            ))}
            {tecnologias.length > 5 && (
              <span className="text-gray-600 text-xs px-2 py-0.5">
                +{tecnologias.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          {oferta.duracion_semanas && (
            <span>⏱ {oferta.duracion_semanas} semanas</span>
          )}
          {oferta.horas_semanales && (
            <span>🕐 {oferta.horas_semanales} h/semana</span>
          )}
          {oferta.num_plazas_restantes != null && (
            <span>
              👥 {oferta.num_plazas_restantes} plaza
              {oferta.num_plazas_restantes !== 1 ? "s" : ""} disponible
              {oferta.num_plazas_restantes !== 1 ? "s" : ""}
            </span>
          )}
          {oferta.salario_mensual && (
            <span>💶 {oferta.salario_mensual} €/mes</span>
          )}
        </div>
      </div>

      {/* Acciones empresa */}
      {isEmpresa && (
        <div className="flex gap-2 pt-3 border-t border-white/5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(oferta);
            }}
            className="flex-1 text-xs py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1.5"
          >
            <svg
              className="w-3.5 h-3.5"
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
            onClick={(e) => {
              e.stopPropagation();
              onDelete(oferta.id_oferta);
            }}
            className="flex-1 text-xs py-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500/70 hover:text-red-400 transition-all flex items-center justify-center gap-1.5"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Eliminar
          </button>
        </div>
      )}
    </article>
  );
}

// ─── Modal crear / editar oferta ───────────────────────────────────────────
function OfertaModal({ oferta, onClose, onSaved }) {
  const { user } = useAuth();
  const esEdicion = !!oferta;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [techInput, setTechInput] = useState("");
  const [tecnosSugeridas, setTecnosSugeridas] = useState([]);

  const [form, setForm] = useState({
    titulo: oferta?.titulo ?? "",
    descripcion: oferta?.descripcion ?? "",
    tipo_oferta: oferta?.tipo_oferta ?? "practicas",
    modalidad: oferta?.modalidad ?? "",
    ubicacion: oferta?.ubicacion ?? "",
    duracion_semanas: oferta?.duracion_semanas ?? "",
    horas_semanales: oferta?.horas_semanales ?? "",
    num_plazas: oferta?.num_plazas ?? "",
    opcion_contrato: oferta?.opcion_contrato ?? false,
    requisitos_adicionales: oferta?.requisitos_adicionales ?? "",
    beneficios: oferta?.beneficios ?? "",
    salario_mensual: oferta?.salario_mensual ?? "",
    fecha_inicio: oferta?.fecha_inicio ?? "",
    fecha_fin_solicitud: oferta?.fecha_fin_solicitud ?? "",
    tecnologias: oferta?.tecnologias ?? [],
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Buscar tecnologías existentes
  const buscarTecnologias = useCallback(async (q) => {
    if (q.length < 1) {
      setTecnosSugeridas([]);
      return;
    }
    const { data } = await supabase
      .from("tecnologia")
      .select("id_tecnologia, nombre")
      .ilike("nombre", `%${q}%`)
      .limit(8);
    setTecnosSugeridas(data ?? []);
  }, []);

  const handleTechChange = (e) => {
    setTechInput(e.target.value);
    buscarTecnologias(e.target.value);
  };

  const addTech = async (nombre) => {
    // Buscar si ya existe
    let { data } = await supabase
      .from("tecnologia")
      .select("id_tecnologia, nombre")
      .ilike("nombre", nombre)
      .maybeSingle();

    if (!data) {
      // Crear nueva tecnología
      const { data: nueva } = await supabase
        .from("tecnologia")
        .insert({ nombre })
        .select()
        .single();
      data = nueva;
    }
    if (
      data &&
      !form.tecnologias.find((t) => t.id_tecnologia === data.id_tecnologia)
    ) {
      setForm((f) => ({ ...f, tecnologias: [...f.tecnologias, data] }));
    }
    setTechInput("");
    setTecnosSugeridas([]);
  };

  const handleTechKey = async (e) => {
    if (e.key === "Enter" && techInput.trim()) {
      e.preventDefault();
      await addTech(techInput.trim());
    }
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      // Obtener id_empresa
      const { data: emp } = await supabase
        .from("empresa")
        .select("id_empresa")
        .eq("id_usuario", user.id)
        .maybeSingle();

      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        tipo_oferta: form.tipo_oferta,
        modalidad: form.modalidad || null,
        ubicacion: form.ubicacion.trim() || null,
        duracion_semanas:
          form.duracion_semanas !== "" ? Number(form.duracion_semanas) : null,
        horas_semanales:
          form.horas_semanales !== "" ? Number(form.horas_semanales) : null,
        num_plazas: form.num_plazas !== "" ? Number(form.num_plazas) : null,
        num_plazas_restantes:
          form.num_plazas !== "" ? Number(form.num_plazas) : null,
        opcion_contrato: form.opcion_contrato,
        requisitos_adicionales: form.requisitos_adicionales.trim() || null,
        beneficios: form.beneficios.trim() || null,
        salario_mensual:
          form.salario_mensual !== "" ? Number(form.salario_mensual) : null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin_solicitud: form.fecha_fin_solicitud || null,
        estado: "pendiente",
        fecha_modificacion: new Date().toISOString(),
        id_empresa: emp?.id_empresa ?? null,
      };

      let idOferta;
      if (esEdicion) {
        const { error: upErr } = await supabase
          .from("oferta")
          .update(payload)
          .eq("id_oferta", oferta.id_oferta);
        if (upErr) throw upErr;
        idOferta = oferta.id_oferta;
      } else {
        const { data: nueva, error: insErr } = await supabase
          .from("oferta")
          .insert({ ...payload, fecha_publicacion: new Date().toISOString() })
          .select("id_oferta")
          .single();
        if (insErr) throw insErr;
        idOferta = nueva.id_oferta;
      }

      // Gestionar tecnologías: borrar las anteriores y reinsertar
      await supabase
        .from("oferta_tecnologia")
        .delete()
        .eq("id_oferta", idOferta);
      if (form.tecnologias.length > 0) {
        await supabase
          .from("oferta_tecnologia")
          .insert(
            form.tecnologias.map((t) => ({
              id_oferta: idOferta,
              id_tecnologia: t.id_tecnologia,
            })),
          );
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message ?? "Error al guardar la oferta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-dark-800 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display text-xl font-bold text-white">
            {esEdicion ? "Editar oferta" : "Crear nueva oferta"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Aviso validación */}
          {!esEdicion && (
            <div className="bg-brand/5 border border-brand/20 rounded-xl px-4 py-3 flex gap-3">
              <svg
                className="w-4 h-4 text-brand flex-shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-xs text-gray-400">
                Las ofertas son revisadas por el equipo de Relance antes de ser
                visibles para los estudiantes. El proceso suele tardar menos de
                24 h.
              </p>
            </div>
          )}

          {/* Tipo de oferta */}
          <div>
            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">
              Tipo de oferta *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tipo_oferta: t.id }))}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${form.tipo_oferta === t.id ? "border-brand bg-brand/10 text-brand" : "border-white/10 text-gray-400 hover:border-white/20"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Título del puesto *
            </label>
            <input
              type="text"
              value={form.titulo}
              onChange={set("titulo")}
              placeholder="Ej: Desarrollador Frontend React"
              className="input-field"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Descripción del puesto
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  descripcion: e.target.value.slice(0, 1000),
                }))
              }
              rows={4}
              placeholder="Describe las tareas, responsabilidades y el equipo con el que trabajará el candidato..."
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-600 mt-1 text-right">
              {form.descripcion.length}/1000
            </p>
          </div>

          {/* Modalidad + Ubicación */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Modalidad
              </label>
              <select
                value={form.modalidad}
                onChange={set("modalidad")}
                className="input-field"
              >
                <option value="">Seleccionar</option>
                {MODALIDADES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Ubicación
              </label>
              <input
                type="text"
                value={form.ubicacion}
                onChange={set("ubicacion")}
                placeholder="Ej: Madrid, Córdoba..."
                className="input-field"
              />
            </div>
          </div>

          {/* Duración + Horas + Plazas */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Duración
              </label>
              <select
                value={form.duracion_semanas}
                onChange={set("duracion_semanas")}
                className="input-field"
              >
                <option value="">Seleccionar</option>
                {DURACIONES.map((d) => (
                  <option key={d.val} value={d.val}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Horas/semana
              </label>
              <input
                type="number"
                value={form.horas_semanales}
                onChange={set("horas_semanales")}
                placeholder="20"
                min="1"
                max="40"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Plazas
              </label>
              <input
                type="number"
                value={form.num_plazas}
                onChange={set("num_plazas")}
                placeholder="1"
                min="1"
                className="input-field"
              />
            </div>
          </div>

          {/* Fechas + Salario */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Fecha de inicio
              </label>
              <input
                type="date"
                value={form.fecha_inicio}
                onChange={set("fecha_inicio")}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Cierre de solicitudes
              </label>
              <input
                type="date"
                value={form.fecha_fin_solicitud}
                onChange={set("fecha_fin_solicitud")}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Remuneración €/mes
              </label>
              <input
                type="number"
                value={form.salario_mensual}
                onChange={set("salario_mensual")}
                placeholder="0 = no remunerado"
                min="0"
                className="input-field"
              />
            </div>
          </div>

          {/* Opción de contratación */}
          <div className="flex items-center gap-3 p-3 bg-dark border border-white/8 rounded-xl">
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, opcion_contrato: !f.opcion_contrato }))
              }
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${form.opcion_contrato ? "bg-brand" : "bg-white/15"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${form.opcion_contrato ? "translate-x-5" : ""}`}
              />
            </button>
            <div>
              <p className="text-sm text-white font-medium">
                Opción de contratación
              </p>
              <p className="text-xs text-gray-500">
                Existe posibilidad de incorporación al finalizar las prácticas
              </p>
            </div>
          </div>

          {/* Tecnologías */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Tecnologías requeridas
            </label>
            <div className="relative">
              <input
                type="text"
                value={techInput}
                onChange={handleTechChange}
                onKeyDown={handleTechKey}
                placeholder="Escribe y pulsa Enter o selecciona (React, Python, SQL...)"
                className="input-field"
                autoComplete="off"
              />
              {tecnosSugeridas.length > 0 && (
                <div className="absolute z-20 top-full mt-1 w-full bg-dark-800 border border-white/15 rounded-xl overflow-hidden shadow-xl">
                  {tecnosSugeridas.map((t) => (
                    <button
                      key={t.id_tecnologia}
                      type="button"
                      onClick={() => addTech(t.nombre)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/8 hover:text-white transition-colors border-b border-white/5 last:border-0"
                    >
                      {t.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.tecnologias.map((t) => (
                <span
                  key={t.id_tecnologia}
                  className="flex items-center gap-1 bg-brand/10 border border-brand/20 text-brand text-xs px-2.5 py-1 rounded-full"
                >
                  {t.nombre}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        tecnologias: f.tecnologias.filter(
                          (x) => x.id_tecnologia !== t.id_tecnologia,
                        ),
                      }))
                    }
                    className="text-brand/60 hover:text-brand"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Requisitos adicionales */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Requisitos adicionales
            </label>
            <textarea
              value={form.requisitos_adicionales}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  requisitos_adicionales: e.target.value.slice(0, 500),
                }))
              }
              rows={2}
              placeholder="Nivel de inglés, carnet de conducir, disponibilidad inmediata..."
              className="input-field resize-none"
            />
          </div>

          {/* Beneficios */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Beneficios ofrecidos
            </label>
            <textarea
              value={form.beneficios}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  beneficios: e.target.value.slice(0, 500),
                }))
              }
              rows={2}
              placeholder="Teletrabajo flexible, formación interna, buen ambiente de equipo..."
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Spinner className="w-4 h-4" /> Guardando...
                </>
              ) : esEdicion ? (
                "Guardar cambios"
              ) : (
                "Publicar oferta"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal detalle oferta ──────────────────────────────────────────────────
function DetalleModal({
  oferta,
  onClose,
  onPostular,
  yaPostulado,
  isEstudiante,
}) {
  const meta = tipoMeta[oferta.tipo_oferta] ?? {
    label: "Oferta",
    color: "gray",
  };
  const tecnologias = oferta.tecnologias ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-dark-800 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
              {oferta.empresa_avatar ? (
                <img
                  src={oferta.empresa_avatar}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <svg className="w-5 h-5 text-brand" viewBox="0 0 640 640">
                  <use href="/icons.svg#icon-building" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-lg leading-tight">
                {oferta.titulo}
              </h2>
              <p className="text-gray-400 text-sm">{oferta.empresa_nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge color={meta.color}>{meta.label}</Badge>
            {oferta.modalidad && (
              <Badge color="gray">
                {modalidadIcon[oferta.modalidad]} {oferta.modalidad}
              </Badge>
            )}
            {oferta.ubicacion && (
              <Badge color="gray">📍 {oferta.ubicacion}</Badge>
            )}
            {oferta.opcion_contrato && (
              <Badge color="green">💼 Opción de contratación</Badge>
            )}
            {oferta.salario_mensual ? (
              <Badge color="brand">💶 {oferta.salario_mensual} €/mes</Badge>
            ) : (
              <Badge color="gray">No remunerado</Badge>
            )}
          </div>

          {/* Datos rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Duración",
                val: oferta.duracion_semanas
                  ? `${oferta.duracion_semanas} semanas`
                  : "-",
              },
              {
                label: "Horas/semana",
                val: oferta.horas_semanales
                  ? `${oferta.horas_semanales} h`
                  : "-",
              },
              {
                label: "Plazas",
                val:
                  oferta.num_plazas_restantes != null
                    ? `${oferta.num_plazas_restantes} disponibles`
                    : "-",
              },
              {
                label: "Cierre",
                val: oferta.fecha_fin_solicitud
                  ? new Date(oferta.fecha_fin_solicitud).toLocaleDateString(
                      "es-ES",
                    )
                  : "-",
              },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="bg-dark border border-white/8 rounded-xl p-3 text-center"
              >
                <p className="text-gray-600 text-xs mb-1">{label}</p>
                <p className="text-white text-sm font-semibold font-display">
                  {val}
                </p>
              </div>
            ))}
          </div>

          {/* Descripción */}
          {oferta.descripcion && (
            <div>
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Descripción
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {oferta.descripcion}
              </p>
            </div>
          )}

          {/* Tecnologías */}
          {tecnologias.length > 0 && (
            <div>
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Tecnologías
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {tecnologias.map((t) => (
                  <span
                    key={t.id_tecnologia}
                    className="bg-brand/10 border border-brand/20 text-brand text-xs px-2.5 py-1 rounded-full"
                  >
                    {t.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requisitos */}
          {oferta.requisitos_adicionales && (
            <div>
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Requisitos adicionales
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {oferta.requisitos_adicionales}
              </p>
            </div>
          )}

          {/* Beneficios */}
          {oferta.beneficios && (
            <div>
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Beneficios
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {oferta.beneficios}
              </p>
            </div>
          )}

          {/* Acción estudiante */}
          {isEstudiante && (
            <div className="pt-2 border-t border-white/10">
              {yaPostulado ? (
                <div className="flex items-center justify-center gap-2 py-3 text-brand text-sm font-medium">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Ya te has postulado a esta oferta
                </div>
              ) : (
                <button
                  onClick={() => onPostular(oferta)}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22l-4-9-9-4 20-7z" />
                  </svg>
                  Postularme a esta oferta
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal postulación ──────────────────────────────────────────────────────
function PostulacionModal({ oferta, onClose, onSuccess }) {
  const { user } = useAuth();
  const [mensaje, setMensaje] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handlePostular = async () => {
    setSending(true);
    setError(null);
    try {
      const { data: est } = await supabase
        .from("estudiante")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      const { error: err } = await supabase.from("candidatura").insert({
        id_oferta: oferta.id_oferta,
        id_estudiante: est?.id ?? user.id,
        mensaje: mensaje.trim() || null,
        estado: "pendiente",
        fecha_solicitud: new Date().toISOString(),
      });
      if (err) throw err;
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-6">
        <h2 className="font-display text-xl font-bold text-white mb-1">
          Postularme
        </h2>
        <p className="text-gray-500 text-sm mb-5">
          Vas a postularte a{" "}
          <strong className="text-white">{oferta.titulo}</strong> en{" "}
          <strong className="text-white">{oferta.empresa_nombre}</strong>.
        </p>
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1.5">
            Mensaje de presentación (opcional)
          </label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value.slice(0, 500))}
            rows={4}
            placeholder="Cuéntale a la empresa por qué eres el candidato ideal..."
            className="input-field resize-none"
          />
          <p className="text-xs text-gray-600 mt-1 text-right">
            {mensaje.length}/500
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={handlePostular}
            disabled={sending}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {sending ? (
              <>
                <Spinner className="w-4 h-4" /> Enviando...
              </>
            ) : (
              "Confirmar postulación"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ───────────────────────────────────────────────────────
export default function OfertasPage() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  const isEmpresa = userRole === "empresa";
  const isEstudiante = userRole === "estudiante";

  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postulaciones, setPostulaciones] = useState(new Set());

  // Filtros
  const [search, setSearch] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroContrato, setFiltroContrato] = useState("");
  const [filtroTech, setFiltroTech] = useState("");

  // Modales
  const [modalCrear, setModalCrear] = useState(null); // null | 'crear' | oferta (editar)
  const [detalleOferta, setDetalleOferta] = useState(null);
  const [postulacionOferta, setPostulacionOferta] = useState(null);

  const cargarOfertas = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("oferta")
      .select(
        `
        id_oferta, titulo, descripcion, modalidad, ubicacion,
        duracion_semanas, horas_semanales, num_plazas, num_plazas_restantes,
        opcion_contrato, estado, fecha_publicacion, fecha_fin_solicitud,
        tipo_oferta, salario_mensual, requisitos_adicionales, beneficios, id_empresa,
        empresa:empresa(id_empresa, nombre, id_usuario,
          usuario:id_usuario(avatar_url)
        ),
        oferta_tecnologia(tecnologia(id_tecnologia, nombre))
      `,
      )
      .order("fecha_publicacion", { ascending: false });

    // Las empresas ven sus propias (todos los estados); el resto solo activas
    if (isEmpresa) {
      const { data: emp } = await supabase
        .from("empresa")
        .select("id_empresa")
        .eq("id_usuario", user.id)
        .maybeSingle();
      if (emp) query = query.eq("id_empresa", emp.id_empresa);
    } else {
      query = query.eq("estado", "activa");
    }

    const { data, error } = await query;
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const normalizadas = (data ?? []).map((o) => ({
      ...o,
      empresa_nombre: o.empresa?.nombre ?? "Empresa",
      empresa_avatar: o.empresa?.usuario?.avatar_url ?? null,
      tecnologias:
        o.oferta_tecnologia?.map((ot) => ot.tecnologia).filter(Boolean) ?? [],
    }));

    setOfertas(normalizadas);
    setLoading(false);
  }, [user, isEmpresa]);

  // Cargar postulaciones del estudiante
  const cargarPostulaciones = useCallback(async () => {
    if (!isEstudiante || !user) return;
    const { data } = await supabase
      .from("candidatura")
      .select("id_oferta")
      .eq("id_estudiante", user.id);
    setPostulaciones(new Set((data ?? []).map((c) => c.id_oferta)));
  }, [isEstudiante, user]);

  useEffect(() => {
    cargarOfertas();
    cargarPostulaciones();
  }, [cargarOfertas, cargarPostulaciones]);

  const handleDelete = async (idOferta) => {
    if (
      !window.confirm(
        "¿Eliminar esta oferta? Esta acción no se puede deshacer.",
      )
    )
      return;
    await supabase.from("oferta_tecnologia").delete().eq("id_oferta", idOferta);
    await supabase.from("oferta").delete().eq("id_oferta", idOferta);
    cargarOfertas();
  };

  // Filtrado local
  const ofertasFiltradas = ofertas.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.titulo?.toLowerCase().includes(q) ||
      o.empresa_nombre?.toLowerCase().includes(q) ||
      o.ubicacion?.toLowerCase().includes(q);
    const matchModalidad = !filtroModalidad || o.modalidad === filtroModalidad;
    const matchTipo = !filtroTipo || o.tipo_oferta === filtroTipo;
    const matchContrato =
      !filtroContrato ||
      (filtroContrato === "si" ? o.opcion_contrato : !o.opcion_contrato);
    const matchTech =
      !filtroTech ||
      o.tecnologias.some((t) =>
        t.nombre?.toLowerCase().includes(filtroTech.toLowerCase()),
      );
    return (
      matchSearch && matchModalidad && matchTipo && matchContrato && matchTech
    );
  });

  const filtrosActivos = [
    filtroModalidad,
    filtroTipo,
    filtroContrato,
    filtroTech,
  ].filter(Boolean).length;

  return (
    <MainLayout>
      <div className="min-h-screen bg-dark">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl font-bold text-white">
                {isEmpresa ? "Mis ofertas" : "Ofertas de prácticas"}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {isEmpresa
                  ? "Gestiona y publica tus ofertas de prácticas o empleo"
                  : `${ofertasFiltradas.length} oferta${ofertasFiltradas.length !== 1 ? "s" : ""} disponible${ofertasFiltradas.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Botón crear (solo empresa) */}
            {isEmpresa && (
              <button
                onClick={() => setModalCrear("crear")}
                className="btn-primary flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Crear oferta
              </button>
            )}
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-4 mb-6 space-y-3">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título, empresa o ubicación..."
                className="input-field pl-9"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filtroModalidad}
                onChange={(e) => setFiltroModalidad(e.target.value)}
                className="input-field text-sm py-1.5 w-auto flex-shrink-0"
              >
                <option value="">Modalidad</option>
                {MODALIDADES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="input-field text-sm py-1.5 w-auto flex-shrink-0"
              >
                <option value="">Tipo</option>
                {TIPOS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select
                value={filtroContrato}
                onChange={(e) => setFiltroContrato(e.target.value)}
                className="input-field text-sm py-1.5 w-auto flex-shrink-0"
              >
                <option value="">Contratación</option>
                <option value="si">Con opción de contrato</option>
                <option value="no">Solo prácticas</option>
              </select>
              <div className="relative flex-1 min-w-[160px]">
                <input
                  type="text"
                  value={filtroTech}
                  onChange={(e) => setFiltroTech(e.target.value)}
                  placeholder="Filtrar por tecnología..."
                  className="input-field text-sm py-1.5 w-full"
                />
              </div>
              {filtrosActivos > 0 && (
                <button
                  onClick={() => {
                    setFiltroModalidad("");
                    setFiltroTipo("");
                    setFiltroContrato("");
                    setFiltroTech("");
                  }}
                  className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all border border-white/10 flex items-center gap-1"
                >
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Limpiar ({filtrosActivos})
                </button>
              )}
            </div>
          </div>

          {/* Resultados */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="w-8 h-8" />
            </div>
          ) : ofertasFiltradas.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
              <svg
                className="w-12 h-12 text-gray-700 mx-auto mb-4"
                viewBox="0 0 640 640"
              >
                <use href="/icons.svg#icon-briefcase" />
              </svg>
              <p className="text-gray-500 font-medium">
                {isEmpresa
                  ? "Aún no has publicado ninguna oferta"
                  : "No hay ofertas disponibles con estos filtros"}
              </p>
              {isEmpresa && (
                <button
                  onClick={() => setModalCrear("crear")}
                  className="btn-primary mt-4"
                >
                  Crear primera oferta
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {ofertasFiltradas.map((o) => (
                <OfertaCard
                  key={o.id_oferta}
                  oferta={o}
                  onVerDetalle={setDetalleOferta}
                  isEmpresa={isEmpresa}
                  onEdit={(o) => setModalCrear(o)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal crear/editar */}
      {modalCrear && (
        <OfertaModal
          oferta={modalCrear === "crear" ? null : modalCrear}
          onClose={() => setModalCrear(null)}
          onSaved={cargarOfertas}
        />
      )}

      {/* Modal detalle */}
      {detalleOferta && !postulacionOferta && (
        <DetalleModal
          oferta={detalleOferta}
          onClose={() => setDetalleOferta(null)}
          isEstudiante={isEstudiante}
          yaPostulado={postulaciones.has(detalleOferta.id_oferta)}
          onPostular={(o) => {
            setPostulacionOferta(o);
            setDetalleOferta(null);
          }}
        />
      )}

      {/* Modal postulación */}
      {postulacionOferta && (
        <PostulacionModal
          oferta={postulacionOferta}
          onClose={() => setPostulacionOferta(null)}
          onSuccess={() => {
            setPostulaciones(
              (prev) => new Set([...prev, postulacionOferta.id_oferta]),
            );
            cargarOfertas();
          }}
        />
      )}
    </MainLayout>
  );
}
