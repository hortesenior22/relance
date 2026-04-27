import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Conectando con GitHub...");
  const [error, setError] = useState(null);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      try {
        // ── 1. Detectar errores de GitHub ─────────────────────
        const url = new URL(window.location.href);
        const errorParam = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");

        if (errorParam) {
          setError(errorDescription || errorParam);
          setTimeout(() => navigate("/perfil/estudiante"), 3000);
          return;
        }

        // ── 2. Esperar a que Supabase tenga la sesión ─────────
        setStatus("Verificando sesión...");
        await waitForSession();
      } catch (err) {
        console.error("[AuthCallback] Error:", err);
        setError(err.message || "Error al conectar con GitHub.");
        setTimeout(() => navigate("/perfil/estudiante"), 3000);
      }
    };

    // Espera activa de sesión (IMPORTANTE en OAuth)
    const waitForSession = async (retries = 20) => {
      for (let i = 0; i < retries; i++) {
        const { data } = await supabase.auth.getSession();

        if (data?.session) {
          await handleSessionEstablished(data.session);
          return;
        }

        await new Promise((r) => setTimeout(r, 500));
      }

      setError("No se pudo establecer la sesión. Inténtalo de nuevo.");
      setTimeout(() => navigate("/perfil/estudiante"), 3000);
    };

    // ── 3. Sincronizar datos de GitHub ───────────────────────
    const handleSessionEstablished = async (session) => {
      setStatus("Sincronizando datos de GitHub...");

      const user = session.user;
      const githubData = user.user_metadata;

      const githubUsername =
        githubData?.user_name ||
        githubData?.preferred_username ||
        githubData?.login ||
        null;

      const githubAvatarUrl =
        githubData?.avatar_url || githubData?.picture || null;

      // Obtener perfil existente
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("github_username, avatar_url, redes_sociales")
        .eq("id", user.id)
        .single();

      const updates = {
        id: user.id,
        github_username: existingProfile?.github_username || githubUsername,
        avatar_url: existingProfile?.avatar_url || githubAvatarUrl,
        updated_at: new Date().toISOString(),
      };

      // Añadir link de GitHub
      if (githubUsername) {
        updates.redes_sociales = {
          ...(existingProfile?.redes_sociales || {}),
          github: `https://github.com/${githubUsername}`,
        };
      }

      await supabase.from("profiles").upsert(updates);

      setStatus("¡GitHub conectado! Redirigiendo...");

      // Limpiar URL
      window.history.replaceState({}, document.title, "/auth/callback");

      // Redirección por rol
      const role = user.user_metadata?.role;

      let redirectTo = "/perfil/estudiante";
      if (role === "empresa") redirectTo = "/perfil/empresa";
      else if (role === "centro_educativo") redirectTo = "/perfil/centro";
      else if (role === "tutor_empresa" || role === "tutor_centro") {
        redirectTo = "/perfil/tutor";
      }

      // Intento de vinculación
      const wasLinkIntent = sessionStorage.getItem("github_link_intent");
      if (wasLinkIntent) {
        sessionStorage.removeItem("github_link_intent");
        redirectTo += "?github_connected=1";
      }

      setTimeout(() => navigate(redirectTo, { replace: true }), 1200);
    };

    handleCallback();
  }, [navigate]);

  // ── UI ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 mb-5">
          {error ? (
            <svg className="w-6 h-6 text-red-500" viewBox="0 0 640 640">
              <use href="/icons.svg#icon-times-circle" />
            </svg>
          ) : (
            <span className="text-brand text-2xl">GH</span>
          )}
        </div>

        {error ? (
          <>
            <h2 className="text-white font-bold mb-2">Error al conectar</h2>
            <p className="text-red-400 text-sm">{error}</p>
          </>
        ) : (
          <>
            <h2 className="text-white font-bold mb-3">{status}</h2>
            <div className="animate-spin w-6 h-6 border-2 border-brand border-t-transparent rounded-full mx-auto" />
          </>
        )}
      </div>
    </div>
  );
}
