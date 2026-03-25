import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ColorScheme = 'orange' | 'teal';

@Injectable({
  providedIn: 'root'
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
  }
}
