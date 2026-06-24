export type Degree = 'Licenciatura' | 'Maestría' | 'Doctorado';

export interface Program {
  id: number;
  nombre: string;
  grado: Degree;
  numeroRvoe: string;
  fechaRvoe: string;
  duracionCuatrimestres: number;
  cantidadMaterias: number;
  materias: Subject[];
}

export interface Subject {
  id: number;
  clave: string;
  nombre: string;
  cuatrimestre: number;
  creditos: number | null;
}
