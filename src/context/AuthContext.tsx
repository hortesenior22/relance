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
   ROLES DEL SISTEMA (UNIFICADO)
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
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Carga el rol desde la BD cada vez que cambia el usuario
  const loadRole = async (u: User | null) => {
    if (!u) {
      setUserRole(null);
      return;
    }
    try {
      const role = await fetchUserRole(u.id);
      setUserRole(role);
    } catch {
      setUserRole(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const u = data.session?.user ?? null;

        setUser(u);
        await loadRole(u);
      } catch (err) {
        console.warn("Error al obtener sesión:", err);
        setUser(null);
        setUserRole(null);
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
          await loadRole(u);
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
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
