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
