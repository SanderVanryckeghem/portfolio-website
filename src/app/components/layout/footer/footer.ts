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
            <h3 class="footer-title gradient-text">P100 PORTFOLIO</h3>
            <p class="footer-description">
              Passionate web developer creating amazing digital experiences.
            </p>
          </div>

          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a href="#home">100 Home</a></li>
              <li><a href="#about">200 About</a></li>
              <li><a href="#projects">400 Projects</a></li>
              <li><a href="#contact">600 Contact</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>Services</h4>
            <ul class="footer-links">
              <li>Web</li>
              <li>Mobile</li>
              <li>Frontend</li>
              <li>Fullstack</li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>Connect</h4>
            <app-social-links
              [social]="developer?.social"
              [email]="developer?.email"
              [compact]="true"
            >
            </app-social-links>
          </div>
        </div>

        <div class="fastext-bar">
          <a href="#home" class="fastext-key red">Home</a>
          <a href="#projects" class="fastext-key green">Projects</a>
          <a href="#technologies" class="fastext-key yellow">Skills</a>
          <a href="#contact" class="fastext-key cyan">Contact</a>
        </div>

        <div class="footer-bottom">
          <p>P100 1/1 &middot; &copy; {{ currentYear }} Portfolio &middot; All rights reserved</p>
          <p>Made with <span class="heart">❤</span> using Angular</p>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        background: var(--bg-primary);
        padding: 3rem 0 0;
        margin-top: 5rem;
        border-style: solid;
        border-width: 3px 0 0 0;
        border-image-source: var(--tt-bars);
        border-image-slice: 1;
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
        font-family: var(--font-display);
        font-size: 1.8rem;
        letter-spacing: 1px;
        margin-bottom: 0.5rem;
      }

      .footer-description {
        color: var(--text-secondary);
        line-height: 1.6;
      }

      .footer-section {
        &:nth-child(1) { --section-color: var(--tt-red); }
        &:nth-child(2) { --section-color: var(--tt-cyan); }
        &:nth-child(3) { --section-color: var(--tt-green); }
        &:nth-child(4) { --section-color: var(--tt-magenta); }

        h4 {
          font-family: var(--font-display);
          letter-spacing: 1px;
          margin-bottom: 1rem;
          color: var(--section-color, var(--accent));
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
              color: var(--section-color, var(--accent));
            }
          }
        }
      }

      .fastext-bar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        margin-top: 2rem;

        @media (max-width: 480px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .fastext-key {
        display: block;
        text-align: center;
        padding: 0.75rem 0.5rem;
        font-family: var(--font-display);
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--tt-black);

        &.red { background: var(--tt-red); }
        &.green { background: var(--tt-green); }
        &.yellow { background: var(--tt-yellow); }
        &.cyan { background: var(--tt-cyan); }

        &:hover {
          filter: invert(1);
        }
      }

      .footer-bottom {
        text-align: center;
        padding: 1.5rem 0;
        color: var(--text-secondary);
        font-family: var(--font-mono);
        font-size: 0.85rem;

        p {
          margin: 0.35rem 0;
        }

        .heart {
          color: var(--tt-red);
        }
      }
    `,
  ],
})
export class FooterComponent implements OnInit {
  private readonly portfolioService = inject(PortfolioService);

  readonly currentYear = new Date().getFullYear();
  developer: Developer | null = null;

  ngOnInit(): void {
    this.portfolioService.getDeveloper().subscribe((dev) => {
      this.developer = dev;
    });
  }
}
