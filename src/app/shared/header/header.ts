import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from '../sidebar/sidebar';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, SidebarComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  private cartService = inject(CartService);

  /**
   * Controls sidebar open/close state
   * Educational: Component state management
   */
  isSidebarOpen = false;

  /**
   * Get cart item count for badge display
   */
  readonly cartItemCount = this.cartService.summary;

  /**
   * Toggle sidebar visibility
   * Educational: State manipulation and UI control
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /**
   * Close sidebar - called from sidebar component
   * Educational: Parent-child component communication
   */
  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  /**
   * Handle keyboard navigation for accessibility
   * Educational: Accessibility best practices
   */
  onKeydown(event: KeyboardEvent): void {
    // Close sidebar on Escape key
    if (event.key === 'Escape' && this.isSidebarOpen) {
      this.closeSidebar();
    }
  }
}