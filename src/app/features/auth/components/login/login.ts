/**
 * 🔐 Login Component - BinFawzi Store
 * 
 * Handles user authentication with reactive forms and validation.
 * Features card-based design with logo testing capabilities.
 * 
 * Educational Focus: Demonstrates reactive forms, validation, and auth integration
 */

// that is the working login credentials

// // These are the only working login credentials:
// username: "mor_2314", password: ""
// username: "kevinryan", password: "kev02937@"
// username: "donero", password: "ewedon"
// // ... and a few others


import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { LoginRequest } from '../../../../core/auth/models/login-request.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {

  /** 📝 Reactive Login Form */
  loginForm: FormGroup;

  /** 🔄 Component State */
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  /** 💉 Dependency Injection */
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  constructor() {
    // Initialize reactive form with validation
    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      rememberMe: [false] // Optional remember me checkbox
    });
  }

  ngOnInit(): void {
    // Clear any existing error messages when component loads
    this.errorMessage = '';
    
    // Reset form state
    this.isLoading = false;
    
    // 🌍 Initialize translations
    this.initializeTranslations();
    
    // Log component initialization for debugging
    console.log('🔐 Login component initialized');
  }

  /**
   * 🌍 Initialize Translation Service
   * 
   * Sets up the default language - will automatically load from assets/i18n/
   */
  private initializeTranslations(): void {
    // Set default language to English
    this.translateService.setDefaultLang('en');
    
    // Use English as the current language
    // This will automatically load assets/i18n/en.json via HTTP loader
    this.translateService.use('en');
    
    console.log('🌍 Translations initialized - loading from assets/i18n/');
  }



  /**
   * 🚀 Handle Login Form Submission
   * 
   * Validates form, calls AuthService, and handles success/error states
   */
  onSubmit(): void {
    // Clear previous error messages
    this.errorMessage = '';

    // Check if form is valid
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
      return;
    }

    // Get form values
    const formData = this.loginForm.value;
    const credentials: LoginRequest = {
      username: formData.username,
      password: formData.password
    };

    const rememberMe = formData.rememberMe || false;

    // Set loading state
    this.isLoading = true;
    this.loginForm.disable(); // Disable form during submission

    console.log('🔐 Attempting login:', { username: credentials.username, rememberMe });

    // Call authentication service
    this.authService.login(credentials, rememberMe).subscribe({
      next: (user) => {
        // ✅ Login successful
        console.log('🎉 Login successful:', user);
        this.handleLoginSuccess();
      },
      error: (error) => {
        // ❌ Login failed
        console.error('🚫 Login failed:', error);
        this.handleLoginError(error.message || 'Login failed. Please try again.');
      }
    });
  }

  /**
   * ✅ Handle Successful Login
   * 
   * Redirects user to landing page after successful authentication
   */
  private handleLoginSuccess(): void {
    // Reset loading state
    this.isLoading = false;
    this.loginForm.enable();

    // Navigate to landing page (will be protected by AuthGuard)
    this.router.navigate(['/landing']);
  }

  /**
   * ❌ Handle Login Error
   * 
   * Displays error message and re-enables form for retry
   */
  private handleLoginError(message: string): void {
    // Set error message
    this.errorMessage = message;

    // Reset loading state
    this.isLoading = false;
    this.loginForm.enable();

    // Focus back to username field for easy retry
    setTimeout(() => {
      const usernameField = document.getElementById('username');
      usernameField?.focus();
    }, 100);
  }

  /**
   * 👁️ Toggle Password Visibility
   * 
   * Shows/hides password field content
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * 🔍 Get Form Field Error Messages
   * 
   * Returns appropriate error message for form validation
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} must be at least ${requiredLength} characters`;
      }
    }
    
    return '';
  }

  /**
   * 🏷️ Get Field Label for Error Messages
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      username: 'Username',
      password: 'Password'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * ✅ Check if Field is Valid
   * 
   * Used for conditional styling in template
   */
  isFieldValid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.valid && field.touched : false;
  }

  /**
   * ❌ Check if Field has Error
   * 
   * Used for conditional styling in template
   */
  isFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }
}