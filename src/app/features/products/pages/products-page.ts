import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// RxJS imports for reactive programming
import { 
  Observable, 
  BehaviorSubject, 
  combineLatest, 
  startWith,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  tap
} from 'rxjs';

// Our core services and models
import { ProductService } from '@core/products/services';
import { CartService } from '@core/services/cart.service';
import { NotificationService } from '@core/services/notification.service';
import { Product, LoadingState, ProductFilters } from '@core/products/models';

// Shared components
import { HeaderComponent } from '@shared/header/header';

/**
 * ProductsPageComponent - Main products listing page
 * 
 * Educational Concepts:
 * 1. Standalone Component Architecture
 * 2. Reactive Forms with FormBuilder
 * 3. RxJS Stream Composition
 * 4. State Management Patterns
 * 5. Service Integration
 * 6. Loading and Error State Handling
 */
@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    TranslateModule,
    HeaderComponent
  ],
  templateUrl: './products-page.html',
  styleUrls: ['./products-page.scss']
})
export class ProductsPageComponent implements OnInit {
  
  /**
   * Modern Angular DI pattern using inject()
   * Educational: Alternative to constructor injection
   */
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly notificationService = inject(NotificationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);

  /**
   * Reactive Form for search and filters
   * Educational: FormBuilder creates FormGroup with validation
   */
  filtersForm: FormGroup = this.formBuilder.group({
    searchTerm: [''], // Search input
    selectedCategory: [''], // Category dropdown
    sortBy: [''], // Sort selection
    sortOrder: ['asc'] // Sort direction
  });

  /**
   * Form control getters for proper typing in template
   * Educational: Type-safe access to form controls
   */
  get searchTermControl() { return this.filtersForm.get('searchTerm') as FormControl; }
  get categoryControl() { return this.filtersForm.get('selectedCategory') as FormControl; }
  get sortByControl() { return this.filtersForm.get('sortBy') as FormControl; }

  /**
   * Categories for dropdown
   * Educational: Observable pattern for async data
   */
  categories$: Observable<string[]> = this.productService.getCategories();

  /**
   * Filter state management
   * Educational: BehaviorSubject maintains current filter state
   */
  private filtersSubject = new BehaviorSubject<ProductFilters>({});

  /**
   * Combined data stream for products
   * Educational: combineLatest merges multiple observables
   */
  products$: Observable<Product[]> = combineLatest([
    this.filtersSubject.asObservable(),
    this.filtersForm.valueChanges.pipe(
      startWith(this.filtersForm.value), // Emit initial value
      debounceTime(300), // Wait 300ms after user stops typing
      distinctUntilChanged(), // Only emit if value actually changed
      tap(formValue => {
        // Update filters based on form changes
        const filters: ProductFilters = {
          searchTerm: formValue.searchTerm?.trim() || undefined,
          category: formValue.selectedCategory || undefined,
          sortBy: formValue.sortBy || undefined,
          sortOrder: formValue.sortOrder || 'asc'
        };
        this.filtersSubject.next(filters);
      })
    )
  ]).pipe(
    // Switch to new product search whenever filters change
    switchMap(([filters]) => 
      this.productService.getFilteredProducts(filters)
    )
  );

  /**
   * Loading state for UI feedback
   * Educational: Service exposes loading state as Observable
   */
  loading$ = this.productService.loading$;

  /**
   * Error state for user feedback
   * Educational: Centralized error handling from service
   */
  error$ = this.productService.error$;

  /**
   * Products count for display
   * Educational: Derived observable using map operator
   */
  productsCount$ = this.products$.pipe(
    map(products => products.length)
  );

  /**
   * Loading state enum for template usage
   * Educational: Expose enum to template for cleaner comparisons
   */
  LoadingState = LoadingState;

  ngOnInit(): void {
    // Initialize translations
    this.initializeTranslations();
    
    // Initial load - get all products
    this.loadInitialData();
  }

  /**
   * Initialize Translation Service
   * Educational: Explicit translation setup
   */
  private initializeTranslations(): void {
    this.translateService.setDefaultLang('en');
    this.translateService.use('en');
    console.log('🌍 Products page translations initialized');
  }

  /**
   * Load initial data on component initialization
   * Educational: Separation of initialization logic
   */
  private loadInitialData(): void {
    // Trigger initial load by emitting default filters
    this.filtersSubject.next({});
  }

  /**
   * Handle category selection
   * Educational: Form control updates and reactive patterns
   */
  onCategoryChange(category: string): void {
    this.filtersForm.patchValue({ 
      selectedCategory: category 
    });
    
    // Clear search when changing categories for better UX
    if (category !== '') {
      this.filtersForm.patchValue({ searchTerm: '' });
    }
  }

  /**
   * Handle sort selection
   * Educational: Multiple form control updates
   */
  onSortChange(sortBy: string): void {
    this.filtersForm.patchValue({ 
      sortBy: sortBy 
    });
  }

  /**
   * Clear all filters
   * Educational: Form reset and state management
   */
  clearFilters(): void {
    this.filtersForm.reset({
      searchTerm: '',
      selectedCategory: '',
      sortBy: '',
      sortOrder: 'asc'
    });
  }

  /**
   * Handle search input
   * Educational: Manual form control updates
   */
  onSearchChange(searchTerm: string): void {
    this.filtersForm.patchValue({ 
      searchTerm: searchTerm 
    });
  }

  /**
   * Retry loading on error
   * Educational: Error recovery patterns
   */
  retryLoad(): void {
    // Clear cache and reload
    this.productService.clearCache();
    this.loadInitialData();
  }

  /**
   * Track function for ngFor performance
   * Educational: Angular performance optimization
   */
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  /**
   * Add product to cart
   * Educational: Cart service integration
   */
  addToCart(product: Product, event?: Event): void {
    // Prevent navigation when clicking Add to Cart button
    if (event) {
      event.stopPropagation();
    }
    
    this.cartService.addToCart(product, 1);
    this.notificationService.showAddToCartSuccess(product.title);
    console.log(`Added ${product.title} to cart`);
  }

  /**
   * Navigate to product details page
   * Educational: Programmatic routing with parameters
   */
  navigateToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }
}