import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skill-badge',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="skill-badge" [class.animated]="animated">
      {{ skill }}
    </span>
  `,
  styles: [
    `
      .skill-badge {
        display: inline-block;
        padding: 0.4rem 0.9rem;
        background: transparent;
        border: 1px solid var(--skill-color, var(--accent));
        color: var(--skill-color, var(--accent));
        font-family: var(--font-display);
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 1rem;
        transition: all var(--transition-base);
        cursor: default;

        &:hover {
          background: var(--skill-color, var(--accent));
          color: var(--bg-primary);
        }
      }
    `,
  ],
})
export class SkillBadgeComponent {
  @Input() skill!: string;
  @Input() animated: boolean = false;
}
