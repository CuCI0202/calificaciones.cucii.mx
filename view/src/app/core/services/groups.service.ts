import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Group } from '../models/group.model';
import { Subject } from '../models/program.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly http = inject(HttpClient);

  private readonly _groups = signal<Group[]>([]);
  readonly groups = this._groups.asReadonly();

  private readonly _totalElements = signal(0);
  readonly totalElements = this._totalElements.asReadonly();

  private readonly _totalPages = signal(0);
  readonly totalPages = this._totalPages.asReadonly();

  private readonly _currentPage = signal(0);
  readonly currentPage = this._currentPage.asReadonly();

  private readonly _pageSize = signal(20);
  readonly pageSize = this._pageSize.asReadonly();

  constructor() {
    this.loadPage(0);
  }

  loadPage(page: number, size?: number): void {
    const s = size ?? this._pageSize();
    this.http.get<PaginatedResponse<Group>>(`${environment.apiUrl}/grupos`, {
      params: { page: String(page), size: String(s) },
    }).subscribe({
      next: (res) => {
        this._groups.set(res.content);
        this._totalElements.set(res.totalElements);
        this._totalPages.set(res.totalPages);
        this._currentPage.set(res.currentPage);
        this._pageSize.set(s);
      },
    });
  }

  getAll(): Observable<Group[]> {
    return this.http.get<PaginatedResponse<Group>>(`${environment.apiUrl}/grupos`).pipe(
      map((res) => res.content),
    );
  }

  getById(id: number): Observable<Group> {
    return this.http.get<Group>(`${environment.apiUrl}/grupos/${id}`);
  }

  getByProgram(planEstudioId: number): Observable<Group[]> {
    return this.http.get<PaginatedResponse<Group>>(`${environment.apiUrl}/grupos`).pipe(
      map((res) => res.content),
    );
  }

  getCuatrimestresCount(groupId: number): Observable<number> {
    return this.http.get<{ cantidadCuatrimestres: number }>(
      `${environment.apiUrl}/grupos/${groupId}/cuatrimestres`
    ).pipe(map((res) => res.cantidadCuatrimestres));
  }

  getSubjectsByGroupAndTerm(groupId: number, cuatrimestre: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(
      `${environment.apiUrl}/grupos/${groupId}/cuatrimestres/${cuatrimestre}/materias`
    );
  }

  add(group: Omit<Group, 'id'>): Observable<Group> {
    return this.http.post<Group>(`${environment.apiUrl}/grupos`, group).pipe(
      tap(() => this.loadPage(this._currentPage())),
    );
  }

  update(id: number, changes: Partial<Omit<Group, 'id'>>): Observable<Group> {
    return this.http.put<Group>(`${environment.apiUrl}/grupos/${id}`, changes).pipe(
      tap((res) =>
        this._groups.update((list) => list.map((g) => (g.id === id ? res : g)))
      ),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/grupos/${id}`).pipe(
      tap(() => this.loadPage(this._currentPage())),
    );
  }
}
