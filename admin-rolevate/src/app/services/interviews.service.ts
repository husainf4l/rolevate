import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InterviewDetails, InterviewsResponse, InterviewsFilters, InterviewStatistics } from '../interfaces/interviews.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InterviewsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin`;

  // Signals for state management
  interviews = signal<InterviewDetails[]>([]);
  pagination = signal<any>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  statistics = signal<InterviewStatistics | null>(null);

  getInterviews(filters: InterviewsFilters = {}): Observable<InterviewsResponse> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this.http.get<InterviewsResponse>(`${this.baseUrl}/interviews`, { 
      params,
      withCredentials: true 
    });
  }

  loadInterviews(filters: InterviewsFilters = {}) {
    this.getInterviews(filters).subscribe({
      next: (response) => {
        this.interviews.set(response.interviews);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load interviews');
        this.loading.set(false);
        console.error('Error loading interviews:', error);
      }
    });
  }

  getInterviewById(id: string): Observable<InterviewDetails> {
    return this.http.get<InterviewDetails>(`${this.baseUrl}/interviews/${id}`, {
      withCredentials: true
    });
  }

  getInterviewStatistics(): Observable<InterviewStatistics> {
    return this.http.get<InterviewStatistics>(`${this.baseUrl}/statistics/interviews`, {
      withCredentials: true
    });
  }

  loadStatistics() {
    this.getInterviewStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: (error) => {
        console.error('Error loading interview statistics:', error);
      }
    });
  }

  updateInterviewStatus(id: string, status: string): Observable<InterviewDetails> {
    return this.http.patch<InterviewDetails>(`${this.baseUrl}/interviews/${id}`, 
      { status }, 
      { withCredentials: true }
    );
  }

  cancelInterview(id: string): Observable<InterviewDetails> {
    return this.updateInterviewStatus(id, 'CANCELLED');
  }
}
