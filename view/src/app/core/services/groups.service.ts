import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Group } from '../models/group.model';
import { Subject } from '../models/program.model';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly http = inject(HttpClient);

  private readonly _groups = signal<Group[]>([]);
  readonly groups = this._groups.asReadonly();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<Group[]>(`${environment.apiUrl}/grupos`).subscribe({
      next: (list) => this._groups.set(list),
    });
  }

  getAll(): Observable<Group[]> {
    return this.http.get<Group[]>(`${environment.apiUrl}/grupos`);
  }

  getById(id: number): Observable<Group> {
    return this.http.get<Group>(`${environment.apiUrl}/grupos/${id}`);
  }

  getByProgram(planEstudioId: number): Observable<Group[]> {
    return this.http.get<Group[]>(`${environment.apiUrl}/grupos`);
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
      tap((res) => this._groups.update((list) => [...list, res])),
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
      tap(() => this._groups.update((list) => list.filter((g) => g.id !== id))),
    );
  }
}
