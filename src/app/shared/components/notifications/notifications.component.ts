import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      @for (notification of notificationService.notifications$(); track notification.id) {
        <div 
          class="notification"
          [class]="'notification-' + notification.type"
          (click)="removeNotification(notification.id)">
          
          <!-- Success Icon -->
          @if (notification.type === 'success') {
            <div class="notification-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
          }
          
          <!-- Notification Content -->
          <div class="notification-content">
            <span class="notification-message">{{ notification.message }}</span>
          </div>
          
          <!-- Close Button -->
          <button 
            class="notification-close"
            (click)="removeNotification(notification.id)"
            aria-label="Close notification">
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 400px;
    }

    .notification {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 0.75rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      transition: all 0.3s ease;
      animation: slideIn 0.3s ease-out;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }
    }

    .notification-success {
      background: #10b981;
      color: white;
      border: 1px solid #059669;
    }

    .notification-error {
      background: #ef4444;
      color: white;
      border: 1px solid #dc2626;
    }

    .notification-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      flex-shrink: 0;

      svg {
        width: 20px;
        height: 20px;
      }
    }

    .notification-content {
      flex: 1;
    }

    .notification-message {
      font-size: 0.9rem;
      font-weight: 500;
      line-height: 1.4;
    }

    .notification-close {
      background: transparent;
      border: none;
      color: currentColor;
      font-size: 1.25rem;
      font-weight: bold;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s ease;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &:hover {
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 640px) {
      .notifications-container {
        left: 1rem;
        right: 1rem;
        max-width: none;
      }
    }
  `]
})
export class NotificationsComponent {
  notificationService = inject(NotificationService);

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }
}