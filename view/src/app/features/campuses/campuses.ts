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
        c.name.toUpperCase().includes(q) ||
        (c.shortName?.toUpperCase().includes(q) ?? false) ||
        c.city.toUpperCase().includes(q) ||
        c.state.toUpperCase().includes(q)
    );
  });

  private readonly formFields = {
    name: ['', Validators.required],
    shortName: [''],
    street: [''],
    extNumber: [''],
    intNumber: [''],
    neighborhood: [''],
    zipCode: ['', Validators.pattern(/^\d{5}$/)],
    city: ['', Validators.required],
    state: ['', Validators.required],
    country: ['México'],
    directorName: [''],
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
      name: campus.name,
      shortName: campus.shortName ?? '',
      street: campus.street ?? '',
      extNumber: campus.extNumber ?? '',
      intNumber: campus.intNumber ?? '',
      neighborhood: campus.neighborhood ?? '',
      zipCode: campus.zipCode ?? '',
      city: campus.city,
      state: campus.state,
      country: campus.country ?? 'México',
      directorName: campus.directorName ?? '',
    });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.campusesService.update(id, {
      name: v.name,
      shortName: v.shortName || undefined,
      street: v.street || undefined,
      extNumber: v.extNumber || undefined,
      intNumber: v.intNumber || undefined,
      neighborhood: v.neighborhood || undefined,
      zipCode: v.zipCode || undefined,
      city: v.city,
      state: v.state,
      country: v.country || undefined,
      directorName: v.directorName || undefined,
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
      name: v.name,
      shortName: v.shortName || undefined,
      street: v.street || undefined,
      extNumber: v.extNumber || undefined,
      intNumber: v.intNumber || undefined,
      neighborhood: v.neighborhood || undefined,
      zipCode: v.zipCode || undefined,
      city: v.city,
      state: v.state,
      country: v.country || undefined,
      directorName: v.directorName || undefined,
    }).subscribe();
    this.addForm.reset({ country: 'México' });
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
    if (!this.showAddForm()) this.addForm.reset({ country: 'México' });
  }
}