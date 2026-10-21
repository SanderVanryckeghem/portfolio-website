import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { PAGE, TeletextPagesService } from './teletext-pages';
import { COLS } from '../utils/teletext-layout';

// Old single-page section anchors keep working as links into the new pages.
const LEGACY_ANCHORS: Record<string, number> = {
  home: PAGE.index,
  about: PAGE.about,
  technologies: PAGE.technologies,
  projects: PAGE.projects,
  experience: PAGE.experience,
  contact: PAGE.contact,
};

const SCANLINES_KEY = 'tt-scanlines';
const SEARCH_STEP_MS = 35;
const SEARCH_STEPS = 16;
// A missing page "searches" for longer before giving up, like a real set would.
const SEARCH_STEPS_MISSING = 45;
const ENTRY_TIMEOUT_MS = 5000;

interface Location {
  page: number;
  sub: number;
}

/**
 * Teletext-style navigation: which page and sub-page is on screen, the digits
 * being keyed in, and the brief "searching" phase where the header page
 * number counts up before the requested page arrives. Pages are addressed in
 * the URL hash (#201, #301/2) so links, reloads and the back button work.
 */
@Injectable({
  providedIn: 'root',
})
export class TeletextNavService {
  private readonly pagesService = inject(TeletextPagesService);

  readonly pageNumber = signal<number>(PAGE.index);
  readonly subIndex = signal(0);
  // Digits keyed in so far ('' when not entering a page number).
  readonly entry = signal('');
  // Page being searched for, or null once it is on screen.
  readonly searching = signal<number | null>(null);
  // The rolling page counter in the header.
  readonly rolling = signal<number>(PAGE.index);
  readonly scanlines = signal(readScanlinesPreference());
  // Bumped on every user-initiated page change so the screen can move focus.
  readonly navigations = signal(0);

  // Width of the character grid: 40 on desktop, fewer (larger text) on phones.
  readonly columns = signal(COLS);

  readonly page = computed(
    () =>
      this.pagesService.get(this.pageNumber(), this.columns()) ??
      this.pagesService.notFound(this.pageNumber(), this.columns()),
  );
  readonly subCount = computed(() => this.page().subPages.length);
  readonly subPage = computed(() => {
    const subPages = this.page().subPages;
    return subPages[Math.min(this.subIndex(), subPages.length - 1)] ?? [];
  });

  readonly requested = computed(() => {
    const entry = this.entry();
    if (entry) return 'P' + entry.padEnd(3, '-');
    return 'P' + (this.searching() ?? this.pageNumber());
  });

  private searchTimer: ReturnType<typeof setInterval> | null = null;
  private entryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const initial = parseHash(window.location.hash);
    this.show(initial.page, initial.sub, false);
    if (window.location.hash) window.history.replaceState(null, '', hashFor(initial));

    // Fires for back/forward and for hash links followed by the browser itself.
    window.addEventListener('popstate', () => {
      const target = parseHash(window.location.hash);
      this.goTo(target.page, target.sub, false);
    });

    effect(() => {
      const page = this.page();
      const owner = this.pagesService.get(PAGE.index)?.title;
      const sub = this.subCount() > 1 ? ` (${this.subIndex() + 1}/${this.subCount()})` : '';
      document.title = `P${page.number} ${page.title}${sub}${owner && owner !== page.title ? ' | ' + owner : ''}`;
    });
  }

  goTo(page: number, sub = 0, updateUrl = true): void {
    this.cancelEntry();
    this.stopSearch();

    if (page === this.pageNumber()) {
      this.setSub(sub, updateUrl);
      return;
    }

    if (updateUrl) window.history.pushState(null, '', hashFor({ page, sub }));

    if (prefersReducedMotion()) {
      this.show(page, sub, true);
      return;
    }

    this.searching.set(page);
    let steps = this.pagesService.get(page) ? SEARCH_STEPS : SEARCH_STEPS_MISSING;
    this.searchTimer = setInterval(() => {
      this.rolling.update((n) => (n >= 899 ? 100 : n + 1));
      if (--steps <= 0) {
        this.stopSearch();
        this.show(page, sub, true);
      }
    }, SEARCH_STEP_MS);
  }

  nextSub(): void {
    if (this.subIndex() < this.subCount() - 1) this.setSub(this.subIndex() + 1);
  }

  prevSub(): void {
    if (this.subIndex() > 0) this.setSub(this.subIndex() - 1);
  }

  // A digit pressed on the "remote". Three digits make a page number (100-899).
  enterDigit(digit: string): void {
    const entry = this.entry();
    if (!entry && (digit === '0' || digit === '9')) return;

    const next = entry + digit;
    if (this.entryTimer) clearTimeout(this.entryTimer);
    if (next.length === 3) {
      this.goTo(Number(next));
      return;
    }
    this.entry.set(next);
    this.entryTimer = setTimeout(() => this.cancelEntry(), ENTRY_TIMEOUT_MS);
  }

  cancelEntry(): void {
    if (this.entryTimer) clearTimeout(this.entryTimer);
    this.entryTimer = null;
    this.entry.set('');
  }

  toggleScanlines(): void {
    this.scanlines.update((on) => !on);
    try {
      localStorage.setItem(SCANLINES_KEY, this.scanlines() ? 'on' : 'off');
    } catch {
      // Storage unavailable (private mode) - the toggle still works for this visit.
    }
  }

  private setSub(sub: number, updateUrl = true): void {
    const clamped = Math.max(0, Math.min(sub, this.subCount() - 1));
    if (clamped === this.subIndex()) return;
    this.subIndex.set(clamped);
    this.navigations.update((n) => n + 1);
    if (updateUrl) {
      window.history.replaceState(null, '', hashFor({ page: this.pageNumber(), sub: clamped }));
    }
  }

  private show(page: number, sub: number, userInitiated: boolean): void {
    this.pageNumber.set(page);
    this.subIndex.set(Math.max(0, Math.min(sub, this.subCount() - 1)));
    this.rolling.set(page);
    this.searching.set(null);
    if (userInitiated) this.navigations.update((n) => n + 1);
  }

  private stopSearch(): void {
    if (this.searchTimer) clearInterval(this.searchTimer);
    this.searchTimer = null;
    this.searching.set(null);
  }
}

function parseHash(hash: string): Location {
  const value = hash.replace(/^#\/?/, '').toLowerCase();
  if (Object.hasOwn(LEGACY_ANCHORS, value)) return { page: LEGACY_ANCHORS[value], sub: 0 };
  const match = /^p?([1-8]\d\d)(?:\/(\d+))?$/.exec(value);
  if (!match) return { page: PAGE.index, sub: 0 };
  return { page: Number(match[1]), sub: match[2] ? Math.max(0, Number(match[2]) - 1) : 0 };
}

function hashFor({ page, sub }: Location): string {
  return `#${page}${sub > 0 ? '/' + (sub + 1) : ''}`;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function readScanlinesPreference(): boolean {
  try {
    return localStorage.getItem(SCANLINES_KEY) !== 'off';
  } catch {
    return true;
  }
}
