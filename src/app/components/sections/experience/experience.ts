import { Component, OnInit, AfterViewInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { PortfolioService } from '../../../services/portfolio';
import { AnimationService } from '../../../services/animation';
import { Experience } from '../../../models/experience.model';
import { Certificate } from '../../../models/certificate.model';

interface Education {
  degree: string;
  institution: string;
  year: string;
  description: string;
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [],
  templateUrl: './experience.html',
  styleUrls: ['./experience.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperienceComponent implements OnInit, AfterViewInit {
  private readonly portfolioService = inject(PortfolioService);
  private readonly animationService = inject(AnimationService);

  experiences: Experience[] = [];
  certificates: Certificate[] = [];
  readonly education: Education[] = [
    {
      degree: 'Bachelor Elektronica-ICT (Web & Mobile technologies)',
      institution: 'Odisee',
      year: '2020 - 2023',
      description: 'Focus on software engineering, web development and mobile development'
    },
    {
      degree: 'Industriële ICT',
      institution: 'VTI Waregem',
      year: '2017 - 2020',
      description: 'Technical secondary education'
    }
  ];

  ngOnInit(): void {
    this.portfolioService.getExperiences().subscribe(exp => {
      this.experiences = exp;
    });
    this.portfolioService.getCertificates().subscribe(certs => {
      this.certificates = certs;
    });
  }

  ngAfterViewInit(): void {
    this.animationService.animateTimeline('.timeline-item');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  formatCertDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  }
}
