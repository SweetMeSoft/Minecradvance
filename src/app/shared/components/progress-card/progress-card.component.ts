import { Component, input, computed } from '@angular/core';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-progress-card',
  standalone: true,
  imports: [ProgressBarComponent],
  templateUrl: './progress-card.component.html',
  styleUrl: './progress-card.component.css',
})
export class ProgressCardComponent {
  /** Card title (e.g., category name) */
  readonly title = input.required<string>();

  /** Subtitle or description */
  readonly subtitle = input<string>('');

  /** Icon path (relative to assets) */
  readonly icon = input<string>('');

  /** Number of completed items */
  readonly completed = input<number>(0);

  /** Total number of items */
  readonly total = input<number>(0);

  /** Completion percentage (auto-computed if not provided) */
  readonly percentage = input<number | null>(null);

  /** Color variant */
  readonly variant = input<'emerald' | 'diamond' | 'gold' | 'redstone'>('emerald');

  /** Whether the card is in a "completed" state (100%) */
  readonly isComplete = input<boolean>(false);

  /** Computed percentage (uses input or auto-calculates) */
  protected readonly computedPercentage = computed(() => {
    const p = this.percentage();
    if (p !== null) return p;
    const t = this.total();
    return t > 0 ? Math.round((this.completed() / t) * 100) : 0;
  });

  /** Whether the card represents a fully completed category */
  protected readonly isFullyComplete = computed(
    () => this.isComplete() || this.computedPercentage() === 100
  );
}
