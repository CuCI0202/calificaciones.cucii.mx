import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Campus } from '../models/campus.model';

const MOCK_CAMPUSES: Campus[] = [
  { id: 1, name: 'Plantel Centro', address: 'Av. Principal 100, CDMX' },
  { id: 2, name: 'Plantel Norte', address: 'Blvd. Norte 250, CDMX' },
];

@Injectable({ providedIn: 'root' })
export class CampusesService {
  private readonly _campuses = signal<Campus[]>(MOCK_CAMPUSES);
  readonly campuses = this._campuses.asReadonly();

  getAll(): Observable<Campus[]> {
    return of(this._campuses());
  }

  getById(id: number): Observable<Campus | undefined> {
    return of(this._campuses().find((c) => c.id === id));
  }

  add(campus: Omit<Campus, 'id'>): Observable<Campus> {
    const created: Campus = { ...campus, id: Date.now() };
    this._campuses.update((list) => [...list, created]);
    return of(created);
  }

  update(id: number, changes: Partial<Omit<Campus, 'id'>>): Observable<Campus | null> {
    let updated: Campus | null = null;
    this._campuses.update((list) =>
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
    this._campuses.update((list) => list.filter((c) => c.id !== id));
    return of(void 0);
  }
}
