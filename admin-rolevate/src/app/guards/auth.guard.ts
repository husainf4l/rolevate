import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, catchError, of, interval, filter, take, switchMap } from 'rxjs';
import { AuthService } from '../services/auth';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated locally, allow access immediately
  if (authService.isAuthenticated()) {
    return true;
  }

  // If auth is currently loading (initial check in progress), wait for it
  if (authService.isAuthLoading()) {
    // Poll the auth state until loading is complete
    return interval(50).pipe(
      map(() => authService.state()),
      filter(state => !state.loading), // Wait until loading is complete
      take(1), // Take only the first emission after loading completes
      map(state => {
        if (state.isAuthenticated) {
          return true;
        } else {
          router.navigate(['/login']);
          return false;
        }
      })
    );
  }

  // If not authenticated and not loading, check with backend
  return authService.checkAuthStatus().pipe(
    map(user => {
      if (user) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
