import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProgramsService } from '../../core/services/programs.service';
import { Subject } from '../../core/models/subject.model';

@Component({
  selector: 'app-subjects',
  imports: [ReactiveFormsModule],
  templateUrl: './subjects.html',
})
export class Subjects {
  private readonly programsService = inject(ProgramsService);
  private readonly fb = inject(FormBuilder);

  readonly programs = this.programsService.programs;
  readonly selectedProgramId = signal<number | null>(null);
  readonly editingId = signal<number | null>(null);

  readonly programSubjects = computed<Subject[]>(() => {
    const id = this.selectedProgramId();
    if (id === null) return [];
    return this.programs().find((p) => p.id === id)?.subjects ?? [];
  });

  readonly addForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
  });

  readonly editForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
  });

  onProgramChange(value: string): void {
    this.selectedProgramId.set(value ? +value : null);
    this.editingId.set(null);
  }

  startEdit(subject: Subject): void {
    this.editingId.set(subject.id);
    this.editForm.setValue({ code: subject.code, name: subject.name });
  }

  saveEdit(subjectId: number): void {
    if (this.editForm.invalid) return;
    const programId = this.selectedProgramId();
    if (programId === null) return;
    this.programsService.updateSubject(programId, subjectId, this.editForm.getRawValue()).subscribe();
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
    const programId = this.selectedProgramId();
    if (programId === null) return;
    this.programsService.addSubject(programId, this.addForm.getRawValue()).subscribe();
    this.addForm.reset();
  }

  delete(subjectId: number): void {
    if (!confirm('¿Eliminar esta materia?')) return;
    const programId = this.selectedProgramId();
    if (programId === null) return;
    this.programsService.deleteSubject(programId, subjectId).subscribe();
  }
}
