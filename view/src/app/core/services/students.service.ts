import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Student } from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly http = inject(HttpClient);

  private readonly _students = signal<Student[]>([]);
  readonly students = this._students.asReadonly();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<Student[]>(`${environment.apiUrl}/alumnos`).subscribe({
      next: (list) => this._students.set(list),
    });
  }

  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(`${environment.apiUrl}/alumnos`);
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
      tap((res) => this._students.update((list) => [...list, res])),
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
      tap(() => this._students.update((list) => list.filter((s) => s.id !== id))),
    );
  }
}
