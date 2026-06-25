import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Grade } from '../models/grade.model';

interface CalificacionResponse {
  id: number;
  alumnoId: number;
  grupoId: number;
  materiaId: number;
  calificacion: number;
  registradoPor: number;
}

interface CalificacionRequest {
  alumnoId: number;
  grupoId: number;
  materiaId: number;
  calificacion: number;
  registradoPor: number;
}

@Injectable({ providedIn: 'root' })
export class GradesService {
  private readonly http = inject(HttpClient);

  private readonly _grades = signal<Grade[]>([]);
  readonly grades = this._grades.asReadonly();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<CalificacionResponse[]>(`${environment.apiUrl}/calificaciones`).subscribe({
      next: (list) => this._grades.set(list.map(toGrade)),
    });
  }

  getAll(): Observable<Grade[]> {
    return this.http.get<CalificacionResponse[]>(`${environment.apiUrl}/calificaciones`).pipe(
      map((list) => list.map(toGrade)),
    );
  }

  getByStudent(alumnoId: number): Observable<Grade[]> {
    return this.http.get<CalificacionResponse[]>(`${environment.apiUrl}/calificaciones?alumnoId=${alumnoId}`).pipe(
      map((list) => list.map(toGrade)),
    );
  }

  addGrade(grade: Omit<Grade, 'id'>): Observable<Grade> {
    return this.http.post<CalificacionResponse>(`${environment.apiUrl}/calificaciones`, grade).pipe(
      tap((res) => this._grades.update((list) => [...list, toGrade(res)])),
      map(toGrade),
    );
  }

  update(id: number, changes: Partial<Omit<Grade, 'id'>>): Observable<Grade> {
    return this.http.put<CalificacionResponse>(`${environment.apiUrl}/calificaciones/${id}`, changes).pipe(
      tap((res) =>
        this._grades.update((list) => list.map((g) => (g.id === id ? toGrade(res) : g)))
      ),
      map(toGrade),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/calificaciones/${id}`).pipe(
      tap(() => this._grades.update((list) => list.filter((g) => g.id !== id))),
    );
  }
}

function toGrade(res: CalificacionResponse): Grade {
  return {
    id: res.id,
    alumnoId: res.alumnoId,
    grupoId: res.grupoId,
    materiaId: res.materiaId,
    calificacion: res.calificacion,
    registradoPor: res.registradoPor,
  };
}
