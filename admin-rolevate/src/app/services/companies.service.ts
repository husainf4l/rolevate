import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company, CompaniesResponse, CompaniesFilters } from '../interfaces/companies.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin`;

  // Signals for state management
  companies = signal<Company[]>([]);
  pagination = signal<any>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  getCompanies(filters: CompaniesFilters = {}): Observable<CompaniesResponse> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.industry) params = params.set('industry', filters.industry);
    if (filters.subscription) params = params.set('subscription', filters.subscription);
    if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this.http.get<CompaniesResponse>(`${this.baseUrl}/companies`, { 
      params,
      withCredentials: true 
    });
  }

  loadCompanies(filters: CompaniesFilters = {}) {
    this.getCompanies(filters).subscribe({
      next: (response) => {
        this.companies.set(response.companies);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load companies');
        this.loading.set(false);
        console.error('Error loading companies:', error);
      }
    });
  }

  getCompanyById(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/companies/${id}`, {
      withCredentials: true
    });
  }

  updateCompanyStatus(id: string, isActive: boolean): Observable<Company> {
    return this.http.patch<Company>(`${this.baseUrl}/companies/${id}`, 
      { isActive }, 
      { withCredentials: true }
    );
  }

  deleteCompany(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/companies/${id}`, {
      withCredentials: true
    });
  }
}
