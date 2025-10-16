import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

// Shared Components
import { HeaderComponent } from '@shared/header/header';

// Core Services & Models
import { ProductService } from '@core/products/services/product.service';
import { CartService } from '@core/services/cart.service';
import { NotificationService } from '@core/services/notification.service';
import { Product, LoadingState } from '@core/products/models/product.model';

/**
 * ProductDetailsComponent - Individual product detail page
 * 
 * Educational Concepts:
 * 1. Route Parameter Handling with ActivatedRoute
 * 2. Single Product Data Fetching
 * 3. Signal-based State Management
 * 4. Quantity Selector Logic
 * 5. Responsive Product Detail Layout
 */
@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    HeaderComponent
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive state management
  product = signal<Product | null>(null);
  loading = signal<LoadingState>(LoadingState.IDLE);
  error = signal<string | null>(null);
  quantity = signal<number>(1);

  // Expose LoadingState enum for template
  readonly LoadingState = LoadingState;

  ngOnInit(): void {
    // Get product ID from route parameters
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const productId = Number(params['id']);
      if (productId && !isNaN(productId)) {
        this.loadProduct(productId);
      } else {
        this.router.navigate(['/products']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load product details from API
   */
  private loadProduct(id: number): void {
    this.loading.set(LoadingState.LOADING);
    this.error.set(null);

    this.productService.getProductById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(LoadingState.SUCCESS);
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.error.set('Failed to load product details');
        this.loading.set(LoadingState.ERROR);
      }
    });
  }

  /**
   * Quantity selector methods
   */
  increaseQuantity(): void {
    if (this.quantity() < 99) {
      this.quantity.update(qty => qty + 1);
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(qty => qty - 1);
    }
  }

  updateQuantity(value: string): void {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 99) {
      this.quantity.set(numValue);
    }
  }

  /**
   * Cart actions
   */
  addToCart(): void {
    const currentProduct = this.product();
    if (currentProduct) {
      this.cartService.addToCart(currentProduct, this.quantity());
      this.notificationService.showAddToCartSuccess(currentProduct.title);
      console.log(`Added ${this.quantity()} x ${currentProduct.title} to cart`);
    }
  }

  buyNow(): void {
    const currentProduct = this.product();
    if (currentProduct) {
      // TODO: Implement buy now logic
      console.log(`Buy now: ${this.quantity()} x ${currentProduct.title}`);
    }
  }

  /**
   * Navigation methods
   */
  goBack(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Star rating helper
   */
  getStarArray(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, index) => rating >= index + 1);
  }
}