import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressStateService } from '../../core/services/progress-state.service';

@Component({
  selector: 'app-seed-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seed-manager.component.html',
  styleUrl: './seed-manager.component.css',
})
export class SeedManagerComponent {
  private readonly stateService = inject(ProgressStateService);

  /** Current seed from central state */
  protected readonly currentSeed = this.stateService.userSeed;

  /** Local input state before saving */
  protected inputSeed = signal(this.currentSeed() || '');

  /** Has the seed been successfully saved just now? */
  protected showSuccess = signal(false);

  /** Any validation errors */
  protected validationError = signal<string | null>(null);

  /** The chunkbase URL computed from the state */
  protected readonly chunkbaseUrl = this.stateService.getChunkbaseUrl;

  /** Check if the input differs from the current saved seed */
  protected readonly hasUnsavedChanges = computed(() => {
    return this.inputSeed().trim() !== (this.currentSeed() || '');
  });

  onInputChange(value: string): void {
    this.inputSeed.set(value);
    this.validationError.set(null);
    this.showSuccess.set(false);
  }

  saveSeed(): void {
    const rawValue = this.inputSeed().trim();
    
    // Quick validation
    if (rawValue.length > 50) {
      this.validationError.set('Seed is too long (max 50 characters).');
      return;
    }

    if (!rawValue) {
      // Clear the seed
      this.stateService.updateSeed('');
      this.showSuccess.set(true);
      setTimeout(() => this.showSuccess.set(false), 2500);
      return;
    }

    // Typical seeds are numbers (e.g. -123456789) or alphanumeric text.
    // If it contains only numbers and optionally a minus sign at the start, it's valid.
    // Text seeds are also valid as Minecraft converts them conceptually.
    
    this.validationError.set(null);
    this.stateService.updateSeed(rawValue);
    this.showSuccess.set(true);
    
    setTimeout(() => this.showSuccess.set(false), 2500);
  }

  clearSeed(): void {
    this.inputSeed.set('');
    this.saveSeed();
  }
}
