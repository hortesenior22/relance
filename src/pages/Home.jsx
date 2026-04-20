import { useState } from "react";
import Header from "../components/layout/Header";
import HeroSection from "../components/home/HeroSection";
import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [modal, setModal] = useState(null); // null | 'login' | 'register'
  const { openLoginModal } = useAuth();

  return (
    <div className="min-h-screen bg-dark">
      <Header
        onLoginClick={() => setModal("login")}
        onRegisterClick={() => setModal("register")}
      />

      <main>
        <HeroSection onRegisterClick={() => setModal("register")} />

        {/* Sección placeholder para scroll target */}

        {/* <section id="como-funciona" className="py-32 max-w-5xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-brand text-xs font-semibold tracking-wide uppercase">Próximamente</span>
          </span>
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Más secciones en desarrollo
          </h2>
          <p className="text-gray-500 text-lg">
            Aquí irán las secciones de "Cómo funciona", "Para empresas" y "Para centros educativos".
          </p>
        </section> */}
      </main>

      {/* Modales */}
      {modal === "login" && (
        <LoginModal
          onClose={() => setModal(null)}
          onSwitchToRegister={() => setModal("register")}
        />
      )}
      {modal === "register" && (
        <RegisterModal
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal("login")}
        />
      )}
    </div>
  );
}
