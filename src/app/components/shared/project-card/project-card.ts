import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [],
  templateUrl: './project-card.html',
  styleUrls: ['./project-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectCardComponent {
  @Input() project!: Project;
  @Output() viewDetails = new EventEmitter<Project>();

  isImageLoaded = false;

  getProjectImage(): string {
    return this.project.imageUrl || 'assets/images/avatar.png';
  }

  onImageLoad(): void {
    this.isImageLoaded = true;
  }

  onViewDemo(): void {
    if (this.project.demoUrl) {
      window.open(this.project.demoUrl, '_blank');
    }
  }

  onViewCode(): void {
    if (this.project.githubUrl) {
      window.open(this.project.githubUrl, '_blank');
    }
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.project);
  }
}
