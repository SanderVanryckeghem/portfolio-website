import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TeletextNavService } from '../../../services/teletext-nav';
import { FASTEXT } from '../../../services/teletext-pages';
import { TtBlock, TtNode, TtRow, TtSpan } from '../../../models/teletext.model';
import { COLS, MARGIN, ROWS, blockHeight } from '../../../utils/teletext-layout';
import { TtRowsComponent } from '../../shared/tt-rows/tt-rows';
import { ContactComponent } from '../../sections/contact/contact';

// Short service name shown in the header row, Ceefax style ("CEEFAX 1 100").
const SERVICE_NAME = 'SANDERFAX';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Space left around the screen: 16px side gutters plus room for the remote strip.
const GUTTER = 16;
// Target width of one character cell on phones (px). The grid gets as many
// columns as fit at this size (20-40), so text stays large and clear.
const MOBILE_CELL = 12;
const REMOTE_ALLOWANCE = 88;

@Component({
  selector: 'app-teletext-screen',
  standalone: true,
  imports: [TtRowsComponent, ContactComponent],
  templateUrl: './teletext-screen.html',
  styleUrls: ['./teletext-screen.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeletextScreenComponent {
  readonly nav = inject(TeletextNavService);

  readonly fastext = FASTEXT;
  readonly rows = ROWS;
  readonly margin = MARGIN;
  readonly year = new Date().getFullYear();

  readonly fontSize = signal(16);
  readonly narrow = signal(false);
  readonly cols = signal(COLS);
  readonly now = signal(new Date());
  readonly pageInput = signal('');

  private readonly heading = viewChild('pageHeading', { read: ElementRef });

  readonly header = computed(() => {
    const now = this.now();
    const date = `${DAYS[now.getDay()]} ${pad(now.getDate())} ${MONTHS[now.getMonth()]}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const cols = this.cols();
    const requested = this.nav.requested().padEnd(cols < COLS ? 5 : 6);
    // On a narrow grid drop the date, then the service name, until the row fits.
    let day = date + ' ';
    let service = `${SERVICE_NAME} ${this.nav.rolling()}`;
    const used = () => requested.length + service.length + day.length + time.length + 1;
    if (used() > cols) day = '';
    if (used() > cols) service = String(this.nav.rolling());
    const gap = ' '.repeat(Math.max(1, cols - used() + 1));
    return { requested, service, gap, date: day, time, datetime: now.toISOString() };
  });

  readonly titleRows = computed(() => {
    const masthead = this.nav.page().masthead;
    return masthead ? blockHeight(masthead) : 2;
  });

  // Rows between the title band and the navigation row.
  readonly contentRows = computed(() => ROWS - 3 - this.titleRows());

  // The row above the Fastext bar: back / sub-page counter / next.
  readonly navRow = computed<TtRow>(() => {
    const page = this.nav.page();
    const count = this.nav.subCount();
    const sub = Math.min(this.nav.subIndex(), count - 1);

    let left: TtSpan | null = null;
    if (sub > 0) left = { text: '◄ Previous', fg: 'cyan', link: { page: page.number, sub: sub - 1 } };
    else if (page.parent) left = { text: `◄ Back ${page.parent}`, fg: 'cyan', link: { page: page.parent } };

    let right: TtSpan | null = null;
    if (sub < count - 1) right = { text: 'Continued ►', fg: 'cyan', link: { page: page.number, sub: sub + 1 } };
    else if (page.next) right = { text: `Next ${page.next} ►`, fg: 'cyan', link: { page: page.next } };

    const middle: TtSpan | null = count > 1 ? { text: `${sub + 1}/${count}`, fg: 'white' } : null;

    if (!left && !right && !middle && page.footer) return page.footer;
    return placeRow(left, middle, right, this.cols());
  });

  readonly navRows = computed(() => [this.navRow()]);

  readonly fastextGaps = computed(() => {
    const used = this.fastext.reduce((sum, key) => sum + key.label.length, 0);
    const between = Math.floor((COLS - 1 - used) / (this.fastext.length - 1));
    return ' '.repeat(between);
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    const clock = setInterval(() => this.now.set(new Date()), 1000);
    const onResize = () => this.fit();
    window.addEventListener('resize', onResize);
    this.fit();

    destroyRef.onDestroy(() => {
      clearInterval(clock);
      window.removeEventListener('resize', onResize);
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

  goToFastext(event: Event, page: number): void {
    event.preventDefault();
    this.nav.goTo(page);
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

  listItems(node: TtNode): TtBlock[] | null {
    return 'items' in node ? node.items : null;
  }

  blockOf(node: TtNode): TtBlock {
    return (node as { block: TtBlock }).block;
  }

  // Desktop: scale the 40x25 screen to fit the viewport, using the extended
  // (wider) font for TV proportions, with whole-pixel cells where possible so
  // mosaic graphics join up without seams.
  // Phones (portrait, or a touch screen held sideways): re-wrap pages to as many columns as fit at a readable
  // cell size and let the page scroll, instead of shrinking 40 columns.
  private fit(): void {
    const availW = document.documentElement.clientWidth - GUTTER * 2;
    const availH = window.innerHeight - GUTTER * 2 - REMOTE_ALLOWANCE;
    const touchLandscape =
      window.matchMedia?.('(pointer: coarse)').matches && window.innerHeight < 600;
    const narrow = availW / availH < 1 || touchLandscape;
    let cols = COLS;
    let size: number;
    if (narrow) {
      cols = Math.max(20, Math.min(COLS, Math.floor(availW / MOBILE_CELL)));
      size = availW / (cols * 0.6);
    } else {
      const raw = Math.min(availW / 30, availH / ROWS);
      size = Math.floor(raw);
      if (size >= 16) size = Math.floor(size / 4) * 4;
    }
    this.narrow.set(narrow);
    this.cols.set(cols);
    this.nav.columns.set(cols);
    this.fontSize.set(Math.max(8, size));
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// Lay out up to three spans across a 40-column row: left-aligned at column 1,
// centred, and right-aligned to column 38.
function placeRow(
  left: TtSpan | null,
  middle: TtSpan | null,
  right: TtSpan | null,
  cols: number,
): TtRow {
  const spans: TtSpan[] = [{ text: MARGIN, decorative: true }];
  let col = 1;
  const moveTo = (target: number) => {
    if (target > col) spans.push({ text: ' '.repeat(target - col), decorative: true });
    col = Math.max(col, target);
  };
  if (left) {
    spans.push(left);
    col += left.text.length;
  }
  if (middle) {
    moveTo(Math.floor((cols - middle.text.length) / 2));
    spans.push(middle);
    col += middle.text.length;
  }
  if (right) {
    moveTo(cols - 1 - right.text.length);
    spans.push(right);
  }
  return { spans };
}
