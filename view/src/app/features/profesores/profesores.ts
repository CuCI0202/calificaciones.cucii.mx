import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmService } from '../../core/services/confirm.service';
import { GroupsService } from '../../core/services/groups.service';
import { ProgramsService } from '../../core/services/programs.service';
import { UsersService } from '../../core/services/users.service';
import { TeacherAssignmentsService } from '../../core/services/teacher-assignments.service';

@Component({
  selector: 'app-profesores',
  imports: [ReactiveFormsModule],
  templateUrl: './profesores.html',
})
export class Profesores {
  private readonly usersService = inject(UsersService);
  private readonly groupsService = inject(GroupsService);
  private readonly programsService = inject(ProgramsService);
  private readonly assignmentsService = inject(TeacherAssignmentsService);
  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmService);

  readonly assignments = this.assignmentsService.assignments;
  readonly teachers = computed(() => this.usersService.users().filter((u) => u.rolId === 3));
  readonly groups = this.groupsService.groups;
  readonly programs = this.programsService.programs;

  readonly showAddForm = signal(false);
  readonly selectedGroupId = signal<number | null>(null);
  readonly filterDraft = signal('');
  readonly filterQ = signal('');
  readonly duplicateError = signal(false);

  readonly availableSubjects = computed(() => {
    const gId = this.selectedGroupId();
    if (!gId) return [];
    const group = this.groups().find((g) => g.id === gId);
    if (!group) return [];
    return this.programs().find((p) => p.id === group.programId)?.subjects ?? [];
  });

  readonly filtered = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.assignments();
    return this.assignments().filter((a) =>
      this.getTeacherName(a.userId).toUpperCase().includes(q)
    );
  });

  readonly addForm = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    groupId: ['', Validators.required],
    subjectId: ['', Validators.required],
  });

  search(): void {
    this.filterQ.set(this.filterDraft());
  }

  clearFilter(): void {
    this.filterDraft.set('');
    this.filterQ.set('');
  }

  onGroupChange(value: string): void {
    this.selectedGroupId.set(value ? +value : null);
    this.addForm.patchValue({ subjectId: '' });
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    if (!this.showAddForm()) {
      this.addForm.reset();
      this.selectedGroupId.set(null);
      this.duplicateError.set(false);
    }
  }

  submitAdd(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const v = this.addForm.getRawValue();
    this.assignmentsService
      .add({ userId: +v.userId, groupId: +v.groupId, subjectId: +v.subjectId })
      .subscribe((result) => {
        if (result === null) {
          this.duplicateError.set(true);
          return;
        }
        this.duplicateError.set(false);
        this.addForm.reset();
        this.selectedGroupId.set(null);
        this.showAddForm.set(false);
      });
  }

  delete(id: number): void {
    this.confirm.confirm('¿Eliminar esta asignación?').subscribe((ok) => {
      if (ok) this.assignmentsService.delete(id).subscribe();
    });
  }

  getTeacherName(userId: number): string {
    const t = this.usersService.users().find((u) => u.id === userId);
    return t ? `${t.firstName} ${t.lastName}` : String(userId);
  }

  getGroupName(groupId: number): string {
    return this.groups().find((g) => g.id === groupId)?.name ?? String(groupId);
  }

  getSubjectName(subjectId: number): string {
    for (const program of this.programs()) {
      const subject = program.subjects.find((s) => s.id === subjectId);
      if (subject) return `${subject.code} – ${subject.name}`;
    }
    return String(subjectId);
  }
}
