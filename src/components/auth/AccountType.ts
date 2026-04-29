import { User } from "@supabase/supabase-js";

/* ============================================================
   ROLES PRINCIPALES (ALINEADOS CON SUPABASE)
============================================================ */
export type UserRole =
  | "estudiante"
  | "empresa"
  | "centro_educativo"
  | "tutor"
  | "tutor_empresa"
  | "tutor_centro";

/* ============================================================
   CONSTANTES DE ROLES (evita strings mágicos)
============================================================ */
export const ROLES = {
  ESTUDIANTE: "estudiante",
  EMPRESA: "empresa",
  CENTRO: "centro_educativo",
  TUTOR: "tutor",
  TUTOR_EMPRESA: "tutor_empresa",
  TUTOR_CENTRO: "tutor_centro",
} as const;

/* ============================================================
   PROPS PARA EL MODAL DE ONBOARDING
============================================================ */
export interface OnboardingModalProps {
  user: User;
  onClose: () => void;
}

/* ============================================================
   USUARIO BASE (tabla usuario en Supabase)
============================================================ */
export interface UsuarioBase {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  is_profile_completed: boolean;
}

/* ============================================================
   ESTUDIANTE
============================================================ */
export interface EstudianteData {
  id: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  ciudad?: string;
}

/* ============================================================
   EMPRESA
============================================================ */
export interface EmpresaData {
  id_usuario: string;
  nombre: string;
  cif: string;
  sector?: string;
  ciudad?: string;
  web?: string;
}

/* ============================================================
   CENTRO EDUCATIVO
============================================================ */
export interface CentroEducativoData {
  id_usuario: string; // alineado con empresa (recomendado)
  nombre: string;
  codigo_centro: string;
  tipo?: string;
  ciudad?: string;
}
