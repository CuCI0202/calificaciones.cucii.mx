import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Alumno } from '../models/alumno.model';

const MOCK_ALUMNOS: Alumno[] = [
  {
    id: 1,
    curp: 'GAMA990101HDFRCR01',
    nombre: 'Marco Antonio García Martínez',
    carreraId: 1,
    grupoId: 1,
    plantelId: 1,
  },
  {
    id: 2,
    curp: 'LOPB010315MDFPZN02',
    nombre: 'Brenda López Pérez',
    carreraId: 2,
    grupoId: 3,
    plantelId: 1,
  },
];

@Injectable({ providedIn: 'root' })
export class AlumnosService {
  private readonly _alumnos = signal<Alumno[]>(MOCK_ALUMNOS);
  readonly alumnos = this._alumnos.asReadonly();

  getAll(): Observable<Alumno[]> {
    return of(this._alumnos());
  }

  getById(id: number): Observable<Alumno | undefined> {
    return of(this._alumnos().find((a) => a.id === id));
  }

  getByCurp(curp: string): Observable<Alumno | undefined> {
    return of(this._alumnos().find((a) => a.curp === curp.toUpperCase()));
  }

  getByCarrera(carreraId: number): Observable<Alumno[]> {
    return of(this._alumnos().filter((a) => a.carreraId === carreraId));
  }

  getByGrupo(grupoId: number): Observable<Alumno[]> {
    return of(this._alumnos().filter((a) => a.grupoId === grupoId));
  }

  add(alumno: Omit<Alumno, 'id'>): Observable<Alumno> {
    const nuevo: Alumno = {
      ...alumno,
      id: Date.now(),
      curp: alumno.curp.toUpperCase(),
    };
    this._alumnos.update((list) => [...list, nuevo]);
    return of(nuevo);
  }

  update(id: number, changes: Partial<Omit<Alumno, 'id'>>): Observable<Alumno | null> {
    let updated: Alumno | null = null;
    this._alumnos.update((list) =>
      list.map((a) => {
        if (a.id === id) {
          updated = { ...a, ...changes, curp: changes.curp ? changes.curp.toUpperCase() : a.curp };
          return updated;
        }
        return a;
      })
    );
    return of(updated);
  }

  delete(id: number): Observable<void> {
    this._alumnos.update((list) => list.filter((a) => a.id !== id));
    return of(void 0);
  }
}
