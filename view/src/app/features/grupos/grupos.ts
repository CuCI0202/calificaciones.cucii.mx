import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GruposService } from '../../core/services/grupos.service';
import { CarrerasService } from '../../core/services/carreras.service';
import { PlantelesService } from '../../core/services/planteles.service';
import { Grupo } from '../../core/models/grupo.model';

@Component({
  selector: 'app-grupos',
  imports: [ReactiveFormsModule],
  templateUrl: './grupos.html',
})
export class Grupos {
  private readonly gruposService = inject(GruposService);
  private readonly carrerasService = inject(CarrerasService);
  private readonly plantelesService = inject(PlantelesService);
  private readonly fb = inject(FormBuilder);

  readonly grupos = this.gruposService.grupos;
  readonly carreras = this.carrerasService.carreras;
  readonly planteles = this.plantelesService.planteles;
  readonly filterQ = signal('');
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);

  readonly filtrados = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.grupos();
    return this.grupos().filter(
      (g) => g.clave.toUpperCase().includes(q) || g.nombre.toUpperCase().includes(q)
    );
  });

  readonly editForm = this.fb.nonNullable.group({
    clave: ['', Validators.required],
    nombre: ['', Validators.required],
    carreraId: ['', Validators.required],
    plantelId: ['', Validators.required],
  });

  readonly addForm = this.fb.nonNullable.group({
    clave: ['', Validators.required],
    nombre: ['', Validators.required],
    carreraId: ['', Validators.required],
    plantelId: ['', Validators.required],
  });

  getNombreCarrera(id: number): string {
    return this.carreras().find((c) => c.id === id)?.nombre ?? String(id);
  }

  getNombrePlantel(id: number): string {
    return this.planteles().find((p) => p.id === id)?.nombre ?? String(id);
  }

  startEdit(grupo: Grupo): void {
    this.editingId.set(grupo.id);
    this.showAddForm.set(false);
    this.editForm.setValue({
      clave: grupo.clave,
      nombre: grupo.nombre,
      carreraId: String(grupo.carreraId),
      plantelId: String(grupo.plantelId),
    });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.gruposService.update(id, {
      clave: v.clave,
      nombre: v.nombre,
      carreraId: +v.carreraId,
      plantelId: +v.plantelId,
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
    this.gruposService.add({
      clave: v.clave,
      nombre: v.nombre,
      carreraId: +v.carreraId,
      plantelId: +v.plantelId,
    }).subscribe();
    this.addForm.reset();
    this.showAddForm.set(false);
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este grupo?')) return;
    this.gruposService.delete(id).subscribe();
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    if (!this.showAddForm()) this.addForm.reset();
  }
}
