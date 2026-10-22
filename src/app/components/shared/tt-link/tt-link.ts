import { Directive, computed, inject, input } from '@angular/core';
import { TtTarget } from '../../../models/teletext.model';
import { TeletextNavService } from '../../../services/teletext-nav';
import { CVGeneratorService } from '../../../services/cv-generator';

/**
 * Turns an <a> into a teletext link: another page (#201, #301/2), an
 * external URL (new tab) or the CV download.
 */
@Directive({
  selector: 'a[appTtLink]',
  standalone: true,
  host: {
    '[attr.href]': 'href()',
    '[attr.target]': 'external() ? "_blank" : null',
    '[attr.rel]': 'external() ? "noopener noreferrer" : null',
    '[attr.role]': 'isAction() ? "button" : null',
    '(click)': 'activate($event)',
    '(keydown.space)': 'isAction() && activate($event)',
  },
})
export class TtLinkDirective {
  private readonly nav = inject(TeletextNavService);
  private readonly cvGeneratorService = inject(CVGeneratorService);

  readonly target = input.required<TtTarget>({ alias: 'appTtLink' });

  readonly href = computed(() => {
    const target = this.target();
    if ('page' in target) return `#${target.page}${target.sub ? '/' + (target.sub + 1) : ''}`;
    if ('href' in target) return target.href;
    return '#';
  });

  readonly external = computed(() => isExternal(this.target()));
  readonly isAction = computed(() => 'action' in this.target());

  activate(event: Event): void {
    const target = this.target();
    if ('page' in target) {
      event.preventDefault();
      this.nav.goTo(target.page, target.sub ?? 0);
    } else if ('action' in target) {
      event.preventDefault();
      this.cvGeneratorService.generateCV();
    }
  }
}

export function isExternal(target: TtTarget | undefined): boolean {
  return !!target && 'href' in target && /^https?:/.test(target.href);
}
