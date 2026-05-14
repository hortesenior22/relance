import { useAuth, getRoleRoute } from "../../context/AuthContext";
import { useHeroStats } from "../../hooks/useHeroStats";

export default function HeroSection({ onRegisterClick }) {
  const { stats, loading } = useHeroStats();
  const { user, userRole } = useAuth();

  const scrollToNext = () => {
    const next = document.getElementById("como-funciona");
    if (next) next.scrollIntoView({ behavior: "smooth" });
  };

  const profileUrl = getRoleRoute(userRole);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(192,255,114,1) 1px, transparent 1px), linear-gradient(90deg, rgba(192,255,114,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Central glow — brand green tinted, very subtle */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 700,
          height: 500,
          borderRadius: "50%",
          opacity: 0.07,
          filter: "blur(120px)",
          background:
            "radial-gradient(ellipse, #c0ff72 0%, #1a3a5c 60%, transparent 100%)",
        }}
      />

      {/* Bottom-right accent — navy blue glow */}
      <div
        className="absolute bottom-20 right-10 pointer-events-none"
        style={{
          width: 320,
          height: 320,
          borderRadius: "50%",
          opacity: 0.08,
          filter: "blur(80px)",
          background: "#1e4a8a",
        }}
      />

      {/* Top-left accent — deep navy */}
      <div
        className="absolute top-10 left-0 pointer-events-none"
        style={{
          width: 400,
          height: 300,
          borderRadius: "50%",
          opacity: 0.06,
          filter: "blur(100px)",
          background: "#0a1f4e",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 animate-hero-in opacity-0"
          style={{ animationDelay: "0.1s" }}
        >
          Conecta talento con{" "}
          <span
            className="text-brand relative inline-block"
            style={{ textShadow: "0 0 40px rgba(192,255,114,0.3)" }}
          >
            oportunidades reales
          </span>
        </h1>

        <p
          className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-hero-in opacity-0"
          style={{ animationDelay: "0.2s" }}
        >
          La plataforma que une{" "}
          <span className="text-gray-300 font-medium">estudiantes</span>,{" "}
          <span className="text-gray-300 font-medium">empresas</span> y{" "}
          <span className="text-gray-300 font-medium">centros educativos</span>{" "}
          en un mismo lugar.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-hero-in opacity-0"
          style={{ animationDelay: "0.35s" }}
        >
          {!user && (
            <button
              onClick={onRegisterClick}
              className="btn-primary text-base px-8 py-3.5 rounded-xl shadow-lg shadow-brand/20 flex items-center gap-2 hover:shadow-brand/30 transition-shadow duration-300"
            >
              Empieza gratis
              <svg className="size-6" viewBox="0 0 24 24" strokeWidth="2">
                <use href="icons.svg#icon-arrowStart" />
              </svg>
            </button>
          )}

          {user && (
            <a
              href={profileUrl}
              className="flex btn-primary text-base px-8 py-3.5 rounded-xl shadow-lg shadow-brand/20 hover:shadow-brand/30 transition-shadow duration-300"
            >
              Ir a mi perfil
              <svg className="size-6" viewBox="0 0 24 24" strokeWidth="2">
                <use href="icons.svg#icon-arrowStart" />
              </svg>
            </a>
          )}

          <button
            onClick={scrollToNext}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 group"
          >
            <span>Saber más</span>
            <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200">
              <use href="icons.svg#icon-arrowDown" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 animate-hero-in opacity-0"
          style={{ animationDelay: "0.5s" }}
        >
          {[
            {
              value: stats?.estudiantes ? stats.estudiantes + "+" : "0+",
              label: "Estudiantes activos",
            },
            {
              value: stats?.empresas ? stats.empresas + "+" : "0+",
              label: "Empresas verificadas",
            },
            {
              value: stats?.centros ? stats.centros + "+" : "0+",
              label: "Centros educativos",
            },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-2xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-brand/40" />
      </div>
    </section>
  );
}
