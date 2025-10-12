/**
 * 🔐 Authentication Service - BinFawzi Store
 * 
 * Central authentication manager that handles:
 * - User login/logout/signup
 * - Authentication state management (BehaviorSubject)
 * - Token storage coordination
 * - API integration with Fake Store API
 * 
 * Educational Focus: Demonstrates reactive state management and security patterns
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

// Import environment configuration
import { environment } from '../../../environment/environment';

// Import our models
import { AuthUser, LoginResponse, UserProfile } from '../models/auth-user.model';
import { LoginRequest } from '../models/login-request.model';
import { SignupRequest, SignupResponse } from '../models/signup-request.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /** 
   * 📡 REACTIVE AUTHENTICATION STATE
   * 
   * BehaviorSubject maintains current user state and notifies all subscribers
   * when authentication status changes (login/logout)
   */
  private readonly _currentUser$ = new BehaviorSubject<AuthUser | null>(null);
  
  /** 
   * 👤 Observable stream of current authenticated user
   * Components subscribe to this for reactive user data
   */
  public readonly currentUser$ = this._currentUser$.asObservable();
  
  /** 
   * 🔒 Observable stream of authentication status
   * Returns true if user is logged in, false otherwise
   */
  public readonly isAuthenticated$ = this.currentUser$.pipe(
    map(user => !!user)
  );

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    // Initialize auth state when service is created (app startup)
    this.initializeAuthState();
  }

  /**
   * 🚀 Initialize Authentication State
   * 
   * Called on app startup to check if user has a valid stored token
   * If token exists, attempts to restore user session
   */
  private initializeAuthState(): void {
    const token = this.tokenStorage.getToken();
    
    if (token) {
      // Token exists, try to restore user session
      // For demo purposes, we'll use a mock user profile
      // In real app, you'd validate token with backend
      this.restoreUserSession(token);
    } else {
      // No token, user is not logged in
      this._currentUser$.next(null);
    }
  }

  /**
   * 🔄 Restore User Session from Token
   * 
   * Attempts to recreate user session from stored token
   * In production, this would validate token with backend
   */
  private restoreUserSession(token: string): void {
    // For educational purposes, we'll create a mock user
    // In real app, you'd call GET /users/me or validate token endpoint
    
    const mockUser: AuthUser = {
      id: 1,
      username: 'restored_user',
      email: 'user@binfawzi.com',
      firstname: 'Restored',
      lastname: 'User',
      phone: '+1234567890',
      token: token,
      loginTimestamp: new Date()
    };

    this._currentUser$.next(mockUser);
  }

  /**
   * 🔑 User Login
   * 
   * Authenticates user credentials against Fake Store API
   * On success, stores token and updates authentication state
   * 
   * @param credentials - Username and password
   * @param rememberMe - Whether to persist session in localStorage
   * @returns Observable of login result
   */
  login(credentials: LoginRequest, rememberMe: boolean = false): Observable<AuthUser> {
    const loginUrl = `${environment.apiUrl}/auth/login`;

    return this.http.post<LoginResponse>(loginUrl, credentials).pipe(
      // Step 1: Login successful, we have JWT token
      tap(response => console.log('Login response:', response)),
      
      // Step 2: Store the token with chosen persistence
      tap(response => this.tokenStorage.setToken(response.token, rememberMe)),
      
      // Step 3: Create user profile (mock for educational purposes)
      // In real app, you'd call GET /users/me or decode JWT
      switchMap(response => this.createUserProfile(response.token, credentials.username)),
      
      // Step 4: Update authentication state
      tap(user => {
        this._currentUser$.next(user);
        console.log('User logged in:', user);
      }),
      
      // Step 5: Handle errors
      catchError(error => this.handleAuthError(error, 'Login failed'))
    );
  }

  /**
   * 📝 User Signup (Educational)
   * 
   * Creates new user account via Fake Store API
   * Note: This is educational only - API doesn't actually persist data
   * 
   * @param userData - New user information
   * @returns Observable of signup result
   */
  signup(userData: SignupRequest): Observable<SignupResponse> {
    const signupUrl = `${environment.apiUrl}/users`;

    return this.http.post<SignupResponse>(signupUrl, userData).pipe(
      tap(response => console.log('Signup response:', response)),
      catchError(error => this.handleAuthError(error, 'Signup failed'))
    );
  }

  /**
   * 🚪 User Logout
   * 
   * Clears authentication state and redirects to login page
   */
  logout(): void {
    // Clear stored token
    this.tokenStorage.clearToken();
    
    // Update authentication state
    this._currentUser$.next(null);
    
    // Redirect to login page
    this.router.navigate(['/auth/login']);
    
    console.log('User logged out');
  }

  /**
   * 👤 Create User Profile from Login
   * 
   * Creates AuthUser object after successful login
   * In production, this would fetch real profile data from API
   * 
   * @param token - JWT token from login
   * @param username - Username used for login
   * @returns Observable of complete user profile
   */
  private createUserProfile(token: string, username: string): Observable<AuthUser> {
    // For educational purposes, we'll create a mock profile
    // In real app, you'd call: GET /users/me or decode JWT token
    
    const mockProfile: AuthUser = {
      id: 1,
      username: username,
      email: `${username}@binfawzi.com`,
      firstname: 'Demo',
      lastname: 'User',
      phone: '+1234567890',
      token: token,
      loginTimestamp: new Date()
    };

    return of(mockProfile);
  }

  /**
   * ⚠️ Handle Authentication Errors
   * 
   * Processes API errors and returns user-friendly messages
   * 
   * @param error - HTTP error response
   * @param defaultMessage - Fallback error message
   * @returns Observable error with formatted message
   */
  private handleAuthError(error: HttpErrorResponse, defaultMessage: string): Observable<never> {
    let errorMessage = defaultMessage;

    if (error.error instanceof ErrorEvent) {
      // Client-side error (network issues, etc.)
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid username or password';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Service not found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        default:
          errorMessage = error.error?.message || defaultMessage;
      }
    }

    console.error('Auth error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // ===========================================
  // 🔍 HELPER METHODS (Synchronous Access)
  // ===========================================

  /**
   * 🔍 Quick Authentication Check
   * 
   * Synchronous method to check if user is currently logged in
   * Use this for simple conditional logic in components
   */
  isLoggedIn(): boolean {
    return !!this._currentUser$.value;
  }

  /**
   * 👤 Get Current User (Synchronous)
   * 
   * Returns current user data without subscribing
   * Useful for one-time checks or non-reactive operations
   */
  getCurrentUser(): AuthUser | null {
    return this._currentUser$.value;
  }

  /**
   * 🎫 Get Authentication Token (Synchronous)
   * 
   * Returns current JWT token for API calls
   * Used by AuthInterceptor to add Authorization header
   */
  getAuthToken(): string | null {
    return this.tokenStorage.getToken();
  }

  /**
   * 📊 Get User Display Name
   * 
   * Returns formatted name for UI display
   */
  getUserDisplayName(): string {
    const user = this.getCurrentUser();
    if (!user) return 'Guest';
    
    return `${user.firstname} ${user.lastname}`.trim() || user.username;
  }

  /**
   * ⏰ Get Session Info
   * 
   * Returns session information for debugging or UI display
   */
  getSessionInfo(): { isLoggedIn: boolean; username?: string; loginTime?: Date } {
    const user = this.getCurrentUser();
    
    return {
      isLoggedIn: this.isLoggedIn(),
      username: user?.username,
      loginTime: user?.loginTimestamp
    };
  }
}