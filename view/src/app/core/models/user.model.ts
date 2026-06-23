import { UserRole, mapRolId } from './auth.model';

export interface UserResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rolId: number;
  rolNombre: string;
  plantelId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rolId: number;
  plantelId: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  rolId: number;
  campusId: number;
  isActive: boolean;
}

export function toUser(res: UserResponse): User {
  return {
    id: res.id,
    firstName: res.nombre,
    lastName: res.apellido,
    email: res.email,
    rolId: res.rolId,
    campusId: res.plantelId,
    isActive: res.isActive,
  };
}

export function toUserRequest(user: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rolId: number;
  campusId: number;
}): UserRequest {
  return {
    nombre: user.firstName,
    apellido: user.lastName,
    email: user.email,
    password: user.password,
    rolId: user.rolId,
    plantelId: user.campusId,
  };
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  rector: 'Rector',
  docente: 'Docente',
  servicios_escolares: 'Servicios Escolares',
  coordinador: 'Coordinador',
};

export function getRoleLabel(rolId: number): string {
  return ROLE_LABELS[mapRolId(rolId)] ?? 'Desconocido';
}
