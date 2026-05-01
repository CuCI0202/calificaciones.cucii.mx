import { Component, computed, inject, signal } from '@angular/core';
import { GradesService } from '../../core/services/grades.service';
import { ProgramsService } from '../../core/services/programs.service';
import { GroupsService } from '../../core/services/groups.service';
import { StudentsService } from '../../core/services/students.service';
import { Student } from '../../core/models/student.model';
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
  private readonly programsService = inject(ProgramsService);
  private readonly groupsService = inject(GroupsService);

  readonly programs = this.programsService.programs;
  readonly groups = this.groupsService.groups;
  readonly terms = TERMS;

  // ── List view ─────────────────────────────────────────────────────────────
  readonly filterCurpDraft   = signal('');
  readonly filterNameDraft   = signal('');
  // Committed — only updated when user presses Search
  readonly filterCurp    = signal('');
  readonly filterName    = signal('');
  // Stored as string from select; empty string means "no filter"
  readonly filterProgram = signal('');
  readonly filterGroup   = signal('');

  readonly filteredGroups = computed(() => {
    const programId = this.filterProgram();
    if (!programId) return this.groups();
    return this.groups().filter((g) => g.programId === +programId);
  });

  readonly filteredStudents = computed<Student[]>(() => {
    let list = this.studentsService.students();

    const curp = this.filterCurp().trim().toUpperCase();
    if (curp) list = list.filter((s) => s.curp.includes(curp));

    const name = this.filterName().trim().toUpperCase();
    if (name) list = list.filter((s) => s.name.toUpperCase().includes(name));

    const programId = this.filterProgram();
    if (programId) list = list.filter((s) => s.programId === +programId);

    const groupId = this.filterGroup();
    if (groupId) list = list.filter((s) => s.groupId === +groupId);

    return list;
  });

  readonly hasFilters = computed(() =>
    !!(this.filterCurpDraft() || this.filterNameDraft() || this.filterCurp() || this.filterName() || this.filterProgram() || this.filterGroup())
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
    this.filterProgram.set('');
    this.filterGroup.set('');
  }

  getProgramName(id: number): string {
    return this.programs().find((p) => p.id === id)?.name ?? '—';
  }

  getGroupName(id: number): string {
    const g = this.groups().find((g) => g.id === id);
    return g ? `${g.code} — ${g.name}` : '—';
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  readonly selectedStudent = signal<Student | null>(null);

  readonly detailRows = computed<{ term: number; rows: DetailRow[] }[]>(() => {
    const student = this.selectedStudent();
    if (!student) return [];

    const program = this.programs().find((p) => p.id === student.programId);
    if (!program) return [];

    const grades = this.gradesService.grades()
      .filter((g) => g.studentId === student.id);

    return TERMS.map((term) => ({
      term,
      rows: program.subjects.map((subject) => {
        const grade = grades.find(
          (g) => g.subjectId === subject.id && g.term === term
        );
        return { subject, score: grade?.score ?? null };
      }),
    }));
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
