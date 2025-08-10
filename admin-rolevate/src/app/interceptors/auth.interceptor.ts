import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Clone the request and add withCredentials: true if not already set
  const authReq = req.clone({
    setHeaders: {},
    // Ensure credentials are sent with every request
    ...(!req.headers.has('skip-auth') && { 
      setHeaders: {}, 
      withCredentials: true 
    })
  });

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.log('401 Unauthorized - redirecting to login');
        // Token is invalid or expired
        authService.logout().subscribe(() => {
          router.navigate(['/login']);
        });
      }
      return throwError(() => error);
    })
  );
};
