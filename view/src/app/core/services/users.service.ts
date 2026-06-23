import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UsuarioResponse, UsuarioRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  private readonly _users = signal<User[]>([]);
  readonly users = this._users.asReadonly();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<UsuarioResponse[]>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (res) => this._users.set(res),
    });
  }

  add(data: UsuarioRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/usuarios`, data).pipe(
      tap((res) => this._users.update((list) => [...list, res])),
    );
  }

  update(id: number, data: Partial<UsuarioRequest>): Observable<User> {
    const existing = this._users().find((u) => u.id === id);
    const body: UsuarioRequest = {
      nombre: data.nombre ?? existing!.nombre,
      apellido: data.apellido ?? existing!.apellido,
      email: data.email ?? existing!.email,
      password: data.password ?? '',
      rolId: data.rolId ?? existing!.rolId,
      plantelId: data.plantelId ?? existing!.plantelId,
    };

    return this.http.put<User>(`${environment.apiUrl}/usuarios/${id}`, body).pipe(
      tap((res) =>
        this._users.update((list) => list.map((u) => (u.id === id ? res : u)))
      ),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/usuarios/${id}`, {
      params: { deactivate: true },
    }).pipe(
      tap(() => this._users.update((list) => list.filter((u) => u.id !== id))),
    );
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/usuarios/${id}`);
  }
}
