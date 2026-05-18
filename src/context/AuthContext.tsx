import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  | "tutor_centro"
  | "admin";

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
    case "admin":
      return "/perfil/admin";
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

  // Ref para rastrear el email activo sin depender del estado React
  // Esto nos permite detectar si SIGNED_IN es un login real o un refresco
  const activeEmailRef = useRef<string | null>(null);

  /**
   * Carga rol Y avatar desde `usuario` usando email como clave.
   * usuario.id es un UUID propio de la tabla, distinto al UUID de Auth,
   * por eso usamos email que sí es compartido entre ambas tablas.
   */
  const loadUserData = async (u: User | null) => {
    if (!u?.email) {
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
        .eq("email", u.email)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) return null;
          return data;
        });
      const data = await Promise.race([query, timeout]);
      console.log("[loadUserData] email:", u.email, "→ data:", data);
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
    if (!user?.email) return;
    const { data } = await supabase
      .from("usuario")
      .select("avatar_url")
      .eq("email", user.email)
      .maybeSingle();
    if (data?.avatar_url !== undefined) setAvatarUrl(data.avatar_url);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const u = data.session?.user ?? null;
        setUser(u);
        // Guardamos el email activo desde el inicio
        activeEmailRef.current = u?.email ?? null;
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
        const incomingEmail = u?.email ?? null;

        console.log(
          "[onAuthStateChange] evento:",
          _event,
          "| email entrante:",
          incomingEmail,
          "| email activo:",
          activeEmailRef.current,
        );

        // Siempre silenciosos: nunca bloquean la UI
        const silentEvents = [
          "TOKEN_REFRESHED",
          "USER_UPDATED",
          "MFA_CHALLENGE_VERIFIED",
        ];

        // SIGNED_IN es silencioso si el usuario ya estaba activo (mismo email).
        // Es un login real solo si no había sesión antes o cambió el usuario.
        const isSameUser =
          incomingEmail !== null && incomingEmail === activeEmailRef.current;
        const isSilent =
          silentEvents.includes(_event) ||
          (_event === "SIGNED_IN" && isSameUser);

        console.log(
          "[onAuthStateChange] isSameUser:",
          isSameUser,
          "| isSilent:",
          isSilent,
        );

        setUser(u);

        if (isSilent) {
          // Refresco silencioso: actualizamos datos sin tocar loading ni la UI
          loadUserData(u);
          return;
        }

        // Cambio real de sesión: login nuevo o logout
        activeEmailRef.current = incomingEmail;
        setLoading(true);
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
    activeEmailRef.current = null;
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
