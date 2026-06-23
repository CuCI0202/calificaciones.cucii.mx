import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Program } from '../models/program.model';
import { Subject } from '../models/subject.model';
import { toProgram, toProgramWithSubjects, toProgramRequest, toSubject, toSubjectRequest, MateriaResponse } from '../models/program.model';

interface PlanEstudioConMateriasResponse {
  materias: MateriaResponse[];
}

@Injectable({ providedIn: 'root' })
export class ProgramsService {
  private readonly http = inject(HttpClient);

  private readonly _programs = signal<Program[]>([]);
  readonly programs = this._programs.asReadonly();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<unknown[]>(`${environment.apiUrl}/planes-estudio`).pipe(
      switchMap((list) => {
        if (list.length === 0) return of([]);
        return forkJoin(
          list.map((p: any) =>
            this.http.get<PlanEstudioConMateriasResponse>(
              `${environment.apiUrl}/planes-estudio/${p.id}/con-materias`
            ).pipe(
              map((detail) => ({
                ...p,
                materias: detail.materias ?? [],
              })),
              catchError(() => of(p)),
            )
          )
        );
      }),
    ).subscribe({
      next: (programs) => this._programs.set(programs.map(toProgramWithSubjects)),
    });
  }

  getAll(): Observable<Program[]> {
    return of(this._programs());
  }

  getById(id: number): Observable<Program | undefined> {
    return of(this._programs().find((p) => p.id === id));
  }

  add(program: Omit<Program, 'id' | 'subjects'>): Observable<Program> {
    return this.http.post<unknown>(`${environment.apiUrl}/planes-estudio`, toProgramRequest(program)).pipe(
      tap((res: any) => {
        const created = toProgramWithSubjects({ ...res, materias: [] });
        this._programs.update((list) => [...list, created]);
      }),
      map((res: any) => toProgramWithSubjects({ ...res, materias: [] })),
    );
  }

  update(id: number, changes: Partial<Omit<Program, 'id' | 'subjects'>>): Observable<Program> {
    const body: any = {};
    if (changes.name !== undefined) body.nombre = changes.name;
    if (changes.degree !== undefined) body.grado = changes.degree;
    if (changes.rvoe !== undefined) body.numRvoe = changes.rvoe;
    if (changes.rvoeDate !== undefined) body.fechaRvoe = changes.rvoeDate;
    if (changes.terms !== undefined) body.duracionCuatrimestres = changes.terms;

    return this.http.put<unknown>(`${environment.apiUrl}/planes-estudio/${id}`, body).pipe(
      tap((res: any) => {
        const updated = toProgramWithSubjects({ ...res, materias: [] });
        this._programs.update((list) => list.map((p) => (p.id === id ? updated : p)));
      }),
      map((res: any) => toProgramWithSubjects({ ...res, materias: [] })),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/planes-estudio/${id}`).pipe(
      tap(() => this._programs.update((list) => list.filter((p) => p.id !== id))),
    );
  }

  // ── Subject sub-CRUD ──────────────────────────────────────────────────────

  getSubjectsByProgram(programId: number): Observable<Subject[]> {
    return this.http.get<PlanEstudioConMateriasResponse>(
      `${environment.apiUrl}/planes-estudio/${programId}/con-materias`
    ).pipe(
      map((res) => (res.materias ?? []).map(toSubject)),
    );
  }

  addSubject(programId: number, subject: Omit<Subject, 'id'>): Observable<Subject> {
    return this.http.post<unknown>(`${environment.apiUrl}/materias`, toSubjectRequest(subject, programId)).pipe(
      tap((res: any) => {
        const created = toSubject(res);
        this._programs.update((list) =>
          list.map((p) =>
            p.id === programId ? { ...p, subjects: [...p.subjects, created] } : p
          )
        );
      }),
      map((res: any) => toSubject(res)),
    );
  }

  updateSubject(programId: number, subjectId: number, changes: Omit<Subject, 'id'>): Observable<Subject> {
    return this.http.put<unknown>(`${environment.apiUrl}/materias/${subjectId}`, toSubjectRequest(changes, programId)).pipe(
      tap((res: any) => {
        const updated = toSubject(res);
        this._programs.update((list) =>
          list.map((p) =>
            p.id !== programId ? p : {
              ...p,
              subjects: p.subjects.map((s) => (s.id === subjectId ? updated : s)),
            }
          )
        );
      }),
      map((res: any) => toSubject(res)),
    );
  }

  deleteSubject(programId: number, subjectId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/materias/${subjectId}`).pipe(
      tap(() =>
        this._programs.update((list) =>
          list.map((p) =>
            p.id !== programId ? p : {
              ...p,
              subjects: p.subjects.filter((s) => s.id !== subjectId),
            }
          )
        )
      ),
    );
  }
}
