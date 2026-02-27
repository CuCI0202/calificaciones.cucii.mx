import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlantelesService } from '../../core/services/planteles.service';
import { Plantel } from '../../core/models/plantel.model';

@Component({
  selector: 'app-planteles',
  imports: [ReactiveFormsModule],
  templateUrl: './planteles.html',
})
export class Planteles {
  private readonly plantelesService = inject(PlantelesService);
  private readonly fb = inject(FormBuilder);

  readonly planteles = this.plantelesService.planteles;
  readonly filterQ = signal('');
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);

  readonly filtrados = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.planteles();
    return this.planteles().filter(
      (p) => p.nombre.toUpperCase().includes(q) || p.direccion.toUpperCase().includes(q)
    );
  });

  readonly editForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
  });

  readonly addForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
  });

  startEdit(plantel: Plantel): void {
    this.editingId.set(plantel.id);
    this.showAddForm.set(false);
    this.editForm.setValue({ nombre: plantel.nombre, direccion: plantel.direccion });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.plantelesService.update(id, v).subscribe();
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
    this.plantelesService.add(v).subscribe();
    this.addForm.reset();
    this.showAddForm.set(false);
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este plantel?')) return;
    this.plantelesService.delete(id).subscribe();
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    if (!this.showAddForm()) this.addForm.reset();
  }
}
