import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Profesor, UserRole } from '../models/profesor.model';

const MOCK_PROFESORES: Profesor[] = [
  { id: 1, nombre: 'Admin Servicios Escolares', email: 'admin@cucii.edu.mx', password: '1234', role: 'admin' },
  { id: 2, nombre: 'Juan García', email: 'juan@cucii.edu.mx', password: '1234', role: 'profesor' },
  { id: 3, nombre: 'María López', email: 'maria@cucii.edu.mx', password: '1234', role: 'profesor' },
  { id: 4, nombre: 'Carlos Ruiz', email: 'carlos@cucii.edu.mx', password: '1234', role: 'profesor' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<Profesor | null>(null);

  login(email: string, password: string): Observable<Profesor> {
    const profesor = MOCK_PROFESORES.find(
      (p) => p.email === email && p.password === password
    );
    if (profesor) {
      this.currentUser.set(profesor);
      return of(profesor);
    }
    return throwError(() => new Error('Credenciales incorrectas'));
  }

  logout(): void {
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getRole(): UserRole | null {
    return this.currentUser()?.role ?? null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}
