import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skill-badge',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="skill-badge" [class.animated]="animated">
      {{skill}}
    </span>
  `,
  styles: [`
    .skill-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: var(--bg-card);
      border: 1px solid var(--accent);
      border-radius: 50px;
      color: var(--accent);
      font-size: 0.9rem;
      transition: all var(--transition-base);
      cursor: default;

      &:hover {
        background: var(--accent);
        color: var(--bg-primary);
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
      }

      &.animated {
        animation: float 3s ease-in-out infinite;
        animation-delay: calc(var(--index) * 0.1s);
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }
  `]
})
export class SkillBadgeComponent {
  @Input() skill!: string;
  @Input() animated: boolean = false;
}
