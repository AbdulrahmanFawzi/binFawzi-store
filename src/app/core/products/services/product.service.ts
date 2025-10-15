import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, combineLatest } from 'rxjs';
import { map, catchError, tap, shareReplay, startWith } from 'rxjs/operators';

import { environment } from '@environment/environment';
import { 
  Product, 
  ProductFilters, 
  ProductCategory, 
  LoadingState, 
  ApiError 
} from '../models';

/**
 * ProductService - Centralized product data management
 * 
 * Educational Concepts Covered:
 * 1. Dependency Injection with @Injectable
 * 2. HTTP Client for API communication
 * 3. RxJS Observables for reactive programming
 * 4. Error handling and loading states
 * 5. Caching with shareReplay operator
 * 6. State management with BehaviorSubject
 */
@Injectable({
  providedIn: 'root' // Singleton service available app-wide
})
export class ProductService {
  
  /** Base URL for FakeStore API */
  private readonly apiUrl = environment.apiUrl;

  /**
   * Loading state management
   * Educational: BehaviorSubject maintains current state and emits to new subscribers
   */
  private readonly loadingSubject = new BehaviorSubject<LoadingState>(LoadingState.IDLE);
  public readonly loading$ = this.loadingSubject.asObservable();

  /**
   * Error state management
   * Educational: Centralized error handling for UI feedback
   */
  private readonly errorSubject = new BehaviorSubject<ApiError | null>(null);
  public readonly error$ = this.errorSubject.asObservable();

  /**
   * Cached products data
   * Educational: shareReplay prevents multiple API calls for same data
   */
  private productsCache$?: Observable<Product[]>;

  /**
   * Cached categories data
   * Educational: Categories don't change often, so cache them
   */
  private categoriesCache$?: Observable<string[]>;

  constructor(private http: HttpClient) {}

  /**
   * Get all products from API
   * 
   * Educational Notes:
   * - Returns Observable for reactive programming
   * - Uses caching to prevent unnecessary API calls
   * - Implements error handling and loading states
   * 
   * @param limit Optional limit for number of products
   * @returns Observable<Product[]>
   */
  getProducts(limit?: number): Observable<Product[]> {
    // Use cache if available and no limit specified
    if (this.productsCache$ && !limit) {
      return this.productsCache$;
    }

    const url = limit 
      ? `${this.apiUrl}/products?limit=${limit}`
      : `${this.apiUrl}/products`;

    this.setLoading(LoadingState.LOADING);

    const products$ = this.http.get<Product[]>(url).pipe(
      tap(() => {
        this.setLoading(LoadingState.SUCCESS);
        this.clearError();
      }),
      catchError(this.handleError.bind(this)),
      shareReplay(1) // Cache the result
    );

    // Cache only if getting all products (no limit)
    if (!limit) {
      this.productsCache$ = products$;
    }

    return products$;
  }

