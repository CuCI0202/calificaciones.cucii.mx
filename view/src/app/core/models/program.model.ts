import { Subject } from './subject.model';

export type Degree = 'Licenciatura' | 'Maestría' | 'Doctorado';

export interface Program {
  id: number;
  name: string;
  degree: Degree;
  rvoe: string;
  rvoeDate: string;
  terms: number;
  subjects: Subject[];
}

// ── Backend types ──────────────────────────────────────────────────────────────

interface PlanEstudioResponse {
  id: number;
  nombre: string;
  grado: string;
  numRvoe: string;
  fechaRvoe: string;
  duracionCuatrimestres: number;
}

interface PlanEstudioConMateriasResponse extends PlanEstudioResponse {
  materias: MateriaResponse[];
}

export interface PlanEstudioRequest {
  nombre: string;
  grado: string;
  numRvoe: string;
  fechaRvoe: string;
  duracionCuatrimestres: number;
}

export interface MateriaResponse {
  id: number;
  nombre: string;
  clave: string;
  creditos: number;
  cuatrimestre: number;
}

export interface MateriaRequest {
  nombre: string;
  clave: string;
  creditos: number;
  cuatrimestre: number;
  planEstudioId: number;
}

// ── Mappers ────────────────────────────────────────────────────────────────────

export function toProgram(res: PlanEstudioResponse): Program {
  return {
    id: res.id,
    name: res.nombre,
    degree: res.grado as Degree,
    rvoe: res.numRvoe,
    rvoeDate: res.fechaRvoe,
    terms: res.duracionCuatrimestres,
    subjects: [],
  };
}

export function toProgramWithSubjects(res: PlanEstudioConMateriasResponse): Program {
  return {
    ...toProgram(res),
    subjects: (res.materias ?? []).map(toSubject),
  };
}

export function toProgramRequest(program: Omit<Program, 'id' | 'subjects'>): PlanEstudioRequest {
  return {
    nombre: program.name,
    grado: program.degree,
    numRvoe: program.rvoe,
    fechaRvoe: program.rvoeDate,
    duracionCuatrimestres: program.terms,
  };
}

export function toSubject(res: MateriaResponse): Subject {
  return {
    id: res.id,
    code: res.clave,
    name: res.nombre,
    term: res.cuatrimestre,
    credits: res.creditos,
  };
}

export function toSubjectRequest(subject: Omit<Subject, 'id'>, programId: number): MateriaRequest {
  return {
    nombre: subject.name,
    clave: subject.code,
    creditos: subject.credits ?? 0,
    cuatrimestre: subject.term,
    planEstudioId: programId,
  };
}
