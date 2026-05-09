import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import MainLayout from "../components/layout/MainLayout";
import InviteModal from "../components/InviteModal";

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

function Badge({ children, color = "gray" }) {
  const colors = {
    brand: "bg-brand/10  text-brand   border-brand/20",
    green: "bg-green-500/10  text-green-400  border-green-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    red: "bg-red-500/10    text-red-400    border-red-500/20",
    blue: "bg-blue-500/10   text-blue-400   border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    gray: "bg-white/5       text-gray-400   border-white/10",
  };
  return (
    <span
      className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value, color = "brand", icon }) {
  const ring = {
    brand: "ring-brand/20  bg-brand/5",
    blue: "ring-blue-500/20  bg-blue-500/5",
    purple: "ring-purple-500/20 bg-purple-500/5",
    orange: "ring-orange-500/20 bg-orange-500/5",
    green: "ring-green-500/20  bg-green-500/5",
  }[color];
  const text = {
    brand: "text-brand",
    blue: "text-blue-400",
    purple: "text-purple-400",
    orange: "text-orange-400",
    green: "text-green-400",
  }[color];
  return (
    <div className={`${ring} ring-1 rounded-2xl p-5 flex items-center gap-4`}>
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${ring}`}
      >
        <svg className={`w-5 h-5 ${text}`} viewBox="0 0 640 640">
          <use href={`/icons.svg#${icon}`} />
        </svg>
      </div>
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className={`font-display text-2xl font-bold ${text} mt-0.5`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Modal validar / rechazar oferta ─────────────────────────────────────────
function ValidarOfertaModal({ oferta, onClose, onSaved }) {
  const [action, setAction] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (action === "rechazada" && !motivo.trim()) return;
    setSaving(true);
    await supabase
      .from("oferta")
      .update({
        estado: action,
        motivo_rechazo: action === "rechazada" ? motivo.trim() : null,
        fecha_modificacion: new Date().toISOString(),
      })
      .eq("id_oferta", oferta.id_oferta);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              {oferta.titulo}
            </h2>
            <p className="text-gray-500 text-sm">{oferta.empresa_nombre}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {oferta.descripcion && (
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              {oferta.descripcion}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAction("activa")}
              className={`py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${action === "activa" ? "border-green-500/50 bg-green-500/10 text-green-400" : "border-white/10 text-gray-400 hover:border-white/20"}`}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Aprobar oferta
            </button>
            <button
              onClick={() => setAction("rechazada")}
              className={`py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${action === "rechazada" ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-white/10 text-gray-400 hover:border-white/20"}`}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Rechazar
            </button>
          </div>

          {action === "rechazada" && (
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Motivo del rechazo <span className="text-brand">*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value.slice(0, 300))}
                rows={3}
                placeholder="Explica brevemente por qué se rechaza esta oferta..."
                className="input-field resize-none"
              />
              <p className="text-xs text-gray-600 mt-1 text-right">
                {motivo.length}/300
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                !action || (action === "rechazada" && !motivo.trim()) || saving
              }
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2 ${action === "activa" ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30" : action === "rechazada" ? "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25" : "bg-white/5 text-gray-400 border border-white/10"}`}
            >
              {saving ? (
                <Spinner className="w-4 h-4" />
              ) : action === "activa" ? (
                "Confirmar aprobación"
              ) : action === "rechazada" ? (
                "Confirmar rechazo"
              ) : (
                "Selecciona una acción"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal AdminProfile ────────────────────────────────────────────
export default function AdminProfile() {
  const { user, avatarUrl } = useAuth();

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? "Admin";
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState({
    estudiantes: 0,
    empresas: 0,
    centros: 0,
    tutores: 0,
    ofertas_pendientes: 0,
    ofertas_activas: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [ofertasPendientes, setOfertasPendientes] = useState([]);
  const [loadingOfertas, setLoadingOfertas] = useState(false);

  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [searchUsuario, setSearchUsuario] = useState("");

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const [inviteModal, setInviteModal] = useState(false);
  const [validarOferta, setValidarOferta] = useState(null);

  const cargarStats = useCallback(async () => {
    setLoadingStats(true);
    const [est, emp, cen, tut, ofPend, ofActiva] = await Promise.all([
      supabase
        .from("usuario")
        .select("*", { count: "exact", head: true })
        .eq("rol", "estudiante"),
      supabase
        .from("usuario")
        .select("*", { count: "exact", head: true })
        .eq("rol", "empresa"),
      supabase
        .from("usuario")
        .select("*", { count: "exact", head: true })
        .eq("rol", "centro_educativo"),
      supabase
        .from("usuario")
        .select("*", { count: "exact", head: true })
        .in("rol", ["tutor_empresa", "tutor_centro"]),
      supabase
        .from("oferta")
        .select("*", { count: "exact", head: true })
        .eq("estado", "pendiente"),
      supabase
        .from("oferta")
        .select("*", { count: "exact", head: true })
        .eq("estado", "activa"),
    ]);
    setStats({
      estudiantes: est.count ?? 0,
      empresas: emp.count ?? 0,
      centros: cen.count ?? 0,
      tutores: tut.count ?? 0,
      ofertas_pendientes: ofPend.count ?? 0,
      ofertas_activas: ofActiva.count ?? 0,
    });
    setLoadingStats(false);
  }, []);

  const cargarOfertas = useCallback(async () => {
    setLoadingOfertas(true);
    const { data: ofertasData } = await supabase
      .from("oferta")
      .select(
        `id_oferta, titulo, descripcion, modalidad, ubicacion, tipo_oferta,
               fecha_publicacion, estado, id_empresa,
               oferta_tecnologia(tecnologia(id_tecnologia, nombre))`,
      )
      .eq("estado", "pendiente")
      .order("fecha_publicacion", { ascending: true });

    const ids = [
      ...new Set((ofertasData ?? []).map((o) => o.id_empresa).filter(Boolean)),
    ];
    let empMap = {};
    if (ids.length > 0) {
      const { data: empresas } = await supabase
        .from("empresa")
        .select("id, nombre")
        .in("id", ids);
      const { data: usuariosData } = await supabase
        .from("usuario")
        .select("id, avatar_url")
        .in("id", ids);
      const avatarMap = Object.fromEntries(
        (usuariosData ?? []).map((u) => [u.id, u.avatar_url]),
      );
      empMap = Object.fromEntries(
        (empresas ?? []).map((e) => [
          e.id,
          { nombre: e.nombre, avatar: avatarMap[e.id] },
        ]),
      );
    }

    setOfertasPendientes(
      (ofertasData ?? []).map((o) => ({
        ...o,
        empresa_nombre: empMap[o.id_empresa]?.nombre ?? "Empresa",
        empresa_avatar: empMap[o.id_empresa]?.avatar ?? null,
        tecnologias:
          o.oferta_tecnologia?.map((ot) => ot.tecnologia).filter(Boolean) ?? [],
      })),
    );
    setLoadingOfertas(false);
  }, []);

  const cargarUsuarios = useCallback(async () => {
    setLoadingUsuarios(true);
    const { data } = await supabase
      .from("usuario")
      .select("id, email, nombre, rol, created_at, avatar_url")
      .not("rol", "eq", "admin")
      .order("created_at", { ascending: false })
      .limit(100);
    setUsuarios(data ?? []);
    setLoadingUsuarios(false);
  }, []);

  const cargarAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    const { data } = await supabase
      .from("usuario")
      .select("id, email, nombre, created_at, avatar_url")
      .eq("rol", "admin")
      .order("created_at", { ascending: true });
    setAdmins(data ?? []);
    setLoadingAdmins(false);
  }, []);

  useEffect(() => {
    cargarStats();
  }, [cargarStats]);

  useEffect(() => {
    if (activeTab === "ofertas") cargarOfertas();
    if (activeTab === "usuarios") cargarUsuarios();
    if (activeTab === "admins") cargarAdmins();
  }, [activeTab]);

  const handleToggleBlock = async (userId, currentRol) => {
    const nuevoRol = currentRol === "bloqueado" ? "estudiante" : "bloqueado";
    await supabase.from("usuario").update({ rol: nuevoRol }).eq("id", userId);
    cargarUsuarios();
  };

  const rolColor = {
    estudiante: "blue",
    empresa: "purple",
    centro_educativo: "orange",
    tutor_empresa: "green",
    tutor_centro: "green",
    admin: "brand",
    bloqueado: "red",
  };
  const rolLabel = {
    estudiante: "Estudiante",
    empresa: "Empresa",
    centro_educativo: "Centro",
    tutor_empresa: "Tutor empresa",
    tutor_centro: "Tutor centro",
    admin: "Admin",
    bloqueado: "Bloqueado",
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const q = searchUsuario.toLowerCase();
    return (
      !q ||
      u.nombre?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const TABS = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      id: "ofertas",
      label: "Validar ofertas",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
      badge: stats.ofertas_pendientes || null,
    },
    {
      id: "usuarios",
      label: "Usuarios",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      id: "admins",
      label: "Administradores",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-dark">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* ── Header admin ── */}
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-12 h-12 rounded-xl object-cover border border-white/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center text-dark font-bold font-display text-lg">
                  {initials || "A"}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-white">
                    Panel de administración
                  </h1>
                  <Badge color="brand">Admin</Badge>
                </div>
                <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setInviteModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Invitar administrador
            </button>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-1 bg-dark-800 border border-white/8 rounded-xl p-1 mb-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-brand/15 text-brand border border-brand/20" : "text-gray-500 hover:text-gray-300"}`}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d={tab.icon} />
                </svg>
                {tab.label}
                {tab.badge > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB: DASHBOARD                                            */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {loadingStats ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner className="w-8 h-8" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                      label="Estudiantes"
                      value={stats.estudiantes}
                      color="blue"
                      icon="icon-student"
                    />
                    <StatCard
                      label="Empresas"
                      value={stats.empresas}
                      color="purple"
                      icon="icon-company"
                    />
                    <StatCard
                      label="Centros"
                      value={stats.centros}
                      color="orange"
                      icon="icon-educativeCenter"
                    />
                    <StatCard
                      label="Tutores"
                      value={stats.tutores}
                      color="green"
                      icon="icon-tutor"
                    />
                    <StatCard
                      label="Ofertas activas"
                      value={stats.ofertas_activas}
                      color="brand"
                      icon="icon-briefcase"
                    />
                    <StatCard
                      label="Pendientes"
                      value={stats.ofertas_pendientes}
                      color="orange"
                      icon="icon-clock"
                    />
                  </div>

                  <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
                    <h2 className="font-display text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                      Acciones rápidas
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setActiveTab("ofertas")}
                        className="flex items-center gap-3 p-4 rounded-xl bg-dark border border-white/8 hover:border-brand/30 transition-all group text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-orange-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold group-hover:text-brand transition-colors">
                            Validar ofertas
                          </p>
                          <p className="text-gray-600 text-xs">
                            {stats.ofertas_pendientes} pendientes
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab("usuarios")}
                        className="flex items-center gap-3 p-4 rounded-xl bg-dark border border-white/8 hover:border-brand/30 transition-all group text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-blue-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold group-hover:text-brand transition-colors">
                            Gestionar usuarios
                          </p>
                          <p className="text-gray-600 text-xs">
                            {stats.estudiantes +
                              stats.empresas +
                              stats.centros +
                              stats.tutores}{" "}
                            registrados
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => setInviteModal(true)}
                        className="flex items-center gap-3 p-4 rounded-xl bg-dark border border-white/8 hover:border-brand/30 transition-all group text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-brand"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold group-hover:text-brand transition-colors">
                            Invitar admin
                          </p>
                          <p className="text-gray-600 text-xs">
                            Generar enlace seguro
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB: VALIDAR OFERTAS                                      */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === "ofertas" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    Ofertas pendientes
                  </h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Revisa y aprueba o rechaza cada oferta antes de que sea
                    visible para los estudiantes.
                  </p>
                </div>
                <button
                  onClick={cargarOfertas}
                  className="text-xs text-gray-500 hover:text-brand transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 border border-white/8"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M23 4v6h-6M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                  Actualizar
                </button>
              </div>

              {loadingOfertas ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner className="w-7 h-7" />
                </div>
              ) : ofertasPendientes.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                  <svg
                    className="w-12 h-12 text-green-500/40 mx-auto mb-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p className="text-gray-400 font-medium">¡Todo al día!</p>
                  <p className="text-gray-600 text-sm mt-1">
                    No hay ofertas pendientes de revisión.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ofertasPendientes.map((o) => (
                    <div
                      key={o.id_oferta}
                      className="bg-dark-800 border border-white/8 rounded-xl p-4 flex items-center gap-4 hover:border-white/15 transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/15 flex items-center justify-center flex-shrink-0">
                        {o.empresa_avatar ? (
                          <img
                            src={o.empresa_avatar}
                            alt=""
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <svg
                            className="w-5 h-5 text-brand"
                            viewBox="0 0 640 640"
                          >
                            <use href="/icons.svg#icon-building" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-semibold text-white text-sm truncate">
                            {o.titulo}
                          </p>
                          <Badge color="orange">Pendiente</Badge>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {o.empresa_nombre}
                        </p>
                        {o.tecnologias.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {o.tecnologias.slice(0, 4).map((t) => (
                              <span
                                key={t.id_tecnologia}
                                className="bg-white/5 border border-white/8 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-mono"
                              >
                                {t.nombre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs flex-shrink-0 hidden sm:block">
                        {o.fecha_publicacion
                          ? new Date(o.fecha_publicacion).toLocaleDateString(
                              "es-ES",
                            )
                          : ""}
                      </p>
                      <button
                        onClick={() => setValidarOferta(o)}
                        className="flex-shrink-0 btn-primary text-xs py-1.5 px-4"
                      >
                        Revisar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB: USUARIOS                                             */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === "usuarios" && (
            <div>
              <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                <h2 className="font-display text-xl font-bold text-white">
                  Usuarios registrados
                </h2>
                <div className="relative flex-1 max-w-xs">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500"
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
                    value={searchUsuario}
                    onChange={(e) => setSearchUsuario(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="input-field pl-8 text-sm py-2"
                  />
                </div>
              </div>

              {loadingUsuarios ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner className="w-7 h-7" />
                </div>
              ) : (
                <div className="space-y-2">
                  {usuariosFiltrados.map((u) => (
                    <div
                      key={u.id}
                      className="bg-dark-800 border border-white/8 rounded-xl px-4 py-3 flex items-center gap-4"
                    >
                      <div className="w-9 h-9 rounded-full bg-brand/10 border border-brand/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-brand text-xs font-bold font-display">
                            {(u.nombre || u.email || "?")[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {u.nombre || "Sin nombre"}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {u.email}
                        </p>
                      </div>
                      <Badge color={rolColor[u.rol] ?? "gray"}>
                        {rolLabel[u.rol] ?? u.rol}
                      </Badge>
                      <p className="text-gray-600 text-xs hidden sm:block flex-shrink-0">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString("es-ES")
                          : ""}
                      </p>
                      <button
                        onClick={() => handleToggleBlock(u.id, u.rol)}
                        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-all ${u.rol === "bloqueado" ? "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20" : "border-red-500/20 bg-red-500/5 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"}`}
                      >
                        {u.rol === "bloqueado" ? "Desbloquear" : "Bloquear"}
                      </button>
                    </div>
                  ))}
                  {usuariosFiltrados.length === 0 && (
                    <div className="text-center py-12 text-gray-600 text-sm">
                      No se encontraron usuarios.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* TAB: ADMINISTRADORES                                      */}
          {/* ══════════════════════════════════════════════════════════ */}
          {activeTab === "admins" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    Administradores
                  </h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Todos los usuarios con acceso de administrador a Relance.
                  </p>
                </div>
                <button
                  onClick={() => setInviteModal(true)}
                  className="btn-primary flex items-center gap-2 text-sm"
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
                  Invitar admin
                </button>
              </div>

              {loadingAdmins ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner className="w-7 h-7" />
                </div>
              ) : (
                <div className="space-y-3">
                  {admins.map((a) => {
                    const isMe = a.id === user?.id;
                    return (
                      <div
                        key={a.id}
                        className={`border rounded-xl px-5 py-4 flex items-center gap-4 transition-all ${isMe ? "bg-brand/5 border-brand/25" : "bg-dark-800 border-white/8"}`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {a.avatar_url ? (
                            <img
                              src={a.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-brand font-bold font-display">
                              {(a.nombre || a.email || "A")[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold text-sm">
                              {a.nombre || "Sin nombre"}
                            </p>
                            {isMe && (
                              <span className="text-[10px] bg-brand/15 text-brand border border-brand/25 px-2 py-0.5 rounded-full">
                                Tú
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs">{a.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge color="brand">Admin</Badge>
                          <p className="text-gray-600 text-xs mt-1">
                            desde{" "}
                            {a.created_at
                              ? new Date(a.created_at).toLocaleDateString(
                                  "es-ES",
                                  { month: "short", year: "numeric" },
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-4 bg-dark-800 border border-dashed border-white/10 rounded-xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm font-medium">
                        Añadir nuevo administrador
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        Genera un enlace de invitación seguro con caducidad de
                        48 horas.
                      </p>
                    </div>
                    <button
                      onClick={() => setInviteModal(true)}
                      className="btn-secondary text-xs px-4 py-2 flex-shrink-0"
                    >
                      Invitar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Modales ── */}
      {inviteModal && (
        <InviteModal
          user={user}
          onClose={() => setInviteModal(false)}
          entityType="admin"
          inviteRoute="/admin/registro"
          expiresInHours={48}
          title="Invitar administrador"
          description="Genera un enlace de invitación para que otra persona cree su cuenta de administrador."
          warningText="Los administradores tienen acceso total a la plataforma: validación de ofertas, gestión de usuarios y generación de nuevas invitaciones. Comparte este enlace solo con personas de confianza."
          roleLabel="administrador"
          inviterName="el equipo de administración"
        />
      )}
      {validarOferta && (
        <ValidarOfertaModal
          oferta={validarOferta}
          onClose={() => setValidarOferta(null)}
          onSaved={() => {
            cargarOfertas();
            cargarStats();
          }}
        />
      )}
    </MainLayout>
  );
}
