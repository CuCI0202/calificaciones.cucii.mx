import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmService } from '../../core/services/confirm.service';
import { UsersService } from '../../core/services/users.service';
import { CampusesService } from '../../core/services/campuses.service';
import { User } from '../../core/models/user.model';
import { UserRole, mapRolId } from '../../core/models/auth.model';

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule],
  templateUrl: './users.html',
})
export class Users {
  private readonly usersService = inject(UsersService);
  private readonly campusesService = inject(CampusesService);
  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmService);

  readonly users = this.usersService.users;
  readonly campuses = this.campusesService.campuses;
  readonly filterDraft = signal('');
  readonly filterQ = signal('');
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);
  readonly showAddPassword = signal(false);
  readonly showEditPassword = signal(false);

  readonly filtered = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.users();
    return this.users().filter(
      (u) =>
        u.email.toUpperCase().includes(q) ||
        u.nombre.toUpperCase().includes(q) ||
        u.apellido.toUpperCase().includes(q)
    );
  });

  readonly addForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    password: ['', Validators.required],
    rolId: [3 as number, Validators.required],
    plantelId: [1 as number, Validators.required],
  });

  readonly editForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    password: [''],
    rolId: [3 as number, Validators.required],
    plantelId: [1 as number, Validators.required],
  });

  readonly roles: { id: number; label: string }[] = [
    { id: 1, label: 'Administrador' },
    { id: 2, label: 'Rector' },
    { id: 3, label: 'Docente' },
    { id: 4, label: 'Servicios Escolares' },
    { id: 5, label: 'Coordinador' },
  ];

  search(): void {
    this.filterQ.set(this.filterDraft());
  }

  clearFilter(): void {
    this.filterDraft.set('');
    this.filterQ.set('');
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    this.showAddPassword.set(false);
    if (!this.showAddForm()) this.addForm.reset({ rolId: 3, plantelId: 1 });
  }

  submitAdd(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const v = this.addForm.getRawValue();
    this.usersService.add(v).subscribe();
    this.addForm.reset({ rolId: 3, plantelId: 1 });
    this.showAddForm.set(false);
    this.showAddPassword.set(false);
  }

  startEdit(user: User): void {
    this.editingId.set(user.id);
    this.showAddForm.set(false);
    this.showEditPassword.set(false);
    this.editForm.setValue({
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      password: '',
      rolId: user.rolId,
      plantelId: user.plantelId,
    });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.usersService.update(id, {
      nombre: v.nombre,
      apellido: v.apellido,
      email: v.email,
      rolId: v.rolId,
      plantelId: v.plantelId,
      password: v.password.trim() || undefined,
    }).subscribe();
    this.editingId.set(null);
    this.showEditPassword.set(false);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.showEditPassword.set(false);
  }

  delete(id: number): void {
    this.confirm.confirm('¿Eliminar este usuario?').subscribe((ok) => {
      if (ok) this.usersService.delete(id).subscribe();
    });
  }

  getRoleLabel(rolId: number): string {
    const labels: Record<UserRole, string> = {
      admin: 'Administrador',
      rector: 'Rector',
      docente: 'Docente',
      servicios_escolares: 'Servicios Escolares',
      coordinador: 'Coordinador',
    };
    return labels[mapRolId(rolId)] ?? 'Desconocido';
  }
}
