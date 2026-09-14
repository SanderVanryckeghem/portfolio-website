import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../services/theme';

const GLYPHS = '█▓▒░#%&*+=-.:· 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CELL_SIZE = 20;
const TUNE_IN_DURATION_MS = 1100;

// Print mode (light) keeps the original, subtle effect. TV mode (dark) is
// boosted - on a white "page" a loud background fights the text, but on the
// black on-air screen it reads as intended interference.
const EFFECT = {
  light: { loudAlphaMin: 0.15, loudAlphaSpan: 0.35, flickerRate: 0.015, accentChance: 0, flickerAlphaMin: 0.04, flickerAlphaSpan: 0.06, accentAlphaMin: 0, accentAlphaSpan: 0, baseAlpha: 0.03 },
  dark: { loudAlphaMin: 0.3, loudAlphaSpan: 0.45, flickerRate: 0.05, accentChance: 0.4, flickerAlphaMin: 0.12, flickerAlphaSpan: 0.15, accentAlphaMin: 0.15, accentAlphaSpan: 0.2, baseAlpha: 0.08 },
};

@Component({
  selector: 'app-particle-background',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <canvas #particleCanvas class="particle-canvas"></canvas> `,
  styles: [
    `
      .particle-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
      }
    `,
  ],
})
export class ParticleBackgroundComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly themeService = inject(ThemeService);
  private ctx!: CanvasRenderingContext2D;
  private animationId!: number;
  private darkModeSubscription!: Subscription;
  private isDark = true;
  private cols = 0;
  private rows = 0;
  private grid: string[] = [];
  private startTime = 0;
  private lastDrawTime = 0;

  private boundHandleResize = this.handleResize.bind(this);

  ngOnInit(): void {
    window.addEventListener('resize', this.boundHandleResize);

    this.darkModeSubscription = this.themeService.darkMode$.subscribe((isDark) => {
      this.isDark = isDark;
    });
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.buildGrid();
    this.startTime = performance.now();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.darkModeSubscription?.unsubscribe();
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

  private buildGrid(): void {
    this.cols = Math.ceil(window.innerWidth / CELL_SIZE);
    this.rows = Math.ceil(window.innerHeight / CELL_SIZE);
    this.grid = Array.from({ length: this.cols * this.rows }, () => this.randomGlyph());
  }

  private randomGlyph(): string {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }

  // "Signal tuning" reveal: dense noise settling into a calm, sparsely flickering grid
  private animate(): void {
    const now = performance.now();
    const elapsed = now - this.startTime;
    const tuneProgress = Math.min(elapsed / TUNE_IN_DURATION_MS, 1);

    // Redraw at ~20fps during the tuning phase, ~10fps once settled - this is a
    // full-grid glyph re-render, not worth doing at 60fps for a background effect.
    const frameInterval = tuneProgress < 1 ? 50 : 100;
    if (now - this.lastDrawTime < frameInterval) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    this.lastDrawTime = now;

    const noiseDensity = 1 - tuneProgress; // fraction of cells drawn as loud static

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.ctx.font = `${CELL_SIZE}px 'VT323', 'Courier New', monospace`;
    this.ctx.textBaseline = 'top';

    const dim = this.isDark ? '255, 255, 255' : '0, 0, 0';
    const accentRgb = this.hexToRgb(this.isDark ? '#ffff00' : '#cc0000');
    const fx = this.isDark ? EFFECT.dark : EFFECT.light;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const index = row * this.cols + col;
        const isLoud = Math.random() < noiseDensity;

        if (isLoud) {
          this.grid[index] = this.randomGlyph();
          const alpha = fx.loudAlphaMin + Math.random() * fx.loudAlphaSpan;
          this.ctx.fillStyle = `rgba(${accentRgb}, ${alpha})`;
        } else if (Math.random() < fx.flickerRate) {
          this.grid[index] = this.randomGlyph();
          if (Math.random() < fx.accentChance) {
            this.ctx.fillStyle = `rgba(${accentRgb}, ${fx.accentAlphaMin + Math.random() * fx.accentAlphaSpan})`;
          } else {
            this.ctx.fillStyle = `rgba(${dim}, ${fx.flickerAlphaMin + Math.random() * fx.flickerAlphaSpan})`;
          }
        } else {
          this.ctx.fillStyle = `rgba(${dim}, ${fx.baseAlpha})`;
        }

        this.ctx.fillText(this.grid[index], col * CELL_SIZE, row * CELL_SIZE);
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  private handleResize(): void {
    this.setCanvasSize();
    this.buildGrid();
  }
}
