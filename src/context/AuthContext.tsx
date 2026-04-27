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
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
