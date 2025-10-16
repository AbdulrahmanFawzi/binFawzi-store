import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  productName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  
  readonly notifications$ = this.notifications.asReadonly();

  constructor() {}

  /**
   * Show success notification when product is added to cart
   */
  showAddToCartSuccess(productName: string): void {
    const notification: Notification = {
      id: this.generateId(),
      message: `${productName} added to cart!`,
      type: 'success',
      duration: 3000,
      productName
    };
    
    this.addNotification(notification);
  }

  /**
   * Show generic success notification
   */
  showSuccess(message: string, duration: number = 3000): void {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type: 'success',
      duration
    };
    
    this.addNotification(notification);
  }

  /**
   * Show error notification
   */
  showError(message: string, duration: number = 5000): void {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type: 'error',
      duration
    };
    
    this.addNotification(notification);
  }

  /**
   * Remove notification by ID
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notifications();
    this.notifications.set(currentNotifications.filter(n => n.id !== id));
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications.set([]);
  }

  /**
   * Add notification to the list and auto-remove after duration
   */
  private addNotification(notification: Notification): void {
    const currentNotifications = this.notifications();
    this.notifications.set([...currentNotifications, notification]);
    
    // Auto-remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Generate unique ID for notifications
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}