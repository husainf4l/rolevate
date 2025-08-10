import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
    title: 'Login - Admin Dashboard'
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
        title: 'Dashboard - Admin'
      },
      {
        path: 'companies',
        loadComponent: () => import('./pages/companies/companies').then(m => m.CompaniesComponent),
        title: 'Companies - Admin'
      },
      {
        path: 'candidates',
        loadComponent: () => import('./pages/candidates/candidates').then(m => m.CandidatesComponent),
        title: 'Candidates - Admin'
      },
      {
        path: 'candidates/:id',
        loadComponent: () => import('./pages/candidates/candidate-detail/candidate-detail').then(m => m.CandidateDetailComponent),
        title: 'Candidate Details - Admin'
      },
      {
        path: 'interviews',
        loadComponent: () => import('./pages/interviews/interviews').then(m => m.InterviewsComponent),
        title: 'Interviews - Admin'
      },
      {
        path: 'interviews/:id',
        loadComponent: () => import('./pages/interviews/interview-detail/interview-detail').then(m => m.InterviewDetailComponent),
        title: 'Interview Details - Admin'
      },
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
