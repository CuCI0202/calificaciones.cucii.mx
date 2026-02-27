import { Materia } from './materia.model';

export interface Carrera {
  id: number;
  nombre: string;
  rvoe: string;
  fechaRvoe: string; // ISO date string, e.g. "2020-09-01"
  materias: Materia[];
}
