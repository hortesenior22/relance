import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";

import Home from "./pages/Home";
import StudentProfile from "./pages/StudentProfile";
import CompanyProfile from "./pages/profiles/CompanyProfile";
import CenterProfile from "./pages/profiles/CenterProfile";
import TutorProfile from "./pages/profiles/TutorProfile";
import RegisterPage from "./pages/register/RegisterPage";
import TutorRegisterPage from "./pages/register/TutorRegisterPage";
import ResetPassword from "./pages/ResetPassword";
import OnboardingModal from "./components/auth/OnboardingModal";

import { useEffect, useState, useRef } from "react";

/* ─── Contenido de la app (necesita estar dentro de AuthProvider) ─────────── */

function AppContent() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Uso una ref para evitar que la comprobación se ejecute varias veces
  // cuando Supabase dispara múltiples eventos SIGNED_IN seguidos (comportamiento
  // habitual en OAuth después del redirect)
  const lastCheckedUserId = useRef<string | null>(null);

  const checkOnboarding = async (currentUser: typeof user) => {
    if (!currentUser) {
      setShowOnboarding(false);
      lastCheckedUserId.current = null;
      return;
    }

    // Evito relanzar la comprobación si ya la hice para este usuario
    if (lastCheckedUserId.current === currentUser.id) return;
    lastCheckedUserId.current = currentUser.id;

    // Solo lanzo el onboarding para usuarios que entraron por OAuth.
    // Los registrados con email/contraseña ya tienen fila insertada
    // por RegisterModal en el momento del registro.
    const provider = currentUser.app_metadata?.provider ?? "";
    const isOAuth = provider === "google" || provider === "github";

    if (!isOAuth) {
      setShowOnboarding(false);
      return;
    }

    try {
      // Busco por ID primero (caso habitual: mismo UUID en auth y usuario)
      const { data: byId } = await supabase
        .from("usuario")
        .select("id, is_profile_completed")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (byId) {
        // El usuario ya tiene fila → solo muestro si aún no completó el perfil
        setShowOnboarding(byId.is_profile_completed !== true);
        return;
      }

      // Si no encuentro por ID, busco por email.
      // Esto cubre el caso en que el usuario se registró antes con email/contraseña
      // y ahora entra con Google/GitHub usando el mismo correo. Supabase los
      // une en la misma cuenta (identity linking), pero conviene comprobarlo.
      const email = currentUser.email ?? "";
      if (email) {
        const { data: byEmail } = await supabase
          .from("usuario")
          .select("id, is_profile_completed")
          .eq("email", email)
          .maybeSingle();

        if (byEmail?.is_profile_completed === true) {
          setShowOnboarding(false);
          return;
        }
      }

      // No hay fila ni por ID ni por email → es un usuario nuevo de OAuth
      setShowOnboarding(true);
    } catch (err) {
      // Ante un fallo de red o permisos, no interrumpo al usuario
      console.warn("checkOnboarding: no se pudo consultar la BD", err);
      setShowOnboarding(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      checkOnboarding(user);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <svg className="w-20 h-20" viewBox="0 0 200 200">
          {[0, 0.08, 0.16, 0.24, 0.32].map((delay, i) => (
            <circle
              key={i}
              fill="#C0FF72"
              stroke="#C0FF72"
              strokeWidth="15"
              opacity={1 - i * 0.18}
              r="15"
              cx="35"
              cy="100"
            >
              <animate
                attributeName="cx"
                dur="2s"
                values="35;165;165;35;35"
                repeatCount="indefinite"
                begin={`${delay}s`}
              />
            </circle>
          ))}
        </svg>
      </div>
    );
  }

  return (
    <>
      {/* Onboarding — solo aparece la primera vez que un usuario OAuth entra */}
      {showOnboarding && user && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <OnboardingModal
            user={user}
            onClose={() => {
              setShowOnboarding(false);
              // Reinicio la ref para que si el usuario cierra sesión y vuelve
              // a entrar, se vuelva a comprobar correctamente
              lastCheckedUserId.current = null;
            }}
          />
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/registro-tutor" element={<TutorRegisterPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/perfil" element={<StudentProfile />} />
        <Route path="/perfil/empresa" element={<CompanyProfile />} />
        <Route path="/perfil/centro" element={<CenterProfile />} />
        <Route path="/perfil/tutor" element={<TutorProfile />} />
      </Routes>
    </>
  );
}

/* ─── Raíz de la app ────────────────────────────────────────────────────────── */

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
