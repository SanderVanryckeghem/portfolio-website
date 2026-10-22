import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  ElementRef,
  HostListener,
  afterRenderEffect,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TeletextNavService } from '../../../services/teletext-nav';
import { FASTEXT, PAGE } from '../../../services/teletext-pages';
import { TtTarget } from '../../../models/teletext.model';
import { mosaicWord } from '../../../utils/mosaic';
import { TtBlocksComponent } from '../../shared/tt-blocks/tt-blocks';
import { TtLinkDirective } from '../../shared/tt-link/tt-link';
import { ContactComponent } from '../../sections/contact/contact';

// Short service name shown in the header row, Ceefax style ("CEEFAX 1 100").
const SERVICE_NAME = 'SANDERFAX';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Phones (portrait, or a small touch screen held sideways) get a scrolling
// page with larger text instead of the fixed 40x25 screen.
const NARROW_QUERY = '(max-aspect-ratio: 1/1), (pointer: coarse) and (max-height: 599px)';

interface NavLink {
  label: string;
  target: TtTarget;
}

@Component({
  selector: 'app-teletext-screen',
  standalone: true,
  imports: [TtBlocksComponent, TtLinkDirective, ContactComponent],
  templateUrl: './teletext-screen.html',
  styleUrls: ['./teletext-screen.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeletextScreenComponent {
  readonly nav = inject(TeletextNavService);

  readonly serviceName = SERVICE_NAME;
  readonly fastext = FASTEXT.map((key) => ({ ...key, target: { page: key.page } as TtTarget }));
  readonly indexTarget: TtTarget = { page: PAGE.index };
  readonly logo = mosaicWord('SV');
  readonly year = new Date().getFullYear();

  readonly narrow = signal(false);
  readonly now = signal(new Date());
  readonly pageInput = signal('');

  private readonly heading = viewChild<ElementRef<HTMLElement>>('pageHeading');
  private readonly pages = viewChild('pages', { read: ElementRef<HTMLElement> });

  readonly clock = computed(() => {
    const now = this.now();
    return {
      date: `${DAYS[now.getDay()]} ${pad(now.getDate())} ${MONTHS[now.getMonth()]}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      iso: now.toISOString(),
    };
  });

  // The row above the Fastext bar: back / sub-page counter / next.
  readonly navRow = computed(() => {
    const page = this.nav.page();
    const count = this.nav.subCount();
    const sub = Math.min(this.nav.subIndex(), count - 1);

    let back: NavLink | null = null;
    if (sub > 0) back = { label: '◄ Previous', target: { page: page.number, sub: sub - 1 } };
    else if (page.parent) back = { label: `◄ Back ${page.parent}`, target: { page: page.parent } };

    let forward: NavLink | null = null;
    if (sub < count - 1) forward = { label: 'Continued ►', target: { page: page.number, sub: sub + 1 } };
    else if (page.next) forward = { label: `Next ${page.next} ►`, target: { page: page.next } };

    return { back, forward, counter: count > 1 ? `${sub + 1}/${count}` : null };
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    const clock = setInterval(() => this.now.set(new Date()), 1000);

    const narrowQuery = window.matchMedia(NARROW_QUERY);
    const onNarrowChange = () => this.narrow.set(narrowQuery.matches);
    onNarrowChange();
    narrowQuery.addEventListener('change', onNarrowChange);

    const onResize = () => this.measure();
    window.addEventListener('resize', onResize);
    // Bedstead loads with font-display: block; re-measure once it's in.
    document.fonts?.ready.then(() => this.measure());

    destroyRef.onDestroy(() => {
      clearInterval(clock);
      narrowQuery.removeEventListener('change', onNarrowChange);
      window.removeEventListener('resize', onResize);
    });

    // Each new page (or layout) is measured once the browser has laid it out.
    afterRenderEffect(() => {
      this.nav.page();
      this.narrow();
      this.nav.subIndex();
      this.measure();
    });

    // After a user-initiated page change, move focus to the new page title so
    // keyboard and screen reader users land on the new content.
    effect(() => {
      if (this.nav.navigations() === 0) return;
      this.nav.subIndex();
      untracked(() =>
        setTimeout(() => {
          // Phones scroll the page, so start each new page at the top.
          if (this.narrow()) window.scrollTo({ top: 0 });
          this.heading()?.nativeElement.focus({ preventScroll: this.narrow() });
        }),
      );
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')) {
      return;
    }

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      this.nav.enterDigit(event.key);
      return;
    }

    const fastextKey = this.fastext.find((key) => key.colour[0] === event.key.toLowerCase());
    if (fastextKey) {
      event.preventDefault();
      this.nav.goTo(fastextKey.page);
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
        this.nav.nextSub();
        break;
      case 'ArrowLeft':
        this.nav.prevSub();
        break;
      case 'Escape':
        this.nav.cancelEntry();
        break;
    }
  }

  // Tabbing to a link on a later sub-page scrolls it into view; follow along.
  onPagesScroll(): void {
    const el = this.pages()?.nativeElement;
    if (!el || this.narrow()) return;
    this.nav.syncSub(Math.round(el.scrollLeft / el.clientWidth));
  }

  submitPage(event: Event): void {
    event.preventDefault();
    const value = this.pageInput().trim();
    if (/^[1-8]\d\d$/.test(value)) {
      this.nav.goTo(Number(value));
      this.pageInput.set('');
    }
  }

  onPageInput(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 3);
    this.pageInput.set(digits);
    if (/^[1-8]\d\d$/.test(digits)) {
      this.nav.goTo(Number(digits));
      this.pageInput.set('');
    }
  }

  // On the fixed screen, long pages flow into extra CSS columns to the right
  // of the visible one; each column is one sub-page. Count them and show the
  // current one. Phones have no sub-pages: the page just scrolls.
  private measure(): void {
    const el = this.pages()?.nativeElement;
    if (!el || this.narrow()) {
      this.nav.setSubCount(1);
      return;
    }
    const width = el.clientWidth;
    this.nav.setSubCount(Math.max(1, Math.round(el.scrollWidth / width)));
    el.scrollLeft = untracked(() => this.nav.subIndex()) * width;
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
