import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  // Abrir modal de login (en realidad es un modal que redirige a la página de login)
  const openLoginModal = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const closeLoginModal = () => setIsLoginOpen(false);

  // Abrir modal de regsitro (en realidad es un modal que redirige a la página de registro)
  const openRegisterModal = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const closeRegisterModal = () => setIsRegisterOpen(false);

  // Abrir modal de restablecimiento de contraseña (redirige a la página de restablecimiento)
  const openResetPassword = () => {
    closeLoginModal();
    setIsResetPasswordOpen(true);
  };

  const closeResetPasswordModal = () => {
    setIsResetPasswordOpen(false);
  };

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // SI hay sesión por recovery → abrir modal
      if (session) {
        const hash = window.location.hash;
        if (hash.includes("access_token")) {
          setIsResetPasswordOpen(true);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === "PASSWORD_RECOVERY") {
        setIsResetPasswordOpen(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut,

        isLoginOpen,
        openLoginModal,
        closeLoginModal,

        isRegisterOpen,
        openRegisterModal,
        closeRegisterModal,
        isResetPasswordOpen,
        openResetPassword,
        closeResetPasswordModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
