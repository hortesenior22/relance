import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({
  requiredRole,
}: {
  requiredRole?: string | string[];
}) {
  const { user, loading, userRole } = useAuth();

  // Si está cargando pero YA hay usuario, no desmontamos nada
  // Solo bloqueamos si no hay usuario todavía (carga inicial real)
  if (loading && !user) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Comprobación de rol si se requiere
  if (requiredRole && userRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
