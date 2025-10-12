/**
 * 🗄️ Token Storage Service - BinFawzi Store
 * 
 * Handles JWT token storage with security considerations.
 * Supports both in-memory (secure) and localStorage (persistent) storage.
 * 
 * Educational Focus: Demonstrates storage trade-offs and security patterns.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  
  /** 
   * 🔐 Private in-memory token storage (secure but temporary)
   * This is our default storage - secure against XSS but lost on page refresh
   */
  private readonly MEMORY_TOKEN_KEY = 'auth_token';
  private memoryStorage = new Map<string, string>();

  /** 
   * 🏪 localStorage key for persistent storage (opt-in only)
   * Only used when user explicitly chooses "Remember Me"
   */
  private readonly LOCAL_STORAGE_TOKEN_KEY = 'binFawzi_auth_token';

  /**
   * 💾 Store JWT token with chosen persistence strategy
   * 
   * @param token - JWT token from login response
   * @param persistent - Whether to store in localStorage (Remember Me)
   */
  setToken(token: string, persistent: boolean = false): void {
    // Always store in memory for immediate access
    this.memoryStorage.set(this.MEMORY_TOKEN_KEY, token);
    
    if (persistent) {
      // Opt-in localStorage storage for persistence across sessions
      try {
        localStorage.setItem(this.LOCAL_STORAGE_TOKEN_KEY, token);
      } catch (error) {
        // Handle localStorage not available (private browsing, etc.)
        console.warn('localStorage not available, falling back to memory storage only');
      }
    } else {
      // Clear localStorage if not persistent
      this.clearPersistedToken();
    }
  }

  /**
   * 🔍 Retrieve JWT token from storage
   * 
   * Priority: Memory storage first, then localStorage fallback
   * This ensures we use the most recent token if available
   */
  getToken(): string | null {
    // Check memory storage first (always up-to-date)
    const memoryToken = this.memoryStorage.get(this.MEMORY_TOKEN_KEY);
    if (memoryToken) {
      return memoryToken;
    }

    // Fallback to localStorage if available
    try {
      const persistedToken = localStorage.getItem(this.LOCAL_STORAGE_TOKEN_KEY);
      if (persistedToken) {
        // Restore to memory storage for consistent access
        this.memoryStorage.set(this.MEMORY_TOKEN_KEY, persistedToken);
        return persistedToken;
      }
    } catch (error) {
      // localStorage not available, continue without it
    }

    return null;
  }

  /**
   * 🧹 Clear all stored tokens (logout)
   * 
   * Removes token from both memory and persistent storage
   */
  clearToken(): void {
    // Clear memory storage
    this.memoryStorage.delete(this.MEMORY_TOKEN_KEY);
    
    // Clear localStorage
    this.clearPersistedToken();
  }

  /**
   * 🔍 Check if we have any stored token
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * 🏪 Check if token is stored persistently
   * 
   * Used to determine "Remember Me" checkbox state on app load
   */
  isTokenPersisted(): boolean {
    try {
      return !!localStorage.getItem(this.LOCAL_STORAGE_TOKEN_KEY);
    } catch {
      return false;
    }
  }

  /**
   * 🧹 Private helper to clear localStorage token
   */
  private clearPersistedToken(): void {
    try {
      localStorage.removeItem(this.LOCAL_STORAGE_TOKEN_KEY);
    } catch {
      // localStorage not available, nothing to clear
    }
  }

  /**
   * 🔧 Development helper to inspect storage state
   * Remove this in production builds
   */
  getStorageDebugInfo(): { memory: boolean; persistent: boolean } {
    return {
      memory: this.memoryStorage.has(this.MEMORY_TOKEN_KEY),
      persistent: this.isTokenPersisted()
    };
  }
}