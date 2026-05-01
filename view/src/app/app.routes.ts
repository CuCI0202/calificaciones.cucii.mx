import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'browse',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'browse',
    canActivate: [authGuard],
    loadComponent: () => import('./features/browse/browse').then((m) => m.Browse),
  },
  {
    path: 'upload',
    canActivate: [authGuard],
    loadComponent: () => import('./features/upload/upload').then((m) => m.Upload),
  },
  {
    path: 'students',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/students/students').then((m) => m.Students),
  },
  {
    path: 'groups',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/groups/groups').then((m) => m.Groups),
  },
  {
    path: 'programs',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/programs/programs').then((m) => m.Programs),
  },
  {
    path: 'subjects',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/subjects/subjects').then((m) => m.Subjects),
  },
  {
    path: 'campuses',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/campuses/campuses').then((m) => m.Campuses),
  },
  {
    path: 'users',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/users/users').then((m) => m.Users),
  },
  {
    path: '**',
    redirectTo: 'browse',
  },
];
