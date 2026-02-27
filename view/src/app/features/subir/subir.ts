import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CalificacionesService } from '../../core/services/calificaciones.service';
import { AlumnosService } from '../../core/services/alumnos.service';
import { CarrerasService } from '../../core/services/carreras.service';
import { Calificacion } from '../../core/models/calificacion.model';
import { Alumno } from '../../core/models/alumno.model';
import { Materia } from '../../core/models/materia.model';

const CUATRIMESTRES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface CsvRow {
  alumnoCurp: string;
  materiaId: number;
  cuatrimestre: number;
  calificacion: number;
  error?: string;
}

@Component({
  selector: 'app-subir',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './subir.html',
})
export class Subir {
  private readonly calificacionesService = inject(CalificacionesService);
  private readonly alumnosService = inject(AlumnosService);
  private readonly carrerasService = inject(CarrerasService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly cuatrimestres = CUATRIMESTRES;
  readonly activeTab = signal<'manual' | 'csv'>('manual');

  // ── Búsqueda de alumno ───────────────────────────────────────────────────
  readonly searchCurp = signal('');
  readonly foundAlumno = signal<Alumno | null>(null);
  readonly searchError = signal('');

  readonly materiasDeAlumno = computed<Materia[]>(() => {
    const alumno = this.foundAlumno();
    if (!alumno) return [];
    const carrera = this.carrerasService.carreras().find((c) => c.id === alumno.carreraId);
    return carrera?.materias ?? [];
  });

  buscarAlumno(): void {
    const curp = this.searchCurp().trim().toUpperCase();
    if (!curp) return;
    const alumno = this.alumnosService.alumnos().find((a) => a.curp === curp);
    if (alumno) {
      this.foundAlumno.set(alumno);
      this.searchError.set('');
      this.form.controls.materiaId.setValue('');
    } else {
      this.foundAlumno.set(null);
      this.searchError.set('No se encontró ningún alumno con esa CURP.');
    }
  }

  // ── Manual form ──────────────────────────────────────────────────────────
  readonly form = this.fb.nonNullable.group({
    cuatrimestre: [0, [Validators.required, Validators.min(1)]],
    materiaId: ['', Validators.required],
    calificacion: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  readonly successMsg = signal('');
  readonly errorMsg = signal('');

  submitManual(): void {
    if (this.form.invalid || !this.foundAlumno()) {
      this.form.markAllAsTouched();
      if (!this.foundAlumno()) this.searchError.set('Busca un alumno antes de registrar.');
      return;
    }

    const v = this.form.getRawValue();
    const alumno = this.foundAlumno()!;
    const materiaIdNum = +v.materiaId;
    const materia = this.materiasDeAlumno().find((m) => m.id === materiaIdNum)!;

    const nuevaCal: Omit<Calificacion, 'id'> = {
      alumnoId: alumno.id,
      alumnoNombre: alumno.nombre,
      alumnoCurp: alumno.curp,
      materiaId: materiaIdNum,
      materiaNombre: materia.nombre,
      cuatrimestre: +v.cuatrimestre,
      calificacion: +v.calificacion,
    };

    this.calificacionesService.addCalificacion(nuevaCal).subscribe(() => {
      this.successMsg.set('Calificación registrada correctamente.');
      this.errorMsg.set('');
      this.form.reset({ cuatrimestre: 0, calificacion: 0 });
      this.foundAlumno.set(null);
      this.searchCurp.set('');
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

    const alumnos = this.alumnosService.alumnos();
    const startIdx = lines[0].toLowerCase().startsWith('alumno_curp') ? 1 : 0;
    const rows: CsvRow[] = [];

    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      if (cols.length < 4) {
        rows.push({ alumnoCurp: '', materiaId: 0, cuatrimestre: 0, calificacion: 0, error: 'Columnas insuficientes' });
        continue;
      }

      const [alumnoCurp, materiaIdStr, cuatrimestre, calificacion] = cols;
      const materiaIdNum = parseInt(materiaIdStr, 10);
      const calNum = parseFloat(calificacion);
      const cuatriNum = parseInt(cuatrimestre, 10);

      let error: string | undefined;
      if (!alumnoCurp || alumnoCurp.length !== 18) error = 'CURP inválida';
      else if (!alumnos.find((a) => a.curp === alumnoCurp.toUpperCase())) error = 'CURP no registrada';
      else if (isNaN(materiaIdNum) || materiaIdNum <= 0) error = 'ID de materia inválido';
      else if (isNaN(cuatriNum) || cuatriNum < 1) error = 'Cuatrimestre inválido';
      else if (isNaN(calNum) || calNum < 0 || calNum > 100) error = 'Calificación inválida';

      rows.push({ alumnoCurp: alumnoCurp.toUpperCase(), materiaId: materiaIdNum, cuatrimestre: cuatriNum, calificacion: calNum, error });
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

  confirmarCsv(): void {
    const validas = this.csvRowsValid;
    if (validas.length === 0) return;

    const alumnos = this.alumnosService.alumnos();
    const carreras = this.carrerasService.carreras();

    const cals: Omit<Calificacion, 'id'>[] = validas.map((r) => {
      const alumno = alumnos.find((a) => a.curp === r.alumnoCurp)!;
      const carrera = carreras.find((c) => c.id === alumno.carreraId);
      const materia = carrera?.materias.find((m) => m.id === r.materiaId);
      return {
        alumnoId: alumno.id,
        alumnoNombre: alumno.nombre,
        alumnoCurp: alumno.curp,
        materiaId: r.materiaId,
        materiaNombre: materia?.nombre ?? String(r.materiaId),
        cuatrimestre: r.cuatrimestre,
        calificacion: r.calificacion,
      };
    });

    this.calificacionesService.addMany(cals).subscribe(() => {
      this.csvSuccess.set(`${cals.length} calificaciones importadas correctamente.`);
      this.csvRows.set([]);
      this.csvLoaded.set(false);
      setTimeout(() => this.router.navigate(['/consultar']), 1500);
    });
  }

  cancelarCsv(): void {
    this.csvRows.set([]);
    this.csvLoaded.set(false);
    this.csvError.set('');
  }
}
