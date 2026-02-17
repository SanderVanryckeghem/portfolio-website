import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loader-container">
      <div class="loader">
        <div class="loader-inner">
          <div class="loader-circle"></div>
          <div class="loader-circle"></div>
          <div class="loader-circle"></div>
        </div>
        <p class="loader-text">Loading...</p>
      </div>
    </div>
  `,
  styles: [`
    .loader-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--bg-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }

    .loader {
      text-align: center;
    }

    .loader-inner {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .loader-circle {
      width: 15px;
      height: 15px;
      background: var(--accent);
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .loader-circle:nth-child(1) {
      animation-delay: -0.32s;
    }

    .loader-circle:nth-child(2) {
      animation-delay: -0.16s;
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    .loader-text {
      color: var(--text-secondary);
      font-size: 1.1rem;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
  `]
})
export class LoaderComponent {}
