import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Teacher, UserRole } from '../models/teacher.model';

const MOCK_TEACHERS: Teacher[] = [
  { id: 1, name: 'Admin', lastName: 'Servicios Escolares', email: 'admin@cucii.edu.mx', password: '1234', role: 'admin' },
  { id: 2, name: 'Juan', lastName: 'García', email: 'juan@cucii.edu.mx', password: '1234', role: 'teacher' },
  { id: 3, name: 'María', lastName: 'López', email: 'maria@cucii.edu.mx', password: '1234', role: 'teacher' },
  { id: 4, name: 'Carlos', lastName: 'Ruiz', email: 'carlos@cucii.edu.mx', password: '1234', role: 'teacher' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<Teacher | null>(null);

  login(email: string, password: string): Observable<Teacher> {
    const teacher = MOCK_TEACHERS.find(
      (t) => t.email === email && t.password === password
    );
    if (teacher) {
      this.currentUser.set(teacher);
      return of(teacher);
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
