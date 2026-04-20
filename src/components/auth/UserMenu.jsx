import { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserMenu({ onClose }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);

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
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate("/", { replace: true });
  };

  const menuItems = [
    { icon: "icon-user-alt", label: "Mi perfil", href: "/perfil", roles: null },
    // { icon: 'icon-settings', label: 'Configuración', href: '/configuracion', roles: null },
    {
      icon: "icon-document",
      label: "Mis candidaturas",
      href: "/candidaturas",
      roles: ["estudiante"],
    },
    {
      icon: "icon-building",
      label: "Gestión de ofertas",
      href: "/ofertas",
      roles: ["empresa"],
    },
    {
      icon: "icon-home",
      label: "Panel del centro",
      href: "/panel-centro",
      roles: ["centro_educativo"],
    },
  ];

  const visibleItems = menuItems.filter(
    (item) => item.roles === null || item.roles.includes(role),
  );

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
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-dark font-bold text-sm flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate font-display">
            {fullName}
          </p>
          <p className="text-gray-500 text-xs truncate">{user?.email}</p>
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
            <svg className="w-5 h-5 text-gray-300 flex-shrink-0">
              <use href={`/icons.svg#${item.icon}`} />
            </svg>

            <span>{item.label}</span>
          </a>
        ))}
      </div>

      {/* Separador + cerrar sesión */}
      <div className="border-t border-white/10 py-1">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-150"
        >
          <svg className="w-5 h-5 text-red-400 flex-shrink-0">
            <use href="/icons.svg#icon-exit-1" />
          </svg>

          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
