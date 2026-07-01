import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GroupStudent } from '../models/group-student.model';
import { PaginatedResponse } from '../models/pagination.model';

interface AlumnoGrupoResponse {
  id: number;
  alumnoId: number;
  grupoId: number;
}

@Injectable({ providedIn: 'root' })
export class GroupStudentsService {
  private readonly http = inject(HttpClient);

  private readonly _assignments = signal<GroupStudent[]>([]);
  readonly assignments = this._assignments.asReadonly();

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
    this.http.get<PaginatedResponse<AlumnoGrupoResponse>>(`${environment.apiUrl}/alumnos-grupos`, {
      params: { page: String(page), size: String(s) },
    }).subscribe({
      next: (res) => {
        this._assignments.set(res.content.map(toGroupStudent));
        this._totalElements.set(res.totalElements);
        this._totalPages.set(res.totalPages);
        this._currentPage.set(res.currentPage);
        this._pageSize.set(s);
      },
    });
  }

  getByGroup(groupId: number): Observable<GroupStudent[]> {
    return of(this._assignments().filter((a) => a.groupId === groupId));
  }

  assign(groupId: number, studentId: number): Observable<GroupStudent> {
    return this.http.post<AlumnoGrupoResponse>(`${environment.apiUrl}/alumnos-grupos`, {
      alumnoId: studentId,
      grupoId: groupId,
    }).pipe(
      map(toGroupStudent),
      tap(() => this.loadPage(this._currentPage())),
    );
  }

  remove(groupId: number, studentId: number): Observable<void> {
    const record = this._assignments().find(
      (a) => a.groupId === groupId && a.studentId === studentId
    );
    if (!record?.id) return of(void 0);

    return this.http.delete<void>(`${environment.apiUrl}/alumnos-grupos/${record.id}`).pipe(
      tap(() => this.loadPage(this._currentPage())),
    );
  }
}

function toGroupStudent(res: AlumnoGrupoResponse): GroupStudent {
  return { id: res.id, groupId: res.grupoId, studentId: res.alumnoId };
}
