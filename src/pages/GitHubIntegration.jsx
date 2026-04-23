// ─────────────────────────────────────────────────────────────────────────────
// GitHubIntegration.jsx
//
// Integración GitHub OAuth para el perfil de estudiante.
// Pega este componente en tu proyecto y:
//   1. Importa <GitHubReposSection> en StudentProfile.jsx
//   2. Añade las variables de entorno (ver abajo)
//   3. Configura el OAuth App en GitHub (ver README al final)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// ── Variables de entorno necesarias ──────────────────────────────────────────
// En tu .env:
//   VITE_GITHUB_CLIENT_ID=tu_client_id_aqui
//
// En Supabase > Authentication > Providers > GitHub:
//   Activa GitHub OAuth e introduce Client ID y Client Secret
//
// En tu GitHub OAuth App (github.com/settings/developers):
//   Homepage URL: http://localhost:5173 (o tu dominio)
//   Callback URL: https://[tu-proyecto].supabase.co/auth/v1/callback
// ─────────────────────────────────────────────────────────────────────────────

// ─── Iconos ──────────────────────────────────────────────────────────────────
function IconGitHub({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
function IconStar({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function IconLink({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}
function IconUnlink({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
function IconRefresh({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}
function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Colores por lenguaje (GitHub style) ────────────────────────────────────
const LANG_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C#": "#178600",
  "C++": "#f34b7d",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Vue: "#41b883",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  R: "#198CE7",
};

function LangDot({ lang }) {
  const color = LANG_COLORS[lang] || "#8b949e";
  return (
    <span className="flex items-center gap-1 text-xs text-gray-400">
      <span
        style={{ backgroundColor: color }}
        className="w-2.5 h-2.5 rounded-full inline-block"
      />
      {lang}
    </span>
  );
}

// ─── Hook: sesión de GitHub vía Supabase OAuth ───────────────────────────────
export function useGitHubSession() {
  const [githubSession, setGithubSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Detectar token de GitHub desde la sesión de Supabase (provider_token)
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (
        session?.provider_token &&
        session?.user?.app_metadata?.provider === "github"
      ) {
        setGithubSession({
          token: session.provider_token,
          username: session.user?.user_metadata?.user_name,
          avatarUrl: session.user?.user_metadata?.avatar_url,
        });
      }
      setLoading(false);
    };
    check();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (
          session?.provider_token &&
          session?.user?.app_metadata?.provider === "github"
        ) {
          setGithubSession({
            token: session.provider_token,
            username: session.user?.user_metadata?.user_name,
            avatarUrl: session.user?.user_metadata?.avatar_url,
          });
        } else {
          setGithubSession(null);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const connectGitHub = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "read:user public_repo",
        redirectTo: window.location.href,
      },
    });
  }, []);

  return { githubSession, loading, connectGitHub };
}

// ─── Hook: obtener repos del usuario autenticado ─────────────────────────────
export function useGitHubRepos(token) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRepos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "https://api.github.com/user/repos?sort=updated&per_page=50&type=owner",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        },
      );
      if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
      const data = await res.json();
      setRepos(
        data.map((r) => ({
          repo_id: r.id,
          nombre: r.name,
          nombre_completo: r.full_name,
          descripcion: r.description || "",
          url: r.html_url,
          url_demo: r.homepage || "",
          lenguajes: r.language ? [r.language] : [],
          estrellas: r.stargazers_count,
          forks: r.forks_count,
          privado: r.private,
          actualizado: r.updated_at,
          vinculado_proyecto_id: null,
        })),
      );
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return { repos, loading, error, refetch: fetchRepos };
}

