import { Component, computed, inject, signal } from '@angular/core';
import { CalificacionesService } from '../../core/services/calificaciones.service';
import { CarrerasService } from '../../core/services/carreras.service';
import { GruposService } from '../../core/services/grupos.service';
import { AlumnosService } from '../../core/services/alumnos.service';
import { Alumno } from '../../core/models/alumno.model';
import { Materia } from '../../core/models/materia.model';

const CUATRIMESTRES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface FilaDetalle {
  materia: Materia;
  calificacion: number | null;
}

@Component({
  selector: 'app-consultar',
  imports: [],
  templateUrl: './consultar.html',
})
export class Consultar {
  private readonly calificacionesService = inject(CalificacionesService);
  private readonly alumnosService = inject(AlumnosService);
  private readonly carrerasService = inject(CarrerasService);
  private readonly gruposService = inject(GruposService);

  readonly carreras = this.carrerasService.carreras;
  readonly grupos = this.gruposService.grupos;
  readonly cuatrimestres = CUATRIMESTRES;

  // ── Vista lista ────────────────────────────────────────────────────────────
  readonly filterCurp    = signal('');
  readonly filterNombre  = signal('');
  // Stored as string from select; empty string means "no filter"
  readonly filterCarrera = signal('');
  readonly filterGrupo   = signal('');

  readonly gruposFiltrados = computed(() => {
    const carreraId = this.filterCarrera();
    if (!carreraId) return this.grupos();
    return this.grupos().filter((g) => g.carreraId === +carreraId);
  });

  readonly alumnosFiltrados = computed<Alumno[]>(() => {
    let list = this.alumnosService.alumnos();

    const curp = this.filterCurp().trim().toUpperCase();
    if (curp) list = list.filter((a) => a.curp.includes(curp));

    const nombre = this.filterNombre().trim().toUpperCase();
    if (nombre) list = list.filter((a) => a.nombre.toUpperCase().includes(nombre));

    const carreraId = this.filterCarrera();
    if (carreraId) list = list.filter((a) => a.carreraId === +carreraId);

    const grupoId = this.filterGrupo();
    if (grupoId) list = list.filter((a) => a.grupoId === +grupoId);

    return list;
  });

  readonly hayFiltros = computed(() =>
    !!(this.filterCurp() || this.filterNombre() || this.filterCarrera() || this.filterGrupo())
  );

  limpiarFiltros(): void {
    this.filterCurp.set('');
    this.filterNombre.set('');
    this.filterCarrera.set('');
    this.filterGrupo.set('');
  }

  getNombreCarrera(id: number): string {
    return this.carreras().find((c) => c.id === id)?.nombre ?? '—';
  }

  getNombreGrupo(id: number): string {
    const g = this.grupos().find((g) => g.id === id);
    return g ? `${g.clave} — ${g.nombre}` : '—';
  }

  // ── Vista detalle ─────────────────────────────────────────────────────────
  readonly alumnoSeleccionado = signal<Alumno | null>(null);

  readonly detalleFilas = computed<{ cuatrimestre: number; filas: FilaDetalle[] }[]>(() => {
    const alumno = this.alumnoSeleccionado();
    if (!alumno) return [];

    const carrera = this.carreras().find((c) => c.id === alumno.carreraId);
    if (!carrera) return [];

    const calificaciones = this.calificacionesService.calificaciones()
      .filter((c) => c.alumnoId === alumno.id);

    return CUATRIMESTRES.map((cuatri) => ({
      cuatrimestre: cuatri,
      filas: carrera.materias.map((materia) => {
        const cal = calificaciones.find(
          (c) => c.materiaId === materia.id && c.cuatrimestre === cuatri
        );
        return { materia, calificacion: cal?.calificacion ?? null };
      }),
    }));
  });

  seleccionarAlumno(alumno: Alumno): void {
    this.alumnoSeleccionado.set(alumno);
  }

  volverALista(): void {
    this.alumnoSeleccionado.set(null);
  }

  getCalificacionClass(cal: number): string {
    if (cal >= 90) return 'text-green-700 font-semibold';
    if (cal >= 70) return 'text-yellow-700 font-semibold';
    return 'text-red-700 font-semibold';
  }
}
