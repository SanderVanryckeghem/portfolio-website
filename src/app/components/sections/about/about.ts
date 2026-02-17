import { Component, OnInit, AfterViewInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { PortfolioService } from '../../../services/portfolio';
import { AnimationService } from '../../../services/animation';
import { Developer } from '../../../models/developer.model';
import { SkillBadgeComponent } from '../../shared/skill-badge/skill-badge';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [SkillBadgeComponent],
  templateUrl: './about.html',
  styleUrls: ['./about.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent implements OnInit, AfterViewInit {
  private readonly portfolioService = inject(PortfolioService);
  private readonly animationService = inject(AnimationService);

  developer: Developer | null = null;

  readonly stats = [
    { label: 'Years Experience', value: '2+', icon: 'fas fa-calendar-alt' },
    { label: 'Projects Completed', value: '3+', icon: 'fas fa-check-circle' },
    { label: 'Happy Clients', value: '3+', icon: 'fas fa-smile' },
    { label: 'Code Commits', value: '2000+', icon: 'fas fa-code-branch' }
  ];

  ngOnInit(): void {
    this.portfolioService.getDeveloper().subscribe(dev => {
      this.developer = dev;
    });
  }

  ngAfterViewInit(): void {
    this.animationService.animateOnScroll('.about-image', {
      opacity: 1,
      scale: 1,
      duration: 1
    });

    this.animationService.animateOnScroll('.about-content', {
      opacity: 1,
      x: 0,
      duration: 1
    });

    this.animationService.animateStagger('.stat-card', {
      opacity: 1,
      y: 0,
      duration: 0.6
    }, 0.1);
  }
}
