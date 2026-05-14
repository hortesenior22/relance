/**
 * Supabase Edge Function: /search
 *
 * POST body: { query: string, role: string }
 * Returns: { results: SearchResult[] }
 *
 * Deploy: supabase functions deploy search
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ROLE_PERMISSIONS: Record<string, string[]> = {
  administrador: ["empresas", "centros_educativos", "estudiantes", "ofertas"],
  empresa: ["centros_educativos", "estudiantes"],
  centro_educativo: ["empresas", "ofertas"],
  tutor_empresa: ["estudiantes", "centros_educativos"],
  tutor_centro: ["empresas", "ofertas"],
  estudiante: ["empresas", "centros_educativos", "ofertas"],
};

const TABLE_MAP: Record<
  string,
  { table: string; name: string; secondary: string; href: string }
> = {
  empresas: {
    table: "empresa",
    name: "nombre",
    secondary: "sector",
    href: "/empresa",
  },
  centros_educativos: {
    table: "centro_educativo",
    name: "nombre",
    secondary: "ciudad",
    href: "/centro",
  },
  estudiantes: {
    table: "estudiante",
    name: "nombre_completo",
    secondary: "ciclo",
    href: "/estudiante",
  },
  ofertas: {
    table: "oferta",
    name: "titulo",
    secondary: "empresa_nombre",
    href: "/oferta",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  try {
    const { query, role } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return Response.json({ results: [] });
    }

    if (!role || !ROLE_PERMISSIONS[role]) {
      return Response.json({ error: "Rol no válido" }, { status: 403 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const allowedCategories = ROLE_PERMISSIONS[role];
    const results = [];

    await Promise.all(
      allowedCategories.map(async (cat) => {
        const {
          table,
          name: nameField,
          secondary: secField,
          href,
        } = TABLE_MAP[cat];
        const { data, error } = await supabase
          .from(table)
          .select(`id, ${nameField}, ${secField}, avatar_url`)
          .ilike(nameField, `%${query.trim()}%`)
          .limit(5);

        if (error || !data) return;

        data.forEach((row) => {
          results.push({
            id: String(row.id),
            category: cat,
            name: row[nameField] ?? "",
            secondary: row[secField] ?? "",
            avatar: row.avatar_url ?? null,
            href: `${href}/${row.id}`,
          });
        });
      }),
    );

    return Response.json(
      { results },
      { headers: { "Access-Control-Allow-Origin": "*" } },
    );
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
});
