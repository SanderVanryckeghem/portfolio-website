import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';

const GLYPHS = '█▓▒░#%&*+=-.:· 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CELL_SIZE = 20;
const TUNE_IN_DURATION_MS = 1100;

const EFFECT = {
  loudAlphaMin: 0.3,
  loudAlphaSpan: 0.45,
  flickerRate: 0.05,
  accentChance: 0.4,
  flickerAlphaMin: 0.12,
  flickerAlphaSpan: 0.15,
  accentAlphaMin: 0.15,
  accentAlphaSpan: 0.2,
  baseAlpha: 0.08,
};

// Mix of the teletext palette rather than one fixed accent colour
const ACCENT_RGB_OPTIONS = [
  '255, 0, 0', // red
  '0, 255, 0', // green
  '255, 255, 0', // yellow
  '0, 255, 255', // cyan
  '59, 130, 246', // bright blue
  '255, 0, 255', // magenta
];
const DIM_RGB = '255, 255, 255';

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

  private ctx!: CanvasRenderingContext2D;
  private animationId!: number;
  private cols = 0;
  private rows = 0;
  private grid: string[] = [];
  private startTime = 0;
  private lastDrawTime = 0;

  private boundHandleResize = this.handleResize.bind(this);

  ngOnInit(): void {
    window.addEventListener('resize', this.boundHandleResize);
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

  private randomAccentRgb(): string {
    return ACCENT_RGB_OPTIONS[Math.floor(Math.random() * ACCENT_RGB_OPTIONS.length)];
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

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const index = row * this.cols + col;
        const isLoud = Math.random() < noiseDensity;

        if (isLoud) {
          this.grid[index] = this.randomGlyph();
          const alpha = EFFECT.loudAlphaMin + Math.random() * EFFECT.loudAlphaSpan;
          this.ctx.fillStyle = `rgba(${this.randomAccentRgb()}, ${alpha})`;
        } else if (Math.random() < EFFECT.flickerRate) {
          this.grid[index] = this.randomGlyph();
          if (Math.random() < EFFECT.accentChance) {
            this.ctx.fillStyle = `rgba(${this.randomAccentRgb()}, ${EFFECT.accentAlphaMin + Math.random() * EFFECT.accentAlphaSpan})`;
          } else {
            this.ctx.fillStyle = `rgba(${DIM_RGB}, ${EFFECT.flickerAlphaMin + Math.random() * EFFECT.flickerAlphaSpan})`;
          }
        } else {
          this.ctx.fillStyle = `rgba(${DIM_RGB}, ${EFFECT.baseAlpha})`;
        }

        this.ctx.fillText(this.grid[index], col * CELL_SIZE, row * CELL_SIZE);
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private handleResize(): void {
    this.setCanvasSize();
    this.buildGrid();
  }
}
