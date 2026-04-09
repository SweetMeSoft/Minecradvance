import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { LanguageService } from './core/services/language.service';
import { ProgressStateService } from './core/services/progress-state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly langService = inject(LanguageService);
  protected readonly progressState = inject(ProgressStateService);
}
