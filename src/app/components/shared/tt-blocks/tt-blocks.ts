import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TtBlock } from '../../../models/teletext.model';
import { TtLinkDirective, isExternal } from '../tt-link/tt-link';

/**
 * Renders a page's content blocks as plain semantic HTML: headings,
 * paragraphs, contents lists with dotted leaders, definition lists...
 */
@Component({
  selector: 'app-tt-blocks',
  standalone: true,
  imports: [TtLinkDirective],
  templateUrl: './tt-blocks.html',
  styleUrls: ['./tt-blocks.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TtBlocksComponent {
  readonly blocks = input.required<TtBlock[]>();

  // Long enough to fill any leader; the overflow is clipped.
  readonly dots = '.'.repeat(40);
  readonly isExternal = isExternal;

  // Lets a long URL wrap after each '/' instead of running off the screen.
  breakAfterSlashes(value: string): string[] {
    return value.split(/(?<=\/)/);
  }
}
