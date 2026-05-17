import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { showAlert } from "../../lib/swal";

export default function UserMenu({ onClose }) {
  const { user, userRole, avatarUrl, loading } = useAuth();
  const ref = useRef(null);
  const navigate = useNavigate();

  const role = userRole;
  const fullName = user?.user_metadata?.full_name ?? user?.email ?? "Usuario";
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const [noLeidas, setNoLeidas] = useState(0);

  const cargarNoLeidas = useCallback(async () => {
    if (!user) return;
    const { data: usuarioRow } = await supabase
      .from("usuario")
      .select("id")
      .eq("id_auth", user.id)
      .maybeSingle();

    if (!usuarioRow?.id) return;

    const { count } = await supabase
      .from("notificacion")
      .select("id_notificacion", { count: "exact", head: true })
      .eq("id_usuario", usuarioRow.id)
      .eq("leido", false);

    setNoLeidas(count ?? 0);
  }, [user]);

  useEffect(() => {
    if (!loading && user) cargarNoLeidas();
  }, [loading, user, cargarNoLeidas]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notificaciones_badge")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacion" },
        () => cargarNoLeidas(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notificacion" },
        () => cargarNoLeidas(),
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, cargarNoLeidas]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  if (loading || !user) return null;

  const handleSignOut = async () => {
    const identities = user?.identities ?? [];
    const hasGoogle = identities.some((i) => i.provider === "google");
    const hasGitHub = identities.some((i) => i.provider === "github");
    const hasOAuth = hasGoogle || hasGitHub;

    if (hasOAuth) {
      const googleBtn = hasGoogle
        ? `<a href="https://accounts.google.com/Logout"
            target="_blank" rel="noopener noreferrer"
            onclick="event.stopPropagation()"
            class="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-800
                   hover:bg-gray-200 transition-all w-full text-xs font-medium">
            <svg width="16" height="16"><use href="/icons.svg#icon-google"/></svg>
            Cerrar sesión en Google
          </a>`
        : "";

      const githubBtn = hasGitHub
        ? `<a href="https://github.com/logout"
            target="_blank" rel="noopener noreferrer"
            onclick="event.stopPropagation()"
            class="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-gray-700 bg-gray-900 text-white
                   hover:bg-gray-800 transition-all w-full text-xs font-medium">
            <svg width="16" height="16" class="text-white"><use href="/icons.svg#icon-github"/></svg>
            Cerrar sesión en GitHub
          </a>`
        : "";

      const providerNames = [hasGoogle && "Google", hasGitHub && "GitHub"]
        .filter(Boolean)
        .join(" y ");

      const result = await showAlert({
        icon: "warning",
        title: "Antes de cerrar sesión",
        html: `
          <p class="text-sm text-gray-400 mb-3">
            Tienes sesión activa en <strong class="text-white">${providerNames}</strong>.
            Si estás en un dispositivo compartido, ciérrala también para mayor seguridad.
          </p>
          <div class="flex flex-col gap-2">
            ${googleBtn}
            ${githubBtn}
          </div>
          <p class="text-xs text-gray-600 mt-3">
            Cuando estés listo, pulsa el botón para cerrar sesión en Relance.
          </p>
        `,
        confirmButtonText: "Entendido, cerrar sesión",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
        allowEscapeKey: true,
      });

      if (!result.isConfirmed) return;
    }

    await supabase.auth.signOut();
    onClose();
    navigate("/", { replace: true });
  };

  const profilePath =
    role === "admin"
      ? "/perfil/admin"
      : role === "empresa"
        ? "/perfil/empresa"
        : role === "centro_educativo" || role === "centro"
          ? "/perfil/centro"
          : role === "tutor_empresa" ||
              role === "tutor_centro" ||
              role === "tutor"
            ? "/perfil/tutor"
            : "/perfil/estudiante";

  const menuItems = [
    { icon: "icon-user", label: "Mi perfil", href: profilePath, roles: null },

    // ADMIN
    {
      icon: "icon-settings",
      label: "Panel de administración",
      href: "/panel-administracion",
      roles: ["admin"],
    },
    {
      icon: "icon-student",
      label: "Gestionar usuarios",
      href: "/admin/usuarios",
      roles: ["admin"],
    },
    {
      icon: "icon-briefcase",
      label: "Gestionar ofertas",
      href: "/admin/ofertas",
      roles: ["admin"],
    },

    // OFERTAS
    {
      icon: "icon-briefcase",
      label: "Ofertas de prácticas",
      href: "/ofertas",
      roles: ["estudiante", "tutor_empresa", "tutor_centro"],
    },
    {
      icon: "icon-briefcase",
      label: "Gestión de ofertas",
      href: "/ofertas",
      roles: ["empresa"],
    },

    // CANDIDATURAS
    {
      icon: "icon-candidacy",
      label: "Mis candidaturas",
      href: "/candidaturas",
      roles: ["estudiante"],
    },

    // CENTRO
    {
      icon: "icon-educativeCenter",
      label: "Panel del centro",
      href: "/panel-centro",
      roles: ["centro_educativo"],
    },

    // TUTORES
    {
      icon: "icon-student",
      label: "Mis estudiantes",
      href: "/mis-estudiantes",
      roles: ["tutor_empresa", "tutor_centro"],
    },

    // NOTIFICACIONES
    {
      icon: "icon-bell",
      label: "Notificaciones",
      href: "/notificaciones",
      roles: null,
      badge: noLeidas > 0 ? noLeidas : null,
    },

    {
      icon: "icon-settings",
      label: "Configuración",
      href: profilePath,
      roles: null,
    },
  ];

  const visibleItems = menuItems.filter(
    (item) => item.roles === null || item.roles.includes(role),
  );

  const roleBadges = {
    admin: { label: "Administrador", color: "bg-red-500/15 text-red-400" },
    estudiante: { label: "Estudiante", color: "bg-blue-500/15 text-blue-400" },
    empresa: { label: "Empresa", color: "bg-purple-500/15 text-purple-400" },
    centro_educativo: {
      label: "Centro educativo",
      color: "bg-orange-500/15 text-orange-400",
    },
    tutor_empresa: {
      label: "Tutor de empresa",
      color: "bg-green-500/15 text-green-400",
    },
    tutor_centro: {
      label: "Tutor de centro",
      color: "bg-teal-500/15 text-teal-400",
    },
    tutor: { label: "Tutor", color: "bg-green-500/15 text-green-400" },
  };
  const badge = roleBadges[role];

  return (
    <>
      <div
        ref={ref}
        className="absolute right-0 top-full mt-1.5 w-56 rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden animate-slide-down"
        style={{
          background: "var(--color-surface-strong)",
          border: "1px solid var(--color-border-strong)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-3 py-2.5"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 font-display"
              style={{ background: "var(--color-brand)", color: "#02050d" }}
            >
              {initials || "?"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p
              className="font-semibold text-xs truncate font-display"
              style={{ color: "var(--color-text)" }}
            >
              {fullName}
            </p>
            <p
              className="text-[10px] truncate"
              style={{ color: "var(--color-text-muted)" }}
            >
              {user?.email}
            </p>
            {badge && (
              <span
                className={`inline-block text-[9px] px-1.5 py-px rounded-full mt-0.5 font-semibold ${badge.color}`}
              >
                {badge.label}
              </span>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="py-0.5">
          {visibleItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 text-xs transition-colors duration-150"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "var(--color-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
            >
              <span className="relative flex-shrink-0">
                {item.icon === "icon-bell" ? (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 640 640">
                    <use
                      href={`/icons.svg#${item.icon}`}
                      xlinkHref={`/icons.svg#${item.icon}`}
                    />
                  </svg>
                )}
                {item.badge && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[14px] h-3.5 text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none"
                    style={{
                      background: "var(--color-brand)",
                      color: "#02050d",
                    }}
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              <span className="flex-1 leading-none">{item.label}</span>
              {item.badge && (
                <span
                  className="text-[9px] px-1 py-px rounded-full font-semibold"
                  style={{
                    background: "rgba(192,255,114,0.12)",
                    color: "var(--color-brand)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </div>

        {/* Cerrar sesión */}
        <div
          className="py-0.5"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors duration-150"
            style={{ color: "var(--color-error)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-error-bg)";
              e.currentTarget.style.color = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--color-error)";
            }}
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 640 640">
              <use
                href="/icons.svg#icon-exit"
                xlinkHref="/icons.svg#icon-exit"
              />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}
