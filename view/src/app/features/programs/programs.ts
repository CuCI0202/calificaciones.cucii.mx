import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProgramsService } from '../../core/services/programs.service';
import { Program } from '../../core/models/program.model';

@Component({
  selector: 'app-programs',
  imports: [ReactiveFormsModule],
  templateUrl: './programs.html',
})
export class Programs {
  private readonly programsService = inject(ProgramsService);
  private readonly fb = inject(FormBuilder);

  readonly programs = this.programsService.programs;
  readonly filterDraft = signal('');
  readonly filterQ = signal('');
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);

  readonly filtered = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.programs();
    return this.programs().filter(
      (p) => p.name.toUpperCase().includes(q) || p.rvoe.toUpperCase().includes(q)
    );
  });

  readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    rvoe: ['', Validators.required],
    rvoeDate: ['', Validators.required],
  });

  readonly addForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    rvoe: ['', Validators.required],
    rvoeDate: ['', Validators.required],
  });

  search(): void {
    this.filterQ.set(this.filterDraft());
  }

  clearFilter(): void {
    this.filterDraft.set('');
    this.filterQ.set('');
  }

  startEdit(program: Program): void {
    this.editingId.set(program.id);
    this.showAddForm.set(false);
    this.editForm.setValue({
      name: program.name,
      rvoe: program.rvoe,
      rvoeDate: program.rvoeDate,
    });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.programsService.update(id, v).subscribe();
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
    this.programsService.add(v).subscribe();
    this.addForm.reset();
    this.showAddForm.set(false);
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar esta carrera?')) return;
    this.programsService.delete(id).subscribe();
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    if (!this.showAddForm()) this.addForm.reset();
  }
}
