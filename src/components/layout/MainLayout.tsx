import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import LoginModal from "../auth/LoginModal";

export default function MainLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [showLogin, setShowLogin] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const goToRegister = () => navigate("/registro");

  useEffect(() => {
    if (location.state?.openLogin) {
      setShowLogin(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-dark">
      <Header
        onLoginClick={() => setShowLogin(true)}
        onRegisterClick={goToRegister}
      />

      <main className="flex-1">{children}</main>

      <Footer />

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            navigate("/registro");
          }}
        />
      )}
    </div>
  );
}
