import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Intercambia el código de autorización por una sesión y redirige al usuario
  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );

        if (error) {
          setError(error.message);
          return;
        }

        const user = data?.session?.user;

        if (!user) {
          setError("No se pudo obtener el usuario");
          return;
        }

        const routeMap = {
          estudiante: "/perfil/estudiante",
          empresa: "/perfil/empresa",
          centro_educativo: "/perfil/centro",
          tutor_empresa: "/perfil/tutor",
          tutor_centro: "/perfil/tutor",
        } as const;

        type Role = keyof typeof routeMap;

        const role = user?.user_metadata?.role as Role;

        navigate(routeMap[role] ?? "/perfil/estudiante", {
          replace: true,
        });
      } catch (err: any) {
        setError(err.message);
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark text-white">
      {error ? (
        <div className="text-center">
          <p className="text-red-400 mb-2">Error de autenticación</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-400">
          <svg
            className="animate-spin w-5 h-5 text-brand"
            viewBox="0 0 640 640"
          >
            <use href="/icons.svg#icon-hourglass" />
          </svg>
          Finalizando login...
        </div>
      )}
    </div>
  );
}
