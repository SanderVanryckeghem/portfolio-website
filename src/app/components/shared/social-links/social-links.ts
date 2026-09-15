import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { SocialLinks } from '../../../models/developer.model';

@Component({
  selector: 'app-social-links',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="social-links" [class.compact]="compact">
      @if (social?.github) {
        <a [href]="social.github" target="_blank" class="social-link" title="GitHub">
          <i class="fab fa-github"></i>
        </a>
      }
      @if (social?.linkedin) {
        <a [href]="social.linkedin" target="_blank" class="social-link" title="LinkedIn">
          <i class="fab fa-linkedin"></i>
        </a>
      }
      @if (email) {
        <a [href]="'mailto:' + email" class="social-link" title="Email">
          <i class="fas fa-envelope"></i>
        </a>
      }
    </div>
  `,
  styles: [
    `
      .social-links {
        display: flex;
        gap: 1rem;
      }

      .social-link {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 2px solid var(--border-color);
        color: var(--text-secondary);
        font-size: 1.2rem;
        transition: all var(--transition-base);
        text-decoration: none;

        &:nth-child(3n+1) { --item-color: var(--tt-magenta); }
        &:nth-child(3n+2) { --item-color: var(--tt-cyan); }
        &:nth-child(3n+3) { --item-color: var(--tt-green); }

        &:hover {
          background: var(--item-color, var(--accent));
          border-color: var(--item-color, var(--accent));
          color: var(--tt-black);
        }
      }

      .compact .social-link {
        width: 40px;
        height: 40px;
        font-size: 1rem;
      }
    `,
  ],
})
export class SocialLinksComponent {
  @Input() social: SocialLinks | undefined;
  @Input() email: string | undefined;
  @Input() compact = false;
}
