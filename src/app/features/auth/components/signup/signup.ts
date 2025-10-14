/**
 * 📝 Signup Component - BinFawzi Store
 * 
 * Handles user registration with reactive forms and validation.
 * Features card-based design matching login component styling.
 * 
 * Educational Focus: Demonstrates reactive forms, validation, and auth integration
 */

import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { SignupRequest } from '../../../../core/auth/models/signup-request.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class SignupComponent implements OnInit {

  /** 📝 Reactive Signup Form */
  signupForm: FormGroup;

  /** 🔄 Component State */
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  /** 💉 Dependency Injection */
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  constructor() {
    // Initialize reactive form with validation
    this.signupForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      username: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]]
    }, {
      // Custom validator for password confirmation
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Clear any existing messages when component loads
    this.errorMessage = '';
    this.successMessage = '';
    
    // Reset form state
    this.isLoading = false;
    
    // 🌍 Initialize translations
    this.initializeTranslations();
    
    // Log component initialization for debugging
    console.log('📝 Signup component initialized');
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
   * 🔒 Password Match Validator
   * 
   * Custom validator to ensure password and confirmPassword match
   */
  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    if (password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    
    return null;
  }

  /**
   * 🚀 Handle Signup Form Submission
   * 
   * Validates form, calls AuthService, and handles success/error states
   */
  onSubmit(): void {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    // Check if form is valid
    if (this.signupForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.signupForm.markAllAsTouched();
      return;
    }

    // Get form values
    const formData = this.signupForm.value;
    const signupData: SignupRequest = {
      email: formData.email,
      username: formData.username,
      password: formData.password
      // Note: confirmPassword is not sent to API, firstname/lastname/phone are optional
    };

    // Set loading state
    this.isLoading = true;
    this.signupForm.disable(); // Disable form during submission

    console.log('📝 Attempting signup:', { email: signupData.email, username: signupData.username });

    // Call authentication service
    this.authService.signup(signupData).subscribe({
      next: (response) => {
        // ✅ Signup successful
        console.log('🎉 Signup successful:', response);
        this.handleSignupSuccess();
      },
      error: (error) => {
        // ❌ Signup failed
        console.error('🚫 Signup failed:', error);
        this.handleSignupError(error.message || 'Signup failed. Please try again.');
      }
    });
  }

  /**
   * ✅ Handle Successful Signup
   * 
   * Shows success message and redirects to login page after delay
   */
  private handleSignupSuccess(): void {
    // Reset loading state
    this.isLoading = false;
    this.signupForm.enable();

    // Show success message
    this.successMessage = 'Account created successfully! Redirecting to login...';

    // Redirect to login page after 2 seconds
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 2000);
  }

  /**
   * ❌ Handle Signup Error
   * 
   * Displays error message and re-enables form for retry
   */
  private handleSignupError(message: string): void {
    // Set error message
    this.errorMessage = message;

    // Reset loading state
    this.isLoading = false;
    this.signupForm.enable();

    // Focus back to email field for easy retry
    setTimeout(() => {
      const emailField = document.getElementById('email');
      emailField?.focus();
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
   * 👁️ Toggle Confirm Password Visibility
   * 
   * Shows/hides confirm password field content
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * 🔍 Get Form Field Error Messages
   * 
   * Returns appropriate error message for form validation
   */
  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} must be at least ${requiredLength} characters`;
      }
    }

    // Check for password mismatch at form level
    if (fieldName === 'confirmPassword' && this.signupForm.errors?.['passwordMismatch'] && field?.touched) {
      return 'Passwords do not match';
    }
    
    return '';
  }

  /**
   * 🏷️ Get Field Label for Error Messages
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm Password'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * ✅ Check if Field is Valid
   * 
   * Used for conditional styling in template
   */
  isFieldValid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return field ? field.valid && field.touched : false;
  }

  /**
   * ❌ Check if Field has Error
   * 
   * Used for conditional styling in template
   */
  isFieldError(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    const hasFieldError = field ? field.invalid && field.touched : false;
    
    // Special case for confirmPassword - also check form-level password mismatch
    if (fieldName === 'confirmPassword') {
      return hasFieldError || (this.signupForm.errors?.['passwordMismatch'] && field?.touched);
    }
    
    return hasFieldError;
  }
}