import { createClient } from "@supabase/supabase-js";

// 🔹 Variables de entorno (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ⚠️ Aviso si faltan variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Faltan las variables de entorno de Supabase. " +
      "Copia .env.example como .env.local y rellena tus valores.",
  );
}

// 🔌 Cliente Supabase (✅ AQUÍ ESTÁ EL FIX)
export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // 🔥 NECESARIO para OAuth (GitHub y Google)
    },
  },
);

// 🔐 LOGIN CON GOOGLE (lo mantenemos tal cual, solo mejoramos redirect opcionalmente)
export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/perfil`, // 🔥 mejor que origin solo
    },
  });

  if (error) {
    console.error("Error login Google:", error.message);
  }
}
