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

// 🔌 Cliente Supabase
export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
);

// 🔐 LOGIN CON GOOGLE (añadido)
export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin, // importante para dev y prod
    },
  });

  if (error) {
    console.error("Error login Google:", error.message);
  }
}
