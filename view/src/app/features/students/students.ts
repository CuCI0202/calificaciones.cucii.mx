import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmService } from '../../core/services/confirm.service';
import { StudentsService } from '../../core/services/students.service';
import { Student, fullName } from '../../core/models/student.model';

const CURP_PATTERN = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

@Component({
  selector: 'app-students',
  imports: [ReactiveFormsModule],
  templateUrl: './students.html',
})
export class Students {
  private readonly studentsService = inject(StudentsService);
  private readonly fb = inject(FormBuilder);
  private readonly confirm = inject(ConfirmService);

  readonly students = this.studentsService.students;
  readonly filterDraft = signal('');
  readonly filterQ = signal('');
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);

  readonly filtered = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.students();
    return this.students().filter(
      (s) =>
        s.curp.includes(q) ||
        fullName(s).toUpperCase().includes(q)
    );
  });

  readonly editForm = this.fb.nonNullable.group({
    nombres: ['', Validators.required],
    primerApellido: ['', Validators.required],
    segundoApellido: [''],
    curp: ['', [Validators.required, Validators.pattern(CURP_PATTERN)]],
    correoInstitucional: ['', [Validators.required, Validators.email]],
  });

  readonly addForm = this.fb.nonNullable.group({
    nombres: ['', Validators.required],
    primerApellido: ['', Validators.required],
    segundoApellido: [''],
    curp: ['', [Validators.required, Validators.pattern(CURP_PATTERN)]],
    correoInstitucional: ['', [Validators.required, Validators.email]],
  });

  fullName(student: Student): string {
    return fullName(student);
  }

  search(): void {
    this.filterQ.set(this.filterDraft());
  }

  clearFilter(): void {
    this.filterDraft.set('');
    this.filterQ.set('');
  }

  startEdit(student: Student): void {
    this.editingId.set(student.id);
    this.showAddForm.set(false);
    this.editForm.setValue({
      nombres: student.nombres,
      primerApellido: student.primerApellido,
      segundoApellido: student.segundoApellido ?? '',
      curp: student.curp,
      correoInstitucional: student.correoInstitucional,
    });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.studentsService.update(id, {
      nombres: v.nombres,
      primerApellido: v.primerApellido,
      segundoApellido: v.segundoApellido || undefined,
      curp: v.curp,
      correoInstitucional: v.correoInstitucional,
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
    this.studentsService.add({
      nombres: v.nombres,
      primerApellido: v.primerApellido,
      segundoApellido: v.segundoApellido || undefined,
      curp: v.curp,
      correoInstitucional: v.correoInstitucional,
    }).subscribe();
    this.addForm.reset();
    this.showAddForm.set(false);
  }

  delete(id: number): void {
    this.confirm.confirm('¿Eliminar este alumno?').subscribe((ok) => {
      if (ok) this.studentsService.delete(id).subscribe();
    });
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    if (!this.showAddForm()) this.addForm.reset();
  }
}
