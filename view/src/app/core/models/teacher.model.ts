export type UserRole = 'teacher' | 'admin';

export interface Teacher {
  id: number;
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}
