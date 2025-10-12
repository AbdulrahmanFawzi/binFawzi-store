/**
 * 🛡️ Authentication Guard - BinFawzi Store
 * 
 * Protects routes from unauthorized access by checking authentication status.
 * Uses functional guard approach (modern Angular pattern).
 * 
 * How it works:
 * 1. User tries to access protected route (e.g., /home, /cart)
 * 2. AuthGuard checks if user is authenticated via AuthService
 * 3. If authenticated → Allow access ✅
 * 4. If not authenticated → Redirect to login page ❌
 * 
 * Educational Focus: Demonstrates reactive route protection and navigation patterns
 */

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

/**
 * 🔐 Authentication Guard Function
 * 
 * Modern functional guard that protects routes from unauthenticated users.
 * Uses dependency injection with inject() function (Angular 14+ pattern).
 * 
 * @returns Observable<boolean> - true if access allowed, false if blocked
 */
export const authGuard: CanActivateFn = (): Observable<boolean> => {
  // 💉 Inject dependencies using modern Angular pattern
  const authService = inject(AuthService);
  const router = inject(Router);

  // 📡 Check authentication status reactively
  return authService.isAuthenticated$.pipe(
    // 🔍 Log guard decision for debugging
    tap(isAuthenticated => {
      console.log('🛡️ AuthGuard check:', { 
        isAuthenticated, 
        currentUser: authService.getCurrentUser()?.username || 'none' 
      });
    }),

    // 🚪 Handle redirect logic
    map(isAuthenticated => {
      if (isAuthenticated) {
        // ✅ User is authenticated, allow access
        return true;
      } else {
        // ❌ User not authenticated, redirect to login
        console.log('🚫 Access denied - redirecting to login');
        router.navigate(['/auth/login']);
        return false;
      }
    })
  );
};

/**
 * 🏠 Reverse Authentication Guard
 * 
 * Prevents authenticated users from accessing auth pages (login/signup).
 * If user is already logged in, redirect them to home instead of login.
 * 
 * Use case: Logged-in user tries to access /auth/login → redirect to /home
 * 
 * @returns Observable<boolean> - true if access allowed, false if blocked
 */
export const guestGuard: CanActivateFn = (): Observable<boolean> => {
  // 💉 Inject dependencies
  const authService = inject(AuthService);
  const router = inject(Router);

  // 📡 Check authentication status reactively
  return authService.isAuthenticated$.pipe(
    // 🔍 Log guard decision for debugging
    tap(isAuthenticated => {
      console.log('🏠 GuestGuard check:', { 
        isAuthenticated, 
        currentUser: authService.getCurrentUser()?.username || 'none' 
      });
    }),

    // 🚪 Handle redirect logic (opposite of AuthGuard)
    map(isAuthenticated => {
      if (!isAuthenticated) {
        // ✅ User not authenticated, allow access to auth pages
        return true;
      } else {
        // ❌ User already authenticated, redirect to home
        console.log('🏠 Already logged in - redirecting to home');
        router.navigate(['/home']);
        return false;
      }
    })
  );
};

/**
 * 👨‍🎓 Educational Helper: Guard Usage Examples
 * 
 * How to use these guards in route configuration:
 * 
 * // Protected routes (require authentication)
 * {
 *   path: 'home',
 *   component: HomeComponent,
 *   canActivate: [authGuard] // 🛡️ Only authenticated users
 * }
 * 
 * // Auth routes (for guests only)
 * {
 *   path: 'auth/login',
 *   component: LoginComponent,
 *   canActivate: [guestGuard] // 🏠 Only non-authenticated users
 * }
 * 
 * // Public routes (no guard needed)
 * {
 *   path: 'about',
 *   component: AboutComponent
 *   // No canActivate - accessible to everyone
 * }
 */