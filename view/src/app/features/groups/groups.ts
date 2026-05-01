import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupsService } from '../../core/services/groups.service';
import { ProgramsService } from '../../core/services/programs.service';
import { CampusesService } from '../../core/services/campuses.service';
import { Group } from '../../core/models/group.model';

@Component({
  selector: 'app-groups',
  imports: [ReactiveFormsModule],
  templateUrl: './groups.html',
})
export class Groups {
  private readonly groupsService = inject(GroupsService);
  private readonly programsService = inject(ProgramsService);
  private readonly campusesService = inject(CampusesService);
  private readonly fb = inject(FormBuilder);

  readonly groups = this.groupsService.groups;
  readonly programs = this.programsService.programs;
  readonly campuses = this.campusesService.campuses;
  readonly filterDraft = signal('');
  readonly filterQ = signal('');
  readonly editingId = signal<number | null>(null);
  readonly showAddForm = signal(false);

  readonly filtered = computed(() => {
    const q = this.filterQ().trim().toUpperCase();
    if (!q) return this.groups();
    return this.groups().filter(
      (g) => g.code.toUpperCase().includes(q) || g.name.toUpperCase().includes(q)
    );
  });

  readonly editForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    programId: ['', Validators.required],
    campusId: ['', Validators.required],
  });

  readonly addForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    programId: ['', Validators.required],
    campusId: ['', Validators.required],
  });

  search(): void {
    this.filterQ.set(this.filterDraft());
  }

  clearFilter(): void {
    this.filterDraft.set('');
    this.filterQ.set('');
  }

  getProgramName(id: number): string {
    return this.programs().find((p) => p.id === id)?.name ?? String(id);
  }

  getCampusName(id: number): string {
    return this.campuses().find((c) => c.id === id)?.name ?? String(id);
  }

  startEdit(group: Group): void {
    this.editingId.set(group.id);
    this.showAddForm.set(false);
    this.editForm.setValue({
      code: group.code,
      name: group.name,
      programId: String(group.programId),
      campusId: String(group.campusId),
    });
  }

  saveEdit(id: number): void {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    this.groupsService.update(id, {
      code: v.code,
      name: v.name,
      programId: +v.programId,
      campusId: +v.campusId,
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
    this.groupsService.add({
      code: v.code,
      name: v.name,
      programId: +v.programId,
      campusId: +v.campusId,
    }).subscribe();
    this.addForm.reset();
    this.showAddForm.set(false);
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar este grupo?')) return;
    this.groupsService.delete(id).subscribe();
  }

  toggleAddForm(): void {
    this.showAddForm.update((v) => !v);
    this.editingId.set(null);
    if (!this.showAddForm()) this.addForm.reset();
  }
}
