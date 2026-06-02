import { Component, computed, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupsService } from '../../../core/services/groups.service';
import { StudentsService } from '../../../core/services/students.service';
import { GroupStudentsService } from '../../../core/services/group-students.service';
import { Student, fullName } from '../../../core/models/student.model';

@Component({
  selector: 'app-group-students',
  imports: [],
  templateUrl: './group-students.html',
})
export class GroupStudents {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);
  private readonly studentsService = inject(StudentsService);
  private readonly groupStudentsService = inject(GroupStudentsService);

  readonly groupId = +this.route.snapshot.params['id'];

  readonly group = computed(() =>
    this.groupsService.groups().find((g) => g.id === this.groupId)
  );

  readonly filterDraft = signal('');
  readonly filterQ = signal('');

  readonly assignedStudents = computed((): Student[] => {
    const assignedIds = new Set(
      this.groupStudentsService
        .assignments()
        .filter((a) => a.groupId === this.groupId)
        .map((a) => a.studentId)
    );
    return this.studentsService.students().filter((s) => assignedIds.has(s.id));
  });

  readonly availableStudents = computed((): Student[] => {
    const assignedIds = new Set(this.assignedStudents().map((s) => s.id));
    const q = this.filterQ().trim().toUpperCase();
    return this.studentsService
      .students()
      .filter((s) => !assignedIds.has(s.id))
      .filter(
        (s) =>
          !q ||
          s.curp.includes(q) ||
          fullName(s).toUpperCase().includes(q)
      );
  });

  fullName(student: Student): string {
    return fullName(student);
  }

  search(): void {
    this.filterQ.set(this.filterDraft());
  }

  clearFilter(): void {
    this.filterDraft.set('');
    this.filterQ.set('');
  }

  assign(studentId: number): void {
    this.groupStudentsService.assign(this.groupId, studentId).subscribe();
  }

  remove(studentId: number): void {
    this.groupStudentsService.remove(this.groupId, studentId).subscribe();
  }

  goBack(): void {
    this.router.navigate(['/groups']);
  }
}
