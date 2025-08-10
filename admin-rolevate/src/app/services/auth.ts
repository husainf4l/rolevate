import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { LoginRequest, LoginResponse, User, AuthState } from '../interfaces/auth.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  
  // Using Angular signals for reactive state management
  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  });

  // Expose readonly state
  readonly state = this.authState.asReadonly();

  constructor(private http: HttpClient) {
    // Check if user is already authenticated on service initialization
    this.initializeAuth();
  }

  /**
   * Initialize authentication state by checking with backend
   */
  private initializeAuth(): void {
    this.setLoading(true);
    this.checkAuthStatus().subscribe({
      complete: () => {
        // Authentication check completed (whether successful or not)
        // State is already updated in checkAuthStatus method
      }
    });
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials, {
      withCredentials: true, // Important: This ensures HTTP-only cookies are sent/received
      headers: {
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap(response => {
        if (response.message === "Login successful" && response.user) {
          this.setAuthenticatedUser(response.user);
        }
      }),
      catchError(this.handleError.bind(this)),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    this.setLoading(true);
    
    return this.http.post(`${this.API_URL}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.clearAuthState();
      }),
      catchError(this.handleError.bind(this)),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Check if user is authenticated (verify token with backend)
   */
  checkAuthStatus(): Observable<User | null> {
    this.setLoading(true);
    
    return this.http.get<User>(`${this.API_URL}/auth/me`, {
      withCredentials: true
    }).pipe(
      tap(user => {
        console.log('Auth check successful:', user);
        this.setAuthenticatedUser(user);
      }),
      catchError(error => {
        console.error('Auth check failed:', error);
        this.clearAuthState();
        return of(null);
      }),
      tap(() => this.setLoading(false))
    );
  }

  /**
   * Get current authentication status
   */
  isAuthenticated(): boolean {
    return this.authState().isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authState().user;
  }

  /**
   * Check if authentication is currently being verified
   */
  isAuthLoading(): boolean {
    return this.authState().loading;
  }

  /**
   * Get authentication error
   */
  getAuthError(): string | null {
    return this.authState().error;
  }

  /**
   * Set authenticated user state
   */
  private setAuthenticatedUser(user: User): void {
    this.authState.update(state => ({
      ...state,
      isAuthenticated: true,
      user,
      error: null
    }));
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    this.authState.update(state => ({
      ...state,
      isAuthenticated: false,
      user: null,
      error: null
    }));
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.authState.update(state => ({
      ...state,
      loading
    }));
  }

  /**
   * Set error state
   */
  private setError(error: string): void {
    this.authState.update(state => ({
      ...state,
      error,
      loading: false
    }));
  }

  /**
   * Clear error state
   */
  private clearError(): void {
    this.authState.update(state => ({
      ...state,
      error: null
    }));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }
    
    this.setError(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
