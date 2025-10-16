import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { HeaderComponent } from '../../shared/header/header';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    HeaderComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  // Cart data from service
  readonly cartItems = this.cartService.items;
  readonly cartSummary = this.cartService.summary;

  // Delivery information form
  deliveryForm: FormGroup = this.formBuilder.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', [Validators.required, Validators.minLength(10)]],
    phone: ['', [Validators.required, Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]]
  });

  constructor() {}

  /**
   * Get form control for easy access in template
   */
  getFormControl(controlName: string) {
    return this.deliveryForm.get(controlName);
  }

  /**
   * Check if form control has error
   */
  hasError(controlName: string, errorType: string): boolean {
    const control = this.getFormControl(controlName);
    return control ? control.hasError(errorType) && (control.dirty || control.touched) : false;
  }

  /**
   * Get error message for form control
   */
  getErrorMessage(controlName: string): string {
    const control = this.getFormControl(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return `${controlName} is required`;
    }
    if (control.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${controlName} must be at least ${requiredLength} characters`;
    }
    if (control.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    return '';
  }

  /**
   * Navigate back to cart
   */
  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }

  /**
   * Place order - validate form and process order
   */
  placeOrder(): void {
    if (this.deliveryForm.valid) {
      // Simulate order processing
      const orderData = {
        delivery: this.deliveryForm.value,
        items: this.cartItems(),
        total: this.cartSummary().total
      };

      console.log('Order placed:', orderData);
      
      // Clear cart
      this.cartService.clearCart();
      
      // Navigate to order confirmed page with celebration
      this.router.navigate(['/order-confirmed']);
    } else {
      // Mark all fields as touched to show validation errors
      this.deliveryForm.markAllAsTouched();
      this.notificationService.showError('Please fill in all required fields correctly.');
    }
  }

  /**
   * Continue shopping - navigate to products page
   */
  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}