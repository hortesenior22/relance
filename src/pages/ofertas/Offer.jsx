import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";

import OfertaCard from "./CardOffer";
import CandidatosModal from "./CandidatesModal";
import StudentProfileDrawer from "../profiles/StudentProfileDrawer";
import RecommendModalOffer from "./RecommendModalOffer";
import OfferDetailsModal from "./OfferDetailsModal";

// ── Constantes ────────────────────────────────────────────────────────────
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

// ─── Spinner ───────────────────────────────────────────────────────────────
function Spinner({ className = "w-5 h-5" }) {
  return (
    <svg
      className={`animate-spin text-[var(--color-brand)] ${className}`}
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
    let { data } = await supabase
      .from("tecnologia")
      .select("id_tecnologia, nombre")
      .ilike("nombre", nombre)
      .maybeSingle();
    if (!data) {
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
        id_empresa: user.id,
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

      await supabase
        .from("oferta_tecnologia")
        .delete()
        .eq("id_oferta", idOferta);
      if (form.tecnologias.length > 0) {
        await supabase.from("oferta_tecnologia").insert(
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(3,8,15,0.82)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative rounded-2xl"
        style={{
          background: "var(--color-surface-strong)",
          border: "1px solid var(--color-border-strong)",
        }}
      >
        <div
          className="sticky top-0 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl"
          style={{
            background: "var(--color-surface-strong)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="font-display text-xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            {esEdicion ? "Editar oferta" : "Crear nueva oferta"}
          </h2>
          <button
            onClick={onClose}
            style={{ color: "var(--color-text-muted)" }}
            className="hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}
          {!esEdicion && (
            <div
              className="rounded-xl px-4 py-3 flex gap-3"
              style={{
                background: "rgba(192,255,114,0.05)",
                border: "1px solid rgba(192,255,114,0.2)",
              }}
            >
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "var(--color-brand)" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Las ofertas son revisadas por el equipo de Relance antes de ser
                visibles para los estudiantes. El proceso suele tardar menos de
                24 h.
              </p>
            </div>
          )}

          {/* Tipo */}
          <div>
            <label
              className="block text-xs mb-2 uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              Tipo de oferta *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tipo_oferta: t.id }))}
                  className="py-2.5 px-3 rounded-xl text-xs font-medium transition-all"
                  style={{
                    border: `1px solid ${form.tipo_oferta === t.id ? "var(--color-brand)" : "var(--color-border-strong)"}`,
                    background:
                      form.tipo_oferta === t.id
                        ? "rgba(192,255,114,0.1)"
                        : "transparent",
                    color:
                      form.tipo_oferta === t.id
                        ? "var(--color-brand)"
                        : "var(--color-text-muted)",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label
              className="block text-xs mb-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
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
            <label
              className="block text-xs mb-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
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
              placeholder="Describe las tareas, responsabilidades y el equipo..."
              className="input-field resize-none"
            />
            <p
              className="text-xs mt-1 text-right"
              style={{ color: "var(--color-text-subtle)" }}
            >
              {form.descripcion.length}/1000
            </p>
          </div>

          {/* Modalidad + Ubicación */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-xs mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
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
              <label
                className="block text-xs mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
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
              <label
                className="block text-xs mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
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
              <label
                className="block text-xs mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
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
              <label
                className="block text-xs mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
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
              <label
                className="block text-xs mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
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
              <label
                className="block text-xs mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
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
              <label
                className="block text-xs mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
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

          {/* Toggle contrato */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-strong)",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, opcion_contrato: !f.opcion_contrato }))
              }
              className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
              style={{
                background: form.opcion_contrato
                  ? "var(--color-brand)"
                  : "var(--color-border-strong)",
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                style={{
                  transform: form.opcion_contrato ? "translateX(20px)" : "none",
                }}
              />
            </button>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-text)" }}
              >
                Opción de contratación
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Existe posibilidad de incorporación al finalizar las prácticas
              </p>
            </div>
          </div>

          {/* Tecnologías */}
          <div>
            <label
              className="block text-xs mb-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
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
                <div
                  className="absolute z-20 top-full mt-1 w-full rounded-xl overflow-hidden shadow-xl"
                  style={{
                    background: "var(--color-surface-elevated)",
                    border: "1px solid var(--color-border-strong)",
                  }}
                >
                  {tecnosSugeridas.map((t) => (
                    <button
                      key={t.id_tecnologia}
                      type="button"
                      onClick={() => addTech(t.nombre)}
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                      style={{
                        color: "var(--color-text-secondary)",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "var(--color-surface-strong)";
                        e.currentTarget.style.color = "var(--color-text)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color =
                          "var(--color-text-secondary)";
                      }}
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
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(192,255,114,0.1)",
                    border: "1px solid rgba(192,255,114,0.2)",
                    color: "var(--color-brand)",
                  }}
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
                    style={{ color: "rgba(192,255,114,0.6)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--color-brand)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(192,255,114,0.6)";
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Requisitos */}
          <div>
            <label
              className="block text-xs mb-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
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
            <label
              className="block text-xs mb-1.5"
              style={{ color: "var(--color-text-muted)" }}
            >
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

// ─── Modal postulación ─────────────────────────────────────────────────────
function PostulacionModal({ oferta, onClose, onSuccess }) {
  const { user } = useAuth();
  const [mensaje, setMensaje] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handlePostular = async () => {
    setSending(true);
    setError(null);
    try {
      const { error: err } = await supabase.from("candidatura").insert({
        id_oferta: oferta.id_oferta,
        id_estudiante: user.id,
        comentario_estudiante: mensaje.trim() || null,
        estado: "pendiente",
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
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(3,8,15,0.88)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md p-6 rounded-2xl"
        style={{
          background: "var(--color-surface-strong)",
          border: "1px solid var(--color-border-strong)",
        }}
      >
        <h2
          className="font-display text-xl font-bold mb-1"
          style={{ color: "var(--color-text)" }}
        >
          Postularme
        </h2>
        <p
          className="text-sm mb-5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Vas a postularte a{" "}
          <strong style={{ color: "var(--color-text)" }}>
            {oferta.titulo}
          </strong>{" "}
          en{" "}
          <strong style={{ color: "var(--color-text)" }}>
            {oferta.empresa_nombre}
          </strong>
          .
        </p>
        {error && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
            }}
          >
            {error}
          </div>
        )}
        <div className="mb-4">
          <label
            className="block text-xs mb-1.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            Mensaje de presentación (opcional)
          </label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value.slice(0, 500))}
            rows={4}
            placeholder="Cuéntale a la empresa por qué eres el candidato ideal..."
            className="input-field resize-none"
          />
          <p
            className="text-xs mt-1 text-right"
            style={{ color: "var(--color-text-subtle)" }}
          >
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

// ─── Modal retirar candidatura ─────────────────────────────────────────────
function RetirarModal({ oferta, onClose, onSuccess }) {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleRetirar = async () => {
    setSending(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from("candidatura")
        .delete()
        .eq("id_oferta", oferta.id_oferta)
        .eq("id_estudiante", user.id);
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
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(3,8,15,0.88)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm p-6 rounded-2xl"
        style={{
          background: "var(--color-surface-strong)",
          border: "1px solid var(--color-border-strong)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: "#f87171" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
            </svg>
          </div>
          <div>
            <h2
              className="font-display text-lg font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Retirar candidatura
            </h2>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>
        <p
          className="text-sm mb-5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ¿Seguro que quieres retirar tu candidatura a{" "}
          <strong style={{ color: "var(--color-text)" }}>
            {oferta.titulo}
          </strong>
          ?
        </p>
        {error && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
            }}
          >
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={handleRetirar}
            disabled={sending}
            className="flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            }}
          >
            {sending ? (
              <>
                <Spinner className="w-4 h-4" /> Retirando...
              </>
            ) : (
              "Confirmar retirada"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal cerrar oferta ───────────────────────────────────────────────────
function CerrarOfertaModal({ oferta, onClose, onSuccess }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleCerrar = async () => {
    setSending(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from("oferta")
        .update({
          estado: "cerrada",
          fecha_modificacion: new Date().toISOString(),
        })
        .eq("id_oferta", oferta.id_oferta);
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
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(3,8,15,0.88)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm p-6 rounded-2xl"
        style={{
          background: "var(--color-surface-strong)",
          border: "1px solid var(--color-border-strong)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(246,173,85,0.1)",
              border: "1px solid rgba(246,173,85,0.2)",
            }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: "#f6ad55" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
          </div>
          <div>
            <h2
              className="font-display text-lg font-bold"
              style={{ color: "var(--color-text)" }}
            >
              Cerrar oferta
            </h2>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Dejará de aceptar nuevas candidaturas
            </p>
          </div>
        </div>
        <p
          className="text-sm mb-5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ¿Quieres cerrar la oferta{" "}
          <strong style={{ color: "var(--color-text)" }}>
            {oferta.titulo}
          </strong>
          ? Los candidatos ya postulados no se verán afectados.
        </p>
        {error && (
          <div
            className="mb-4 rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
            }}
          >
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={handleCerrar}
            disabled={sending}
            className="flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{
              background: "rgba(246,173,85,0.1)",
              color: "#f6ad55",
              border: "1px solid rgba(246,173,85,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(246,173,85,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(246,173,85,0.1)";
            }}
          >
            {sending ? (
              <>
                <Spinner className="w-4 h-4" /> Cerrando...
              </>
            ) : (
              "Confirmar cierre"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Barra de filtros ──────────────────────────────────────────────────────
function FiltrosBar({
  search,
  setSearch,
  filtroModalidad,
  setFiltroModalidad,
  filtroTipo,
  setFiltroTipo,
  filtroContrato,
  setFiltroContrato,
  filtroTech,
  setFiltroTech,
}) {
  const filtrosActivos = [
    filtroModalidad,
    filtroTipo,
    filtroContrato,
    filtroTech,
  ].filter(Boolean).length;
  const limpiar = () => {
    setFiltroModalidad("");
    setFiltroTipo("");
    setFiltroContrato("");
    setFiltroTech("");
  };

  return (
    <div
      className="rounded-2xl p-4 mb-6 space-y-3"
      style={{
        background: "var(--color-surface-strong)",
        border: "1px solid var(--color-border-strong)",
      }}
    >
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--color-text-muted)" }}
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
            onClick={limpiar}
            className="text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
            style={{
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border-strong)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-text)";
              e.currentTarget.style.background =
                "var(--color-surface-elevated)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
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
  );
}

// ─── Tabs empresa ──────────────────────────────────────────────────────────
function TabsEmpresa({ tab, setTab, totalMisOfertas }) {
  return (
    <div
      className="flex gap-1 rounded-xl p-1 mb-6 w-fit"
      style={{
        background: "var(--color-surface-strong)",
        border: "1px solid var(--color-border-strong)",
      }}
    >
      <button
        onClick={() => setTab("explorar")}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
        style={{
          background:
            tab === "explorar"
              ? "var(--color-surface-elevated)"
              : "transparent",
          color:
            tab === "explorar"
              ? "var(--color-text)"
              : "var(--color-text-muted)",
        }}
      >
        Explorar ofertas
      </button>
      <button
        onClick={() => setTab("mis-ofertas")}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        style={{
          background:
            tab === "mis-ofertas" ? "rgba(192,255,114,0.12)" : "transparent",
          color:
            tab === "mis-ofertas"
              ? "var(--color-brand)"
              : "var(--color-text-muted)",
          border:
            tab === "mis-ofertas"
              ? "1px solid rgba(192,255,114,0.2)"
              : "1px solid transparent",
        }}
      >
        Mis ofertas
        {totalMisOfertas > 0 && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{
              background:
                tab === "mis-ofertas"
                  ? "rgba(192,255,114,0.2)"
                  : "var(--color-surface-elevated)",
              color:
                tab === "mis-ofertas"
                  ? "var(--color-brand)"
                  : "var(--color-text-muted)",
            }}
          >
            {totalMisOfertas}
          </span>
        )}
      </button>
    </div>
  );
}

// ─── Stats empresa ─────────────────────────────────────────────────────────
function EmpresaStats({ ofertas }) {
  const activas = ofertas.filter((o) => o.estado === "activa").length;
  const pendientes = ofertas.filter((o) => o.estado === "pendiente").length;
  const cerradas = ofertas.filter(
    (o) => o.estado === "cerrada" || o.estado === "rechazada",
  ).length;

  const stats = [
    {
      label: "Activas",
      val: activas,
      color: "#68d391",
      bg: "rgba(104,211,145,0.1)",
      border: "rgba(104,211,145,0.2)",
    },
    {
      label: "En revisión",
      val: pendientes,
      color: "#f6ad55",
      bg: "rgba(246,173,85,0.1)",
      border: "rgba(246,173,85,0.2)",
    },
    {
      label: "Cerradas",
      val: cerradas,
      color: "var(--color-text-muted)",
      bg: "var(--color-surface-elevated)",
      border: "var(--color-border-strong)",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map(({ label, val, color, bg, border }) => (
        <div
          key={label}
          className="rounded-2xl p-4 text-center"
          style={{ background: bg, border: `1px solid ${border}` }}
        >
          <p className="text-2xl font-display font-bold" style={{ color }}>
            {val}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Página principal ───────────────────────────────────────────────────────
export default function OfertasPage() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  const isEmpresa = userRole === "empresa";
  const isEstudiante = userRole === "estudiante";
  const isTutorCentro = userRole === "tutor_centro";

  // Datos
  const [ofertasPublicas, setOfertasPublicas] = useState([]);
  const [misOfertas, setMisOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postulaciones, setPostulaciones] = useState(new Set());

  // UI
  const [tab, setTab] = useState(isEmpresa ? "mis-ofertas" : "explorar");
  const [search, setSearch] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroContrato, setFiltroContrato] = useState("");
  const [filtroTech, setFiltroTech] = useState("");

  // Modales
  const [modalCrear, setModalCrear] = useState(null);
  const [detalleOferta, setDetalleOferta] = useState(null);
  const [postulacionOferta, setPostulacionOferta] = useState(null);
  const [retirarOferta, setRetirarOferta] = useState(null);
  const [cerrarOferta, setCerrarOferta] = useState(null);
  const [candidatosOferta, setCandidatosOferta] = useState(null);
  const [recomendarOferta, setRecomendarOferta] = useState(null);

  // ── Carga de ofertas públicas ──────────────────────────────────────────
  const cargarOfertasPublicas = useCallback(async () => {
    const { data, error } = await supabase
      .from("oferta")
      .select(
        `
        id_oferta, titulo, descripcion, modalidad, ubicacion,
        duracion_semanas, horas_semanales, num_plazas, num_plazas_restantes,
        opcion_contrato, estado, fecha_publicacion, fecha_fin_solicitud,
        tipo_oferta, salario_mensual, requisitos_adicionales, beneficios, id_empresa,
        empresa:empresa(id, nombre, usuario:usuario!empresa_id_fkey(avatar_url)),
        oferta_tecnologia(tecnologia(id_tecnologia, nombre))
      `,
      )
      .in("estado", ["activa", "pendiente"])
      .order("fecha_publicacion", { ascending: false });

    if (error) {
      console.error(error);
      return [];
    }
    return (data ?? []).map((o) => ({
      ...o,
      empresa_nombre: o.empresa?.nombre ?? "Empresa",
      empresa_avatar: o.empresa?.usuario?.avatar_url ?? null,
      tecnologias:
        o.oferta_tecnologia?.map((ot) => ot.tecnologia).filter(Boolean) ?? [],
    }));
  }, []);

  // ── Carga mis ofertas (empresa) ───────────────────────────────────────
  const cargarMisOfertas = useCallback(async () => {
    if (!isEmpresa || !user) return [];
    const { data, error } = await supabase
      .from("oferta")
      .select(
        `
        id_oferta, titulo, descripcion, modalidad, ubicacion,
        duracion_semanas, horas_semanales, num_plazas, num_plazas_restantes,
        opcion_contrato, estado, fecha_publicacion, fecha_fin_solicitud,
        tipo_oferta, salario_mensual, requisitos_adicionales, beneficios, id_empresa,
        empresa:empresa(id, nombre, usuario:usuario!empresa_id_fkey(avatar_url)),
        oferta_tecnologia(tecnologia(id_tecnologia, nombre))
      `,
      )
      .eq("id_empresa", user.id)
      .order("fecha_publicacion", { ascending: false });

    if (error) {
      console.error(error);
      return [];
    }
    return (data ?? []).map((o) => ({
      ...o,
      empresa_nombre: o.empresa?.nombre ?? "Empresa",
      empresa_avatar: o.empresa?.usuario?.avatar_url ?? null,
      tecnologias:
        o.oferta_tecnologia?.map((ot) => ot.tecnologia).filter(Boolean) ?? [],
    }));
  }, [isEmpresa, user]);

  // ── Postulaciones del estudiante ──────────────────────────────────────
  const cargarPostulaciones = useCallback(async () => {
    if (!isEstudiante || !user) return;
    const { data } = await supabase
      .from("candidatura")
      .select("id_oferta")
      .eq("id_estudiante", user.id);
    setPostulaciones(new Set((data ?? []).map((c) => c.id_oferta)));
  }, [isEstudiante, user]);

  const recargar = useCallback(async () => {
    setLoading(true);
    const [pub, mis] = await Promise.all([
      cargarOfertasPublicas(),
      cargarMisOfertas(),
    ]);
    setOfertasPublicas(pub ?? []);
    setMisOfertas(mis ?? []);
    await cargarPostulaciones();
    setLoading(false);
  }, [cargarOfertasPublicas, cargarMisOfertas, cargarPostulaciones]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const handleDelete = async (idOferta) => {
    if (
      !window.confirm(
        "¿Eliminar esta oferta? Esta acción no se puede deshacer.",
      )
    )
      return;
    await supabase.from("oferta_tecnologia").delete().eq("id_oferta", idOferta);
    await supabase.from("oferta").delete().eq("id_oferta", idOferta);
    recargar();
  };

  // ── Filtrado ───────────────────────────────────────────────────────────
  const aplicarFiltros = (lista) =>
    lista.filter((o) => {
      const q = search.toLowerCase();
      return (
        (!q ||
          o.titulo?.toLowerCase().includes(q) ||
          o.empresa_nombre?.toLowerCase().includes(q) ||
          o.ubicacion?.toLowerCase().includes(q)) &&
        (!filtroModalidad || o.modalidad === filtroModalidad) &&
        (!filtroTipo || o.tipo_oferta === filtroTipo) &&
        (!filtroContrato ||
          (filtroContrato === "si" ? o.opcion_contrato : !o.opcion_contrato)) &&
        (!filtroTech ||
          o.tecnologias.some((t) =>
            t.nombre?.toLowerCase().includes(filtroTech.toLowerCase()),
          ))
      );
    });

  const esMisOfertas = tab === "mis-ofertas";
  const listaActiva = esMisOfertas ? misOfertas : ofertasPublicas;
  const listaFiltrada = aplicarFiltros(listaActiva);
  const isEmpresaOwnerOf = (oferta) =>
    isEmpresa && oferta.id_empresa === user?.id;

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* Cabecera */}
          <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h1
                className="font-display text-3xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                {esMisOfertas ? "Mis ofertas" : "Ofertas de prácticas"}
              </h1>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                {esMisOfertas
                  ? "Gestiona y publica tus ofertas de prácticas o empleo"
                  : `${listaFiltrada.length} oferta${listaFiltrada.length !== 1 ? "s" : ""} disponible${listaFiltrada.length !== 1 ? "s" : ""}`}
              </p>
            </div>
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

          {isEmpresa && (
            <TabsEmpresa
              tab={tab}
              setTab={setTab}
              totalMisOfertas={misOfertas.length}
            />
          )}
          {isEmpresa && esMisOfertas && misOfertas.length > 0 && (
            <EmpresaStats ofertas={misOfertas} />
          )}

          <FiltrosBar
            search={search}
            setSearch={setSearch}
            filtroModalidad={filtroModalidad}
            setFiltroModalidad={setFiltroModalidad}
            filtroTipo={filtroTipo}
            setFiltroTipo={setFiltroTipo}
            filtroContrato={filtroContrato}
            setFiltroContrato={setFiltroContrato}
            filtroTech={filtroTech}
            setFiltroTech={setFiltroTech}
          />

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="w-8 h-8" />
            </div>
          ) : listaFiltrada.length === 0 ? (
            <div
              className="text-center py-20 rounded-2xl"
              style={{ border: "1px dashed var(--color-border-strong)" }}
            >
              <svg
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: "var(--color-text-subtle)" }}
                viewBox="0 0 640 640"
              >
                <use href="/icons.svg#icon-briefcase" />
              </svg>
              <p
                className="font-medium"
                style={{ color: "var(--color-text-muted)" }}
              >
                {esMisOfertas
                  ? "Aún no has publicado ninguna oferta"
                  : "No hay ofertas disponibles con estos filtros"}
              </p>
              {isEmpresa && esMisOfertas && (
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
              {listaFiltrada.map((o) => (
                <OfertaCard
                  key={o.id_oferta}
                  oferta={o}
                  isEmpresa={esMisOfertas ? isEmpresa : isEmpresaOwnerOf(o)}
                  isEstudiante={isEstudiante}
                  isTutorCentro={isTutorCentro}
                  yaPostulado={postulaciones.has(o.id_oferta)}
                  onVerDetalle={setDetalleOferta}
                  onEdit={(oferta) => setModalCrear(oferta)}
                  onDelete={handleDelete}
                  onCerrar={(oferta) => setCerrarOferta(oferta)}
                  onVerCandidatos={(oferta) => setCandidatosOferta(oferta)}
                  onPostular={(oferta) => setPostulacionOferta(oferta)}
                  onRetirar={(oferta) => setRetirarOferta(oferta)}
                  onRecomendar={
                    isTutorCentro
                      ? (oferta) => setRecomendarOferta(oferta)
                      : null
                  }
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Modales ── */}
      {modalCrear && (
        <OfertaModal
          oferta={modalCrear === "crear" ? null : modalCrear}
          onClose={() => setModalCrear(null)}
          onSaved={recargar}
        />
      )}

      {/* OfferDetailsModal — reemplaza el antiguo DetalleModal inline */}
      {detalleOferta &&
        !postulacionOferta &&
        !retirarOferta &&
        !cerrarOferta && (
          <OfferDetailsModal
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

      {postulacionOferta && (
        <PostulacionModal
          oferta={postulacionOferta}
          onClose={() => setPostulacionOferta(null)}
          onSuccess={() => {
            setPostulaciones(
              (prev) => new Set([...prev, postulacionOferta.id_oferta]),
            );
            recargar();
          }}
        />
      )}

      {retirarOferta && (
        <RetirarModal
          oferta={retirarOferta}
          onClose={() => setRetirarOferta(null)}
          onSuccess={() => {
            setPostulaciones((prev) => {
              const next = new Set(prev);
              next.delete(retirarOferta.id_oferta);
              return next;
            });
            recargar();
          }}
        />
      )}

      {cerrarOferta && (
        <CerrarOfertaModal
          oferta={cerrarOferta}
          onClose={() => setCerrarOferta(null)}
          onSuccess={recargar}
        />
      )}

      {candidatosOferta && (
        <CandidatosModal
          oferta={candidatosOferta}
          onClose={() => setCandidatosOferta(null)}
          supabase={supabase}
        />
      )}

      {recomendarOferta && (
        <RecommendModalOffer
          oferta={recomendarOferta}
          onClose={() => setRecomendarOferta(null)}
        />
      )}
    </MainLayout>
  );
}
