import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Student, fullName } from '../models/student.model';

const MOCK_STUDENTS: Student[] = [
  {
    id: 1,
    nombres: 'Marco Antonio',
    primerApellido: 'García',
    segundoApellido: 'Martínez',
    curp: 'GAMA990101HDFRCR01',
    correoInstitucional: 'marco.garcia@cucii.edu.mx',
  },
  {
    id: 2,
    nombres: 'Brenda',
    primerApellido: 'López',
    segundoApellido: 'Pérez',
    curp: 'LOPB010315MDFPZN02',
    correoInstitucional: 'brenda.lopez@cucii.edu.mx',
  },
  {
    id: 3,
    nombres: 'Carlos Eduardo',
    primerApellido: 'Ramírez',
    segundoApellido: 'Torres',
    curp: 'RATC020508HDFMRR03',
    correoInstitucional: 'carlos.ramirez@cucii.edu.mx',
  },
  {
    id: 4,
    nombres: 'Daniela',
    primerApellido: 'Hernández',
    segundoApellido: 'Cruz',
    curp: 'HECD030720MDFRRN04',
    correoInstitucional: 'daniela.hernandez@cucii.edu.mx',
  },
  {
    id: 5,
    nombres: 'Fernando',
    primerApellido: 'Morales',
    segundoApellido: 'Vega',
    curp: 'MOVF001112HDFRGR05',
    correoInstitucional: 'fernando.morales@cucii.edu.mx',
  },
  {
    id: 6,
    nombres: 'Gabriela',
    primerApellido: 'Sánchez',
    segundoApellido: 'Ríos',
    curp: 'SARG040225MDFNRB06',
    correoInstitucional: 'gabriela.sanchez@cucii.edu.mx',
  },
  {
    id: 7,
    nombres: 'Héctor',
    primerApellido: 'Flores',
    segundoApellido: 'Mendoza',
    curp: 'FOMH011030HDFLDN07',
    correoInstitucional: 'hector.flores@cucii.edu.mx',
  },
  {
    id: 8,
    nombres: 'Itzel',
    primerApellido: 'Díaz',
    segundoApellido: 'Gutiérrez',
    curp: 'DIGI030614MDFZTT08',
    correoInstitucional: 'itzel.diaz@cucii.edu.mx',
  },
  {
    id: 9,
    nombres: 'Jorge Luis',
    primerApellido: 'Castro',
    segundoApellido: 'Navarro',
    curp: 'CANJ020817HDFSTR09',
    correoInstitucional: 'jorge.castro@cucii.edu.mx',
  },
  {
    id: 10,
    nombres: 'Karen',
    primerApellido: 'Ortiz',
    segundoApellido: 'Reyes',
    curp: 'OIRK010422MDFRRR10',
    correoInstitucional: 'karen.ortiz@cucii.edu.mx',
  },
  {
    id: 11,
    nombres: 'Luis Miguel',
    primerApellido: 'Vargas',
    segundoApellido: 'Jiménez',
    curp: 'VAJL030305HDFRGS11',
    correoInstitucional: 'luis.vargas@cucii.edu.mx',
  },
  {
    id: 12,
    nombres: 'Mariana',
    primerApellido: 'Rojas',
    segundoApellido: 'Espinoza',
    curp: 'ROEM040918MDFSJR12',
    correoInstitucional: 'mariana.rojas@cucii.edu.mx',
  },
];

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private readonly _students = signal<Student[]>(MOCK_STUDENTS);
  readonly students = this._students.asReadonly();

  getAll(): Observable<Student[]> {
    return of(this._students());
  }

  getById(id: number): Observable<Student | undefined> {
    return of(this._students().find((s) => s.id === id));
  }

  getByCurp(curp: string): Observable<Student | undefined> {
    return of(this._students().find((s) => s.curp === curp.toUpperCase()));
  }

  add(student: Omit<Student, 'id'>): Observable<Student> {
    const created: Student = {
      ...student,
      id: Date.now(),
      curp: student.curp.toUpperCase(),
    };
    this._students.update((list) => [...list, created]);
    return of(created);
  }

  update(id: number, changes: Partial<Omit<Student, 'id'>>): Observable<Student | null> {
    let updated: Student | null = null;
    this._students.update((list) =>
      list.map((s) => {
        if (s.id === id) {
          updated = {
            ...s,
            ...changes,
            curp: changes.curp ? changes.curp.toUpperCase() : s.curp,
          };
          return updated;
        }
        return s;
      })
    );
    return of(updated);
  }

  delete(id: number): Observable<void> {
    this._students.update((list) => list.filter((s) => s.id !== id));
    return of(void 0);
  }

  fullName(student: Student): string {
    return fullName(student);
  }
}
