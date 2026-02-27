import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarrerasService } from '../../core/services/carreras.service';
import { Materia } from '../../core/models/materia.model';

@Component({
  selector: 'app-materias',
  imports: [ReactiveFormsModule],
  templateUrl: './materias.html',
})
export class Materias {
  private readonly carrerasService = inject(CarrerasService);
  private readonly fb = inject(FormBuilder);

  readonly carreras = this.carrerasService.carreras;
  readonly selectedCarreraId = signal<number | null>(null);
  readonly editingId = signal<number | null>(null);

  readonly materiasDeCarrera = computed<Materia[]>(() => {
    const id = this.selectedCarreraId();
    if (id === null) return [];
    return this.carreras().find((c) => c.id === id)?.materias ?? [];
  });

  readonly addForm = this.fb.nonNullable.group({
    clave: ['', Validators.required],
    nombre: ['', Validators.required],
  });

  readonly editForm = this.fb.nonNullable.group({
    clave: ['', Validators.required],
    nombre: ['', Validators.required],
  });

  onCarreraChange(value: string): void {
    this.selectedCarreraId.set(value ? +value : null);
    this.editingId.set(null);
  }

  startEdit(materia: Materia): void {
    this.editingId.set(materia.id);
    this.editForm.setValue({ clave: materia.clave, nombre: materia.nombre });
  }

  saveEdit(materiaId: number): void {
    if (this.editForm.invalid) return;
    const carreraId = this.selectedCarreraId();
    if (carreraId === null) return;
    this.carrerasService.updateMateria(carreraId, materiaId, this.editForm.getRawValue()).subscribe();
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
    const carreraId = this.selectedCarreraId();
    if (carreraId === null) return;
    this.carrerasService.addMateria(carreraId, this.addForm.getRawValue()).subscribe();
    this.addForm.reset();
  }

  delete(materiaId: number): void {
    if (!confirm('¿Eliminar esta materia?')) return;
    const carreraId = this.selectedCarreraId();
    if (carreraId === null) return;
    this.carrerasService.deleteMateria(carreraId, materiaId).subscribe();
  }
}
