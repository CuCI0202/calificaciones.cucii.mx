import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Teacher } from '../models/teacher.model';

const MOCK_USERS: Teacher[] = [
  { id: 1, name: 'Admin', lastName: 'Servicios Escolares', email: 'admin@cucii.edu.mx', password: '1234', role: 'admin' },
  { id: 2, name: 'Juan', lastName: 'García', email: 'juan@cucii.edu.mx', password: '1234', role: 'teacher' },
  { id: 3, name: 'María', lastName: 'López', email: 'maria@cucii.edu.mx', password: '1234', role: 'teacher' },
  { id: 4, name: 'Carlos', lastName: 'Ruiz', email: 'carlos@cucii.edu.mx', password: '1234', role: 'teacher' },
];

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly _users = signal<Teacher[]>(MOCK_USERS);
  readonly users = this._users.asReadonly();

  add(user: Omit<Teacher, 'id'>): Observable<Teacher> {
    const created: Teacher = { ...user, id: Date.now() };
    this._users.update((list) => [...list, created]);
    return of(created);
  }

  update(id: number, changes: Partial<Omit<Teacher, 'id'>>): Observable<Teacher | null> {
    let updated: Teacher | null = null;
    this._users.update((list) =>
      list.map((u) => {
        if (u.id === id) {
          updated = { ...u, ...changes };
          return updated;
        }
        return u;
      })
    );
    return of(updated);
  }

  delete(id: number): Observable<void> {
    this._users.update((list) => list.filter((u) => u.id !== id));
    return of(void 0);
  }

  getById(id: number): Observable<Teacher | undefined> {
    return of(this._users().find((u) => u.id === id));
  }
}
