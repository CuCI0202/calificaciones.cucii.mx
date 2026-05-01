import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { Teacher, UserRole } from '../../core/models/teacher.model';

@Component({
  selector: 'app-users',
  imports: [ReactiveFormsModule],
  templateUrl: './users.html',
})
export class Users {
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);

  readonly users = this.usersService.users;
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
        u.name.toUpperCase().includes(q) ||
        u.lastName.toUpperCase().includes(q)
    );
  });

  readonly addForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    password: ['', Validators.required],
    role: ['teacher' as UserRole, Validators.required],
  });

  readonly editForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    password: [''],
    role: ['teacher' as UserRole, Validators.required],
  });

  search(): void {
    this.filterQ.set(this.filterDraft());
  }

  clearFilter(): void {
    this.filterDraft.set('');
    this.filterQ.set('');
  }

  getRoleLabel(role: UserRole): string {
    return role === 'admin' ? 'Administrador' : 'Profesor';
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    this.showAddPassword.set(false);
    if (!this.showAddForm()) this.addForm.reset({ role: 'teacher' });
  }

  submitAdd(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const v = this.addForm.getRawValue();
    this.usersService.add(v).subscribe();
    this.addForm.reset({ role: 'teacher' });
    this.showAddForm.set(false);
    this.showAddPassword.set(false);
  }

  startEdit(user: Teacher): void {
    this.editingId.set(user.id);
    this.showAddForm.set(false);
    this.showEditPassword.set(false);
    this.editForm.setValue({
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      password: '',
      role: user.role,
    });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    const changes: Partial<Omit<Teacher, 'id'>> = {
      email: v.email,
      name: v.name,
      lastName: v.lastName,
      role: v.role,
    };
    if (v.password.trim()) changes.password = v.password.trim();
    this.usersService.update(id, changes).subscribe();
    this.editingId.set(null);
    this.showEditPassword.set(false);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.showEditPassword.set(false);
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.usersService.delete(id).subscribe();
  }
}
