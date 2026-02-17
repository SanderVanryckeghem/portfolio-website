import { Component, OnInit, OnDestroy, HostListener, inject, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { Observable } from 'rxjs';
import { ThemeService } from '../../../services/theme';
import { AnimationService } from '../../../services/animation';

interface NavLink {
  label: string;
  href: string;
  icon: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, NgClass],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly themeService = inject(ThemeService);
  private readonly animationService = inject(AnimationService);

  isDarkMode$: Observable<boolean>;
  isScrolled = false;
  isMobileMenuOpen = false;
  activeSection = 'home';
  private sectionObserver: IntersectionObserver | null = null;

  readonly navLinks: NavLink[] = [
    { label: 'Home', href: 'home', icon: 'fas fa-home' },
    { label: 'About', href: 'about', icon: 'fas fa-user' },
    { label: 'Projects', href: 'projects', icon: 'fas fa-briefcase' },
    { label: 'Technologies', href: 'technologies', icon: 'fas fa-code' },
    { label: 'Experience', href: 'experience', icon: 'fas fa-graduation-cap' },
    { label: 'Contact', href: 'contact', icon: 'fas fa-envelope' }
  ];

  constructor() {
    this.isDarkMode$ = this.themeService.darkMode$;
  }

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

  toggleTheme(): void {
    this.themeService.toggleTheme();
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
      threshold: 0
    };

    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeSection = entry.target.id;
        }
      });
    }, options);

    document.querySelectorAll('section[id]').forEach(section => {
      this.sectionObserver!.observe(section);
    });
  }
}
