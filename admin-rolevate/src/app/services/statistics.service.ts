import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { InterviewStatistics } from '../interfaces/statistics.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/statistics`;

  getInterviewStatistics(): Observable<InterviewStatistics> {
    console.log('Requesting interview statistics from:', `${this.apiUrl}/interviews`);
    
    return this.http.get<InterviewStatistics>(`${this.apiUrl}/interviews`, {
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('Statistics response received:', response);
      }),
      catchError(error => {
        console.error('Statistics request failed:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        if (error.status === 401) {
          console.error('Authentication failed - user may need to login');
        }
        
        return throwError(() => error);
      })
    );
  }
}
