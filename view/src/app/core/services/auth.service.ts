import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  MeResponse,
  AuthUser,
  mapRolId,
} from '../models/auth.model';
import { setTokenCookie, getTokenCookie, removeTokenCookie } from './cookie-utils';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly currentUser = signal<AuthUser | null>(null);
  private readonly _token = signal<string | null>(null);

  constructor() {
    const token = getTokenCookie();
    if (token) {
      this._token.set(token);
      setTimeout(() => this.validateSession(), 0);
    }
  }

  private validateSession(): void {
    this.http.get<MeResponse>(`${environment.apiUrl}/auth/me`).subscribe({
      next: (me) => {
        this.currentUser.set({
          id: me.id,
          nombre: me.nombre,
          apellido: me.apellido,
          email: me.email,
          rolId: me.rolId,
          rol: mapRolId(me.rolId),
        });
      },
      error: () => this.logout(),
    });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const body: LoginRequest = { email, password };

    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, body).pipe(
      tap((res) => {
        this._token.set(res.token);
        setTokenCookie(res.token);
        this.currentUser.set({
          id: res.id,
          nombre: res.nombre,
          apellido: res.apellido,
          email: res.email,
          rolId: res.rolId,
          rol: mapRolId(res.rolId),
        });
      })
    );
  }

  logout(): void {
    this._token.set(null);
    this.currentUser.set(null);
    removeTokenCookie();
  }

  getToken(): string | null {
    return this._token();
  }

  isAuthenticated(): boolean {
    return this._token() !== null;
  }

  getRole(): string | null {
    return this.currentUser()?.rol ?? null;
  }

  isAdmin(): boolean {
    const role = this.currentUser()?.rol
    return role === 'admin' || role === 'rector';
  }
}
