export type UserRole = 'profesor' | 'admin';

export interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role: UserRole;
}
