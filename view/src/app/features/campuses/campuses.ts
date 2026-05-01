import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CampusesService } from '../../core/services/campuses.service';
import { Campus } from '../../core/models/campus.model';

@Component({
  selector: 'app-campuses',
  imports: [ReactiveFormsModule],
  templateUrl: './campuses.html',
})
export class Campuses {
  private readonly campusesService = inject(CampusesService);
  private readonly fb = inject(FormBuilder);

  readonly campuses = this.campusesService.campuses;
  readonly filterDraft = signal('');
  readonly filterQ = signal('');
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);

  readonly filtered = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.campuses();
    return this.campuses().filter(
      (c) => c.name.toUpperCase().includes(q) || c.address.toUpperCase().includes(q)
    );
  });

  readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
  });

  readonly addForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
  });

  search(): void {
    this.filterQ.set(this.filterDraft());
  }

  clearFilter(): void {
    this.filterDraft.set('');
    this.filterQ.set('');
  }

  startEdit(campus: Campus): void {
    this.editingId.set(campus.id);
    this.showAddForm.set(false);
    this.editForm.setValue({ name: campus.name, address: campus.address });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.campusesService.update(id, v).subscribe();
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
    this.campusesService.add(v).subscribe();
    this.addForm.reset();
    this.showAddForm.set(false);
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este plantel?')) return;
    this.campusesService.delete(id).subscribe();
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    if (!this.showAddForm()) this.addForm.reset();
  }
}
