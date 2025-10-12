/**
 * 🔧 Authentication Interceptor - BinFawzi Store
 * 
 * Automatically attaches JWT tokens to outgoing HTTP requests.
 * Acts as middleware between your components and the API.
 * 
 * How it works:
 * 1. Component makes HTTP request (e.g., this.http.get('/products'))
 * 2. Interceptor catches the request before it leaves
 * 3. If JWT token exists, adds "Authorization: Bearer <token>" header
 * 4. Request continues to API with authentication
 * 
 * Educational Focus: Demonstrates HTTP interceptor pattern and automatic auth
 */

import { Injectable, inject, InjectionToken } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * 🎛️ Configuration Token for AuthInterceptor
 * 
 * Allows enabling/disabling the interceptor via app configuration.
 * Useful for testing or when you don't want automatic token injection.
 */
export const AUTH_INTERCEPTOR_ENABLED = new InjectionToken<boolean>('AUTH_INTERCEPTOR_ENABLED');

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  /** 💉 Inject AuthService to get current token */
  private authService = inject(AuthService);
  
  /** 🎛️ Inject configuration flag (defaults to true if not provided) */
  private isEnabled = inject(AUTH_INTERCEPTOR_ENABLED, { optional: true }) ?? true;

  /**
   * 🔧 Intercept HTTP Requests
   * 
   * This method is called for EVERY HTTP request in the app.
   * We add authentication headers when appropriate.
   * 
   * @param request - The outgoing HTTP request
   * @param next - Handler to pass request to next interceptor/HTTP client
   * @returns Observable of HTTP event (the response)
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // 🎛️ Check if interceptor is disabled
    if (!this.isEnabled) {
      console.log('🔧 AuthInterceptor disabled - passing request through');
      return next.handle(request);
    }

    // 🎫 Get current authentication token
    const token = this.authService.getAuthToken();

    // 🔍 Log interceptor activity for debugging
    console.log('🔧 AuthInterceptor processing request:', {
      url: request.url,
      method: request.method,
      hasToken: !!token,
      existingAuth: !!request.headers.get('Authorization')
    });

    // ❌ No token available - pass request as-is
    if (!token) {
      console.log('🔧 No token available - request sent without auth');
      return next.handle(request);
    }

    // ⚠️ Request already has Authorization header - don't override
    if (request.headers.has('Authorization')) {
      console.log('🔧 Request already has Authorization header - keeping existing');
      return next.handle(request);
    }

    // ✅ Add Authorization header with Bearer token
    const authenticatedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('🔧 Added Authorization header to request');

    // 📤 Send the modified request
    return next.handle(authenticatedRequest);
  }
}

/**
 * 🎛️ AuthInterceptor Provider Factory
 * 
 * Helper function to create interceptor provider with configuration.
 * Makes it easy to enable/disable interceptor in different environments.
 */
export function provideAuthInterceptor(enabled: boolean = true) {
  return [
    {
      provide: AUTH_INTERCEPTOR_ENABLED,
      useValue: enabled
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ];
}

// Import for provider registration
import { HTTP_INTERCEPTORS } from '@angular/common/http';

/**
 * 👨‍🎓 Educational Notes: When Interceptor Runs
 * 
 * ✅ WILL intercept these requests:
 * - this.http.get('/products')
 * - this.http.post('/carts', cartData) 
 * - this.http.put('/users/1', userData)
 * 
 * ❌ WILL NOT intercept these:
 * - Static file requests (images, CSS)
 * - Requests made outside Angular's HttpClient
 * - WebSocket connections
 * 
 * 🔧 Example of intercepted request:
 * 
 * BEFORE (Component sends):
 * GET /products
 * Headers: { 'Content-Type': 'application/json' }
 * 
 * AFTER (Interceptor modifies):
 * GET /products  
 * Headers: { 
 *   'Content-Type': 'application/json',
 *   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
 * }
 */