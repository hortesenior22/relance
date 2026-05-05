import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";

/* ============================================================
   ROLES DEL SISTEMA
============================================================ */
export type UserRole =
  | "estudiante"
  | "empresa"
  | "centro_educativo"
  | "tutor"
  | "tutor_empresa"
  | "tutor_centro";

/** Devuelve la ruta de perfil según el rol */
export function getRoleRoute(role: UserRole | null): string {
  switch (role) {
    case "empresa":
      return "/perfil/empresa";
    case "centro_educativo":
      return "/perfil/centro";
    case "tutor":
    case "tutor_empresa":
    case "tutor_centro":
      return "/perfil/tutor";
    case "estudiante":
    default:
      return "/perfil/estudiante";
  }
}

/** Consulta el rol del usuario en la tabla `usuario` */
export async function fetchUserRole(userId: string): Promise<UserRole | null> {
  try {
    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 5000),
    );
    const query = supabase
      .from("usuario")
      .select("rol")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return null;
        return data.rol as UserRole;
      });
    return await Promise.race([query, timeout]);
  } catch {
    return null;
  }
}

type AuthContextType = {
  user: User | null;
  userRole: UserRole | null;
  avatarUrl: string | null;
  loading: boolean;
  refreshAvatar: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Carga rol Y avatar desde `usuario` en una sola query.
   * Se llama cada vez que cambia la sesión.
   */
  const loadUserData = async (u: User | null) => {
    if (!u) {
      setUserRole(null);
      setAvatarUrl(null);
      return;
    }
    try {
      const timeout = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 5000),
      );
      const query = supabase
        .from("usuario")
        .select("rol, avatar_url")
        .eq("id", u.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) return null;
          return data;
        });
      const data = await Promise.race([query, timeout]);
      setUserRole((data?.rol as UserRole) ?? null);
      setAvatarUrl(data?.avatar_url ?? null);
    } catch {
      setUserRole(null);
      setAvatarUrl(null);
    }
  };

  /**
   * Refresca solo el avatar desde `usuario.avatar_url`.
   * Llamar tras subir una nueva foto en cualquier perfil.
   */
  const refreshAvatar = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("usuario")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    if (data?.avatar_url !== undefined) setAvatarUrl(data.avatar_url);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const u = data.session?.user ?? null;
        setUser(u);
        await loadUserData(u);
      } catch (err) {
        console.warn("Error al obtener sesión:", err);
        setUser(null);
        setUserRole(null);
        setAvatarUrl(null);
      } finally {
        setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session: Session | null) => {
        const u = session?.user ?? null;
        setUser(u);
        try {
          await loadUserData(u);
        } finally {
          setLoading(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setAvatarUrl(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userRole, avatarUrl, loading, refreshAvatar, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
