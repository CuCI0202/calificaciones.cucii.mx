import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GroupStudent } from '../models/group-student.model';

const MOCK_ASSIGNMENTS: GroupStudent[] = [
  { groupId: 1, studentId: 1 },
];

@Injectable({ providedIn: 'root' })
export class GroupStudentsService {
  private readonly _assignments = signal<GroupStudent[]>(MOCK_ASSIGNMENTS);
  readonly assignments = this._assignments.asReadonly();

  getByGroup(groupId: number): Observable<GroupStudent[]> {
    return of(this._assignments().filter((a) => a.groupId === groupId));
  }

  assign(groupId: number, studentId: number): Observable<GroupStudent> {
    const exists = this._assignments().some(
      (a) => a.groupId === groupId && a.studentId === studentId
    );
    if (!exists) {
      const record: GroupStudent = { groupId, studentId };
      this._assignments.update((list) => [...list, record]);
      return of(record);
    }
    return of({ groupId, studentId });
  }

  remove(groupId: number, studentId: number): Observable<void> {
    this._assignments.update((list) =>
      list.filter((a) => !(a.groupId === groupId && a.studentId === studentId))
    );
    return of(void 0);
  }
}
