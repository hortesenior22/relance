import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";

import Home from "./pages/Home";
import StudentProfile from "./pages/profiles/StudentProfile";
import CompanyProfile from "./pages/profiles/CompanyProfile";
import CenterProfile from "./pages/profiles/CenterProfile";
import TutorProfile from "./pages/profiles/TutorProfile";
import RegisterPage from "./pages/register/RegisterPage";
import TutorRegisterPage from "./pages/register/TutorRegisterPage";
import ResetPassword from "./pages/ResetPassword";
import OnboardingModal from "./components/auth/OnboardingModal";

import { useEffect, useState, useRef } from "react";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import NotFound from "./pages/NotFound";

/* ───────── App Content ───────── */

function AppContent() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const params = new URLSearchParams(window.location.search);
  const isGitHubConnect = params.has("gh");

  const lastCheckedUserId = useRef<string | null>(null);

  const checkOnboarding = async (currentUser: typeof user) => {
    if (!currentUser) {
      setShowOnboarding(false);
      lastCheckedUserId.current = null;
      return;
    }

    if (lastCheckedUserId.current === currentUser.id) return;
    lastCheckedUserId.current = currentUser.id;

    try {
      const { data, error } = await supabase
        .from("usuario")
        .select("is_profile_completed")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) throw error;

      setShowOnboarding(!data || data.is_profile_completed !== true);
    } catch (err) {
      console.warn("checkOnboarding error:", err);
      setShowOnboarding(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      checkOnboarding(user);

      if (isGitHubConnect) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="w-20 h-20 text-[#C0FF72]">Loading...</div>
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

        {/* RUTAS PROTEGIDAS - No se puede acceder sin autenticación */}
        <Route element={<ProtectedRoute />}>
          <Route path="/perfil/estudiante" element={<StudentProfile />} />
          <Route path="/perfil/empresa" element={<CompanyProfile />} />
          <Route path="/perfil/centro" element={<CenterProfile />} />
          <Route path="/perfil/tutor" element={<TutorProfile />} />
        </Route>

        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </>
  );
}

/* ───────── Root ───────── */

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
