/**
 * App.tsx — Routing principal de Relance
 *
 * Flujos de navegación:
 *
 * PERFILES — Directorio
 *  /perfiles                     → ProfilesPage (directorio, sin perfil abierto)
 *
 * PERFILES — Detalle (UserProfilePage infiere tipo desde el path)
 *  /empresa/:id                  → UserProfilePage (empresa)
 *  /centro/:id                   → UserProfilePage (centro_educativo)
 *  /estudiante/:id               → UserProfilePage (estudiante)
 *  /tutor-empresa/:id            → UserProfilePage (tutor_empresa)
 *  /tutor-centro/:id             → UserProfilePage (tutor_centro)
 *
 * OFERTAS
 *  /ofertas                      → OfertasPage (listado, sin oferta abierta)
 *  /ofertas/:id                  → redirect a /ofertas?oferta=:id (abre modal)
 *
 * SEARCHMODAL:
 *  Navega directamente a /empresa/:id, /centro/:id, etc.
 *  UserProfilePage infiere el tipo desde window.location.pathname.
 */

import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Navigate,
} from "react-router-dom";
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
import AuthCallback from "./pages/AuthCallback";
import OnboardingModal from "./components/auth/OnboardingModal";
import OfertasPage from "./pages/ofertas/Offer";
import NotificacionesPage from "./pages/NotificacionesPage";
import ProfilesPage from "./pages/profiles/ProfilesPage";
import UserProfilePage from "./pages/profiles/UserProfilePage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import AdminProfile from "./pages/profiles/AdminProfile";
import AdministrationPanel from "./pages/AdministrationPanel";
import CenterEducativePanel from "./pages/CenterEducativePanel";

import { useEffect, useState, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────

const ROLES_SIN_ONBOARDING = [
  "estudiante",
  "empresa",
  "centro_educativo",
  "tutor_empresa",
  "tutor_centro",
  "tutor",
];

// ─── Redirect helpers ─────────────────────────────────────────────────────────

/**
 * /ofertas/:id  →  /ofertas?oferta=:id
 */
function OfertaDirecta() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/ofertas?oferta=${id ?? ""}`} replace />;
}

// ─────────────────────────────────────────────────────────────────────────────

function AppContent() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // safeLoading: solo bloquea la UI en la carga inicial.
  // hasLoadedOnce: una vez que loading baja a false por primera vez,
  // ya nunca volvemos a mostrar el spinner (ni por TOKEN_REFRESHED ni por nada).
  const [safeLoading, setSafeLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Primera (o cualquier) vez que loading pasa a false
      setHasLoadedOnce(true);
      setSafeLoading(false);
      return;
    }

    // loading es true: solo bloqueamos si NUNCA hemos cargado antes
    if (hasLoadedOnce) {
      // Ya cargó una vez → ignoramos futuros ciclos de loading
      // (TOKEN_REFRESHED, USER_UPDATED, etc.) sin mostrar spinner
      return;
    }

    // Primera carga: ponemos un fallback por si Supabase tarda demasiado
    const fallback = setTimeout(() => {
      console.warn("Loading timeout: desbloqueando UI");
      setSafeLoading(false);
    }, 8000);

    return () => clearTimeout(fallback);
  }, [loading, hasLoadedOnce]);

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

  // Solo mostramos el spinner en la carga inicial (nunca si ya cargó una vez)
  if (safeLoading && !hasLoadedOnce) {
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
        {/* ── Públicas / Auth ───────────────────────────────────────────── */}
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/registro-tutor" element={<TutorRegisterPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ── Directorio de perfiles ────────────────────────────────────
            /perfiles  →  ProfilesPage (lista según rol del viewer)
            Al hacer clic en una card navega a /empresa/:id, /centro/:id, etc.
        ─────────────────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/perfiles" element={<ProfilesPage />} />
        </Route>

        {/* ── Detalle de perfil (UserProfilePage) ──────────────────────
            Accesibles desde ProfilesPage, SearchModal o cualquier link.
            UserProfilePage infiere el tipo de entidad desde el path.
        ─────────────────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/empresa/:id" element={<UserProfilePage />} />
          <Route path="/centro/:id" element={<UserProfilePage />} />
          <Route path="/estudiante/:id" element={<UserProfilePage />} />
          <Route path="/tutor-empresa/:id" element={<UserProfilePage />} />
          <Route path="/tutor-centro/:id" element={<UserProfilePage />} />
        </Route>

        {/* ── Ofertas ───────────────────────────────────────────────────
            /ofertas               → listado + filtros
            /ofertas?oferta=ID     → listado + modal de la oferta ID
            /ofertas/:id           → redirect a /ofertas?oferta=:id
        ─────────────────────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/ofertas" element={<OfertasPage />} />
          <Route path="/ofertas/:id" element={<OfertaDirecta />} />
        </Route>

        {/* ── Notificaciones ────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/notificaciones" element={<NotificacionesPage />} />
        </Route>

        {/* ── Perfiles propios (protegidos por rol) ────────────────────── */}
        <Route element={<ProtectedRoute requiredRole="estudiante" />}>
          <Route path="/perfil/estudiante" element={<StudentProfile />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="empresa" />}>
          <Route path="/perfil/empresa" element={<CompanyProfile />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="centro_educativo" />}>
          <Route path="/perfil/centro" element={<CenterProfile />} />
          <Route path="/panel-centro" element={<CenterEducativePanel />} />
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
          <Route
            path="/panel-administracion"
            element={<AdministrationPanel />}
          />
        </Route>

        {/* ── 404 ─────────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
