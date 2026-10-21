import { TtBlock, TtColour, TtNode, TtRow, TtSpan, TtTarget } from '../models/teletext.model';

// Classic teletext page: 40 columns x 25 rows.
export const COLS = 40;
export const ROWS = 25;

// Column 0 is left blank (on a real set it holds the colour control code),
// so body text runs from column 1 and is at most 38 characters wide.
export const MARGIN = ' ';

// Pages are composed for the classic 40 columns on desktop, and re-wrapped to
// a narrower grid on phones so the text can be larger. The builders below
// read the active width; use withColumns() to compose for another width.
let activeCols = COLS;

export function gridCols(): number {
  return activeCols;
}

// Usable text width: everything except the margin column and the last column.
export function textWidth(): number {
  return activeCols - 2;
}

export function withColumns<T>(cols: number, build: () => T): T {
  const previous = activeCols;
  activeCols = cols;
  try {
    return build();
  } finally {
    activeCols = previous;
  }
}

// Rows available for page content: everything between the title band and the
// navigation row above the Fastext bar (rows 1 and 25 are the header and Fastext).
export function contentCapacity(titleRows: number): number {
  return ROWS - 3 - titleRows;
}

/**
 * Greedy word wrap on a fixed character grid. Non-final lines that broke at a
 * space keep one trailing space so screen readers don't run words together
 * (it renders as a blank cell and is clipped if it falls past column 40).
 * Over-long words (URLs) break after '-' or '/' where possible, else hard.
 */
export function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (let word of words) {
    while (word.length > width) {
      if (line) {
        lines.push(line + ' ');
        line = '';
      }
      const softBreak = Math.max(word.lastIndexOf('-', width - 1), word.lastIndexOf('/', width - 1));
      const cut = softBreak > 0 ? softBreak + 1 : width;
      lines.push(word.slice(0, cut));
      word = word.slice(cut);
    }
    if (!line) {
      line = word;
    } else if (line.length + 1 + word.length <= width) {
      line += ' ' + word;
    } else {
      lines.push(line + ' ');
      line = word;
    }
  }
  if (line || !lines.length) lines.push(line);
  return lines;
}

export function row(spans: TtSpan[], opts: Partial<Omit<TtRow, 'spans'>> = {}): TtRow {
  return { spans, ...opts };
}

export function blank(count = 1): TtBlock {
  return { tag: 'div', rows: Array.from({ length: count }, () => row([])), spacer: true };
}

interface TextOpts {
  fg?: TtColour;
  tag?: 'p' | 'li' | 'div';
  indent?: number;
  link?: TtTarget;
  keepTogether?: boolean;
  // Centre each wrapped line on the full screen width (ignores indent).
  centre?: boolean;
}

// A wrapped paragraph of body text.
export function text(content: string, opts: TextOpts = {}): TtBlock {
  const indent = opts.indent ?? 0;
  const pad = MARGIN + ' '.repeat(indent);
  return {
    tag: opts.tag ?? 'p',
    link: opts.link,
    keepTogether: opts.keepTogether,
    rows: wrap(content, textWidth() - indent).map((line) => {
      const lead = opts.centre
        ? ' '.repeat(Math.floor((activeCols - line.trimEnd().length) / 2))
        : pad;
      return row([{ text: lead, decorative: true }, { text: line, fg: opts.fg }]);
    }),
  };
}

// Single-height section heading. Visual case is upper (CSS), DOM text keeps its case.
export function heading(content: string, fg: TtColour = 'yellow'): TtBlock {
  return {
    tag: 'h2',
    keepWithNext: true,
    rows: wrap(content, textWidth()).map((line) => row([{ text: MARGIN + line, fg }])),
  };
}

// Bulleted list item with a hanging indent.
export function bullet(content: string, fg: TtColour = 'white', bulletFg: TtColour = 'cyan'): TtBlock {
  const lines = wrap(content, textWidth() - 2);
  return {
    tag: 'li',
    keepTogether: true,
    rows: lines.map((line, i) =>
      row([
        { text: MARGIN, decorative: true },
        i === 0 ? { text: '• ', fg: bulletFg, decorative: true } : { text: '  ' },
        { text: line, fg },
      ]),
    ),
  };
}

interface LeaderOpts {
  fg?: TtColour;
  rightFg?: TtColour;
  indent?: number;
  // Optional second line under the entry (e.g. company under a job title).
  sub?: string;
  subFg?: TtColour;
  marker?: TtSpan;
}

