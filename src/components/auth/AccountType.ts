import { User } from "@supabase/supabase-js";

/* ─────────────────────────────────────────────
   ROLES PRINCIPALES
───────────────────────────────────────────── */
export type AccountType = "estudiante" | "empresa" | "centro" | "tutor";

/* ─────────────────────────────────────────────
   PROPS PARA EL MODAL DE ONBOARDING
───────────────────────────────────────────── */
export interface OnboardingModalProps {
  user: User;
  onClose: () => void;
}

/* ─────────────────────────────────────────────
   USUARIO BASE (tabla usuario en Supabase)
───────────────────────────────────────────── */
export interface UsuarioBase {
  id: string;
  email: string;
  nombre: string;
  rol: AccountType;
  is_profile_completed: boolean;
}

/* ─────────────────────────────────────────────
   ESTUDIANTE
───────────────────────────────────────────── */
export interface EstudianteData {
  id: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  ciudad?: string;
}

/* ─────────────────────────────────────────────
   EMPRESA
───────────────────────────────────────────── */
export interface EmpresaData {
  id_usuario: string;
  nombre: string;
  cif: string;
  sector?: string;
  ciudad?: string;
  web?: string;
}

/* ─────────────────────────────────────────────
   CENTRO EDUCATIVO
───────────────────────────────────────────── */
export interface CentroEducativoData {
  id_centro: string;
  nombre: string;
  codigo_centro: string;
  tipo?: string;
  ciudad?: string;
}
