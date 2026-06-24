import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Campus } from '../models/campus.model';

@Injectable({ providedIn: 'root' })
export class CampusesService {
  private readonly http = inject(HttpClient);

  private readonly _campuses = signal<Campus[]>([]);
  readonly campuses = this._campuses.asReadonly();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<Campus[]>(`${environment.apiUrl}/planteles`).subscribe({
      next: (list) => this._campuses.set(list),
    });
  }

  getAll(): Observable<Campus[]> {
    return this.http.get<Campus[]>(`${environment.apiUrl}/planteles`);
  }

  getById(id: number): Observable<Campus> {
    return this.http.get<Campus>(`${environment.apiUrl}/planteles/${id}`);
  }

  add(campus: Omit<Campus, 'id'>): Observable<Campus> {
    return this.http.post<Campus>(`${environment.apiUrl}/planteles`, campus).pipe(
      tap((res) => this._campuses.update((list) => [...list, res])),
    );
  }

  update(id: number, changes: Partial<Omit<Campus, 'id'>>): Observable<Campus> {
    return this.http.put<Campus>(`${environment.apiUrl}/planteles/${id}`, changes).pipe(
      tap((res) =>
        this._campuses.update((list) => list.map((c) => (c.id === id ? res : c)))
      ),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/planteles/${id}`).pipe(
      tap(() => this._campuses.update((list) => list.filter((c) => c.id !== id))),
    );
  }
}
