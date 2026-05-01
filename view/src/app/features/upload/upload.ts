import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GradesService } from '../../core/services/grades.service';
import { StudentsService } from '../../core/services/students.service';
import { ProgramsService } from '../../core/services/programs.service';
import { GroupsService } from '../../core/services/groups.service';
import { Grade } from '../../core/models/grade.model';
import { Student } from '../../core/models/student.model';
import { Subject } from '../../core/models/subject.model';

const TERMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface CsvRow {
  studentCurp: string;
  subjectId: number;
  term: number;
  score: number;
  error?: string;
}

@Component({
  selector: 'app-upload',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './upload.html',
})
export class Upload {
  private readonly gradesService = inject(GradesService);
  private readonly studentsService = inject(StudentsService);
  private readonly programsService = inject(ProgramsService);
  private readonly groupsService = inject(GroupsService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly terms = TERMS;
  readonly activeTab = signal<'manual' | 'csv'>('manual');

  // ── Student search ────────────────────────────────────────────────────────
  readonly searchQuery = signal('');
  readonly foundStudent = signal<Student | null>(null);
  readonly searchError = signal('');
  readonly showModal = signal(false);
  readonly searchResults = signal<Student[]>([]);

  readonly studentSubjects = computed<Subject[]>(() => {
    const student = this.foundStudent();
    if (!student) return [];
    const program = this.programsService.programs().find((p) => p.id === student.programId);
    return program?.subjects ?? [];
  });

  searchStudent(): void {
    const query = this.searchQuery().trim();
    if (!query) return;
    const queryUpper = query.toUpperCase();
    const queryLower = query.toLowerCase();
    const results = this.studentsService.students().filter(
      (s) => s.curp === queryUpper || s.name.toLowerCase().includes(queryLower),
    );
    this.searchResults.set(results);
    this.showModal.set(true);
    this.searchError.set('');
  }

  selectStudent(student: Student): void {
    this.foundStudent.set(student);
    this.showModal.set(false);
    this.searchError.set('');
    this.form.controls.subjectId.setValue('');
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  groupName(groupId: number): string {
    return this.groupsService.groups().find((g) => g.id === groupId)?.name ?? '—';
  }

  // ── Manual form ──────────────────────────────────────────────────────────
  readonly form = this.fb.nonNullable.group({
    term: [0, [Validators.required, Validators.min(1)]],
    subjectId: ['', Validators.required],
    score: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  readonly successMsg = signal('');
  readonly errorMsg = signal('');

  submitManual(): void {
    if (this.form.invalid || !this.foundStudent()) {
      this.form.markAllAsTouched();
      if (!this.foundStudent()) this.searchError.set('Busca un alumno antes de registrar.');
      return;
    }

    const v = this.form.getRawValue();
    const student = this.foundStudent()!;
    const subjectIdNum = +v.subjectId;
    const subject = this.studentSubjects().find((s) => s.id === subjectIdNum)!;

    const newGrade: Omit<Grade, 'id'> = {
      studentId: student.id,
      studentName: student.name,
      studentCurp: student.curp,
      subjectId: subjectIdNum,
      subjectName: subject.name,
      term: +v.term,
      score: +v.score,
    };

    this.gradesService.addGrade(newGrade).subscribe(() => {
      this.successMsg.set('Calificación registrada correctamente.');
      this.errorMsg.set('');
      this.form.reset({ term: 0, score: 0 });
      this.foundStudent.set(null);
      this.searchQuery.set('');
      this.searchError.set('');
      setTimeout(() => this.successMsg.set(''), 3000);
    });
  }

  // ── CSV import ────────────────────────────────────────────────────────────
  readonly csvRows = signal<CsvRow[]>([]);
  readonly csvError = signal('');
  readonly csvLoaded = signal(false);
  readonly csvSuccess = signal('');

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? '';
      this.parseCsv(text);
    };
    reader.readAsText(file);
  }

  private parseCsv(text: string): void {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      this.csvError.set('El archivo está vacío.');
      return;
    }

    const students = this.studentsService.students();
    const startIdx = lines[0].toLowerCase().startsWith('alumno_curp') ? 1 : 0;
    const rows: CsvRow[] = [];

    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      if (cols.length < 4) {
        rows.push({ studentCurp: '', subjectId: 0, term: 0, score: 0, error: 'Columnas insuficientes' });
        continue;
      }

      const [studentCurp, subjectIdStr, termStr, scoreStr] = cols;
      const subjectIdNum = parseInt(subjectIdStr, 10);
      const scoreNum = parseFloat(scoreStr);
      const termNum = parseInt(termStr, 10);

      let error: string | undefined;
      if (!studentCurp || studentCurp.length !== 18) error = 'CURP inválida';
      else if (!students.find((s) => s.curp === studentCurp.toUpperCase())) error = 'CURP no registrada';
      else if (isNaN(subjectIdNum) || subjectIdNum <= 0) error = 'ID de materia inválido';
      else if (isNaN(termNum) || termNum < 1) error = 'Cuatrimestre inválido';
      else if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) error = 'Calificación inválida';

      rows.push({ studentCurp: studentCurp.toUpperCase(), subjectId: subjectIdNum, term: termNum, score: scoreNum, error });
    }

    this.csvRows.set(rows);
    this.csvLoaded.set(true);
    this.csvError.set('');
  }

  get csvRowsValid(): CsvRow[] {
    return this.csvRows().filter((r) => !r.error);
  }

  get csvRowsInvalid(): CsvRow[] {
    return this.csvRows().filter((r) => !!r.error);
  }

  confirmCsv(): void {
    const valid = this.csvRowsValid;
    if (valid.length === 0) return;

    const students = this.studentsService.students();
    const programs = this.programsService.programs();

    const grades: Omit<Grade, 'id'>[] = valid.map((r) => {
      const student = students.find((s) => s.curp === r.studentCurp)!;
      const program = programs.find((p) => p.id === student.programId);
      const subject = program?.subjects.find((s) => s.id === r.subjectId);
      return {
        studentId: student.id,
        studentName: student.name,
        studentCurp: student.curp,
        subjectId: r.subjectId,
        subjectName: subject?.name ?? String(r.subjectId),
        term: r.term,
        score: r.score,
      };
    });

    this.gradesService.addMany(grades).subscribe(() => {
      this.csvSuccess.set(`${grades.length} calificaciones importadas correctamente.`);
      this.csvRows.set([]);
      this.csvLoaded.set(false);
      setTimeout(() => this.router.navigate(['/browse']), 1500);
    });
  }

  cancelCsv(): void {
    this.csvRows.set([]);
    this.csvLoaded.set(false);
    this.csvError.set('');
  }
}
