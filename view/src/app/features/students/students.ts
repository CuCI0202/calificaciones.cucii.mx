import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudentsService } from '../../core/services/students.service';
import { ProgramsService } from '../../core/services/programs.service';
import { GroupsService } from '../../core/services/groups.service';
import { CampusesService } from '../../core/services/campuses.service';
import { Student } from '../../core/models/student.model';

const CURP_PATTERN = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

@Component({
  selector: 'app-students',
  imports: [ReactiveFormsModule],
  templateUrl: './students.html',
})
export class Students {
  private readonly studentsService = inject(StudentsService);
  private readonly programsService = inject(ProgramsService);
  private readonly groupsService = inject(GroupsService);
  private readonly campusesService = inject(CampusesService);
  private readonly fb = inject(FormBuilder);

  readonly students = this.studentsService.students;
  readonly programs = this.programsService.programs;
  readonly groups = this.groupsService.groups;
  readonly campuses = this.campusesService.campuses;

  readonly filterDraft = signal('');
  readonly filterQ = signal('');
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);

  readonly addProgramId = signal('');
  readonly editProgramId = signal('');

  readonly groupsForAdd = computed(() =>
    this.groups().filter((g) => g.programId === +this.addProgramId())
  );

  readonly groupsForEdit = computed(() =>
    this.groups().filter((g) => g.programId === +this.editProgramId())
  );

  readonly filtered = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.students();
    return this.students().filter(
      (s) => s.curp.includes(q) || s.name.toUpperCase().includes(q)
    );
  });

  readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    curp: ['', [Validators.required, Validators.pattern(CURP_PATTERN)]],
    programId: ['', Validators.required],
    groupId: ['', Validators.required],
    campusId: ['', Validators.required],
  });

  readonly addForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    curp: ['', [Validators.required, Validators.pattern(CURP_PATTERN)]],
    programId: ['', Validators.required],
    groupId: ['', Validators.required],
    campusId: ['', Validators.required],
  });

  search(): void {
    this.filterQ.set(this.filterDraft());
  }

  clearFilter(): void {
    this.filterDraft.set('');
    this.filterQ.set('');
  }

  getProgramName(id: number): string {
    return this.programs().find((p) => p.id === id)?.name ?? String(id);
  }

  getGroupName(id: number): string {
    const g = this.groups().find((g) => g.id === id);
    return g ? `${g.code} — ${g.name}` : String(id);
  }

  getCampusName(id: number): string {
    return this.campuses().find((c) => c.id === id)?.name ?? String(id);
  }

  startEdit(student: Student): void {
    this.editingId.set(student.id);
    this.showAddForm.set(false);
    this.editProgramId.set(String(student.programId));
    this.editForm.setValue({
      name: student.name,
      curp: student.curp,
      programId: String(student.programId),
      groupId: String(student.groupId),
      campusId: String(student.campusId),
    });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.studentsService.update(id, {
      name: v.name,
      curp: v.curp,
      programId: +v.programId,
      groupId: +v.groupId,
      campusId: +v.campusId,
    }).subscribe();
    this.editingId.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  submitAdd(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const v = this.addForm.getRawValue();
    this.studentsService.add({
      name: v.name,
      curp: v.curp,
      programId: +v.programId,
      groupId: +v.groupId,
      campusId: +v.campusId,
    }).subscribe();
    this.addForm.reset();
    this.addProgramId.set('');
    this.showAddForm.set(false);
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este alumno?')) return;
    this.studentsService.delete(id).subscribe();
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    if (!this.showAddForm()) {
      this.addForm.reset();
      this.addProgramId.set('');
    }
  }
}
