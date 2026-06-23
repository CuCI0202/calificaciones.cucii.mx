import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Group } from '../models/group.model';

const MOCK_GROUPS: Group[] = [
  { id: 1, clave: 'ISC-A', nombre: 'Grupo A - Sistemas', planEstudioId: 1, plantelId: 1 },
  { id: 2, clave: 'ISC-B', nombre: 'Grupo B - Sistemas', planEstudioId: 1, plantelId: 2 },
  { id: 3, clave: 'ADE-A', nombre: 'Grupo A - Administración', planEstudioId: 2, plantelId: 1 },
];

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly _groups = signal<Group[]>(MOCK_GROUPS);
  readonly groups = this._groups.asReadonly();

  getAll(): Observable<Group[]> { return of(this._groups()); }
  getById(id: number): Observable<Group | undefined> { return of(this._groups().find((g) => g.id === id)); }
  getByProgram(planEstudioId: number): Observable<Group[]> {
    return of(this._groups().filter((g) => g.planEstudioId === planEstudioId));
  }

  add(group: Omit<Group, 'id'>): Observable<Group> {
    const created: Group = { ...group, id: Date.now() };
    this._groups.update((list) => [...list, created]);
    return of(created);
  }

  update(id: number, changes: Partial<Omit<Group, 'id'>>): Observable<Group | null> {
    let updated: Group | null = null;
    this._groups.update((list) => list.map((g) => {
      if (g.id === id) { updated = { ...g, ...changes }; return updated; }
      return g;
    }));
    return of(updated);
  }

  delete(id: number): Observable<void> {
    this._groups.update((list) => list.filter((g) => g.id !== id));
    return of(void 0);
  }
}
