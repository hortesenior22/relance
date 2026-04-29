import { Outlet, Navigate } from "react-router-dom";
import { useAuth, getRoleRoute } from "../../context/AuthContext";

/**
 * ProtectedRoute — protege rutas según autenticación y rol.
 *
 * Uso en App.tsx:
 *   <Route element={<ProtectedRoute requiredRole="estudiante" />}>
 *     <Route path="/perfil/estudiante" element={<StudentProfile />} />
 *   </Route>
 *
 * Si no se pasa requiredRole, solo comprueba que el usuario esté autenticado.
 * Si el usuario está autenticado pero tiene un rol distinto, lo redirige
 * a su propio perfil en lugar de mostrarle un 403.
 */
export default function ProtectedRoute({ requiredRole } = {}) {
  const { user, userRole, loading } = useAuth();

  // Mientras carga la sesión/rol no renderizamos nada
  if (loading) return null;

  // Sin sesión → al inicio
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Con rol requerido y el usuario tiene un rol diferente → a su perfil
  const roleAllowed =
    !requiredRole ||
    !userRole ||
    (Array.isArray(requiredRole)
      ? requiredRole.includes(userRole)
      : userRole === requiredRole);

  if (!roleAllowed && userRole) {
    return <Navigate to={getRoleRoute(userRole)} replace />;
  }

  return <Outlet />;
}
