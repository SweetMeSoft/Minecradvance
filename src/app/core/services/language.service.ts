import { Injectable, signal, inject, effect } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

const STORAGE_KEY = 'minecradvance_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);

  readonly activeLang = signal<'en' | 'es'>(this.getSavedLang());

  constructor() {
    // Apply the saved lang on boot
    this.transloco.setActiveLang(this.activeLang());

    // Persist whenever lang changes
    effect(() => {
      const lang = this.activeLang();
      localStorage.setItem(STORAGE_KEY, lang);
      this.transloco.setActiveLang(lang);
    });
  }

  toggle(): void {
    this.activeLang.set(this.activeLang() === 'en' ? 'es' : 'en');
  }

  private getSavedLang(): 'en' | 'es' {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'es' ? 'es' : 'en';
  }
}
