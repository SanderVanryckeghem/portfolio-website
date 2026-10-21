import { Component, inject } from '@angular/core';
import { TeletextScreenComponent } from './components/layout/teletext-screen/teletext-screen';
import { ThemeService } from './services/theme';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TeletextScreenComponent],
  template: '<app-teletext-screen />',
})
export class AppComponent {
  // Injecting this triggers its one-time favicon setup.
  private readonly themeService = inject(ThemeService);
}
