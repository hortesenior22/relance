import { useHeroStats } from "../../hooks/useHeroStats";

export default function HeroSection({ onRegisterClick }) {
  const { stats, loading } = useHeroStats();

  const scrollToNext = () => {
    const next = document.getElementById("como-funciona");
    if (next) next.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark">
      {/* Grid pattern decorativo */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(192,255,114,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(192,255,114,1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Blob de luz verde lima */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-[0.06] blur-[120px] pointer-events-none"
        style={{ background: "#c0ff72" }}
      />

      {/* Blob secundario */}
      <div
        className="absolute bottom-20 right-10 w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px] pointer-events-none"
        style={{ background: "#c0ff72" }}
      />

      {/* Contenido */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        {/* <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 mb-8 animate-hero-in opacity-0">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            La plataforma de prácticas y primer empleo
          </span>
        </div> */}

        {/* Título */}
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

        {/* Subtítulo */}
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

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-hero-in opacity-0"
          style={{ animationDelay: "0.35s" }}
        >
          <button
            onClick={onRegisterClick}
            className="btn-primary text-base px-8 py-3.5 rounded-xl shadow-lg shadow-brand/20 hover:shadow-brand/30 transition-shadow duration-300"
          >
            Empieza gratis
          </button>

          {/* <button
            onClick={scrollToNext}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 group"
          >
            <span>Saber más</span>
            <svg
              className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button> */}
        </div>

        {/* STATS */}
        <div
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 animate-hero-in opacity-0"
          style={{ animationDelay: "0.5s" }}
        >
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="font-display text-2xl font-bold text-white">
                    ...
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Cargando...
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-white">
                  {stats.estudiantes}+
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Estudiantes activos
                </div>
              </div>

              <div className="text-center">
                <div className="font-display text-2xl font-bold text-white">
                  {stats.empresas}+
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Empresas verificadas
                </div>
              </div>

              <div className="text-center">
                <div className="font-display text-2xl font-bold text-white">
                  {stats.centros}+
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Centros educativos
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Indicador scroll */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-brand/40" />
      </div>
    </section>
  );
}
