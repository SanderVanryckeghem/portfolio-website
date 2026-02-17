import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { PortfolioService } from '../../../services/portfolio';
import { Developer } from '../../../models/developer.model';
import { SocialLinksComponent } from '../../shared/social-links/social-links';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [SocialLinksComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3 class="footer-title gradient-text">Portfolio</h3>
            <p class="footer-description">
              Passionate web developer creating amazing digital experiences.
            </p>
          </div>

          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">Over mij</a></li>
              <li><a href="#projects">Projecten</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>Services</h4>
            <ul class="footer-links">
              <li>Web Development</li>
              <li>UI/UX Design</li>
              <li>Consulting</li>
              <li>Maintenance</li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>Connect</h4>
            <app-social-links
              [social]="developer?.social"
              [email]="developer?.email"
              [compact]="true">
            </app-social-links>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; {{currentYear}} Portfolio. All rights reserved.</p>
          <p>Made with <span class="heart">❤</span> using Angular</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--bg-primary);
      padding: 3rem 0 1rem;
      margin-top: 5rem;
      border-top: 1px solid var(--border-color);
    }

    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3rem;
      margin-bottom: 2rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    .footer-title {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
    }

    .footer-description {
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .footer-section {
      h4 {
        margin-bottom: 1rem;
        color: var(--text-primary);
      }
    }

    .footer-links {
      list-style: none;

      li {
        margin-bottom: 0.5rem;
        color: var(--text-secondary);

        a {
          color: var(--text-secondary);
          text-decoration: none;
          transition: color var(--transition-base);

          &:hover {
            color: var(--accent);
          }
        }
      }
    }

    .footer-bottom {
      text-align: center;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      color: var(--text-secondary);

      p {
        margin: 0.5rem 0;
      }

      .heart {
        color: #ff4444;
        animation: heartbeat 1.5s ease-in-out infinite;
      }
    }

    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `]
})
export class FooterComponent implements OnInit {
  private readonly portfolioService = inject(PortfolioService);

  readonly currentYear = new Date().getFullYear();
  developer: Developer | null = null;

  ngOnInit(): void {
    this.portfolioService.getDeveloper().subscribe(dev => {
      this.developer = dev;
    });
  }
}
