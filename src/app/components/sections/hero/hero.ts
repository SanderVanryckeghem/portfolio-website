import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { PortfolioService } from '../../../services/portfolio';
import { AnimationService } from '../../../services/animation';
import { Developer } from '../../../models/developer.model';
import { ParticleBackgroundComponent } from '../../shared/particle-background/particle-background';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [ParticleBackgroundComponent],
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly portfolioService = inject(PortfolioService);
  private readonly animationService = inject(AnimationService);

  developer: Developer | null = null;
  titles: string[] = [
    'Mobile Developer',
    'Frontend Developer',
    'Full Stack Developer'
  ];
  currentTitleIndex = 0;
  private previousTitleIndex: number | null = null;
  private rollingTextIntervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.portfolioService.getDeveloper().subscribe(dev => {
      this.developer = dev;
    });
  }

  ngAfterViewInit(): void {
    this.animationService.animateHero();
    this.animationService.mouseFollow('.hero-content', 0.5);
    this.initRollingText();
  }

  ngOnDestroy(): void {
    if (this.rollingTextIntervalId) {
      clearInterval(this.rollingTextIntervalId);
    }
    this.animationService.destroyRollingText();
  }

  scrollToSection(sectionId: string): void {
    this.animationService.scrollToElement(sectionId);
  }

  private initRollingText(): void {
    setTimeout(() => {
      this.animationService.initRollingText('.rolling-text-container', '.rolling-text');

      this.rollingTextIntervalId = setInterval(() => {
        this.previousTitleIndex = this.currentTitleIndex;
        this.currentTitleIndex = (this.currentTitleIndex + 1) % this.titles.length;
        this.animationService.animateRollingText('.rolling-text', this.currentTitleIndex, this.previousTitleIndex);
      }, 3000);
    }, 100);
  }
}
