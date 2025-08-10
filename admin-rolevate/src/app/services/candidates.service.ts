import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate, CandidatesResponse, CandidatesFilters } from '../interfaces/candidates.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CandidatesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin`;

  // Signals for state management
  candidates = signal<Candidate[]>([]);
  pagination = signal<CandidatesResponse['pagination'] | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  getCandidates(filters: CandidatesFilters = {}): Observable<CandidatesResponse> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.experienceLevel) params = params.set('experienceLevel', filters.experienceLevel);
    if (filters.preferredWorkType) params = params.set('preferredWorkType', filters.preferredWorkType);
    if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this.http.get<CandidatesResponse>(`${this.baseUrl}/candidates`, { 
      params,
      withCredentials: true 
    });
  }

  loadCandidates(filters: CandidatesFilters = {}) {
    this.getCandidates(filters).subscribe({
      next: (response) => {
        this.candidates.set(response.candidates);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load candidates');
        this.loading.set(false);
        console.error('Error loading candidates:', error);
      }
    });
  }

  getCandidateById(id: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.baseUrl}/candidates/${id}`, {
      withCredentials: true
    });
  }

  updateCandidateStatus(id: string, isActive: boolean): Observable<Candidate> {
    return this.http.patch<Candidate>(`${this.baseUrl}/candidates/${id}`, 
      { isActive }, 
      { withCredentials: true }
    );
  }

  deleteCandidate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/candidates/${id}`, {
      withCredentials: true
    });
  }
}
