import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmService } from '../../core/services/confirm.service';
import { ProgramsService } from '../../core/services/programs.service';
import { Subject } from '../../core/models/program.model';

@Component({
  selector: 'app-subjects',
  imports: [ReactiveFormsModule],
  templateUrl: './subjects.html',
})
export class Subjects {
  private readonly programsService = inject(ProgramsService);
  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmService);

  readonly programs = this.programsService.programs;
  readonly selectedProgramId = signal<number>(1);
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);

  readonly subjects = computed(() => {
    const id = this.selectedProgramId();
    return this.programs().find((p) => p.id === id)?.materias ?? [];
  });

  readonly availableTerms = computed(() => {
    const id = this.selectedProgramId();
    const program = this.programs().find((p) => p.id === id);
    if (!program) return [];
    return Array.from({ length: program.duracionCuatrimestres }, (_, i) => i + 1);
  });

  readonly addForm = this.fb.nonNullable.group({
    clave: ['', Validators.required],
    nombre: ['', Validators.required],
    cuatrimestre: [1, [Validators.required, Validators.min(1)]],
    creditos: [0, [Validators.required, Validators.min(0)]],
  });

  readonly editForm = this.fb.nonNullable.group({
    clave: ['', Validators.required],
    nombre: ['', Validators.required],
    cuatrimestre: [1, [Validators.required, Validators.min(1)]],
    creditos: [0, [Validators.required, Validators.min(0)]],
  });

  onProgramChange(value: string): void {
    this.selectedProgramId.set(+value);
    this.editingId.set(null);
    this.showAddForm.set(false);
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
  }

  submitAdd(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const v = this.addForm.getRawValue();
    this.programsService.addSubject(this.selectedProgramId(), v).subscribe();
    this.addForm.reset({ creditos: 0 });
    this.showAddForm.set(false);
  }

  startEdit(subject: Subject): void {
    this.editingId.set(subject.id);
    this.showAddForm.set(false);
    this.editForm.setValue({
      clave: subject.clave,
      nombre: subject.nombre,
      cuatrimestre: subject.cuatrimestre,
      creditos: subject.creditos ?? 0,
    });
  }

  saveEdit(subjectId: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.programsService.updateSubject(this.selectedProgramId(), subjectId, v).subscribe();
    this.editingId.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  delete(subjectId: number): void {
    this.confirm.confirm('¿Eliminar esta materia?').subscribe((ok) => {
      if (ok) this.programsService.deleteSubject(this.selectedProgramId(), subjectId).subscribe();
    });
  }
}
