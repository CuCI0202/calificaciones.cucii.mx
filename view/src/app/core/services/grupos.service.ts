import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Grupo } from '../models/grupo.model';

const MOCK_GRUPOS: Grupo[] = [
  { id: 1, clave: 'ISC-A', nombre: 'Grupo A - Sistemas', carreraId: 1, plantelId: 1 },
  { id: 2, clave: 'ISC-B', nombre: 'Grupo B - Sistemas', carreraId: 1, plantelId: 2 },
  { id: 3, clave: 'ADE-A', nombre: 'Grupo A - Administración', carreraId: 2, plantelId: 1 },
];

@Injectable({ providedIn: 'root' })
export class GruposService {
  private readonly _grupos = signal<Grupo[]>(MOCK_GRUPOS);
  readonly grupos = this._grupos.asReadonly();

  getAll(): Observable<Grupo[]> {
    return of(this._grupos());
  }

  getById(id: number): Observable<Grupo | undefined> {
    return of(this._grupos().find((g) => g.id === id));
  }

  getByCarrera(carreraId: number): Observable<Grupo[]> {
    return of(this._grupos().filter((g) => g.carreraId === carreraId));
  }

  add(grupo: Omit<Grupo, 'id'>): Observable<Grupo> {
    const nuevo: Grupo = { ...grupo, id: Date.now() };
    this._grupos.update((list) => [...list, nuevo]);
    return of(nuevo);
  }

  update(id: number, changes: Partial<Omit<Grupo, 'id'>>): Observable<Grupo | null> {
    let updated: Grupo | null = null;
    this._grupos.update((list) =>
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
    this._grupos.update((list) => list.filter((g) => g.id !== id));
    return of(void 0);
  }
}
