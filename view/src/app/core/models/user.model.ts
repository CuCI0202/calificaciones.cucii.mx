export interface UsuarioResponse {
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

export interface UsuarioRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rolId: number;
  plantelId: number;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rolId: number;
  plantelId: number;
  isActive: boolean;
}
