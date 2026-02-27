import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'consultar',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'consultar',
    canActivate: [authGuard],
    loadComponent: () => import('./features/consultar/consultar').then((m) => m.Consultar),
  },
  {
    path: 'subir',
    canActivate: [authGuard],
    loadComponent: () => import('./features/subir/subir').then((m) => m.Subir),
  },
  {
    path: 'alumnos',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/alumnos/alumnos').then((m) => m.Alumnos),
  },
  {
    path: 'grupos',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/grupos/grupos').then((m) => m.Grupos),
  },
  {
    path: 'carreras',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/carreras/carreras').then((m) => m.Carreras),
  },
  {
    path: 'materias',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/materias/materias').then((m) => m.Materias),
  },
  {
    path: 'planteles',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/planteles/planteles').then((m) => m.Planteles),
  },
  {
    path: '**',
    redirectTo: 'consultar',
  },
];
