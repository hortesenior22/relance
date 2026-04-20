import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import UserMenu from "../auth/UserMenu";
import logoUrl from "../../assets/logo_relance.jpg";

export default function Header({ onLoginClick, onRegisterClick }) {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { openLoginModal } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? "";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const navLinks = [
    { label: "Inicio", href: "/" },
    // { label: 'Cómo funciona', href: '#como-funciona' },
    // { label: 'Para empresas', href: '#empresas' },
    // { label: 'Para centros educativos', href: '#centros' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-dark/90 backdrop-blur-md border-b border-brand/10 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src={logoUrl}
              alt="Relance"
              className="h-8 w-auto rounded-md"
            />
          </a>

          {/* Nav central — solo desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-150 font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Sección derecha */}
          <div className="flex items-center gap-3">
            {user ? (
              /* Avatar con dropdown */
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent hover:border-brand transition-all duration-200 flex-shrink-0"
                  aria-label="Menú de usuario"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand flex items-center justify-center text-dark font-bold text-sm font-display">
                      {initials || "?"}
                    </div>
                  )}
                </button>
                {menuOpen && <UserMenu onClose={() => setMenuOpen(false)} />}
              </div>
            ) : (
              /* Botones auth */
              <>
                <button
                  onClick={openLoginModal}
                  className="hidden sm:flex btn-secondary text-sm"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={onRegisterClick}
                  className="btn-primary text-sm"
                >
                  Registrarse
                </button>
              </>
            )}

            {/* Hamburguesa mobile */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Menú"
            >
              {mobileNavOpen ? (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Nav mobile desplegable */}
        {mobileNavOpen && (
          <nav className="md:hidden border-t border-white/10 py-3 pb-4 animate-slide-down">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className="block px-2 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            {!user && (
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onLoginClick();
                }}
                className="mt-2 w-full btn-secondary text-sm"
              >
                Iniciar sesión
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