/**
 * Contents-page entry: "Projects ..................... 200". The whole entry is
 * one link; the dots are decorative so a screen reader hears "Projects 200".
 */
export function leader(label: string, target: TtTarget, right: string, opts: LeaderOpts = {}): TtBlock {
  const indent = opts.indent ?? 0;
  const markerWidth = opts.marker ? opts.marker.text.length : 0;
  const pad = MARGIN + ' '.repeat(indent);
  const labelWidth = textWidth() - indent - markerWidth - right.length - 3;
  const lines = wrap(label, labelWidth);

  const rows = lines.map((line, i) => {
    const spans: TtSpan[] = [{ text: pad, decorative: true }];
    if (opts.marker) spans.push(i === 0 ? opts.marker : { text: ' '.repeat(markerWidth) });
    spans.push({ text: line.trimEnd(), fg: opts.fg ?? 'white' });
    if (i === lines.length - 1) {
      const dots = textWidth() - indent - markerWidth - line.trimEnd().length - right.length - 2;
      spans.push({ text: ' ' + '.'.repeat(dots) + ' ', fg: opts.fg ?? 'white', decorative: true });
      spans.push({ text: right, fg: opts.rightFg ?? 'cyan' });
    } else {
      spans.push({ text: ' ' });
    }
    return row(spans);
  });

  if (opts.sub) {
    for (const line of wrap(opts.sub, textWidth() - indent - markerWidth - 2)) {
      rows.push(
        row([
          { text: pad + ' '.repeat(markerWidth + 2), decorative: true },
          { text: line, fg: opts.subFg ?? 'cyan' },
        ]),
      );
    }
  }

  return { tag: 'li', link: target, keepTogether: true, rows };
}

// "Label    value" pair; the value wraps under itself, never under the label.
export function keyValue(
  label: string,
  value: string,
  opts: { labelWidth?: number; labelFg?: TtColour; valueFg?: TtColour; link?: TtTarget } = {},
): TtBlock {
  const labelWidth = opts.labelWidth ?? 9;
  // Values may run into the last column (39) so an address like the 30-character
  // email fits on one row next to a 9-column label.
  const besideWidth = gridCols() - MARGIN.length - labelWidth;

  // On a narrow (phone) grid, put a value that won't fit beside its label on
  // the rows below it instead of chopping it into tiny pieces.
  if (gridCols() < COLS && value.length > besideWidth) {
    return {
      tag: 'p',
      link: opts.link,
      keepTogether: true,
      rows: [
        row([{ text: MARGIN, decorative: true }, { text: label + ' ', fg: opts.labelFg ?? 'cyan' }]),
        ...wrap(value, gridCols() - MARGIN.length).map((line) =>
          row([{ text: MARGIN, decorative: true }, { text: line, fg: opts.valueFg ?? 'white' }]),
        ),
      ],
    };
  }

  const lines = wrap(value, besideWidth);
  return {
    tag: 'p',
    link: opts.link,
    keepTogether: true,
    rows: lines.map((line, i) =>
      row([
        { text: MARGIN, decorative: true },
        i === 0
          ? { text: label.padEnd(labelWidth), fg: opts.labelFg ?? 'cyan' }
          : { text: ' '.repeat(labelWidth) },
        { text: line, fg: opts.valueFg ?? 'white' },
      ]),
    ),
  };
}

// Words laid out in fixed-width columns, e.g. a list of technologies. Uses as
// many columns (up to `perRow`) as fit with at least one space between them.
// Pass `longest` to align several column blocks on the same page.
export function columns(
  items: string[],
  perRow: number,
  fg: TtColour = 'white',
  longest = Math.max(...items.map((item) => item.length)),
): TtBlock {
  const width = longest + 1;
  while (perRow > 1 && (perRow - 1) * width + longest > textWidth()) perRow--;
  const rows: TtRow[] = [];
  for (let i = 0; i < items.length; i += perRow) {
    const cells = items.slice(i, i + perRow);
    rows.push(
      row([
        { text: MARGIN, decorative: true },
        ...cells.map((item, j) => ({
          text: j < cells.length - 1 ? item.padEnd(width) : item,
          fg,
        })),
      ]),
    );
  }
  return { tag: 'p', rows };
}

export function blockHeight(block: TtBlock): number {
  return block.rows.reduce((sum, r) => sum + (r.double ? 2 : 1), 0);
}

