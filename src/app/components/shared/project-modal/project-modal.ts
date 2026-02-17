import { Component, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [],
  templateUrl: './project-modal.html',
  styleUrls: ['./project-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectModalComponent {
  @Input() project: Project | null = null;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.close();
  }

  close(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  getProjectImage(): string {
    return this.project?.imageUrl || 'assets/images/project-placeholder.jpg';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }
}
