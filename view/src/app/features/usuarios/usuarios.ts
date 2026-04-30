import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuariosService } from '../../core/services/usuarios.service';
import { Profesor, UserRole } from '../../core/models/profesor.model';

@Component({
  selector: 'app-usuarios',
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios.html',
})
export class Usuarios {
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);

  readonly usuarios = this.usuariosService.usuarios;
  readonly filterDraft = signal('');
  readonly filterQ = signal('');
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);
  readonly showAddPassword = signal(false);
  readonly showEditPassword = signal(false);

  readonly filtrados = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.usuarios();
    return this.usuarios().filter(
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
    role: ['profesor' as UserRole, Validators.required],
  });

  readonly editForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    password: [''],
    role: ['profesor' as UserRole, Validators.required],
  });

  buscar(): void {
    this.filterQ.set(this.filterDraft());
  }

  limpiarFiltro(): void {
    this.filterDraft.set('');
    this.filterQ.set('');
  }

  getRolLabel(role: UserRole): string {
    return role === 'admin' ? 'Administrador' : 'Profesor';
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    this.showAddPassword.set(false);
    if (!this.showAddForm()) this.addForm.reset({ role: 'profesor' });
  }

  submitAdd(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const v = this.addForm.getRawValue();
    this.usuariosService.add(v).subscribe();
    this.addForm.reset({ role: 'profesor' });
    this.showAddForm.set(false);
    this.showAddPassword.set(false);
  }

  startEdit(usuario: Profesor): void {
    this.editingId.set(usuario.id);
    this.showAddForm.set(false);
    this.showEditPassword.set(false);
    this.editForm.setValue({
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      password: '',
      role: usuario.role,
    });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    const changes: Partial<Omit<Profesor, 'id'>> = {
      email: v.email,
      nombre: v.nombre,
      apellido: v.apellido,
      role: v.role,
    };
    if (v.password.trim()) changes.password = v.password.trim();
    this.usuariosService.update(id, changes).subscribe();
    this.editingId.set(null);
    this.showEditPassword.set(false);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.showEditPassword.set(false);
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.usuariosService.delete(id).subscribe();
  }
}
