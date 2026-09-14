import { Component, OnInit, AfterViewInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { PortfolioService } from '../../../services/portfolio';
import { AnimationService } from '../../../services/animation';
import { Technology, TechCategory } from '../../../models/technology.model';
import { gsap } from 'gsap';

// Pure white/black are deliberately excluded - they'd vanish against the
// theme's own black (on-air) or white (printout) card background. Each
// colour is paired with a text colour that stays readable against it.
const TELETEXT_PALETTE: { color: string; text: string }[] = [
  { color: '#ff0000', text: '#ffffff' }, // red
  { color: '#00ff00', text: '#000000' }, // green
  { color: '#ffff00', text: '#000000' }, // yellow
  { color: '#3b82f6', text: '#ffffff' }, // blue (brightened - pure #0000ff is unreadable on black)
  { color: '#ff00ff', text: '#000000' }, // magenta
  { color: '#00ffff', text: '#000000' }, // cyan
];

@Component({
  selector: 'app-technologies',
  standalone: true,
  imports: [],
  templateUrl: './technologies.html',
  styleUrls: ['./technologies.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnologiesComponent implements OnInit, AfterViewInit {
  private readonly portfolioService = inject(PortfolioService);
  private readonly animationService = inject(AnimationService);

  technologies: Technology[] = [];
  readonly categories = Object.values(TechCategory);
  selectedCategory: TechCategory | 'All' = 'All';
  filteredTechnologies: Technology[] = [];

  ngOnInit(): void {
    this.portfolioService.getTechnologies().subscribe((techs) => {
      this.technologies = techs;
      this.filteredTechnologies = techs;
    });
  }

  ngAfterViewInit(): void {
    // Initial reveal waits for the section to actually enter the viewport.
    setTimeout(() => {
      this.animationService.animateStagger('.tech-card', { opacity: 1, duration: 0.2 }, 0.02);
    }, 100);
  }

  filterByCategory(category: TechCategory | 'All'): void {
    if (this.selectedCategory === category) return;

    this.selectedCategory = category;
    if (category === 'All') {
      this.filteredTechnologies = this.technologies;
    } else {
      this.filteredTechnologies = this.technologies.filter((tech) => tech.category === category);
    }

    setTimeout(() => {
      this.animateItems();
    }, 50);
  }

  private animateItems(): void {
    const cards = document.querySelectorAll('.tech-card');

    gsap.set(cards, { opacity: 0 });

    gsap.to(cards, {
      opacity: 1,
      duration: 0.2,
      stagger: 0.02,
      ease: 'none',
    });
  }

  getTechColor(index: number): string {
    return TELETEXT_PALETTE[index % TELETEXT_PALETTE.length].color;
  }

  getTechText(index: number): string {
    return TELETEXT_PALETTE[index % TELETEXT_PALETTE.length].text;
  }

  getTechGroups(): Map<TechCategory, Technology[]> {
    const groups = new Map<TechCategory, Technology[]>();

    this.filteredTechnologies.forEach((tech) => {
      if (!groups.has(tech.category)) {
        groups.set(tech.category, []);
      }
      groups.get(tech.category)?.push(tech);
    });

    return groups;
  }
}
