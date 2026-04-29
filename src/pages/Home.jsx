import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import HeroSection from "../components/home/HeroSection";
import LoginModal from "../components/auth/LoginModal";
import MainLayout from "../components/layout/MainLayout";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const goToRegister = () => navigate("/registro");

  // Abrre el modal si viene de otra página
  useEffect(() => {
    if (location.state?.openLogin) {
      setShowLogin(true);

      // limpiar state para que no se reabra al refrescar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-dark">
        <HeroSection onRegisterClick={goToRegister} />

        {/* <section
          id="como-funciona"
          className="py-32 max-w-5xl mx-auto px-6 text-center"
        >
          <span className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-brand text-xs font-semibold tracking-wide uppercase">
              Próximamente
            </span>
          </span>

          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Más secciones en desarrollo
          </h2>

          <p className="text-gray-500 text-lg">
            Aquí irán las secciones de "Cómo funciona", "Para empresas" y "Para
            centros educativos".
          </p>
        </section> */}

        {/* Modal login */}
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false);
              goToRegister();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
