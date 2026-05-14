export type Role =
  | "administrador"
  | "empresa"
  | "centro_educativo"
  | "tutor_empresa"
  | "tutor_centro"
  | "estudiante";

export type SearchCategory =
  | "empresas"
  | "centros_educativos"
  | "estudiantes"
  | "ofertas";

export interface CategoryConfig {
  key: SearchCategory;
  label: string;
  icon: string;
  color: string;
  secondaryField: string;
}

export const CATEGORY_CONFIG: Record<SearchCategory, CategoryConfig> = {
  empresas: {
    key: "empresas",
    label: "Empresas",
    icon: "building",
    color: "blue",
    secondaryField: "sector",
  },
  centros_educativos: {
    key: "centros_educativos",
    label: "Centros educativos",
    icon: "school",
    color: "teal",
    secondaryField: "ciudad",
  },
  estudiantes: {
    key: "estudiantes",
    label: "Estudiantes",
    icon: "user-graduate",
    color: "purple",
    secondaryField: "ciclo",
  },
  ofertas: {
    key: "ofertas",
    label: "Ofertas",
    icon: "briefcase",
    color: "amber",
    secondaryField: "empresa",
  },
};

export const ROLE_PERMISSIONS: Record<Role, SearchCategory[]> = {
  administrador: ["empresas", "centros_educativos", "estudiantes", "ofertas"],
  empresa: ["centros_educativos", "estudiantes"],
  centro_educativo: ["empresas", "ofertas"],
  tutor_empresa: ["estudiantes", "centros_educativos"],
  tutor_centro: ["empresas", "ofertas"],
  estudiante: ["empresas", "centros_educativos", "ofertas"],
};

export function getAllowedCategories(role: Role): SearchCategory[] {
  return ROLE_PERMISSIONS[role] ?? [];
}