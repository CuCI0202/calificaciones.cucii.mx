import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TeacherAssignment } from '../models/teacher-assignment.model';

const MOCK_ASSIGNMENTS: TeacherAssignment[] = [
  { id: 1, userId: 2, groupId: 1, subjectId: 101 },
  { id: 2, userId: 3, groupId: 2, subjectId: 102 },
];

@Injectable({ providedIn: 'root' })
export class TeacherAssignmentsService {
  private readonly _assignments = signal<TeacherAssignment[]>(MOCK_ASSIGNMENTS);
  readonly assignments = this._assignments.asReadonly();

  add(assignment: Omit<TeacherAssignment, 'id'>): Observable<TeacherAssignment | null> {
    const exists = this._assignments().some(
      (a) =>
        a.userId === assignment.userId &&
        a.groupId === assignment.groupId &&
        a.subjectId === assignment.subjectId
    );
    if (exists) return of(null);
    const created: TeacherAssignment = { ...assignment, id: Date.now() };
    this._assignments.update((list) => [...list, created]);
    return of(created);
  }

  delete(id: number): Observable<void> {
    this._assignments.update((list) => list.filter((a) => a.id !== id));
    return of(void 0);
  }
}
