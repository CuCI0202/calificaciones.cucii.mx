import { Component, computed, inject, signal } from '@angular/core';
import { GradesService } from '../../core/services/grades.service';
import { StudentsService } from '../../core/services/students.service';
import { Student, fullName } from '../../core/models/student.model';
import { Subject } from '../../core/models/subject.model';

const TERMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface DetailRow {
  subject: Subject;
  score: number | null;
}

@Component({
  selector: 'app-browse',
  imports: [],
  templateUrl: './browse.html',
})
export class Browse {
  private readonly gradesService = inject(GradesService);
  private readonly studentsService = inject(StudentsService);

  readonly terms = TERMS;

  // ── List view ─────────────────────────────────────────────────────────────
  readonly filterCurpDraft = signal('');
  readonly filterNameDraft = signal('');
  readonly filterCurp = signal('');
  readonly filterName = signal('');

  readonly filteredStudents = computed<Student[]>(() => {
    let list = this.studentsService.students();

    const curp = this.filterCurp().trim().toUpperCase();
    if (curp) list = list.filter((s) => s.curp.includes(curp));

    const name = this.filterName().trim().toUpperCase();
    if (name) list = list.filter((s) => fullName(s).toUpperCase().includes(name));

    return list;
  });

  readonly hasFilters = computed(() =>
    !!(this.filterCurpDraft() || this.filterNameDraft() || this.filterCurp() || this.filterName())
  );

  search(): void {
    this.filterCurp.set(this.filterCurpDraft());
    this.filterName.set(this.filterNameDraft());
  }

  clearFilters(): void {
    this.filterCurpDraft.set('');
    this.filterNameDraft.set('');
    this.filterCurp.set('');
    this.filterName.set('');
  }

  fullName(student: Student): string {
    return fullName(student);
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  readonly selectedStudent = signal<Student | null>(null);

  readonly detailRows = computed<{ term: number; rows: DetailRow[] }[]>(() => {
    const student = this.selectedStudent();
    if (!student) return [];
    return TERMS.map((term) => ({ term, rows: [] }));
  });

  selectStudent(student: Student): void {
    this.selectedStudent.set(student);
  }

  backToList(): void {
    this.selectedStudent.set(null);
  }

  getGradeClass(score: number): string {
    if (score >= 90) return 'text-green-700 font-semibold';
    if (score >= 70) return 'text-yellow-700 font-semibold';
    return 'text-red-700 font-semibold';
  }
}
