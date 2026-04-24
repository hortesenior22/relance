import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

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

        if (data?.session) {
          window.location.replace("/");
        } else {
          setError("No se pudo recuperar la sesión.");
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark text-white">
      {error ? (
        <div className="text-center">
          <p className="text-red-400 mb-2">Error de autenticación</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-400">
          <span className="animate-spin">⏳</span>
          Procesando login con GitHub...
        </div>
      )}
    </div>
  );
}
