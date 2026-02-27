import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Carrera } from '../models/carrera.model';
import { Materia } from '../models/materia.model';

const MOCK_CARRERAS: Carrera[] = [
  {
    id: 1,
    nombre: 'Ingeniería en Sistemas Computacionales',
    rvoe: 'RVOE-ISC-2020',
    fechaRvoe: '2020-09-01',
    materias: [
      { id: 101, clave: 'MAT-101', nombre: 'Matemáticas I' },
      { id: 102, clave: 'MAT-102', nombre: 'Comunicación Oral y Escrita' },
      { id: 103, clave: 'MAT-103', nombre: 'Introducción a la Programación' },
      { id: 104, clave: 'MAT-104', nombre: 'Matemáticas II' },
      { id: 105, clave: 'MAT-105', nombre: 'Programación Orientada a Objetos' },
      { id: 106, clave: 'MAT-106', nombre: 'Base de Datos I' },
      { id: 107, clave: 'MAT-107', nombre: 'Estructuras de Datos' },
      { id: 108, clave: 'MAT-108', nombre: 'Desarrollo Web I' },
    ],
  },
  {
    id: 2,
    nombre: 'Administración de Empresas',
    rvoe: 'RVOE-ADE-2019',
    fechaRvoe: '2019-01-15',
    materias: [
      { id: 201, clave: 'ADE-201', nombre: 'Fundamentos de Administración' },
      { id: 202, clave: 'ADE-202', nombre: 'Contabilidad General' },
      { id: 203, clave: 'ADE-203', nombre: 'Mercadotecnia I' },
      { id: 204, clave: 'ADE-204', nombre: 'Recursos Humanos' },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class CarrerasService {
  private readonly _carreras = signal<Carrera[]>(MOCK_CARRERAS);
  readonly carreras = this._carreras.asReadonly();

  getAll(): Observable<Carrera[]> {
    return of(this._carreras());
  }

  getById(id: number): Observable<Carrera | undefined> {
    return of(this._carreras().find((c) => c.id === id));
  }

  add(carrera: Omit<Carrera, 'id' | 'materias'>): Observable<Carrera> {
    const nueva: Carrera = { ...carrera, id: Date.now(), materias: [] };
    this._carreras.update((list) => [...list, nueva]);
    return of(nueva);
  }

  update(id: number, changes: Partial<Omit<Carrera, 'id' | 'materias'>>): Observable<Carrera | null> {
    let updated: Carrera | null = null;
    this._carreras.update((list) =>
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
    this._carreras.update((list) => list.filter((c) => c.id !== id));
    return of(void 0);
  }

  // ── Materia sub-CRUD ─────────────────────────────────────────────────────

  getMateriasByCarrera(carreraId: number): Observable<Materia[]> {
    const carrera = this._carreras().find((c) => c.id === carreraId);
    return of(carrera?.materias ?? []);
  }

  addMateria(carreraId: number, materia: Omit<Materia, 'id'>): Observable<Materia | null> {
    const nueva: Materia = { ...materia, id: Date.now() };
    let result: Materia | null = null;
    this._carreras.update((list) =>
      list.map((c) => {
        if (c.id === carreraId) {
          result = nueva;
          return { ...c, materias: [...c.materias, nueva] };
        }
        return c;
      })
    );
    return of(result);
  }

  updateMateria(carreraId: number, materiaId: number, changes: Omit<Materia, 'id'>): Observable<Materia | null> {
    let updated: Materia | null = null;
    this._carreras.update((list) =>
      list.map((c) => {
        if (c.id !== carreraId) return c;
        return {
          ...c,
          materias: c.materias.map((m) => {
            if (m.id === materiaId) {
              updated = { ...m, ...changes };
              return updated;
            }
            return m;
          }),
        };
      })
    );
    return of(updated);
  }

  deleteMateria(carreraId: number, materiaId: number): Observable<void> {
    this._carreras.update((list) =>
      list.map((c) => {
        if (c.id !== carreraId) return c;
        return { ...c, materias: c.materias.filter((m) => m.id !== materiaId) };
      })
    );
    return of(void 0);
  }
}
