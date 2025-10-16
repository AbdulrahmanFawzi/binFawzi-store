import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
}

@Component({
  selector: 'app-order-confirmed',
  standalone: true,
  imports: [CommonModule, TranslateModule, HeaderComponent],
  template: `
    <!-- Confetti Canvas Background -->
    <canvas 
      #confettiCanvas
      class="confetti-canvas"
      width="1920"
      height="1080">
    </canvas>

    <!-- Header Component -->
    <app-header></app-header>

    <!-- Main Content -->
    <main class="order-confirmed-page">
      <div class="container">
        <!-- Success Content -->
        <div class="success-content">
          
          <!-- Success Icon -->
          <div class="success-icon">
            <div class="icon-circle">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
          </div>

          <!-- Success Message -->
          <div class="success-message">
            <h1 class="success-title">{{ 'orderConfirmed.title' | translate }}</h1>
            <p class="success-subtitle">{{ 'orderConfirmed.subtitle' | translate }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button 
              class="btn btn-primary"
              (click)="continueShopping()">
              {{ 'orderConfirmed.continueShopping' | translate }}
            </button>
            
            <button 
              class="btn btn-secondary"
              (click)="backToHome()">
              {{ 'orderConfirmed.backToHome' | translate }}
            </button>
          </div>

        </div>
      </div>
    </main>
  `,
  styleUrls: ['./order-confirmed.component.scss']
})
export class OrderConfirmedComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('confettiCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId!: number;
  private isAnimating = false;
  private startTime!: number;
  private readonly ANIMATION_DURATION = 4000; // 4 seconds

  // Particle colors matching the design
  private readonly PARTICLE_COLORS = [
    '#dc3545', // Red (primary)
    '#ffffff', // White
    '#e9ecef', // Light gray
    '#6c757d', // Gray
    '#dc3545aa', // Semi-transparent red
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    this.initializeCanvas();
    this.startConfettiAnimation();
  }

  ngOnDestroy(): void {
    this.stopAnimation();
  }

  /**
   * Initialize the canvas for confetti animation
   */
  private initializeCanvas(): void {
    if (!this.canvasRef?.nativeElement) {
      console.error('Canvas element not found');
      return;
    }

    this.canvas = this.canvasRef.nativeElement;
    const context = this.canvas.getContext('2d');
    
    if (!context) {
      console.error('Cannot get canvas context');
      return;
    }
    
    this.ctx = context;
    
    // Set canvas size to full viewport
    this.resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', () => this.resizeCanvas());
    
    console.log('Canvas initialized:', this.canvas.width, 'x', this.canvas.height);
  }

  /**
   * Resize canvas to match viewport
   */
  private resizeCanvas(): void {
    if (!this.canvas) return;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Set canvas style to ensure it covers the viewport
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
  }

  /**
   * Start the confetti animation
   */
  private startConfettiAnimation(): void {
    if (!this.ctx || !this.canvas) {
      console.error('Canvas not initialized, cannot start animation');
      return;
    }
    
    console.log('Starting confetti animation');
    this.isAnimating = true;
    this.startTime = Date.now();
    this.createInitialParticles();
    this.animate();
  }

  /**
   * Create initial burst of particles
   */
  private createInitialParticles(): void {
    const particleCount = 60; // Number of particles
    
    for (let i = 0; i < particleCount; i++) {
      this.createParticle();
    }
    
    console.log(`Created ${this.particles.length} particles`);
  }

  /**
   * Create a single particle
   */
  private createParticle(): void {
    const particle: Particle = {
      x: Math.random() * this.canvas.width,
      y: -20, // Start above viewport
      vx: (Math.random() - 0.5) * 4, // Horizontal drift
      vy: Math.random() * 3 + 2, // Falling speed
      size: Math.random() * 8 + 4, // Random size
      color: this.PARTICLE_COLORS[Math.floor(Math.random() * this.PARTICLE_COLORS.length)],
      opacity: 1,
      life: 0,
      maxLife: 3000 + Math.random() * 2000 // 3-5 seconds
    };
    
    this.particles.push(particle);
  }

  /**
   * Animation loop
   */
  private animate(): void {
    if (!this.isAnimating) return;

    const currentTime = Date.now();
    const elapsed = currentTime - this.startTime;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and render particles
    this.updateParticles();
    this.renderParticles();

    // Continue creating new particles for first 2 seconds
    if (elapsed < 2000 && Math.random() < 0.3) {
      this.createParticle();
    }

    // Stop animation after duration
    if (elapsed > this.ANIMATION_DURATION && this.particles.length === 0) {
      this.stopAnimation();
      return;
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Update particle physics
   */
  private updateParticles(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Apply gravity
      particle.vy += 0.1;
      
      // Apply air resistance
      particle.vx *= 0.99;
      
      // Update life and opacity
      particle.life += 16; // Approximate 60fps
      particle.opacity = Math.max(0, 1 - (particle.life / particle.maxLife));
      
      // Remove dead or off-screen particles
      if (particle.life > particle.maxLife || 
          particle.y > this.canvas.height + 50 ||
          particle.x < -50 || 
          particle.x > this.canvas.width + 50) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render all particles
   */
  private renderParticles(): void {
    this.particles.forEach(particle => {
      this.ctx.save();
      
      // Set particle style
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fillStyle = particle.color;
      
      // Draw particle (circle or square randomly)
      if (Math.random() > 0.5) {
        // Circle
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Square
        this.ctx.fillRect(
          particle.x - particle.size / 2, 
          particle.y - particle.size / 2, 
          particle.size, 
          particle.size
        );
      }
      
      this.ctx.restore();
    });
  }

  /**
   * Stop the animation
   */
  private stopAnimation(): void {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.particles = [];
  }

  /**
   * Navigate to products page
   */
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Navigate to landing page
   */
  backToHome(): void {
    this.router.navigate(['/landing']);
  }
}