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
import AuthCallback from "./pages/AuthCallback";
import OnboardingModal from "./components/auth/OnboardingModal";
import OfferPage from "./pages/ofertas/Offer";
import NotificacionesPage from "./pages/NotificacionesPage";

import { useEffect, useState, useRef } from "react";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import AdminProfile from "./pages/profiles/AdminProfile";
import AdministrationPanel from "./pages/AdministrationPanel";
import CenterEducativePanel from "./pages/CenterEducativePanel";

const ROLES_SIN_ONBOARDING = [
  "estudiante",
  "empresa",
  "centro_educativo",
  "tutor_empresa",
  "tutor_centro",
  "tutor",
];

function AppContent() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [safeLoading, setSafeLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      setSafeLoading(false);
      return;
    }
    const fallback = setTimeout(() => {
      console.warn("Loading timeout: desbloqueando UI");
      setSafeLoading(false);
    }, 8000);
    return () => clearTimeout(fallback);
  }, [loading]);

  const lastCheckedUserId = useRef<string | null>(null);
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkOnboarding = async (currentUser: typeof user, attempt = 0) => {
    if (retryTimeout.current) clearTimeout(retryTimeout.current);

    if (!currentUser) {
      setShowOnboarding(false);
      lastCheckedUserId.current = null;
      return;
    }

    if (["/registro", "/registro-tutor"].includes(window.location.pathname)) {
      setShowOnboarding(false);
      return;
    }

    if (attempt === 0 && lastCheckedUserId.current === currentUser.id) return;
    if (attempt === 0) lastCheckedUserId.current = currentUser.id;

    try {
      const { data, error } = await supabase
        .from("usuario")
        .select("is_profile_completed, rol")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        if (attempt < 4) {
          retryTimeout.current = setTimeout(
            () => checkOnboarding(currentUser, attempt + 1),
            1000 * (attempt + 1),
          );
        } else {
          setShowOnboarding(false);
        }
        return;
      }

      if (ROLES_SIN_ONBOARDING.includes(data.rol)) {
        setShowOnboarding(false);
        return;
      }

      setShowOnboarding(data.is_profile_completed !== true);
    } catch (err) {
      console.warn("checkOnboarding error:", err);
      setShowOnboarding(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      checkOnboarding(user);
      const params = new URLSearchParams(window.location.search);
      if (params.has("gh")) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    }
    return () => {
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
  }, [user, loading]);

  if (safeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="w-20 h-20 text-[#C0FF72]">
          <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <g>
              <rect
                className="box5532"
                x="13"
                y="1"
                rx="1"
                width="10"
                height="10"
              />
              <rect
                className="box5532"
                x="13"
                y="1"
                rx="1"
                width="10"
                height="10"
              />
              <rect
                className="box5532"
                x="25"
                y="25"
                rx="1"
                width="10"
                height="10"
              />
              <rect
                className="box5532"
                x="13"
                y="13"
                rx="1"
                width="10"
                height="10"
              />
              <rect
                className="box5532"
                x="13"
                y="13"
                rx="1"
                width="10"
                height="10"
              />
              <rect
                className="box5532"
                x="25"
                y="13"
                rx="1"
                width="10"
                height="10"
              />
              <rect
                className="box5532"
                x="1"
                y="25"
                rx="1"
                width="10"
                height="10"
              />
              <rect
                className="box5532"
                x="13"
                y="25"
                rx="1"
                width="10"
                height="10"
              />
              <rect
                className="box5532"
                x="25"
                y="25"
                rx="1"
                width="10"
                height="10"
              />
            </g>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <>
      {showOnboarding && user && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <OnboardingModal
            user={user}
            onClose={() => {
              setShowOnboarding(false);
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
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* RUTAS PROTEGIDAS */}
        <Route element={<ProtectedRoute requiredRole="estudiante" />}>
          <Route path="/perfil/estudiante" element={<StudentProfile />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="empresa" />}>
          <Route path="/perfil/empresa" element={<CompanyProfile />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="centro_educativo" />}>
          <Route path="/panel-centro" element={<CenterEducativePanel />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="centro_educativo" />}>
          <Route path="/perfil/centro" element={<CenterProfile />} />
        </Route>
        <Route
          element={
            <ProtectedRoute
              requiredRole={["tutor", "tutor_empresa", "tutor_centro"]}
            />
          }
        >
          <Route path="/perfil/tutor" element={<TutorProfile />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/perfil/admin" element={<AdminProfile />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route
            path="/panel-administracion"
            element={<AdministrationPanel />}
          />
        </Route>
        {/* Ofertas — todos los roles autenticados */}
        <Route element={<ProtectedRoute />}>
          <Route path="/ofertas" element={<OfferPage />} />
        </Route>
        {/* Notificaciones — todos los roles autenticados */} {/* ← NUEVO */}
        <Route element={<ProtectedRoute />}>
          <Route path="/notificaciones" element={<NotificacionesPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
