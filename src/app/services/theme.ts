import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ColorScheme = 'orange' | 'teal';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(true);
  public darkMode$ = this.darkMode.asObservable();

  private colorScheme = new BehaviorSubject<ColorScheme>('orange');
  public colorScheme$ = this.colorScheme.asObservable();

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

    // Check for saved color scheme preference
    const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme;
    if (savedColorScheme && (savedColorScheme === 'orange' || savedColorScheme === 'teal')) {
      this.colorScheme.next(savedColorScheme);
    }

    this.applyTheme();
    this.applyColorScheme();
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

  toggleColorScheme(): void {
    const newValue: ColorScheme = this.colorScheme.value === 'orange' ? 'teal' : 'orange';
    this.colorScheme.next(newValue);
    localStorage.setItem('colorScheme', newValue);
    this.applyColorScheme();
  }

  getColorScheme(): ColorScheme {
    return this.colorScheme.value;
  }

  private applyColorScheme(): void {
    if (this.colorScheme.value === 'teal') {
      document.documentElement.setAttribute('data-color', 'teal');
    } else {
      document.documentElement.removeAttribute('data-color');
    }
    this.updateFavicon();
  }

  private updateFavicon(): void {
    const colors =
      this.colorScheme.value === 'teal'
        ? { start: '#14b8a6', end: '#06b6d4' }
        : { start: '#f97316', end: '#ef4444' };

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.start}"/>
            <stop offset="100%" style="stop-color:${colors.end}"/>
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="6" fill="${this.darkMode.value ? '#0a0a0a' : '#ffffff'}"/>
        <text x="16" y="22" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="800" fill="url(#grad)" text-anchor="middle">SV</text>
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
