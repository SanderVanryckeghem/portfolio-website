// The eight teletext (Level 1 / Mode 7) colours - nothing else is ever drawn.
export type TtColour = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';

export type TtTarget =
  | { page: number; sub?: number }
  | { href: string }
  | { action: 'cv' };

// A run of characters sharing one foreground/background colour.
export interface TtSpan {
  text: string;
  fg?: TtColour;
  bg?: TtColour;
  link?: TtTarget;
  // Purely visual (dotted leaders, mosaic graphics, bullets) - hidden from screen readers.
  decorative?: boolean;
  // Span-level double height, for mixing double-height text with mosaics on one row.
  double?: boolean;
}

// One 40-column screen row. A double-height row occupies two rows.
export interface TtRow {
  spans: TtSpan[];
  bg?: TtColour;
  double?: boolean;
}

export type TtTag = 'h2' | 'p' | 'li' | 'div';

// A semantic chunk of a page (heading, paragraph, list item...) already wrapped to rows.
export interface TtBlock {
  tag: TtTag;
  rows: TtRow[];
  // Whole block is one link (e.g. an index entry with dotted leader).
  link?: TtTarget;
  // Don't leave this block as the last thing on a sub-page (headings).
  keepWithNext?: boolean;
  // Never split this block across sub-pages.
  keepTogether?: boolean;
  // Blank spacer rows - dropped when they'd start a new sub-page.
  spacer?: boolean;
}

// Consecutive list items get grouped into one <ul> when rendered.
export type TtNode = { block: TtBlock } | { items: TtBlock[] };

export interface TtPageSource {
  number: number;
  title: string;
  band: TtColour;
  titleFg: TtColour;
  // Replaces the standard double-height title band (used by the P100 masthead).
  masthead?: TtBlock;
  blocks: TtBlock[];
  // Page body is an interactive component instead of composed rows.
  form?: 'contact';
  parent?: number;
  next?: number;
  // Override for the row above the Fastext bar when there's no parent/next/sub-page to show.
  footer?: TtRow;
}

export interface TtPage extends Omit<TtPageSource, 'blocks'> {
  subPages: TtNode[][];
}
