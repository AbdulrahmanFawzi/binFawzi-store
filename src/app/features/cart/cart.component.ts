import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService, CartItem } from '../../core/services/cart.service';
import { HeaderComponent } from '../../shared/header/header';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    HeaderComponent
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private cartService = inject(CartService);
  private router = inject(Router);

  // Cart data from service
  readonly cartItems = this.cartService.items;
  readonly cartSummary = this.cartService.summary;

  constructor() {}

  /**
   * Update quantity of cart item
   */
  updateQuantity(productId: number, newQuantity: number): void {
    if (newQuantity < 1) return;
    this.cartService.updateQuantity(productId, newQuantity);
  }

  /**
   * Increase quantity by 1
   */
  increaseQuantity(productId: number, currentQuantity: number): void {
    if (currentQuantity >= 99) return;
    this.cartService.updateQuantity(productId, currentQuantity + 1);
  }

  /**
   * Decrease quantity by 1
   */
  decreaseQuantity(productId: number, currentQuantity: number): void {
    if (currentQuantity <= 1) return;
    this.cartService.updateQuantity(productId, currentQuantity - 1);
  }

  /**
   * Remove item from cart
   */
  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  /**
   * Navigate to checkout
   */
  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  /**
   * Continue shopping - navigate to products page
   */
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Handle quantity input changes
   */
  onQuantityInput(event: Event, productId: number): void {
    const target = event.target as HTMLInputElement;
    const newQuantity = parseInt(target.value, 10);
    
    if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity <= 99) {
      this.cartService.updateQuantity(productId, newQuantity);
    }
  }

  /**
   * Track by function for cart items
   */
  trackByProductId(index: number, item: CartItem): number {
    return item.id;
  }
}