import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DropZoneComponent } from '../../shared/components/drop-zone/drop-zone.component';
import { ProgressStateService } from '../../core/services/progress-state.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, DropZoneComponent],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class WelcomeComponent {
  private router = inject(Router);
  private progressState = inject(ProgressStateService);

  readonly hasSavedData = this.progressState.hasSavedData();

  async onFileSelected(file: File): Promise<void> {
    try {
      await this.progressState.loadFromFile(file);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Failed to load file', error);
    }
  }

  loadSavedData(): void {
    if (this.progressState.loadFromStorage()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onFileError(error: string): void {
    console.error(error);
  }
}
