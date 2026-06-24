import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TeacherAssignment } from '../models/teacher-assignment.model';

interface ProfesorGrupoResponse {
  id: number;
  usuarioId: number;
  grupoId: number;
  materiaId: number;
}

@Injectable({ providedIn: 'root' })
export class TeacherAssignmentsService {
  private readonly http = inject(HttpClient);

  private readonly _assignments = signal<TeacherAssignment[]>([]);
  readonly assignments = this._assignments.asReadonly();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<ProfesorGrupoResponse[]>(`${environment.apiUrl}/profesores-grupos`).subscribe({
      next: (list) => this._assignments.set(list.map(toAssignment)),
    });
  }

  add(assignment: Omit<TeacherAssignment, 'id'>): Observable<TeacherAssignment | null> {
    return this.http.post<ProfesorGrupoResponse>(`${environment.apiUrl}/profesores-grupos`, {
      usuarioId: assignment.userId,
      grupoId: assignment.groupId,
      materiaId: assignment.subjectId,
    }).pipe(
      map(toAssignment),
      tap((res) => this._assignments.update((list) => [...list, res])),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/profesores-grupos/${id}`).pipe(
      tap(() => this._assignments.update((list) => list.filter((a) => a.id !== id))),
    );
  }
}

function toAssignment(res: ProfesorGrupoResponse): TeacherAssignment {
  return {
    id: res.id,
    userId: res.usuarioId,
    groupId: res.grupoId,
    subjectId: res.materiaId,
  };
}
