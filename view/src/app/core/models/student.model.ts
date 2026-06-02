export interface Student {
  id: number;
  nombres: string;
  primerApellido: string;
  segundoApellido?: string;
  curp: string;
  correoInstitucional: string;
}

export function fullName(student: Student): string {
  return `${student.nombres} ${student.primerApellido}${student.segundoApellido ? ' ' + student.segundoApellido : ''}`;
}
