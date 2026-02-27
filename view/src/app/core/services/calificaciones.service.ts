import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Calificacion } from '../models/calificacion.model';

const MOCK_CALIFICACIONES: Calificacion[] = [
  {
    id: 1,
    alumnoId: 1,
    alumnoNombre: 'Marco Antonio García Martínez',
    alumnoCurp: 'GAMA990101HDFRCR01',
    materiaId: 101,
    materiaNombre: 'Matemáticas I',
    cuatrimestre: 1,
    calificacion: 88,
  },
  {
    id: 2,
    alumnoId: 1,
    alumnoNombre: 'Marco Antonio García Martínez',
    alumnoCurp: 'GAMA990101HDFRCR01',
    materiaId: 102,
    materiaNombre: 'Comunicación Oral y Escrita',
    cuatrimestre: 1,
    calificacion: 92,
  },
  {
    id: 3,
    alumnoId: 1,
    alumnoNombre: 'Marco Antonio García Martínez',
    alumnoCurp: 'GAMA990101HDFRCR01',
    materiaId: 103,
    materiaNombre: 'Introducción a la Programación',
    cuatrimestre: 1,
    calificacion: 95,
  },
  {
    id: 4,
    alumnoId: 2,
    alumnoNombre: 'Brenda López Pérez',
    alumnoCurp: 'LOPB010315MDFPZN02',
    materiaId: 201,
    materiaNombre: 'Fundamentos de Administración',
    cuatrimestre: 2,
    calificacion: 78,
  },
  {
    id: 5,
    alumnoId: 2,
    alumnoNombre: 'Brenda López Pérez',
    alumnoCurp: 'LOPB010315MDFPZN02',
    materiaId: 202,
    materiaNombre: 'Contabilidad General',
    cuatrimestre: 2,
    calificacion: 85,
  },
];

@Injectable({ providedIn: 'root' })
export class CalificacionesService {
  private readonly _calificaciones = signal<Calificacion[]>(MOCK_CALIFICACIONES);

  readonly calificaciones = this._calificaciones.asReadonly();

  getAll(): Observable<Calificacion[]> {
    return of(this._calificaciones());
  }

  getByAlumno(curp: string): Observable<Calificacion[]> {
    const normalized = curp.trim().toUpperCase();
    return of(this._calificaciones().filter((c) => c.alumnoCurp === normalized));
  }

  getByAlumnoId(alumnoId: number): Observable<Calificacion[]> {
    return of(this._calificaciones().filter((c) => c.alumnoId === alumnoId));
  }

  addCalificacion(cal: Omit<Calificacion, 'id'>): Observable<Calificacion> {
    const nueva: Calificacion = { ...cal, id: Date.now() };
    this._calificaciones.update((list) => [...list, nueva]);
    return of(nueva);
  }

  addMany(cals: Omit<Calificacion, 'id'>[]): Observable<Calificacion[]> {
    const nuevas: Calificacion[] = cals.map((cal, i) => ({ ...cal, id: Date.now() + i }));
    this._calificaciones.update((list) => [...list, ...nuevas]);
    return of(nuevas);
  }

  update(id: number, changes: Partial<Omit<Calificacion, 'id'>>): Observable<Calificacion | null> {
    let updated: Calificacion | null = null;
    this._calificaciones.update((list) =>
      list.map((c) => {
        if (c.id === id) {
          updated = { ...c, ...changes };
          return updated;
        }
        return c;
      })
    );
    return of(updated);
  }

  delete(id: number): Observable<void> {
    this._calificaciones.update((list) => list.filter((c) => c.id !== id));
    return of(undefined);
  }
}
