import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import MainLayout from "../components/layout/MainLayout";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        style={{
          width: 28,
          height: 28,
          border: "2px solid rgba(255,255,255,0.08)",
          borderTopColor: "rgba(255,255,255,0.5)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}

const ESTADO_ESTUDIANTE = {
  en_practicas: { label: "En prácticas", dot: "#60a5fa" },
  contratado: { label: "Contratado", dot: "#34d399" },
  buscando: { label: "Buscando", dot: "#f59e0b" },
  pendiente: { label: "Pendiente", dot: "#6b7280" },
};

const ESTADO_CANDIDATURA = {
  aceptada: { label: "Aceptada", color: "#34d399" },
  rechazada: { label: "Rechazada", color: "#f87171" },
  en_revision: { label: "En revisión", color: "#f59e0b" },
  pendiente: { label: "Pendiente", color: "#6b7280" },
};

function StatusDot({ estado }) {
  const cfg = ESTADO_ESTUDIANTE[estado] ?? { label: estado, dot: "#6b7280" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        color: "#9ca3af",
        fontWeight: 500,
        letterSpacing: "0.02em",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cfg.dot,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}

function Stars({ rating }) {
  const r = Number(rating) || 0;
  return (
    <span style={{ color: "#f59e0b", fontSize: 12, letterSpacing: 1 }}>
      {"★".repeat(Math.round(r))}
      {"☆".repeat(5 - Math.round(r))}
      <span style={{ color: "#6b7280", marginLeft: 5, fontSize: 11 }}>
        {r.toFixed(1)}
      </span>
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, suffix = "" }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <p
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#4b5563",
          fontWeight: 700,
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: "#f9fafb",
          margin: 0,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        {suffix}
      </p>
      {sub && (
        <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>{sub}</p>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 20,
        gap: 12,
      }}
    >
      <div>
        <h2
          style={{ fontSize: 17, fontWeight: 700, color: "#f9fafb", margin: 0 }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Search Input ─────────────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", maxWidth: 280 }}>
      <svg
        style={{
          position: "absolute",
          left: 11,
          top: "50%",
          transform: "translateY(-50%)",
          width: 14,
          height: 14,
          color: "#4b5563",
          pointerEvents: "none",
        }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          paddingLeft: 32,
          paddingRight: 12,
          paddingTop: 8,
          paddingBottom: 8,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          fontSize: 12,
          color: "#d1d5db",
          outline: "none",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
function Table({ headers, children }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  padding: "11px 16px",
                  textAlign: "left",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#4b5563",
                  fontWeight: 700,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function TR({ cells, last }) {
  return (
    <tr
      style={{
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {cells.map((c, i) => (
        <td
          key={i}
          style={{
            padding: "11px 16px",
            color: "#d1d5db",
            verticalAlign: "middle",
          }}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}

// ─── Tutor Row ────────────────────────────────────────────────────────────────
function TutorRow({ tutor }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 8,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.025)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 700,
            color: "#9ca3af",
          }}
        >
          {(tutor.nombre ?? "?")[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "#f9fafb",
            }}
          >
            {tutor.nombre}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>
            {tutor.email}
          </p>
        </div>
        <span
          style={{
            fontSize: 11,
            color: "#9ca3af",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            padding: "3px 10px",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {tutor.lista?.length ?? 0} alumnos
        </span>
        <svg
          style={{
            width: 14,
            height: 14,
            color: "#4b5563",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            padding: "8px 16px 12px",
          }}
        >
          {(tutor.lista ?? []).length === 0 ? (
            <p style={{ fontSize: 12, color: "#4b5563", padding: "8px 4px" }}>
              Sin alumnos asignados.
            </p>
          ) : (
            (tutor.lista ?? []).map((al, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 4px",
                  borderBottom:
                    i < tutor.lista.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: ESTADO_ESTUDIANTE[al.estado]?.dot ?? "#6b7280",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12, color: "#d1d5db", flex: 1 }}>
                  {al.nombre}
                </span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>
                  {al.empresa ?? "Sin empresa asignada"}
                </span>
                <StatusDot estado={al.estado} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CenterEducativePanel() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("resumen");
  const [searchEst, setSearchEst] = useState("");
  const [searchEmp, setSearchEmp] = useState("");
  const [loading, setLoading] = useState(true);

  // ── Data state
  const [centro, setCentro] = useState(null);
  const [stats, setStats] = useState({
    estudiantes: 0,
    empresas: 0,
    candidaturas: 0,
    tasa_contrato: 0,
    valoracion_media: 0,
  });
  const [estadosDistribucion, setEstadosDistribucion] = useState([]);
  const [topEmpresas, setTopEmpresas] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [candidaturas, setCandidaturas] = useState([]);
  const [tutores, setTutores] = useState([]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── 1. Cargar datos del centro del usuario logueado
  const cargarCentro = useCallback(async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("centro_educativo")
      .select("id, nombre, ciudad, provincia, email_contacto, num_alumnos")
      .eq("id", user.id)
      .single();
    if (error) console.error("[cargarCentro]:", error);
    return data ?? null;
  }, [user]);

  // ── 2. Cargar todo en paralelo una vez tenemos el id_centro
  const cargarTodo = useCallback(async () => {
    setLoading(true);
    const centroData = await cargarCentro();
    if (!mountedRef.current) return;
    setCentro(centroData);

    if (!centroData) {
      setLoading(false);
      return;
    }

    const idCentro = centroData.id;

    // ── estudiantes del centro (via centro_estudiante join)
    const { data: ceRows, error: ceError } = await supabase
      .from("centro_estudiante")
      .select(
        `
        id_tutor,
        estudiante:id_estudiante (
          id, nombre, apellidos, titulacion
        ),
        tutor:id_tutor (
          id, nombre, usuario:usuario_id (email)
        )
      `,
      )
      .eq("id_centro", idCentro);

    if (ceError) console.error("[centro_estudiante]:", ceError);
    const ceData = ceRows ?? [];

    // ids de estudiantes para queries posteriores
    const estudianteIds = ceData.map((r) => r.estudiante?.id).filter(Boolean);

    // ── estados de los estudiantes
    let estadoMap = {};
    let empresaEstudianteMap = {};
    if (estudianteIds.length > 0) {
      const { data: estadosData, error: estadosError } = await supabase
        .from("estudiante_estado")
        .select("id_estudiante, estado, id_empresa")
        .in("id_estudiante", estudianteIds);
      if (estadosError) console.error("[estudiante_estado]:", estadosError);
      (estadosData ?? []).forEach((r) => {
        estadoMap[r.id_estudiante] = r.estado ?? "pendiente";
        if (r.id_empresa) empresaEstudianteMap[r.id_estudiante] = r.id_empresa;
      });
    }

    // ── empresas presentes en los estados
    const empresaIdsEnEstados = [
      ...new Set(Object.values(empresaEstudianteMap)),
    ];
    let empresaNombreMap = {};
    if (empresaIdsEnEstados.length > 0) {
      const { data: empNombres } = await supabase
        .from("empresa")
        .select("id, nombre")
        .in("id", empresaIdsEnEstados);
      (empNombres ?? []).forEach((e) => {
        empresaNombreMap[e.id] = e.nombre;
      });
    }

    // ── candidaturas de los estudiantes del centro
    let candidaturasData = [];
    if (estudianteIds.length > 0) {
      const { data: candRows, error: candError } = await supabase
        .from("candidatura")
        .select(
          `
          id, estado, created_at,
          id_estudiante,
          id_empresa,
          oferta:id_oferta (titulo)
        `,
        )
        .in("id_estudiante", estudianteIds)
        .order("created_at", { ascending: false });
      if (candError) console.error("[candidatura]:", candError);
      candidaturasData = candRows ?? [];
    }

    // ── nombres de estudiantes para candidaturas
    const estudianteNombreMap = {};
    ceData.forEach((r) => {
      if (r.estudiante) {
        const fullName = [r.estudiante.nombre, r.estudiante.apellidos]
          .filter(Boolean)
          .join(" ");
        estudianteNombreMap[r.estudiante.id] = fullName || "—";
      }
    });

    // ── empresas colaboradoras (las que tienen candidaturas de alumnos del centro)
    const empresaIdsCandidaturas = [
      ...new Set(candidaturasData.map((c) => c.id_empresa).filter(Boolean)),
    ];
    let empresasColaboradoras = [];
    if (empresaIdsCandidaturas.length > 0) {
      const { data: empRows, error: empError } = await supabase
        .from("empresa")
        .select("id, nombre, sector, logo_url")
        .in("id", empresaIdsCandidaturas);
      if (empError) console.error("[empresa]:", empError);
      empresasColaboradoras = empRows ?? [];
    }

    // ── valoraciones de empresas (de los alumnos del centro)
    let valoracionMap = {};
    let colaboracionesMap = {};
    if (empresaIdsCandidaturas.length > 0) {
      const { data: valRows, error: valError } = await supabase
        .from("valoracion_empresa")
        .select("id_empresa, puntuacion")
        .in("id_empresa", empresaIdsCandidaturas)
        .in(
          "id_estudiante",
          estudianteIds.length > 0 ? estudianteIds : ["null"],
        );
      if (valError) console.error("[valoracion_empresa]:", valError);
      (valRows ?? []).forEach((v) => {
        if (!valoracionMap[v.id_empresa]) valoracionMap[v.id_empresa] = [];
        valoracionMap[v.id_empresa].push(Number(v.puntuacion));
      });
    }
    // colaboraciones = número de candidaturas aceptadas por empresa
    candidaturasData.forEach((c) => {
      if (!colaboracionesMap[c.id_empresa]) colaboracionesMap[c.id_empresa] = 0;
      if (c.estado === "aceptada") colaboracionesMap[c.id_empresa]++;
    });

    // ── alumnos activos por empresa
    const alumnosActivosMap = {};
    Object.entries(empresaEstudianteMap).forEach(([_estId, empId]) => {
      alumnosActivosMap[empId] = (alumnosActivosMap[empId] ?? 0) + 1;
    });

    // ── Enriquecer empresas
    const empresasEnriquecidas = empresasColaboradoras.map((e) => {
      const vals = valoracionMap[e.id] ?? [];
      const valoracion =
        vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return {
        ...e,
        alumnos_activos: alumnosActivosMap[e.id] ?? 0,
        valoracion: parseFloat(valoracion.toFixed(1)),
        colaboraciones: colaboracionesMap[e.id] ?? 0,
      };
    });

    // ── Enriquecer estudiantes
    const estudiantesEnriquecidos = ceData.map((r) => {
      const est = r.estudiante ?? {};
      const estado = estadoMap[est.id] ?? "pendiente";
      const idEmpresa = empresaEstudianteMap[est.id] ?? null;
      const empresa = idEmpresa ? (empresaNombreMap[idEmpresa] ?? null) : null;
      const nombreTutor = r.tutor
        ? [r.tutor.nombre].filter(Boolean).join(" ")
        : "—";
      const numCandidaturas = candidaturasData.filter(
        (c) => c.id_estudiante === est.id,
      ).length;
      return {
        id: est.id,
        nombre: [est.nombre, est.apellidos].filter(Boolean).join(" ") || "—",
        titulacion: est.titulacion ?? "—",
        estado,
        empresa,
        tutor: nombreTutor,
        id_tutor: r.id_tutor,
        candidaturas: numCandidaturas,
      };
    });

    // ── Enriquecer candidaturas
    const candidaturasEnriquecidas = candidaturasData.map((c) => ({
      id: c.id,
      estudiante: estudianteNombreMap[c.id_estudiante] ?? "—",
      empresa:
        empresasColaboradoras.find((e) => e.id === c.id_empresa)?.nombre ?? "—",
      oferta: c.oferta?.titulo ?? "—",
      fecha: c.created_at,
      estado: c.estado ?? "pendiente",
    }));

    // ── Tutores con sus alumnos
    const tutoresMap = {};
    ceData.forEach((r) => {
      if (!r.tutor) return;
      const tid = r.tutor.id;
      if (!tutoresMap[tid]) {
        tutoresMap[tid] = {
          id: tid,
          nombre: r.tutor.nombre ?? "—",
          email: r.tutor.email ?? "—",
          lista: [],
        };
      }
      const est = r.estudiante;
      if (est) {
        const estado = estadoMap[est.id] ?? "pendiente";
        const idEmp = empresaEstudianteMap[est.id] ?? null;
        tutoresMap[tid].lista.push({
          nombre: [est.nombre, est.apellidos].filter(Boolean).join(" ") || "—",
          estado,
          empresa: idEmp ? (empresaNombreMap[idEmp] ?? null) : null,
        });
      }
    });
    const tutoresArray = Object.values(tutoresMap);

    // ── Stats
    const totalEst = estudiantesEnriquecidos.length;
    const totalCandidaturas = candidaturasData.length;
    const contratados = estudiantesEnriquecidos.filter(
      (e) => e.estado === "contratado",
    ).length;
    const tasaContrato =
      totalEst > 0 ? Math.round((contratados / totalEst) * 100) : 0;
    const todasValoraciones = Object.values(valoracionMap).flat();
    const valoracionMedia =
      todasValoraciones.length > 0
        ? parseFloat(
            (
              todasValoraciones.reduce((a, b) => a + b, 0) /
              todasValoraciones.length
            ).toFixed(1),
          )
        : 0;

    const distribEstados = [
      {
        label: "En prácticas",
        count: estudiantesEnriquecidos.filter(
          (e) => e.estado === "en_practicas",
        ).length,
        color: "#60a5fa",
      },
      {
        label: "Contratados",
        count: contratados,
        color: "#34d399",
      },
      {
        label: "Buscando",
        count: estudiantesEnriquecidos.filter((e) => e.estado === "buscando")
          .length,
        color: "#f59e0b",
      },
      {
        label: "Sin actividad",
        count: estudiantesEnriquecidos.filter((e) => e.estado === "pendiente")
          .length,
        color: "#374151",
      },
    ];

    if (!mountedRef.current) return;

    setStats({
      estudiantes: totalEst,
      empresas: empresasEnriquecidas.length,
      candidaturas: totalCandidaturas,
      tasa_contrato: tasaContrato,
      valoracion_media: valoracionMedia,
    });
    setEstadosDistribucion(distribEstados);
    setTopEmpresas(
      [...empresasEnriquecidas].sort(
        (a, b) => b.colaboraciones - a.colaboraciones,
      ),
    );
    setEstudiantes(estudiantesEnriquecidos);
    setEmpresas(empresasEnriquecidas);
    setCandidaturas(candidaturasEnriquecidas);
    setTutores(tutoresArray);
    setLoading(false);
  }, [cargarCentro]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  // ── Filtros
  const estudiantesFiltrados = estudiantes.filter((e) => {
    const q = searchEst.toLowerCase();
    return (
      !q ||
      e.nombre.toLowerCase().includes(q) ||
      (e.empresa ?? "").toLowerCase().includes(q) ||
      e.titulacion.toLowerCase().includes(q)
    );
  });

  const empresasFiltradas = empresas.filter((e) => {
    const q = searchEmp.toLowerCase();
    return (
      !q ||
      e.nombre.toLowerCase().includes(q) ||
      (e.sector ?? "").toLowerCase().includes(q)
    );
  });

  const TABS = [
    { id: "resumen", label: "Resumen" },
    { id: "estudiantes", label: "Estudiantes" },
    { id: "empresas", label: "Empresas" },
    { id: "candidaturas", label: "Candidaturas" },
    { id: "tutores", label: "Tutores" },
  ];

  return (
    <MainLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #080a0f; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: #4b5563; }
        input:focus { border-color: rgba(255,255,255,0.18) !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.03); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#080a0f",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          color: "#f9fafb",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "40px 24px 60px",
            animation: "fadeUp 0.4s ease",
          }}
        >
          {/* ── Header ── */}
          <div style={{ marginBottom: 36 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#34d399",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#6b7280",
                  fontWeight: 700,
                }}
              >
                Centro educativo
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 800,
                color: "#f9fafb",
                letterSpacing: "-0.02em",
              }}
            >
              Panel de supervisión
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280" }}>
              {centro
                ? `${centro.nombre}${centro.ciudad ? ` — ${centro.ciudad}` : ""}`
                : "Cargando centro…"}
            </p>
          </div>

          {/* ── Tabs ── */}
          <div
            style={{
              display: "flex",
              gap: 2,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 4,
              marginBottom: 32,
              overflowX: "auto",
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  background:
                    activeTab === tab.id
                      ? "rgba(255,255,255,0.08)"
                      : "transparent",
                  color: activeTab === tab.id ? "#f9fafb" : "#6b7280",
                  boxShadow:
                    activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
                  letterSpacing: "0.01em",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              {/* ══ RESUMEN ══ */}
              {activeTab === "resumen" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 24 }}
                >
                  {/* Stats grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(170px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <StatCard
                      label="Estudiantes"
                      value={stats.estudiantes}
                      sub="Registrados en plataforma"
                    />
                    <StatCard
                      label="Empresas"
                      value={stats.empresas}
                      sub="Colaboradoras activas"
                    />
                    <StatCard
                      label="Candidaturas"
                      value={stats.candidaturas}
                      sub="Total enviadas"
                    />
                    <StatCard
                      label="Conversión contrato"
                      value={stats.tasa_contrato}
                      suffix="%"
                      sub="Prácticas → contrato"
                    />
                    <StatCard
                      label="Valoración media"
                      value={stats.valoracion_media}
                      suffix=" ★"
                      sub="De empresas colaboradoras"
                    />
                  </div>

                  {/* Distribution bar */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 16,
                      padding: "20px 24px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 14px",
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "#4b5563",
                        fontWeight: 700,
                      }}
                    >
                      Estado de estudiantes
                    </p>
                    {estadosDistribucion.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            width: 90,
                            flexShrink: 0,
                          }}
                        >
                          {item.label}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: 4,
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width:
                                stats.estudiantes > 0
                                  ? `${(item.count / stats.estudiantes) * 100}%`
                                  : "0%",
                              background: item.color,
                              borderRadius: 4,
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#6b7280",
                            width: 28,
                            textAlign: "right",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Top empresas */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 16,
                      padding: "20px 24px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 16px",
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "#4b5563",
                        fontWeight: 700,
                      }}
                    >
                      Empresas más colaboradoras
                    </p>
                    {topEmpresas.length === 0 ? (
                      <p style={{ fontSize: 12, color: "#4b5563" }}>
                        Sin datos de empresas aún.
                      </p>
                    ) : (
                      topEmpresas.slice(0, 4).map((e, i) => (
                        <div
                          key={e.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: "9px 0",
                            borderBottom:
                              i < Math.min(topEmpresas.length, 4) - 1
                                ? "1px solid rgba(255,255,255,0.04)"
                                : "none",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "#374151",
                              fontWeight: 700,
                              width: 18,
                              textAlign: "center",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            #{i + 1}
                          </span>
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#f9fafb",
                              }}
                            >
                              {e.nombre}
                            </p>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 11,
                                color: "#6b7280",
                              }}
                            >
                              {e.sector ?? "—"}
                            </p>
                          </div>
                          {e.valoracion > 0 && <Stars rating={e.valoracion} />}
                          <span
                            style={{
                              fontSize: 11,
                              color: "#6b7280",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {e.colaboraciones} colab.
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ══ ESTUDIANTES ══ */}
              {activeTab === "estudiantes" && (
                <div>
                  <SectionHeader
                    title="Estudiantes registrados"
                    subtitle={`${estudiantes.length} alumnos en la plataforma`}
                    action={
                      <SearchInput
                        value={searchEst}
                        onChange={setSearchEst}
                        placeholder="Buscar alumno…"
                      />
                    }
                  />
                  <Table
                    headers={[
                      "Alumno",
                      "Tutor asignado",
                      "Empresa",
                      "Candidaturas",
                      "Estado",
                    ]}
                  >
                    {estudiantesFiltrados.map((e, i) => (
                      <TR
                        key={e.id}
                        last={i === estudiantesFiltrados.length - 1}
                        cells={[
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 600,
                                color: "#f9fafb",
                                fontSize: 12,
                              }}
                            >
                              {e.nombre}
                            </p>
                            <p
                              style={{
                                margin: "2px 0 0",
                                color: "#6b7280",
                                fontSize: 11,
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              {e.titulacion}
                            </p>
                          </div>,
                          <span style={{ color: "#9ca3af", fontSize: 12 }}>
                            {e.tutor}
                          </span>,
                          <span
                            style={{
                              color: e.empresa ? "#d1d5db" : "#374151",
                              fontSize: 12,
                            }}
                          >
                            {e.empresa ?? "—"}
                          </span>,
                          <span
                            style={{
                              fontVariantNumeric: "tabular-nums",
                              color: "#9ca3af",
                              fontSize: 12,
                            }}
                          >
                            {e.candidaturas}
                          </span>,
                          <StatusDot estado={e.estado} />,
                        ]}
                      />
                    ))}
                  </Table>
                  {estudiantesFiltrados.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 0",
                        color: "#4b5563",
                        fontSize: 13,
                      }}
                    >
                      No se encontraron alumnos.
                    </div>
                  )}
                </div>
              )}

              {/* ══ EMPRESAS ══ */}
              {activeTab === "empresas" && (
                <div>
                  <SectionHeader
                    title="Empresas colaboradoras"
                    subtitle={`${empresas.length} empresas activas en la plataforma`}
                    action={
                      <SearchInput
                        value={searchEmp}
                        onChange={setSearchEmp}
                        placeholder="Buscar empresa…"
                      />
                    }
                  />
                  <Table
                    headers={[
                      "Empresa",
                      "Sector",
                      "Alumnos activos",
                      "Colaboraciones",
                      "Valoración",
                    ]}
                  >
                    {empresasFiltradas.map((e, i) => (
                      <TR
                        key={e.id}
                        last={i === empresasFiltradas.length - 1}
                        cells={[
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#f9fafb",
                              fontSize: 12,
                            }}
                          >
                            {e.nombre}
                          </span>,
                          <span style={{ color: "#9ca3af", fontSize: 12 }}>
                            {e.sector ?? "—"}
                          </span>,
                          <span
                            style={{
                              fontVariantNumeric: "tabular-nums",
                              color: "#9ca3af",
                              fontSize: 12,
                            }}
                          >
                            {e.alumnos_activos}
                          </span>,
                          <span
                            style={{
                              fontVariantNumeric: "tabular-nums",
                              color: "#9ca3af",
                              fontSize: 12,
                            }}
                          >
                            {e.colaboraciones}
                          </span>,
                          e.valoracion > 0 ? (
                            <Stars rating={e.valoracion} />
                          ) : (
                            <span style={{ color: "#4b5563", fontSize: 11 }}>
                              Sin valoraciones
                            </span>
                          ),
                        ]}
                      />
                    ))}
                  </Table>
                  {empresasFiltradas.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 0",
                        color: "#4b5563",
                        fontSize: 13,
                      }}
                    >
                      No se encontraron empresas.
                    </div>
                  )}
                </div>
              )}

              {/* ══ CANDIDATURAS ══ */}
              {activeTab === "candidaturas" && (
                <div>
                  <SectionHeader
                    title="Candidaturas enviadas"
                    subtitle={`${candidaturas.length} candidaturas registradas`}
                  />
                  <Table
                    headers={[
                      "Estudiante",
                      "Empresa",
                      "Oferta",
                      "Fecha",
                      "Estado",
                    ]}
                  >
                    {candidaturas.map((c, i) => {
                      const est =
                        ESTADO_CANDIDATURA[c.estado] ??
                        ESTADO_CANDIDATURA["pendiente"];
                      return (
                        <TR
                          key={c.id}
                          last={i === candidaturas.length - 1}
                          cells={[
                            <span
                              style={{
                                fontWeight: 600,
                                color: "#f9fafb",
                                fontSize: 12,
                              }}
                            >
                              {c.estudiante}
                            </span>,
                            <span style={{ color: "#9ca3af", fontSize: 12 }}>
                              {c.empresa}
                            </span>,
                            <span
                              style={{
                                color: "#9ca3af",
                                fontSize: 12,
                                fontStyle: "italic",
                              }}
                            >
                              {c.oferta}
                            </span>,
                            <span
                              style={{
                                color: "#6b7280",
                                fontSize: 11,
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              {c.fecha
                                ? new Date(c.fecha).toLocaleDateString("es-ES")
                                : "—"}
                            </span>,
                            <span
                              style={{
                                fontSize: 11,
                                color: est.color,
                                fontWeight: 600,
                                background: `${est.color}14`,
                                border: `1px solid ${est.color}30`,
                                borderRadius: 20,
                                padding: "2px 9px",
                                display: "inline-block",
                              }}
                            >
                              {est.label}
                            </span>,
                          ]}
                        />
                      );
                    })}
                  </Table>
                  {candidaturas.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 0",
                        color: "#4b5563",
                        fontSize: 13,
                      }}
                    >
                      No hay candidaturas registradas.
                    </div>
                  )}
                </div>
              )}

              {/* ══ TUTORES ══ */}
              {activeTab === "tutores" && (
                <div>
                  <SectionHeader
                    title="Actividad por tutor"
                    subtitle="Tutores del centro con sus alumnos asignados"
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: 12,
                      marginBottom: 24,
                    }}
                  >
                    {tutores.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          background: "rgba(255,255,255,0.025)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: 14,
                          padding: "18px 20px",
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#9ca3af",
                            marginBottom: 12,
                          }}
                        >
                          {(t.nombre ?? "?")[0]}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#f9fafb",
                          }}
                        >
                          {t.nombre}
                        </p>
                        <p
                          style={{
                            margin: "3px 0 10px",
                            fontSize: 11,
                            color: "#6b7280",
                          }}
                        >
                          {t.email}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 24,
                              fontWeight: 800,
                              color: "#f9fafb",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {t.lista?.length ?? 0}
                          </span>
                          <span style={{ fontSize: 11, color: "#6b7280" }}>
                            alumnos
                          </span>
                        </div>
                      </div>
                    ))}
                    {tutores.length === 0 && (
                      <p
                        style={{
                          color: "#4b5563",
                          fontSize: 13,
                          gridColumn: "1/-1",
                        }}
                      >
                        No hay tutores asignados.
                      </p>
                    )}
                  </div>
                  {tutores.length > 0 && (
                    <>
                      <p
                        style={{
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          color: "#4b5563",
                          fontWeight: 700,
                          marginBottom: 12,
                        }}
                      >
                        Detalle por tutor
                      </p>
                      {tutores.map((t) => (
                        <TutorRow key={t.id} tutor={t} />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
