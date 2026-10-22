// The eight teletext (Level 1 / Mode 7) colours - nothing else is ever drawn.
export type TtColour = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';

export type TtTarget =
  | { page: number; sub?: number }
  | { href: string }
  | { action: 'cv' };

// A contents entry: "Projects ..................... 200". The whole entry is one link.
export interface TtEntry {
  label: string;
  target: TtTarget;
  // Shown after the dotted leader, usually the page number.
  right: string;
  // Short prefix before the label, e.g. '*' for featured projects.
  marker?: string;
  // Second line under the entry, e.g. the company under a job title.
  sub?: string;
}

// "Label    value" pair, rendered as a <dl> row.
export interface TtDetail {
  label: string;
  value: string;
  link?: TtTarget;
}

interface BlockBase {
  // Blank rows above the block. Dropped automatically at the top of a sub-page.
  gap?: number;
}

export type TtBlock = BlockBase &
  (
    | { kind: 'heading'; text: string }
    | {
        kind: 'text';
        text: string;
        colour?: TtColour;
        centre?: boolean;
        // Only show on the keyboard (desktop) or touch (phone) layout.
        only?: 'desktop' | 'touch';
      }
    | { kind: 'contents'; entries: TtEntry[] }
    | { kind: 'bullets'; items: string[] }
    | { kind: 'details'; rows: TtDetail[]; labelWidth?: number; labelColour?: TtColour }
    // Short words in aligned columns; `width` is the longest item in characters.
    | { kind: 'columns'; items: string[]; width: number }
    // Small stacked items (certificates): each line has its own colour.
    | { kind: 'cards'; cards: { text: string; colour?: TtColour }[][] }
  );

export interface TtPage {
  number: number;
  title: string;
  band: TtColour;
  titleColour: TtColour;
  // P100 replaces the title band with a masthead (mosaic logo, name, job title).
  masthead?: { name: string; title: string };
  blocks: TtBlock[];
  // The page body is an interactive component instead of blocks.
  form?: 'contact';
  parent?: number;
  next?: number;
}
