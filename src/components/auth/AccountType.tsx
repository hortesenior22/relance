import { User } from "@supabase/supabase-js";

export type AccountType =
  | "estudiante"
  | "empresa"
  | "centro_educativo"
  | "tutor";

export interface OnboardingModalProps {
  user: User;
  onClose: () => void;
}

export interface UsuarioBase {
  id: string;
  email: string;
  nombre: string;
  rol: AccountType;
  is_profile_completed: boolean;
}

export interface EstudianteData {
  id: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  ciudad?: string;
}

export interface EmpresaData {
  id_usuario: string;
  nombre: string;
  cif: string;
  sector?: string;
  ciudad?: string;
  web?: string;
}

export interface CentroEducativoData {
  id_centro: string;
  nombre: string;
  codigo_centro: string;
  tipo?: string;
  ciudad?: string;
}
