/**
 * Product model representing a product from FakeStore API
 * 
 * Educational Notes:
 * - This interface ensures type safety throughout the application
 * - Matches the exact structure returned by FakeStore API
 * - Provides IntelliSense support and compile-time error checking
 */
export interface Product {
  /** Unique identifier for the product */
  id: number;
  
  /** Product name/title */
  title: string;
  
  /** Product price in USD */
  price: number;
  
  /** Detailed product description */
  description: string;
  
  /** Product category (e.g., "electronics", "clothing") */
  category: string;
  
  /** URL to product image */
  image: string;
  
  /** Product rating information (optional in API) */
  rating?: ProductRating;
}

/**
 * Product rating structure from FakeStore API
 * 
 * Educational Notes:
 * - Separate interface for rating data
 * - Optional because not all products may have ratings
 * - Follows single responsibility principle
 */
export interface ProductRating {
  /** Average rating score (1-5) */
  rate: number;
  
  /** Number of people who rated this product */
  count: number;
}

/**
 * API Response wrapper for products list
 * 
 * Educational Notes:
 * - Generic interface for paginated responses
 * - Can be extended for pagination metadata if needed
 * - Follows API response pattern conventions
 */
export interface ProductsResponse {
  /** Array of products */
  products: Product[];
  
  /** Total number of products (for pagination) */
  total?: number;
  
  /** Current page (for pagination) */
  page?: number;
  
  /** Items per page */
  limit?: number;
}

/**
 * Product category type
 * 
 * Educational Notes:
 * - Union type for better type safety
 * - Can be extended as new categories are added
 * - Prevents typos in category names
 */
export type ProductCategory = 
  | 'electronics' 
  | 'jewelery' 
  | "men's clothing" 
  | "women's clothing"
  | string; // Allow for unknown categories

/**
 * Product filter options for search and filtering
 * 
 * Educational Notes:
 * - Interface for search/filter parameters
 * - Optional properties for flexible filtering
 * - Used in service methods for type safety
 */
export interface ProductFilters {
  /** Search term for product title */
  searchTerm?: string;
  
  /** Filter by category */
  category?: ProductCategory;
  
  /** Minimum price filter */
  minPrice?: number;
  
  /** Maximum price filter */
  maxPrice?: number;
  
  /** Limit number of results */
  limit?: number;
  
  /** Sort products by field */
  sortBy?: 'price' | 'title' | 'rating';
  
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Loading state for async operations
 * 
 * Educational Notes:
 * - Enum for consistent loading states
 * - Used throughout the app for UI state management
 * - Provides better UX with loading indicators
 */
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading', 
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * API Error response structure
 * 
 * Educational Notes:
 * - Standardized error handling
 * - Consistent error messaging across the app
 * - Helpful for debugging and user feedback
 */
export interface ApiError {
  /** Error message */
  message: string;
  
  /** HTTP status code */
  status?: number;
  
  /** Error code for specific handling */
  code?: string;
  
  /** Additional error details */
  details?: any;
}