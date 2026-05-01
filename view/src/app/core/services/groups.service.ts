import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Group } from '../models/group.model';

const MOCK_GROUPS: Group[] = [
  { id: 1, code: 'ISC-A', name: 'Grupo A - Sistemas', programId: 1, campusId: 1 },
  { id: 2, code: 'ISC-B', name: 'Grupo B - Sistemas', programId: 1, campusId: 2 },
  { id: 3, code: 'ADE-A', name: 'Grupo A - Administración', programId: 2, campusId: 1 },
];

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly _groups = signal<Group[]>(MOCK_GROUPS);
  readonly groups = this._groups.asReadonly();

  getAll(): Observable<Group[]> {
    return of(this._groups());
  }

  getById(id: number): Observable<Group | undefined> {
    return of(this._groups().find((g) => g.id === id));
  }

  getByProgram(programId: number): Observable<Group[]> {
    return of(this._groups().filter((g) => g.programId === programId));
  }

  add(group: Omit<Group, 'id'>): Observable<Group> {
    const created: Group = { ...group, id: Date.now() };
    this._groups.update((list) => [...list, created]);
    return of(created);
  }

  update(id: number, changes: Partial<Omit<Group, 'id'>>): Observable<Group | null> {
    let updated: Group | null = null;
    this._groups.update((list) =>
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
    this._groups.update((list) => list.filter((g) => g.id !== id));
    return of(void 0);
  }
}
