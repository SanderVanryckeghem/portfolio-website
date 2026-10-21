import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TtRow, TtSpan, TtTarget } from '../../../models/teletext.model';
import { TeletextNavService } from '../../../services/teletext-nav';
import { CVGeneratorService } from '../../../services/cv-generator';

/**
 * Renders pre-wrapped teletext rows inside whatever semantic element hosts it
 * (<h2 appTtRows>, <p appTtRows>, <li appTtRows>...). Optionally the whole
 * block is a single link, which inverts as one block cursor when focused.
 */
@Component({
  selector: '[appTtRows]',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Rows use white-space: pre, so this template avoids whitespace between spans.
  template: `
    @if (link(); as target) {
      <a
        class="tt-link"
        [attr.href]="href(target)"
        [attr.target]="isExternal(target) ? '_blank' : null"
        [attr.rel]="isExternal(target) ? 'noopener noreferrer' : null"
        [attr.role]="isAction(target) ? 'button' : null"
        (click)="activate($event, target)"
        (keydown.space)="isAction(target) && activate($event, target)"
      ><ng-container *ngTemplateOutlet="rowsTpl" />@if (isExternal(target)) {<span class="sr-only">(opens in a new tab)</span>}</a>
    } @else {
      <ng-container *ngTemplateOutlet="rowsTpl" />
    }

    <ng-template #rowsTpl>@for (r of rows(); track $index) {<span [class]="rowClass(r)">@for (s of r.spans; track $index) {@if (s.link; as target) {<a [class]="spanClass(s)" [attr.href]="href(target)" [attr.target]="isExternal(target) ? '_blank' : null" [attr.rel]="isExternal(target) ? 'noopener noreferrer' : null" (click)="activate($event, target)">{{ s.text }}</a>} @else {<span [class]="spanClass(s)" [attr.aria-hidden]="s.decorative || null">{{ s.text }}</span>}}</span>}</ng-template>
  `,
})
export class TtRowsComponent {
  private readonly nav = inject(TeletextNavService);
  private readonly cvGeneratorService = inject(CVGeneratorService);

  readonly rows = input.required<TtRow[]>();
  readonly link = input<TtTarget | undefined>(undefined);

  rowClass(row: TtRow): string {
    let cls = 'tt-row';
    if (row.double) cls += ' dbl';
    if (row.bg) cls += ' bg-' + row.bg;
    return cls;
  }

  spanClass(span: TtSpan): string {
    let cls = 'tt-s';
    // Leading/filler blanks stay black when a link inverts, so the block cursor hugs the text.
    if (span.decorative && !span.text.trim()) cls += ' tt-pad';
    if (span.fg) cls += ' fg-' + span.fg;
    if (span.bg) cls += ' bg-' + span.bg;
    if (span.double) cls += ' dbl-s';
    return cls;
  }

  href(target: TtTarget): string {
    if ('page' in target) return `#${target.page}${target.sub ? '/' + (target.sub + 1) : ''}`;
    if ('href' in target) return target.href;
    return '#';
  }

  isAction(target: TtTarget): boolean {
    return 'action' in target;
  }

  isExternal(target: TtTarget): boolean {
    return 'href' in target && /^https?:/.test(target.href);
  }

  activate(event: Event, target: TtTarget): void {
    if ('page' in target) {
      event.preventDefault();
      this.nav.goTo(target.page, target.sub ?? 0);
    } else if ('action' in target) {
      event.preventDefault();
      this.cvGeneratorService.generateCV();
    }
  }
}
