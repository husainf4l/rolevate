import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, catchError, of, interval, filter, take } from 'rxjs';
import { AuthService } from '../services/auth';

export const loginGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated locally, redirect to dashboard
  if (authService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  // If auth is currently loading, wait for it to complete
  if (authService.isAuthLoading()) {
    return interval(50).pipe(
      map(() => authService.state()),
      filter(state => !state.loading),
      take(1),
      map(state => {
        if (state.isAuthenticated) {
          router.navigate(['/dashboard']);
          return false;
        } else {
          return true;
        }
      })
    );
  }

  // If not loading and not authenticated, allow access to login
  return true;
};
