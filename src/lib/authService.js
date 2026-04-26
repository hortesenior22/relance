import { supabase } from "../lib/supabase";

/**
 * Logout unificado:
 * - siempre cierra Supabase
 * - intenta cerrar proveedor externo (no bloqueante)
 */
export async function signOutWithProvider(user) {
  const provider = user?.app_metadata?.provider;

  // 1. Cerrar sesión Supabase (OBLIGATORIO)
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error cerrando sesión Supabase:", error);
  }

  // 2. Logout proveedor externo (NO crítico)
  try {
    if (provider === "google") {
      window.open("https://accounts.google.com/Logout", "_blank");
    }

    if (provider === "github") {
      window.open("https://github.com/logout", "_blank");
    }
  } catch (err) {
    console.warn("Error cerrando proveedor externo:", err);
  }
}