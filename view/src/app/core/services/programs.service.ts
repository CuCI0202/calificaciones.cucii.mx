import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Program } from '../models/program.model';
import { Subject } from '../models/subject.model';

const MOCK_PROGRAMS: Program[] = [
  {
    id: 1,
    name: 'Ingeniería en Sistemas Computacionales',
    degree: 'Licenciatura',
    rvoe: 'RVOE-ISC-2020',
    rvoeDate: '2020-09-01',
    terms: 10,
    subjects: [
      { id: 101, code: 'MAT-101', name: 'Matemáticas I', term: 1 },
      { id: 102, code: 'MAT-102', name: 'Comunicación Oral y Escrita', term: 1 },
      { id: 103, code: 'MAT-103', name: 'Introducción a la Programación', term: 2 },
      { id: 104, code: 'MAT-104', name: 'Matemáticas II', term: 2 },
      { id: 105, code: 'MAT-105', name: 'Programación Orientada a Objetos', term: 3 },
      { id: 106, code: 'MAT-106', name: 'Base de Datos I', term: 3 },
      { id: 107, code: 'MAT-107', name: 'Estructuras de Datos', term: 4 },
      { id: 108, code: 'MAT-108', name: 'Desarrollo Web I', term: 4 },
    ],
  },
  {
    id: 2,
    name: 'Administración de Empresas',
    degree: 'Licenciatura',
    rvoe: 'RVOE-ADE-2019',
    rvoeDate: '2019-01-15',
    terms: 9,
    subjects: [
      { id: 201, code: 'ADE-201', name: 'Fundamentos de Administración', term: 1 },
      { id: 202, code: 'ADE-202', name: 'Contabilidad General', term: 1 },
      { id: 203, code: 'ADE-203', name: 'Mercadotecnia I', term: 2 },
      { id: 204, code: 'ADE-204', name: 'Recursos Humanos', term: 2 },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class ProgramsService {
  private readonly _programs = signal<Program[]>(MOCK_PROGRAMS);
  readonly programs = this._programs.asReadonly();

  getAll(): Observable<Program[]> {
    return of(this._programs());
  }

  getById(id: number): Observable<Program | undefined> {
    return of(this._programs().find((p) => p.id === id));
  }

  add(program: Omit<Program, 'id' | 'subjects'>): Observable<Program> {
    const created: Program = { ...program, id: Date.now(), subjects: [] };
    this._programs.update((list) => [...list, created]);
    return of(created);
  }

  update(id: number, changes: Partial<Omit<Program, 'id' | 'subjects'>>): Observable<Program | null> {
    let updated: Program | null = null;
    this._programs.update((list) =>
      list.map((p) => {
        if (p.id === id) {
          updated = { ...p, ...changes };
          return updated;
        }
        return p;
      })
    );
    return of(updated);
  }

  delete(id: number): Observable<void> {
    this._programs.update((list) => list.filter((p) => p.id !== id));
    return of(void 0);
  }

  // ── Subject sub-CRUD ──────────────────────────────────────────────────────

  getSubjectsByProgram(programId: number): Observable<Subject[]> {
    const program = this._programs().find((p) => p.id === programId);
    return of(program?.subjects ?? []);
  }

  addSubject(programId: number, subject: Omit<Subject, 'id'>): Observable<Subject | null> {
    const created: Subject = { ...subject, id: Date.now() };
    let result: Subject | null = null;
    this._programs.update((list) =>
      list.map((p) => {
        if (p.id === programId) {
          result = created;
          return { ...p, subjects: [...p.subjects, created] };
        }
        return p;
      })
    );
    return of(result);
  }

  updateSubject(programId: number, subjectId: number, changes: Omit<Subject, 'id'>): Observable<Subject | null> {
    let updated: Subject | null = null;
    this._programs.update((list) =>
      list.map((p) => {
        if (p.id !== programId) return p;
        return {
          ...p,
          subjects: p.subjects.map((s) => {
            if (s.id === subjectId) {
              updated = { ...s, ...changes };
              return updated;
            }
            return s;
          }),
        };
      })
    );
    return of(updated);
  }

  deleteSubject(programId: number, subjectId: number): Observable<void> {
    this._programs.update((list) =>
      list.map((p) => {
        if (p.id !== programId) return p;
        return { ...p, subjects: p.subjects.filter((s) => s.id !== subjectId) };
      })
    );
    return of(void 0);
  }
}
