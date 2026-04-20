import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading, openLoginModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      openLoginModal();
      navigate("/", { replace: true });
    }
  }, [loading, user]);

  if (loading) return null;
  if (!user) return null;

  return children;
}
