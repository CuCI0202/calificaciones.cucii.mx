import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Student } from '../models/student.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly http = inject(HttpClient);

  private readonly _students = signal<Student[]>([]);
  readonly students = this._students.asReadonly();

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
    this.http.get<PaginatedResponse<Student>>(`${environment.apiUrl}/alumnos`, {
      params: { page: String(page), size: String(s) },
    }).subscribe({
      next: (res) => {
        this._students.set(res.content);
        this._totalElements.set(res.totalElements);
        this._totalPages.set(res.totalPages);
        this._currentPage.set(res.currentPage);
        this._pageSize.set(s);
      },
    });
  }

  getAll(): Observable<Student[]> {
    return this.http.get<PaginatedResponse<Student>>(`${environment.apiUrl}/alumnos`).pipe(
      map((res) => res.content),
    );
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(`${environment.apiUrl}/alumnos/${id}`);
  }

  getByCurp(curp: string): Observable<Student | undefined> {
    const normalized = curp.trim().toUpperCase();
    return of(this._students().find((s) => s.curp === normalized));
  }

  add(student: Omit<Student, 'id'>): Observable<Student> {
    return this.http.post<Student>(`${environment.apiUrl}/alumnos`, {
      ...student,
      curp: student.curp.toUpperCase(),
    }).pipe(
      tap(() => this.loadPage(this._currentPage())),
    );
  }

  update(id: number, changes: Partial<Omit<Student, 'id'>>): Observable<Student> {
    return this.http.put<Student>(`${environment.apiUrl}/alumnos/${id}`, changes).pipe(
      tap((res) =>
        this._students.update((list) => list.map((s) => (s.id === id ? res : s)))
      ),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/alumnos/${id}`).pipe(
      tap(() => this.loadPage(this._currentPage())),
    );
  }
}