// ─── Tarjeta de repositorio ──────────────────────────────────────────────────
function RepoCard({ repo, isVinculado, onToggle }) {
  const fecha = repo.actualizado
    ? new Date(repo.actualizado).toLocaleDateString("es-ES", {
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div
      className={`group relative p-4 rounded-xl border transition-all duration-200 ${
        isVinculado
          ? "border-brand/40 bg-brand/5"
          : "border-white/8 bg-dark hover:border-white/15"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display font-semibold text-sm text-white hover:text-brand transition-colors truncate"
            >
              {repo.nombre}
            </a>
            {repo.privado && (
              <span className="text-xs border border-white/20 text-gray-500 px-1.5 py-0.5 rounded-full flex-shrink-0">
                privado
              </span>
            )}
          </div>
          {repo.descripcion && (
            <p className="text-gray-500 text-xs line-clamp-2 mb-2">
              {repo.descripcion}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {repo.lenguajes[0] && <LangDot lang={repo.lenguajes[0]} />}
            {repo.estrellas > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <IconStar /> {repo.estrellas}
              </span>
            )}
            {fecha && <span className="text-xs text-gray-600">{fecha}</span>}
          </div>
        </div>

        {/* Botón vincular/desvincular */}
        <button
          onClick={() => onToggle(repo)}
          className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-200 ${
            isVinculado
              ? "border-brand/40 text-brand bg-brand/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
              : "border-white/15 text-gray-400 hover:border-brand/40 hover:text-brand hover:bg-brand/5"
          }`}
          title={isVinculado ? "Quitar del perfil" : "Añadir al perfil"}
        >
          {isVinculado ? (
            <>
              <IconUnlink size={11} /> Quitar
            </>
          ) : (
            <>
              <IconLink size={11} /> Añadir
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL que se integra en StudentProfile ──────────────────
/**
 * GitHubReposSection
 *
 * Props:
 *   - reposVinculados: array de repos guardados en la BD
 *   - onReposChange: callback(nuevosRepos) — actualiza el estado del padre
 *   - githubUsername: string | null — guardado en el perfil
 *   - onUsernameChange: callback(username) — guarda el username
 */
export default function GitHubReposSection({
  reposVinculados = [],
  onReposChange,
  githubUsername,
  onUsernameChange,
}) {
  const {
    githubSession,
    loading: sessionLoading,
    connectGitHub,
  } = useGitHubSession();
  const {
    repos,
    loading: reposLoading,
    error,
    refetch,
  } = useGitHubRepos(githubSession?.token);
  const [busqueda, setBusqueda] = useState("");

  // Sincronizar username cuando conectamos
  useEffect(() => {
    if (githubSession?.username && githubSession.username !== githubUsername) {
      onUsernameChange?.(githubSession.username);
    }
  }, [githubSession?.username]);

  const vinculadosIds = new Set(reposVinculados.map((r) => r.repo_id));

  const handleToggle = (repo) => {
    if (vinculadosIds.has(repo.repo_id)) {
      onReposChange(reposVinculados.filter((r) => r.repo_id !== repo.repo_id));
    } else {
      onReposChange([...reposVinculados, repo]);
    }
  };

  const reposFiltrados = repos.filter(
    (r) =>
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(busqueda.toLowerCase()),
  );

  // ── Estado: cargando sesión ──────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-600 gap-2">
        <Spinner /> Comprobando sesión...
      </div>
    );
  }

  // ── Estado: no conectado ─────────────────────────────────────────────────
  if (!githubSession) {
    return (
      <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-gray-500">
          <IconGitHub size={28} />
        </div>
        <h3 className="font-display text-white font-semibold mb-1">
          Conecta tu GitHub
        </h3>
        <p className="text-gray-600 text-sm mb-5 max-w-xs mx-auto">
          Vincula tu cuenta para mostrar tus repositorios directamente en tu
          perfil.
        </p>
        <button
          onClick={connectGitHub}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <IconGitHub size={14} />
          Conectar con GitHub
        </button>

        {/* Repos vinculados previamente (sin sesión activa) */}
        {reposVinculados.length > 0 && (
          <div className="mt-6 text-left border-t border-white/8 pt-5">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">
              Repositorios en tu perfil ({reposVinculados.length})
            </p>
            <div className="space-y-2">
              {reposVinculados.map((r) => (
                <div
                  key={r.repo_id}
                  className="flex items-center justify-between p-3 bg-dark border border-white/8 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <IconGitHub size={12} />
                    <span className="text-sm text-white font-medium">
                      {r.nombre}
                    </span>
                    {r.lenguajes?.[0] && <LangDot lang={r.lenguajes[0]} />}
                  </div>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-brand transition-colors"
                  >
                    Ver →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Estado: conectado ────────────────────────────────────────────────────
  return (
    <div>
      {/* Header de sesión */}
      <div className="flex items-center justify-between mb-4 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
        <div className="flex items-center gap-2.5">
          {githubSession.avatarUrl && (
            <img
              src={githubSession.avatarUrl}
              alt={githubSession.username}
              className="w-7 h-7 rounded-full border border-white/10"
            />
          )}
          <div>
            <p className="text-xs text-green-400 font-semibold">
              GitHub conectado
            </p>
            <p className="text-xs text-gray-500">@{githubSession.username}</p>
          </div>
        </div>
        <button
          onClick={refetch}
          disabled={reposLoading}
          className="p-2 text-gray-500 hover:text-white hover:bg-white/8 rounded-lg transition-all"
          title="Actualizar repositorios"
        >
          {reposLoading ? (
            <Spinner className="w-3.5 h-3.5" />
          ) : (
            <IconRefresh size={14} />
          )}
        </button>
      </div>

      {/* Repos vinculados al perfil */}
      {reposVinculados.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            En tu perfil ({reposVinculados.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {reposVinculados.map((r) => (
              <span
                key={r.repo_id}
                className="flex items-center gap-1.5 bg-brand/10 border border-brand/20 text-brand text-xs px-2.5 py-1 rounded-full"
              >
                <IconGitHub size={10} />
                {r.nombre}
                <button
                  onClick={() => handleToggle(r)}
                  className="text-brand/60 hover:text-brand leading-none ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="relative mb-3">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar repositorios..."
          className="input-field text-sm pl-8"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
          {error}.{" "}
          <button onClick={refetch} className="underline">
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de repos */}
      {reposLoading && repos.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-gray-600 gap-2">
          <Spinner /> Cargando repositorios...
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          {reposFiltrados.length === 0 ? (
            <p className="text-center text-gray-600 text-sm py-6">
              {busqueda
                ? "No se encontraron repositorios"
                : "No tienes repositorios públicos"}
            </p>
          ) : (
            reposFiltrados.map((repo) => (
              <RepoCard
                key={repo.repo_id}
                repo={repo}
                isVinculado={vinculadosIds.has(repo.repo_id)}
                onToggle={handleToggle}
              />
            ))
          )}
        </div>
      )}

      <p className="text-xs text-gray-700 mt-3 text-center">
        {reposFiltrados.length} repositorios · Solo se muestran los públicos
      </p>
    </div>
  );
}
