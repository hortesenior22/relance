// api/search.ts  — Example with Express + Supabase
// ──────────────────────────────────────────────────
// GET /api/search?q=accenture&types=empresa,estudiante
//
// The client sends only the types allowed by the user's role (RBAC enforced
// on the frontend). The backend RE-VALIDATES permissions server-side.

import { createClient } from "@supabase/supabase-js";
import type { Request, Response } from "express";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // use service role only server-side
);

// ─── Role → allowed entity tables ────────────────────────────────────────────

type Role =
  | "administrador"
  | "estudiante"
  | "empresa"
  | "centro_educativo"
  | "tutor_centro"
  | "tutor_empresa";

type EntityType = "empresa" | "centro_educativo" | "estudiante" | "oferta";

const ROLE_PERMISSIONS: Record<Role, EntityType[]> = {
  administrador: ["empresa", "centro_educativo", "estudiante", "oferta"],
  empresa: ["centro_educativo", "estudiante"],
  centro_educativo: ["empresa", "oferta"],
  tutor_empresa: ["estudiante", "centro_educativo"],
  tutor_centro: ["empresa", "oferta"],
  estudiante: ["empresa", "centro_educativo", "oferta"],
};

// ─── Table mapping ────────────────────────────────────────────────────────────

const ENTITY_TABLE: Record<EntityType, string> = {
  empresa: "empresa",
  centro_educativo: "centro_educativo",
  estudiante: "usuario", // adjust to your real table name
  oferta: "oferta",
};

// ─── Field mapping (what to select per entity) ───────────────────────────────

const ENTITY_FIELDS: Record<EntityType, string> = {
  empresa: "id, nombre, logo_url, ciudad",
  centro_educativo: "id, nombre, logo_url, ciudad",
  estudiante: "id, full_name, avatar_url, ciclo",
  oferta: "id, titulo, empresa_nombre, modalidad",
};

// ─── Shape normalizer ─────────────────────────────────────────────────────────

function normalize(type: EntityType, row: Record<string, unknown>) {
  switch (type) {
    case "empresa":
      return {
        id: row.id,
        type,
        name: row.nombre,
        subtitle: `${row.ciudad ?? ""}`,
        avatarUrl: row.logo_url ?? null,
        href: `/empresas/${row.id}`,
      };
    case "centro_educativo":
      return {
        id: row.id,
        type,
        name: row.nombre,
        subtitle: `${row.ciudad ?? ""}`,
        avatarUrl: row.logo_url ?? null,
        href: `/centros/${row.id}`,
      };
    case "estudiante":
      return {
        id: row.id,
        type,
        name: row.full_name,
        subtitle: row.ciclo ?? "",
        avatarUrl: row.avatar_url ?? null,
        href: `/estudiantes/${row.id}`,
      };
    case "oferta":
      return {
        id: row.id,
        type,
        name: row.titulo,
        subtitle: `${row.empresa_nombre ?? ""} · ${row.modalidad ?? ""}`,
        avatarUrl: null,
        href: `/ofertas/${row.id}`,
      };
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function searchHandler(req: Request, res: Response) {
  // 1. Auth: resolve the calling user's role from JWT
  const authHeader = req.headers.authorization ?? "";
  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);
  if (authError || !user)
    return res.status(401).json({ error: "Unauthorized" });

  const { data: profile } = await supabase
    .from("usuario")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.rol ?? "estudiante") as Role;
  const allowed = ROLE_PERMISSIONS[role] ?? [];

  // 2. Parse & sanitize query params
  const query = String(req.query.q ?? "")
    .trim()
    .slice(0, 120);
  if (!query) return res.json([]);

  const requestedTypes = String(req.query.types ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter((t): t is EntityType => allowed.includes(t as EntityType));

  if (!requestedTypes.length) return res.json([]);

  // 3. Fan out queries in parallel, limit 5 results per entity
  const MAX_PER_ENTITY = 5;

  const queries = requestedTypes.map(async (type) => {
    const table = ENTITY_TABLE[type];
    const fields = ENTITY_FIELDS[type];
    const nameCol =
      type === "estudiante"
        ? "full_name"
        : type === "oferta"
          ? "titulo"
          : "nombre";

    const { data, error } = await supabase
      .from(table)
      .select(fields)
      .ilike(nameCol, `%${query}%`)
      .limit(MAX_PER_ENTITY);

    if (error) {
      console.error(`Search error [${type}]:`, error);
      return [];
    }
    return (data ?? []).map((row) =>
      normalize(type, row as Record<string, unknown>),
    );
  });

  const nested = await Promise.all(queries);
  const results = nested.flat();

  return res.json(results);
}

// ─── Express route registration ───────────────────────────────────────────────
// In your routes file:
//
// import express from "express";
// import { searchHandler } from "./api/search";
// const router = express.Router();
// router.get("/search", searchHandler);
// export default router;
