import { Subject } from './subject.model';

export interface Program {
  id: number;
  name: string;
  rvoe: string;
  rvoeDate: string; // ISO date string, e.g. "2020-09-01"
  subjects: Subject[];
}
