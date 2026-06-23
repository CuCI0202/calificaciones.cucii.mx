import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UserResponse, UserRequest, toUser, toUserRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  private readonly _users = signal<User[]>([]);
  readonly users = this._users.asReadonly();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<UserResponse[]>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (res) => this._users.set(res.map(toUser)),
    });
  }

  add(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    rolId: number;
    campusId: number;
  }): Observable<User> {
    return this.http.post<UserResponse>(`${environment.apiUrl}/usuarios`, toUserRequest(data)).pipe(
      tap((res) => this._users.update((list) => [...list, toUser(res)])),
      map(toUser),
    );
  }

  update(id: number, data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    rolId: number;
    campusId: number;
  }>): Observable<User> {
    const existing = this._users().find((u) => u.id === id);
    const body: UserRequest = toUserRequest({
      firstName: data.firstName ?? existing!.firstName,
      lastName: data.lastName ?? existing!.lastName,
      email: data.email ?? existing!.email,
      password: data.password ?? '',
      rolId: data.rolId ?? existing!.rolId,
      campusId: data.campusId ?? existing!.campusId,
    });

    return this.http.put<UserResponse>(`${environment.apiUrl}/usuarios/${id}`, body).pipe(
      tap((res) => {
        const updated = toUser(res);
        this._users.update((list) => list.map((u) => (u.id === id ? updated : u)));
      }),
      map(toUser),
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
    return this.http.get<UserResponse>(`${environment.apiUrl}/usuarios/${id}`).pipe(
      map(toUser),
    );
  }
}
