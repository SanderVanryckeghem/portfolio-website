import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { AnimationService } from '../../../services/animation';

interface NavLink {
  label: string;
  href: string;
  icon: string;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [],
  templateUrl: './navigation.html',
  styleUrls: ['./navigation.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationComponent {
  private readonly animationService = inject(AnimationService);

  @Input() navLinks: NavLink[] = [];
  @Input() activeSection = 'home';
  @Input() isMobile = false;
  @Output() navigate = new EventEmitter<string>();

  onNavigate(sectionId: string): void {
    this.animationService.scrollToElement(sectionId);
    this.navigate.emit(sectionId);
  }
}