/**
 * Split a page's blocks into sub-pages of `capacity` rows. Text is never
 * shrunk - anything that doesn't fit flows onto the next sub-page (P301 1/3,
 * 2/3...). Paragraphs may split between rows; headings stay with what follows.
 */
export function paginate(blocks: TtBlock[], capacity: number): TtNode[][] {
  const pages: TtBlock[][] = [[]];
  let used = 0;

  // Continuation sub-pages open with the same blank row under the title band.
  const newPage = () => {
    pages.push([blank()]);
    used = 1;
  };

  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    if (block.spacer && used <= 1 && pages.length > 1) continue;

    let height = blockHeight(block);
    const remaining = capacity - used;

    if (block.keepWithNext && used > 1) {
      const next = blocks[i + 1];
      const nextNeeds = next ? (next.keepTogether ? blockHeight(next) : 1) : 0;
      if (height + nextNeeds > remaining) newPage();
    } else if (height > remaining && used > 1) {
      const splittable = !block.keepTogether && !block.link && block.rows.length > 1 && remaining >= 2;
      if (splittable) {
        pages[pages.length - 1].push({ ...block, rows: block.rows.slice(0, remaining) });
        block = { ...block, rows: block.rows.slice(remaining) };
        height = blockHeight(block);
      }
      newPage();
    }

    // A single block taller than a whole page (a very long paragraph) spills over.
    while (height > capacity - used) {
      const fit = capacity - used;
      pages[pages.length - 1].push({ ...block, rows: block.rows.slice(0, fit) });
      block = { ...block, rows: block.rows.slice(fit) };
      height = blockHeight(block);
      newPage();
    }

    pages[pages.length - 1].push(block);
    used += height;
  }

  // Trailing spacers would only create empty sub-pages.
  const trimmed = pages.filter((p, i) => i === 0 || p.some((b) => !b.spacer));
  return trimmed.map(groupLists);
}

function groupLists(blocks: TtBlock[]): TtNode[] {
  const nodes: TtNode[] = [];
  for (const block of blocks) {
    const last = nodes[nodes.length - 1];
    if (block.tag === 'li') {
      if (last && 'items' in last) last.items.push(block);
      else nodes.push({ items: [block] });
    } else {
      nodes.push({ block });
    }
  }
  return nodes;
}

// ---------------------------------------------------------------------------
// Mosaic (sixel) graphics: each character cell is a 2x3 block of "pixels",
// drawn with the Unicode block-sextant characters that Bedstead renders as
// true contiguous teletext graphics.

export function sextant(bits: number): string {
  if (bits === 0) return ' ';
  if (bits === 63) return '█';
  if (bits === 21) return '▌';
  if (bits === 42) return '▐';
  return String.fromCodePoint(0x1fb00 + bits - 1 - (bits > 21 ? 1 : 0) - (bits > 42 ? 1 : 0));
}

// Convert a pixel bitmap ('#' = lit) into rows of sextant characters.
export function bitmapToMosaic(bitmap: string[]): string[] {
  const height = Math.ceil(bitmap.length / 3) * 3;
  const width = Math.ceil(Math.max(...bitmap.map((l) => l.length)) / 2) * 2;
  const lit = (x: number, y: number) => (bitmap[y]?.[x] ?? '.') === '#';
  const out: string[] = [];
  for (let y = 0; y < height; y += 3) {
    let line = '';
    for (let x = 0; x < width; x += 2) {
      let bits = 0;
      for (let dy = 0; dy < 3; dy++) {
        if (lit(x, y + dy)) bits |= 1 << (dy * 2);
        if (lit(x + 1, y + dy)) bits |= 1 << (dy * 2 + 1);
      }
      line += sextant(bits);
    }
    out.push(line);
  }
  return out;
}

// 5x7 block letters (plus a blank row above and below, so 9 pixels = 3 rows).
const LETTERS: Record<string, string[]> = {
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
};

export function mosaicWord(word: string): string[] {
  const glyphs = word.split('').map((c) => LETTERS[c] ?? LETTERS['S']);
  const bitmap = ['.'.repeat(glyphs.length * 6)];
  for (let y = 0; y < 7; y++) bitmap.push(glyphs.map((g) => g[y] + '.').join(''));
  bitmap.push('.'.repeat(glyphs.length * 6));
  return bitmapToMosaic(bitmap);
}
