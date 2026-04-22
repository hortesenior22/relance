import { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Redirige al perfil correcto según el rol
function getProfilePath(role) {
  if (role === "empresa") return "/perfil/empresa";
  if (role === "centro_educativo") return "/perfil/centro";
  if (role === "tutor_empresa" || role === "tutor_centro")
    return "/perfil/tutor";
  return "/perfil";
}

export default function UserMenu({ onClose }) {
  const { user, signOut } = useAuth();
  const ref = useRef(null);
  const navigate = useNavigate();

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const role = user?.user_metadata?.role;
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate("/", { replace: true }); // Redirige al home después de cerrar sesión
  };

  const profilePath = getProfilePath(role);

  // Items estáticos + condicionales por rol
  const menuItems = [
    {
      icon: "icon-user",
      label: "Mi perfil",
      href: profilePath,
      roles: null,
    },
    {
      icon: "icon-settings",
      label: "Configuración",
      href: profilePath,
      roles: null,
    },
    {
      icon: "icon-document",
      label: "Mis candidaturas",
      href: "/candidaturas",
      roles: ["estudiante"],
    },
    {
      icon: "icon-briefcase",
      label: "Gestión de ofertas",
      href: "/ofertas",
      roles: ["empresa"],
    },
    {
      icon: "icon-educativeCenter",
      label: "Panel del centro",
      href: "/panel-centro",
      roles: ["centro_educativo"],
    },
    {
      icon: "icon-tutor",
      label: "Mis estudiantes",
      href: "/mis-estudiantes",
      roles: ["tutor_empresa", "tutor_centro"],
    },
  ];

  const visibleItems = menuItems.filter(
    (item) => item.roles === null || item.roles.includes(role),
  );

  // Badge de rol
  const roleBadges = {
    estudiante: { label: "Estudiante", color: "bg-blue-500/20 text-blue-400" },
    empresa: { label: "Empresa", color: "bg-purple-500/20 text-purple-400" },
    centro_educativo: {
      label: "Centro educativo",
      color: "bg-orange-500/20 text-orange-400",
    },
    tutor_empresa: {
      label: "Tutor de empresa",
      color: "bg-green-500/20 text-green-400",
    },
    tutor_centro: {
      label: "Tutor de centro",
      color: "bg-teal-500/20 text-teal-400",
    },
  };
  const badge = roleBadges[role];

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-64 bg-dark-800 border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-slide-down"
    >
      {/* Header del dropdown */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-dark font-bold text-sm flex-shrink-0 font-display">
            {initials || "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-sm truncate font-display">
            {fullName}
          </p>
          <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          {badge && (
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${badge.color}`}
            >
              {badge.label}
            </span>
          )}
        </div>
      </div>

      {/* Items del menú */}
      <div className="py-1">
        {visibleItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-150"
          >
            <span>
              <svg className="w-5 h-5" viewBox="0 0 640 640">
                <use
                  href={`/icons.svg#${item.icon}`}
                  xlinkHref={`/icons.svg#${item.icon}`}
                />
              </svg>
            </span>
            <span>{item.label}</span>
          </a>
        ))}
      </div>

      {/* Cerrar sesión */}
      <div className="border-t border-white/10 py-1">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-150"
        >
          <span>
            <svg className="size-5 text-red-400" viewBox="0 0 640 640">
              <use
                href={`/icons.svg#icon-exit`}
                xlinkHref={`/icons.svg#icon-exit`}
              />
            </svg>
          </span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
