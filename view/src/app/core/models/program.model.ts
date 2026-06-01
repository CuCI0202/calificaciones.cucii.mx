import { Subject } from './subject.model';

export type Degree = 'Licenciatura' | 'Maestría' | 'Doctorado';

export interface Program {
  id: number;
  name: string;
  degree: Degree;
  rvoe: string;
  rvoeDate: string; // ISO date string, e.g. "2020-09-01"
  terms: number;
  subjects: Subject[];
}
