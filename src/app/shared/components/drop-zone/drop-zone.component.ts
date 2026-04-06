import {
  Component,
  ElementRef,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-drop-zone',
  standalone: true,
  templateUrl: './drop-zone.component.html',
  styleUrl: './drop-zone.component.css',
})
export class DropZoneComponent {
  /** Emits the selected File when a valid JSON file is dropped or selected */
  readonly fileSelected = output<File>();

  /** Emits an error message for invalid files */
  readonly fileError = output<string>();

  /** Whether a file is currently being dragged over the zone */
  protected readonly isDragOver = signal(false);

  /** Whether a file has been accepted (brief success flash) */
  protected readonly isAccepted = signal(false);

  /** Error message to display */
  protected readonly errorMessage = signal<string | null>(null);

  /** The file name of the last accepted file */
  protected readonly acceptedFileName = signal<string | null>(null);

  /** Reference to the hidden file input */
  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  // ─── Event Handlers ─────────────────────────────────────────────

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
    this.errorMessage.set(null);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
      // Reset input so the same file can be re-selected
      input.value = '';
    }
  }

  openFileBrowser(): void {
    this.fileInput()?.nativeElement.click();
  }

  // ─── Private ────────────────────────────────────────────────────

  private processFile(file: File): void {
    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.json')) {
      const msg = `"${file.name}" is not a JSON file. Please select your advancements .json file.`;
      this.errorMessage.set(msg);
      this.fileError.emit(msg);
      return;
    }

    // Validate file size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      const msg = 'File is too large. Maximum size is 10 MB.';
      this.errorMessage.set(msg);
      this.fileError.emit(msg);
      return;
    }

    // Success
    this.errorMessage.set(null);
    this.acceptedFileName.set(file.name);
    this.isAccepted.set(true);
    this.fileSelected.emit(file);

    // Reset the accepted state after animation
    setTimeout(() => this.isAccepted.set(false), 2000);
  }
}
