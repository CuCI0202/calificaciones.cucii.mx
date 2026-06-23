import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Program, Subject } from '../models/program.model';

@Injectable({ providedIn: 'root' })
export class ProgramsService {
  private readonly http = inject(HttpClient);

  private readonly _programs = signal<Program[]>([]);
  readonly programs = this._programs.asReadonly();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<any[]>(`${environment.apiUrl}/planes-estudio`).pipe(
      switchMap((list) => {
        if (list.length === 0) return of([]);
        return forkJoin(
          list.map((p) =>
            this.http.get<any>(`${environment.apiUrl}/planes-estudio/${p.id}/con-materias`).pipe(
              map((detail) => ({ ...p, materias: detail.materias ?? [] })),
              catchError(() => of(p)),
            )
          )
        );
      }),
    ).subscribe({
      next: (programs) => this._programs.set(programs),
    });
  }

  getAll(): Observable<Program[]> {
    return of(this._programs());
  }

  getById(id: number): Observable<Program | undefined> {
    return of(this._programs().find((p) => p.id === id));
  }

  add(data: {
    nombre: string;
    grado: string;
    numRvoe: string;
    fechaRvoe: string;
    duracionCuatrimestres: number;
  }): Observable<Program> {
    return this.http.post<any>(`${environment.apiUrl}/planes-estudio`, data).pipe(
      tap((res) => this._programs.update((list) => [...list, { ...res, materias: [] }])),
      map((res) => ({ ...res, materias: [] })),
    );
  }

  update(id: number, data: Partial<{
    nombre: string;
    grado: string;
    numRvoe: string;
    fechaRvoe: string;
    duracionCuatrimestres: number;
  }>): Observable<Program> {
    return this.http.put<any>(`${environment.apiUrl}/planes-estudio/${id}`, data).pipe(
      tap((res) => {
        const existing = this._programs().find((p) => p.id === id);
        this._programs.update((list) =>
          list.map((p) => (p.id === id ? { ...res, materias: existing?.materias ?? [] } : p))
        );
      }),
      map((res) => {
        const existing = this._programs().find((p) => p.id === id);
        return { ...res, materias: existing?.materias ?? [] };
      }),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/planes-estudio/${id}`).pipe(
      tap(() => this._programs.update((list) => list.filter((p) => p.id !== id))),
    );
  }

  getSubjectsByProgram(programId: number): Observable<Subject[]> {
    return this.http.get<any>(`${environment.apiUrl}/planes-estudio/${programId}/con-materias`).pipe(
      map((res) => res.materias ?? []),
    );
  }

  addSubject(programId: number, subject: Omit<Subject, 'id'>): Observable<Subject> {
    return this.http.post<any>(`${environment.apiUrl}/materias`, {
      ...subject,
      planEstudioId: programId,
    }).pipe(
      tap((res) =>
        this._programs.update((list) =>
          list.map((p) =>
            p.id === programId ? { ...p, materias: [...p.materias, res] } : p
          )
        )
      ),
    );
  }

  updateSubject(programId: number, subjectId: number, changes: Omit<Subject, 'id'>): Observable<Subject> {
    return this.http.put<any>(`${environment.apiUrl}/materias/${subjectId}`, {
      ...changes,
      planEstudioId: programId,
    }).pipe(
      tap((res) =>
        this._programs.update((list) =>
          list.map((p) =>
            p.id !== programId ? p : {
              ...p,
              materias: p.materias.map((s) => (s.id === subjectId ? res : s)),
            }
          )
        )
      ),
    );
  }

  deleteSubject(programId: number, subjectId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/materias/${subjectId}`).pipe(
      tap(() =>
        this._programs.update((list) =>
          list.map((p) =>
            p.id !== programId ? p : { ...p, materias: p.materias.filter((s) => s.id !== subjectId) }
          )
        )
      ),
    );
  }
}
