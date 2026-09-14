import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(true);
  public darkMode$ = this.darkMode.asObservable();

  constructor() {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.darkMode.next(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkMode.next(prefersDark);
    }

    this.applyTheme();
  }

  toggleTheme(): void {
    const newValue = !this.darkMode.value;
    this.darkMode.next(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
    this.applyTheme();
  }

  setDarkMode(isDark: boolean): void {
    this.darkMode.next(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.darkMode.value) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    this.updateFavicon();
  }

  isDarkMode(): boolean {
    return this.darkMode.value;
  }

  private updateFavicon(): void {
    const accent = this.darkMode.value ? '#ffff00' : '#cc0000';
    const bg = this.darkMode.value ? '#000000' : '#ffffff';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <rect width="32" height="32" fill="${bg}"/>
        <rect x="1" y="1" width="30" height="30" fill="none" stroke="${accent}" stroke-width="2"/>
        <text x="16" y="23" font-family="'VT323', 'Courier New', monospace" font-size="18" fill="${accent}" text-anchor="middle">SV</text>
      </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = url;
  }
}
