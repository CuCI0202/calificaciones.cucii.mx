import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Plantel } from '../models/plantel.model';

const MOCK_PLANTELES: Plantel[] = [
  { id: 1, nombre: 'Plantel Centro', direccion: 'Av. Principal 100, CDMX' },
  { id: 2, nombre: 'Plantel Norte', direccion: 'Blvd. Norte 250, CDMX' },
];

@Injectable({ providedIn: 'root' })
export class PlantelesService {
  private readonly _planteles = signal<Plantel[]>(MOCK_PLANTELES);
  readonly planteles = this._planteles.asReadonly();

  getAll(): Observable<Plantel[]> {
    return of(this._planteles());
  }

  getById(id: number): Observable<Plantel | undefined> {
    return of(this._planteles().find((p) => p.id === id));
  }

  add(plantel: Omit<Plantel, 'id'>): Observable<Plantel> {
    const nuevo: Plantel = { ...plantel, id: Date.now() };
    this._planteles.update((list) => [...list, nuevo]);
    return of(nuevo);
  }

  update(id: number, changes: Partial<Omit<Plantel, 'id'>>): Observable<Plantel | null> {
    let updated: Plantel | null = null;
    this._planteles.update((list) =>
      list.map((p) => {
        if (p.id === id) {
          updated = { ...p, ...changes };
          return updated;
        }
        return p;
      })
    );
    return of(updated);
  }

  delete(id: number): Observable<void> {
    this._planteles.update((list) => list.filter((p) => p.id !== id));
    return of(void 0);
  }
}
