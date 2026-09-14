import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from './components/layout/header/header';
import { FooterComponent } from './components/layout/footer/footer';
import { HeroComponent } from './components/sections/hero/hero';
import { AboutComponent } from './components/sections/about/about';
import { ProjectsComponent } from './components/sections/projects/projects';
import { TechnologiesComponent } from './components/sections/technologies/technologies';
import { ExperienceComponent } from './components/sections/experience/experience';
import { ContactComponent } from './components/sections/contact/contact';
import { ThemeService } from './services/theme';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    HeroComponent,
    AboutComponent,
    ProjectsComponent,
    TechnologiesComponent,
    ExperienceComponent,
    ContactComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements OnInit {
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    // Initialize theme
    this.themeService.darkMode$.subscribe();
  }
}