  /**
   * Get single product by ID
   * 
   * Educational Notes:
   * - Path parameter handling
   * - Individual product loading state
   * - Error handling for not found scenarios
   * 
   * @param id Product ID
   * @returns Observable<Product>
   */
  getProductById(id: number): Observable<Product> {
    this.setLoading(LoadingState.LOADING);

    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      tap(() => {
        this.setLoading(LoadingState.SUCCESS);
        this.clearError();
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get all product categories
   * 
   * Educational Notes:
   * - Cached data for performance
   * - String array response handling
   * - Used for filter dropdown population
   * 
   * @returns Observable<string[]>
   */
  getCategories(): Observable<string[]> {
    if (this.categoriesCache$) {
      return this.categoriesCache$;
    }

    this.setLoading(LoadingState.LOADING);

    this.categoriesCache$ = this.http.get<string[]>(`${this.apiUrl}/products/categories`).pipe(
      tap(() => {
        this.setLoading(LoadingState.SUCCESS);
        this.clearError();
      }),
      catchError(this.handleError.bind(this)),
      shareReplay(1) // Cache categories
    );

    return this.categoriesCache$;
  }

  /**
   * Get products by category
   * 
   * Educational Notes:
   * - Dynamic URL construction
   * - Category-based filtering
   * - No caching since it's filtered data
   * 
   * @param category Category name
   * @returns Observable<Product[]>
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    this.setLoading(LoadingState.LOADING);

    return this.http.get<Product[]>(`${this.apiUrl}/products/category/${category}`).pipe(
      tap(() => {
        this.setLoading(LoadingState.SUCCESS);
        this.clearError();
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Search and filter products (client-side)
   * 
   * Educational Notes:
   * - Client-side filtering for better UX
   * - RxJS operators for data transformation
   * - Combines multiple filter criteria
   * 
   * @param filters Filter criteria
   * @returns Observable<Product[]>
   */
  searchProducts(filters: ProductFilters): Observable<Product[]> {
    // Start with all products or category-specific products
    const source$ = filters.category 
      ? this.getProductsByCategory(filters.category)
      : this.getProducts();

    return source$.pipe(
      map(products => this.applyClientSideFilters(products, filters))
    );
  }

  /**
   * Get products with advanced filtering
   * 
   * Educational Notes:
   * - Combines server-side and client-side filtering
   * - Flexible filtering system
   * - Performance optimization
   * 
   * @param filters Complete filter object
   * @returns Observable<Product[]>
   */
  getFilteredProducts(filters: ProductFilters = {}): Observable<Product[]> {
    const { category, limit, ...clientFilters } = filters;
    
    let source$: Observable<Product[]>;

    if (category) {
      source$ = this.getProductsByCategory(category);
    } else if (limit) {
      source$ = this.getProducts(limit);
    } else {
      source$ = this.getProducts();
    }

    return source$.pipe(
      map(products => this.applyClientSideFilters(products, clientFilters))
    );
  }

  /**
   * Apply client-side filters to products array
   * 
   * Educational Notes:
   * - Pure function for data transformation
   * - Multiple filter criteria handling
   * - Array manipulation methods
   * 
   * @private
   * @param products Products array to filter
   * @param filters Filter criteria
   * @returns Filtered products array
   */
  private applyClientSideFilters(products: Product[], filters: ProductFilters): Product[] {
    let filtered = [...products]; // Create copy to avoid mutation

    // Search by title
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(product => product.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice!);
    }

    // Sort products
    if (filters.sortBy) {
      filtered = this.sortProducts(filtered, filters.sortBy, filters.sortOrder || 'asc');
    }

    return filtered;
  }

  /**
   * Sort products by specified field
   * 
   * Educational Notes:
   * - Array sorting with custom comparator
   * - Generic sorting function
   * - Handles different data types
   * 
   * @private
   * @param products Products to sort
   * @param sortBy Field to sort by
   * @param order Sort direction
   * @returns Sorted products array
   */
  private sortProducts(
    products: Product[], 
    sortBy: 'price' | 'title' | 'rating', 
    order: 'asc' | 'desc'
  ): Product[] {
    return products.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sortBy) {
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'rating':
          valueA = a.rating?.rate || 0;
          valueB = b.rating?.rate || 0;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Clear all caches
   * 
   * Educational Notes:
   * - Cache management utility
   * - Useful for data refresh scenarios
   * - Memory management
   */
  clearCache(): void {
    this.productsCache$ = undefined;
    this.categoriesCache$ = undefined;
  }

  /**
   * Set loading state
   * 
   * Educational Notes:
   * - Centralized loading state management
   * - UI can subscribe to loading state for indicators
   * - Prevents multiple simultaneous loading states
   * 
   * @private
   * @param state Loading state to set
   */
  private setLoading(state: LoadingState): void {
    this.loadingSubject.next(state);
  }

  /**
   * Clear error state
   * 
   * Educational Notes:
   * - Error state management
   * - Allows UI to clear error messages
   * 
   * @private
   */
  private clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Handle HTTP errors
   * 
   * Educational Notes:
   * - Centralized error handling
   * - Transforms HTTP errors to application errors
   * - Provides user-friendly error messages
   * 
   * @private
   * @param error HTTP error response
   * @returns Observable that throws ApiError
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    this.setLoading(LoadingState.ERROR);

    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      apiError = {
        message: 'Network error occurred. Please check your connection.',
        code: 'NETWORK_ERROR'
      };
    } else {
      // Backend error
      switch (error.status) {
        case 404:
          apiError = {
            message: 'Product not found.',
            status: 404,
            code: 'NOT_FOUND'
          };
          break;
        case 500:
          apiError = {
            message: 'Server error. Please try again later.',
            status: 500,
            code: 'SERVER_ERROR'
          };
          break;
        default:
          apiError = {
            message: error.error?.message || 'An unexpected error occurred.',
            status: error.status,
            code: 'UNKNOWN_ERROR'
          };
      }
    }

    this.errorSubject.next(apiError);
    return throwError(() => apiError);
  }
}