import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { AccountType } from "../components/auth/AccountType";

/** Devuelve la ruta de perfil según el rol */
export function getRoleRoute(role: AccountType | null): string {
  switch (role) {
    case "empresa":
      return "/perfil/empresa";
    case "centro":
      return "/perfil/centro";
    case "tutor":
      return "/perfil/tutor";
    case "estudiante":
    default:
      return "/perfil/estudiante";
  }
}

/** Consulta el rol del usuario en la tabla `usuario` */
export async function fetchUserRole(
  userId: string,
): Promise<AccountType | null> {
  const { data, error } = await supabase
    .from("usuario")
    .select("rol")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data.rol as AccountType;
}

type AuthContextType = {
  user: User | null;
  userRole: AccountType | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(true);

  // Carga el rol desde la BD cada vez que cambia el usuario
  const loadRole = async (u: User | null) => {
    if (!u) {
      setUserRole(null);
      return;
    }
    const role = await fetchUserRole(u.id);
    setUserRole(role);
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
        await loadRole(u);
        setLoading(false);
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
