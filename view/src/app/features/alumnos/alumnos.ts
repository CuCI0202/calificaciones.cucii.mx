import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlumnosService } from '../../core/services/alumnos.service';
import { CarrerasService } from '../../core/services/carreras.service';
import { GruposService } from '../../core/services/grupos.service';
import { PlantelesService } from '../../core/services/planteles.service';
import { Alumno } from '../../core/models/alumno.model';

const CURP_PATTERN = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

@Component({
  selector: 'app-alumnos',
  imports: [ReactiveFormsModule],
  templateUrl: './alumnos.html',
})
export class Alumnos {
  private readonly alumnosService = inject(AlumnosService);
  private readonly carrerasService = inject(CarrerasService);
  private readonly gruposService = inject(GruposService);
  private readonly plantelesService = inject(PlantelesService);
  private readonly fb = inject(FormBuilder);

  readonly alumnos = this.alumnosService.alumnos;
  readonly carreras = this.carrerasService.carreras;
  readonly grupos = this.gruposService.grupos;
  readonly planteles = this.plantelesService.planteles;

  readonly filterQ = signal('');
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);

  // Track selected carrera in add/edit form to filter grupos (stored as string from select)
  readonly addCarreraId = signal('');
  readonly editCarreraId = signal('');

  readonly gruposParaAdd = computed(() =>
    this.grupos().filter((g) => g.carreraId === +this.addCarreraId())
  );

  readonly gruposParaEdit = computed(() =>
    this.grupos().filter((g) => g.carreraId === +this.editCarreraId())
  );

  readonly filtrados = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.alumnos();
    return this.alumnos().filter(
      (a) => a.curp.includes(q) || a.nombre.toUpperCase().includes(q)
    );
  });

  readonly editForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    curp: ['', [Validators.required, Validators.pattern(CURP_PATTERN)]],
    carreraId: ['', Validators.required],
    grupoId: ['', Validators.required],
    plantelId: ['', Validators.required],
  });

  readonly addForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    curp: ['', [Validators.required, Validators.pattern(CURP_PATTERN)]],
    carreraId: ['', Validators.required],
    grupoId: ['', Validators.required],
    plantelId: ['', Validators.required],
  });

  getNombreCarrera(id: number): string {
    return this.carreras().find((c) => c.id === id)?.nombre ?? String(id);
  }

  getNombreGrupo(id: number): string {
    const g = this.grupos().find((g) => g.id === id);
    return g ? `${g.clave} — ${g.nombre}` : String(id);
  }

  getNombrePlantel(id: number): string {
    return this.planteles().find((p) => p.id === id)?.nombre ?? String(id);
  }

  startEdit(alumno: Alumno): void {
    this.editingId.set(alumno.id);
    this.showAddForm.set(false);
    this.editCarreraId.set(String(alumno.carreraId));
    this.editForm.setValue({
      nombre: alumno.nombre,
      curp: alumno.curp,
      carreraId: String(alumno.carreraId),
      grupoId: String(alumno.grupoId),
      plantelId: String(alumno.plantelId),
    });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.alumnosService.update(id, {
      nombre: v.nombre,
      curp: v.curp,
      carreraId: +v.carreraId,
      grupoId: +v.grupoId,
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
    this.alumnosService.add({
      nombre: v.nombre,
      curp: v.curp,
      carreraId: +v.carreraId,
      grupoId: +v.grupoId,
      plantelId: +v.plantelId,
    }).subscribe();
    this.addForm.reset();
    this.addCarreraId.set('');
    this.showAddForm.set(false);
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este alumno?')) return;
    this.alumnosService.delete(id).subscribe();
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    if (!this.showAddForm()) {
      this.addForm.reset();
      this.addCarreraId.set('');
    }
  }
}
