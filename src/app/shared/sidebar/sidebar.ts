import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  /**
   * Controls sidebar visibility
   * @Input decorator allows parent components to control sidebar state
   */
  @Input() isOpen = false;

  /**
   * Emits when sidebar should be closed
   * @Output decorator allows child to communicate with parent
   */
  @Output() closeSidebar = new EventEmitter<void>();

  /**
   * Close sidebar - emits event to parent component
   * Educational: Component communication pattern
   */
  close(): void {
    this.closeSidebar.emit();
  }

  /**
   * Handle backdrop click to close sidebar
   * Educational: Event handling and UX patterns
   */
  onBackdropClick(event: Event): void {
    // Only close if clicking the backdrop itself, not its children
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  /**
   * Handle navigation click - close sidebar on mobile
   * Educational: Responsive UX behavior
   */
  onNavigationClick(): void {
    // Close sidebar after navigation on mobile devices
    this.close();
  }
}