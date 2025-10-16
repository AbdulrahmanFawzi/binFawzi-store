import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../products/models/product.model';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  lineTotal: number;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'binfawzi_cart';
  
  // Signal for cart items
  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());
  
  // Computed values for cart summary
  readonly items = this.cartItems.asReadonly();
  
  readonly summary = computed(() => {
    const items = this.cartItems();
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      subtotal,
      shipping,
      total,
      itemCount
    } as CartSummary;
  });

  constructor() {}

  /**
   * Add product to cart or increase quantity if already exists
   */
  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
        lineTotal: (updatedItems[existingItemIndex].quantity + quantity) * product.price
      };
      this.cartItems.set(updatedItems);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: product.id,
        product,
        quantity,
        lineTotal: product.price * quantity
      };
      this.cartItems.set([...currentItems, newItem]);
    }
    
    this.saveCartToStorage();
  }

  /**
   * Update quantity of specific cart item
   */
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    
    const currentItems = this.cartItems();
    const updatedItems = currentItems.map(item => {
      if (item.id === productId) {
        return {
          ...item,
          quantity,
          lineTotal: item.product.price * quantity
        };
      }
      return item;
    });
    
    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  /**
   * Remove item from cart
   */
  removeFromCart(productId: number): void {
    const currentItems = this.cartItems();
    const filteredItems = currentItems.filter(item => item.id !== productId);
    this.cartItems.set(filteredItems);
    this.saveCartToStorage();
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    this.cartItems.set([]);
    this.saveCartToStorage();
  }

  /**
   * Check if product is in cart
   */
  isInCart(productId: number): boolean {
    return this.cartItems().some(item => item.id === productId);
  }

  /**
   * Get quantity of specific product in cart
   */
  getProductQuantity(productId: number): number {
    const item = this.cartItems().find(item => item.id === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Save cart to localStorage
   */
  private saveCartToStorage(): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cartItems()));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }

  /**
   * Load cart from localStorage
   */
  private loadCartFromStorage(): CartItem[] {
    try {
      const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Recalculate line totals to ensure consistency
        return parsedCart.map((item: CartItem) => ({
          ...item,
          lineTotal: item.product.price * item.quantity
        }));
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    }
    return [];
  }

  /**
   * Future: API integration methods
   * These can be implemented when switching to server-side cart management
   */
  
  // async syncWithServer(userId: string): Promise<void> {
  //   // Implementation for syncing with FakeStore API
  // }
  
  // async loadCartFromServer(userId: string): Promise<void> {
  //   // Implementation for loading cart from server
  // }
  
  // async saveCartToServer(userId: string): Promise<void> {
  //   // Implementation for saving cart to server
  // }
}