import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Grade } from '../models/grade.model';

const MOCK_GRADES: Grade[] = [
  {
    id: 1,
    studentId: 1,
    studentName: 'Marco Antonio García Martínez',
    studentCurp: 'GAMA990101HDFRCR01',
    subjectId: 101,
    subjectName: 'Matemáticas I',
    term: 1,
    score: 88,
  },
  {
    id: 2,
    studentId: 1,
    studentName: 'Marco Antonio García Martínez',
    studentCurp: 'GAMA990101HDFRCR01',
    subjectId: 102,
    subjectName: 'Comunicación Oral y Escrita',
    term: 1,
    score: 92,
  },
  {
    id: 3,
    studentId: 1,
    studentName: 'Marco Antonio García Martínez',
    studentCurp: 'GAMA990101HDFRCR01',
    subjectId: 103,
    subjectName: 'Introducción a la Programación',
    term: 1,
    score: 95,
  },
  {
    id: 4,
    studentId: 2,
    studentName: 'Brenda López Pérez',
    studentCurp: 'LOPB010315MDFPZN02',
    subjectId: 201,
    subjectName: 'Fundamentos de Administración',
    term: 2,
    score: 78,
  },
  {
    id: 5,
    studentId: 2,
    studentName: 'Brenda López Pérez',
    studentCurp: 'LOPB010315MDFPZN02',
    subjectId: 202,
    subjectName: 'Contabilidad General',
    term: 2,
    score: 85,
  },
];

@Injectable({ providedIn: 'root' })
export class GradesService {
  private readonly _grades = signal<Grade[]>(MOCK_GRADES);

  readonly grades = this._grades.asReadonly();

  getAll(): Observable<Grade[]> {
    return of(this._grades());
  }

  getByStudent(curp: string): Observable<Grade[]> {
    const normalized = curp.trim().toUpperCase();
    return of(this._grades().filter((g) => g.studentCurp === normalized));
  }

  getByStudentId(studentId: number): Observable<Grade[]> {
    return of(this._grades().filter((g) => g.studentId === studentId));
  }

  addGrade(grade: Omit<Grade, 'id'>): Observable<Grade> {
    const created: Grade = { ...grade, id: Date.now() };
    this._grades.update((list) => [...list, created]);
    return of(created);
  }

  addMany(grades: Omit<Grade, 'id'>[]): Observable<Grade[]> {
    const created: Grade[] = grades.map((g, i) => ({ ...g, id: Date.now() + i }));
    this._grades.update((list) => [...list, ...created]);
    return of(created);
  }

  update(id: number, changes: Partial<Omit<Grade, 'id'>>): Observable<Grade | null> {
    let updated: Grade | null = null;
    this._grades.update((list) =>
      list.map((g) => {
        if (g.id === id) {
          updated = { ...g, ...changes };
          return updated;
        }
        return g;
      })
    );
    return of(updated);
  }

  delete(id: number): Observable<void> {
    this._grades.update((list) => list.filter((g) => g.id !== id));
    return of(undefined);
  }
}
