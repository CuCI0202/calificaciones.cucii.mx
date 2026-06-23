export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rolId: number;
  token: string;
}

export interface MeResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rolId: number;
}

export type UserRole = 'admin' | 'rector' | 'docente' | 'servicios_escolares' | 'coordinador';

export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rolId: number;
  rol: UserRole;
}

const ROL_MAP: Record<number, UserRole> = {
  1: 'admin',
  2: 'rector',
  3: 'docente',
  4: 'servicios_escolares',
  5: 'coordinador',
};

export function mapRolId(rolId: number): UserRole {
  return ROL_MAP[rolId] ?? 'docente';
}
