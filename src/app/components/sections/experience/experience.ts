import { Component, OnInit, AfterViewInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { PortfolioService } from '../../../services/portfolio';
import { AnimationService } from '../../../services/animation';
import { Experience } from '../../../models/experience.model';
import { Certificate } from '../../../models/certificate.model';
import { Education } from '../../../models/education.model';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [],
  templateUrl: './experience.html',
  styleUrls: ['./experience.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent implements OnInit, AfterViewInit {
  private readonly portfolioService = inject(PortfolioService);
  private readonly animationService = inject(AnimationService);

  experiences: Experience[] = [];
  certificates: Certificate[] = [];
  education: Education[] = [];

  ngOnInit(): void {
    this.portfolioService.getExperiences().subscribe((exp) => {
      this.experiences = exp;
    });
    this.portfolioService.getCertificates().subscribe((certs) => {
      this.certificates = certs;
    });
    this.portfolioService.getEducation().subscribe((edu) => {
      this.education = edu;
    });
  }

  ngAfterViewInit(): void {
    this.animationService.animateTimeline('.timeline-item');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  }

  formatCertDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  }
}

export type { Experience };
