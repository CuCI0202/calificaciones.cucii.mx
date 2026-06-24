import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GroupStudent } from '../models/group-student.model';

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

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<AlumnoGrupoResponse[]>(`${environment.apiUrl}/alumnos-grupos`).subscribe({
      next: (list) => this._assignments.set(list.map(toGroupStudent)),
    });
  }

  private refresh(): void {
    this.http.get<AlumnoGrupoResponse[]>(`${environment.apiUrl}/alumnos-grupos`).subscribe({
      next: (list) => this._assignments.set(list.map(toGroupStudent)),
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
      tap((res) => this._assignments.update((list) => [...list, res])),
    );
  }

  remove(groupId: number, studentId: number): Observable<void> {
    const record = this._assignments().find(
      (a) => a.groupId === groupId && a.studentId === studentId
    );
    if (!record?.id) return of(void 0);

    return this.http.delete<void>(`${environment.apiUrl}/alumnos-grupos/${record.id}`).pipe(
      tap(() =>
        this._assignments.update((list) =>
          list.filter((a) => !(a.groupId === groupId && a.studentId === studentId))
        )
      ),
    );
  }
}

function toGroupStudent(res: AlumnoGrupoResponse): GroupStudent {
  return { id: res.id, groupId: res.grupoId, studentId: res.alumnoId };
}
