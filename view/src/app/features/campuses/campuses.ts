import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmService } from '../../core/services/confirm.service';
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
  private readonly confirm = inject(ConfirmService);

  readonly campuses = this.campusesService.campuses;
  readonly filterDraft = signal('');
  readonly filterQ = signal('');
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);

  readonly filtered = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.campuses();
    return this.campuses().filter(
      (c) =>
        c.nombreOficial.toUpperCase().includes(q) ||
        (c.nombreCorto?.toUpperCase().includes(q) ?? false) ||
        c.ciudadMunicipio.toUpperCase().includes(q) ||
        c.estado.toUpperCase().includes(q)
    );
  });

  private readonly formFields = {
    nombreOficial: ['', Validators.required],
    nombreCorto: [''],
    direccionCalle: [''],
    direccionNumeroExt: [''],
    direccionNumeroInt: [''],
    colonia: [''],
    codigoPostal: ['', Validators.pattern(/^\d{5}$/)],
    ciudadMunicipio: ['', Validators.required],
    estado: ['', Validators.required],
    pais: ['México'],
    directorNombre: [''],
  };

  readonly editForm = this.fb.nonNullable.group({ ...this.formFields });
  readonly addForm = this.fb.nonNullable.group({ ...this.formFields });

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
    this.editForm.setValue({
      nombreOficial: campus.nombreOficial,
      nombreCorto: campus.nombreCorto ?? '',
      direccionCalle: campus.direccionCalle ?? '',
      direccionNumeroExt: campus.direccionNumeroExt ?? '',
      direccionNumeroInt: campus.direccionNumeroInt ?? '',
      colonia: campus.colonia ?? '',
      codigoPostal: campus.codigoPostal ?? '',
      ciudadMunicipio: campus.ciudadMunicipio,
      estado: campus.estado,
      pais: campus.pais ?? 'México',
      directorNombre: campus.directorNombre ?? '',
    });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.campusesService.update(id, {
      nombreOficial: v.nombreOficial,
      nombreCorto: v.nombreCorto || undefined,
      direccionCalle: v.direccionCalle || undefined,
      direccionNumeroExt: v.direccionNumeroExt || undefined,
      direccionNumeroInt: v.direccionNumeroInt || undefined,
      colonia: v.colonia || undefined,
      codigoPostal: v.codigoPostal || undefined,
      ciudadMunicipio: v.ciudadMunicipio,
      estado: v.estado,
      pais: v.pais || undefined,
      directorNombre: v.directorNombre || undefined,
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
    this.campusesService.add({
      nombreOficial: v.nombreOficial,
      nombreCorto: v.nombreCorto || undefined,
      direccionCalle: v.direccionCalle || undefined,
      direccionNumeroExt: v.direccionNumeroExt || undefined,
      direccionNumeroInt: v.direccionNumeroInt || undefined,
      colonia: v.colonia || undefined,
      codigoPostal: v.codigoPostal || undefined,
      ciudadMunicipio: v.ciudadMunicipio,
      estado: v.estado,
      pais: v.pais || undefined,
      directorNombre: v.directorNombre || undefined,
    }).subscribe();
    this.addForm.reset({ pais: 'México' });
    this.showAddForm.set(false);
  }

  delete(id: number): void {
    this.confirm.confirm('¿Eliminar este plantel?').subscribe((ok) => {
      if (ok) this.campusesService.delete(id).subscribe();
    });
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    if (!this.showAddForm()) this.addForm.reset({ pais: 'México' });
  }
}
