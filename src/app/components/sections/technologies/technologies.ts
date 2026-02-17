import { Component, OnInit, AfterViewInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { PortfolioService } from '../../../services/portfolio';
import { Technology, TechCategory } from '../../../models/technology.model';
import { gsap } from 'gsap';

@Component({
  selector: 'app-technologies',
  standalone: true,
  imports: [],
  templateUrl: './technologies.html',
  styleUrls: ['./technologies.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechnologiesComponent implements OnInit, AfterViewInit {
  private readonly portfolioService = inject(PortfolioService);

  technologies: Technology[] = [];
  readonly categories = Object.values(TechCategory);
  selectedCategory: TechCategory | 'All' = 'All';
  filteredTechnologies: Technology[] = [];

  ngOnInit(): void {
    this.portfolioService.getTechnologies().subscribe(techs => {
      this.technologies = techs;
      this.filteredTechnologies = techs;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.animateItems(), 100);
  }

  filterByCategory(category: TechCategory | 'All'): void {
    if (this.selectedCategory === category) return;

    this.selectedCategory = category;
    if (category === 'All') {
      this.filteredTechnologies = this.technologies;
    } else {
      this.filteredTechnologies = this.technologies.filter(
        tech => tech.category === category
      );
    }

    setTimeout(() => {
      this.animateItems();
    }, 50);
  }

  private animateItems(): void {
    const cards = document.querySelectorAll('.tech-card');

    gsap.set(cards, { opacity: 0, scale: 0.8, rotation: -5 });

    gsap.to(cards, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.4,
      stagger: 0.04,
      ease: 'back.out(1.4)'
    });
  }

  getTechGroups(): Map<TechCategory, Technology[]> {
    const groups = new Map<TechCategory, Technology[]>();

    this.filteredTechnologies.forEach(tech => {
      if (!groups.has(tech.category)) {
        groups.set(tech.category, []);
      }
      groups.get(tech.category)?.push(tech);
    });

    return groups;
  }
}
