import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import type { Role, SearchCategory } from "./searchConfig";
import { getAllowedCategories } from "./searchConfig";

export interface SearchResult {
  id: string;
  category: SearchCategory;
  name: string;
  secondary: string;
  avatar?: string;
  href: string;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  recent: SearchResult[];
  popular: SearchResult[];
  loading: boolean;
  error: string | null;
}

const RECENT_KEY = "relance_search_recent";
const DEBOUNCE_MS = 280;

function loadRecent(): SearchResult[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(items: SearchResult[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, 8)));
}

async function fetchResults(
  query: string,
  categories: SearchCategory[],
  signal: AbortSignal
): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  const searches = categories.map(async (cat) => {
    let table = "";
    let nameField = "";
    let secondaryField = "";
    let hrefPrefix = "";

    switch (cat) {
      case "empresas":
        table = "empresa";
        nameField = "nombre";
        secondaryField = "sector";
        hrefPrefix = "/empresa";
        break;
      case "centros_educativos":
        table = "centro_educativo";
        nameField = "nombre";
        secondaryField = "ciudad";
        hrefPrefix = "/centro";
        break;
      case "estudiantes":
        table = "estudiante";
        nameField = "nombre_completo";
        secondaryField = "ciclo";
        hrefPrefix = "/estudiante";
        break;
      case "ofertas":
        table = "oferta";
        nameField = "titulo";
        secondaryField = "empresa_nombre";
        hrefPrefix = "/oferta";
        break;
    }

    if (!table) return;

    const { data, error } = await supabase
      .from(table)
      .select(`id, ${nameField}, ${secondaryField}, avatar_url`)
      .ilike(nameField, `%${q}%`)
      .limit(5);

    if (error || !data || signal.aborted) return;

    data.forEach((row: Record<string, unknown>) => {
      results.push({
        id: String(row.id),
        category: cat,
        name: String(row[nameField] ?? ""),
        secondary: String(row[secondaryField] ?? ""),
        avatar: row.avatar_url ? String(row.avatar_url) : undefined,
        href: `${hrefPrefix}/${row.id}`,
      });
    });
  });

  await Promise.allSettled(searches);
  return results;
}

export function useGlobalSearch(role: Role) {
  const allowedCategories = getAllowedCategories(role);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<SearchResult[]>(loadRecent);
  const [popular] = useState<SearchResult[]>([]);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    (q: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();

      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      timerRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const data = await fetchResults(q, allowedCategories, controller.signal);
          if (!controller.signal.aborted) {
            setResults(data);
          }
        } catch {
          if (!controller.signal.aborted) {
            setError("Error al buscar. Inténtalo de nuevo.");
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      }, DEBOUNCE_MS);
    },
    [allowedCategories]
  );

  useEffect(() => {
    search(query);
    return () => {
      timerRef.current && clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [query, search]);

  const addToRecent = useCallback((item: SearchResult) => {
    setRecent((prev) => {
      const filtered = prev.filter((r) => r.id !== item.id || r.category !== item.category);
      const updated = [item, ...filtered].slice(0, 8);
      saveRecent(updated);
      return updated;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    recent,
    popular,
    addToRecent,
    clearRecent,
    allowedCategories,
  };
}