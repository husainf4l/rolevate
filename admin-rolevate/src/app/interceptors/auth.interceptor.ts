import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Only add credentials for same-origin API calls
  const isApi = req.url.startsWith('/api');
  const authReq = isApi
    ? req.clone({ withCredentials: true })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 && isApi) {
        // Token invalid/expired: logout and redirect
        authService.logout().subscribe(() => {
          router.navigate(['/login']);
        });
      }
      return throwError(() => error);
    })
  );
};
