import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

@Component({
  selector: 'app-particle-background',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas #particleCanvas class="particle-canvas"></canvas>
  `,
  styles: [`
    .particle-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.5;
      z-index: 1;
    }
  `]
})
export class ParticleBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId!: number;
  private mouseX = 0;
  private mouseY = 0;

  private boundHandleMouseMove = this.handleMouseMove.bind(this);
  private boundHandleResize = this.handleResize.bind(this);

  ngOnInit(): void {
    window.addEventListener('mousemove', this.boundHandleMouseMove);
    window.addEventListener('resize', this.boundHandleResize);
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.createParticles();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('mousemove', this.boundHandleMouseMove);
    window.removeEventListener('resize', this.boundHandleResize);
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.setCanvasSize();
  }

  private setCanvasSize(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private createParticles(): void {
    const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  private animate(): void {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Update and draw particles
    this.particles.forEach(particle => {
      // Mouse interaction
      const dx = this.mouseX - particle.x;
      const dy = this.mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.vx -= (dx / distance) * force * 0.5;
        particle.vy -= (dy / distance) * force * 0.5;
      }

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Bounce off walls
      if (particle.x < 0 || particle.x > window.innerWidth) {
        particle.vx *= -1;
      }
      if (particle.y < 0 || particle.y > window.innerHeight) {
        particle.vy *= -1;
      }

      // Keep particles in bounds
      particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
      particle.y = Math.max(0, Math.min(window.innerHeight, particle.y));

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(102, 126, 234, ${particle.opacity})`;
      this.ctx.fill();
    });

    // Draw connections
    this.drawConnections();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private drawConnections(): void {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const opacity = (120 - distance) / 120 * 0.3;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  private handleResize(): void {
    this.setCanvasSize();
    this.particles = [];
    this.createParticles();
  }
}
