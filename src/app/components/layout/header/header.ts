import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AnimationService } from '../../../services/animation';

interface NavLink {
  label: string;
  href: string;
  icon: string;
  page: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly animationService = inject(AnimationService);

  isScrolled = false;
  isMobileMenuOpen = false;
  activeSection = 'home';
  private sectionObserver: IntersectionObserver | null = null;

  readonly navLinks: NavLink[] = [
    { label: 'Home', href: 'home', icon: 'fas fa-home', page: '100' },
    { label: 'About', href: 'about', icon: 'fas fa-user', page: '200' },
    { label: 'Technologies', href: 'technologies', icon: 'fas fa-code', page: '300' },
    { label: 'Projects', href: 'projects', icon: 'fas fa-briefcase', page: '400' },
    { label: 'Experience', href: 'experience', icon: 'fas fa-graduation-cap', page: '500' },
    { label: 'Contact', href: 'contact', icon: 'fas fa-envelope', page: '600' },
  ];

  ngOnInit(): void {
    this.observeActiveSection();
  }

  ngOnDestroy(): void {
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigateToSection(sectionId: string): void {
    this.animationService.scrollToElement(sectionId);
    this.activeSection = sectionId;
    this.isMobileMenuOpen = false;
  }

  private observeActiveSection(): void {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0,
    };

    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.activeSection = entry.target.id;
        }
      });
    }, options);

    document.querySelectorAll('section[id]').forEach((section) => {
      this.sectionObserver!.observe(section);
    });
  }
}
