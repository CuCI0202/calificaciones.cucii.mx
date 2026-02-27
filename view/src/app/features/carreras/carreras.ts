import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarrerasService } from '../../core/services/carreras.service';
import { Carrera } from '../../core/models/carrera.model';

@Component({
  selector: 'app-carreras',
  imports: [ReactiveFormsModule],
  templateUrl: './carreras.html',
})
export class Carreras {
  private readonly carrerasService = inject(CarrerasService);
  private readonly fb = inject(FormBuilder);

  readonly carreras = this.carrerasService.carreras;
  readonly filterQ = signal('');
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);

  readonly filtrados = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.carreras();
    return this.carreras().filter(
      (c) => c.nombre.toUpperCase().includes(q) || c.rvoe.toUpperCase().includes(q)
    );
  });

  readonly editForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    rvoe: ['', Validators.required],
    fechaRvoe: ['', Validators.required],
  });

  readonly addForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    rvoe: ['', Validators.required],
    fechaRvoe: ['', Validators.required],
  });

  startEdit(carrera: Carrera): void {
    this.editingId.set(carrera.id);
    this.showAddForm.set(false);
    this.editForm.setValue({
      nombre: carrera.nombre,
      rvoe: carrera.rvoe,
      fechaRvoe: carrera.fechaRvoe,
    });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.carrerasService.update(id, v).subscribe();
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
    this.carrerasService.add(v).subscribe();
    this.addForm.reset();
    this.showAddForm.set(false);
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar esta carrera?')) return;
    this.carrerasService.delete(id).subscribe();
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    if (!this.showAddForm()) this.addForm.reset();
  }
}
