import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Student } from '../models/student.model';

const MOCK_STUDENTS: Student[] = [
  {
    id: 1,
    curp: 'GAMA990101HDFRCR01',
    name: 'Marco Antonio García Martínez',
    programId: 1,
    groupId: 1,
    campusId: 1,
  },
  {
    id: 2,
    curp: 'LOPB010315MDFPZN02',
    name: 'Brenda López Pérez',
    programId: 2,
    groupId: 3,
    campusId: 1,
  },
];

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly _students = signal<Student[]>(MOCK_STUDENTS);
  readonly students = this._students.asReadonly();

  getAll(): Observable<Student[]> {
    return of(this._students());
  }

  getById(id: number): Observable<Student | undefined> {
    return of(this._students().find((s) => s.id === id));
  }

  getByCurp(curp: string): Observable<Student | undefined> {
    return of(this._students().find((s) => s.curp === curp.toUpperCase()));
  }

  getByProgram(programId: number): Observable<Student[]> {
    return of(this._students().filter((s) => s.programId === programId));
  }

  getByGroup(groupId: number): Observable<Student[]> {
    return of(this._students().filter((s) => s.groupId === groupId));
  }

  add(student: Omit<Student, 'id'>): Observable<Student> {
    const created: Student = {
      ...student,
      id: Date.now(),
      curp: student.curp.toUpperCase(),
    };
    this._students.update((list) => [...list, created]);
    return of(created);
  }

  update(id: number, changes: Partial<Omit<Student, 'id'>>): Observable<Student | null> {
    let updated: Student | null = null;
    this._students.update((list) =>
      list.map((s) => {
        if (s.id === id) {
          updated = { ...s, ...changes, curp: changes.curp ? changes.curp.toUpperCase() : s.curp };
          return updated;
        }
        return s;
      })
    );
    return of(updated);
  }

  delete(id: number): Observable<void> {
    this._students.update((list) => list.filter((s) => s.id !== id));
    return of(void 0);
  }
}
