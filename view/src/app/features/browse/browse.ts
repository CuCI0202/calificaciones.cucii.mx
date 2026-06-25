import { Component, computed, inject, signal } from '@angular/core';
import { GradesService } from '../../core/services/grades.service';
import { StudentsService } from '../../core/services/students.service';
import { ProgramsService } from '../../core/services/programs.service';
import { GroupsService } from '../../core/services/groups.service';
import { GroupStudentsService } from '../../core/services/group-students.service';
import { Subject } from '../../core/models/program.model';
import { Student, fullName } from '../../core/models/student.model';

interface DetailRow {
  subjectId: number;
  subjectClave: string;
  subjectNombre: string;
  score: number | null;
}

interface TermBlock {
  term: number;
  rows: DetailRow[];
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
  private readonly groupStudentsService = inject(GroupStudentsService);

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

  readonly studentProgramSubjects = signal<Subject[]>([]);

  readonly detailRows = computed<TermBlock[]>(() => {
    const student = this.selectedStudent();
    if (!student) return [];

    const subjects = this.studentProgramSubjects();
    if (subjects.length === 0) return [];

    const grades = this.gradesService.grades().filter((g) => g.alumnoId === student.id);
    const maxTerm = Math.max(...subjects.map((s) => s.cuatrimestre), 0);

    return Array.from({ length: maxTerm }, (_, i) => {
      const term = i + 1;
      const termSubjects = subjects.filter((s) => s.cuatrimestre === term);
      const rows: DetailRow[] = termSubjects.map((sub) => {
        const grade = grades.find((g) => g.materiaId === sub.id);
        return {
          subjectId: sub.id,
          subjectClave: sub.clave,
          subjectNombre: sub.nombre,
          score: grade?.calificacion ?? null,
        };
      });
      return { term, rows };
    });
  });

  readonly unassignedSubjects = computed<DetailRow[]>(() => {
    const student = this.selectedStudent();
    if (!student) return [];
    const subjects = this.studentProgramSubjects();
    if (subjects.length === 0) return [];
    const grades = this.gradesService.grades().filter((g) => g.alumnoId === student.id);
    return subjects
      .filter((s) => !grades.find((g) => g.materiaId === s.id))
      .map((s) => ({
        subjectId: s.id,
        subjectClave: s.clave,
        subjectNombre: s.nombre,
        score: null,
      }));
  });

  selectStudent(student: Student): void {
    this.selectedStudent.set(student);
    this.studentProgramSubjects.set([]);

    const assignedIds = this.groupStudentsService.assignments()
      .filter((a) => a.studentId === student.id)
      .map((a) => a.groupId);

    const group = this.groupsService.groups().find((g) => assignedIds.includes(g.id));
    if (!group) return;

    this.programsService.getSubjectsByProgram(group.planEstudioId).subscribe({
      next: (subjects) => this.studentProgramSubjects.set(subjects),
    });
  }

  backToList(): void {
    this.selectedStudent.set(null);
    this.studentProgramSubjects.set([]);
  }

  getGradeClass(score: number): string {
    if (score >= 90) return 'text-green-700 font-semibold';
    if (score >= 70) return 'text-yellow-700 font-semibold';
    return 'text-red-700 font-semibold';
  }
}
