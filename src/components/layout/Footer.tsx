import logoUrl from "../../assets/logo_relance.jpg";

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-bg)",
        padding: "28px 0", // ← 40→28 px vertical
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={logoUrl}
            alt="Relance"
            style={{ height: 22, width: "auto", borderRadius: 5 }} // ← 40→22 px
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-text-muted)",
              fontFamily: "Syne, sans-serif",
              letterSpacing: "0.04em",
            }}
          >
            RELANCE
          </span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[{ label: "Inicio", href: "/" }].map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontSize: 11.5, // ← 14→11.5
                color: "var(--color-text-subtle)",
                textDecoration: "none",
                transition: "color 0.15s",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-text-secondary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-text-subtle)")
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div
          style={{
            fontSize: 11, // ← 14→11
            color: "var(--color-text-subtle)",
            fontFamily: "Plus Jakarta Sans, sans-serif",
          }}
        >
          © {new Date().getFullYear()} Relance. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
