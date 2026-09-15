import { Injectable } from '@angular/core';

// The site only has one look - on-air teletext (black screen, yellow accent).
// This service just stamps that into the favicon once on bootstrap.
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor() {
    this.setFavicon();
  }

  private setFavicon(): void {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <rect width="32" height="32" fill="#000000"/>
        <rect x="1" y="1" width="30" height="30" fill="none" stroke="#ffff00" stroke-width="2"/>
        <text x="16" y="23" font-family="'VT323', 'Courier New', monospace" font-size="18" fill="#ffff00" text-anchor="middle">SV</text>
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
