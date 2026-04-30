import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Profesor } from '../models/profesor.model';

const MOCK_USUARIOS: Profesor[] = [
  { id: 1, nombre: 'Admin', apellido: 'Servicios Escolares', email: 'admin@cucii.edu.mx', password: '1234', role: 'admin' },
  { id: 2, nombre: 'Juan', apellido: 'García', email: 'juan@cucii.edu.mx', password: '1234', role: 'profesor' },
  { id: 3, nombre: 'María', apellido: 'López', email: 'maria@cucii.edu.mx', password: '1234', role: 'profesor' },
  { id: 4, nombre: 'Carlos', apellido: 'Ruiz', email: 'carlos@cucii.edu.mx', password: '1234', role: 'profesor' },
];

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly _usuarios = signal<Profesor[]>(MOCK_USUARIOS);
  readonly usuarios = this._usuarios.asReadonly();

  add(usuario: Omit<Profesor, 'id'>): Observable<Profesor> {
    const nuevo: Profesor = { ...usuario, id: Date.now() };
    this._usuarios.update((list) => [...list, nuevo]);
    return of(nuevo);
  }

  update(id: number, changes: Partial<Omit<Profesor, 'id'>>): Observable<Profesor | null> {
    let updated: Profesor | null = null;
    this._usuarios.update((list) =>
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
    this._usuarios.update((list) => list.filter((u) => u.id !== id));
    return of(void 0);
  }

  getById(id: number): Observable<Profesor | undefined> {
    return of(this._usuarios().find((u) => u.id === id));
  }
}
