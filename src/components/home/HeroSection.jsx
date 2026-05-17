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

      {/* Central glow */}
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

      {/* Bottom-right accent */}
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

      {/* Top-left accent */}
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

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 860,
          margin: "0 auto",
          padding: "0 20px",
          textAlign: "center",
        }}
      >
        {/* Título — más compacto en portátil */}
        <h1
          className="animate-hero-in opacity-0"
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)", // ← fluido: 32px → 56px
            fontWeight: 800,
            color: "white",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: "1.25rem", // ← mb-6 → mb-5
            animationDelay: "0.1s",
          }}
        >
          Conecta talento con{" "}
          <span
            className="text-brand"
            style={{ textShadow: "0 0 40px rgba(192,255,114,0.3)" }}
          >
            oportunidades reales
          </span>
        </h1>

        {/* Subtítulo */}
        <p
          className="animate-hero-in opacity-0"
          style={{
            color: "#9ca3af",
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)", // ← fluido: 14.4px → 17.6px
            maxWidth: 560,
            margin: "0 auto 2rem", // ← mb-10 → mb-8
            lineHeight: 1.65,
            animationDelay: "0.2s",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          La plataforma que une{" "}
          <span style={{ color: "#d1d5db", fontWeight: 500 }}>estudiantes</span>
          , <span style={{ color: "#d1d5db", fontWeight: 500 }}>empresas</span>{" "}
          y{" "}
          <span style={{ color: "#d1d5db", fontWeight: 500 }}>
            centros educativos
          </span>{" "}
          en un mismo lugar.
        </p>

        {/* CTAs */}
        <div
          className="animate-hero-in opacity-0"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            animationDelay: "0.35s",
          }}
        >
          {!user && (
            <button
              onClick={onRegisterClick}
              className="btn-primary"
              style={{
                fontSize: 13, // ← text-base(16) → 13
                padding: "10px 24px", // ← py-3.5 px-8 → más compacto
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(192,255,114,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "box-shadow 0.3s",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
              }}
            >
              Empieza gratis
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {user && (
            <a
              href={profileUrl}
              className="btn-primary"
              style={{
                fontSize: 13,
                padding: "10px 24px",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(192,255,114,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 700,
              }}
            >
              Ir a mi perfil
              <svg className="size-6" viewBox="0 0 24 24" strokeWidth="2">
                <use href="icons.svg#icon-arrowStart" />
              </svg>
            </a>
          )}

          <button
            onClick={scrollToNext}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#9ca3af",
              fontSize: 12, // ← text-sm(14) → 12
              fontWeight: 500,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "color 0.2s",
              fontFamily: "Plus Jakarta Sans, sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            Saber más
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div
          className="animate-hero-in opacity-0"
          style={{
            marginTop: "3rem", // ← mt-16 → mt-12
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem 2.5rem", // ← gap-8 sm:gap-12 → más compacto
            animationDelay: "0.5s",
          }}
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
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", // ← text-2xl fluido
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 10.5, // ← text-xs(12) → 10.5
                  color: "#6b7280",
                  marginTop: 2,
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          color: "#4b5563",
        }}
      >
        <div
          style={{
            width: 1,
            height: 28,
            background:
              "linear-gradient(to bottom, transparent, rgba(192,255,114,0.4))",
          }}
        />
      </div>
    </section>
  );
}
