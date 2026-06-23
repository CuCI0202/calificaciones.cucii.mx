import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Grade } from '../models/grade.model';

const MOCK_GRADES: Grade[] = [
  { id: 1, alumnoId: 1, alumnoNombre: 'Marco Antonio García Martínez', alumnoCurp: 'GAMA990101HDFRCR01', materiaId: 101, materiaNombre: 'Matemáticas I', cuatrimestre: 1, calificacion: 88, grupoId: 1 },
  { id: 2, alumnoId: 1, alumnoNombre: 'Marco Antonio García Martínez', alumnoCurp: 'GAMA990101HDFRCR01', materiaId: 102, materiaNombre: 'Comunicación Oral y Escrita', cuatrimestre: 1, calificacion: 92, grupoId: 1 },
  { id: 3, alumnoId: 1, alumnoNombre: 'Marco Antonio García Martínez', alumnoCurp: 'GAMA990101HDFRCR01', materiaId: 103, materiaNombre: 'Introducción a la Programación', cuatrimestre: 1, calificacion: 95, grupoId: 1 },
  { id: 4, alumnoId: 2, alumnoNombre: 'Brenda López Pérez', alumnoCurp: 'LOPB010315MDFPZN02', materiaId: 201, materiaNombre: 'Fundamentos de Administración', cuatrimestre: 2, calificacion: 78, grupoId: 1 },
  { id: 5, alumnoId: 2, alumnoNombre: 'Brenda López Pérez', alumnoCurp: 'LOPB010315MDFPZN02', materiaId: 202, materiaNombre: 'Contabilidad General', cuatrimestre: 2, calificacion: 85, grupoId: 1 },
];

@Injectable({ providedIn: 'root' })
export class GradesService {
  private readonly _grades = signal<Grade[]>(MOCK_GRADES);
  readonly grades = this._grades.asReadonly();

  getAll(): Observable<Grade[]> { return of(this._grades()); }

  getByStudent(curp: string): Observable<Grade[]> {
    const normalized = curp.trim().toUpperCase();
    return of(this._grades().filter((g) => g.alumnoCurp === normalized));
  }

  getByStudentId(alumnoId: number): Observable<Grade[]> {
    return of(this._grades().filter((g) => g.alumnoId === alumnoId));
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
        if (g.id === id) { updated = { ...g, ...changes }; return updated; }
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
