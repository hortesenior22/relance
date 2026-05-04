import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type HeroStats = {
  estudiantes: number;
  empresas: number;
  centros: number;
};

export const useHeroStats = () => {
  const [stats, setStats] = useState<HeroStats>({
    estudiantes: 0,
    empresas: 0,
    centros: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const [estudiantesRes, empresasRes, centrosRes] = await Promise.all([
          supabase
            .from("usuario")
            .select("*", { count: "exact", head: true })
            .eq("rol", "estudiante"),
          supabase
            .from("usuario")
            .select("*", { count: "exact", head: true })
            .eq("rol", "empresa"),
          supabase
            .from("usuario")
            .select("*", { count: "exact", head: true })
            .eq("rol", "centro_educativo"),
        ]);

        if (estudiantesRes.error || empresasRes.error || centrosRes.error) {
          throw new Error("Error al obtener estadísticas");
        }

        setStats({
          estudiantes: estudiantesRes.count ?? 0,
          empresas: empresasRes.count ?? 0,
          centros: centrosRes.count ?? 0,
        });
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};
