import { Component, OnInit, AfterViewInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { PortfolioService } from '../../../services/portfolio';
import { AnimationService } from '../../../services/animation';
import { Project, ProjectCategory } from '../../../models/project.model';
import { ProjectCardComponent } from '../../shared/project-card/project-card';
import { ProjectModalComponent } from '../../shared/project-modal/project-modal';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [ProjectCardComponent, ProjectModalComponent],
  templateUrl: './projects.html',
  styleUrls: ['./projects.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsComponent implements OnInit, AfterViewInit {
  private readonly portfolioService = inject(PortfolioService);
  private readonly animationService = inject(AnimationService);

  projects: Project[] = [];
  filteredProjects: Project[] = [];
  readonly categories: string[] = ['All', 'Featured', 'Web Application', 'Mobile Application'];
  selectedCategory = 'Featured';
  isLoading = false;

  selectedProject: Project | null = null;
  isModalOpen = false;

  ngOnInit(): void {
    this.loadProjects();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.animateProjectCards();
    }, 100);
  }

  private loadProjects(): void {
    this.isLoading = true;
    this.portfolioService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = projects.filter(p => p.featured);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterProjects(category: string): void {
    this.selectedCategory = category;

    if (category === 'All') {
      this.filteredProjects = this.projects;
    } else if (category === 'Featured') {
      this.filteredProjects = this.projects.filter(project => project.featured);
    } else {
      const categoryMap: Record<string, ProjectCategory> = {
        'Web Application': ProjectCategory.WEB_APP,
        'Mobile Application': ProjectCategory.MOBILE_APP
      };

      this.filteredProjects = this.projects.filter(project =>
        project.category === categoryMap[category]
      );
    }

    setTimeout(() => {
      this.animateProjectCards();
    }, 100);
  }

  private animateProjectCards(): void {
    this.animationService.animateStagger('.project-card', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6
    }, 0.1);
  }

  openProjectModal(project: Project): void {
    this.selectedProject = project;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeProjectModal(): void {
    this.isModalOpen = false;
    this.selectedProject = null;
    document.body.style.overflow = '';
  }
}
